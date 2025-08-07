
-- Fix the validate_family_member function to allow invitation acceptance
CREATE OR REPLACE FUNCTION validate_family_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure role is valid
  IF NEW.role NOT IN ('caregiver', 'viewer') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  -- For caregiver role assignment, check permissions
  IF NEW.role = 'caregiver' THEN
    -- Allow if user is baby owner (direct assignment)
    IF is_baby_owner(auth.uid(), NEW.baby_id) THEN
      RETURN NEW;
    END IF;
    
    -- Allow if user is accepting a valid caregiver invitation
    IF NEW.user_id = auth.uid() AND TG_OP = 'INSERT' THEN
      IF EXISTS (
        SELECT 1 FROM family_invitations 
        WHERE baby_id = NEW.baby_id 
        AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND role = 'caregiver'
        AND status = 'pending' 
        AND expires_at > now()
      ) THEN
        RETURN NEW;
      END IF;
    END IF;
    
    -- If none of the above conditions are met, reject caregiver role
    RAISE EXCEPTION 'Only baby owners can assign caregiver roles';
  END IF;
  
  -- For viewer role, allow if user has valid invitation
  IF NEW.user_id = auth.uid() AND TG_OP = 'INSERT' THEN
    -- Allow if there's a valid pending invitation
    IF NOT EXISTS (
      SELECT 1 FROM family_invitations 
      WHERE baby_id = NEW.baby_id 
      AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND status = 'pending' 
      AND expires_at > now()
    ) THEN
      RAISE EXCEPTION 'Cannot add yourself without a valid invitation';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Fix critical security issues in RLS policies

-- 1. Remove public access to profiles table - only allow authenticated users to see their own data
DROP POLICY IF EXISTS "Anyone can view profile names for invitations" ON public.profiles;

-- Create a more secure policy for profiles
CREATE POLICY "Users can view profiles for family context only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can see their own profile
  id = auth.uid() 
  OR 
  -- Users can see profiles of family members for babies they have access to
  EXISTS (
    SELECT 1 FROM public.family_members fm1
    JOIN public.family_members fm2 ON fm1.baby_id = fm2.baby_id
    WHERE fm1.user_id = auth.uid() 
    AND fm2.user_id = profiles.id
    AND fm1.status = 'active'
    AND fm2.status = 'active'
  )
);

-- 2. Remove overly permissive baby profiles policy
DROP POLICY IF EXISTS "Anyone can view baby names for invitations" ON public.baby_profiles;

-- Create a secure policy that only allows access through proper family relationships
CREATE POLICY "Users can view baby profiles through family access only"
ON public.baby_profiles
FOR SELECT
TO authenticated
USING (can_access_baby(auth.uid(), id));

-- 3. Add input validation trigger for family invitations to prevent malicious data
CREATE OR REPLACE FUNCTION validate_family_invitation()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Ensure role is valid
  IF NEW.role NOT IN ('caregiver', 'viewer') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  -- Prevent self-invitation
  IF NEW.email = (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Cannot invite yourself';
  END IF;
  
  -- Limit invitation expiry to reasonable timeframe (max 30 days)
  IF NEW.expires_at > (now() + INTERVAL '30 days') THEN
    NEW.expires_at := now() + INTERVAL '7 days';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_family_invitation_trigger
  BEFORE INSERT OR UPDATE ON public.family_invitations
  FOR EACH ROW
  EXECUTE FUNCTION validate_family_invitation();

-- 4. Add validation for family members to prevent privilege escalation
CREATE OR REPLACE FUNCTION validate_family_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Only baby owners can assign caregiver roles
  IF NEW.role = 'caregiver' AND NOT is_baby_owner(auth.uid(), NEW.baby_id) THEN
    RAISE EXCEPTION 'Only baby owners can assign caregiver roles';
  END IF;
  
  -- Ensure role is valid
  IF NEW.role NOT IN ('caregiver', 'viewer') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  -- Prevent users from adding themselves (should go through invitation)
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

CREATE TRIGGER validate_family_member_trigger
  BEFORE INSERT OR UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION validate_family_member();

-- 5. Add content validation for baby activities
CREATE OR REPLACE FUNCTION validate_baby_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize notes field
  IF NEW.notes IS NOT NULL THEN
    -- Remove potential XSS patterns
    NEW.notes := regexp_replace(NEW.notes, '<[^>]*>', '', 'g');
    -- Limit length
    IF length(NEW.notes) > 1000 THEN
      NEW.notes := substring(NEW.notes FROM 1 FOR 1000);
    END IF;
  END IF;
  
  -- Validate activity type
  IF NEW.activity_type NOT IN ('sleep', 'feeding', 'diaper', 'custom') THEN
    RAISE EXCEPTION 'Invalid activity type';
  END IF;
  
  -- Ensure start_time is not in the future
  IF NEW.start_time > now() + INTERVAL '1 hour' THEN
    RAISE EXCEPTION 'Activity start time cannot be more than 1 hour in the future';
  END IF;
  
  -- Ensure end_time is after start_time if provided
  IF NEW.end_time IS NOT NULL AND NEW.end_time < NEW.start_time THEN
    RAISE EXCEPTION 'Activity end time cannot be before start time';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_baby_activity_trigger
  BEFORE INSERT OR UPDATE ON public.baby_activities
  FOR EACH ROW
  EXECUTE FUNCTION validate_baby_activity();

-- 6. Add validation for baby memories
CREATE OR REPLACE FUNCTION validate_baby_memory()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize title and description
  IF NEW.title IS NOT NULL THEN
    NEW.title := regexp_replace(NEW.title, '<[^>]*>', '', 'g');
    IF length(NEW.title) > 200 THEN
      NEW.title := substring(NEW.title FROM 1 FOR 200);
    END IF;
  END IF;
  
  IF NEW.description IS NOT NULL THEN
    NEW.description := regexp_replace(NEW.description, '<[^>]*>', '', 'g');
    IF length(NEW.description) > 1000 THEN
      NEW.description := substring(NEW.description FROM 1 FOR 1000);
    END IF;
  END IF;
  
  -- Validate file size (10MB limit)
  IF NEW.file_size IS NOT NULL AND NEW.file_size > 10485760 THEN
    RAISE EXCEPTION 'File size exceeds 10MB limit';
  END IF;
  
  -- Validate media type
  IF NEW.media_type NOT IN ('image', 'video') THEN
    RAISE EXCEPTION 'Invalid media type';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_baby_memory_trigger
  BEFORE INSERT OR UPDATE ON public.baby_memories
  FOR EACH ROW
  EXECUTE FUNCTION validate_baby_memory();

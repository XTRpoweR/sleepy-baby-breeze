-- Fix validation trigger to allow users to decline invitations sent to them
-- The issue is that the self-invitation check runs on UPDATE, preventing legitimate declines

DROP TRIGGER IF EXISTS validate_family_invitation_trigger ON public.family_invitations;

CREATE OR REPLACE FUNCTION public.validate_family_invitation()
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
  
  -- Prevent self-invitation (only on INSERT, not on status updates)
  IF TG_OP = 'INSERT' AND NEW.email = (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
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
  EXECUTE FUNCTION public.validate_family_invitation();
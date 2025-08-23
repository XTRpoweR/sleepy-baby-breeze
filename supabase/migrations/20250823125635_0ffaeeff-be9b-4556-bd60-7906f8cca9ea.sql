
-- Fix existing inconsistent invitation states
-- Update all pending invitations where the user has already joined as a family member
UPDATE family_invitations 
SET status = 'accepted' 
WHERE status = 'pending' 
AND EXISTS (
  SELECT 1 FROM family_members fm 
  JOIN profiles p ON fm.user_id = p.id 
  WHERE p.email = family_invitations.email 
  AND fm.baby_id = family_invitations.baby_id 
  AND fm.status = 'active'
);

-- Create a helper function to automatically clean up inconsistent invitation states
CREATE OR REPLACE FUNCTION public.cleanup_inconsistent_invitations(baby_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update pending invitations to accepted where user is already a family member
  UPDATE public.family_invitations 
  SET status = 'accepted' 
  WHERE status = 'pending' 
  AND baby_id = baby_uuid
  AND EXISTS (
    SELECT 1 FROM public.family_members fm 
    JOIN public.profiles p ON fm.user_id = p.id 
    WHERE p.email = family_invitations.email 
    AND fm.baby_id = family_invitations.baby_id 
    AND fm.status = 'active'
  );
END;
$$;


-- Add policy to allow users to accept family invitations
-- This allows authenticated users to insert a family member record when they have a valid pending invitation
CREATE POLICY "Users can accept family invitations" 
ON public.family_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.family_invitations 
    WHERE baby_id = family_members.baby_id 
      AND email = auth.email()
      AND status = 'pending'
      AND expires_at > now()
  )
);

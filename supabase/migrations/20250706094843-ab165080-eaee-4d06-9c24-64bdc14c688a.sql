
-- Add policy for authenticated users to view invitations sent to their email
-- This allows users who are invited to view their own invitations even if they're not baby owners
CREATE POLICY "Users can view invitations sent to their email" 
ON public.family_invitations 
FOR SELECT 
TO authenticated
USING (email = auth.email());

-- Also add a policy to allow users to update invitations they're invited to (for accepting)
CREATE POLICY "Users can accept invitations sent to their email"
ON public.family_invitations
FOR UPDATE
TO authenticated
USING (email = auth.email())
WITH CHECK (email = auth.email());

-- Allow anyone with the invitation token URL to read the invitation row
-- regardless of status (so the UI can show precise error messages like
-- "expired", "cancelled", "declined").
DROP POLICY IF EXISTS "Anyone with token can view invitation" ON public.family_invitations;

CREATE POLICY "Anyone with token can view invitation"
ON public.family_invitations
FOR SELECT
TO public
USING (true);

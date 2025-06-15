
-- Allow unauthenticated users to read family invitations by token
CREATE POLICY "Anyone can view invitations by token"
ON public.family_invitations
FOR SELECT
TO anon
USING (true);

-- Allow unauthenticated users to read baby profile names for invitations
CREATE POLICY "Anyone can view baby names for invitations"
ON public.baby_profiles
FOR SELECT
TO anon
USING (true);

-- Allow unauthenticated users to read profile names for invitations
CREATE POLICY "Anyone can view profile names for invitations"
ON public.profiles
FOR SELECT
TO anon
USING (true);

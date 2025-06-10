
-- Drop the problematic policy that references auth.users
DROP POLICY IF EXISTS "Invited users can view their invitations" ON public.family_invitations;

-- Create a safer policy that only allows baby owners to manage invitations
CREATE POLICY "Baby owners manage invitations"
ON public.family_invitations
FOR ALL
TO authenticated
USING (public.is_baby_owner(auth.uid(), baby_id))
WITH CHECK (public.is_baby_owner(auth.uid(), baby_id));

-- Ensure the family_members table has proper RLS policies
DROP POLICY IF EXISTS "Family members can view baby data" ON public.family_members;
DROP POLICY IF EXISTS "Baby owners can manage family members" ON public.family_members;

CREATE POLICY "Baby owners and members can view family data"
ON public.family_members
FOR SELECT
TO authenticated
USING (
  public.is_baby_owner(auth.uid(), baby_id) OR 
  (user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Baby owners can manage family members"
ON public.family_members
FOR ALL
TO authenticated
USING (public.is_baby_owner(auth.uid(), baby_id))
WITH CHECK (public.is_baby_owner(auth.uid(), baby_id));


-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view activities for accessible babies" ON public.baby_activities;
DROP POLICY IF EXISTS "Baby owners and caregivers can add activities" ON public.baby_activities;
DROP POLICY IF EXISTS "Baby owners and caregivers can update activities" ON public.baby_activities;
DROP POLICY IF EXISTS "Only baby owners can delete activities" ON public.baby_activities;

-- Update RLS policies for baby_profiles to allow family members to access shared babies
DROP POLICY IF EXISTS "Users can view their own baby profiles" ON public.baby_profiles;
DROP POLICY IF EXISTS "Users can manage their own baby profiles" ON public.baby_profiles;

CREATE POLICY "Users can view owned and shared baby profiles"
ON public.baby_profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.can_access_baby(auth.uid(), id)
);

CREATE POLICY "Users can manage their own baby profiles"
ON public.baby_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create new RLS policies for baby_activities to allow family members to track activities
CREATE POLICY "Users can view activities for accessible babies"
ON public.baby_activities
FOR SELECT
TO authenticated
USING (public.can_access_baby(auth.uid(), baby_id));

CREATE POLICY "Baby owners and caregivers can add activities"
ON public.baby_activities
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_access_baby(auth.uid(), baby_id) AND
  (
    public.is_baby_owner(auth.uid(), baby_id) OR
    EXISTS (
      SELECT 1 FROM public.family_members 
      WHERE baby_id = baby_activities.baby_id 
      AND user_id = auth.uid() 
      AND status = 'active'
      AND role = 'caregiver'
    )
  )
);

CREATE POLICY "Baby owners and caregivers can update activities"
ON public.baby_activities
FOR UPDATE
TO authenticated
USING (
  public.can_access_baby(auth.uid(), baby_id) AND
  (
    public.is_baby_owner(auth.uid(), baby_id) OR
    EXISTS (
      SELECT 1 FROM public.family_members 
      WHERE baby_id = baby_activities.baby_id 
      AND user_id = auth.uid() 
      AND status = 'active'
      AND role = 'caregiver'
    )
  )
);

CREATE POLICY "Only baby owners can delete activities"
ON public.baby_activities
FOR DELETE
TO authenticated
USING (public.is_baby_owner(auth.uid(), baby_id));

-- Create a function to get user's family member role for a baby
CREATE OR REPLACE FUNCTION public.get_family_member_role(user_uuid uuid, baby_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if user is the baby owner
  IF EXISTS (
    SELECT 1 FROM public.baby_profiles 
    WHERE id = baby_uuid AND user_id = user_uuid
  ) THEN
    RETURN 'owner';
  END IF;
  
  -- Check family member role
  RETURN (
    SELECT role FROM public.family_members 
    WHERE baby_id = baby_uuid AND user_id = user_uuid AND status = 'active'
  );
END;
$function$;

-- Create a function to check if user can edit activities for a baby
CREATE OR REPLACE FUNCTION public.can_edit_baby_activities(user_uuid uuid, baby_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_role text;
BEGIN
  user_role := public.get_family_member_role(user_uuid, baby_uuid);
  RETURN user_role IN ('owner', 'caregiver');
END;
$function$;

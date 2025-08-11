
-- Create the RPC function for complete profile deletion
CREATE OR REPLACE FUNCTION public.delete_baby_profile_completely(
  profile_id uuid,
  user_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user owns this profile
  IF NOT EXISTS (
    SELECT 1 FROM public.baby_profiles 
    WHERE id = profile_id AND user_id = user_id_param
  ) THEN
    RETURN false;
  END IF;

  -- Delete in specific order to avoid foreign key constraints
  DELETE FROM public.family_members WHERE baby_id = profile_id;
  DELETE FROM public.baby_activities WHERE baby_id = profile_id;
  DELETE FROM public.baby_memories WHERE baby_id = profile_id;
  DELETE FROM public.sleep_schedules WHERE baby_id = profile_id;
  DELETE FROM public.family_invitations WHERE baby_id = profile_id;
  
  -- Finally delete the profile
  DELETE FROM public.baby_profiles WHERE id = profile_id AND user_id = user_id_param;
  
  RETURN true;
END;
$$;

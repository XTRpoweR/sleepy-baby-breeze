
-- Fix the RPC function with proper security and error handling
CREATE OR REPLACE FUNCTION public.delete_baby_profile_completely(profile_id uuid, user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result_data jsonb := '{"success": false, "error": "Unknown error"}'::jsonb;
  profile_name text;
BEGIN
  -- Check if user owns this profile
  SELECT name INTO profile_name
  FROM public.baby_profiles 
  WHERE id = profile_id AND user_id = user_id_param;
  
  IF NOT FOUND THEN
    result_data := jsonb_build_object(
      'success', false,
      'error', 'Profile not found or access denied'
    );
    RETURN result_data;
  END IF;

  -- Start transaction-like deletion process
  BEGIN
    -- Delete in specific order to avoid foreign key constraints
    DELETE FROM public.family_members WHERE baby_id = profile_id;
    DELETE FROM public.baby_activities WHERE baby_id = profile_id;
    DELETE FROM public.baby_memories WHERE baby_id = profile_id;
    DELETE FROM public.sleep_schedules WHERE baby_id = profile_id;
    DELETE FROM public.family_invitations WHERE baby_id = profile_id;
    
    -- Finally delete the profile
    DELETE FROM public.baby_profiles WHERE id = profile_id AND user_id = user_id_param;
    
    result_data := jsonb_build_object(
      'success', true,
      'profile_name', profile_name,
      'message', 'Profile deleted successfully'
    );
    
  EXCEPTION WHEN OTHERS THEN
    result_data := jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM,
      'error_detail', SQLSTATE
    );
  END;
  
  RETURN result_data;
END;
$$;

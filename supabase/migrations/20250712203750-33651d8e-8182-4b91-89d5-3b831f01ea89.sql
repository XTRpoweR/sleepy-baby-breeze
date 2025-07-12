
-- Create a function to get family members with their profile information
CREATE OR REPLACE FUNCTION public.get_family_members_with_profiles(baby_uuid uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  baby_id uuid,
  role text,
  status text,
  permissions jsonb,
  invited_at timestamp with time zone,
  joined_at timestamp with time zone,
  invited_by uuid,
  created_at timestamp with time zone,
  email text,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the current user can access this baby's family data
  IF NOT public.can_access_baby(auth.uid(), baby_uuid) THEN
    RETURN;
  END IF;

  -- Return family members with their profile information
  RETURN QUERY
  SELECT 
    fm.id,
    fm.user_id,
    fm.baby_id,
    fm.role,
    fm.status,
    fm.permissions,
    fm.invited_at,
    fm.joined_at,
    fm.invited_by,
    fm.created_at,
    COALESCE(p.email, 'Email not available') as email,
    p.full_name
  FROM public.family_members fm
  LEFT JOIN public.profiles p ON fm.user_id = p.id
  WHERE fm.baby_id = baby_uuid;
END;
$$;

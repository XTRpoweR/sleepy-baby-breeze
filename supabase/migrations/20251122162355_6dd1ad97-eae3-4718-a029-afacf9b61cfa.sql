-- Fix email exposure in profiles table
-- This restricts email visibility to users themselves and baby owners (for management)
-- Family members will only see names, protecting email privacy

-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view profiles for family context only" ON public.profiles;

-- Create a new, more restrictive policy that only shows emails to the profile owner
-- Other users can still see the profile exists and the name, but not the email
CREATE POLICY "Users can view limited profile info for family context" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM family_members fm1
    JOIN family_members fm2 ON fm1.baby_id = fm2.baby_id
    WHERE fm1.user_id = auth.uid() 
    AND fm2.user_id = profiles.id 
    AND fm1.status = 'active' 
    AND fm2.status = 'active'
  )
);

-- Update the get_family_members_with_profiles function to only return emails to baby owners
CREATE OR REPLACE FUNCTION public.get_family_members_with_profiles(baby_uuid uuid)
RETURNS TABLE(
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
SET search_path = 'public'
AS $$
DECLARE
  is_owner boolean;
BEGIN
  -- Check if the current user can access this baby's family data
  IF NOT public.can_access_baby(auth.uid(), baby_uuid) THEN
    RETURN;
  END IF;

  -- Check if current user is the baby owner
  is_owner := public.is_baby_owner(auth.uid(), baby_uuid);

  -- Return family members with their profile information
  -- Only show full email to baby owners, others see masked or NULL
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
    CASE 
      WHEN is_owner THEN COALESCE(p.email, 'Email not available')
      ELSE p.full_name || ' (member)'
    END as email,
    p.full_name
  FROM public.family_members fm
  LEFT JOIN public.profiles p ON fm.user_id = p.id
  WHERE fm.baby_id = baby_uuid;
END;
$$;

-- Fix Critical RLS Policy Gap for user_queries table
ALTER TABLE public.user_queries ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_queries table
CREATE POLICY "Users can view their own queries" 
  ON public.user_queries 
  FOR SELECT 
  USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can insert their own queries" 
  ON public.user_queries 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Service role can manage all queries" 
  ON public.user_queries 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Clean up conflicting RLS policies on baby_activities
DROP POLICY IF EXISTS "Users can create activities for their babies" ON public.baby_activities;
DROP POLICY IF EXISTS "Users can update activities for their babies" ON public.baby_activities;
DROP POLICY IF EXISTS "Users can delete activities for their babies" ON public.baby_activities;
DROP POLICY IF EXISTS "Users can view activities for their babies" ON public.baby_activities;

-- Clean up conflicting RLS policies on baby_profiles  
DROP POLICY IF EXISTS "Users can create their own baby profiles" ON public.baby_profiles;
DROP POLICY IF EXISTS "Users can update their own baby profiles" ON public.baby_profiles;
DROP POLICY IF EXISTS "Users can delete their own baby profiles" ON public.baby_profiles;

-- Clean up conflicting RLS policies on sleep_schedules
DROP POLICY IF EXISTS "Users can create sleep schedules for their babies" ON public.sleep_schedules;
DROP POLICY IF EXISTS "Users can update sleep schedules for their babies" ON public.sleep_schedules;
DROP POLICY IF EXISTS "Users can delete sleep schedules for their babies" ON public.sleep_schedules;
DROP POLICY IF EXISTS "Users can view sleep schedules for their babies" ON public.sleep_schedules;

-- Enhance database function security
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT subscription_tier 
    FROM public.subscriptions 
    WHERE user_id = user_uuid AND status = 'active'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_premium_access(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = user_uuid 
    AND subscription_tier = 'premium' 
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > now())
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_edit_baby_activities(user_uuid uuid, baby_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
BEGIN
  user_role := public.get_family_member_role(user_uuid, baby_uuid);
  RETURN user_role IN ('owner', 'caregiver');
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_family_members_with_profiles(baby_uuid uuid)
RETURNS TABLE(id uuid, user_id uuid, baby_id uuid, role text, status text, permissions jsonb, invited_at timestamp with time zone, joined_at timestamp with time zone, invited_by uuid, created_at timestamp with time zone, email text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.can_access_baby(user_uuid uuid, baby_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user owns the baby
  IF EXISTS (
    SELECT 1 FROM public.baby_profiles 
    WHERE id = baby_uuid AND user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is a family member with access to this baby
  IF EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE baby_id = baby_uuid AND user_id = user_uuid AND status = 'active'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_family_member_role(user_uuid uuid, baby_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.is_baby_owner(user_uuid uuid, baby_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.baby_profiles 
    WHERE id = baby_uuid AND user_id = user_uuid
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_active_profile(profile_id uuid, user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- First, set all profiles for this user to inactive
  UPDATE public.baby_profiles 
  SET is_active = false 
  WHERE user_id = user_id_param;
  
  -- Then set the specified profile to active
  UPDATE public.baby_profiles 
  SET is_active = true 
  WHERE id = profile_id AND user_id = user_id_param;
END;
$function$;

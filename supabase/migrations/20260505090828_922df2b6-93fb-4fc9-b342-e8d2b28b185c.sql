
DROP FUNCTION IF EXISTS public.admin_list_users();

CREATE OR REPLACE FUNCTION public.admin_list_users()
 RETURNS TABLE(
   id uuid, email text, full_name text, is_admin boolean,
   created_at timestamptz,
   subscription_tier text, subscription_status text, plan_label text,
   baby_count bigint,
   country text, country_code text, city text,
   last_active_at timestamptz
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  RETURN QUERY
    SELECT
      p.id,
      p.email,
      p.full_name,
      p.is_admin,
      p.created_at,
      COALESCE(s.subscription_tier, 'free') AS subscription_tier,
      COALESCE(s.status, 'free') AS subscription_status,
      CASE
        WHEN s.id IS NULL THEN 'free'
        WHEN s.status = 'trialing' THEN 'trial'
        WHEN s.status = 'canceled' THEN 'canceled'
        WHEN s.status = 'active' AND s.subscription_tier IN ('premium','premium_quarterly','premium_annual') THEN 'premium'
        WHEN s.status = 'active' AND s.subscription_tier = 'basic' THEN 'basic'
        WHEN s.subscription_tier = 'free' OR s.status = 'free' THEN 'free'
        ELSE COALESCE(s.subscription_tier, 'free')
      END AS plan_label,
      (SELECT COUNT(*) FROM public.baby_profiles bp WHERE bp.user_id = p.id) AS baby_count,
      ul.country,
      ul.country_code,
      ul.city,
      (SELECT MAX(us.last_activity_at) FROM public.user_sessions us WHERE us.user_id = p.id) AS last_active_at
    FROM public.profiles p
    LEFT JOIN public.subscriptions s ON s.user_id = p.id
    LEFT JOIN public.user_locations ul ON ul.user_id = p.id
    ORDER BY p.created_at DESC;
END;
$function$;

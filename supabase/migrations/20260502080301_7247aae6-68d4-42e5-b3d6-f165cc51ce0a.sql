
-- Admin RPC functions to safely access aggregated data without broad RLS

-- Get all newsletter subscribers (admin only)
CREATE OR REPLACE FUNCTION public.admin_list_newsletter_subscribers()
RETURNS TABLE(id uuid, email text, status text, language text, subscribed_at timestamptz, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  RETURN QUERY
    SELECT n.id, n.email, n.status, n.language, n.subscribed_at, n.created_at
    FROM public.newsletter_subscribers n
    ORDER BY n.created_at DESC;
END;
$$;

-- Get all users with subscription info (admin only)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  created_at timestamptz,
  subscription_tier text,
  subscription_status text,
  baby_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      s.subscription_tier,
      s.status as subscription_status,
      (SELECT COUNT(*) FROM public.baby_profiles bp WHERE bp.user_id = p.id) as baby_count
    FROM public.profiles p
    LEFT JOIN public.subscriptions s ON s.user_id = p.id
    ORDER BY p.created_at DESC;
END;
$$;

-- Aggregated analytics (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'users_last_7d', (SELECT COUNT(*) FROM public.profiles WHERE created_at > now() - interval '7 days'),
    'users_last_30d', (SELECT COUNT(*) FROM public.profiles WHERE created_at > now() - interval '30 days'),
    'total_babies', (SELECT COUNT(*) FROM public.baby_profiles),
    'total_activities', (SELECT COUNT(*) FROM public.baby_activities),
    'activities_last_7d', (SELECT COUNT(*) FROM public.baby_activities WHERE created_at > now() - interval '7 days'),
    'newsletter_active', (SELECT COUNT(*) FROM public.newsletter_subscribers WHERE status = 'active'),
    'newsletter_total', (SELECT COUNT(*) FROM public.newsletter_subscribers),
    'subs_active', (SELECT COUNT(*) FROM public.subscriptions WHERE status IN ('active','trialing') AND subscription_tier IN ('premium','premium_quarterly','premium_annual')),
    'subs_trialing', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'trialing'),
    'subs_basic', (SELECT COUNT(*) FROM public.subscriptions WHERE subscription_tier = 'basic'),
    'open_threads', (SELECT COUNT(DISTINCT thread_id) FROM public.contact_messages WHERE status IN ('unread','read')),
    'unread_messages', (SELECT COUNT(*) FROM public.contact_messages WHERE direction = 'inbound' AND status = 'unread'),
    'signups_by_day', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('date', d::date, 'count', cnt) ORDER BY d), '[]'::jsonb)
      FROM (
        SELECT date_trunc('day', created_at) as d, COUNT(*) as cnt
        FROM public.profiles
        WHERE created_at > now() - interval '30 days'
        GROUP BY 1
        ORDER BY 1
      ) x
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- Toggle admin status (admin only, cannot remove last admin or self-demote)
CREATE OR REPLACE FUNCTION public.admin_set_user_admin(target_user_id uuid, make_admin boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count int;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF target_user_id = auth.uid() AND make_admin = false THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  IF make_admin = false THEN
    SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE is_admin = true;
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin';
    END IF;
  END IF;
  UPDATE public.profiles SET is_admin = make_admin WHERE id = target_user_id;
END;
$$;

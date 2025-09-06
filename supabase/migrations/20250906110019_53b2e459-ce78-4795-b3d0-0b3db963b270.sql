-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT subscription_tier 
    FROM public.subscriptions 
    WHERE user_id = user_uuid AND status = 'active'
  );
END;
$$;

-- Update function to check premium access (both monthly and annual)
CREATE OR REPLACE FUNCTION public.has_premium_access(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = user_uuid 
    AND subscription_tier IN ('premium', 'premium_annual')
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > now())
  );
END;
$$;
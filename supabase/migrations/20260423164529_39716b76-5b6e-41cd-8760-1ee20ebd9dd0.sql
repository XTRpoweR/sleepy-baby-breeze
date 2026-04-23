-- Table to store the active Stripe price IDs for each plan
CREATE TABLE IF NOT EXISTS public.stripe_price_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL UNIQUE,
  stripe_price_id text NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  interval text NOT NULL,
  interval_count integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_price_config ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can read active price config to render pricing cards
CREATE POLICY "Anyone can read price config"
  ON public.stripe_price_config FOR SELECT
  USING (true);

-- Only service role manages prices (writes happen from edge functions)
CREATE POLICY "Service role manages price config"
  ON public.stripe_price_config FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE TRIGGER update_stripe_price_config_updated_at
  BEFORE UPDATE ON public.stripe_price_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update has_premium_access to include the new quarterly tier
CREATE OR REPLACE FUNCTION public.has_premium_access(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
    AND subscription_tier IN ('premium', 'premium_quarterly', 'premium_annual')
    AND status IN ('active', 'trialing')
    AND (current_period_end IS NULL OR current_period_end > now())
  );
END;
$function$;
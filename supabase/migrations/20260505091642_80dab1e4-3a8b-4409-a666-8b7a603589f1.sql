
CREATE TABLE IF NOT EXISTS public.user_locations (
  user_id UUID PRIMARY KEY,
  country TEXT,
  country_code TEXT,
  city TEXT,
  region TEXT,
  timezone TEXT,
  last_ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all locations" ON public.user_locations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users view own location" ON public.user_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages locations" ON public.user_locations
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_user_locations_updated_at
  BEFORE UPDATE ON public.user_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

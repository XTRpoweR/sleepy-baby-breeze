
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.send_event_to_capi()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.capi_sent IS DISTINCT FROM TRUE THEN
    PERFORM extensions.http_post(
      url := 'https://wjxxgccfazpkdfzbcgen.supabase.co/functions/v1/send-capi-event',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('event_id', NEW.id)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block the insert because of CAPI relay issues
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_send_to_capi ON public.marketing_events;
CREATE TRIGGER trg_send_to_capi
  AFTER INSERT ON public.marketing_events
  FOR EACH ROW
  EXECUTE FUNCTION public.send_event_to_capi();

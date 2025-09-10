-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search_path for log_security_event function (already has it, but making sure)
CREATE OR REPLACE FUNCTION public.log_security_event(
  user_uuid uuid,
  event_type text,
  event_description text,
  metadata jsonb DEFAULT NULL,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL,
  severity text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, event_description, metadata, 
    ip_address, user_agent, severity
  ) VALUES (
    user_uuid, event_type, event_description, metadata,
    ip_address, user_agent, severity
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Fix search_path for invalidate_other_sessions function (already has it, but making sure)
CREATE OR REPLACE FUNCTION public.invalidate_other_sessions(
  user_uuid uuid,
  current_session_id text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invalidated_count integer;
BEGIN
  UPDATE public.user_sessions 
  SET is_active = false, updated_at = now()
  WHERE user_id = user_uuid 
  AND is_active = true
  AND (current_session_id IS NULL OR session_id != current_session_id);
  
  GET DIAGNOSTICS invalidated_count = ROW_COUNT;
  
  -- Log the security event
  PERFORM public.log_security_event(
    user_uuid,
    'session_invalidation',
    format('Invalidated %s active sessions', invalidated_count),
    jsonb_build_object('invalidated_count', invalidated_count),
    NULL,
    NULL,
    'warning'
  );
  
  RETURN invalidated_count;
END;
$$;
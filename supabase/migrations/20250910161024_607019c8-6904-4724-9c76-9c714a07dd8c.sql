-- Create user_sessions table for tracking active sessions
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  device_info text,
  ip_address inet,
  user_agent text,
  location_info jsonb,
  login_at timestamp with time zone NOT NULL DEFAULT now(),
  last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create security_events table for logging security activities
CREATE TABLE public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  event_description text NOT NULL,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  severity text NOT NULL DEFAULT 'info',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions" 
ON public.user_sessions 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for security_events
CREATE POLICY "Users can view their own security events" 
ON public.security_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all security events" 
ON public.security_events 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create indexes for better performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(user_id, is_active);
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_sessions
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log security events
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

-- Create function to invalidate all user sessions except current
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
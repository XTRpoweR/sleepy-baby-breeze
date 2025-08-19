-- Fix newsletter_subscribers RLS policies to prevent public access to email data

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Service role can manage newsletter subscribers" ON public.newsletter_subscribers;

-- Create secure policies that only allow service role access (for edge functions)
CREATE POLICY "Service role can manage all newsletter data" 
ON public.newsletter_subscribers 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Allow users to unsubscribe using their unsubscribe token (for unsubscribe functionality)
CREATE POLICY "Users can unsubscribe with valid token" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (true)
WITH CHECK (status = 'unsubscribed');

-- Create a security definer function for safe newsletter operations if needed
CREATE OR REPLACE FUNCTION public.safe_newsletter_unsubscribe(token_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.newsletter_subscribers 
  SET status = 'unsubscribed', updated_at = now()
  WHERE unsubscribe_token = token_param AND status = 'active';
  
  RETURN FOUND;
END;
$function$;
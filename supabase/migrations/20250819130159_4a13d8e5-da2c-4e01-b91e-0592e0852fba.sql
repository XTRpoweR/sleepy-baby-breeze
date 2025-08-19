-- Fix user_queries RLS policies to prevent unauthorized access to contact form data

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Service role can manage all queries" ON public.user_queries;

-- Create secure policies

-- Only authenticated service role can manage all queries (for admin dashboard functionality)
CREATE POLICY "Service role can manage all user queries" 
ON public.user_queries 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can only view their own queries (if they're authenticated)
CREATE POLICY "Users can view their own queries only" 
ON public.user_queries 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    (user_id = auth.uid()) OR 
    (user_id IS NULL AND email = auth.email())
  )
);

-- Allow contact form submissions (both authenticated and anonymous users)
CREATE POLICY "Anyone can submit contact queries" 
ON public.user_queries 
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated and inserting their own data
  (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR (user_id IS NULL AND email = auth.email()))) OR
  -- Allow anonymous submissions (user_id will be null)
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- No public updates or deletes allowed (only service role can do this)
-- This is already handled by the service role policy above
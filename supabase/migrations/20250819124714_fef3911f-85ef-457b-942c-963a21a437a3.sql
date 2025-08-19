-- Fix RLS policies for subscriptions table to prevent public access

-- First, drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- Drop duplicate user policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- Create secure policies that only allow users to access their own data
CREATE POLICY "users_can_view_own_subscription" ON public.subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_subscription" ON public.subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_subscription" ON public.subscriptions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Restricted service role policy for edge functions only (no public access)
CREATE POLICY "service_role_can_manage_subscriptions" ON public.subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Ensure RLS is enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
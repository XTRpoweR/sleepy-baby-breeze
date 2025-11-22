-- Tighten email exposure and message participants security

-- 1) Remove family-context SELECT on profiles so only users themselves can read their email
DROP POLICY IF EXISTS "Users can view limited profile info for family context" ON public.profiles;

-- Existing policy "Users can view their own profile" still allows each user to read their own email.

-- 2) Restrict who can insert into message_participants
DROP POLICY IF EXISTS "System can create message participants" ON public.message_participants;

CREATE POLICY "Internal system can create message participants"
ON public.message_participants
FOR INSERT
WITH CHECK (
  -- Allow inserts only from internal DB context (no JWT) or from service_role
  auth.jwt() IS NULL OR (auth.jwt() ->> 'role' = 'service_role')
);

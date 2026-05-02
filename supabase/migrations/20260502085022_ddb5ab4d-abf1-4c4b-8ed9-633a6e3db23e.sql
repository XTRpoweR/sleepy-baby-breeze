
-- 1. Fix password_reset_codes: restrict access; only service role manages, users cannot read codes
DROP POLICY IF EXISTS "Users can access their own reset codes" ON public.password_reset_codes;

CREATE POLICY "Service role manages reset codes"
  ON public.password_reset_codes
  FOR ALL
  TO public
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- 2. Prevent privilege escalation on profiles table
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- 3. Restrict user_queries SELECT to user_id only (no email enumeration)
DROP POLICY IF EXISTS "Authenticated users view their own queries" ON public.user_queries;

CREATE POLICY "Authenticated users view their own queries"
  ON public.user_queries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Tighten realtime.messages policies to restrict broadcast/presence to scoped topics
DROP POLICY IF EXISTS "Authenticated users can receive realtime messages" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can send realtime messages" ON realtime.messages;

-- Only allow access to user-scoped channels: 'user:{auth.uid()}' or 'baby:{baby_id}' where the user has access
CREATE POLICY "Users can subscribe to scoped channels"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND (
      realtime.topic() = 'user:' || auth.uid()::text
      OR (
        realtime.topic() LIKE 'baby:%'
        AND public.can_access_baby(
          auth.uid(),
          NULLIF(substring(realtime.topic() FROM 6), '')::uuid
        )
      )
    )
  );

CREATE POLICY "Users can publish to scoped channels"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      realtime.topic() = 'user:' || auth.uid()::text
      OR (
        realtime.topic() LIKE 'baby:%'
        AND public.can_access_baby(
          auth.uid(),
          NULLIF(substring(realtime.topic() FROM 6), '')::uuid
        )
      )
    )
  );

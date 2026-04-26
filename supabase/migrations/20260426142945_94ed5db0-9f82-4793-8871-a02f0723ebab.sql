
-- 1. FIX: family_invitations - منع القراءة العامة لكل الدعوات
DROP POLICY IF EXISTS "Anyone with token can view invitation" ON public.family_invitations;

-- إنشاء دالة آمنة لجلب دعوة عبر token محدد فقط
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(token_param uuid)
RETURNS TABLE(
  id uuid,
  baby_id uuid,
  email text,
  role text,
  status text,
  permissions jsonb,
  expires_at timestamptz,
  invitation_token uuid,
  invited_by uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT fi.id, fi.baby_id, fi.email, fi.role, fi.status, fi.permissions,
         fi.expires_at, fi.invitation_token, fi.invited_by, fi.created_at
  FROM public.family_invitations fi
  WHERE fi.invitation_token = token_param;
END;
$$;

-- 2. FIX: subscriptions - منع تصعيد الاشتراك
DROP POLICY IF EXISTS "users_can_update_own_subscription" ON public.subscriptions;

-- المستخدمون لا يستطيعون تحديث اشتراكاتهم مباشرة - فقط service role (Stripe webhooks)
-- إذا احتاج المستخدم تحديث billing_cycle يمكن إضافة سياسة محدودة لاحقاً

-- 3. FIX: user_queries - تقييد سياسة service role على الـ JWT الفعلي
DROP POLICY IF EXISTS "Service role can manage all user queries" ON public.user_queries;
CREATE POLICY "Service role can manage all user queries"
  ON public.user_queries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);



## تشخيص المشكلة وإصلاح نظام الإشعارات

### المشاكل المكتشفة

1. **لا يوجد مشتركين في جدول `push_subscriptions`** - لأن تسجيل Service Worker يتم تخطيه في بيئة المعاينة (preview)
2. **إرسال الإشعارات لا يعمل** - الدالة `send-push-notification` ترسل البيانات كنص عادي بدون تشفير Web Push (RFC 8291). متصفحات Chrome/Firefox ترفض أي payload غير مشفر
3. **لا يوجد جدولة تلقائية** - pg_cron لم يتم إعداده بعد
4. **لا يوجد زر تجربة** - لا توجد طريقة لاختبار الإشعارات

### الحل

#### الخطوة 1: إصلاح Edge Function لتشفير الإشعارات
- إعادة كتابة `send-push-notification` باستخدام مكتبة `web-push` عبر `npm:web-push` في Deno
- هذه المكتبة تتعامل مع تشفير RFC 8291 وتوقيع VAPID تلقائياً

#### الخطوة 2: إنشاء Edge Function للتجربة
- إنشاء `send-test-notification/index.ts` - يقبل `user_id` ويرسل إشعار تجريبي فوري
- يأخذ اشتراك المستخدم من الجدول ويرسل إشعار مباشر

#### الخطوة 3: إضافة زر "إشعار تجريبي" في الواجهة
- إضافة زر في `SmartNotifications` أو صفحة الإشعارات
- عند الضغط: يستدعي `send-test-notification` ويرسل إشعار خلال ثوانٍ

#### الخطوة 4: إصلاح تسجيل Service Worker
- إزالة حظر التسجيل في بيئة المعاينة حتى يتم حفظ الاشتراك
- التأكد من حفظ `push_subscriptions` بشكل صحيح

#### الخطوة 5: إعداد pg_cron
- إنشاء cron job يستدعي `schedule-notifications` ثم `send-push-notification` كل 5 دقائق

### الملفات المتأثرة
- `supabase/functions/send-push-notification/index.ts` - إعادة كتابة بالكامل
- `supabase/functions/send-test-notification/index.ts` - جديد
- `src/hooks/useNotifications.tsx` - إصلاح تسجيل SW
- `src/components/notifications/SmartNotifications.tsx` - إضافة زر تجربة

### ملاحظة تقنية
تشفير Web Push معقد جداً. مكتبة `web-push` تتعامل مع كل التفاصيل تلقائياً (ECDH key exchange, HKDF, AES-128-GCM). بدونها لن تعمل الإشعارات على أي متصفح.


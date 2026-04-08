

## إرسال إشعارات حقيقية للمستخدم خارج التطبيق (Web Push Notifications)

### كيف تعمل الإشعارات في التطبيقات العالمية؟
التطبيقات الكبرى ترسل إشعارات حتى عندما يكون التطبيق مغلقاً باستخدام تقنية تسمى **Web Push**. هذه التقنية تحتاج 3 أشياء:
1. **Service Worker** - برنامج صغير يعمل في الخلفية على جهاز المستخدم
2. **خادم خلفي** (Edge Function) - يرسل الإشعارات في الأوقات المناسبة
3. **مؤقت زمني** (pg_cron) - يشغّل الخادم تلقائياً كل فترة للتحقق وإرسال الإشعارات

### الخطة التفصيلية

**1. إنشاء جدول لتخزين اشتراكات الإشعارات**
- جدول `push_subscriptions` يحفظ بيانات اشتراك كل مستخدم (endpoint, keys)
- جدول `scheduled_notifications` يحفظ الإشعارات المجدولة للإرسال

**2. توليد مفاتيح VAPID**
- مفاتيح VAPID مطلوبة لتشفير الإشعارات (معيار Web Push)
- سنولّد مفتاح عام (يُخزّن في الكود) ومفتاح خاص (يُخزّن كـ secret)

**3. إنشاء Service Worker**
- ملف `public/sw.js` يستقبل الإشعارات في الخلفية ويعرضها للمستخدم
- يعمل حتى لو كان التطبيق مغلقاً تماماً

**4. تحديث `useNotifications.tsx`**
- عند موافقة المستخدم على الإشعارات، يتم تسجيل Service Worker
- إرسال بيانات الاشتراك (PushSubscription) إلى Supabase لتخزينها

**5. إنشاء Edge Function: `send-push-notification`**
- تجلب الإشعارات المجدولة من الجدول
- ترسلها عبر Web Push API إلى أجهزة المستخدمين
- تحذف الإشعارات المرسلة

**6. إنشاء Edge Function: `schedule-notifications`**
- تتحقق من أنشطة كل طفل (آخر رضاعة، وقت النوم، المعالم)
- تنشئ إشعارات مجدولة بناءً على إعدادات المستخدم
- تحترم ساعات الهدوء

**7. إعداد pg_cron**
- مهمة كل 5 دقائق تستدعي `schedule-notifications` ثم `send-push-notification`

### الملفات المتأثرة
- `public/sw.js` - **جديد** - Service Worker
- `src/hooks/useNotifications.tsx` - تسجيل SW وحفظ الاشتراك
- `src/hooks/useSmartNotifications.tsx` - إزالة المنطق المحلي (ينتقل للخادم)
- `supabase/functions/send-push-notification/index.ts` - **جديد**
- `supabase/functions/schedule-notifications/index.ts` - **جديد**
- جدولان جديدان في قاعدة البيانات + pg_cron

### تنبيه مهم
- **iOS Safari**: يدعم Web Push فقط إذا أضاف المستخدم التطبيق للشاشة الرئيسية (PWA)
- **Android Chrome**: يعمل مباشرة بدون أي إعداد إضافي
- **Desktop**: يعمل على Chrome, Firefox, Edge

### التقنيات المستخدمة
- Web Push API + VAPID keys
- Service Worker (background)
- Supabase Edge Functions (web-push library via npm)
- pg_cron + pg_net (scheduler)


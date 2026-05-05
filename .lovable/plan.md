## الهدف

في صفحة الأدمن `/admin/users`:

1. إظهار حالة الاشتراك بوضوح (مجاني / أساسي / بريميوم / تجريبي / غير مشترك) كعمود مستقل
2. إظهار الدولة والمدينة لكل مستخدم لفهم التوزيع الجغرافي للجمهور

---

## 1. حالة الاشتراك (عمود "الخطة")

العمود موجود فعلاً ضمن شارة `tierBadge`، لكنه يخلط بين `tier` و`status`. سنوسّعه ليصبح أوضح:


| الحالة          | متى تُعرض                        | اللون     |
| --------------- | -------------------------------- | --------- |
| Premium نشط     | `status='active'` و tier بريميوم | بنفسجي    |
| Trial (تجريبي)  | `status='trialing'`              | أصفر      |
| Basic (أساسي)   | `tier='basic'` و status نشط      | رمادي     |
| Free (مجاني)    | لا يوجد سجل اشتراك               | أزرق فاتح |
| Canceled (ملغى) | `status='canceled'`              | أحمر      |


تعديل دالة `admin_list_users` لإرجاع `subscription_tier` و`subscription_status` بشكل أكثر دقة (عند عدم وجود سجل في `subscriptions` تُرجع `'free'` بدل `null`).

---

## 2. الموقع الجغرافي (دولة + مدينة)

### مصدر البيانات

سنستخدم جدول `user_sessions` الموجود فعلاً (يحتوي عمود `location_info jsonb` و`ip_address`). لكن العمود غالباً فارغ حالياً.

### خطة التطبيق

**أ) Edge Function جديدة `track-user-location`:**

- تُستدعى مرة واحدة عند تسجيل الدخول (بعد `SIGNED_IN` في `useAuth.tsx`)
- تأخذ IP من `x-forwarded-for` (نفس نمط مذكرة `ip-handling`)
- تستعلم من `https://ipapi.co/{ip}/json/` (مجاني، 1000 طلب/يوم) أو `ip-api.com`
- تُحدّث/تُدخل صفّاً في جدول جديد `user_locations`:
  ```
  user_locations (
    user_id uuid PK,
    country text,
    country_code text,
    city text,
    region text,
    timezone text,
    last_ip inet,
    updated_at timestamptz
  )
  ```
- RLS: قراءة للأدمن فقط، كتابة للـ service_role

**ب) تحديث `admin_list_users**` لعمل JOIN مع `user_locations` وإرجاع `country`, `country_code`, `city`.

**ج) تحديث صفحة AdminUsers:**

- إضافة عمود "الموقع" (دسكتوب) يعرض علم الدولة + "City, Country"
- على الموبايل: سطر صغير تحت البريد
- إضافة فلتر/بحث بالدولة

**د) Dashboard إحصائي صغير في صفحة `AdminAnalytics`:**

- توزيع المستخدمين حسب الدولة (Top 10) — جدول بسيط مع عدد المستخدمين والنسبة المئوية
- توزيع حسب المدن (Top 10)

---

## 3. اقتراحات إضافية لفهم الجمهور (موصى بها)

أقترح إضافة هذه أيضاً لإثراء التحليلات (يمكنك الاختيار):

1. **اللغة المفضلة لكل مستخدم** — حفظ `navigator.language` عند التسجيل في عمود `preferred_language` على `profiles`. مفيد لمعرفة أي لغات يستخدمها جمهورك أكثر.
2. **مصدر التسجيل (UTM)** — أنت تلتقطها بالفعل في `utmCapture.ts` لكن لا تُحفظ على المستخدم. حفظ `utm_source`, `utm_campaign`, `referrer` في `profiles` عند التسجيل.
3. **آخر نشاط (Last seen)** — موجود جزئياً في `user_sessions.last_activity_at`. عرضه في جدول الأدمن ليتضح من نشط ومن غير نشط.
4. **نوع الجهاز** (موبايل / ديسكتوب) — استخراجه من `user_agent` الموجود في `user_sessions`.

---

## التفاصيل التقنية

**ملفات/تغييرات:**

- Migration: إنشاء جدول `user_locations` + RLS + تعديل `admin_list_users`
- Edge function جديدة: `supabase/functions/track-user-location/index.ts`
- تعديل `src/hooks/useAuth.tsx`: استدعاء `track-user-location` بعد `SIGNED_IN` (مع debouncing لمنع الاستدعاء المتكرر — مثلاً مرة كل 24 ساعة لكل مستخدم)
- تعديل `src/pages/admin/AdminUsers.tsx`: إضافة عمود الموقع، تحسين شارة الخطة، فلتر بالدولة
- تعديل `src/pages/admin/AdminAnalytics.tsx`: قسم توزيع جغرافي
- تحديث `src/integrations/supabase/types.ts` (تلقائياً)

**اعتبارات الخصوصية:**

- IP لن يُحفظ كاملاً، فقط الدولة/المدينة (لتجنّب مخاوف GDPR)
- البيانات مرئية للأدمن فقط (RLS صارم)

---

## أسئلة قبل التنفيذ

1. **مزود تحديد الموقع**: `ipapi.co` (مجاني 1000/يوم) أم `ip-api.com` (مجاني 45/دقيقة، لكن HTTP فقط للمجاني)؟ — أقترح `ipapi.co`.
2. **هل تريد أيضاً اقتراحاتي الإضافية** (اللغة، UTM، آخر نشاط، نوع الجهاز)؟ يمكنني تنفيذها كلها أو اختيار بعضها.
3. ايضا هذه البيانات أريدها ان تقوم بخفضها في subabes بجانب عامود ايملات المشتركين
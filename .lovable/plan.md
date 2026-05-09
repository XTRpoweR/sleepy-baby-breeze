# خطة تحسين صفحة الاشتراك (Subscription)

بعد مراجعة `src/pages/Subscription.tsx`, `src/components/subscription/SubscriptionPlans.tsx`, و `src/hooks/useSubscription.tsx` وجدت عدة مشاكل سأعالجها:

## المشاكل الحالية

1. **لا يوجد تمييز بين الترقية والتخفيض**: الكود يعرض فقط زر "الخطة الحالية" أو "ابدأ التجربة" لكل خطة، دون توضيح ما إذا كانت ترقية (Upgrade) أو تخفيض (Downgrade) بناءً على الخطة الحالية للمستخدم.
2. **لا توجد لوحة "حالة الاشتراك" واضحة**: شريط Premium/Basic صغير ومخفي في الزاوية، لا يعرض تاريخ التجديد، الخطة، السعر، أو حالة الإلغاء.
3. **حالة الإلغاء غير ظاهرة**: عند `status === 'canceled'` أو عند إلغاء التجديد التلقائي، لا يظهر للمستخدم أي تنبيه أو خيار لإعادة التفعيل.
4. **سياسة الاسترداد غير متطابقة**: الصفحة تذكر "15-Day Money-Back Guarantee" بينما طلبت 14 يوم، وهي مكررة في عدة أماكن دون شرح كيفية الطلب.
5. **التصميم غير متناسق**: الألوان (orange/purple/emerald/blue) متنوعة جداً وغير متوافقة مع نظام التصميم. الصفحة تستخدم ألوان مباشرة (`bg-blue-50`, `text-gray-900`) بدل tokens الـ design system.
6. **محتوى ثابت بالإنجليزية** في صفحة Subscription نفسها (Features, Testimonials, FAQ, Money-Back) رغم وجود نظام i18n.
7. **زر "Manage" صغير ومخفي** ولا يوضح ماذا يفعل (يفتح Stripe portal).

## التغييرات المقترحة

### 1. إعادة هيكلة `src/pages/Subscription.tsx`

- بناء **بطاقة "حالة اشتراكك الحالية" (Current Subscription Status)** كقسم بارز في الأعلى تعرض:
  - اسم الخطة الحالية + شارة (Active / Trialing / Canceled / Free)
  - السعر والدورة (شهري/ربع سنوي/سنوي)
  - تاريخ التجديد القادم أو تاريخ انتهاء الوصول إذا تم الإلغاء
  - أيام التجربة المتبقية إذا كانت تجربة
  - زرين واضحين: "إدارة الاشتراك" (Stripe Portal) و"إلغاء الاشتراك" (يفتح Portal أيضاً)
  - **إذا كان الاشتراك ملغى**: تنبيه برتقالي/أصفر "اشتراكك ملغى — ستفقد الوصول في [التاريخ]" مع زر "إعادة تفعيل".
- إعادة استخدام نظام التصميم (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`) بدل ألوان tailwind المباشرة.
- ترجمة كل النصوص الثابتة عبر `t()`.

### 2. تعديل `SubscriptionPlans.tsx` لدعم الترقية/التخفيض الديناميكية

- حساب رتبة كل خطة (`free=0, monthly=1, quarterly=2, annual=3`)
- بناءً على الخطة الحالية، تغيير نص الزر وأيقونته:
  - نفس الخطة → "خطتك الحالية" (معطّل)
  - رتبة أعلى → "ترقية إلى هذه الخطة" مع سهم صاعد
  - رتبة أقل → "التخفيض إلى هذه الخطة" مع نص رمادي + ملاحظة "سيتم التطبيق في نهاية الدورة الحالية"
  - مستخدم بدون اشتراك → "ابدأ التجربة المجانية"
- إضافة شارة "خطتك الحالية" على البطاقة المطابقة.
- توحيد الألوان لتستخدم `--primary` و `--accent` من الـ design system بدل orange/purple/emerald الصارخة (نحتفظ بشارات بسيطة لتمييز Most Popular / Best Value فقط).

### 3. توحيد سياسة الاسترداد

- توحيد على **14 يوم** (كما طلبت) في:
  - بطاقة "Money-Back Guarantee" داخل Subscription.tsx
  - قسم FAQ
  - أي مكان آخر يذكرها (Pricing.tsx، Footer)
- إضافة شرح موجز: "للاسترداد، اضغط على 'إدارة الاشتراك' ثم 'طلب استرداد' خلال 14 يوماً، أو راسلنا على [support@sleepybabyy.com](mailto:support@sleepybabyy.com) وسنرد خلال 24 ساعة."
- إضافة زر مباشر "طلب استرداد" يفتح بريد إلكتروني جاهز إلى [support@sleepybabyy.com](mailto:support@sleepybabyy.com).

### 4. إعادة تصميم احترافي ومتناسق

- استخدام نظام الـ tokens الموجود (HSL في `index.css`):
  - الخلفية: `bg-background` مع تدرج خفيف `from-background via-background to-muted/30`
  - البطاقات: `bg-card border-border shadow-sm hover:shadow-lg`
  - النصوص: `text-foreground` و `text-muted-foreground`
  - Accent: `text-primary` و `bg-primary/10`
- نمط مشابه لـ Stripe / Linear / Notion: مساحات بيضاء أكثر، حدود أنعم، تظليل خفيف، typography هرمي واضح.
- إزالة التدرجات المتعددة الألوان (orange→amber, purple→pink, emerald→teal) واستبدالها بـ accent واحد متناسق.

### 5. ترجمة المحتوى

- إضافة مفاتيح ترجمة جديدة في `src/locales/*/common.json` تحت `subscription.*`:
  - `currentStatus.*`, `manageButton`, `cancelButton`, `reactivateButton`, `cancelledBanner`, `refundPolicy.*`, `requestRefund`, إلخ.
  - تحديث FAQ ليستخدم الترجمة بدل النصوص الإنجليزية الصلبة.

## الملفات التي ستتعدّل

```
src/pages/Subscription.tsx                 (إعادة كتابة كاملة - تصميم نظيف + بطاقة حالة)
src/components/subscription/SubscriptionPlans.tsx   (منطق ترقية/تخفيض + توحيد ألوان)
src/components/subscription/CurrentSubscriptionCard.tsx   (مكون جديد)
src/locales/{en,de,es,fr,it,el,fi,sv,ar}/common.json   (مفاتيح subscription.*)
```

## ملاحظة هامة

تغيير الباقة فعلياً (proration / upgrade / downgrade) يتم عبر **Stripe Customer Portal** الذي يدعمه `customer-portal` edge function الموجود مسبقاً. لذا لن أضيف منطق Stripe خلفي جديد — فقط أمرّر النية الصحيحة (ترقية/تخفيض) للمستخدم وأفتح له Portal، أو أنشئ checkout جديد إذا كان قادماً من Free.

## أسئلة قبل التنفيذ

1. **سياسة الاسترداد**: 14 يوم أم 15 يوم؟ (الحالي 15، طلبت 14)
2. **زر "إلغاء الاشتراك"**: هل تفضّل فتح Stripe Portal مباشرة، أم نافذة تأكيد داخلية ثم Portal؟
3. **التخفيض (Downgrade)**: هل نسمح بالتخفيض من الصفحة (يفتح Portal تلقائياً) أم نخفيه ونتركه للمستخدم في Portal فقط؟

بخصوص سياسة الاستمراري كما موجود في الموقع تأكد ونفذ، وبخصوص الغاء الاشتراك  أُفضل ان تكون نافذه داخليه مثل باقي المواقع وشغاله وفعاله، ولكن لا اريد ان تتأثر اي وظيفة 
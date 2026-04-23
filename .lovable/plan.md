

## إضافة باقة "3 أشهر" + تحديث جميع الأسعار

### الأسعار الجديدة
| الباقة | السعر | الفترة |
|--------|------|--------|
| Basic (مجانية) | Free | — لن تُمسّ |
| **Premium شهرية** | **$7.99** | شهرياً |
| **Premium 3 أشهر** (جديدة) | **$19.99** | كل 3 أشهر (≈ $6.66/شهر) |
| **Premium سنوية** | **$69.99** | سنوياً (≈ $5.83/شهر) |

التجربة المجانية 7 أيام تبقى مفعّلة على جميع باقات Premium الثلاث.

---

### 1) تحديث Stripe (يتم تلقائياً عبر edge function)

سأنشئ edge function لمرة واحدة `setup-stripe-prices` تقوم بـ:
- **أرشفة (تعطيل)** جميع الأسعار النشطة الحالية للمنتج `prod_SngH6Y04uO0jIF` (تشمل $29.99 الشهرية و $299.99 السنوية والقديمة 49.99) — Stripe لا يسمح بحذف الأسعار، فقط أرشفتها، وهذا آمن للمشتركين الحاليين (يستمرون بأسعارهم القديمة).
- **إنشاء 3 أسعار جديدة** بالدولار:
  - `monthly` → 799 سنت / month
  - `quarterly` → 1999 سنت / month × 3 (interval: month, interval_count: 3)
  - `annual` → 6999 سنت / year
- إرجاع `priceId` لكل واحدة + حفظها في جدول جديد `stripe_price_config` لاستخدامها في checkout.

سأشغّل هذه الدالة مرة واحدة بعد النشر، ثم سيكون النظام جاهزاً.

### 2) تحديث `create-checkout`
- إزالة الـ `priceId` السنوي الثابت `price_1S4MDsKxuyUBlfIJ2zvZjYFB`.
- قبول `pricingPlan: 'monthly' | 'quarterly' | 'annual'`.
- جلب `priceId` الصحيح ديناميكياً من جدول `stripe_price_config` (أو من قائمة أسعار المنتج النشطة).
- الحفاظ على `trial_period_days: 7` للجميع.

### 3) تحديث `check-subscription` و `webhook-handler`
- إضافة tier جديد: `premium_quarterly`.
- التعرف على نوع الاشتراك من `interval` و `interval_count`:
  - `year` → `premium_annual`
  - `month` + `interval_count: 3` → `premium_quarterly`
  - `month` → `premium`
- تحديث webhook ليتعرف على المبالغ الجديدة (799/1999/6999).

### 4) تحديث الـ Hook والـ Types
- `useSubscription.tsx`: توسيع `subscriptionTier` ليشمل `'premium_quarterly'`، إضافة `upgradingQuarterly`، تحديث القيم في `fbqTrack('InitiateCheckout')` للأسعار الجديدة (7.99 / 19.99 / 69.99).
- إضافة helpers: `isPremiumQuarterly`.

### 5) إعادة تصميم `SubscriptionPlans.tsx` و `Pricing.tsx`
- **4 بطاقات** بدل 3: Basic / Monthly / **Quarterly (Best Value الأوسط)** / Annual.
- على الموبايل: عمود واحد. على Desktop: 4 أعمدة (`lg:grid-cols-4`).
- Toggle ثلاثي بدل ثنائي: Monthly | 3 Months | Yearly.
- **إزالة كل الأسعار المشطوبة والـ "40% OFF"** نهائياً (حسب طلبك). الأسعار الجديدة تُعرض بشكل نظيف.
- بطاقة "3 أشهر" بلون البنفسجي/الأزرق وتحمل شارة "Most Popular".
- البطاقة السنوية بشارة "Best Value — Save 27%" (محسوبة فعلياً: 7.99×12=95.88 → موفّر ≈ $26).
- الحفاظ على كل الرسوم المتحركة والتصميم الزجاجي الموجود.

### 6) i18n — توحيد اللغات (8 لغات)
سأضيف قسم `pricing` كامل في كل ملف من `src/locales/{en,de,es,fr,it,el,fi,sv}/common.json` يحتوي على:
- أسماء البطاقات (Basic / Monthly / Quarterly / Annual)
- العناوين الفرعية والوصف
- جميع نصوص المميزات (basic + premium) — حالياً hardcoded إنجليزي
- نصوص الأزرار (Start Free Trial / Current Plan / Processing / Upgrade)
- شارات (Most Popular, Best Value, 7-day free trial, Save X%)
- نصوص الـ toggle (Monthly / 3 Months / Yearly)
- "Equivalent to X/month", "Cancel anytime"

ثم استبدال كل النصوص الإنجليزية الثابتة في `SubscriptionPlans.tsx` و `Pricing.tsx` بـ `t('pricing.xxx')`.

### 7) العملات لكل دولة
نظام `useGeoCurrency` الحالي يعمل تماماً (USD/EUR/GBP/SEK/NOK يكتشف تلقائياً حسب IP). سيتم استخدام `convertPrice()` على الأسعار الجديدة (7.99 / 19.99 / 69.99) — بدون أي تعديل على المنطق. الفوترة في Stripe تبقى بالدولار مع عرض السعر المحلي للمستخدم (مع ملاحظة "Billing in USD" الموجودة حالياً).

### 8) تحديث المراجع للسعر في باقي الموقع
استبدال `$29.99` و `$49.99` (المشطوب) في:
- `src/pages/Account.tsx` (سطرين)
- `src/pages/Contact.tsx`
- `src/pages/Features.tsx`
- `src/pages/HelpCenter.tsx`
- `src/components/dashboard/MobileDashboard.tsx`
- `src/components/dashboard/UnifiedDashboard.tsx`
- `src/components/subscription/UpgradePrompt.tsx`
- `src/pages/Dashboard.tsx` (قيم Meta Pixel Purchase)

→ تصبح `$7.99/month` (السعر الأرخص لجذب الانتباه)، بدون أسعار مشطوبة.

---

### قاعدة البيانات (Migration)
1. إنشاء جدول `stripe_price_config`:
   - `id`, `plan_key` (monthly/quarterly/annual), `stripe_price_id`, `amount_cents`, `interval`, `created_at`
   - RLS: قراءة عامة (anon/authenticated)، كتابة فقط للـ service role.
2. تحديث `subscriptions.subscription_tier` — لا يحتاج تغيير schema (نص حر)، لكن سأحدّث `get_user_subscription_tier` و `has_premium_access` لتشمل `'premium_quarterly'`.

---

### ضمانات السلامة
- ✅ الباقة المجانية لن تُمس (لا حذف ولا تعديل).
- ✅ المشتركون الحاليون على الأسعار القديمة يبقون عليها (Stripe يحتفظ بـ `subscription.items.price` الأصلي حتى لو أُرشف السعر).
- ✅ التجربة المجانية 7 أيام محفوظة.
- ✅ كل الوظائف (auth, checkout, webhook, customer portal, family sharing, Meta Pixel) ستبقى تعمل.
- ✅ بعد إضافة الأسعار في Stripe، سأتحقق عبر `curl_edge_functions` و `edge_function_logs`.


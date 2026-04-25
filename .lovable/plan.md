
# خطة إضافة نظام موافقة الكوكيز (Cookie Consent)

## الهدف
إضافة نظام موافقة كوكيز متوافق مع **GDPR** (الاتحاد الأوروبي) و **CCPA/CPRA** (الولايات المتحدة)، بتصميم يطابق هوية SleepyBabyy (الأزرق `#3b82f6` + الأبيض، خطوط Inter، حواف دائرية ناعمة).

---

## ما سيراه المستخدم

### 1. شريط موافقة (Cookie Banner) — يظهر عند أول زيارة
- يظهر أسفل الشاشة (bottom على الموبايل، bottom-right على الديسكتوب)
- يحتوي على:
  - أيقونة كوكي صغيرة + عنوان: "We value your privacy"
  - شرح مختصر + رابط لـ Privacy Policy
  - 3 أزرار: **Accept All** / **Reject All** / **Customize**
- تصميم: بطاقة بيضاء، ظل ناعم، حواف `rounded-2xl`، أزرار بألوان التطبيق

### 2. نافذة الإعدادات (Preferences Modal)
عند الضغط على "Customize" تفتح نافذة فيها 4 أقسام بمفاتيح تبديل (Toggles):
- **Strictly Necessary** (دائماً مفعّل، معطّل التغيير) — الجلسة، اللغة، تفضيلات الحساب
- **Analytics** — Google Analytics, GTM analytics
- **Marketing** — Meta Pixel, Meta CAPI
- **Functional** — تفضيلات إضافية (الصوت، الإشعارات)

### 3. زر إعادة فتح التفضيلات
- زر صغير عائم في الفوتر (أو أيقونة كوكي صغيرة أسفل يسار الشاشة) لإعادة فتح الإعدادات في أي وقت
- مطلوب قانونياً ليتمكن المستخدم من سحب الموافقة

### 4. كاليفورنيا (CCPA)
- إضافة رابط **"Do Not Sell or Share My Personal Information"** في الفوتر يفتح نافذة التفضيلات مباشرة على قسم Marketing

---

## التغييرات التقنية

### ملفات جديدة
1. `src/components/cookies/CookieConsentBanner.tsx` — البانر السفلي
2. `src/components/cookies/CookiePreferencesDialog.tsx` — نافذة الإعدادات التفصيلية
3. `src/components/cookies/CookieSettingsButton.tsx` — زر إعادة الفتح
4. `src/hooks/useCookieConsent.tsx` — hook لإدارة حالة الموافقة (localStorage + Context)
5. `src/utils/consentManager.ts` — منطق تطبيق/إيقاف الـ trackers بناءً على الموافقة

### ملفات معدّلة
1. **`index.html`** — حذف التحميل التلقائي لـ:
   - Meta Pixel script (`fbq('init')` + `fbq('track', 'PageView')`)
   - Google Analytics gtag config
   - GTM يبقى محمّلاً لكن مع **Consent Mode v2** (الوضع الافتراضي = denied)
2. **`src/utils/metaPixel.ts`** — التحقق من الموافقة قبل أي `fbq()` call
3. **`src/App.tsx`** — تركيب `<CookieConsentProvider>` + `<CookieConsentBanner />`
4. **`src/pages/PrivacyPolicy.tsx`** — إضافة قسم "Cookie Policy" يشرح كل فئة
5. **ملفات الترجمة** (`src/locales/*/common.json`) — نصوص البانر بـ 8 لغات

### آلية العمل (Consent Mode v2)
```text
زيارة جديدة
   │
   ▼
GTM يحمّل بـ default consent = denied
   │
   ▼
البانر يظهر  ──► المستخدم يختار
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
     Accept   Reject   Customize
        │        │        │
        ▼        ▼        ▼
  gtag('consent','update', {...})
        │
        ▼
  حفظ في localStorage: cookie_consent_v1
        │
        ▼
  تحميل/إلغاء Meta Pixel + GA حسب الاختيار
```

### التخزين
- مفتاح localStorage: `sleepybabyy_cookie_consent`
- يحتوي: `{ necessary: true, analytics: bool, marketing: bool, functional: bool, timestamp, version }`
- صلاحية 12 شهراً (إعادة عرض البانر بعدها كما يوصي GDPR)

---

## التصميم (متوافق مع هوية التطبيق)
- خلفية: `bg-white/95 backdrop-blur-sm`
- حدود: `border-blue-100`، حواف `rounded-2xl`
- زر Accept: `bg-blue-500 hover:bg-blue-600` (نفس لون التطبيق)
- زر Reject: `variant="outline"` رمادي
- زر Customize: `variant="ghost"` أزرق
- أيقونة كوكي من `lucide-react` (`Cookie` icon)
- الموبايل: full-width أسفل الشاشة مع padding آمن للـ notch
- الديسكتوب: بطاقة `max-w-md` في الزاوية اليمنى السفلى

---

## ملاحظات مهمة
- **لن يتم حذف GTM/GA/Meta** — فقط سيتم تأخير تشغيلها لما بعد الموافقة
- المستخدمون الحاليون سيرون البانر مرة واحدة عند زيارتهم القادمة
- النصوص ستترجم لجميع اللغات الـ 8 المدعومة
- لا يحتاج تغييرات في قاعدة البيانات أو Edge Functions

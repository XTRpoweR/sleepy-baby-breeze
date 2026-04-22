

# إعادة تصميم قسم "Powerful Features"

## الهدف
تحويل شبكة المميزات الحالية إلى تجربة بصرية حديثة وتفاعلية تجذب الانتباه وتحفّز المستخدم على الضغط على "ابدأ الآن".

## التصميم الجديد

### 1) رأس القسم (Header)
- شارة علوية بتأثير زجاجي (glass) مع نقطة نابضة وأيقونة `Zap` تدور بلطف.
- العنوان بحجم أكبر مع كلمة مميّزة بتدرج متحرك (animated gradient text) ينتقل بين الألوان.
- أسفل العنوان: شريط صغير بـ 3 أيقونات صغيرة (Trusted by 10K+ families, 4.9★, 8 languages) لبناء الثقة فوراً.

### 2) شبكة البطاقات — تصميم Bento عصري
بدل 6 بطاقات متطابقة (3×2)، نستخدم **Bento Grid** غير منتظم يجذب العين:

```text
┌──────────────┬──────────┐
│  FEATURE 1   │ FEATURE 2│
│  (large 2x)  │          │
├──────┬───────┼──────────┤
│ F 3  │ F 4   │ FEATURE 5│
│      │       │ (tall)   │
├──────┴───────┤          │
│   FEATURE 6  │          │
└──────────────┴──────────┘
```
على الموبايل: عمود واحد بترتيب الأهم أولاً.

### 3) تصميم البطاقة الواحدة (Premium)
- خلفية بيضاء + حدود متدرّجة متحركة (conic-gradient border يدور ببطء عند hover).
- **Spotlight effect**: بقعة ضوء تتبع مؤشر الفأرة داخل البطاقة (radial-gradient متحرك بـ CSS variables).
- أيقونة كبيرة داخل صندوق متدرّج مع:
  - دوران 3D خفيف عند hover (`rotateY`).
  - حلقات متموّجة (ripple rings) تخرج من الأيقونة باستمرار.
  - أيقونات ثانوية صغيرة تطفو حولها (floating particles).
- شريط تقدّم صغير أسفل البطاقة يمتلئ عند hover.
- زر "Learn more →" يظهر بانزلاق من الأسفل عند hover مع سهم متحرك.
- Badge "🔥 POPULAR" / "⭐ PREMIUM" مع توهّج نابض.
- عدّاد الإنجاز (مثل "10,000+ families") يعدّ من 0 إلى الرقم النهائي عند ظهور البطاقة في الشاشة (Intersection Observer + count-up).

### 4) عناصر تفاعلية حول الشبكة
- **Aurora blobs** ملوّنة في الخلفية تتحرك ببطء.
- خط متموّج (SVG wave) يربط البطاقات بصرياً في الخلفية.
- ظهور البطاقات بترتيب متتابع (stagger) مع تأثير `fade-in-up + scale` عند الـ scroll.

### 5) CTA قوي تحت الشبكة (الجديد — لتحفيز الإجراء)
بطاقة عريضة بتدرّج ديناميكي تحت الشبكة:
- عنوان: "Ready to give your baby better sleep tonight?"
- نص فرعي قصير + 3 صور أفاتار صغيرة "Join 10,000+ parents".
- زرّان:
  - أساسي كبير "Start Free Today" — بتأثير glow نابض وسهم متحرك.
  - ثانوي "Watch 60s Demo" بأيقونة Play.
- شارة "No credit card · Cancel anytime" أسفل الزر.

## الرسوم المتحركة (تفاصيل تقنية)

سيتم إضافتها في `src/index.css`:
- `@keyframes border-rotate` — حدود conic-gradient تدور 360° (8s).
- `@keyframes float-particle` — جسيمات صغيرة تطفو حول الأيقونات.
- `@keyframes ripple-ring` — حلقات تتوسع وتتلاشى.
- `@keyframes shimmer-text` — تدرّج متحرك على النص.
- `@keyframes pulse-glow` — توهّج نابض حول CTA.
- Spotlight: متغيّرات `--mouse-x` / `--mouse-y` عبر `onMouseMove` على البطاقة.
- Count-up: hook خفيف `useCountUp` مع `IntersectionObserver`.
- جميع الحركات تحترم `prefers-reduced-motion`.

## الملفات المعدّلة
- `src/pages/Index.tsx` — إعادة بناء `FeatureCard` وقسم `#features` بالكامل + إضافة CTA.
- `src/index.css` — إضافة keyframes والكلاسات الجديدة (`.feature-card-bento`, `.spotlight-card`, `.ripple-ring`, `.animated-border`, `.cta-glow`).
- لا تعديل على `tailwind.config.ts` ولا على بيانات الـ features (نفس المصفوفة).

## ما يبقى كما هو
- محتوى المميزات الستة (العناوين، الأوصاف، الأيقونات، الصور).
- بقية أقسام الصفحة (Hero, Insights, Testimonials...).
- نظام الترجمة `t('features.title')`.


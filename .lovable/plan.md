

## تحسين قائمة الأسعار — تصميم أنيق وتفاعلي

### الملف المعدّل
- `src/components/subscription/SubscriptionPlans.tsx` (تعديل العرض فقط — بدون أي تغيير في منطق الدفع، الـ checkout، الـ subscription hook، أو الأزرار الوظيفية).

---

### 1) حل مشكلة "زر Monthly / Annual لا يفعل شيئًا"

حاليًا التبديل يغير فقط حواف البطاقات (ring color + شارة Popular/Best Value)، لذلك المستخدم يشعر أنه لا يحدث شيء لأن البطاقات الثلاث تبقى ظاهرة بنفس الحجم.

**الاقتراح المعتمد**: نجعل التبديل **يبرز فعليًا** الباقة المختارة بدل عرض البطاقتين بنفس الأهمية:

- البطاقة المختارة (Monthly أو Annual) تكبر قليلاً (`scale-105`)، تُضيء بحدود متوهجة بلون مميز، وترتفع للأعلى (`-translate-y-2`)، وتكتسب توهجًا (`glow shadow`).
- البطاقة غير المختارة من ضمن الباقتين المدفوعتين تتحول إلى وضع **"باهت/شفاف"** (`opacity-60`, `scale-95`, `grayscale-[20%]`) لتوجيه نظر المستخدم.
- شارة "Popular" / "Best Value" تتحرك بحركة `fade-in + scale-in` عند التبديل.
- السعر داخل البطاقة المختارة يتحرك بـ pulse خفيف عند التبديل لجذب الانتباه.
- زر CTA الخاص بالبطاقة المختارة يصبح بحجم أكبر ولونه متدرج (gradient)، بينما الباقي outline هادئ.

بهذه الطريقة المستخدم يرى تأثيرًا واضحًا فور الضغط على Monthly/Annual.

---

### 2) تحسين التصميم العام (أنيق + شفاف + يحث على الإجراء)

**شريط التبديل (Toggle)**
- استبدال الخلفية الرمادية بـ glassmorphism: `backdrop-blur-md bg-white/40 dark:bg-white/5 border border-white/20`.
- المؤشر النشط عبارة عن "pill" ينزلق بسلاسة (`transition-all duration-500 ease-out`) خلف الخيار المختار.
- شارة "Save $60" تنبض بلطف (`animate-pulse` خفيف).

**البطاقات (Cards)**
- خلفية شفافة متدرجة (glass effect): `bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30`.
- توهج خلفي ملون لكل باقة (blue للـ Basic, orange للـ Monthly, purple للـ Annual) عبر `::before` blur خلف البطاقة.
- على hover: `hover:-translate-y-2 hover:shadow-2xl` مع توهج أقوى.
- زاوية الـ "Popular / Best Value" badge تطفو فوق البطاقة بتدرج لوني وحركة `float` خفيفة (up/down 4px).

**الأسعار**
- السعر الرئيسي بخط أكبر وتدرج لوني (`bg-gradient-to-r ... bg-clip-text text-transparent`).
- السعر القديم المشطوب يبقى أصغر وبشفافية.
- شارة الخصم (40% OFF / Save $60) ترتدي توهج (glow) ناعم.

**قائمة الميزات**
- أيقونة الـ check داخل دائرة بتدرج أخضر مع توهج خفيف.
- على hover للصف، يتحرك السطر قليلاً لليمين (`hover:translate-x-1`) مع تغير لون النص.
- شارة "NEW" متحركة بـ shimmer/gradient.

**أزرار CTA**
- الزر الرئيسي (للباقة المختارة): تدرج لوني (gradient) + ظل ملون + سهم ⟶ يتحرك يمينًا عند hover.
- الأزرار الأخرى: outline أنيق بدون ظل.
- جميع الأزرار `transition-all duration-300`.

**حركات إضافية (دون إثقال)**
- البطاقات تظهر بتسلسل عند التحميل (`animate-fade-in` مع `animation-delay` متدرج لكل بطاقة 100ms).
- الـ ring الملون حول البطاقة المختارة ينبض بلطف.

---

### الجانب التقني

- لا تغيير في `useSubscription`, `createCheckout`, الأسعار، العملات، أو منطق `isCurrentPlan`.
- التعديلات حصرًا على className والـ wrappers البصرية.
- نستخدم classes Tailwind الموجودة + animations المعرفة في `tailwind.config.ts` (`fade-in`, `scale-in`) — لا حاجة لإضافة keyframes جديدة، وإن لزم سنضيف `float` و `shimmer` بسيطين في `tailwind.config.ts`.
- متجاوب بالكامل (mobile-first): على الجوال البطاقات تبقى مكدسة، وتأثيرات الـ scale تُخفّف لتفادي تجاوز الحدود.
- يحترم `dark mode` الحالي.

```text
[ Monthly | (Annual ●) ]   ← toggle مع pill منزلق
       │
       ▼
┌──────┐  ┌──────┐  ┌════════┐
│Basic │  │ Mon  │  ║ Annual ║  ← المختارة أكبر + متوهجة
│ dim  │  │ dim  │  ║ glow ★ ║
└──────┘  └──────┘  ╚════════╝
```


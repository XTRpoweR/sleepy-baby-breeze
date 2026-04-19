

## الخطة: تحسين واجهة "Child Profiles" (MobileProfileModal)

### المشكلة في الصورة
1. **التواريخ معطوبة**: تظهر "72025/3/" بدلاً من "3/7/2025" — مشكلة RTL مع `toLocaleDateString()`.
2. **التصميم باهت**: البطاقات بسيطة، الأيقونات صغيرة، لا hierarchy بصرية واضحة.
3. **شارة Active** تتداخل مع الاسم على الشاشات الضيقة.
4. **Header بدون لمسة جذابة** (لا gradient، لا badge للعدد).
5. **زر Manage Profiles** يبدو كـ outline عادي بدون تميّز.

### التحسينات

#### 1. إصلاح عرض التاريخ (الأهم)
**الملفات:** `MobileProfileModal.tsx` + `ProfileSelector.tsx`
- استبدال `new Date(profile.birth_date).toLocaleDateString()` بـ formatter يستخدم `i18n.language` ويُرغم direction LTR على span التاريخ:
  ```tsx
  <span dir="ltr">{format(new Date(profile.birth_date), 'd MMM yyyy', { locale: dateLocale })}</span>
  ```
- استخدام `date-fns` مع locale الموجود في `src/utils/dateLocalization.ts`.
- إضافة عمر الطفل المحسوب (مثل: "8 شهور" / "8 months") بجانب التاريخ — أكثر فائدة للأهل من تاريخ الميلاد المجرد.

#### 2. إعادة تصميم البطاقات (Premium look)
- **Avatar أكبر** (h-14 w-14) مع ring ملوّن للنشط.
- **Gradient خلفي** للبطاقة النشطة: `bg-gradient-to-br from-purple-50 to-pink-50` + `border-purple-300`.
- **Hover state** أوضح مع `hover:shadow-md transition-all`.
- **معلومات منظمة** عمودياً: اسم (bold) + سطر ميتا (عمر • تاريخ • role).
- **شارة Active** أصغر وأنعم: نقطة خضراء نابضة `animate-pulse` + كلمة "Active" بخط صغير، تنتقل لأسفل الاسم بدلاً من بجانبه على mobile.

#### 3. Header محسّن
- استبدال `Baby` icon بأيقونة دائرية ملوّنة `bg-purple-100 p-2 rounded-full`.
- إضافة subtitle: "X profiles • Tap to switch" تحت العنوان.
- خط فاصل أنعم (gradient أو opacity-50).

#### 4. زر Manage Profiles
- جعله filled بدلاً من outline مع gradient خفيف `bg-gradient-to-r from-purple-600 to-purple-700 text-white`.
- أيقونة `Settings` داخل دائرة بيضاء صغيرة.
- إضافة زر "+ Add Profile" منفصل أعلى manage (إذا profile limits تسمح).

#### 5. تطبيق نفس التحسينات على `ProfileSelector.tsx` (Desktop)
لضمان اتساق التجربة على كل الشاشات.

### الملفات المعدّلة
1. `src/components/profiles/MobileProfileModal.tsx` — Redesign كامل
2. `src/components/profiles/ProfileSelector.tsx` — نفس التحسينات للـ desktop
3. `src/utils/dateLocalization.ts` — قراءة فقط للتأكد من helpers الموجودة (إن وُجد helper لحساب العمر، استخدامه؛ وإلا إضافة `formatAge(birthDate, locale)`)

### مثال على البطاقة الجديدة
```text
┌─────────────────────────────────────┐
│ ╭───╮  SleepyBabyy           [✓]    │
│ │ 👶│  • 8 months                   │
│ ╰───╯  3 Jul 2025 · Owner           │
└─────────────────────────────────────┘
   ring-2 ring-purple-400 + gradient bg
```

### اعتبارات
- **RTL Support**: استخدام `dir="ltr"` فقط على span التاريخ، باقي البطاقة يحترم لغة المستخدم.
- **عدم كسر السلوك**: نفس callbacks (switch, manage) — التغيير بصري بحت + إصلاح التاريخ.
- **Translations**: استخدام i18n لـ "Active", "X months old", "Tap to switch" — إضافة مفاتيح إذا غير موجودة.


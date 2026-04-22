

## تغيير ضمان الاسترداد من 30 يوم إلى 15 يوم

سأستبدل جميع إشارات "استرداد الأموال خلال 30 يوم" في كافة أنحاء التطبيق بـ **15 يوم** مع الإبقاء على الفترة التجريبية المجانية (7 أيام) كما هي في باقات الأسعار.

---

### الملفات التي ستُعدَّل

**1. `src/pages/Subscription.tsx`**
- سؤال FAQ "Do you offer refunds?" (سطر 114):
  - من: *"We offer a 7-day free trial and a 30-day money-back guarantee..."*
  - إلى: *"We offer a 7-day free trial and a 15-day money-back guarantee for your peace of mind."*
- بطاقة الضمان السفلية (Money Back Guarantee Box):
  - العنوان (سطر 266): **"30-Day Money-Back Guarantee"** → **"15-Day Money-Back Guarantee"**
  - الوصف (سطر 268): استبدال *"within 30 days"* بـ *"within 15 days"*.
  - النقاط الثلاث (No questions asked / Full refund / Cancel anytime) تبقى كما هي.

**2. `src/pages/Pricing.tsx`** (سطر 379)
- سؤال FAQ "Do you offer refunds?":
  - من: *"Yes, we offer a 30-day money-back guarantee..."*
  - إلى: *"Yes, we offer a 15-day money-back guarantee if you're not completely satisfied."*

**3. `src/pages/HelpArticle.tsx`** — تحديث إشارات استرداد 30 يومًا في مقالات المساعدة:
- سطر 1752: `30-day refund period for new subscribers` → `15-day refund period for new subscribers`
- سطر 1815: `(except within 30 days of new subscription)` → `(except within 15 days of new subscription)`
- سطر 1980: `New subscribers: 30-day money-back guarantee` → `New subscribers: 15-day money-back guarantee`
- سطر 1987: `Contact customer support within 30 days` → `Contact customer support within 15 days`

> ملاحظة هامة: الإشارات الأخرى للرقم "30 يوم" المتعلقة بـ **الاحتفاظ بالبيانات (data retention)**، **تذكير انتهاء البطاقة**، و**فترة سماح حذف الحساب** ستبقى دون تغيير لأنها غير مرتبطة باسترداد الأموال.

---

### النتيجة المتوقعة
- توحيد رسالة الضمان في كل صفحات التطبيق على **15 يوم لاسترداد الأموال** + **7 أيام تجربة مجانية**.
- لن يبقى أي ذكر لـ "30-Day Money-Back Guarantee" في أي مكان.


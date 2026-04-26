# إصلاح إشعار إلغاء الاشتراك (Admin Notification)

## التشخيص

بعد فحص السجلات والكود، اكتشفت السبب الحقيقي للمشكلة:

1. ✅ Edge Function `newsletter-unsubscribe` **منشورة وتعمل** بشكل صحيح (تم اختبارها).
2. ❌ **لم يتم استدعاؤها أبداً** عند إلغاء اشتراكك (لا توجد أي سجلات HTTP).
3. ⚠️ مع ذلك، تم تحديث الحالة في قاعدة البيانات إلى `unsubscribed`.

### السبب الجذري

توجد **دالة قاعدة بيانات قديمة** اسمها `safe_newsletter_unsubscribe` تقوم بتحديث حالة المشترك مباشرة في قاعدة البيانات **بدون استدعاء الـ Edge Function** (وبالتالي بدون إرسال إشعار للأدمن).

بالإضافة إلى ذلك، رابط `List-Unsubscribe` في رأس الإيميل يجعل Gmail/Apple Mail أحياناً يقوم بـ **prefetch** للرابط بشكل تلقائي، مما يفتح صفحة `/unsubscribe` لكن JavaScript لا يعمل في هذه الحالة، فلا يتم استدعاء الـ Edge Function.

## خطة الإصلاح

### 1. حذف الدالة القديمة `safe_newsletter_unsubscribe`
- إنشاء migration لحذف هذه الدالة من قاعدة البيانات بحيث لا يكون هناك أي طريق آخر لإلغاء الاشتراك يتجاوز الـ Edge Function.

### 2. تحويل `newsletter-unsubscribe` لقبول طلبات GET أيضاً
- حالياً الدالة تقبل POST فقط. سنضيف دعم GET لكي يعمل الرابط مباشرة عند فتحه في المتصفح أو عند prefetch من Gmail.
- عند GET: تنفيذ إلغاء الاشتراك + إرسال إشعار للأدمن + إرجاع صفحة HTML بسيطة (success page) بنفس تصميم الموقع.

### 3. تحديث رابط `List-Unsubscribe` في إيميل الترحيب
- تغيير `List-Unsubscribe` header ليشير مباشرة إلى الـ Edge Function (`https://wjxxgccfazpkdfzbcgen.supabase.co/functions/v1/newsletter-unsubscribe?token=...`) بدلاً من صفحة الموقع.
- إضافة `List-Unsubscribe-Post: List-Unsubscribe=One-Click` لدعم One-Click Unsubscribe القياسي (RFC 8058) الذي يستخدمه Gmail.
- إبقاء رابط الويب داخل نص الإيميل (للنقر اليدوي) كما هو.

### 4. تبسيط صفحة `/unsubscribe`
- تبقى كما هي (تستدعي الـ Edge Function عبر POST عند التحميل) — لا تغيير مطلوب لأنها تعمل بشكل صحيح.

### 5. التحقق
- بعد النشر: اشترك بإيميل تجريبي → ألغِ الاشتراك من الإيميل → تأكد من وصول إشعار `support@sleepybabyy.com`.

## الملفات المتأثرة

- **جديد**: migration لحذف `safe_newsletter_unsubscribe`
- **تعديل**: `supabase/functions/newsletter-unsubscribe/index.ts` (إضافة GET handler + HTML response)
- **تعديل**: `supabase/functions/newsletter-subscribe/index.ts` (تحديث List-Unsubscribe headers)

## النتيجة المتوقعة

بعد التطبيق، **كل** عملية إلغاء اشتراك (سواء من زر Gmail المدمج، أو من الرابط في الإيميل، أو من صفحة الموقع) ستمر عبر الـ Edge Function وستُرسل إشعاراً فورياً إلى `support@sleepybabyy.com` يحتوي على بريد المشترك واللغة وعنوان IP والوقت.

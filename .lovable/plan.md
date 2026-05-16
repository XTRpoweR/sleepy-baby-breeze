## الهدف
إصلاح أربع مشكلات في إيميل الترحيب (`send-welcome-email`).

## التغييرات

### 1. منع إرسال إيميل ترحيب مكرر
**السبب**: `onAuthStateChange` في `src/hooks/useAuth.tsx` يطلق `SIGNED_IN` عدة مرات (تبديل تبويب، تحديث، إعادة تحقق). آلية الـ dedupe في الـ Edge Function تعتمد على قراءة ثم تحديث `welcome_email_sent_at` وهذا يسمح بسباق (race condition) عند طلبين متزامنين.

**الحل**:
- في `useAuth.tsx`: إضافة `useRef` (`welcomeSentRef`) لمنع الاستدعاء أكثر من مرة في نفس الجلسة، مع تخزين قيمة في `sessionStorage` بمفتاح `welcome_sent_${user.id}` لمنع التكرار حتى بعد إعادة التحميل.
- في `send-welcome-email/index.ts`: استبدال نمط "اقرأ ثم حدّث" بـ **UPDATE شرطي ذرّي**:
  ```
  UPDATE profiles SET welcome_email_sent_at = now()
  WHERE id = user_id AND welcome_email_sent_at IS NULL
  RETURNING id
  ```
  إذا لم يُرجع صفّاً → تم الإرسال سابقاً، تخطّى. الإرسال يتم فقط عند نجاح المطالبة (claim).

### 2. اللغة الافتراضية الإنجليزية
**السبب**: الكود يستخدم `navigator.language` مما يُنتج عربية لأي متصفح إعداداته عربية بغضّ النظر عن لغة الموقع المختارة.

**الحل**: في `useAuth.tsx` قراءة اللغة من i18n الفعلية للموقع:
```
import i18n from '@/i18n';
const lang = i18n.language?.split('-')[0] || 'en';
```
هذا يطابق اللغة المختارة فعلياً من المستخدم في الواجهة (الافتراضي en).

### 3. إصلاح "ردّ على هذا الإيميل"
**المشكلة**: المرسل `noreply@sleepybabyy.com` يوحي بعدم قبول الردود، رغم أن `reply_to` مضبوط على support.

**الحل** في `send-welcome-email/index.ts`:
- تغيير `FROM` إلى `'SleepyBabyy Support <support@sleepybabyy.com>'` ليتطابق الاسم مع وجهة الردّ.
- الإبقاء على `reply_to: support@sleepybabyy.com`.
- تعديل نص الترجمات: استبدال جملة "ردّ على هذا الإيميل أو راسلنا على" بـ "راسلنا على" فقط في جميع اللغات التسع، حتى لا نعد بشيء قد لا يعمل عبر بعض عملاء البريد.

### 4. إضافة الشعار في أعلى الإيميل
**الحل** في `buildHtml`:
- استبدال نص `SleepyBabyy 🌙` في الهيدر بصورة شعار:
  ```html
  <img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="180"
       style="display:block;margin:0 auto;max-width:180px;height:auto;">
  ```
- إبقاء خلفية التدرّج البنفسجي/الوردي.
- توسيط الصورة باستخدام `text-align:center` على الخلية الأم.

## الملفات المعدّلة
- `src/hooks/useAuth.tsx` — guard ذاكرة + sessionStorage، استخدام لغة i18n.
- `supabase/functions/send-welcome-email/index.ts` — UPDATE ذرّي، تغيير FROM، نصوص الترجمات، شعار في الهيدر.

## التحقق
- نشر الـ Edge Function، تسجيل حساب جديد، التحقق من وصول إيميل واحد فقط بلغة الموقع، رأس فيه شعار، والمرسل support@.

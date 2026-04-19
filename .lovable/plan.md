

## الخطة: فصل البوت إلى وضعين (مجاني للأسئلة + Premium للتنفيذ) + إصلاح خطأ شاشة Basic

### المشكلة الحالية
1. حساب Basic يرى رسالة "Something went wrong. Please try again." بدلاً من شاشة القفل الجميلة `PremiumLockScreen`.
2. المستخدمون المجانيون محرومون كلياً من البوت — تجربة سيئة وتفويت فرصة بناء عادة استخدام.

### السبب الجذري للخطأ
في `useChatAssistant.tsx`، عند استقبال 403 من الـ edge function، الكود يعرض toast خطأ. لكن `PremiumLockScreen` يُعرض فقط بناءً على `isPremium` من `useSubscription` (client-side check). إذا فشل كشف الاشتراك أو حدث تأخير، الـ Sheet يفتح المحادثة العادية، يُرسل المستخدم رسالة، تُرجع 403، وتظهر رسالة الخطأ الأحمر القبيحة.

---

### الاقتراح: وضعان للبوت

**Free Tier — "Q&A Assistant"** (للجميع)
- يجيب على الأسئلة فقط (نصائح، شرح المزايا، أوقات النوم المثالية، إلخ).
- **بدون tools/actions** — لا يستطيع تسجيل نوم/رضاعة/حفاضات/إشعارات.
- عند طلب تنفيذ إجراء → يرد بلطف: "هذه ميزة Premium، اضغط للترقية" مع زر CTA.

**Premium Tier — "Smart Assistant"** (مدفوع)
- كل قدرات Q&A.
- **+ التنفيذ التلقائي** للإجراءات (سجل نوم، رضاعة، حفاضات، إشعارات).
- Badge "Smart" داخل header الدردشة.

---

### التنفيذ

#### 1. Backend: `supabase/functions/chat-assistant/index.ts`
- **إزالة الـ 403 block** الذي يرفض المستخدمين Basic.
- بدلاً من ذلك: قراءة `isPremium` من جدول subscriptions وتمريره كـ flag إلى الـ AI.
- **شرطياً**: 
  - `tools` تُمرَّر فقط إذا `isPremium === true`.
  - System prompt يُعدَّل: للمجاني يحتوي تعليمات "أنت مساعد للأسئلة فقط، إذا طلب المستخدم تنفيذ إجراء (تسجيل نوم/رضاعة/حفاضات/إشعارات) ردّ بـ: 'هذه ميزة Smart Assistant المتوفرة في Premium ✨' واقترح الترقية".
  - للمدفوع: System prompt الكامل الحالي مع الـ tools.

#### 2. Frontend: `src/components/chat/ChatAssistant.tsx`
- **حذف** الـ conditional rendering لـ `PremiumLockScreen` — الجميع يرون المحادثة.
- إضافة badge صغيرة بجانب العنوان: "Smart" (إذا Premium) أو "Q&A" (إذا Free) — أو إخفاء badge للمجاني وإضافة زر صغير "Upgrade for Smart Actions".
- تحت input box للمستخدم Free: شريط رفيع بسيط: "✨ Upgrade to Premium for auto-logging" → ينقل لـ /subscription.

#### 3. `src/hooks/useChatAssistant.tsx`
- **حذف** معالجة 403 الحالية (لأن البوت لن يرفض أحداً بعد الآن).
- إبقاء معالجة 429/402.

#### 4. `src/components/chat/PremiumLockScreen.tsx`
- **حذف الملف** (لم يعد مستخدماً) — أو إبقاءه كمكون reusable للاستخدامات المستقبلية. سأحذفه لتنظيف الكود.

#### 5. صفحة الباقات: `src/components/subscription/SubscriptionPlans.tsx`
- تحديث وصف الميزة:
  - **Basic**: "AI Q&A Assistant — اسأل البوت عن أي شيء"
  - **Premium**: "Smart AI Assistant — البوت يسجل النوم والرضاعة والإشعارات بأمر واحد" + شارة NEW

#### 6. الترجمات: `src/locales/{en,de,es,fr,it,el,fi,sv}/common.json`
- إضافة:
  - `chat.tier.free` = "Q&A"
  - `chat.tier.premium` = "Smart"
  - `chat.upgradeBar` = "Upgrade to Premium for auto-logging actions"
  - `subscription.features.aiAssistantBasic` = "AI Q&A Assistant"
  - `subscription.features.aiAssistantPremium` = "Smart AI Assistant — auto-log activities"

---

### المخطط
```text
User opens chat
   │
   ├─ Free user  ──► Full chat UI + "Q&A" badge
   │                  ├─ asks question  ──► AI answers normally
   │                  └─ asks action     ──► AI: "Premium feature ✨ [Upgrade]"
   │
   └─ Premium    ──► Full chat UI + "Smart" badge
                      ├─ asks question  ──► AI answers
                      └─ asks action     ──► AI executes tool + confirms
```

### الملفات المعدّلة
1. `supabase/functions/chat-assistant/index.ts` — حذف 403، tools شرطية، prompts تكيّفية
2. `src/components/chat/ChatAssistant.tsx` — إزالة gate + badge + upgrade bar
3. `src/hooks/useChatAssistant.tsx` — تنظيف معالجة 403
4. `src/components/chat/PremiumLockScreen.tsx` — حذف
5. `src/components/subscription/SubscriptionPlans.tsx` — تحديث وصف الميزتين
6. `src/locales/*/common.json` (8 ملفات) — مفاتيح جديدة

### لماذا هذا أفضل
- **تجربة أفضل للمجاني**: يستفيد من البوت → يبني عادة → يرى قيمته → يترقى.
- **نقطة بيع واضحة**: الفرق بين "يجيب" و"ينفذ" ملموس وسهل الفهم.
- **يحل الخطأ تلقائياً**: لا 403، لا "Something went wrong".
- **Backend مؤمَّن**: التنفيذ يبقى مقيداً على مستوى الـ tools (لا تُمرَّر للمجاني)، فلا يستطيع المستخدم الالتفاف.


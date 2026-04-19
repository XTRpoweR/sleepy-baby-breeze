

## الخطة: جعل المساعد الذكي ميزة حصرية للباقة المدفوعة (Premium)

### الفكرة
تحويل ميزة المساعد الذكي (Chat Assistant) من ميزة مجانية إلى **ميزة Premium حصرية**، مع إضافتها كنقطة بيع جذابة في صفحة الباقات لزيادة التحويل للاشتراك المدفوع.

---

### 1. تقييد الوصول للمساعد (Frontend Gate)

**الملف:** `src/components/chat/ChatAssistant.tsx`

- استخدام hook `useSubscription` للتحقق من `isPremium`.
- إذا كان المستخدم **Basic**: عرض شاشة قفل داخل الـ Chat Sheet بدلاً من المحادثة، تحتوي على:
  - أيقونة قفل + Sparkles
  - عنوان: "المساعد الذكي - ميزة Premium"
  - وصف موجز للقدرات (تسجيل تلقائي، إشعارات، إلخ)
  - زر CTA: "ترقية إلى Premium" → ينقل إلى `/subscription`
- زر/أيقونة المساعد تبقى ظاهرة للجميع (لا نخفيها) لتعمل كـ "tease" يدفع للترقية.

### 2. تقييد الوصول من الـ Backend (الأهم للأمان)

**الملف:** `supabase/functions/chat-assistant/index.ts`

- في بداية الـ handler بعد التحقق من JWT:
  - استعلام `subscriptions` للمستخدم.
  - إذا `subscription_tier = 'basic'` أو `status` ليس `active`/`trialing` → إرجاع `403` مع رسالة:
    ```json
    { "error": "premium_required", "message": "..." }
    ```
- في `useChatAssistant.tsx`: التعامل مع status 403 وعرض toast "هذه الميزة تتطلب Premium" + إعادة فتح شاشة القفل.

### 3. إضافتها كميزة في صفحة الباقات

**الملف:** `src/components/subscription/SubscriptionPlans.tsx`

إضافة بند جديد في قائمة مزايا Premium بكل اللغات (9 لغات):
- **AR**: "مساعد ذكي يسجّل النوم والرضاعة والحفاضات ويدير الإشعارات بأمر واحد"
- **EN**: "AI Assistant — log sleep, feeding, diapers & manage notifications with a single command"
- **DE/ES/FR/IT/EL/FI/SV**: ترجمات مكافئة

مع أيقونة `Sparkles` أو `Bot` لتمييزها كميزة جديدة + شارة "NEW" صغيرة.

### 4. تحديث System Prompt للبوت

**الملف:** `supabase/functions/chat-assistant/index.ts`

إضافة في الـ system prompt: عند سؤال المستخدم عن مزايا Premium، يجب ذكر "المساعد الذكي" كأحد المزايا الحصرية.

### 5. الترجمات

**الملفات:** `src/locales/{ar,en,de,es,fr,it,el,fi,sv}/common.json`

إضافة مفاتيح جديدة:
- `chat.premiumGate.title`
- `chat.premiumGate.description`
- `chat.premiumGate.cta`
- `chat.premiumGate.features` (قائمة بالمزايا)
- `subscription.features.aiAssistant`

---

### التفاصيل التقنية

```text
User clicks chat icon
   │
   ▼
ChatAssistant Sheet opens
   │
   ├─ isPremium === true ──► Normal chat UI (current behavior)
   │
   └─ isPremium === false ─► <PremiumLockScreen />
                                 │
                                 └─► CTA → navigate('/subscription')

Backend safety net:
chat-assistant edge function
   │
   ├─ Validate JWT
   ├─ Query subscriptions table
   ├─ tier !== premium/premium_annual ──► 403 + premium_required
   └─ tier === premium ──► proceed with tools
```

### الملفات المعدّلة (المتوقعة)
1. `src/components/chat/ChatAssistant.tsx` — إضافة شاشة القفل
2. `src/components/chat/PremiumLockScreen.tsx` — مكون جديد (اختياري، أو inline)
3. `supabase/functions/chat-assistant/index.ts` — فحص الاشتراك + تحديث الـ prompt
4. `src/hooks/useChatAssistant.tsx` — معالجة 403
5. `src/components/subscription/SubscriptionPlans.tsx` — إضافة الميزة الجديدة
6. `src/locales/*/common.json` — ترجمات جديدة (9 ملفات)

### اعتبارات مهمة
- **المستخدمون في Trial (`status='trialing'`)**: يُمنحون وصولاً كاملاً للمساعد (متوافق مع memory: trialing = active).
- **عدم كسر المحادثات الحالية**: مستخدمو Basic لن يفقدوا سجل محادثاتهم القديم، فقط لن يستطيعوا إرسال رسائل جديدة.
- **UX ذكي**: عرض شاشة قفل جذابة بدلاً من إخفاء الزر = يخلق فضولاً ويزيد معدل التحويل للاشتراك.


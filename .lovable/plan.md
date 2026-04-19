

## الخطة: إضافة جدول لحفظ محادثات الشات بوت

سأضيف جدولين لحفظ المحادثات بشكل دائم في قاعدة البيانات بدلاً من الذاكرة فقط.

### 1. جداول قاعدة البيانات

**جدول `chat_conversations`** — كل محادثة (يمكن للمستخدم بدء عدة محادثات):
- `id` uuid PK
- `user_id` uuid (مرتبط بالمستخدم)
- `title` text (ملخص أول رسالة، يُولّد تلقائياً)
- `created_at`, `updated_at` timestamps

**جدول `chat_messages`** — الرسائل داخل كل محادثة:
- `id` uuid PK
- `conversation_id` uuid → `chat_conversations(id)` ON DELETE CASCADE
- `role` text ('user' | 'assistant')
- `content` text
- `created_at` timestamp

**RLS Policies**: المستخدم يرى/يعدل/يحذف فقط محادثاته ورسائله الخاصة (عبر `user_id` في conversations، وعبر join في messages).

### 2. Edge Function: `chat-assistant`
- يستقبل: `conversationId` (اختياري) + `message` نصية
- إذا لم يكن هناك `conversationId` → ينشئ محادثة جديدة
- يحفظ رسالة المستخدم في `chat_messages`
- يجلب آخر 20 رسالة من المحادثة + سياق الطفل (آخر أنشطة، جدول النوم)
- يستدعي Lovable AI Gateway (`google/gemini-3-flash-preview`) مع streaming
- بعد انتهاء الـ stream، يحفظ رد المساعد كاملاً في `chat_messages`
- اللغة: System prompt يطلب الرد بنفس لغة المستخدم تلقائياً

### 3. Hook: `src/hooks/useChatAssistant.tsx`
- يحمّل المحادثة النشطة من DB عند الفتح
- `sendMessage` → streaming + حفظ تلقائي عبر edge function
- `loadConversations`, `selectConversation`, `deleteConversation`, `newConversation`

### 4. UI: `src/components/chat/ChatAssistant.tsx`
- زر عائم (FAB) في أسفل اليمين
- نافذة محادثة (Sheet على الموبايل full-screen، Sheet جانبي على الديسكتوب)
- قائمة المحادثات السابقة (Drawer/Sidebar صغير)
- عرض الرسائل بـ `react-markdown`
- مؤشر typing أثناء الـ streaming
- زر "محادثة جديدة"

### 5. ترجمات
مفاتيح جديدة في كل ملفات `src/locales/*/common.json`:
`chat.title`, `chat.placeholder`, `chat.send`, `chat.welcome`, `chat.newChat`, `chat.history`, `chat.delete`, `chat.thinking`, `chat.errorRateLimit`, `chat.errorCredits`

### 6. تكامل
- إضافة `<ChatAssistant />` في `src/App.tsx` (يظهر فقط للمستخدمين المسجلين، مخفي في `/auth`)

### الملفات

| ملف | تغيير |
|---|---|
| Migration جديد | جدولا `chat_conversations` + `chat_messages` مع RLS |
| `supabase/functions/chat-assistant/index.ts` | جديد - streaming + حفظ في DB |
| `src/hooks/useChatAssistant.tsx` | جديد |
| `src/components/chat/ChatAssistant.tsx` | جديد - FAB + نافذة + تاريخ المحادثات |
| `src/App.tsx` | إضافة المكون |
| `src/locales/{en,ar,de,es,fr,it,el,fi,sv}/common.json` | مفاتيح ترجمة |
| `package.json` | `react-markdown` |

### ملاحظات
- المحادثات تبقى محفوظة دائماً ويمكن للمستخدم العودة إليها
- اللغة يكتشفها الـ AI تلقائياً من رسالة المستخدم
- `LOVABLE_API_KEY` متوفر مسبقاً (مجاني مع gemini-flash)
- الأمان: RLS صارم - كل مستخدم يرى محادثاته فقط


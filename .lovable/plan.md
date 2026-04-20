

## الخطة: إدخال صوتي مجاني وغير محدود (Web Speech API)

### القرار
بدلاً من ElevenLabs (مدفوع وله حصص)، سأستخدم **Web Speech API** المدمج في المتصفح مجاناً وبدون حدود وبدون مفاتيح API.

### المزايا
- **مجاني للأبد** — يعمل داخل المتصفح، لا سيرفر، لا API key، لا فاتورة.
- **يدعم العربية** وكل لغات التطبيق التسع (يستخدم لغة `i18n` الحالية تلقائياً).
- **زمن استجابة فوري** — التحويل يحصل محلياً/عبر خدمة Google المجانية للمتصفح.
- **VAD مدمج** — يكتشف نهاية الكلام تلقائياً.

### القيود (للشفافية)
- يعمل على **Chrome, Edge, Safari** (مدعوم في 95%+ من المتصفحات).
- Firefox دعمه محدود — سنُخفي الزر إذا لم يكن مدعوماً.
- يحتاج اتصال إنترنت في معظم المتصفحات.

### التغييرات

**1. Hook جديد: `src/hooks/useVoiceInput.tsx`**
- يغلّف `window.SpeechRecognition || window.webkitSpeechRecognition`
- يدير: `isListening`, `transcript`, `interimTranscript`, `start()`, `stop()`, `isSupported`
- يضبط `lang` حسب `i18n.language` (ar-SA, en-US, fr-FR, ...)
- `continuous: false` + `interimResults: true` لعرض النص لحظياً
- معالجة أخطاء: `not-allowed` (إذن مرفوض)، `no-speech`، `network`

**2. تحديث `src/components/chat/ChatAssistant.tsx`**
- إضافة زر مايكروفون بجانب زر Send (يظهر فقط إذا `isSupported`)
- أثناء التسجيل: أيقونة `MicOff` حمراء مع `animate-pulse`
- النص المؤقت يظهر مباشرة في الـ input field
- عند انتهاء الكلام: النص يبقى في الـ input ليراجعه المستخدم ثم يضغط Send (أأمن من الإرسال التلقائي)
- زر صغير لإلغاء التسجيل

**3. مفاتيح ترجمة في 9 ملفات locale**
```
chat.voice.start: "تحدث"
chat.voice.stop: "إيقاف الاستماع"  
chat.voice.listening: "أستمع..."
chat.voice.notSupported: "المتصفح لا يدعم الإدخال الصوتي"
chat.voice.permissionDenied: "يرجى السماح بالوصول للمايكروفون"
```

### تجربة المستخدم
```text
الوضع العادي:
[اكتب رسالة...........] [🎤] [➤]

أثناء الاستماع (نبضة حمراء):
[أستمع... "متى نام طفلي"] [🔴] [➤]

بعد التوقف:
[متى نام طفلي اليوم؟........] [🎤] [➤]
                              ↑ المستخدم يراجع ويضغط إرسال
```

### الملفات المتأثرة
- `src/hooks/useVoiceInput.tsx` (جديد)
- `src/components/chat/ChatAssistant.tsx` (تعديل input bar)
- `src/locales/{ar,en,de,es,fr,it,el,fi,sv}/common.json` (إضافة مفاتيح)

### بدون أي تكلفة
- لا secrets، لا edge functions، لا packages جديدة، لا فواتير.


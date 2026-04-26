import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = "support@sleepybabyy.com";
const LOGO_URL = "https://sleepybabyy.com/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png";

const rateLimitStore = new Map<string, number[]>();
function checkRateLimit(key: string, limit = 5, windowMs = 600000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  if (!rateLimitStore.has(key)) rateLimitStore.set(key, []);
  const requests = rateLimitStore.get(key)!.filter((t) => t > windowStart);
  if (requests.length >= limit) return false;
  requests.push(now);
  rateLimitStore.set(key, requests);
  return true;
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

type LocaleKey = 'en' | 'de' | 'es' | 'fr' | 'it' | 'el' | 'fi' | 'sv';

interface Locale {
  subject: string;
  subjectReturning: string;
  preheader: string;
  tagline: string;
  heading: string;
  intro: string;
  feat1Title: string; feat1Desc: string;
  feat2Title: string; feat2Desc: string;
  feat3Title: string; feat3Desc: string;
  cta: string;
  signOff: string;
  team: string;
  sentTo: string;
  unsubscribePrompt: string;
  unsubscribeLink: string;
}

const LOCALES: Record<LocaleKey, Locale> = {
  en: {
    subject: "Welcome to SleepyBabyy 🌙",
    subjectReturning: "Welcome back to SleepyBabyy 🌙",
    preheader: "Sweet dreams start here.",
    tagline: "Sweet dreams start here",
    heading: "You're officially in! 🎉",
    intro: "Thanks for subscribing to the SleepyBabyy newsletter. You'll now receive science-backed tips, carefully curated insights, and practical advice to help your little one (and you) sleep better.",
    feat1Title: "Weekly sleep tips", feat1Desc: "Carefully curated, science-backed advice for restful nights",
    feat2Title: "Early access to articles", feat2Desc: "Read new guides before anyone else",
    feat3Title: "Subscriber-only content", feat3Desc: "Exclusive guides not published on the blog",
    cta: "Read our latest guides",
    signOff: "Sweet dreams ahead 💤",
    team: "— The SleepyBabyy Team",
    sentTo: "Sent to",
    unsubscribePrompt: "Don't want these emails?",
    unsubscribeLink: "Unsubscribe",
  },
  de: {
    subject: "Willkommen bei SleepyBabyy 🌙",
    subjectReturning: "Willkommen zurück bei SleepyBabyy 🌙",
    preheader: "Süße Träume fangen hier an.",
    tagline: "Süße Träume fangen hier an",
    heading: "Du bist offiziell dabei! 🎉",
    intro: "Danke, dass du den SleepyBabyy-Newsletter abonniert hast. Du bekommst ab jetzt wissenschaftlich fundierte Tipps, sorgfältig ausgewählte Einblicke und praktische Ratschläge, damit dein Kleines (und du) besser schlafen.",
    feat1Title: "Wöchentliche Schlaftipps", feat1Desc: "Sorgfältig ausgewählte, wissenschaftlich fundierte Tipps",
    feat2Title: "Früher Zugang zu Artikeln", feat2Desc: "Lies neue Beiträge vor allen anderen",
    feat3Title: "Nur für Abonnenten", feat3Desc: "Exklusive Inhalte, die nicht im Blog erscheinen",
    cta: "Unsere neuesten Beiträge lesen",
    signOff: "Süße Träume 💤",
    team: "— Dein SleepyBabyy-Team",
    sentTo: "Gesendet an",
    unsubscribePrompt: "Möchtest du diese E-Mails nicht mehr?",
    unsubscribeLink: "Abmelden",
  },
  es: {
    subject: "Bienvenido a SleepyBabyy 🌙",
    subjectReturning: "Bienvenido de nuevo a SleepyBabyy 🌙",
    preheader: "Aquí empiezan los dulces sueños.",
    tagline: "Aquí empiezan los dulces sueños",
    heading: "¡Ya estás dentro! 🎉",
    intro: "Gracias por suscribirte al boletín de SleepyBabyy. Recibirás consejos basados en la ciencia, contenido cuidadosamente seleccionado y orientación práctica para que tu pequeño (y tú) descanséis mejor.",
    feat1Title: "Consejos semanales", feat1Desc: "Recomendaciones cuidadosamente seleccionadas y respaldadas por la ciencia",
    feat2Title: "Acceso anticipado", feat2Desc: "Lee nuestras guías antes que nadie",
    feat3Title: "Contenido exclusivo", feat3Desc: "Guías solo para suscriptores",
    cta: "Leer nuestras últimas guías",
    signOff: "Felices sueños 💤",
    team: "— El equipo de SleepyBabyy",
    sentTo: "Enviado a",
    unsubscribePrompt: "¿No quieres recibir estos correos?",
    unsubscribeLink: "Darse de baja",
  },
  fr: {
    subject: "Bienvenue chez SleepyBabyy 🌙",
    subjectReturning: "Bon retour chez SleepyBabyy 🌙",
    preheader: "Les doux rêves commencent ici.",
    tagline: "Les doux rêves commencent ici",
    heading: "C'est officiel, vous êtes inscrit ! 🎉",
    intro: "Merci de votre inscription à la newsletter SleepyBabyy. Vous recevrez des conseils fondés sur la science, des contenus soigneusement sélectionnés et des astuces concrètes pour mieux dormir, vous et votre bébé.",
    feat1Title: "Conseils hebdomadaires", feat1Desc: "Conseils soigneusement sélectionnés et fondés sur la science",
    feat2Title: "Accès anticipé", feat2Desc: "Lisez nos guides en avant-première",
    feat3Title: "Contenu réservé aux abonnés", feat3Desc: "Des guides exclusifs hors blog",
    cta: "Lire nos derniers guides",
    signOff: "Faites de beaux rêves 💤",
    team: "— L'équipe SleepyBabyy",
    sentTo: "Envoyé à",
    unsubscribePrompt: "Vous ne souhaitez plus recevoir ces e-mails ?",
    unsubscribeLink: "Se désabonner",
  },
  it: {
    subject: "Benvenuto in SleepyBabyy 🌙",
    subjectReturning: "Bentornato in SleepyBabyy 🌙",
    preheader: "I sogni d'oro iniziano qui.",
    tagline: "I sogni d'oro iniziano qui",
    heading: "Sei ufficialmente iscritto! 🎉",
    intro: "Grazie per esserti iscritto alla newsletter di SleepyBabyy. Riceverai consigli basati sulla scienza, contenuti accuratamente selezionati e suggerimenti pratici per aiutare il tuo piccolo (e te) a dormire meglio.",
    feat1Title: "Consigli settimanali", feat1Desc: "Contenuti accuratamente selezionati e basati sulla scienza",
    feat2Title: "Accesso anticipato", feat2Desc: "Leggi le nuove guide prima di tutti",
    feat3Title: "Solo per iscritti", feat3Desc: "Contenuti esclusivi non pubblicati sul blog",
    cta: "Leggi le nostre ultime guide",
    signOff: "Sogni d'oro 💤",
    team: "— Il team SleepyBabyy",
    sentTo: "Inviato a",
    unsubscribePrompt: "Non vuoi più ricevere queste email?",
    unsubscribeLink: "Annulla l'iscrizione",
  },
  el: {
    subject: "Καλώς ήρθες στο SleepyBabyy 🌙",
    subjectReturning: "Καλώς ήρθες ξανά στο SleepyBabyy 🌙",
    preheader: "Τα γλυκά όνειρα ξεκινούν εδώ.",
    tagline: "Τα γλυκά όνειρα ξεκινούν εδώ",
    heading: "Είσαι επίσημα μέσα! 🎉",
    intro: "Ευχαριστούμε που εγγράφηκες στο newsletter του SleepyBabyy. Από εδώ και στο εξής θα λαμβάνεις συμβουλές βασισμένες στην επιστήμη και πρακτικές οδηγίες προσεκτικά επιλεγμένες για να κοιμάστε καλύτερα εσύ και το μωρό σου.",
    feat1Title: "Εβδομαδιαίες συμβουλές", feat1Desc: "Προσεκτικά επιλεγμένες, βασισμένες στην επιστήμη",
    feat2Title: "Πρώιμη πρόσβαση", feat2Desc: "Διάβασε τους οδηγούς πρώτος",
    feat3Title: "Αποκλειστικό περιεχόμενο", feat3Desc: "Μόνο για συνδρομητές",
    cta: "Δες τους τελευταίους οδηγούς",
    signOff: "Όνειρα γλυκά 💤",
    team: "— Η ομάδα SleepyBabyy",
    sentTo: "Εστάλη στο",
    unsubscribePrompt: "Δεν θέλεις άλλο αυτά τα email;",
    unsubscribeLink: "Διαγραφή",
  },
  fi: {
    subject: "Tervetuloa SleepyBabyyhin 🌙",
    subjectReturning: "Tervetuloa takaisin SleepyBabyyhin 🌙",
    preheader: "Suloiset unet alkavat täältä.",
    tagline: "Suloiset unet alkavat täältä",
    heading: "Olet virallisesti mukana! 🎉",
    intro: "Kiitos, että tilasit SleepyBabyy-uutiskirjeen. Saat tieteeseen perustuvia vinkkejä, huolellisesti valittua tietoa ja käytännön neuvoja, joilla pienesi (ja sinä) nukutte paremmin.",
    feat1Title: "Viikoittaiset univinkit", feat1Desc: "Huolellisesti valittuja, tieteeseen perustuvia vinkkejä",
    feat2Title: "Varhainen pääsy", feat2Desc: "Lue uudet oppaat ensimmäisten joukossa",
    feat3Title: "Vain tilaajille", feat3Desc: "Sisältöä, jota ei julkaista blogissa",
    cta: "Lue uusimmat oppaat",
    signOff: "Suloisia unia 💤",
    team: "— SleepyBabyy-tiimi",
    sentTo: "Lähetetty osoitteeseen",
    unsubscribePrompt: "Etkö halua näitä viestejä?",
    unsubscribeLink: "Peru tilaus",
  },
  sv: {
    subject: "Välkommen till SleepyBabyy 🌙",
    subjectReturning: "Välkommen tillbaka till SleepyBabyy 🌙",
    preheader: "Söta drömmar börjar här.",
    tagline: "Söta drömmar börjar här",
    heading: "Du är officiellt med! 🎉",
    intro: "Tack för att du prenumererar på SleepyBabyy-nyhetsbrevet. Du får vetenskapligt underbyggda råd, noggrant utvalda insikter och praktiska tips som hjälper din lilla (och dig) att sova bättre.",
    feat1Title: "Veckovisa sömntips", feat1Desc: "Noggrant utvalda, vetenskapligt underbyggda råd",
    feat2Title: "Tidig åtkomst", feat2Desc: "Läs nya guider först av alla",
    feat3Title: "Endast för prenumeranter", feat3Desc: "Exklusivt innehåll utanför bloggen",
    cta: "Läs våra senaste guider",
    signOff: "Söta drömmar 💤",
    team: "— SleepyBabyy-teamet",
    sentTo: "Skickat till",
    unsubscribePrompt: "Vill du inte ha dessa mejl?",
    unsubscribeLink: "Avregistrera",
  },
};

function normalizeLanguage(lang?: string): LocaleKey {
  if (!lang) return 'en';
  const short = lang.toLowerCase().split('-')[0];
  if (short in LOCALES) return short as LocaleKey;
  return 'en';
}

const welcomeEmailHtml = (email: string, unsubscribeUrl: string, lang: LocaleKey) => {
  const t = LOCALES[lang];
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;font-size:1px;line-height:1px;color:#f1f5f9;">${t.preheader}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(15,23,42,0.08);">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding:36px 32px 8px;background:linear-gradient(180deg,#eef2ff 0%, #ffffff 100%);">
              <img src="${LOGO_URL}" alt="SleepyBabyy" width="120" height="120" style="display:block;width:120px;height:auto;border:0;outline:none;text-decoration:none;border-radius:24px;" />
            </td>
          </tr>

          <!-- Tagline -->
          <tr>
            <td align="center" style="padding:0 32px 28px;background:#ffffff;">
              <div style="font-size:14px;color:#64748b;letter-spacing:0.3px;">🌙 ${t.tagline}</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:8px 36px 8px;">
              <h1 style="margin:0 0 14px;color:#0f172a;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.3px;">${t.heading}</h1>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">${t.intro}</p>
            </td>
          </tr>

          <!-- Features -->
          <tr>
            <td style="padding:0 36px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;font-size:20px;line-height:1;">🌟</td>
                        <td>
                          <div style="color:#0f172a;font-size:14px;font-weight:600;margin-bottom:2px;">${t.feat1Title}</div>
                          <div style="color:#64748b;font-size:13px;line-height:1.45;">${t.feat1Desc}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;font-size:20px;line-height:1;">📚</td>
                        <td>
                          <div style="color:#0f172a;font-size:14px;font-weight:600;margin-bottom:2px;">${t.feat2Title}</div>
                          <div style="color:#64748b;font-size:13px;line-height:1.45;">${t.feat2Desc}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;font-size:20px;line-height:1;">💡</td>
                        <td>
                          <div style="color:#0f172a;font-size:14px;font-weight:600;margin-bottom:2px;">${t.feat3Title}</div>
                          <div style="color:#64748b;font-size:13px;line-height:1.45;">${t.feat3Desc}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:28px 36px 36px;">
              <a href="https://sleepybabyy.com/blog" style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 30px;border-radius:10px;box-shadow:0 4px 14px rgba(59,130,246,0.3);">${t.cta} →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 32px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 6px;color:#475569;font-size:13px;">${t.signOff}</p>
              <p style="margin:0 0 14px;color:#0f172a;font-size:13px;font-weight:600;">${t.team}</p>
              <p style="margin:0 0 10px;color:#94a3b8;font-size:11px;line-height:1.5;">
                ${t.sentTo} ${email}
              </p>
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5;">
                ${t.unsubscribePrompt} <a href="${unsubscribeUrl}" style="color:#3b82f6;text-decoration:underline;">${t.unsubscribeLink}</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:14px 0 0;color:#94a3b8;font-size:11px;">© SleepyBabyy · sleepybabyy.com</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const adminSubscribeHtml = (email: string, isReturning: boolean, lang: string, ip: string, ua: string) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 12px;font-size:18px;">🎉 ${isReturning ? 'Returning' : 'New'} newsletter subscriber</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="color:#64748b;width:120px;">Email</td><td><strong>${email}</strong></td></tr>
      <tr><td style="color:#64748b;">Status</td><td>${isReturning ? 'Reactivated' : 'New subscriber'}</td></tr>
      <tr><td style="color:#64748b;">Language</td><td>${lang}</td></tr>
      <tr><td style="color:#64748b;">IP</td><td>${ip}</td></tr>
      <tr><td style="color:#64748b;">User agent</td><td style="word-break:break-all;">${ua}</td></tr>
      <tr><td style="color:#64748b;">Time (UTC)</td><td>${new Date().toISOString()}</td></tr>
    </table>
  </div>
</body></html>`;

interface NewsletterSubscriptionRequest {
  email: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: 'Too many subscription attempts. Please try again later.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 2048) {
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, language }: NewsletterSubscriptionRequest = await req.json();

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const lang = normalizeLanguage(language);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingSubscriber, error: selectError } = await supabase
      .from('newsletter_subscribers')
      .select('email, status')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (selectError) throw selectError;

    let isReturning = false;

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return new Response(JSON.stringify({
          success: true, alreadySubscribed: true,
          message: "You're already subscribed to our newsletter. Thank you! 💙",
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } else {
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            language: lang,
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('email', sanitizedEmail);
        if (updateError) throw updateError;
        isReturning = true;
      }
    } else {
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: sanitizedEmail,
          status: 'active',
          language: lang,
          subscribed_at: new Date().toISOString(),
        });
      if (insertError) throw insertError;
    }

    const { data: tokenRow } = await supabase
      .from('newsletter_subscribers')
      .select('unsubscribe_token')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    const unsubscribeUrl = tokenRow?.unsubscribe_token
      ? `https://sleepybabyy.com/unsubscribe?token=${tokenRow.unsubscribe_token}`
      : `https://sleepybabyy.com/unsubscribe?email=${encodeURIComponent(sanitizedEmail)}`;

    const t = LOCALES[lang];

    // Send welcome email (non-blocking)
    try {
      const result = await resend.emails.send({
        from: "SleepyBabyy <noreply@sleepybabyy.com>",
        to: [sanitizedEmail],
        subject: isReturning ? t.subjectReturning : t.subject,
        html: welcomeEmailHtml(sanitizedEmail, unsubscribeUrl, lang),
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });
      console.log('Welcome email sent:', JSON.stringify(result));
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Send admin notification (non-blocking)
    try {
      const adminResult = await resend.emails.send({
        from: "SleepyBabyy Alerts <noreply@sleepybabyy.com>",
        to: [ADMIN_EMAIL],
        subject: `🎉 ${isReturning ? 'Returning' : 'New'} newsletter subscriber: ${sanitizedEmail}`,
        html: adminSubscribeHtml(sanitizedEmail, isReturning, lang, clientIP, userAgent),
      });
      console.log('Admin notification sent:', JSON.stringify(adminResult));
    } catch (adminErr) {
      console.error('Failed to send admin notification:', adminErr);
    }

    return new Response(JSON.stringify({
      success: true,
      message: isReturning
        ? 'Welcome back! Check your inbox for a confirmation.'
        : 'Successfully subscribed! Check your email for a welcome message.',
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Error in newsletter-subscribe function:', error);
    return new Response(JSON.stringify({ error: 'Failed to subscribe to newsletter. Please try again.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);

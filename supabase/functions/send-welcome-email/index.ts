import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FROM = 'SleepyBabyy <noreply@sleepybabyy.com>';
const SUPPORT = 'support@sleepybabyy.com';
const SITE = 'https://sleepybabyy.com';

type Lang = 'en'|'ar'|'de'|'es'|'fr'|'it'|'el'|'fi'|'sv';

const T: Record<Lang, {
  subject: string; hi: (n:string)=>string; intro: string;
  features: string; f1: string; f2: string; f3: string; f4: string;
  cta: string; trial: string; help: string; signoff: string;
  dir: 'ltr'|'rtl';
}> = {
  en: { subject: 'Welcome to SleepyBabyy 🌙', hi: n=>`Welcome, ${n}!`, intro: "We're so happy to have you. SleepyBabyy helps you track your baby's sleep, feeding, and diapers — all in one place.", features: 'Here\'s what you can do:', f1: '😴 Track sleep sessions and build smart schedules', f2: '🍼 Log feeding (breast, bottle, solids)', f3: '👶 Record diaper changes', f4: '📊 Get clear reports to share with your pediatrician', cta: 'Create your first baby profile', trial: 'You also get a free 7-day Premium trial — unlimited profiles, advanced analytics, and family sharing.', help: 'Need help? Just reply to this email or write to', signoff: 'Sweet dreams 💜 — The SleepyBabyy Team', dir:'ltr' },
  ar: { subject: 'مرحباً بك في SleepyBabyy 🌙', hi: n=>`مرحباً ${n}!`, intro: 'سعداء جداً بانضمامك. يساعدك SleepyBabyy على تتبّع نوم طفلك ورضاعته وحفّاضاته في مكان واحد.', features: 'إليك ما يمكنك فعله:', f1: '😴 تتبّع جلسات النوم وإنشاء جداول ذكية', f2: '🍼 تسجيل الرضاعة (طبيعية، صناعية، طعام)', f3: '👶 تسجيل تغيير الحفّاضات', f4: '📊 الحصول على تقارير واضحة لمشاركتها مع طبيب الأطفال', cta: 'أنشئ ملف طفلك الأول', trial: 'كما تحصل على تجربة مجانية لـ Premium لمدة 7 أيام — ملفات غير محدودة، تحليلات متقدمة، ومشاركة عائلية.', help: 'تحتاج مساعدة؟ ردّ على هذا الإيميل أو راسلنا على', signoff: 'أحلام سعيدة 💜 — فريق SleepyBabyy', dir:'rtl' },
  de: { subject: 'Willkommen bei SleepyBabyy 🌙', hi: n=>`Willkommen, ${n}!`, intro: 'Schön, dass du dabei bist. SleepyBabyy hilft dir, Schlaf, Fütterung und Windeln deines Babys an einem Ort zu erfassen.', features: 'Das kannst du tun:', f1: '😴 Schlafphasen erfassen und smarte Pläne erstellen', f2: '🍼 Fütterung dokumentieren (Stillen, Flasche, Brei)', f3: '👶 Windelwechsel notieren', f4: '📊 Berichte für den Kinderarzt erstellen', cta: 'Erstes Babyprofil erstellen', trial: 'Du erhältst außerdem 7 Tage Premium kostenlos — unbegrenzte Profile, erweiterte Analysen, Familienfreigabe.', help: 'Brauchst du Hilfe? Antworte auf diese E-Mail oder schreibe an', signoff: 'Süße Träume 💜 — Dein SleepyBabyy Team', dir:'ltr' },
  es: { subject: 'Bienvenido a SleepyBabyy 🌙', hi: n=>`¡Bienvenido, ${n}!`, intro: 'Nos alegra tenerte. SleepyBabyy te ayuda a registrar el sueño, la alimentación y los pañales de tu bebé en un solo lugar.', features: 'Esto es lo que puedes hacer:', f1: '😴 Registrar sesiones de sueño y crear horarios', f2: '🍼 Anotar tomas (pecho, biberón, sólidos)', f3: '👶 Registrar cambios de pañal', f4: '📊 Obtener informes claros para tu pediatra', cta: 'Crea el perfil de tu bebé', trial: 'Además, tienes 7 días gratis de Premium — perfiles ilimitados, análisis avanzados y uso compartido familiar.', help: '¿Necesitas ayuda? Responde a este correo o escríbenos a', signoff: 'Dulces sueños 💜 — El equipo SleepyBabyy', dir:'ltr' },
  fr: { subject: 'Bienvenue sur SleepyBabyy 🌙', hi: n=>`Bienvenue, ${n} !`, intro: 'Ravis de vous accueillir. SleepyBabyy vous aide à suivre le sommeil, les repas et les couches de votre bébé.', features: 'Voici ce que vous pouvez faire :', f1: '😴 Suivre le sommeil et créer des plannings malins', f2: '🍼 Enregistrer les repas (sein, biberon, solides)', f3: '👶 Noter les changements de couche', f4: '📊 Obtenir des rapports clairs pour le pédiatre', cta: 'Créer le profil de votre bébé', trial: "Vous bénéficiez aussi de 7 jours d'essai Premium gratuit — profils illimités, analyses avancées, partage familial.", help: "Besoin d'aide ? Répondez à cet email ou écrivez à", signoff: 'Doux rêves 💜 — L\'équipe SleepyBabyy', dir:'ltr' },
  it: { subject: 'Benvenuto su SleepyBabyy 🌙', hi: n=>`Benvenuto, ${n}!`, intro: 'Siamo felici di averti con noi. SleepyBabyy ti aiuta a registrare sonno, pappe e pannolini del tuo bimbo.', features: 'Ecco cosa puoi fare:', f1: '😴 Registrare il sonno e creare orari intelligenti', f2: '🍼 Annotare le poppate (seno, biberon, solidi)', f3: '👶 Registrare i cambi di pannolino', f4: '📊 Ottenere report chiari per il pediatra', cta: 'Crea il profilo del tuo bambino', trial: 'Hai anche 7 giorni di Premium gratis — profili illimitati, analisi avanzate, condivisione familiare.', help: 'Hai bisogno di aiuto? Rispondi a questa email o scrivici a', signoff: 'Sogni d\'oro 💜 — Il team SleepyBabyy', dir:'ltr' },
  el: { subject: 'Καλώς ήρθες στο SleepyBabyy 🌙', hi: n=>`Καλώς ήρθες, ${n}!`, intro: 'Χαιρόμαστε που είσαι εδώ. Το SleepyBabyy σε βοηθά να καταγράφεις τον ύπνο, το τάισμα και τις πάνες του μωρού.', features: 'Τι μπορείς να κάνεις:', f1: '😴 Καταγραφή ύπνου και έξυπνα προγράμματα', f2: '🍼 Καταγραφή ταΐσματος (στήθος, μπιμπερό, στερεά)', f3: '👶 Καταγραφή αλλαγής πάνας', f4: '📊 Καθαρές αναφορές για τον παιδίατρο', cta: 'Δημιούργησε το πρώτο προφίλ μωρού', trial: 'Έχεις επίσης 7 ημέρες δωρεάν Premium — απεριόριστα προφίλ, αναλυτικά στοιχεία, οικογενειακή κοινή χρήση.', help: 'Χρειάζεσαι βοήθεια; Απάντησε σε αυτό το email ή γράψε μας στο', signoff: 'Γλυκά όνειρα 💜 — Η ομάδα SleepyBabyy', dir:'ltr' },
  fi: { subject: 'Tervetuloa SleepyBabyy:hyn 🌙', hi: n=>`Tervetuloa, ${n}!`, intro: 'Mukava saada sinut mukaan. SleepyBabyy auttaa seuraamaan vauvasi unta, ruokailua ja vaippoja yhdessä paikassa.', features: 'Mitä voit tehdä:', f1: '😴 Seuraa unijaksoja ja luo älykkäitä aikatauluja', f2: '🍼 Kirjaa syötöt (rinta, pullo, kiinteät)', f3: '👶 Kirjaa vaipanvaihdot', f4: '📊 Saa selkeitä raportteja lääkärille', cta: 'Luo vauvasi profiili', trial: 'Saat myös 7 päivän ilmaisen Premium-kokeilun — rajaton profiilit, edistyneet analytiikat, perheenjako.', help: 'Tarvitsetko apua? Vastaa tähän viestiin tai kirjoita meille:', signoff: 'Suloisia unia 💜 — SleepyBabyy-tiimi', dir:'ltr' },
  sv: { subject: 'Välkommen till SleepyBabyy 🌙', hi: n=>`Välkommen, ${n}!`, intro: 'Kul att du är här. SleepyBabyy hjälper dig att hålla koll på din bebis sömn, matning och blöjor på ett ställe.', features: 'Det här kan du göra:', f1: '😴 Spåra sömnpass och skapa smarta scheman', f2: '🍼 Logga matning (bröst, flaska, fast föda)', f3: '👶 Registrera blöjbyten', f4: '📊 Få tydliga rapporter till barnläkaren', cta: 'Skapa din bebisprofil', trial: 'Du får också 7 dagars gratis Premium — obegränsade profiler, avancerad analys, familjedelning.', help: 'Behöver du hjälp? Svara på detta mejl eller skriv till', signoff: 'Söta drömmar 💜 — SleepyBabyy-teamet', dir:'ltr' },
};

function buildHtml(t: typeof T['en'], name: string) {
  const align = t.dir === 'rtl' ? 'right' : 'left';
  return `<!DOCTYPE html>
<html dir="${t.dir}"><head><meta charset="utf-8"><title>${t.subject}</title></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;max-width:560px;width:100%;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:28px;text-align:center;color:#fff;">
          <p style="margin:0;font-size:24px;font-weight:700;">SleepyBabyy 🌙</p>
        </td></tr>
        <tr><td style="padding:32px;text-align:${align};" dir="${t.dir}">
          <p style="margin:0 0 16px;font-size:20px;font-weight:600;">${t.hi(name)}</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${t.intro}</p>
          <p style="margin:0 0 12px;font-size:15px;font-weight:600;">${t.features}</p>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;">${t.f1}</p>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;">${t.f2}</p>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;">${t.f3}</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">${t.f4}</p>
          <p style="text-align:center;margin:24px 0;">
            <a href="${SITE}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">${t.cta}</a>
          </p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#6b7280;">${t.trial}</p>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b7280;">${t.help} <a href="mailto:${SUPPORT}" style="color:#7c3aed;text-decoration:none;">${SUPPORT}</a></p>
          <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">${t.signoff}</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#6b7280;">
          © ${new Date().getFullYear()} SleepyBabyy · <a href="${SITE}" style="color:#7c3aed;text-decoration:none;">sleepybabyy.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user_id, email, name, language } = await req.json();
    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: 'user_id and email required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Dedupe: only send once
    const { data: prof } = await admin
      .from('profiles')
      .select('welcome_email_sent_at')
      .eq('id', user_id)
      .maybeSingle();

    if (prof?.welcome_email_sent_at) {
      return new Response(JSON.stringify({ ok: true, skipped: 'already_sent' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lang = (['en','ar','de','es','fr','it','el','fi','sv'] as Lang[]).includes(language) ? language as Lang : 'en';
    const t = T[lang];
    const displayName = (name && String(name).trim()) || (email.split('@')[0]) || 'there';
    const html = buildHtml(t, displayName);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [email], subject: t.subject, html, reply_to: SUPPORT }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Resend error', res.status, text);
      return new Response(JSON.stringify({ error: 'send_failed', details: text }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await admin.from('profiles').update({ welcome_email_sent_at: new Date().toISOString() }).eq('id', user_id);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-welcome-email error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

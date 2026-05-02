import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Minimal safe markdown -> HTML (bold, italic, links, line breaks, lists)
function renderMarkdown(input: string): string {
  // Escape first
  let s = escapeHtml(input);

  // Links: [text](https://url)
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, text, url) => {
    return `<a href="${url}" style="color:#7C3AED;text-decoration:underline;">${text}</a>`;
  });

  // Bold **text**
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  // Italic *text* (single asterisk, not part of **)
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

  // Simple bullet lists: lines starting with "- " grouped
  const lines = s.split('\n');
  const out: string[] = [];
  let inList = false;
  for (const ln of lines) {
    if (/^\s*-\s+/.test(ln)) {
      if (!inList) { out.push('<ul style="margin:0 0 16px 0;padding-left:22px;color:#1F2937;">'); inList = true; }
      out.push(`<li style="margin:0 0 6px 0;">${ln.replace(/^\s*-\s+/, '')}</li>`);
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(ln);
    }
  }
  if (inList) out.push('</ul>');
  s = out.join('\n');

  // Newlines -> <br> (but not right after block tags)
  s = s.replace(/\n{2,}/g, '</p><p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#1F2937;">');
  s = s.replace(/\n/g, '<br>');
  s = `<p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#1F2937;">${s}</p>`;
  // Clean empty <p>
  s = s.replace(/<p[^>]*><\/p>/g, '');
  return s;
}

function buildNewsletterEmail(params: {
  title: string;
  subtitle?: string;
  body: string;
  tip?: string;
  ctaText?: string;
  ctaUrl?: string;
  userName?: string;
  unsubscribeUrl: string;
}): string {
  const { title, subtitle, body, tip, ctaText, ctaUrl, userName, unsubscribeUrl } = params;
  const safeTitle = escapeHtml(title);
  const safeSubtitle = subtitle && subtitle.trim() ? escapeHtml(subtitle.trim()) : "This week's update";
  const bodyHtml = renderMarkdown(body);
  const greeting = userName && userName.trim() ? escapeHtml(userName.trim()) : 'there';
  const hasCta = ctaText && ctaUrl && /^https?:\/\//i.test(ctaUrl);
  const safeCtaText = hasCta ? escapeHtml(ctaText!) : '';
  const safeCtaUrl = hasCta ? ctaUrl! : '';
  const hasTip = tip && tip.trim().length > 0;
  const safeTip = hasTip ? escapeHtml(tip!.trim()) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>${safeTitle} - SleepyBabyy</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; max-width: 100%; }
  a { text-decoration: none; }
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; padding: 12px !important; max-width: 100% !important; }
    .hero-card { padding: 28px 20px !important; }
    .headline { font-size: 24px !important; line-height: 32px !important; }
    .cta-btn { padding: 14px 32px !important; font-size: 15px !important; }
  }
  * { box-sizing: border-box; }
  table { table-layout: fixed; max-width: 100%; }
  td, p, h1, h2, span, div {
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF7F2;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="max-width:600px;width:100%;table-layout:fixed;">

        <!-- Header with Logo -->
        <tr>
          <td style="padding:24px 32px;">
            <img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="200" style="display:block;max-width:200px;width:200px;height:auto;border:0;">
          </td>
        </tr>

        <!-- Hero Card -->
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFFFFF;border-radius:20px;box-shadow:0 4px 20px rgba(124,58,237,0.08);">
              <tr>
                <td align="center" class="hero-card" style="padding:40px 40px 32px 40px;">
                  <div style="font-size:56px;line-height:1;margin-bottom:16px;">📰</div>
                  <p style="margin:0 0 12px 0;font-size:13px;font-weight:600;letter-spacing:1.5px;color:#7C3AED;text-transform:uppercase;">
                    ✦ SleepyBabyy Newsletter
                  </p>
                  <h1 class="headline" style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:38px;color:#1F2937;letter-spacing:-0.5px;">
                    ${safeTitle}
                  </h1>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#6B7280;font-weight:400;">
                    ${safeSubtitle}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:0 32px;">
            <p style="margin:0 0 16px 0;font-size:18px;line-height:26px;color:#1F2937;font-weight:600;">
              Hi ${greeting}! 👋
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:0 32px;">
            ${bodyHtml}
          </td>
        </tr>

        ${hasTip ? `
        <!-- Quick Tip -->
        <tr>
          <td style="padding:8px 32px 24px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:linear-gradient(135deg,#FEF3FF 0%,#F3E8FF 100%);border-radius:14px;border-left:4px solid #7C3AED;">
              <tr>
                <td style="padding:18px 22px;">
                  <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#7C3AED;letter-spacing:0.5px;">
                    💡 QUICK TIP
                  </p>
                  <p style="margin:0;font-size:15px;line-height:24px;color:#4B5563;font-style:italic;">
                    "${safeTip}"
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        ${hasCta ? `
        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding:8px 32px 32px 32px;text-align:center;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeCtaUrl}" style="height:64px;v-text-anchor:middle;width:300px;" arcsize="50%" stroke="f" fillcolor="#793BED">
              <w:anchorlock/>
              <center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;">${safeCtaText}</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td align="center" style="text-align:center;">
                  <a href="${safeCtaUrl}" style="background-color:#793BED;background:#793BED;background-image:linear-gradient(135deg,#793BED 0%,#9B27B0 50%,#EC4699 100%);border-radius:100px;color:#FFFFFF;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;line-height:64px;text-align:center;text-decoration:none;width:300px;-webkit-text-size-adjust:none;mso-hide:all;box-shadow:0 10px 30px rgba(121,59,237,0.4);">${safeCtaText} &rarr;</a>
                </td>
              </tr>
            </table>
            <!--<![endif]-->
          </td>
        </tr>
        ` : ''}

        <!-- Divider -->
        <tr>
          <td style="padding:0 32px;">
            <div style="height:1px;background:linear-gradient(90deg,transparent,#E5E7EB,transparent);"></div>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="padding:24px 32px;">
            <p style="margin:0;font-size:16px;line-height:24px;color:#1F2937;">
              Sweet dreams 🌙<br>
              <strong style="color:#7C3AED;">The SleepyBabyy Team</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:24px 32px 32px 32px;">
            <a href="https://www.facebook.com/share/17HFMh4CNE/?mibextid=LQQJ4d" style="text-decoration:none;display:inline-block;margin-bottom:20px;">
              <div style="width:40px;height:40px;background:#1E3A8A;border-radius:50%;text-align:center;line-height:40px;color:#FFFFFF;font-size:18px;font-weight:700;">f</div>
            </a>
            <p style="margin:0 0 12px 0;font-size:13px;line-height:20px;color:#6B7280;">
              <a href="https://sleepybabyy.com/help" style="color:#6B7280;text-decoration:none;">Help</a>
              <span style="color:#D1D5DB;margin:0 8px;">·</span>
              <a href="https://sleepybabyy.com/privacy" style="color:#6B7280;text-decoration:none;">Privacy</a>
              <span style="color:#D1D5DB;margin:0 8px;">·</span>
              <a href="${unsubscribeUrl}" style="color:#6B7280;text-decoration:underline;">Unsubscribe</a>
            </p>
            <p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;">
              <a href="https://sleepybabyy.com" style="color:#7C3AED;text-decoration:none;font-weight:600;">🌙 sleepybabyy.com</a>
            </p>
            <p style="margin:0;font-size:11px;color:#9CA3AF;">
              © 2026 SleepyBabyy. All rights reserved.<br>
              You're receiving this because you subscribed to SleepyBabyy updates.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { data: { user }, error: authErr } = await supabase.auth.getUser(auth.substring(7));
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { subject, body, test_email, cta_text, cta_url, subtitle, tip } = await req.json();
    if (!subject || !body || typeof subject !== 'string' || typeof body !== 'string') {
      return new Response(JSON.stringify({ error: 'subject and body required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (subject.length > 200 || body.length > 50000) {
      return new Response(JSON.stringify({ error: 'Content too long' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ctaText = typeof cta_text === 'string' ? cta_text.slice(0, 50) : undefined;
    const ctaUrl = typeof cta_url === 'string' ? cta_url.slice(0, 500) : undefined;
    const subtitleStr = typeof subtitle === 'string' ? subtitle.slice(0, 200) : undefined;
    const tipStr = typeof tip === 'string' ? tip.slice(0, 500) : undefined;

    // Helper: lookup name from profiles by email
    async function getName(email: string): Promise<string | undefined> {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('email', email)
        .maybeSingle();
      const full = data?.full_name?.trim();
      if (!full) return undefined;
      // Use first name only for friendlier greeting
      return full.split(/\s+/)[0];
    }

    // Test send
    if (test_email) {
      const unsubUrl = `https://sleepybabyy.com/unsubscribe?token=test-token`;
      const userName = await getName(test_email);
      const html = buildNewsletterEmail({ title: subject, subtitle: subtitleStr, body, tip: tipStr, ctaText, ctaUrl, userName, unsubscribeUrl: unsubUrl });
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'SleepyBabyy <support@sleepybabyy.com>',
          to: [test_email],
          reply_to: 'support@sleepybabyy.com',
          subject: `[TEST] ${subject}`,
          headers: {
            'List-Unsubscribe': `<${unsubUrl}>, <mailto:support@sleepybabyy.com?subject=unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          html,
        }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        return new Response(JSON.stringify({ error: 'Send failed', detail: t }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ success: true, test: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Broadcast
    const { data: subs, error: subsErr } = await supabase
      .from('newsletter_subscribers')
      .select('email, unsubscribe_token')
      .eq('status', 'active');
    if (subsErr) throw subsErr;

    let sent = 0;
    let failed = 0;
    for (const sub of subs || []) {
      try {
        const unsubUrl = `https://sleepybabyy.com/unsubscribe?token=${sub.unsubscribe_token}`;
        const userName = await getName(sub.email);
        const html = buildNewsletterEmail({ title: subject, subtitle: subtitleStr, body, tip: tipStr, ctaText, ctaUrl, userName, unsubscribeUrl: unsubUrl });
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'SleepyBabyy <support@sleepybabyy.com>',
            to: [sub.email],
            reply_to: 'support@sleepybabyy.com',
            subject,
            headers: {
              'List-Unsubscribe': `<${unsubUrl}>, <mailto:support@sleepybabyy.com?subject=unsubscribe>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
            html,
          }),
        });
        if (resp.ok) sent++; else failed++;
        await new Promise(r => setTimeout(r, 120));
      } catch {
        failed++;
      }
    }

    return new Response(JSON.stringify({ success: true, sent, failed, total: (subs || []).length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    console.error('newsletter broadcast error:', msg, stack);
    return new Response(JSON.stringify({ error: 'Internal error', detail: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

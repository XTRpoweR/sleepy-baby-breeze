import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildEmail(subject: string, bodyText: string, unsubscribeToken: string): string {
  const safeBody = escapeHtml(bodyText).replace(/\n/g, '<br>');
  const unsubUrl = `https://sleepybabyy.com/unsubscribe?token=${unsubscribeToken}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" style="max-width:600px;width:100%;background:#fff;border-radius:20px;box-shadow:0 4px 20px rgba(124,58,237,0.08);">
<tr><td style="padding:32px;"><img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="180" style="display:block;max-width:180px;"></td></tr>
<tr><td style="padding:0 32px 32px 32px;">
<h1 style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:26px;color:#1F2937;">${escapeHtml(subject)}</h1>
<div style="font-size:15px;line-height:25px;color:#374151;">${safeBody}</div>
</td></tr>
<tr><td align="center" style="padding:24px 32px 32px 32px;border-top:1px solid #F3F4F6;">
<p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;">
<a href="https://sleepybabyy.com" style="color:#7C3AED;text-decoration:none;font-weight:600;">🌙 sleepybabyy.com</a>
</p>
<p style="margin:0 0 8px 0;font-size:11px;color:#9CA3AF;">
<a href="${unsubUrl}" style="color:#9CA3AF;text-decoration:underline;">Unsubscribe</a>
</p>
<p style="margin:0;font-size:11px;color:#9CA3AF;">© 2026 SleepyBabyy</p>
</td></tr>
</table></td></tr></table></body></html>`;
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

    const { subject, body, test_email } = await req.json();
    if (!subject || !body || typeof subject !== 'string' || typeof body !== 'string') {
      return new Response(JSON.stringify({ error: 'subject and body required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (subject.length > 200 || body.length > 50000) {
      return new Response(JSON.stringify({ error: 'Content too long' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Test send: just send to single email
    if (test_email) {
      const html = buildEmail(subject, body, 'test-token');
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'SleepyBabyy <support@sleepybabyy.com>',
          to: [test_email],
          subject: `[TEST] ${subject}`,
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
    // Send in small batches to avoid overwhelming Resend (rate limit ~10/sec on free)
    for (const sub of subs || []) {
      try {
        const html = buildEmail(subject, body, sub.unsubscribe_token);
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'SleepyBabyy <support@sleepybabyy.com>',
            to: [sub.email],
            subject,
            html,
          }),
        });
        if (resp.ok) sent++; else failed++;
        // Throttle slightly
        await new Promise(r => setTimeout(r, 120));
      } catch {
        failed++;
      }
    }

    return new Response(JSON.stringify({ success: true, sent, failed, total: (subs || []).length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('newsletter broadcast error', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

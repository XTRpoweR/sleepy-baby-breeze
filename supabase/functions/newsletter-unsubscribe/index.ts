import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = "support@sleepybabyy.com";

const adminUnsubHtml = (email: string, lang: string, method: string, ip: string, ua: string) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 12px;font-size:18px;">👋 Newsletter unsubscribe</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="color:#64748b;width:120px;">Email</td><td><strong>${email}</strong></td></tr>
      <tr><td style="color:#64748b;">Method</td><td>${method}</td></tr>
      <tr><td style="color:#64748b;">Language</td><td>${lang}</td></tr>
      <tr><td style="color:#64748b;">IP</td><td>${ip}</td></tr>
      <tr><td style="color:#64748b;">User agent</td><td style="word-break:break-all;">${ua}</td></tr>
      <tr><td style="color:#64748b;">Time (UTC)</td><td>${new Date().toISOString()}</td></tr>
    </table>
  </div>
</body></html>`;

const successPageHtml = (alreadyUnsubscribed: boolean) => `
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Unsubscribed - SleepyBabyy</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#0f172a;">
  <div style="max-width:480px;margin:48px auto;background:#fff;border-radius:16px;padding:32px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
    <div style="width:64px;height:64px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;">${alreadyUnsubscribed ? 'Already unsubscribed' : 'Unsubscribed successfully'}</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.5;">You will no longer receive the SleepyBabyy newsletter at this email.</p>
    <a href="https://sleepybabyy.com" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;font-size:14px;">← Back to SleepyBabyy</a>
  </div>
</body></html>`;

async function processUnsubscribe(token: string | null, email: string | null, method: string, ip: string, ua: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let subscriberEmail: string | null = null;
  let subscriberLang = 'en';
  let alreadyUnsubscribed = false;

  if (token) {
    const { data: row } = await supabase
      .from('newsletter_subscribers')
      .select('email, language, status')
      .eq('unsubscribe_token', token)
      .maybeSingle();
    if (row) {
      subscriberEmail = row.email;
      subscriberLang = row.language || 'en';
      alreadyUnsubscribed = row.status === 'unsubscribed';
    }
  } else if (email) {
    const sanitized = email.toLowerCase().trim();
    const { data: row } = await supabase
      .from('newsletter_subscribers')
      .select('email, language, status')
      .eq('email', sanitized)
      .maybeSingle();
    if (row) {
      subscriberEmail = row.email;
      subscriberLang = row.language || 'en';
      alreadyUnsubscribed = row.status === 'unsubscribed';
    } else {
      // Treat as success for privacy/UX — don't reveal whether email is on list
      return { ok: true, found: false, alreadyUnsubscribed: false, email: sanitized };
    }
  }

  if (!subscriberEmail) {
    return { ok: false, found: false, alreadyUnsubscribed: false, email: null };
  }

  if (!alreadyUnsubscribed) {
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
      .eq('email', subscriberEmail);
    if (updateError) {
      console.error('Failed to update subscriber:', updateError);
      return { ok: false, found: true, alreadyUnsubscribed: false, email: subscriberEmail };
    }

    // Send admin notification
    try {
      const adminResult = await resend.emails.send({
        from: "SleepyBabyy Alerts <noreply@sleepybabyy.com>",
        to: [ADMIN_EMAIL],
        subject: `👋 Newsletter unsubscribe: ${subscriberEmail}`,
        html: adminUnsubHtml(subscriberEmail, subscriberLang, method, ip, ua),
      });
      console.log('Admin unsubscribe notification sent:', JSON.stringify(adminResult));
    } catch (adminErr) {
      console.error('Failed to send admin unsubscribe notification:', adminErr);
    }
  } else {
    console.log(`Subscriber ${subscriberEmail} was already unsubscribed; skipping admin notification.`);
  }

  return { ok: true, found: true, alreadyUnsubscribed, email: subscriberEmail };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    let token: string | null = null;
    let email: string | null = null;
    let method = 'post';
    let returnHtml = false;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      token = url.searchParams.get('token');
      email = url.searchParams.get('email');
      method = 'get-link';
      returnHtml = true;
    } else if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await req.json().catch(() => ({}));
        token = body.token ?? null;
        email = body.email ?? null;
        method = body.method || 'post';
      } else {
        // List-Unsubscribe-Post one-click (form-encoded)
        const text = await req.text();
        const params = new URLSearchParams(text);
        const url = new URL(req.url);
        token = url.searchParams.get('token') ?? params.get('token');
        email = url.searchParams.get('email') ?? params.get('email');
        method = 'one-click';
      }
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!token && !email) {
      if (returnHtml) {
        return new Response(successPageHtml(false), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      return new Response(JSON.stringify({ error: 'Missing token or email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await processUnsubscribe(token, email, method, clientIP, userAgent);

    if (returnHtml) {
      return new Response(successPageHtml(result.alreadyUnsubscribed), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (!result.ok) {
      return new Response(JSON.stringify({ error: 'Invalid or expired unsubscribe link' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      alreadyUnsubscribed: result.alreadyUnsubscribed,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in newsletter-unsubscribe function:', error);
    return new Response(JSON.stringify({ error: 'Failed to unsubscribe. Please try again.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);

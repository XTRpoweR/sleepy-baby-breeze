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

const successPageHtml = (email: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>Unsubscribed - SleepyBabyy</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#f8fafc; margin:0; padding:24px; min-height:100vh; display:flex; align-items:center; justify-content:center; color:#0f172a; }
  .card { max-width:480px; width:100%; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:40px 28px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.04); }
  .icon { width:64px; height:64px; border-radius:50%; background:#dcfce7; margin:0 auto 20px; display:flex; align-items:center; justify-content:center; }
  h1 { font-size:22px; margin:0 0 12px; }
  p { color:#64748b; line-height:1.5; margin:0 0 8px; }
  .email { color:#0f172a; font-weight:600; }
  a { color:#3b82f6; text-decoration:none; font-size:14px; display:inline-block; margin-top:24px; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
    <h1>You've been unsubscribed</h1>
    <p><span class="email">${email}</span> will no longer receive SleepyBabyy newsletter emails.</p>
    <p style="font-size:13px;margin-top:16px;">Changed your mind? You can resubscribe anytime on our site.</p>
    <a href="https://sleepybabyy.com">← Back to SleepyBabyy</a>
  </div>
</body>
</html>`;

const errorPageHtml = (message: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>Unsubscribe - SleepyBabyy</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#f8fafc; margin:0; padding:24px; min-height:100vh; display:flex; align-items:center; justify-content:center; color:#0f172a; }
  .card { max-width:480px; width:100%; background:#fff; border:1px solid #fecaca; border-radius:16px; padding:40px 28px; text-align:center; }
  h1 { font-size:20px; margin:0 0 12px; }
  p { color:#64748b; line-height:1.5; }
  a { color:#3b82f6; text-decoration:none; font-size:14px; display:inline-block; margin-top:20px; }
</style>
</head>
<body>
  <div class="card">
    <h1>Unable to unsubscribe</h1>
    <p>${message}</p>
    <p style="font-size:13px;">Need help? Email <a href="mailto:support@sleepybabyy.com" style="margin:0;">support@sleepybabyy.com</a></p>
    <a href="https://sleepybabyy.com">← Back to SleepyBabyy</a>
  </div>
</body>
</html>`;

interface UnsubInput {
  token?: string;
  email?: string;
  acceptsHtml: boolean;
  ip: string;
  ua: string;
}

async function processUnsubscribe(input: UnsubInput): Promise<{ status: number; body: string; contentType: string; alreadyUnsubscribed?: boolean; subscriberEmail?: string; }> {
  const { token, email, acceptsHtml, ip, ua } = input;

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
    }
  }

  if (!subscriberEmail) {
    if (acceptsHtml) {
      return { status: 404, body: errorPageHtml('This unsubscribe link is invalid or has expired.'), contentType: 'text/html; charset=utf-8' };
    }
    return { status: 404, body: JSON.stringify({ error: 'Invalid or expired unsubscribe link' }), contentType: 'application/json' };
  }

  if (alreadyUnsubscribed) {
    if (acceptsHtml) {
      return { status: 200, body: successPageHtml(subscriberEmail), contentType: 'text/html; charset=utf-8', alreadyUnsubscribed: true, subscriberEmail };
    }
    return { status: 200, body: JSON.stringify({ success: true, alreadyUnsubscribed: true }), contentType: 'application/json', alreadyUnsubscribed: true, subscriberEmail };
  }

  // Perform unsubscribe
  const { error: updateError } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .eq('email', subscriberEmail);

  if (updateError) {
    console.error('DB update failed:', updateError);
    if (acceptsHtml) {
      return { status: 500, body: errorPageHtml('Something went wrong. Please try again or contact support.'), contentType: 'text/html; charset=utf-8' };
    }
    return { status: 500, body: JSON.stringify({ error: 'Failed to unsubscribe' }), contentType: 'application/json' };
  }

  // Notify admin (non-blocking)
  try {
    const adminResult = await resend.emails.send({
      from: "SleepyBabyy Alerts <noreply@sleepybabyy.com>",
      to: [ADMIN_EMAIL],
      subject: `👋 Newsletter unsubscribe: ${subscriberEmail}`,
      html: adminUnsubHtml(subscriberEmail, subscriberLang, token ? 'token' : 'email', ip, ua),
    });
    console.log('Admin unsubscribe notification sent:', JSON.stringify(adminResult));
  } catch (adminErr) {
    console.error('Failed to send admin unsubscribe notification:', adminErr);
  }

  if (acceptsHtml) {
    return { status: 200, body: successPageHtml(subscriberEmail), contentType: 'text/html; charset=utf-8', subscriberEmail };
  }
  return { status: 200, body: JSON.stringify({ success: true }), contentType: 'application/json', subscriberEmail };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  const ua = req.headers.get('user-agent') || 'unknown';
  const accept = req.headers.get('accept') || '';
  const acceptsHtml = accept.includes('text/html');

  try {
    let token: string | undefined;
    let email: string | undefined;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      token = url.searchParams.get('token') || undefined;
      email = url.searchParams.get('email') || undefined;
    } else if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await req.json();
        token = body.token;
        email = body.email;
      } else {
        // application/x-www-form-urlencoded (Gmail One-Click)
        const text = await req.text();
        const params = new URLSearchParams(text);
        token = params.get('token') || undefined;
        email = params.get('email') || undefined;
        // Also check URL params for One-Click
        const url = new URL(req.url);
        token = token || url.searchParams.get('token') || undefined;
        email = email || url.searchParams.get('email') || undefined;
      }
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!token && !email) {
      const body = acceptsHtml
        ? errorPageHtml('Missing unsubscribe token or email address.')
        : JSON.stringify({ error: 'Missing token or email' });
      return new Response(body, {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': acceptsHtml ? 'text/html; charset=utf-8' : 'application/json' },
      });
    }

    const result = await processUnsubscribe({ token, email, acceptsHtml, ip, ua });
    return new Response(result.body, {
      status: result.status,
      headers: { ...corsHeaders, 'Content-Type': result.contentType },
    });
  } catch (error: any) {
    console.error('Error in newsletter-unsubscribe function:', error);
    const body = acceptsHtml
      ? errorPageHtml('Something went wrong. Please try again.')
      : JSON.stringify({ error: 'Failed to unsubscribe. Please try again.' });
    return new Response(body, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': acceptsHtml ? 'text/html; charset=utf-8' : 'application/json' },
    });
  }
};

serve(handler);

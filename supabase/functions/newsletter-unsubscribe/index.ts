import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = "support@sleepybabyy.com";

interface UnsubReq {
  token?: string;
  email?: string;
}

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

    const { token, email }: UnsubReq = await req.json();
    if (!token && !email) {
      return new Response(JSON.stringify({ error: 'Missing token or email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Look up the subscriber to get email + language for the admin notification
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
      return new Response(JSON.stringify({ error: 'Invalid or expired unsubscribe link' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (alreadyUnsubscribed) {
      return new Response(JSON.stringify({ success: true, alreadyUnsubscribed: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Perform the unsubscribe
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
      .eq('email', subscriberEmail);

    if (updateError) throw updateError;

    // Notify admin (non-blocking)
    try {
      await resend.emails.send({
        from: "SleepyBabyy Alerts <noreply@sleepybabyy.com>",
        to: [ADMIN_EMAIL],
        subject: `👋 Newsletter unsubscribe: ${subscriberEmail}`,
        html: adminUnsubHtml(subscriberEmail, subscriberLang, token ? 'token' : 'email', clientIP, userAgent),
      });
    } catch (adminErr) {
      console.error('Failed to send admin unsubscribe notification:', adminErr);
    }

    return new Response(JSON.stringify({ success: true }), {
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

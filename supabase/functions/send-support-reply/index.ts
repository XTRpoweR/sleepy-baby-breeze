import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildReplyEmail(params: {
  recipientName: string;
  replyMessage: string;
  originalSubject: string;
}): string {
  const safeMessage = escapeHtml(params.replyMessage).replace(/\n/g, '<br>');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reply from SleepyBabyy Support</title>
<style>
  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
  table, td { border-collapse: collapse; }
  img { border: 0; max-width: 100%; }
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; padding: 12px !important; }
    .hero-card { padding: 28px 20px !important; }
    .headline { font-size: 24px !important; line-height: 32px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF7F2;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:24px 32px;">
            <img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="200" style="display:block;max-width:200px;">
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <table role="presentation" width="100%" style="background:#FFFFFF;border-radius:20px;box-shadow:0 4px 20px rgba(124,58,237,0.08);">
              <tr>
                <td align="center" class="hero-card" style="padding:40px;">
                  <div style="font-size:56px;line-height:1;margin-bottom:20px;">🤝</div>
                  <h1 class="headline" style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:38px;color:#1F2937;">
                    A reply from our team
                  </h1>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#6B7280;">
                    Re: ${escapeHtml(params.originalSubject)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;">
            <p style="margin:0 0 20px 0;font-size:16px;line-height:26px;color:#1F2937;">
              Hi ${escapeHtml(params.recipientName)} 👋
            </p>
            <table role="presentation" width="100%" style="margin:16px 0;background:linear-gradient(135deg,#FBCFE8 0%,#C4B5FD 100%);border-radius:16px;">
              <tr>
                <td style="padding:24px;">
                  <p style="margin:0;font-size:15px;line-height:24px;color:#1F2937;">${safeMessage}</p>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0 0;font-size:14px;line-height:22px;color:#6B7280;">
              💬 <strong>Reply directly to this email</strong> if you need anything else — we're here to help.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;">
            <p style="margin:0;font-size:16px;line-height:24px;color:#1F2937;">
              Sweet dreams 🌙<br>
              <strong style="color:#7C3AED;">The SleepyBabyy Support Team</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 32px 32px 32px;">
            <a href="https://www.facebook.com/share/17HFMh4CNE/?mibextid=LQQJ4d" style="text-decoration:none;display:inline-block;margin-bottom:20px;">
              <div style="width:40px;height:40px;background:#1E3A8A;border-radius:50%;text-align:center;line-height:40px;color:#FFFFFF;font-size:18px;font-weight:700;">f</div>
            </a>
            <p style="margin:0 0 12px 0;font-size:13px;line-height:20px;color:#6B7280;">
              <a href="https://sleepybabyy.com/help" style="color:#6B7280;text-decoration:none;">Help</a>
              <span style="color:#D1D5DB;margin:0 8px;">·</span>
              <a href="https://sleepybabyy.com/privacy" style="color:#6B7280;text-decoration:none;">Privacy</a>
            </p>
            <p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;">
              <a href="https://sleepybabyy.com" style="color:#7C3AED;text-decoration:none;font-weight:600;">🌙 sleepybabyy.com</a>
            </p>
            <p style="margin:0;font-size:11px;color:#9CA3AF;">
              © 2026 SleepyBabyy. All rights reserved.
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    console.log('[send-support-reply] Request received');
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[send-support-reply] Missing auth header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('[send-support-reply] Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log('[send-support-reply] Authenticated user:', user.id);

    // Verify admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) console.error('[send-support-reply] Profile error:', profileError);
    if (!profile?.is_admin) {
      console.error('[send-support-reply] Not admin. profile=', profile);
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { thread_id, recipient_email, recipient_name, subject, reply_message, original_message_id } = body;

    if (!thread_id || !recipient_email || !subject || !reply_message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient_email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
    const html = buildReplyEmail({
      recipientName: recipient_name || 'there',
      replyMessage: reply_message,
      originalSubject: subject,
    });
    const plainText = `Hi ${recipient_name || 'there'},\n\n${reply_message}\n\n— The SleepyBabyy Support Team\nhttps://sleepybabyy.com`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SleepyBabyy Support <support@sleepybabyy.com>',
        to: [recipient_email],
        reply_to: 'support@sleepybabyy.com',
        subject: replySubject,
        text: plainText,
        html,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Resend error:', resp.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const result = await resp.json();

    // Save outbound message
    await supabase.from('contact_messages').insert({
      thread_id,
      direction: 'outbound',
      sender_name: 'SleepyBabyy Support',
      sender_email: 'support@sleepybabyy.com',
      subject: replySubject,
      message_body: reply_message,
      status: 'replied',
      replied_by: user.id,
      parent_message_id: original_message_id || null,
      resend_email_id: result.id || null,
    });

    // Mark inbound message as replied
    if (original_message_id) {
      await supabase
        .from('contact_messages')
        .update({ status: 'replied', replied_by: user.id })
        .eq('id', original_message_id);
    }

    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-support-reply:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

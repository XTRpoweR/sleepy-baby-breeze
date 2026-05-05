import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Security-Policy': 'default-src \'self\'',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

const jsonResponse = (body: Record<string, unknown>, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

// Rate limiting store
const rateLimitStore = new Map();

function checkRateLimit(key: string, limit: number = 10, windowMs: number = 300000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  const requests = rateLimitStore.get(key).filter((time: number) => time > windowStart);
  if (requests.length >= limit) {
    return false;
  }
  requests.push(now);
  rateLimitStore.set(key, requests);
  return true;
}

function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 500);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    const allowedKeys = ['invitationId', 'email', 'babyName', 'inviterName', 'role', 'invitationToken'];
    for (const key of Object.keys(input)) {
      if (allowedKeys.includes(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  return input;
}

// NEW: Build the branded HTML email using SleepyBabyy template
function buildInvitationEmail(params: {
  inviterName: string;
  babyName: string;
  role: string;
  invitationLink: string;
}): string {
  const { inviterName, babyName, role, invitationLink } = params;
  const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1);
  const roleAction = role === 'caregiver' ? 'add and edit activities' : 'view all activities';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>Family Invitation - SleepyBabyy</title>
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
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="middle">
                  <img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="200" style="display:block;max-width:200px;width:200px;height:auto;border:0;">
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Hero Card -->
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFFFFF;border-radius:20px;box-shadow:0 4px 20px rgba(124,58,237,0.08);">
              <tr>
                <td align="center" class="hero-card" style="padding:40px 40px 32px 40px;">
                  <div style="font-size:56px;line-height:1;margin-bottom:20px;">👨‍👩‍👧</div>
                  <h1 class="headline" style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:38px;color:#1F2937;letter-spacing:-0.5px;">
                    You're invited to join the family!
                  </h1>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#6B7280;font-weight:400;">
                    ${inviterName} invited you to follow ${babyName}'s journey on SleepyBabyy
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Content -->
        <tr>
          <td style="padding:0 32px;">
            <p style="margin:0 0 20px 0;font-size:16px;line-height:26px;color:#1F2937;">
              Hi there! 👋
            </p>
            <p style="margin:0 0 20px 0;font-size:16px;line-height:26px;color:#1F2937;">
              <strong style="color:#7C3AED;">${inviterName}</strong> has invited you to be a part of <strong>${babyName}'s</strong> family on SleepyBabyy.
            </p>
            
            <!-- Role Badge -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;">
              <tr>
                <td style="background:linear-gradient(135deg,#FBCFE8 0%,#C4B5FD 100%);border-radius:16px;padding:24px;">
                  <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#7C3AED;text-transform:uppercase;letter-spacing:1.5px;">
                    ✦ Your role
                  </p>
                  <p style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#1E3A8A;">
                    ${roleCapitalized}
                  </p>
                  <p style="margin:0;font-size:14px;line-height:22px;color:#1F2937;">
                    As a ${role}, you'll be able to ${roleAction} for ${babyName}.
                  </p>
                </td>
              </tr>
            </table>
            
            <p style="margin:24px 0;font-size:16px;line-height:26px;color:#1F2937;">
              Accept the invitation below to start tracking sleep, feedings, and precious moments together. 🌙
            </p>
          </td>
        </tr>
        
        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding:8px 32px 32px 32px;text-align:center;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${invitationLink}" style="height:64px;v-text-anchor:middle;width:300px;" arcsize="50%" stroke="f" fillcolor="#793BED">
              <w:anchorlock/>
              <center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;">Accept Invitation</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td align="center" style="text-align:center;">
                  <a href="${invitationLink}" style="background-color:#793BED;background:#793BED;background-image:linear-gradient(135deg,#793BED 0%,#9B27B0 50%,#EC4699 100%);border-radius:100px;color:#FFFFFF;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;line-height:64px;text-align:center;text-decoration:none;width:300px;-webkit-text-size-adjust:none;mso-hide:all;box-shadow:0 10px 30px rgba(121,59,237,0.4);">Accept Invitation &rarr;</a>
                </td>
              </tr>
            </table>
            <!--<![endif]-->
            <p style="margin:16px 0 0 0;font-size:13px;color:#6B7280;">
              This invitation will expire in 7 days
            </p>
          </td>
        </tr>
        
        <!-- Backup Link -->
        <tr>
          <td style="padding:0 32px 24px 32px;">
            <p style="margin:0 0 8px 0;font-size:13px;color:#6B7280;">
              Button not working? Copy this link:
            </p>
            <p style="margin:0;font-size:12px;line-height:18px;color:#7C3AED;background:#F3F4F6;padding:12px;border-radius:8px;word-break:break-all;">
              ${invitationLink}
            </p>
          </td>
        </tr>
        
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
            </p>
            <p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;">
              <a href="https://sleepybabyy.com" style="color:#7C3AED;text-decoration:none;font-weight:600;">🌙 sleepybabyy.com</a>
            </p>
            <p style="margin:0;font-size:11px;color:#9CA3AF;">
              © 2026 SleepyBabyy. All rights reserved.<br>
              If you didn't expect this invitation, you can safely ignore this email.
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
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return jsonResponse({ success: false, error: 'Rate limit exceeded' }, 429);
    }
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return jsonResponse({ success: false, error: 'Email service is not configured' }, 500);
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Get and validate user
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return jsonResponse({ success: false, error: 'Invalid token' }, 401);
    }
    // Parse and sanitize request body
    let body;
    try {
      const rawBody = await req.text();
      if (!rawBody || rawBody.length > 5000) {
        throw new Error('Invalid request body size');
      }
      body = sanitizeInput(JSON.parse(rawBody));
    } catch (error) {
      return jsonResponse({ success: false, error: 'Invalid request body' }, 400);
    }
    const { invitationId, email, babyName, inviterName, role, invitationToken } = body;
    // Validate required fields
    if (!invitationId || !email || !babyName || !inviterName || !role || !invitationToken) {
      return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse({ success: false, error: 'Invalid email format' }, 400);
    }
    // Verify the invitation exists and belongs to the user
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('invited_by', user.id)
      .eq('status', 'pending')
      .single();
    if (invitationError || !invitation) {
      return jsonResponse({ success: false, error: 'Invitation not found or unauthorized' }, 404);
    }
    // Create invitation link
    const baseUrl = 'https://sleepybabyy.com';
    const invitationLink = `${baseUrl}/invitation?token=${invitationToken}`;
    // Plain-text fallback (improves deliverability significantly)
    const plainText = `Hi there! ${inviterName} has invited you to join ${babyName}'s family on SleepyBabyy as a ${role}. Accept the invitation here: ${invitationLink} This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email. Questions? Email support@sleepybabyy.com — The SleepyBabyy Team`;
    // Build branded HTML
    const html = buildInvitationEmail({ inviterName, babyName, role, invitationLink });
    // Send email using Resend
    const emailData = {
      from: 'SleepyBabyy <invitations@sleepybabyy.com>',
      to: [email],
      reply_to: 'support@sleepybabyy.com',
      subject: `${inviterName} invited you to ${babyName}'s family on SleepyBabyy`,
      headers: {
        'List-Unsubscribe': '<mailto:support@sleepybabyy.com?subject=unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Entity-Ref-ID': invitationId,
      },
      text: plainText,
      html: html
    };
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email:', response.status, errorText);
      return jsonResponse({
        success: false,
        error: 'Email provider rejected the invitation email',
        details: errorText,
      }, 502);
    }
    const result = await response.json();
    console.log('Email sent successfully:', result.id);
    return jsonResponse({ success: true, emailId: result.id });
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return jsonResponse({ success: false, error: error?.message || 'Failed to send invitation email' }, 500);
  }
});

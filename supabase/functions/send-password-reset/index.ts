import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

// Build branded password reset email matching SleepyBabyy design
function buildPasswordResetEmail(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>Reset Your Password - SleepyBabyy</title>
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
                  <div style="font-size:56px;line-height:1;margin-bottom:20px;">🔒</div>
                  <h1 class="headline" style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:38px;color:#1F2937;letter-spacing:-0.5px;">
                    Reset your password
                  </h1>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#6B7280;font-weight:400;">
                    We received a request to reset your password
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
              You recently requested to reset your password for your <strong style="color:#7C3AED;">SleepyBabyy</strong> account. Click the button below to choose a new one.
            </p>
            <p style="margin:24px 0;font-size:16px;line-height:26px;color:#1F2937;">
              For your security, this link will expire in <strong>1 hour</strong>. ⏰
            </p>
          </td>
        </tr>
        
        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding:8px 32px 32px 32px;text-align:center;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:64px;v-text-anchor:middle;width:300px;" arcsize="50%" stroke="f" fillcolor="#793BED">
              <w:anchorlock/>
              <center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;">Reset Password</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td align="center" style="text-align:center;">
                  <a href="${resetUrl}" style="background-color:#793BED;background:#793BED;background-image:linear-gradient(135deg,#793BED 0%,#9B27B0 50%,#EC4699 100%);border-radius:100px;color:#FFFFFF;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;line-height:64px;text-align:center;text-decoration:none;width:300px;-webkit-text-size-adjust:none;mso-hide:all;box-shadow:0 10px 30px rgba(121,59,237,0.4);">Reset Password &rarr;</a>
                </td>
              </tr>
            </table>
            <!--<![endif]-->
            <p style="margin:16px 0 0 0;font-size:13px;color:#6B7280;">
              This link expires in 1 hour
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
              ${resetUrl}
            </p>
          </td>
        </tr>
        
        <!-- Divider -->
        <tr>
          <td style="padding:0 32px;">
            <div style="height:1px;background:linear-gradient(90deg,transparent,#E5E7EB,transparent);"></div>
          </td>
        </tr>
        
        <!-- Security Notice -->
        <tr>
          <td style="padding:24px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FEF3C7;border-radius:12px;padding:16px;">
              <tr>
                <td style="padding:16px;">
                  <p style="margin:0;font-size:14px;line-height:22px;color:#92400E;">
                    🛡️ <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't change unless you click the button above.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Signature -->
        <tr>
          <td style="padding:0 32px 24px 32px;">
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
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Password reset request received')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, redirectTo } = await req.json()
    console.log('Processing password reset for email:', email)

    if (!email) {
      console.error('No email provided')
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user exists first
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error checking user:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to process request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userExists = userData.users.some(user => user.email === email)
    
    if (!userExists) {
      console.log('User not found for email:', email)
      // Still return success to avoid email enumeration
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If an account with this email exists, you will receive reset instructions.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate secure reset token - always ensure /reset-password path
    let resetRedirectUrl = redirectTo || 'https://www.sleepybabyy.com/reset-password'
    
    // Ensure the URL always ends with /reset-password
    if (resetRedirectUrl && !resetRedirectUrl.includes('/reset-password')) {
      resetRedirectUrl = resetRedirectUrl.replace(/\/$/, '') + '/reset-password'
    }

    console.log('Using redirect URL:', resetRedirectUrl)

    const { data, error } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: resetRedirectUrl
      }
    })

    if (error) {
      console.error('Error generating reset link:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resetUrl = data.properties?.action_link
    console.log('Generated reset URL:', resetUrl)

    if (!resetUrl) {
      console.error('No action link generated')
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send branded password reset email
    console.log('Sending password reset email to:', email)
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'SleepyBabyy <noreply@sleepybabyy.com>',
      to: [email],
      subject: 'Reset your SleepyBabyy password',
      html: buildPasswordResetEmail(resetUrl),
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return new Response(
        JSON.stringify({ error: 'Failed to send reset email', details: emailError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully',
        emailId: emailData?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in password reset function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Build branded verification code email
function buildVerificationEmail(verificationCode: string, babyName: string, inviterName: string): string {
  // Split code into individual digits for nice display
  const digits = verificationCode.split('');
  const digitsHTML = digits.map(d => 
    `<span style="display:inline-block;width:48px;height:60px;line-height:60px;margin:0 4px;background:#FFFFFF;border:2px solid #C4B5FD;border-radius:12px;font-size:32px;font-weight:700;color:#7C3AED;text-align:center;font-family:Georgia,serif;">${d}</span>`
  ).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>Email Verification - SleepyBabyy</title>
<style>
  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
  img { -ms-interpolation-mode: bicubic; border: 0; max-width: 100%; }
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; padding: 12px !important; max-width: 100% !important; }
    .hero-card { padding: 28px 20px !important; }
    .headline { font-size: 24px !important; line-height: 32px !important; }
  }
  * { box-sizing: border-box; }
  table { table-layout: fixed; max-width: 100%; }
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
                  <div style="font-size:56px;line-height:1;margin-bottom:20px;">✉️</div>
                  <h1 class="headline" style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:38px;color:#1F2937;letter-spacing:-0.5px;">
                    Verify your email
                  </h1>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#6B7280;font-weight:400;">
                    One more step to join ${babyName}'s family
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
            <p style="margin:0 0 24px 0;font-size:16px;line-height:26px;color:#1F2937;">
              <strong style="color:#7C3AED;">${inviterName}</strong> has invited you to join <strong>${babyName}'s</strong> family on SleepyBabyy. To complete your invitation, please use this verification code:
            </p>
          </td>
        </tr>
        
        <!-- Verification Code Display -->
        <tr>
          <td align="center" style="padding:8px 32px 24px 32px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;background:linear-gradient(135deg,#FBCFE8 0%,#C4B5FD 100%);border-radius:20px;padding:24px;">
              <tr>
                <td align="center" style="padding:16px 8px;">
                  <p style="margin:0 0 16px 0;font-size:13px;font-weight:600;color:#7C3AED;text-transform:uppercase;letter-spacing:1.5px;">
                    ✦ Your verification code
                  </p>
                  <div style="text-align:center;">${digitsHTML}</div>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0 0;font-size:13px;color:#6B7280;">
              ⏰ This code expires in <strong>10 minutes</strong>
            </p>
          </td>
        </tr>
        
        <!-- Instructions -->
        <tr>
          <td style="padding:0 32px 16px 32px;">
            <p style="margin:0;font-size:14px;line-height:22px;color:#6B7280;">
              Enter this code on the invitation page to complete your registration. Make sure to do this before the code expires.
            </p>
          </td>
        </tr>
        
        <!-- Divider -->
        <tr>
          <td style="padding:8px 32px;">
            <div style="height:1px;background:linear-gradient(90deg,transparent,#E5E7EB,transparent);"></div>
          </td>
        </tr>
        
        <!-- Security Notice -->
        <tr>
          <td style="padding:24px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FEF3C7;border-radius:12px;">
              <tr>
                <td style="padding:16px;">
                  <p style="margin:0;font-size:14px;line-height:22px;color:#92400E;">
                    🛡️ <strong>Didn't expect this?</strong> You can safely ignore this email. The code will expire automatically.
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, invitationToken } = await req.json()

    if (!email || !invitationToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store the verification code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: updateError } = await supabaseClient
      .from('family_invitations')
      .update({ 
        verification_code: verificationCode,
        verification_expires_at: expiresAt
      })
      .eq('invitation_token', invitationToken)

    if (updateError) {
      console.error('Error storing verification code:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get invitation details using proper JOIN syntax instead of foreign key hints
    const { data: invitationData, error: invitationError } = await supabaseClient
      .from('family_invitations')
      .select(`
        *,
        baby_profiles!inner(name),
        profiles!inner(full_name)
      `)
      .eq('invitation_token', invitationToken)
      .eq('profiles.id', 'family_invitations.invited_by')
      .single()

    // If the JOIN approach fails, try a simpler approach with separate queries
    if (invitationError) {
      console.log('JOIN query failed, trying separate queries approach:', invitationError)
      
      const { data: invitation, error: invError } = await supabaseClient
        .from('family_invitations')
        .select('*')
        .eq('invitation_token', invitationToken)
        .single()

      if (invError) {
        console.error('Error fetching invitation:', invError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch invitation details' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get baby name
      const { data: babyData } = await supabaseClient
        .from('baby_profiles')
        .select('name')
        .eq('id', invitation.baby_id)
        .single()

      // Get inviter name
      const { data: inviterData } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('id', invitation.invited_by)
        .single()

      const babyName = babyData?.name || 'Baby'
      const inviterName = inviterData?.full_name || 'Someone'

      // Send verification email using separate query results
      await sendVerificationEmail(email, verificationCode, babyName, inviterName)

      return new Response(
        JSON.stringify({ success: true, message: 'Verification code sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const babyName = invitationData.baby_profiles?.name || 'Baby'
    const inviterName = invitationData.profiles?.full_name || 'Someone'

    // Send verification email
    await sendVerificationEmail(email, verificationCode, babyName, inviterName)

    console.log('Verification email sent successfully to:', email)

    return new Response(
      JSON.stringify({ success: true, message: 'Verification code sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendVerificationEmail(email: string, verificationCode: string, babyName: string, inviterName: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured')
    throw new Error('Email service not configured')
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SleepyBabyy <noreply@sleepybabyy.com>',
      to: [email],
      subject: `Your verification code for ${babyName}'s family`,
      html: buildVerificationEmail(verificationCode, babyName, inviterName),
    }),
  })

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text()
    console.error('Resend API error:', errorText)
    throw new Error('Failed to send verification email')
  }
}

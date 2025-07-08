import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user exists
    const { data: user } = await supabaseClient.auth.admin.getUserByEmail(email)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'No account found with this email address' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store the verification code
    const { error: insertError } = await supabaseClient
      .from('password_reset_codes')
      .insert({
        email: email.toLowerCase().trim(),
        verification_code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })

    if (insertError) {
      console.error('Error storing verification code:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send verification email with professional template
    const { error: emailError } = await resend.emails.send({
      from: 'Sleepy Baby Breeze Security <security@sleepybabybreeze.com>',
      to: [email],
      subject: 'Your Password Reset Code - Sleepy Baby Breeze',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Sleepy Baby Breeze</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                🌙 Sleepy Baby Breeze
              </h1>
              <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                Password Reset Request
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                Reset Your Password
              </h2>
              
              <p style="color: #4a5568; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Sleepy Baby Breeze account. Use the verification code below to proceed:
              </p>
              
              <!-- Verification Code Box -->
              <div style="background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                  Your Verification Code
                </p>
                <div style="background: #667eea; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 6px; padding: 20px 30px; border-radius: 8px; font-family: 'Courier New', monospace; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  ${verificationCode}
                </div>
                <p style="color: #718096; margin: 15px 0 0 0; font-size: 14px;">
                  ⏰ This code expires in 10 minutes
                </p>
              </div>
              
              <!-- Instructions -->
              <div style="background: #edf2f7; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                  Next Steps:
                </h3>
                <ol style="color: #4a5568; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.5;">
                  <li>Return to the Sleepy Baby Breeze app</li>
                  <li>Enter this 6-digit code in the password reset form</li>
                  <li>Create your new secure password</li>
                </ol>
              </div>
              
              <!-- Security Notice -->
              <div style="background: #fef5e7; border: 1px solid #f6ad55; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="color: #c05621; margin: 0; font-size: 15px; line-height: 1.5;">
                  🔐 <strong>Security Notice:</strong> If you didn't request this password reset, you can safely ignore this email. Your account remains secure and no changes have been made.
                </p>
              </div>
              
              <!-- Footer Text -->
              <p style="color: #718096; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0; text-align: center;">
                This is an automated security email from Sleepy Baby Breeze.<br>
                Please do not reply to this message.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #edf2f7; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; margin: 0; font-size: 13px;">
                © 2024 Sleepy Baby Breeze. All rights reserved.<br>
                Helping families track and nurture healthy sleep habits.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
      text: `
        Sleepy Baby Breeze - Password Reset Request
        
        We received a request to reset your password for your Sleepy Baby Breeze account.
        
        Your verification code: ${verificationCode}
        
        This code will expire in 10 minutes.
        
        Next steps:
        1. Return to the Sleepy Baby Breeze app
        2. Enter this 6-digit code in the password reset form
        3. Create your new secure password
        
        Security Notice: If you didn't request this password reset, you can safely ignore this email. Your account remains secure and no changes have been made.
        
        This is an automated security email from Sleepy Baby Breeze.
        Please do not reply to this message.
        
        © 2024 Sleepy Baby Breeze. All rights reserved.
      `
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Verification code sent to your email' }),
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
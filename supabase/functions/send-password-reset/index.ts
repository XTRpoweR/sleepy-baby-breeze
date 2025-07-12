
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@3.2.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

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

    // Generate secure reset token
    const resetRedirectUrl = redirectTo || 'https://sleepy-baby-breeze.lovable.app/reset-password'
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

    // Send clean, professional password reset email matching the screenshot
    console.log('Sending password reset email to:', email)
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'SleepyBabyy <noreply@sleepybabyy.com>',
      to: [email],
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password - SleepyBabyy</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #f9fafb;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff;
            }
            .header { 
              text-align: center; 
              padding: 40px 20px 30px; 
              border-bottom: 1px solid #e5e7eb;
            }
            .logo {
              font-size: 28px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 8px;
            }
            .tagline {
              color: #6b7280;
              font-size: 14px;
              margin: 0;
            }
            .content { 
              padding: 40px 20px; 
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 16px 0;
            }
            .message {
              font-size: 16px;
              line-height: 1.5;
              color: #374151;
              margin: 0 0 32px 0;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button { 
              display: inline-block; 
              background-color: #3b82f6; 
              color: #ffffff; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: 500;
              font-size: 16px;
            }
            .button:hover {
              background-color: #2563eb;
            }
            .expiry {
              font-size: 14px;
              color: #6b7280;
              margin: 32px 0 0 0;
              text-align: center;
            }
            .footer { 
              text-align: center; 
              padding: 30px 20px; 
              border-top: 1px solid #e5e7eb;
              background-color: #f9fafb;
            }
            .footer-text {
              color: #6b7280; 
              font-size: 14px;
              margin: 0 0 8px 0;
            }
            .help-text {
              font-size: 12px;
              color: #9ca3af;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍼 SleepyBabyy</div>
              <p class="tagline">Your trusted baby tracking companion</p>
            </div>
            
            <div class="content">
              <h1 class="title">Reset your password</h1>
              <p class="message">
                You recently requested to reset your password for your SleepyBabyy account. 
                Click the button below to reset it.
              </p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset password</a>
              </div>
              
              <p class="expiry">This link will expire in 1 hour for your security.</p>
            </div>
            
            <div class="footer">
              <p class="footer-text">This email was sent by SleepyBabyy</p>
              <p class="help-text">
                If you didn't request this password reset, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

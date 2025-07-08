
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

    // Send professional password reset email with better deliverability
    console.log('Sending password reset email to:', email)
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'SleepyBaby Security <security@sleepybabyy.com>',
      to: [email],
      subject: '🔒 Reset Your SleepyBaby Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - SleepyBaby</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .button { 
              display: inline-block; 
              background: #3B82F6; 
              color: white; 
              padding: 14px 28px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #3B82F6;">🍼 SleepyBaby</h1>
              <p style="color: #64748b;">Your trusted baby tracking companion</p>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>You recently requested to reset your password for your SleepyBaby account. Click the button below to reset it:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              
              <p><strong>This link will expire in 1 hour</strong> for your security.</p>
              
              <hr style="border: 1px solid #e2e8f0; margin: 20px 0;">
              
              <p style="font-size: 14px; color: #64748b;">
                If you didn't request this password reset, you can safely ignore this email. 
                Your password will remain unchanged.
              </p>
              
              <p style="font-size: 12px; color: #94a3b8;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${resetUrl}</span>
              </p>
            </div>
            
            <div class="footer">
              <p>This email was sent by SleepyBaby</p>
              <p>Questions? Contact us at support@sleepybabyy.com</p>
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

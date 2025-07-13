
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Get invitation details for email content
    const { data: invitationData, error: invitationError } = await supabaseClient
      .from('family_invitations')
      .select(`
        *,
        baby_profiles!inner(name),
        profiles!family_invitations_invited_by_fkey(full_name)
      `)
      .eq('invitation_token', invitationToken)
      .single()

    if (invitationError) {
      console.error('Error fetching invitation details:', invitationError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invitation details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const babyName = invitationData.baby_profiles?.name || 'Baby'
    const inviterName = invitationData.profiles?.full_name || 'Someone'

    // Send verification email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
        subject: `Email Verification for ${babyName}'s Family Sharing`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3b82f6; text-align: center;">Email Verification Required</h2>
            
            <p>Hello,</p>
            
            <p><strong>${inviterName}</strong> has invited you to join the family sharing for <strong>${babyName}</strong> on SleepyBabyy.</p>
            
            <p>To complete your invitation acceptance, please use this verification code:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #1f2937;">${verificationCode}</h1>
            </div>
            
            <p><strong>Important:</strong> This code will expire in 10 minutes for security reasons.</p>
            
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="font-size: 14px; color: #6b7280;">
              This email was sent from SleepyBabyy family sharing system. 
              <br>Do not reply to this email as it's automatically generated.
            </p>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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


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
    throw new Error('Failed to send verification email')
  }
}

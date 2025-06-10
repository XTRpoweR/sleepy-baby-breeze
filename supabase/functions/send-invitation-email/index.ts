
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

    const { invitationId, email, babyName, inviterName, role, invitationToken } = await req.json()

    if (!invitationId || !email || !babyName || !inviterName || !role || !invitationToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use the correct domain for the invitation link
    const invitationLink = `https://sleepy-baby-breeze.lovable.app/invitation?token=${invitationToken}`

    console.log('Sending invitation email with link:', invitationLink)

    // Send email using Supabase Auth email
    const { error } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      data: {
        invitation_type: 'family_sharing',
        baby_name: babyName,
        inviter_name: inviterName,
        role: role,
        invitation_link: invitationLink
      },
      redirectTo: invitationLink
    })

    if (error) {
      console.error('Error sending invitation email:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation email sent successfully' }),
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

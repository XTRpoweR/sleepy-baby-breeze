import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, sessionId, deviceInfo } = await req.json()

    switch (action) {
      case 'track_session':
        return await trackSession(supabaseClient, user.id, sessionId, deviceInfo, req)
      
      case 'get_sessions':
        return await getUserSessions(supabaseClient, user.id)
      
      case 'invalidate_session':
        return await invalidateSession(supabaseClient, user.id, sessionId)
      
      case 'invalidate_all_sessions':
        return await invalidateAllSessions(supabaseClient, user.id, sessionId)
      
      case 'update_activity':
        return await updateSessionActivity(supabaseClient, user.id, sessionId)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Session manager error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function trackSession(supabaseClient: any, userId: string, sessionId: string, deviceInfo: any, req: Request) {
  const userAgent = req.headers.get('user-agent') || ''
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''

  // Check if session already exists
  const { data: existingSession } = await supabaseClient
    .from('user_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .eq('is_active', true)
    .single()

  if (existingSession) {
    // Update existing session activity
    await supabaseClient
      .from('user_sessions')
      .update({ 
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSession.id)
  } else {
    // Create new session record
    await supabaseClient
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        device_info: deviceInfo?.device || 'Unknown',
        ip_address: clientIP,
        user_agent: userAgent,
        location_info: deviceInfo?.location || null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })

    // Log security event
    await supabaseClient.rpc('log_security_event', {
      user_uuid: userId,
      event_type: 'session_started',
      event_description: 'New session started',
      metadata: {
        device: deviceInfo?.device || 'Unknown',
        location: deviceInfo?.location || null
      },
      ip_address: clientIP,
      user_agent: userAgent,
      severity: 'info'
    })
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getUserSessions(supabaseClient: any, userId: string) {
  const { data: sessions, error } = await supabaseClient
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_activity_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ sessions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function invalidateSession(supabaseClient: any, userId: string, sessionId: string) {
  const { error } = await supabaseClient
    .from('user_sessions')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('session_id', sessionId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Log security event
  await supabaseClient.rpc('log_security_event', {
    user_uuid: userId,
    event_type: 'session_terminated',
    event_description: 'Session manually terminated',
    metadata: { session_id: sessionId },
    severity: 'info'
  })

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function invalidateAllSessions(supabaseClient: any, userId: string, currentSessionId?: string) {
  const { data } = await supabaseClient.rpc('invalidate_other_sessions', {
    user_uuid: userId,
    current_session_id: currentSessionId
  })

  return new Response(
    JSON.stringify({ success: true, invalidated_count: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateSessionActivity(supabaseClient: any, userId: string, sessionId: string) {
  const { error } = await supabaseClient
    .from('user_sessions')
    .update({ 
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .eq('is_active', true)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
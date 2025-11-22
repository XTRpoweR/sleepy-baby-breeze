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

    // Check if Authorization header exists
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('Missing Authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.log('Invalid Authorization token format')
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError) {
      console.log('Auth error:', userError.message)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', details: userError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!user) {
      console.log('User not found from token')
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, eventType, description, metadata, severity } = await req.json()

    switch (action) {
      case 'log_event':
        return await logSecurityEvent(supabaseClient, user.id, eventType, description, metadata, severity, req)
      
      case 'get_events':
        return await getSecurityEvents(supabaseClient, user.id)
      
      case 'password_changed':
        return await handlePasswordChange(supabaseClient, user.id, req)
      
      case 'suspicious_activity':
        return await handleSuspiciousActivity(supabaseClient, user.id, metadata, req)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Security notifications error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function logSecurityEvent(supabaseClient: any, userId: string, eventType: string, description: string, metadata: any, severity: string, req: Request) {
  const userAgent = req.headers.get('user-agent') || ''
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''

  const { error } = await supabaseClient.rpc('log_security_event', {
    user_uuid: userId,
    event_type: eventType,
    event_description: description,
    metadata: metadata || {},
    ip_address: clientIP,
    user_agent: userAgent,
    severity: severity || 'info'
  })

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

async function getSecurityEvents(supabaseClient: any, userId: string) {
  const { data: events, error } = await supabaseClient
    .from('security_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ events }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handlePasswordChange(supabaseClient: any, userId: string, req: Request) {
  const userAgent = req.headers.get('user-agent') || ''
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''

  // Log the password change event
  await supabaseClient.rpc('log_security_event', {
    user_uuid: userId,
    event_type: 'password_changed',
    event_description: 'User password was changed',
    metadata: {
      timestamp: new Date().toISOString(),
      method: 'user_initiated'
    },
    ip_address: clientIP,
    user_agent: userAgent,
    severity: 'warning'
  })

  // Invalidate all other sessions
  const { data: invalidatedCount } = await supabaseClient.rpc('invalidate_other_sessions', {
    user_uuid: userId
  })

  // Send email notification (if Resend is configured)
  if (Deno.env.get('RESEND_API_KEY')) {
    try {
      await sendPasswordChangeNotification(userId, supabaseClient, clientIP)
    } catch (error) {
      console.error('Failed to send password change notification:', error)
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      sessions_invalidated: invalidatedCount,
      notification_sent: true
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleSuspiciousActivity(supabaseClient: any, userId: string, metadata: any, req: Request) {
  const userAgent = req.headers.get('user-agent') || ''
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''

  // Log the suspicious activity
  await supabaseClient.rpc('log_security_event', {
    user_uuid: userId,
    event_type: 'suspicious_activity',
    event_description: metadata.description || 'Suspicious activity detected',
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    ip_address: clientIP,
    user_agent: userAgent,
    severity: 'high'
  })

  // For high severity events, consider invalidating sessions
  if (metadata.severity === 'high') {
    await supabaseClient.rpc('invalidate_other_sessions', {
      user_uuid: userId
    })
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendPasswordChangeNotification(userId: string, supabaseClient: any, ipAddress: string) {
  // Get user profile for email
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  if (!profile?.email) return

  const resend = new (await import('https://esm.sh/resend@3.2.0')).Resend(Deno.env.get('RESEND_API_KEY'))

  await resend.emails.send({
    from: 'SleepyBabyy Security <security@sleepybabyy.com>',
    to: profile.email,
    subject: 'Password Changed - SleepyBabyy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed</h2>
        <p>Hello ${profile.full_name || 'there'},</p>
        <p>Your SleepyBabyy account password was successfully changed.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Security Details:</strong><br>
          Time: ${new Date().toLocaleString()}<br>
          IP Address: ${ipAddress}<br>
        </div>
        
        <p><strong>Important:</strong> All other active sessions have been automatically logged out for your security.</p>
        
        <p>If you didn't make this change, please contact our support team immediately.</p>
        
        <p>Stay secure,<br>The SleepyBabyy Team</p>
      </div>
    `
  })
}
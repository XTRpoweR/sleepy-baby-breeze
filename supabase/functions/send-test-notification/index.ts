import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPublicKey = 'BNRRv_wFm_weccCMzsyiqs8nrIllND0pU2dJsFl3ZCPJRfrGSNNaDgeztzxHwGj6yS5y2mu5sdnvdFweb0BjUdk'
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!

    webpush.setVapidDetails(
      'mailto:notifications@sleepybaby.app',
      vapidPublicKey,
      vapidPrivateKey
    )

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[Test Push] Sending test to user ${user.id}`)

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.id)

    if (subError) throw subError

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'no_subscription',
        message: 'No push subscription found. Please enable notifications first.',
        sent: 0,
        failed: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = JSON.stringify({
      title: '🎉 SleepyBaby Test',
      body: 'Push notifications are working! You will receive reminders for feeding, sleep, and milestones.',
      tag: 'test-notification',
      notificationType: 'test',
      url: '/notifications',
    })

    let sent = 0
    let failed = 0

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }
        await webpush.sendNotification(pushSubscription, payload)
        sent++
        console.log(`[Test Push] Success for endpoint ${sub.endpoint.slice(-20)}`)
      } catch (err: any) {
        console.error(`[Test Push] Failed:`, err.statusCode, err.body)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
        failed++
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: subscriptions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[Test Push] Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

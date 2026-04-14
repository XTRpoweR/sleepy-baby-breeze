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

    // Get pending notifications
    const { data: notifications, error: notifError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .is('sent_at', null)
      .lte('scheduled_for', new Date().toISOString())
      .limit(50)

    if (notifError) throw notifError
    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending notifications' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let sentCount = 0
    let failedCount = 0

    // Group by user
    const userNotifs = new Map<string, typeof notifications>()
    for (const n of notifications) {
      const existing = userNotifs.get(n.user_id) || []
      existing.push(n)
      userNotifs.set(n.user_id, existing)
    }

    for (const [userId, userNotifications] of userNotifs) {
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)

      if (!subscriptions || subscriptions.length === 0) continue

      for (const notif of userNotifications) {
        const payload = JSON.stringify({
          title: notif.title,
          body: notif.body,
          tag: `${notif.notification_type}-${notif.baby_id}`,
          notificationType: notif.notification_type,
          url: '/dashboard',
        })

        for (const sub of subscriptions) {
          try {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth }
            }
            await webpush.sendNotification(pushSubscription, payload)
            sentCount++
            console.log(`[Push] Sent to ${sub.endpoint.slice(-20)}`)
          } catch (err: any) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('id', sub.id)
              console.log(`[Push] Removed expired subscription ${sub.id}`)
            } else {
              console.error(`[Push] Error for ${sub.id}:`, err.statusCode, err.body)
              failedCount++
            }
          }
        }

        // Mark as sent
        await supabase
          .from('scheduled_notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', notif.id)
      }
    }

    return new Response(JSON.stringify({ sentCount, failedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in send-push-notification:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

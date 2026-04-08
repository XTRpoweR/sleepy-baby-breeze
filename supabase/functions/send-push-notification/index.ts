import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VAPID_PUBLIC_KEY = 'BDlAzZ0VxOft1f_Su1WSwNnOJFVGrnbLp1SHa67fivIaZcPtsNSNSA1qSvFDkF_OXi7zR8PSFtxa-Ue7YRGgP1Y';

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - base64Url.length % 4) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function importVapidKeys(publicKeyB64: string, privateKeyB64: string) {
  const publicKeyBytes = base64UrlToUint8Array(publicKeyB64);
  const privateKeyBytes = base64UrlToUint8Array(privateKeyB64);

  // Build raw PKCS8 for P-256 private key
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20
  ]);
  const pkcs8Middle = new Uint8Array([0xa1, 0x44, 0x03, 0x42, 0x00]);
  
  const pkcs8 = new Uint8Array(pkcs8Header.length + privateKeyBytes.length + pkcs8Middle.length + publicKeyBytes.length);
  pkcs8.set(pkcs8Header);
  pkcs8.set(privateKeyBytes, pkcs8Header.length);
  pkcs8.set(pkcs8Middle, pkcs8Header.length + privateKeyBytes.length);
  pkcs8.set(publicKeyBytes, pkcs8Header.length + privateKeyBytes.length + pkcs8Middle.length);

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  return privateKey;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createJWT(privateKey: CryptoKey, audience: string, subject: string) {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: subject,
  };

  const enc = new TextEncoder();
  const headerB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(payload)));
  const input = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    enc.encode(input)
  );

  // Convert DER signature to raw r||s
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    // DER decode
    let offset = 2;
    const rLen = sigBytes[offset + 1];
    const r = sigBytes.slice(offset + 2, offset + 2 + rLen);
    offset = offset + 2 + rLen;
    const sLen = sigBytes[offset + 1];
    const s = sigBytes.slice(offset + 2, offset + 2 + sLen);
    rawSig = new Uint8Array(64);
    rawSig.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
    rawSig.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  }

  return `${input}.${uint8ArrayToBase64Url(rawSig)}`;
}

async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  privateKey: CryptoKey
) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const jwt = await createJWT(privateKey, audience, 'mailto:notifications@sleepybaby.app');

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
      'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      'Content-Encoding': 'aes128gcm',
    },
    body: payload,
  });

  return response;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get pending notifications
    const { data: notifications, error: notifError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .is('sent_at', null)
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (notifError) throw notifError;
    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending notifications' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const privateKey = await importVapidKeys(VAPID_PUBLIC_KEY, vapidPrivateKey);
    let sentCount = 0;
    let failedCount = 0;

    // Group notifications by user
    const userNotifs = new Map<string, typeof notifications>();
    for (const n of notifications) {
      const existing = userNotifs.get(n.user_id) || [];
      existing.push(n);
      userNotifs.set(n.user_id, existing);
    }

    for (const [userId, userNotifications] of userNotifs) {
      // Get user's push subscriptions
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!subscriptions || subscriptions.length === 0) continue;

      for (const notif of userNotifications) {
        const payload = JSON.stringify({
          title: notif.title,
          body: notif.body,
          tag: `${notif.notification_type}-${notif.baby_id}`,
          notificationType: notif.notification_type,
          url: '/dashboard',
        });

        for (const sub of subscriptions) {
          try {
            const response = await sendPushToSubscription(sub, payload, privateKey);
            if (response.status === 201 || response.status === 200) {
              sentCount++;
            } else if (response.status === 410 || response.status === 404) {
              // Subscription expired, remove it
              await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            } else {
              console.error(`Push failed for ${sub.id}: ${response.status}`);
              failedCount++;
            }
          } catch (err) {
            console.error(`Push error for ${sub.id}:`, err);
            failedCount++;
          }
        }

        // Mark notification as sent
        await supabase
          .from('scheduled_notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', notif.id);
      }
    }

    return new Response(JSON.stringify({ sentCount, failedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
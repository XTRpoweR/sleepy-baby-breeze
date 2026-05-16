// Resend webhook receiver — records email events (opened/clicked/delivered/bounced)
// for newsletter campaigns. Validates Svix signature when RESEND_WEBHOOK_SECRET is set.
//
// Public endpoint (no JWT) — Resend can't send Supabase auth headers. Auth is
// done via signature verification.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

// Verify Svix-style signature (Resend uses Svix for webhooks).
// Signature header format: v1,<base64-hmac-sha256> (may have multiple, space-separated)
async function verifySvix(
  body: string,
  svixId: string | null,
  svixTimestamp: string | null,
  svixSignature: string | null,
  secret: string,
): Promise<boolean> {
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // Svix secret format: "whsec_<base64>". Strip prefix, decode base64 -> raw key bytes.
  const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  let keyBytes: Uint8Array;
  try {
    const bin = atob(secretKey);
    keyBytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) keyBytes[i] = bin.charCodeAt(i);
  } catch {
    return false;
  }

  const payload = `${svixId}.${svixTimestamp}.${body}`;
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));

  // svix-signature may contain multiple sigs separated by spaces: "v1,xxx v1,yyy"
  const provided = svixSignature.split(' ');
  for (const p of provided) {
    const parts = p.split(',');
    if (parts.length === 2 && parts[0] === 'v1' && parts[1] === expected) return true;
  }
  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const rawBody = await req.text();
    const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');

    // Signature verification (skip with warning if secret not configured yet)
    if (secret) {
      const ok = await verifySvix(
        rawBody,
        req.headers.get('svix-id'),
        req.headers.get('svix-timestamp'),
        req.headers.get('svix-signature'),
        secret,
      );
      if (!ok) {
        console.warn('[resend-webhook] invalid signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      console.warn('[resend-webhook] RESEND_WEBHOOK_SECRET not set — accepting unverified webhook');
    }

    const payload = JSON.parse(rawBody) as {
      type: string;
      created_at?: string;
      data?: {
        email_id?: string;
        to?: string[] | string;
        subject?: string;
        click?: { link?: string };
        bounce?: { type?: string };
      };
    };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Map Resend event types to our internal event_type
    const typeMap: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.delivery_delayed': 'delayed',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.failed': 'failed',
    };
    const eventType = typeMap[payload.type];
    if (!eventType) {
      // Unknown event — log and ignore
      console.log('[resend-webhook] unknown event type:', payload.type);
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailId = payload.data?.email_id ?? null;
    const toRaw = payload.data?.to;
    const recipient = Array.isArray(toRaw) ? toRaw[0] : toRaw;
    const eventAt = payload.created_at ? new Date(payload.created_at).toISOString() : new Date().toISOString();

    if (!recipient) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no_recipient' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up the campaign by resend_email_id (saved when we sent the email)
    let campaignId: string | null = null;
    if (emailId) {
      const { data: sendRow } = await supabase
        .from('newsletter_sends')
        .select('campaign_id, is_test')
        .eq('resend_email_id', emailId)
        .maybeSingle();
      // Test sends are not tracked toward campaign stats
      if (sendRow && !sendRow.is_test) {
        campaignId = sendRow.campaign_id;
      } else if (sendRow?.is_test) {
        // Test email — record event but don't link to campaign
        await supabase.from('newsletter_events').insert({
          campaign_id: null,
          resend_email_id: emailId,
          recipient_email: recipient,
          event_type: eventType,
          event_at: eventAt,
          click_url: payload.data?.click?.link ?? null,
          raw_payload: payload,
        });
        return new Response(JSON.stringify({ ok: true, test: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Insert the event
    const { error: insertErr } = await supabase.from('newsletter_events').insert({
      campaign_id: campaignId,
      resend_email_id: emailId,
      recipient_email: recipient,
      event_type: eventType,
      event_at: eventAt,
      click_url: payload.data?.click?.link ?? null,
      raw_payload: payload,
    });
    if (insertErr) {
      console.error('[resend-webhook] insert event error:', insertErr);
    }

    // Refresh aggregates on the campaign
    if (campaignId) {
      const { error: rpcErr } = await supabase.rpc('recompute_campaign_stats', { p_campaign_id: campaignId });
      if (rpcErr) console.error('[resend-webhook] recompute error:', rpcErr);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[resend-webhook] error:', msg);
    // Return 200 so Resend doesn't retry forever on malformed payloads
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

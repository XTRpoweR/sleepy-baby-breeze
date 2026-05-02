
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Content-Security-Policy': 'default-src \'self\'',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map();

function checkRateLimit(key: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key).filter((time: number) => time > windowStart);
  
  if (requests.length >= limit) {
    return false;
  }
  
  requests.push(now);
  rateLimitStore.set(key, requests);
  return true;
}

async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(body);
    
    // Extract timestamp and signature from header
    const elements = signature.split(',');
    let timestamp = '';
    let v1Signature = '';
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        v1Signature = value;
      }
    }
    
    if (!timestamp || !v1Signature) {
      console.error('Invalid signature format');
      return false;
    }
    
    // Check timestamp (reject requests older than 5 minutes)
    const timestampMs = parseInt(timestamp) * 1000;
    const now = Date.now();
    if (Math.abs(now - timestampMs) > 300000) { // 5 minutes
      console.error('Request timestamp too old');
      return false;
    }
    
    // Create expected signature
    const payload = timestamp + '.' + body;
    const expectedSignature = await createHmacSignature(payload, secret);
    
    // Compare signatures using constant-time comparison
    return constantTimeCompare(expectedSignature, v1Signature);
    
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

async function createHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, payloadData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().slice(0, 1000); // Limit string length
  }
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : 0;
  }
  if (Array.isArray(input)) {
    return input.slice(0, 100).map(sanitizeInput); // Limit array length
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    const keys = Object.keys(input).slice(0, 50); // Limit object properties
    for (const key of keys) {
      if (typeof key === 'string' && key.length <= 100) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  return input;
}

// Helper function to safely convert timestamps to ISO strings
function safeTimestampToISO(timestamp: number | null | undefined): string | null {
  try {
    if (!timestamp || timestamp === 0) {
      console.log('Timestamp is null, undefined, or 0:', timestamp);
      return null;
    }
    
    // Ensure timestamp is a valid number
    const numTimestamp = Number(timestamp);
    if (!Number.isFinite(numTimestamp) || numTimestamp < 0) {
      console.log('Invalid timestamp value:', timestamp);
      return null;
    }
    
    const date = new Date(numTimestamp * 1000);
    if (isNaN(date.getTime())) {
      console.log('Invalid date from timestamp:', timestamp);
      return null;
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error converting timestamp to ISO:', { timestamp, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP, 30, 60000)) {
      return new Response('Rate limit exceeded', { 
        status: 429, 
        headers: corsHeaders 
      });
    }

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Internal server error', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const body = await req.text();
    
    // Validate request body
    if (!body || body.length === 0) {
      console.error('Empty request body');
      return new Response('Bad request', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    if (body.length > 1048576) { // 1MB limit
      console.error('Request body too large');
      return new Response('Request too large', { 
        status: 413, 
        headers: corsHeaders 
      });
    }

    // Verify Stripe signature
    if (!signature || !await verifyStripeSignature(body, signature, webhookSecret)) {
      console.error('Invalid signature');
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    let event;
    try {
      event = JSON.parse(body);
      event = sanitizeInput(event);
    } catch (err) {
      console.error('Invalid JSON:', err);
      return new Response('Invalid JSON', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Validate event structure
    if (!event.type || !event.data || !event.id) {
      console.error('Invalid event structure');
      return new Response('Invalid event structure', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('Processing webhook event:', event.type, 'Event ID:', event.id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabase, event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabase, event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, event);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response('ok', { headers: corsHeaders });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

async function handleSubscriptionUpdate(supabase: any, event: any) {
  try {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    console.log('Processing subscription update:', {
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end
    });

    // Find user by customer ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('user_id, email')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!existingSubscription) {
      console.error('No subscription found for customer:', customerId);
      return;
    }

    // Determine subscription tier based on the price's recurring interval
    let subscriptionTier = 'basic';
    if (subscription.items?.data[0]?.price) {
      const price = subscription.items.data[0].price;
      const recurring: any = price.recurring;

      if (recurring?.interval === 'year') {
        subscriptionTier = 'premium_annual';
      } else if (recurring?.interval === 'month' && (recurring.interval_count || 1) === 3) {
        subscriptionTier = 'premium_quarterly';
      } else if (recurring?.interval === 'month') {
        subscriptionTier = 'premium';
      }

      console.log('Determined subscription tier', {
        priceId: price.id,
        amount: price.unit_amount,
        interval: recurring?.interval,
        interval_count: recurring?.interval_count,
        subscriptionTier,
        productId: price.product
      });
    }

    // Safely convert timestamps
    const currentPeriodStart = safeTimestampToISO(subscription.current_period_start);
    const currentPeriodEnd = safeTimestampToISO(subscription.current_period_end);
    const trialStart = safeTimestampToISO(subscription.trial_start);
    const trialEnd = safeTimestampToISO(subscription.trial_end);
    const isTrial = subscription.status === 'trialing' || (!!trialEnd && new Date(trialEnd).getTime() > Date.now());

    const subscriptionData: Record<string, unknown> = {
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      subscription_tier: subscriptionTier,
      is_trial: isTrial,
      trial_start: trialStart,
      trial_end: trialEnd,
      billing_cycle: subscriptionTier === 'premium_annual' ? 'annual' : subscriptionTier === 'premium_quarterly' ? 'quarterly' : 'monthly',
      updated_at: new Date().toISOString()
    };

    console.log('Updating subscription with data:', subscriptionData);

    const { error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }

    console.log('Subscription updated successfully', { customerId, subscriptionTier, status: subscription.status, isTrial });
  } catch (error) {
    console.error('Error in handleSubscriptionUpdate:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(supabase: any, event: any) {
  try {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    console.log('Processing subscription deletion:', { subscriptionId: subscription.id, customerId });

    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Error updating cancelled subscription:', error);
      throw error;
    }

    console.log('Subscription cancelled successfully');
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}

// ===== Meta Conversions API helpers =====
const META_PIXEL_ID = '956706330308177';
const META_GRAPH_URL = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events`;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sendCapiEvent(
  supabase: any,
  opts: {
    event_name: string;
    event_id?: string;
    email?: string | null;
    user_id?: string | null;
    value?: number;
    currency?: string;
    content_name?: string;
    custom_data?: Record<string, unknown>;
    // Advanced matching (raw — hashed below)
    phone?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    city?: string | null;
    country?: string | null;
    fbc?: string | null;
    fbp?: string | null;
    client_user_agent?: string | null;
    event_source_url?: string | null;
  },
) {
  const token =
    Deno.env.get('META_CONVERSIONS_API_TOKEN') ||
    Deno.env.get('META_CAPI_ACCESS_TOKEN') ||
    '';

  const event_id = opts.event_id || crypto.randomUUID();
  const email_hash = opts.email ? await sha256Hex(opts.email) : null;

  const normPhone = (p: string) => p.replace(/[^\d]/g, '');
  const normText = (s: string) => s.trim().toLowerCase();

  const user_data: Record<string, unknown> = {};
  if (email_hash) user_data.em = [email_hash];
  if (opts.user_id) user_data.external_id = [await sha256Hex(opts.user_id)];
  if (opts.phone) user_data.ph = [await sha256Hex(normPhone(opts.phone))];
  if (opts.first_name) user_data.fn = [await sha256Hex(normText(opts.first_name))];
  if (opts.last_name) user_data.ln = [await sha256Hex(normText(opts.last_name))];
  if (opts.city) user_data.ct = [await sha256Hex(normText(opts.city).replace(/\s+/g, ''))];
  if (opts.country) user_data.country = [await sha256Hex(normText(opts.country))];
  if (opts.fbc) user_data.fbc = opts.fbc;
  if (opts.fbp) user_data.fbp = opts.fbp;
  if (opts.client_user_agent) user_data.client_user_agent = opts.client_user_agent;

  const custom_data: Record<string, unknown> = { ...(opts.custom_data || {}) };
  if (opts.value !== undefined) custom_data.value = opts.value;
  if (opts.currency) custom_data.currency = opts.currency;
  if (opts.content_name) custom_data.content_name = opts.content_name;

  const event_source_url = opts.event_source_url || 'https://sleepybabyy.com/dashboard';

  let capi_sent = false;
  let capi_error: string | null = null;
  let capi_response: unknown = null;

  if (token) {
    try {
      const res = await fetch(`${META_GRAPH_URL}?access_token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            {
              event_name: opts.event_name,
              event_time: Math.floor(Date.now() / 1000),
              event_id,
              event_source_url,
              action_source: 'website',
              user_data,
              custom_data,
            },
          ],
        }),
      });
      const text = await res.text();
      capi_response = (() => { try { return JSON.parse(text); } catch { return text; } })();
      if (res.ok) {
        capi_sent = true;
      } else {
        capi_error = `HTTP ${res.status}: ${text}`;
        console.error('Meta CAPI error', capi_error);
      }
    } catch (e) {
      capi_error = (e as Error).message;
      console.error('Meta CAPI exception', capi_error);
    }
  } else {
    capi_error = 'META_CONVERSIONS_API_TOKEN not configured';
    console.error(capi_error);
  }

  // Log to marketing_events
  try {
    await supabase.from('marketing_events').insert({
      event_name: opts.event_name,
      event_id,
      event_source: 'stripe_webhook',
      user_id: opts.user_id || null,
      email: opts.email || null,
      email_hash,
      value: opts.value ?? null,
      currency: opts.currency || 'USD',
      content_name: opts.content_name || null,
      capi_sent,
      capi_sent_at: capi_sent ? new Date().toISOString() : null,
      capi_error,
      capi_response: capi_response as any,
      raw_payload: { ...custom_data, fbc: opts.fbc || null, fbp: opts.fbp || null } as any,
    });
  } catch (e) {
    console.error('Failed to log marketing_event', (e as Error).message);
  }

  return { event_id, capi_sent };
}

// Pull last-known fbc/fbp for a user from prior browser-side marketing_events
// so server-side conversions (Subscribe, StartTrial, Purchase) keep their
// click-attribution chain intact.
async function getLastClickIds(
  supabase: any,
  userId: string | null,
): Promise<{ fbc: string | null; fbp: string | null; client_user_agent: string | null; event_source_url: string | null }> {
  if (!userId) return { fbc: null, fbp: null, client_user_agent: null, event_source_url: null };
  try {
    const { data } = await supabase
      .from('marketing_events')
      .select('raw_payload, client_user_agent, page_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!data) return { fbc: null, fbp: null, client_user_agent: null, event_source_url: null };
    let fbc: string | null = null;
    let fbp: string | null = null;
    let client_user_agent: string | null = null;
    let event_source_url: string | null = null;
    for (const row of data) {
      const rp = (row?.raw_payload || {}) as Record<string, unknown>;
      if (!fbc && typeof rp.fbc === 'string') fbc = rp.fbc as string;
      if (!fbp && typeof rp.fbp === 'string') fbp = rp.fbp as string;
      if (!client_user_agent && typeof row?.client_user_agent === 'string') client_user_agent = row.client_user_agent;
      if (!client_user_agent && typeof rp.client_user_agent === 'string') client_user_agent = rp.client_user_agent as string;
      if (!event_source_url && typeof row?.page_url === 'string') event_source_url = row.page_url;
      if (!event_source_url && typeof rp.event_source_url === 'string') event_source_url = rp.event_source_url as string;
      if (fbc && fbp && client_user_agent && event_source_url) break;
    }
    return { fbc, fbp, client_user_agent, event_source_url };
  } catch {
    return { fbc: null, fbp: null, client_user_agent: null, event_source_url: null };
  }
}

// Split "First Last Name" → { first_name, last_name }
function splitName(full: string | null | undefined): { first_name: string | null; last_name: string | null } {
  if (!full) return { first_name: null, last_name: null };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: null };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

function tierContentName(tier: string | null | undefined): string {
  if (tier === 'premium_annual') return 'premium_annual';
  if (tier === 'premium_quarterly') return 'premium_quarterly';
  return 'premium_monthly';
}

function tierValue(tier: string | null | undefined): number {
  if (tier === 'premium_annual') return 69.99;
  if (tier === 'premium_quarterly') return 19.99;
  return 7.99;
}

async function handleCheckoutCompleted(supabase: any, event: any) {
  try {
    const session = event.data.object;
    const customerId = session.customer;
    const email = session.customer_details?.email || session.customer_email || null;
    const userIdMeta = session.metadata?.user_id || null;

    // Look up subscription record (may not exist yet — webhook order is not guaranteed)
    let userId: string | null = userIdMeta;
    let tier: string | null = null;
    let isTrial = false;

    if (customerId) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id, email, subscription_tier, is_trial, status')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();
      if (sub) {
        userId = userId || sub.user_id;
        tier = sub.subscription_tier;
        isTrial = !!sub.is_trial || sub.status === 'trialing';
      }
    }

    // Fallback: derive from session
    if (!tier) tier = session.metadata?.plan_key
      ? (session.metadata.plan_key === 'annual' ? 'premium_annual'
        : session.metadata.plan_key === 'quarterly' ? 'premium_quarterly'
        : 'premium')
      : 'premium';

    const contentName = tierContentName(tier);
    const value = tierValue(tier);

    // Advanced matching from Stripe customer_details
    const cd = session.customer_details || {};
    const { first_name, last_name } = splitName(cd.name);
    const phone = cd.phone || null;
    const city = cd.address?.city || null;
    const country = cd.address?.country || null;
    const { fbc, fbp, client_user_agent, event_source_url } = await getLastClickIds(supabase, userId);

    // Subscribe event
    await sendCapiEvent(supabase, {
      event_name: 'Subscribe',
      event_id: `sub_${session.id}`,
      email,
      user_id: userId,
      value,
      currency: 'USD',
      content_name: contentName,
      first_name, last_name, phone, city, country, fbc, fbp,
      client_user_agent,
      event_source_url,
      custom_data: {
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        subscription_id: session.subscription || null,
      },
    });

    // StartTrial event (checkout sessions are created with trial_period_days: 7)
    if (isTrial || session.subscription) {
      await sendCapiEvent(supabase, {
        event_name: 'StartTrial',
        event_id: `trial_${session.id}`,
        email,
        user_id: userId,
        value: 0,
        currency: 'USD',
        content_name: contentName,
        first_name, last_name, phone, city, country, fbc, fbp,
        client_user_agent,
        event_source_url,
        custom_data: {
          predicted_ltv: 79.90,
          stripe_session_id: session.id,
          subscription_id: session.subscription || null,
        },
      });
    }

    console.log('checkout.session.completed processed', { sessionId: session.id, customerId, tier });
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(supabase: any, event: any) {
  try {
    const invoice = event.data.object;
    const customerId = invoice.customer;
    const billingReason = invoice.billing_reason; // subscription_create, subscription_cycle, etc.
    const amountPaid = (invoice.amount_paid || 0) / 100;
    const currency = (invoice.currency || 'usd').toUpperCase();
    const email = invoice.customer_email || null;

    // Skip $0 invoices (trial start invoice)
    if (amountPaid <= 0) {
      console.log('Skipping Purchase for $0 invoice', { invoiceId: invoice.id, billingReason });
      return;
    }

    let userId: string | null = null;
    let tier: string | null = null;
    if (customerId) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id, subscription_tier')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();
      if (sub) {
        userId = sub.user_id;
        tier = sub.subscription_tier;
      }
    }

    // Click-attribution lookup so server-side Purchase keeps fbc/fbp chain
    const { fbc, fbp, client_user_agent, event_source_url } = await getLastClickIds(supabase, userId);
    const subscriptionId = invoice.subscription || null;

    await sendCapiEvent(supabase, {
      event_name: 'Purchase',
      event_id: `purchase_${invoice.id}`,
      email,
      user_id: userId,
      value: amountPaid,
      currency,
      content_name: tierContentName(tier),
      fbc, fbp,
      client_user_agent,
      event_source_url,
      custom_data: {
        stripe_invoice_id: invoice.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_id: subscriptionId,
        billing_reason: billingReason,
      },
    });

    console.log('invoice.payment_succeeded processed', { invoiceId: invoice.id, amountPaid, currency });
  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error);
  }
}

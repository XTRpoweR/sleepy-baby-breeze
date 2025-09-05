
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
    console.error('Error converting timestamp to ISO:', { timestamp, error: error.message });
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

    // Determine subscription tier based on the price
    let subscriptionTier = 'basic';
    if (subscription.items?.data[0]?.price) {
      const price = subscription.items.data[0].price;
      const amount = price.unit_amount || 0;
      
      // Map pricing to tiers - adjust these amounts based on your actual pricing
      if (amount >= 2999) { // $29.99 or more
        subscriptionTier = 'premium';
      }
      
      console.log('Determined subscription tier', { 
        priceId: price.id, 
        amount, 
        subscriptionTier,
        productId: price.product 
      });
    }

    // Safely convert timestamps
    const currentPeriodStart = safeTimestampToISO(subscription.current_period_start);
    const currentPeriodEnd = safeTimestampToISO(subscription.current_period_end);

    const subscriptionData = {
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      subscription_tier: subscriptionTier,
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

    console.log('Subscription updated successfully', { customerId, subscriptionTier, status: subscription.status });
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

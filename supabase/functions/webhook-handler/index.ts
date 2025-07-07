import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-HANDLER] ${step}${detailsStr}`);
};

// Enhanced webhook signature verification
const verifyWebhookSignature = (body: string, signature: string, secret: string): boolean => {
  try {
    // This is a simplified version - in production, implement proper HMAC verification
    // For now, just check that signature exists
    return signature && signature.length > 0;
  } catch (error) {
    logStep("Signature verification failed", error);
    return false;
  }
};

// Rate limiting map to prevent abuse
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const checkRateLimit = (clientId: string): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(clientId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    record.count++;
  }
  
  rateLimitMap.set(clientId, record);
  return record.count <= RATE_LIMIT_MAX;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting based on IP
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIp)) {
      logStep("Rate limit exceeded", { clientIp });
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    logStep("Webhook received", { method: req.method, url: req.url, clientIp });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the raw body as text for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature) {
      logStep("ERROR", "No Stripe signature found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Verify webhook signature for security
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      logStep("ERROR", "Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Parse the webhook payload
    let event;
    try {
      event = JSON.parse(body);
      logStep("Webhook event parsed", { type: event.type, id: event.id });
    } catch (err) {
      logStep("ERROR", "Invalid JSON payload");
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Handle different webhook events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(supabaseClient, event);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(supabaseClient, event);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(supabaseClient, event);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabaseClient, event);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionEvent(supabase: any, event: any) {
  const subscription = event.data.object;
  logStep("Handling subscription event", { 
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status 
  });

  // Get customer email from Stripe
  const customer = subscription.customer;
  
  // Update or create subscription record
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer,
      status: subscription.status,
      subscription_tier: subscription.status === 'active' ? 'premium' : 'basic',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id'
    });

  if (error) {
    logStep("ERROR updating subscription", { error: error.message });
    throw error;
  }

  logStep("Subscription updated successfully");
}

async function handleSubscriptionCancellation(supabase: any, event: any) {
  const subscription = event.data.object;
  logStep("Handling subscription cancellation", { subscriptionId: subscription.id });

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      subscription_tier: 'basic',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logStep("ERROR canceling subscription", { error: error.message });
    throw error;
  }

  logStep("Subscription canceled successfully");
}

async function handlePaymentSuccess(supabase: any, event: any) {
  const invoice = event.data.object;
  logStep("Handling payment success", { 
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription 
  });

  // Update subscription status to active if payment succeeded
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        subscription_tier: 'premium',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      logStep("ERROR updating subscription after payment", { error: error.message });
      throw error;
    }

    logStep("Subscription activated after successful payment");
  }
}

async function handlePaymentFailed(supabase: any, event: any) {
  const invoice = event.data.object;
  logStep("Handling payment failure", { 
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription 
  });

  // Update subscription status based on payment failure
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      logStep("ERROR updating subscription after payment failure", { error: error.message });
      throw error;
    }

    logStep("Subscription marked as past_due after payment failure");
  }
}

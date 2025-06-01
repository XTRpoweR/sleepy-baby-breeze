
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    
    // Create client with anon key first to verify the token
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    if (userError || !userData.user?.email) {
      logStep("Authentication failed", { error: userError?.message });
      // Return basic subscription for unauthenticated users
      return new Response(JSON.stringify({ 
        subscription_tier: 'basic',
        status: 'active',
        current_period_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Now use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating basic subscription");
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_tier: 'basic',
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        subscription_tier: 'basic',
        status: 'active',
        current_period_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let subscriptionTier = 'basic';
    let subscriptionStatus = 'active';
    let currentPeriodEnd = null;
    let stripeSubscriptionId = null;
    let currentPeriodStart = null;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      subscriptionTier = 'premium';
      subscriptionStatus = subscription.status;
      currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
      stripeSubscriptionId = subscription.id;
      logStep("Active premium subscription found", { 
        subscriptionId: subscription.id, 
        endDate: currentPeriodEnd 
      });
    } else {
      logStep("No active subscription found, checking for basic");
    }

    await supabaseClient.from("subscriptions").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_tier: subscriptionTier,
      status: subscriptionStatus,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Updated database with subscription info", { 
      subscriptionTier, 
      subscriptionStatus 
    });

    return new Response(JSON.stringify({
      subscription_tier: subscriptionTier,
      status: subscriptionStatus,
      current_period_end: currentPeriodEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

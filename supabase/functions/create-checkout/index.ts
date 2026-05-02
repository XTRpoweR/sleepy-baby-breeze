import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

const VALID_PLANS = new Set(["monthly", "quarterly", "annual"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    logStep("Function started");

    let pricingPlan: "monthly" | "quarterly" | "annual" = "monthly";
    const requestBody = await req.text();
    if (requestBody) {
      try {
        const body = JSON.parse(requestBody);
        if (VALID_PLANS.has(body.pricingPlan)) {
          pricingPlan = body.pricingPlan;
        }
      } catch {
        logStep("No valid JSON body, using monthly default");
      }
    }
    logStep("Pricing plan", { pricingPlan });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Payment system not configured. Please contact support." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
      return new Response(JSON.stringify({ error: "Database configuration missing." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required. Please log in and try again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !data.user?.email) {
      logStep("Auth error", { error: authError?.message });
      return new Response(JSON.stringify({ error: "Your login session has expired. Please sign in again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const user = data.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Look up the active price ID for the requested plan from our config table
    const { data: priceConfig, error: priceErr } = await supabaseAdmin
      .from("stripe_price_config")
      .select("stripe_price_id, amount_cents, interval, interval_count")
      .eq("plan_key", pricingPlan)
      .eq("active", true)
      .maybeSingle();

    if (priceErr || !priceConfig?.stripe_price_id) {
      logStep("Price not found in config", { pricingPlan, priceErr: priceErr?.message });
      return new Response(
        JSON.stringify({ error: "Pricing not configured yet. Please contact support." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    const priceId = priceConfig.stripe_price_id;
    logStep("Using price", { priceId, plan: pricingPlan });

    // Reuse or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://sleepybabyy.com";
    const clientUserAgent = req.headers.get("user-agent") || null;
    const eventSourceUrl = req.headers.get("referer") || `${origin}/pricing`;

    const sessionParams: any = {
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata: { user_id: user.id, plan_key: pricingPlan },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: {
        trial_period_days: 7,
        metadata: { user_id: user.id, plan_key: pricingPlan },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id });

    // Log InitiateCheckout marketing event with client_user_agent + event_source_url
    // so server-side conversion events (Subscribe/StartTrial/Purchase) can replay them.
    try {
      await supabaseAdmin.from("marketing_events").insert({
        event_name: "InitiateCheckout",
        event_id: `ic_${session.id}`,
        event_source: "create_checkout",
        user_id: user.id,
        email: user.email,
        client_user_agent: clientUserAgent,
        page_url: eventSourceUrl,
        raw_payload: {
          stripe_session_id: session.id,
          plan_key: pricingPlan,
          client_user_agent: clientUserAgent,
          event_source_url: eventSourceUrl,
        } as any,
      });
    } catch (e) {
      console.error("[CREATE-CHECKOUT] Failed to log marketing_event", (e as Error).message);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-CHECKOUT] ERROR", errorMessage);

    if (
      errorMessage.includes("authorization header") ||
      errorMessage.includes("JWT expired") ||
      errorMessage.includes("session_not_found")
    ) {
      return new Response(JSON.stringify({ error: "Your login session has expired. Please sign in again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    return new Response(
      JSON.stringify({ error: "An error occurred while setting up checkout. Please try again or contact support." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

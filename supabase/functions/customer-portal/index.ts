
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Find the customer in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user. Please make sure you have an active subscription first.");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get the origin for the return URL
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Optional flow (e.g. cancel) from request body
    let flow: string | null = null;
    try {
      if (req.method === "POST") {
        const body = await req.json().catch(() => ({}));
        if (body && typeof body.flow === "string") flow = body.flow;
      }
    } catch (_) { /* ignore */ }

    const sessionParams: any = {
      customer: customerId,
      return_url: `${origin}/subscription`,
    };

    if (flow === "cancel") {
      // Find an active sub to cancel
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 5 });
      const activeSub = subs.data.find((s: any) => ["active", "trialing", "past_due"].includes(s.status));
      if (activeSub) {
        sessionParams.flow_data = {
          type: "subscription_cancel",
          subscription_cancel: { subscription: activeSub.id },
          after_completion: { type: "redirect", redirect: { return_url: `${origin}/subscription` } },
        };
      }
    }

    const portalSession = await stripe.billingPortal.sessions.create(sessionParams);

    logStep("Customer portal session created", { 
      sessionId: portalSession.id, 
      url: portalSession.url 
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Provide specific error messages based on common issues
    let userFriendlyMessage = errorMessage;
    
    if (errorMessage.includes('No configuration provided') || 
        errorMessage.includes('default configuration has not been created')) {
      userFriendlyMessage = "Customer portal not configured. Please set up the portal in your Stripe Dashboard at https://dashboard.stripe.com/test/settings/billing/portal";
    } else if (errorMessage.includes('No Stripe customer found')) {
      userFriendlyMessage = "No subscription found. Please subscribe to a plan first before accessing the customer portal.";
    }
    
    return new Response(JSON.stringify({ error: userFriendlyMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

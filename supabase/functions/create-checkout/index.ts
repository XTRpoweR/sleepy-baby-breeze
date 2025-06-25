
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) {
      logStep("Auth error", authError);
      return new Response(
        JSON.stringify({ error: "User session invalid or expired. Please log in again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const user = data.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email not available");
      return new Response(
        JSON.stringify({ error: "User not authenticated or email not available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer already exists
    logStep("Checking for existing customer");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Creating new customer");
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create or find the premium subscription product and price
    let priceId;
    try {
      logStep("Setting up product and price");
      
      // First, try to find an existing product named "SleepyBaby Premium"
      const products = await stripe.products.list({ 
        active: true,
        limit: 100 
      });
      
      let product = products.data.find(p => p.name === "SleepyBaby Premium");
      
      if (!product) {
        logStep("Creating new product");
        product = await stripe.products.create({
          name: "SleepyBaby Premium",
          description: "Complete baby tracking solution with unlimited profiles, extended history, family sharing, and advanced analytics.",
        });
        logStep("Product created", { productId: product.id });
      } else {
        logStep("Found existing product", { productId: product.id });
      }

      // Find or create a price for $9.99/month
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100
      });

      let price = prices.data.find(p => 
        p.unit_amount === 999 && 
        p.currency === 'usd' && 
        p.recurring?.interval === 'month'
      );

      if (!price) {
        logStep("Creating new price");
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: 999, // $9.99 in cents
          currency: "usd",
          recurring: {
            interval: "month",
          },
        });
        logStep("Price created", { priceId: price.id });
      } else {
        logStep("Found existing price", { priceId: price.id });
      }

      priceId = price.id;
    } catch (error) {
      logStep("Error creating/finding product and price", error);
      throw new Error(`Failed to setup subscription pricing: ${error.message}`);
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    logStep("Creating checkout session", { origin, priceId, customerId });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    });

    logStep("Checkout session created successfully", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    
    // If it's a Stripe auth/session error ensure a 401 is returned
    if (
      errorMessage.includes("User not authenticated") ||
      errorMessage.includes("User session invalid") ||
      errorMessage.includes("authorization header")
    ) {
      return new Response(JSON.stringify({ error: errorMessage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    // Otherwise, treat as generic error
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

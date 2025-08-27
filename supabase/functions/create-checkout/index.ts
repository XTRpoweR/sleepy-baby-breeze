
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

    // Validate environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not set");
      return new Response(
        JSON.stringify({ error: "Payment system not configured. Please contact support." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Check if the key looks like a publishable key instead of secret key
    if (stripeKey.startsWith("pk_")) {
      logStep("ERROR: Using publishable key instead of secret key");
      return new Response(
        JSON.stringify({ error: "Invalid payment configuration. Please use a secret key, not a publishable key." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!stripeKey.startsWith("sk_")) {
      logStep("ERROR: Invalid Stripe key format");
      return new Response(
        JSON.stringify({ error: "Invalid Stripe key format. Secret keys must start with 'sk_'." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      logStep("ERROR: Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Database configuration missing." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    logStep("Environment variables validated");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required. Please log in and try again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token", { tokenLength: token.length });
    
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      logStep("Auth error", { error: authError.message, code: authError.status });
      
      if (authError.message?.includes("JWT expired") || 
          authError.message?.includes("session_not_found") ||
          authError.status === 401) {
        return new Response(
          JSON.stringify({ error: "Your login session has expired. Please sign in again to continue." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Authentication failed. Please try logging in again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const user = data.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email not available");
      return new Response(
        JSON.stringify({ error: "User authentication failed. Please log in again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    logStep("User authenticated successfully", { userId: user.id, email: user.email });

    // Initialize Stripe with enhanced error handling
    let stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      logStep("Stripe initialized");
    } catch (error) {
      logStep("Stripe initialization error", { error: error.message });
      return new Response(
        JSON.stringify({ error: "Payment system initialization failed." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Check if customer already exists
    logStep("Checking for existing customer");
    let customers;
    try {
      customers = await stripe.customers.list({ email: user.email, limit: 1 });
    } catch (error) {
      logStep("Error listing customers", { error: error.message });
      if (error.message?.includes("publishable API key")) {
        return new Response(
          JSON.stringify({ error: "Invalid payment configuration. Please use a secret key, not a publishable key." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      throw error;
    }

    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Creating new customer");
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = customer.id;
        logStep("New customer created", { customerId });
      } catch (error) {
        logStep("Error creating customer", { error: error.message });
        if (error.message?.includes("publishable API key")) {
          return new Response(
            JSON.stringify({ error: "Invalid payment configuration. Please use a secret key, not a publishable key." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
        throw error;
      }
    }

    // Use your specific product ID and get its active price
    const PRODUCT_ID = "prod_SngH6Y04uO0jIF";
    let priceId;
    
    try {
      logStep("Using existing product", { productId: PRODUCT_ID });
      
      // Get the product to verify it exists
      const product = await stripe.products.retrieve(PRODUCT_ID);
      logStep("Product retrieved", { productId: product.id, name: product.name });

      // Get active prices for this product
      const prices = await stripe.prices.list({
        product: PRODUCT_ID,
        active: true,
        limit: 10
      });

      logStep("Retrieved prices for product", { pricesCount: prices.data.length });

      if (prices.data.length === 0) {
        logStep("ERROR: No active prices found for product");
        throw new Error("No active pricing found for this product. Please contact support.");
      }

      // Find the recurring price (subscription)
      const recurringPrice = prices.data.find(price => price.recurring);
      
      if (!recurringPrice) {
        logStep("ERROR: No recurring price found");
        throw new Error("No subscription pricing found for this product.");
      }

      priceId = recurringPrice.id;
      logStep("Using recurring price", { 
        priceId, 
        amount: recurringPrice.unit_amount, 
        currency: recurringPrice.currency,
        interval: recurringPrice.recurring?.interval 
      });

    } catch (error) {
      logStep("Error retrieving product or prices", { error: error.message });
      if (error.message?.includes("publishable API key")) {
        return new Response(
          JSON.stringify({ error: "Invalid payment configuration. Please use a secret key, not a publishable key." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      throw new Error(`Failed to setup subscription pricing: ${error.message}`);
    }

    const origin = req.headers.get("origin") || "https://sleepybabyy.com";
    logStep("Creating checkout session", { origin, priceId, customerId });

    let session;
    try {
      session = await stripe.checkout.sessions.create({
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
    } catch (error) {
      logStep("Error creating checkout session", { error: error.message });
      if (error.message?.includes("publishable API key")) {
        return new Response(
          JSON.stringify({ error: "Invalid payment configuration. Please use a secret key, not a publishable key." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      throw error;
    }

    logStep("Checkout session created successfully", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    // Enhanced error categorization
    if (errorMessage.includes("publishable API key")) {
      return new Response(JSON.stringify({ 
        error: "Invalid payment configuration. Please use a Stripe secret key (starts with 'sk_'), not a publishable key (starts with 'pk_')." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (errorMessage.includes("User not authenticated") ||
        errorMessage.includes("User session invalid") ||
        errorMessage.includes("authorization header") ||
        errorMessage.includes("JWT expired") ||
        errorMessage.includes("session_not_found")) {
      return new Response(JSON.stringify({ 
        error: "Your login session has expired. Please sign in again to continue with checkout." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    if (errorMessage.includes("STRIPE_SECRET_KEY") || 
        errorMessage.includes("Payment system not configured")) {
      return new Response(JSON.stringify({ 
        error: "Payment system configuration error. Please contact support." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Generic error response
    return new Response(JSON.stringify({ 
      error: "An error occurred while setting up checkout. Please try again or contact support if the problem persists." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

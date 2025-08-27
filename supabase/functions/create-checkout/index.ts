
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

    // Validate environment variables first
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

    if (!supabaseUrl || !supabaseAnonKey) {
      logStep("ERROR: Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Database configuration missing." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    logStep("Environment variables validated");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Check for authentication (optional for guest checkout)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let isGuestCheckout = false;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      logStep("Authenticating user with token", { tokenLength: token.length });
      
      const { data, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (authError) {
        logStep("Auth error, proceeding as guest", { error: authError.message });
        isGuestCheckout = true;
      } else {
        user = data.user;
        logStep("User authenticated successfully", { userId: user?.id, email: user?.email });
      }
    } else {
      logStep("No authorization header, proceeding as guest checkout");
      isGuestCheckout = true;
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized");

    // For guest checkout, we'll let Stripe collect the email
    // For authenticated users, we'll use their existing email
    let customerId;
    let customerEmail;

    if (!isGuestCheckout && user?.email) {
      // Check if customer already exists for authenticated users
      logStep("Checking for existing customer");
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
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
      customerEmail = user.email;
    } else {
      // Guest checkout - let Stripe collect email
      logStep("Guest checkout - Stripe will collect email");
      customerEmail = undefined;
      customerId = undefined;
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
      throw new Error(`Failed to setup subscription pricing: ${error.message}`);
    }

    const origin = req.headers.get("origin") || "https://sleepybabyy.com";
    
    // Different success URLs for guest vs authenticated users
    const successUrl = isGuestCheckout 
      ? `${origin}/complete-setup?session_id={CHECKOUT_SESSION_ID}`
      : `${origin}/dashboard?success=true`;
    
    logStep("Creating checkout session", { origin, priceId, customerId, isGuestCheckout });

    const sessionConfig: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: `${origin}?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    };

    // Add customer info if available
    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    // Add metadata
    if (user?.id) {
      sessionConfig.metadata = { user_id: user.id };
      sessionConfig.subscription_data = { metadata: { user_id: user.id } };
    } else {
      sessionConfig.metadata = { guest_checkout: "true" };
      sessionConfig.subscription_data = { metadata: { guest_checkout: "true" } };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created successfully", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    return new Response(JSON.stringify({ 
      error: "An error occurred while setting up checkout. Please try again or contact support if the problem persists." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

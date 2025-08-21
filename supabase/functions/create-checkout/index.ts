
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

// Currency and pricing configuration
const PRICING_CONFIG = {
  "USD": { amount: 999, country_codes: ["US", "CA"] },
  "EUR": { amount: 999, country_codes: ["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PT", "IE", "FI", "LU", "MT", "CY", "SK", "SI", "EE", "LV", "LT"] },
  "SEK": { amount: 1099, country_codes: ["SE"] },
  "GBP": { amount: 899, country_codes: ["GB"] }
};

const detectCurrencyFromRequest = (req: Request): string => {
  // Try to get currency from request body or headers
  const acceptLanguage = req.headers.get("accept-language") || "";
  const cfIpCountry = req.headers.get("cf-ipcountry") || "";
  
  logStep("Detecting currency", { acceptLanguage, cfIpCountry });
  
  // Check country from Cloudflare header first
  if (cfIpCountry) {
    for (const [currency, config] of Object.entries(PRICING_CONFIG)) {
      if (config.country_codes.includes(cfIpCountry)) {
        logStep("Currency detected from CF country", { country: cfIpCountry, currency });
        return currency;
      }
    }
  }
  
  // Fallback to language detection
  if (acceptLanguage.includes("sv") || acceptLanguage.includes("se")) return "SEK";
  if (acceptLanguage.includes("de") || acceptLanguage.includes("fr") || acceptLanguage.includes("it") || acceptLanguage.includes("es")) return "EUR";
  if (acceptLanguage.includes("en-GB") || acceptLanguage.includes("gb")) return "GBP";
  
  // Default to EUR for better Klarna coverage
  return "EUR";
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

    // Detect currency for this request
    const currency = detectCurrencyFromRequest(req);
    const pricingInfo = PRICING_CONFIG[currency as keyof typeof PRICING_CONFIG];
    logStep("Currency and pricing determined", { currency, amount: pricingInfo.amount });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized");

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

    // Use your specific product ID and create/get price for the detected currency
    const PRODUCT_ID = "prod_SngH6Y04uO0jIF";
    let priceId;
    
    try {
      logStep("Using existing product", { productId: PRODUCT_ID });
      
      // Get the product to verify it exists
      const product = await stripe.products.retrieve(PRODUCT_ID);
      logStep("Product retrieved", { productId: product.id, name: product.name });

      // Get active prices for this product with the detected currency
      const prices = await stripe.prices.list({
        product: PRODUCT_ID,
        active: true,
        currency: currency.toLowerCase(),
        limit: 10
      });

      logStep("Retrieved prices for product and currency", { pricesCount: prices.data.length, currency });

      // Find the recurring price (subscription) for this currency
      const recurringPrice = prices.data.find(price => price.recurring);
      
      if (recurringPrice) {
        priceId = recurringPrice.id;
        logStep("Found existing recurring price", { 
          priceId, 
          amount: recurringPrice.unit_amount, 
          currency: recurringPrice.currency,
          interval: recurringPrice.recurring?.interval 
        });
      } else {
        // Create a new price for this currency if it doesn't exist
        logStep("Creating new price for currency", { currency, amount: pricingInfo.amount });
        
        const newPrice = await stripe.prices.create({
          product: PRODUCT_ID,
          unit_amount: pricingInfo.amount,
          currency: currency.toLowerCase(),
          recurring: {
            interval: 'month',
          },
        });
        
        priceId = newPrice.id;
        logStep("Created new recurring price", { 
          priceId, 
          amount: newPrice.unit_amount, 
          currency: newPrice.currency,
          interval: newPrice.recurring?.interval 
        });
      }

    } catch (error) {
      logStep("Error retrieving/creating product prices", { error: error.message });
      throw new Error(`Failed to setup subscription pricing: ${error.message}`);
    }

    const origin = req.headers.get("origin") || "https://sleepybabyy.com";
    logStep("Creating checkout session", { origin, priceId, customerId, currency });

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
      // Enable automatic payment methods including Klarna
      automatic_payment_methods: {
        enabled: true,
      },
      // Explicitly include payment method types for better control
      payment_method_types: [
        'card',
        'klarna',
        'sepa_debit',
        'sofort',
        'bancontact',
        'ideal',
        'giropay',
        'eps',
        'p24',
      ],
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
    logStep("ERROR in create-checkout", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    // Enhanced error categorization
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GUEST-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Guest checkout function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    if (stripeKey.startsWith("pk_")) {
      logStep("ERROR: Using publishable key instead of secret key");
      throw new Error("Using publishable key instead of secret key");
    }

    logStep("Environment variables validated");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized");

    const origin = req.headers.get("origin") || "https://sleepybabyy.com";
    logStep("Request origin", { origin });

    // Get or create the premium product
    const productId = "prod_SngH6Y04uO0jIF";
    logStep("Using existing product", { productId });

    const product = await stripe.products.retrieve(productId);
    logStep("Product retrieved", { productId, name: product.name });

    // Get active prices for the product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    if (prices.data.length === 0) {
      throw new Error("No active prices found for product");
    }

    logStep("Retrieved prices for product", { pricesCount: prices.data.length });

    // Find the recurring price (monthly subscription)
    const recurringPrice = prices.data.find(price => price.recurring);
    if (!recurringPrice) {
      throw new Error("No recurring price found for product");
    }

    logStep("Using recurring price", {
      priceId: recurringPrice.id,
      amount: recurringPrice.unit_amount,
      currency: recurringPrice.currency,
      interval: recurringPrice.recurring?.interval
    });

    // Create unique guest identifier for this session
    const guestId = crypto.randomUUID();
    const guestEmail = `guest-${guestId}@sleepybabyy.com`;

    logStep("Creating guest checkout session", { guestEmail });

    // Create checkout session for guest
    const session = await stripe.checkout.sessions.create({
      customer_email: guestEmail,
      line_items: [
        {
          price: recurringPrice.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/post-purchase-setup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        guest_checkout: "true",
        guest_id: guestId,
      },
      subscription_data: {
        metadata: {
          guest_checkout: "true",
          guest_id: guestId,
        },
      },
    });

    logStep("Guest checkout session created successfully", {
      sessionId: session.id,
      url: session.url
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in guest checkout", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
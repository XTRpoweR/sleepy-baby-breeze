// Returns the Stripe invoice id + amount/currency for a completed checkout session
// so the browser can fire a Meta Pixel Purchase event with a deterministic
// event_id (`purchase_${invoice.id}`) that matches the server-side CAPI event
// fired from `invoice.payment_succeeded`. This is what enables Meta to
// deduplicate browser + server Purchase events.
//
// Public function (verify_jwt = false) — only returns data for the
// authenticated user's own customer.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!stripeKey || !supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "not_configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "auth_required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !userData.user?.email) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body?.session_id;
    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return new Response(JSON.stringify({ error: "invalid_session_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to the authenticated user's customer
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (!customerId) {
      return new Response(JSON.stringify({ error: "no_customer" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const customer = await stripe.customers.retrieve(customerId);
    if ("deleted" in customer && customer.deleted) {
      return new Response(JSON.stringify({ error: "customer_deleted" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if ((customer as Stripe.Customer).email?.toLowerCase() !== user.email?.toLowerCase()) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve the latest invoice for the subscription created by this session
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (!subscriptionId) {
      return new Response(JSON.stringify({ ok: true, invoice_id: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const latestInvoiceId = typeof subscription.latest_invoice === "string"
      ? subscription.latest_invoice
      : subscription.latest_invoice?.id;

    let amountPaid = 0;
    let currency = "usd";
    if (latestInvoiceId) {
      const inv = await stripe.invoices.retrieve(latestInvoiceId);
      amountPaid = (inv.amount_paid || 0) / 100;
      currency = (inv.currency || "usd").toUpperCase();
    }

    return new Response(
      JSON.stringify({
        ok: true,
        invoice_id: latestInvoiceId || null,
        subscription_id: subscriptionId,
        amount_paid: amountPaid,
        currency,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[get-checkout-purchase] error", (e as Error).message);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

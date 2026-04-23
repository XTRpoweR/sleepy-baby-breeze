// One-shot setup function: archives old prices and creates new ones
// for monthly ($7.99), quarterly ($19.99 / 3 months), annual ($69.99/year)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCT_ID = "prod_SngH6Y04uO0jIF";

const NEW_PRICES = [
  { plan_key: "monthly", amount_cents: 799, interval: "month", interval_count: 1, nickname: "Premium Monthly $7.99" },
  { plan_key: "quarterly", amount_cents: 1999, interval: "month", interval_count: 3, nickname: "Premium 3 Months $19.99" },
  { plan_key: "annual", amount_cents: 6999, interval: "year", interval_count: 1, nickname: "Premium Annual $69.99" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const log: string[] = [];

    // 1) Archive all currently active prices for the product
    const existing = await stripe.prices.list({ product: PRODUCT_ID, active: true, limit: 100 });
    log.push(`Found ${existing.data.length} active prices to archive`);

    for (const p of existing.data) {
      try {
        await stripe.prices.update(p.id, { active: false });
        log.push(`Archived ${p.id} (${p.unit_amount}c ${p.recurring?.interval})`);
      } catch (e: any) {
        log.push(`Failed to archive ${p.id}: ${e.message}`);
      }
    }

    // 2) Create the 3 new prices and persist to DB
    const created: any[] = [];
    for (const cfg of NEW_PRICES) {
      const price = await stripe.prices.create({
        product: PRODUCT_ID,
        unit_amount: cfg.amount_cents,
        currency: "usd",
        recurring: {
          interval: cfg.interval as any,
          interval_count: cfg.interval_count,
        },
        nickname: cfg.nickname,
        metadata: { plan_key: cfg.plan_key },
      });
      log.push(`Created ${cfg.plan_key} -> ${price.id}`);

      await supabase.from("stripe_price_config").upsert(
        {
          plan_key: cfg.plan_key,
          stripe_price_id: price.id,
          amount_cents: cfg.amount_cents,
          currency: "usd",
          interval: cfg.interval,
          interval_count: cfg.interval_count,
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "plan_key" }
      );

      created.push({ plan_key: cfg.plan_key, price_id: price.id, amount_cents: cfg.amount_cents });
    }

    return new Response(JSON.stringify({ ok: true, created, log }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[setup-stripe-prices] ERROR:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Auto-send a marketing_events row to Meta Conversions API.
// Triggered by a Postgres AFTER INSERT trigger via pg_net.
// Public endpoint (verify_jwt=false). Idempotent: skips rows where capi_sent=true.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const PIXEL_ID = "956706330308177";
const ACCESS_TOKEN =
  Deno.env.get("META_CAPI_ACCESS_TOKEN") ??
  Deno.env.get("META_CONVERSIONS_API_TOKEN") ??
  "";
const GRAPH_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ ok: false, error: "capi_not_configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { event_id } = await req.json();
    if (!event_id) {
      return new Response(JSON.stringify({ ok: false, error: "missing_event_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: event, error } = await supabase
      .from("marketing_events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (error || !event) {
      return new Response(JSON.stringify({ ok: false, error: "event_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.capi_sent) {
      return new Response(JSON.stringify({ ok: true, message: "already_sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build user_data — prefer pre-hashed email; otherwise hash email/external_id
    const ud: Record<string, unknown> = {};
    if (event.email_hash) ud.em = [event.email_hash];
    else if (event.email) ud.em = [await sha256Hex(event.email)];
    if (event.phone_hash) ud.ph = [event.phone_hash];
    if (event.external_id) ud.external_id = [await sha256Hex(String(event.external_id))];
    else if (event.user_id) ud.external_id = [await sha256Hex(String(event.user_id))];
    if (event.client_user_agent || event.user_agent)
      ud.client_user_agent = event.client_user_agent || event.user_agent;
    if (event.ip_address) ud.client_ip_address = event.ip_address;
    if (event.fbp) ud.fbp = event.fbp;
    if (event.fbc) ud.fbc = event.fbc;

    const customData: Record<string, unknown> = {
      currency: event.currency || "USD",
    };
    if (event.value != null) customData.value = parseFloat(String(event.value));
    if (event.content_name) customData.content_name = event.content_name;
    if (event.content_category) customData.content_category = event.content_category;
    if (event.content_ids) customData.content_ids = event.content_ids;

    const eventTime = Math.floor(
      new Date(event.created_at ?? Date.now()).getTime() / 1000,
    );

    const payload = {
      data: [
        {
          event_name: event.event_name,
          event_time: eventTime,
          event_id: event.event_id || event.id,
          event_source_url: event.page_url || "https://sleepybabyy.com/",
          action_source: "website",
          user_data: ud,
          custom_data: customData,
        },
      ],
    };

    const resp = await fetch(`${GRAPH_URL}?access_token=${ACCESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await resp.json().catch(() => ({}));

    await supabase
      .from("marketing_events")
      .update({
        capi_sent: resp.ok,
        capi_sent_at: new Date().toISOString(),
        capi_response: result,
        capi_error: resp.ok ? null : JSON.stringify(result).slice(0, 2000),
      })
      .eq("id", event_id);

    return new Response(JSON.stringify({ ok: resp.ok, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-capi-event error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

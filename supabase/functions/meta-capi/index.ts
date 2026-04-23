// Meta Conversions API (CAPI) relay
// Receives event data from the client and forwards it server-side to Meta
// using the Conversions API for accurate, ad-blocker-resilient tracking.
//
// Public function (verify_jwt = false in supabase/config.toml) so it can be
// called from anonymous landing pages (e.g. PageView on /).

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const PIXEL_ID = "956706330308177";
const ACCESS_TOKEN = Deno.env.get("META_CAPI_ACCESS_TOKEN") ?? "";
const GRAPH_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// SHA-256 hex digest (Meta requires hashed PII)
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface CapiPayload {
  event_name: string;
  event_id?: string;
  event_source_url?: string;
  action_source?: "website" | "email" | "app" | "phone_call" | "chat" | "physical_store" | "system_generated" | "other";
  user_data?: {
    email?: string;
    external_id?: string;
    client_user_agent?: string;
    fbp?: string; // _fbp cookie
    fbc?: string; // _fbc cookie
  };
  custom_data?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ACCESS_TOKEN) {
      console.error("META_CAPI_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ ok: false, error: "capi_not_configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as CapiPayload;
    if (!body?.event_name) {
      return new Response(
        JSON.stringify({ ok: false, error: "missing_event_name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Best-effort client IP from headers
    const xff = req.headers.get("x-forwarded-for") ?? "";
    const clientIp = xff.split(",")[0]?.trim() || undefined;

    const ud: Record<string, unknown> = {};
    if (body.user_data?.email) ud.em = [await sha256Hex(body.user_data.email)];
    if (body.user_data?.external_id) ud.external_id = [await sha256Hex(body.user_data.external_id)];
    if (body.user_data?.client_user_agent) ud.client_user_agent = body.user_data.client_user_agent;
    if (clientIp) ud.client_ip_address = clientIp;
    if (body.user_data?.fbp) ud.fbp = body.user_data.fbp;
    if (body.user_data?.fbc) ud.fbc = body.user_data.fbc;

    const payload = {
      data: [
        {
          event_name: body.event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: body.event_id, // for browser+server dedupe
          event_source_url: body.event_source_url,
          action_source: body.action_source ?? "website",
          user_data: ud,
          custom_data: body.custom_data ?? {},
        },
      ],
    };

    const res = await fetch(`${GRAPH_URL}?access_token=${encodeURIComponent(ACCESS_TOKEN)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Meta CAPI error", res.status, text);
      return new Response(
        JSON.stringify({ ok: false, status: res.status, error: text }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true, meta: JSON.parse(text) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("meta-capi exception", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

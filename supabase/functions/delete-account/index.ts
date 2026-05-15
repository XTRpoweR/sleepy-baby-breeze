import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function safeDelete(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e) {
    console.error(`[delete-account] step "${label}" failed`, e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid user or session. Please re-login." }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const user_id = user.id;
    const user_email = user.email ?? null;

    // Collect owned baby ids (their child rows must be removed first)
    const { data: babies } = await supabase.from("baby_profiles").select("id").eq("user_id", user_id);
    const babyIds: string[] = (babies ?? []).map((b: { id: string }) => b.id);

    // Collect owned chat conversation ids (chat_messages reference them)
    const { data: convs } = await supabase.from("chat_conversations").select("id").eq("user_id", user_id);
    const convIds: string[] = (convs ?? []).map((c: { id: string }) => c.id);

    // Step A — child rows of owned babies
    if (babyIds.length > 0) {
      await safeDelete("baby_activities", () => supabase.from("baby_activities").delete().in("baby_id", babyIds));
      await safeDelete("sleep_schedules", () => supabase.from("sleep_schedules").delete().in("baby_id", babyIds));
      await safeDelete("family_members(by baby)", () => supabase.from("family_members").delete().in("baby_id", babyIds));
      await safeDelete("family_invitations(by baby)", () => supabase.from("family_invitations").delete().in("baby_id", babyIds));
      await safeDelete("scheduled_notifications(by baby)", () => supabase.from("scheduled_notifications").delete().in("baby_id", babyIds));
      await safeDelete("family_messages(by baby)", () => supabase.from("family_messages").delete().in("baby_id", babyIds));
    }

    // Step B — chat data
    if (convIds.length > 0) {
      await safeDelete("chat_messages", () => supabase.from("chat_messages").delete().in("conversation_id", convIds));
    }
    await safeDelete("chat_conversations", () => supabase.from("chat_conversations").delete().eq("user_id", user_id));

    // Step C — direct user references
    await safeDelete("family_members(by user)", () => supabase.from("family_members").delete().eq("user_id", user_id));
    await safeDelete("family_members(invited_by)", () => supabase.from("family_members").delete().eq("invited_by", user_id));
    await safeDelete("family_invitations(invited_by)", () => supabase.from("family_invitations").delete().eq("invited_by", user_id));
    if (user_email) {
      await safeDelete("family_invitations(by email)", () => supabase.from("family_invitations").delete().eq("email", user_email));
    }
    await safeDelete("family_messages(by sender)", () => supabase.from("family_messages").delete().eq("sender_id", user_id));
    await safeDelete("message_participants", () => supabase.from("message_participants").delete().eq("user_id", user_id));
    await safeDelete("baby_memories", () => supabase.from("baby_memories").delete().eq("user_id", user_id));
    await safeDelete("baby_profiles", () => supabase.from("baby_profiles").delete().eq("user_id", user_id));
    await safeDelete("subscriptions", () => supabase.from("subscriptions").delete().eq("user_id", user_id));
    await safeDelete("user_queries", () => supabase.from("user_queries").delete().eq("user_id", user_id));
    await safeDelete("user_locations", () => supabase.from("user_locations").delete().eq("user_id", user_id));
    await safeDelete("push_subscriptions", () => supabase.from("push_subscriptions").delete().eq("user_id", user_id));
    await safeDelete("scheduled_notifications", () => supabase.from("scheduled_notifications").delete().eq("user_id", user_id));
    await safeDelete("security_events", () => supabase.from("security_events").delete().eq("user_id", user_id));
    await safeDelete("user_sessions", () => supabase.from("user_sessions").delete().eq("user_id", user_id));
    await safeDelete("notification_settings", () => supabase.from("notification_settings").delete().eq("user_id", user_id));
    await safeDelete("marketing_events", () => supabase.from("marketing_events").delete().eq("user_id", user_id));

    // Anonymise admin reply attribution (preserve the customer messages themselves)
    await safeDelete("contact_messages(replied_by null)", () =>
      supabase.from("contact_messages").update({ replied_by: null }).eq("replied_by", user_id)
    );

    if (user_email) {
      await safeDelete("newsletter_subscribers", () => supabase.from("newsletter_subscribers").delete().eq("email", user_email));
      await safeDelete("password_reset_codes", () => supabase.from("password_reset_codes").delete().eq("email", user_email));
    }

    // Profile row last (FK -> auth.users)
    await safeDelete("profiles", () => supabase.from("profiles").delete().eq("id", user_id));

    // Finally, the auth user
    const { error: deleteErr } = await supabase.auth.admin.deleteUser(user_id);
    if (deleteErr) {
      return new Response(JSON.stringify({ error: "Failed to delete user from auth: " + deleteErr.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Delete account error", err);
    return new Response(JSON.stringify({ error: "An error occurred. Please contact support." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

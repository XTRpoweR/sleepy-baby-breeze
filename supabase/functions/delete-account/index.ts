
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

// Setup Supabase admin client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check - get the JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Get user from token
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid user or session. Please re-login." }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const user_id = user.id;

    // Delete related tables first (order matters to avoid foreign key issues)
    await supabase.from("family_members").delete().eq("user_id", user_id);
    await supabase.from("family_invitations").delete().eq("invited_by", user_id);
    await supabase.from("baby_memories").delete().eq("user_id", user_id);

    // Get all owned baby profiles; delete their activities and then the profiles themselves
    const { data: babies, error: babyListErr } = await supabase.from("baby_profiles").select("id").eq("user_id", user_id);
    if (!babyListErr && babies) {
      for (const baby of babies) {
        await supabase.from("baby_activities").delete().eq("baby_id", baby.id);
        await supabase.from("sleep_schedules").delete().eq("baby_id", baby.id);
      }
      await supabase.from("baby_profiles").delete().eq("user_id", user_id);
    }

    // Delete subscriptions
    await supabase.from("subscriptions").delete().eq("user_id", user_id);

    // Delete their profile row if present
    await supabase.from("profiles").delete().eq("id", user_id);

    // Finally, delete the user from auth
    const { error: deleteErr } = await supabase.auth.admin.deleteUser(user_id);
    if (deleteErr) {
      return new Response(JSON.stringify({ error: "Failed to delete user from auth: " + deleteErr.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.log("Delete account error", err);
    return new Response(JSON.stringify({ error: "Server error: " + err }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

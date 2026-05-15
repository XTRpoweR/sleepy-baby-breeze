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

async function safeSelect<T>(label: string, fn: () => Promise<{ data: T | null }>): Promise<T | null> {
  try {
    const { data } = await fn();
    return data ?? null;
  } catch (e) {
    console.error(`[export-user-data] read "${label}" failed`, e);
    return null;
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid user or session. Please re-login." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user_id = user.id;
    const user_email = user.email ?? null;

    const babies = await safeSelect("baby_profiles", () =>
      supabase.from("baby_profiles").select("*").eq("user_id", user_id)
    ) as Array<{ id: string }> | null;
    const babyIds = (babies ?? []).map((b) => b.id);

    const convs = await safeSelect("chat_conversations", () =>
      supabase.from("chat_conversations").select("*").eq("user_id", user_id)
    ) as Array<{ id: string }> | null;
    const convIds = (convs ?? []).map((c) => c.id);

    const [
      profile,
      babyActivities,
      babyMemories,
      sleepSchedules,
      familyMembers,
      familyMembersInvitedBy,
      familyInvitationsByUser,
      familyInvitationsByEmail,
      familyMessages,
      messageParticipants,
      chatMessages,
      subscriptions,
      userQueries,
      userLocations,
      pushSubscriptions,
      scheduledNotifications,
      securityEvents,
      userSessions,
      notificationSettings,
      newsletterSubscribers,
    ] = await Promise.all([
      safeSelect("profile", () => supabase.from("profiles").select("*").eq("id", user_id).maybeSingle()),
      babyIds.length ? safeSelect("baby_activities", () => supabase.from("baby_activities").select("*").in("baby_id", babyIds)) : Promise.resolve([]),
      safeSelect("baby_memories", () => supabase.from("baby_memories").select("*").eq("user_id", user_id)),
      babyIds.length ? safeSelect("sleep_schedules", () => supabase.from("sleep_schedules").select("*").in("baby_id", babyIds)) : Promise.resolve([]),
      safeSelect("family_members", () => supabase.from("family_members").select("*").eq("user_id", user_id)),
      safeSelect("family_members_invited_by", () => supabase.from("family_members").select("*").eq("invited_by", user_id)),
      safeSelect("family_invitations_by_user", () => supabase.from("family_invitations").select("*").eq("invited_by", user_id)),
      user_email ? safeSelect("family_invitations_by_email", () => supabase.from("family_invitations").select("*").eq("email", user_email)) : Promise.resolve([]),
      safeSelect("family_messages", () => supabase.from("family_messages").select("*").eq("sender_id", user_id)),
      safeSelect("message_participants", () => supabase.from("message_participants").select("*").eq("user_id", user_id)),
      convIds.length ? safeSelect("chat_messages", () => supabase.from("chat_messages").select("*").in("conversation_id", convIds)) : Promise.resolve([]),
      safeSelect("subscriptions", () => supabase.from("subscriptions").select("*").eq("user_id", user_id)),
      safeSelect("user_queries", () => supabase.from("user_queries").select("*").eq("user_id", user_id)),
      safeSelect("user_locations", () => supabase.from("user_locations").select("*").eq("user_id", user_id)),
      safeSelect("push_subscriptions", () => supabase.from("push_subscriptions").select("*").eq("user_id", user_id)),
      safeSelect("scheduled_notifications", () => supabase.from("scheduled_notifications").select("*").eq("user_id", user_id)),
      safeSelect("security_events", () => supabase.from("security_events").select("*").eq("user_id", user_id)),
      safeSelect("user_sessions", () => supabase.from("user_sessions").select("*").eq("user_id", user_id)),
      safeSelect("notification_settings", () => supabase.from("notification_settings").select("*").eq("user_id", user_id)),
      user_email ? safeSelect("newsletter_subscribers", () => supabase.from("newsletter_subscribers").select("*").eq("email", user_email)) : Promise.resolve([]),
    ]);

    const exportData = {
      export_version: "1.0",
      exported_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        user_metadata: user.user_metadata,
      },
      profile,
      babies: babies ?? [],
      baby_activities: babyActivities ?? [],
      baby_memories: babyMemories ?? [],
      sleep_schedules: sleepSchedules ?? [],
      family: {
        memberships: familyMembers ?? [],
        members_invited_by_me: familyMembersInvitedBy ?? [],
        invitations_sent: familyInvitationsByUser ?? [],
        invitations_received: familyInvitationsByEmail ?? [],
        messages_sent: familyMessages ?? [],
        message_participations: messageParticipants ?? [],
      },
      chat: {
        conversations: convs ?? [],
        messages: chatMessages ?? [],
      },
      subscriptions: subscriptions ?? [],
      notifications: {
        settings: notificationSettings ?? [],
        push_subscriptions: pushSubscriptions ?? [],
        scheduled: scheduledNotifications ?? [],
      },
      activity: {
        user_queries: userQueries ?? [],
        user_locations: userLocations ?? [],
        security_events: securityEvents ?? [],
        user_sessions: userSessions ?? [],
      },
      newsletter_subscribers: newsletterSubscribers ?? [],
    };

    const filename = `sleepybabyy-data-${user_id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Export user data error", err);
    return new Response(JSON.stringify({ error: "An error occurred while exporting your data." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

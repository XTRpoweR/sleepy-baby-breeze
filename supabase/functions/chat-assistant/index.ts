import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// Static catalogue of sound tracks available in the app. Must match the
// list in src/hooks/useAudioPlayer.tsx — the AI uses this to offer choices.
const SOUND_TRACKS = [
  { id: "heavy-rain-drops", name: "Heavy Rain", description: "Heavy rain drops for relaxation.", url: "/sounds/mixkit-heavy-rain-drops-2399.mp3" },
  { id: "water-fountain-healing", name: "Water Fountain", description: "Healing music with a peaceful fountain.", url: "/sounds/water-fountain-healing-music-239455.mp3" },
  { id: "waves-sad-piano", name: "Waves & Piano", description: "Calming piano + ocean waves.", url: "/sounds/waves-and-tears-sad-piano-music-with-calm-ocean-waves-8164.mp3" },
  { id: "dark-atmosphere-rain", name: "Atmospheric Rain", description: "Deep atmospheric rain.", url: "/sounds/dark-atmosphere-with-rain-352570.mp3" },
  { id: "nature-investigation", name: "Nature Ambient", description: "Natural ambient sounds.", url: "/sounds/nature-investigation-255161.mp3" },
  { id: "soft-birds-sound", name: "Soft Birds", description: "Gentle bird chirping.", url: "/sounds/soft-birds-sound-304132.mp3" },
];

type ApiSuccess = {
  ok: true;
  conversationId?: string;
  content: string;
  actions?: any[];
};

type ApiError = {
  ok: false;
  error: string;
  message: string;
  conversationId?: string;
};

function jsonResponse(payload: ApiSuccess | ApiError, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const tools = [
  {
    type: "function",
    function: {
      name: "start_sleep_session",
      description:
        "Start a new sleep session for a baby. Use when user says things like 'start sleep', 'baby is sleeping now', 'بدأ النوم'.",
      parameters: {
        type: "object",
        properties: {
          baby_id: { type: "string", description: "Baby profile UUID" },
          start_time: { type: "string", description: "ISO timestamp when sleep started. Default: now." },
          notes: { type: "string" },
        },
        required: ["baby_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "end_sleep_session",
      description: "End the most recent open sleep session for a baby.",
      parameters: {
        type: "object",
        properties: {
          baby_id: { type: "string" },
          end_time: { type: "string" },
          notes: { type: "string" },
        },
        required: ["baby_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_feeding",
      description: "Log a feeding activity (breast, bottle, or solid).",
      parameters: {
        type: "object",
        properties: {
          baby_id: { type: "string" },
          feeding_type: { type: "string", enum: ["breast", "bottle", "solid"] },
          amount_ml: { type: "number" },
          duration_minutes: { type: "number" },
          side: { type: "string", enum: ["left", "right", "both"] },
          start_time: { type: "string" },
          notes: { type: "string" },
        },
        required: ["baby_id", "feeding_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_diaper",
      description: "Log a diaper change.",
      parameters: {
        type: "object",
        properties: {
          baby_id: { type: "string" },
          diaper_type: { type: "string", enum: ["wet", "dirty", "both"] },
          start_time: { type: "string" },
          notes: { type: "string" },
        },
        required: ["baby_id", "diaper_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_custom_activity",
      description: "Log any custom activity (bath, play, medicine, milestone, etc.)",
      parameters: {
        type: "object",
        properties: {
          baby_id: { type: "string" },
          activity_name: { type: "string" },
          duration_minutes: { type: "number" },
          start_time: { type: "string" },
          notes: { type: "string" },
        },
        required: ["baby_id", "activity_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_notification_settings",
      description:
        "Update specific notification preferences. Use this for partial updates (e.g. only feeding reminders, or only quiet hours).",
      parameters: {
        type: "object",
        properties: {
          notifications_enabled: { type: "boolean" },
          feeding_reminders: { type: "boolean" },
          sleep_reminders: { type: "boolean" },
          milestone_reminders: { type: "boolean" },
          pattern_alerts: { type: "boolean" },
          feeding_interval: { type: "number" },
          quiet_hours_enabled: { type: "boolean" },
          quiet_hours_start: { type: "string" },
          quiet_hours_end: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "enable_all_notifications",
      description:
        "Turn ON all notifications at once (master switch + every notification type). Use immediately, without confirmation, when the user says 'turn on all notifications' / 'كلها' / 'شغل الكل'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "disable_all_notifications",
      description:
        "Turn OFF all notifications at once (master switch + every notification type). Use immediately, without confirmation, when the user says 'turn off all notifications' / 'اطفئها كلها' / 'اوقف الكل'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "list_babies",
      description: "List all baby profiles the user has access to.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_baby_stats",
      description:
        "Get detailed statistics for a specific baby — today's totals (sleep, feedings, diapers), last activity times, and 7-day averages. Use when the user asks 'how much did baby sleep today', 'كم نام اليوم', 'show stats', etc.",
      parameters: {
        type: "object",
        properties: {
          baby_id: { type: "string", description: "Baby profile UUID. Omit to use the active baby." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_subscription_details",
      description:
        "Get the user's current subscription: plan tier, status, when it ends/renews, and how to upgrade or downgrade. Use when user asks 'when does my subscription end', 'how do I upgrade', 'how to cancel', 'متى ينتهي اشتراكي', 'كيف ارقي اشتراكي'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "play_music",
      description:
        "Play a sound/lullaby in the SleepyBabyy player. If the user did NOT specify a track, FIRST list available choices in your reply and ask them to pick — do not call this tool yet. Once they pick, call with track_id. If they say 'any' / 'whatever' / 'اي شيء', pick one yourself.",
      parameters: {
        type: "object",
        properties: {
          track_id: {
            type: "string",
            description: "One of: heavy-rain-drops, water-fountain-healing, waves-sad-piano, dark-atmosphere-rain, nature-investigation, soft-birds-sound.",
            enum: SOUND_TRACKS.map((t) => t.id),
          },
        },
        required: ["track_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "stop_music",
      description:
        "Stop the currently playing sound/lullaby. Use immediately when the user says 'stop music', 'اوقف الموسيقى', 'اطفئ الصوت'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "connect_human_support",
      description:
        "Open the in-app human support form so the user can submit a ticket to support@sleepybabyy.com. Call this when the user wants a real person, asks for a refund/billing dispute, is frustrated, reports a bug you cannot solve, or requests anything account-specific. Available to ALL users (free and Premium).",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Short reason: 'refund', 'billing', 'bug', 'general', 'frustrated'" },
        },
      },
    },
  },
];

async function executeTool(
  name: string,
  args: any,
  ctx: { admin: any; userId: string; defaultBabyId: string | null; subscription?: any },
): Promise<{ ok: boolean; result?: any; error?: string; client_action?: any }> {
  const { admin, userId, defaultBabyId } = ctx;
  const babyId = args.baby_id || defaultBabyId;

  try {
    switch (name) {
      case "list_babies": {
        const { data: owned } = await admin
          .from("baby_profiles")
          .select("id, name, birth_date, is_active")
          .eq("user_id", userId);
        const { data: shared } = await admin
          .from("family_members")
          .select("baby_profiles!inner(id, name, birth_date, is_active)")
          .eq("user_id", userId)
          .eq("status", "active");
        const sharedBabies = (shared || []).map((s: any) => s.baby_profiles);
        return { ok: true, result: [...(owned || []), ...sharedBabies] };
      }

      case "start_sleep_session": {
        if (!babyId) return { ok: false, error: "No baby selected" };
        const { data: open } = await admin
          .from("baby_activities")
          .select("id")
          .eq("baby_id", babyId)
          .eq("activity_type", "sleep")
          .is("end_time", null)
          .maybeSingle();
        if (open) return { ok: false, error: "Sleep session already in progress" };
        const { data, error } = await admin
          .from("baby_activities")
          .insert({
            baby_id: babyId,
            activity_type: "sleep",
            start_time: args.start_time || new Date().toISOString(),
            notes: args.notes || null,
            metadata: { logged_via: "chat_assistant" },
          })
          .select()
          .single();
        if (error) return { ok: false, error: error.message };
        return { ok: true, result: data };
      }

      case "end_sleep_session": {
        if (!babyId) return { ok: false, error: "No baby selected" };
        const { data: open } = await admin
          .from("baby_activities")
          .select("id, start_time")
          .eq("baby_id", babyId)
          .eq("activity_type", "sleep")
          .is("end_time", null)
          .order("start_time", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!open) return { ok: false, error: "No open sleep session" };
        const endTime = args.end_time || new Date().toISOString();
        const duration = Math.max(1, Math.round(
          (new Date(endTime).getTime() - new Date(open.start_time).getTime()) / 60000,
        ));
        const { data, error } = await admin
          .from("baby_activities")
          .update({
            end_time: endTime,
            duration_minutes: duration,
            notes: args.notes || undefined,
          })
          .eq("id", open.id)
          .select()
          .single();
        if (error) return { ok: false, error: error.message };
        return { ok: true, result: data };
      }

      case "log_feeding": {
        if (!babyId) return { ok: false, error: "No baby selected" };
        const startTime = args.start_time || new Date().toISOString();
        const metadata: any = { feeding_type: args.feeding_type, logged_via: "chat_assistant" };
        if (args.amount_ml) metadata.amount_ml = args.amount_ml;
        if (args.side) metadata.side = args.side;
        const endTime = args.duration_minutes
          ? new Date(new Date(startTime).getTime() + args.duration_minutes * 60000).toISOString()
          : undefined;
        const { data, error } = await admin
          .from("baby_activities")
          .insert({
            baby_id: babyId,
            activity_type: "feeding",
            start_time: startTime,
            end_time: endTime,
            duration_minutes: args.duration_minutes,
            notes: args.notes || null,
            metadata,
          })
          .select()
          .single();
        if (error) return { ok: false, error: error.message };
        return { ok: true, result: data };
      }

      case "log_diaper": {
        if (!babyId) return { ok: false, error: "No baby selected" };
        const { data, error } = await admin
          .from("baby_activities")
          .insert({
            baby_id: babyId,
            activity_type: "diaper",
            start_time: args.start_time || new Date().toISOString(),
            notes: args.notes || null,
            metadata: { diaper_type: args.diaper_type, logged_via: "chat_assistant" },
          })
          .select()
          .single();
        if (error) return { ok: false, error: error.message };
        return { ok: true, result: data };
      }

      case "log_custom_activity": {
        if (!babyId) return { ok: false, error: "No baby selected" };
        const { data, error } = await admin
          .from("baby_activities")
          .insert({
            baby_id: babyId,
            activity_type: "custom",
            start_time: args.start_time || new Date().toISOString(),
            duration_minutes: args.duration_minutes,
            notes: args.notes || args.activity_name,
            metadata: { activity_name: args.activity_name, logged_via: "chat_assistant" },
          })
          .select()
          .single();
        if (error) return { ok: false, error: error.message };
        return { ok: true, result: data };
      }

      case "update_notification_settings": {
        const allowed = [
          "notifications_enabled", "feeding_reminders", "sleep_reminders",
          "milestone_reminders", "pattern_alerts", "feeding_interval",
          "quiet_hours_enabled", "quiet_hours_start", "quiet_hours_end",
        ];
        const update: any = {};
        for (const k of allowed) if (args[k] !== undefined) update[k] = args[k];
        if (Object.keys(update).length === 0) return { ok: false, error: "No settings provided" };
        return await upsertNotificationSettings(admin, userId, update);
      }

      case "enable_all_notifications": {
        return await upsertNotificationSettings(admin, userId, {
          notifications_enabled: true,
          feeding_reminders: true,
          sleep_reminders: true,
          milestone_reminders: true,
          pattern_alerts: true,
        });
      }

      case "disable_all_notifications": {
        return await upsertNotificationSettings(admin, userId, {
          notifications_enabled: false,
          feeding_reminders: false,
          sleep_reminders: false,
          milestone_reminders: false,
          pattern_alerts: false,
        });
      }

      case "get_baby_stats": {
        if (!babyId) return { ok: false, error: "No baby selected" };
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data: today } = await admin
          .from("baby_activities")
          .select("activity_type, duration_minutes, start_time, metadata")
          .eq("baby_id", babyId)
          .gte("start_time", startOfDay);
        const { data: week } = await admin
          .from("baby_activities")
          .select("activity_type, duration_minutes, start_time")
          .eq("baby_id", babyId)
          .gte("start_time", sevenDaysAgo);

        const todayList = today || [];
        const weekList = week || [];
        const sleepTodayMin = todayList
          .filter((a: any) => a.activity_type === "sleep")
          .reduce((s: number, a: any) => s + (a.duration_minutes || 0), 0);
        const feedingsToday = todayList.filter((a: any) => a.activity_type === "feeding").length;
        const diapersToday = todayList.filter((a: any) => a.activity_type === "diaper").length;

        const days7 = 7;
        const sleepWeekMin = weekList
          .filter((a: any) => a.activity_type === "sleep")
          .reduce((s: number, a: any) => s + (a.duration_minutes || 0), 0);
        const avgSleepPerDayMin = Math.round(sleepWeekMin / days7);
        const avgFeedingsPerDay = (weekList.filter((a: any) => a.activity_type === "feeding").length / days7).toFixed(1);
        const avgDiapersPerDay = (weekList.filter((a: any) => a.activity_type === "diaper").length / days7).toFixed(1);

        const lastSleep = todayList.filter((a: any) => a.activity_type === "sleep").sort((a: any, b: any) => +new Date(b.start_time) - +new Date(a.start_time))[0];
        const lastFeed = todayList.filter((a: any) => a.activity_type === "feeding").sort((a: any, b: any) => +new Date(b.start_time) - +new Date(a.start_time))[0];

        return {
          ok: true,
          result: {
            today: {
              sleep_minutes: sleepTodayMin,
              sleep_hours: +(sleepTodayMin / 60).toFixed(1),
              feedings: feedingsToday,
              diapers: diapersToday,
              last_sleep_start: lastSleep?.start_time || null,
              last_feeding_start: lastFeed?.start_time || null,
            },
            seven_day_average: {
              sleep_minutes_per_day: avgSleepPerDayMin,
              sleep_hours_per_day: +(avgSleepPerDayMin / 60).toFixed(1),
              feedings_per_day: avgFeedingsPerDay,
              diapers_per_day: avgDiapersPerDay,
            },
          },
        };
      }

      case "get_subscription_details": {
        // Return the pre-computed subscription object built at request start —
        // contains the real plan label, billing cycle, dates, and the canonical
        // upgrade/downgrade paths. Single source of truth.
        return { ok: true, result: (ctx as any).subscription };
      }

      case "play_music": {
        const track = SOUND_TRACKS.find((t) => t.id === args.track_id);
        if (!track) return { ok: false, error: "Unknown track" };
        return {
          ok: true,
          result: { track_id: track.id, name: track.name },
          client_action: { type: "play_music", track_id: track.id, name: track.name, url: track.url },
        };
      }

      case "stop_music": {
        return {
          ok: true,
          result: { stopped: true },
          client_action: { type: "stop_music" },
        };
      }

      case "connect_human_support": {
        return {
          ok: true,
          result: { opened: true, reason: args.reason || "general" },
          client_action: { type: "open_support_dialog", reason: args.reason || "general" },
        };
      }

      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (e: any) {
    return { ok: false, error: e?.message || "Tool execution failed" };
  }
}

async function upsertNotificationSettings(admin: any, userId: string, update: any) {
  const { data: existing } = await admin
    .from("notification_settings")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) {
    const { data, error } = await admin
      .from("notification_settings")
      .update(update)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, result: data };
  }
  const { data, error } = await admin
    .from("notification_settings")
    .insert({ user_id: userId, ...update })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, result: data };
}

function formatPricingBlock(pricing: any): string {
  if (!pricing || !pricing.plans) return "Pricing info is currently being updated.";
  const currency = pricing.currency || "USD";
  const lines = pricing.plans.map((p: any) => {
    const price = p.price === 0 ? "Free" : `${currency === "USD" ? "$" : ""}${p.price} ${currency !== "USD" ? currency : ""}/${p.interval}`.trim();
    const equiv = p.equivalent_per_month ? ` (~$${p.equivalent_per_month}/month)` : "";
    const badge = p.badge ? ` — ${p.badge}` : "";
    const highlights = p.highlights?.length ? ` — ${p.highlights.join(", ")}` : "";
    return `- **${p.name}**: ${price}${equiv}${badge}${highlights}`;
  });
  return [
    `PRICING (authoritative — always use these exact values, never invent prices):`,
    ...lines,
    pricing.billing_note ? `Note: ${pricing.billing_note}` : "",
    pricing.trial_available ? "A free trial may be available on signup." : "",
  ].filter(Boolean).join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ ok: false, error: "Unauthorized", message: "Please sign in again to use the assistant." }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse({ ok: false, error: "Unauthorized", message: "Please sign in again to use the assistant." }, 401);
    }
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: sub } = await admin
      .from("subscriptions")
      .select("subscription_tier, status, billing_cycle, current_period_end, trial_end, is_trial")
      .eq("user_id", userId)
      .maybeSingle();

    const tierOk = sub && (sub.subscription_tier === "premium" || sub.subscription_tier === "premium_annual" || sub.subscription_tier === "premium_quarterly");
    const statusOk = sub && (sub.status === "active" || sub.status === "trialing");
    const periodOk = !sub?.current_period_end || new Date(sub.current_period_end) > new Date();
    const isPremium = !!(tierOk && statusOk && periodOk);

    // Build a single subscription object with the real DB values + canonical
    // paths. Forced into the prompt verbatim so the AI cannot hallucinate the
    // user's plan (root cause of the earlier "you're on Free" bug).
    const planLabel = (() => {
      if (!sub || sub.subscription_tier === "free" || !sub.subscription_tier) return "Basic (Free)";
      const t = sub.subscription_tier;
      const c = sub.billing_cycle || "";
      if (t === "premium_annual" || c === "annual" || c === "yearly") return "Premium Annual ($69.99/year)";
      if (t === "premium_quarterly" || c === "quarterly") return "Premium Quarterly ($19.99/3 months)";
      if (t === "premium" && (c === "monthly" || c === "")) return "Premium Monthly ($7.99/month)";
      if (t.startsWith("premium")) return "Premium";
      return t;
    })();
    const subscription = {
      plan_label: planLabel,
      subscription_tier: sub?.subscription_tier || "free",
      status: sub?.status || "none",
      billing_cycle: sub?.billing_cycle || null,
      is_trial: sub?.is_trial || false,
      trial_end: sub?.trial_end || null,
      current_period_end: sub?.current_period_end || null,
      upgrade_path: "In the SleepyBabyy web app: tap Premium / Upgrade, choose Monthly / Quarterly / Annual, checkout via Stripe.",
      downgrade_path: "Account > Subscription > Change plan or Cancel. Cancel keeps Premium active until current_period_end.",
      manage_billing_path: "Account > Subscription > Manage billing (Stripe Customer Portal).",
    };

    // Load dynamic app knowledge (prices, features, news) — CEO can edit
    // these from /admin/knowledge without redeploying the function.
    const { data: knowledge } = await admin
      .from("app_knowledge")
      .select("pricing, features, latest_news, extra_notes")
      .eq("id", 1)
      .maybeSingle();

    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const incomingConvId = typeof body?.conversationId === "string" ? body.conversationId : undefined;

    if (!message) {
      return jsonResponse({ ok: false, error: "Message required", message: "Please type a message first." }, 400);
    }

    if (message.length > 4000) {
      return jsonResponse({ ok: false, error: "Message too long", message: "Please shorten your message and try again." }, 400);
    }

    let conversationId = incomingConvId;
    if (conversationId) {
      const { data: conv } = await admin
        .from("chat_conversations")
        .select("id, user_id")
        .eq("id", conversationId)
        .maybeSingle();
      if (!conv || conv.user_id !== userId) {
        return jsonResponse({ ok: false, error: "Conversation not found", message: "This conversation is no longer available. Please start a new chat." }, 404);
      }
    } else {
      const title = message.slice(0, 60);
      const { data: newConv, error: convErr } = await admin
        .from("chat_conversations")
        .insert({ user_id: userId, title })
        .select("id")
        .single();
      if (convErr || !newConv) throw convErr || new Error("Failed to create conversation");
      conversationId = newConv.id;
    }

    const saveUserMessage = await admin.from("chat_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });
    if (saveUserMessage.error) throw saveUserMessage.error;

    const { data: history, error: historyError } = await admin
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(30);
    if (historyError) throw historyError;

    const { data: activeBaby } = await admin
      .from("baby_profiles")
      .select("id, name, birth_date")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    const { data: ownedBabies } = await admin
      .from("baby_profiles")
      .select("id, name")
      .eq("user_id", userId);
    const { data: sharedRows } = await admin
      .from("family_members")
      .select("baby_profiles!inner(id, name)")
      .eq("user_id", userId)
      .eq("status", "active");
    const allBabies = [
      ...(ownedBabies || []),
      ...((sharedRows || []).map((r: any) => r.baby_profiles)),
    ];

    let babyContext = `No active baby. Available babies: ${JSON.stringify(allBabies)}`;
    if (activeBaby) {
      const { data: activities } = await admin
        .from("baby_activities")
        .select("activity_type, start_time, end_time, duration_minutes, notes, metadata")
        .eq("baby_id", activeBaby.id)
        .order("start_time", { ascending: false })
        .limit(10);

      babyContext = `Active baby: ${activeBaby.name} (id: ${activeBaby.id}, born ${activeBaby.birth_date || "unknown"}).
All accessible babies: ${JSON.stringify(allBabies)}
Recent activities (newest first): ${JSON.stringify(activities || [])}`;
    }

    const pricingBlock = formatPricingBlock(knowledge?.pricing);
    const featuresBlock = knowledge?.features?.length
      ? `APP FEATURES:\n${(knowledge.features as string[]).map((f) => `- ${f}`).join("\n")}`
      : "";
    const newsBlock = knowledge?.latest_news
      ? `LATEST UPDATES:\n${knowledge.latest_news}`
      : "";
    const extraBlock = knowledge?.extra_notes
      ? `ADDITIONAL CONTEXT:\n${knowledge.extra_notes}`
      : "";

    const soundsList = SOUND_TRACKS.map((t) => `  - "${t.id}" → ${t.name} (${t.description})`).join("\n");

    // Hard platform rules — prevents the AI from inventing answers like
    // "manage your subscription through App Store / Google Play". SleepyBabyy
    // is a web app billed via Stripe; these instructions are non-negotiable.
    const PLATFORM_RULES = `PLATFORM RULES (HARD CONSTRAINTS — VIOLATING THESE IS A CRITICAL ERROR):
- SleepyBabyy is a WEB APPLICATION. Users access it through a web browser at sleepybabyy.com.
- SleepyBabyy is NOT on the Apple App Store. It is NOT on Google Play. There is no iOS app and no Android app.
- Subscriptions are processed by STRIPE through the web app. They are NOT in-app purchases.
- NEVER tell users to manage their subscription through "App Store settings", "Google Play subscriptions", "iTunes", "in-app purchases", or any mobile store.
- To upgrade: "In the SleepyBabyy app, tap Premium or Upgrade, choose a plan, checkout via Stripe."
- To cancel / downgrade / change plan: "In the SleepyBabyy app, go to Account > Subscription, pick Change plan or Cancel."
- To update card / view invoices: "Account > Subscription > Manage billing (opens Stripe Customer Portal)."
- For refund or billing dispute: direct them to Contact / customer support.
- For Premium users asking when their subscription ends, call get_subscription_details and answer with real data.
- For Free users asking subscription questions, answer with the paths above. Never call them "app store settings".`;

    const premiumActionsBlock = isPremium
      ? `You have ACTIONS available via tools to help the user log activities, manage notifications, view stats, and control music:
- start_sleep_session / end_sleep_session
- log_feeding / log_diaper / log_custom_activity
- update_notification_settings (partial updates: just one or two fields)
- enable_all_notifications / disable_all_notifications (turn EVERYTHING on or off)
- get_baby_stats (today's totals + 7-day averages)
- get_subscription_details (when sub ends, how to upgrade/downgrade)
- play_music / stop_music (play one of the built-in sounds)
- list_babies (when user has multiple)

WORKFLOW FOR ACTIONS — VERY IMPORTANT:

1. ACTIVITY LOGGING (sleep, feeding, diaper, custom):
   a. If MULTIPLE babies exist and none is active, ask which one FIRST.
   b. Confirm briefly (one short line), then on user "yes" call the tool IMMEDIATELY in the SAME response.

2. NOTIFICATIONS — SMART FLOW:
   When the user asks to "turn on notifications" / "شغل الإشعارات" (without specifying which):
   → REPLY: "Do you want to enable ALL notifications, or a specific type (feeding, sleep, milestones, patterns)?"
   → If user replies "all" / "كلها" / "everything" → Call enable_all_notifications IMMEDIATELY, no further confirmation.
   → If user names a specific type → Use update_notification_settings (set only that field to true) IMMEDIATELY.
   Same flow for "turn off" / "اطفئ" — ask same question, then disable_all_notifications or update_notification_settings.

3. MUSIC — SHORT LIST FLOW:
   When the user asks to "play music" / "شغل موسيقى" without specifying which track:
   → REPLY with a SHORT picklist (3-4 items max) like:
     "Sure — pick one:
      1. Heavy Rain
      2. Water Fountain
      3. Waves & Piano
      Or say 'any' and I'll pick."
   → When they pick (by name, number, or "any"), call play_music IMMEDIATELY.
   Available track_ids:
${soundsList}
   For "stop music" / "اوقف الموسيقى" → call stop_music IMMEDIATELY, no confirmation needed.

4. STATS: When the user asks about today's sleep / feeds / diapers or weekly averages, call get_baby_stats IMMEDIATELY (no confirmation needed — it's a read).

5. SUBSCRIPTION QUESTIONS: When asked about plan, renewal, cancellation, upgrade — call get_subscription_details IMMEDIATELY then answer with the real data.

6. After any tool runs, reply with a SHORT success line.`
      : `IMPORTANT — FREE TIER (Q&A MODE ONLY):
You DO NOT have any tools or actions in this mode. You CANNOT log sleep, feedings, diapers, custom activities, change notification settings, control music, or read live stats.
If the user asks you to perform any of these actions, DO NOT pretend to do it. Instead reply briefly in the user's language telling them this is a Smart Assistant feature on the Premium plan and ask them to tap the Upgrade banner below.
You CAN still freely answer questions: baby sleep tips, app help, schedules, milestones, PRICING (use the values below — they're authoritative), feature explanations, etc.
Subscription questions: answer using the PLATFORM RULES above — never refer users to App Store or Google Play.`;

    // Forced subscription facts — the AI must quote these verbatim when asked
    // about plan / renewal / expiry. Fixes the earlier hallucination where a
    // Premium user was told they were on Free.
    const userSubBlock = `USER_SUBSCRIPTION (REAL DATA FROM DATABASE — NEVER GUESS, NEVER INVENT):
- Plan: ${planLabel}
- subscription_tier: ${sub?.subscription_tier || "free"}
- status: ${sub?.status || "none"}
- billing_cycle: ${sub?.billing_cycle || "(none)"}
- is_trial: ${sub?.is_trial ? "true" : "false"}
- trial_end: ${sub?.trial_end || "(none)"}
- current_period_end: ${sub?.current_period_end || "(none)"}
- isPremium (computed): ${isPremium ? "true" : "false"}

WHEN USER ASKS ABOUT THEIR PLAN / SUBSCRIPTION / RENEWAL / EXPIRY:
  - Use the EXACT plan label above. NEVER say the user is on Free if Plan says Premium.
  - If is_trial=true, mention it's a trial and quote trial_end.
  - For "when does my subscription end" / "متى ينتهي اشتراكي", answer with current_period_end (formatted nicely in the user's language).
  - For "what plan am I on" / "ماهي خطتي" / "what's my subscription", answer with the Plan label.
  - DO NOT invent dates or plan names. Only values from this block.`;

    const systemPrompt = `You are the SleepyBabyy assistant — a friendly support agent and baby-care helper inside the SleepyBabyy app.

CRITICAL LANGUAGE RULE: Always reply in the EXACT SAME language as the user's most recent message. Never mix.

${PLATFORM_RULES}

${userSubBlock}

${premiumActionsBlock}

${pricingBlock}

${featuresBlock}

${newsBlock}

${extraBlock}

Other guidelines:
- For app questions, answer normally with markdown.
- Ground baby-data answers in BABY CONTEXT or get_baby_stats. Never invent data.
- For exact local price, tell the user to tap **Premium / Upgrade** in the app.
- Be concise.

BABY CONTEXT:
${babyContext}`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
    ];

    const MAX_TURNS = 4;
    const toolEvents: any[] = [];
    const clientActions: any[] = [];

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const isFinalAttempt = turn === MAX_TURNS - 1;

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          ...(isPremium ? { tools, tool_choice: "auto" } : {}),
          stream: false,
        }),
      });

      if (!aiResp.ok) {
        if (aiResp.status === 429) {
          return jsonResponse({ ok: false, error: "rate_limit", message: "Too many requests right now. Please try again in a moment.", conversationId }, 429);
        }
        if (aiResp.status === 402) {
          return jsonResponse({ ok: false, error: "credits", message: "AI credits are exhausted.", conversationId }, 402);
        }
        const errorText = await aiResp.text();
        console.error("AI gateway error:", aiResp.status, errorText);
        return jsonResponse({ ok: false, error: "ai_error", message: "The assistant is temporarily unavailable. Please try again shortly.", conversationId }, 500);
      }

      const aiJson = await aiResp.json();
      const choice = aiJson.choices?.[0];
      const aiMessage = choice?.message;
      const toolCalls = aiMessage?.tool_calls;

      if (!toolCalls || toolCalls.length === 0 || isFinalAttempt) {
        const finalText = typeof aiMessage?.content === "string" ? aiMessage.content : "";
        const saveAssistantMessage = await admin.from("chat_messages").insert({
          conversation_id: conversationId,
          role: "assistant",
          content: finalText,
        });
        if (saveAssistantMessage.error) throw saveAssistantMessage.error;

        const updateConversation = await admin
          .from("chat_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);
        if (updateConversation.error) throw updateConversation.error;

        return jsonResponse({
          ok: true,
          conversationId,
          content: finalText,
          actions: toolEvents,
          ...(clientActions.length ? { client_actions: clientActions } : {}),
        } as any);
      }

      messages.push({
        role: "assistant",
        content: aiMessage.content || "",
        tool_calls: toolCalls,
      });

      for (const tc of toolCalls) {
        let parsedArgs: any = {};
        try { parsedArgs = JSON.parse(tc.function.arguments || "{}"); } catch { parsedArgs = {}; }
        const result = await executeTool(tc.function.name, parsedArgs, {
          admin,
          userId,
          defaultBabyId: activeBaby?.id || null,
          subscription,
        });
        toolEvents.push({ tool: tc.function.name, args: parsedArgs, result });
        if (result.client_action) clientActions.push(result.client_action);
        // Don't leak client_action into the model context — it's frontend-only
        const modelResult = { ok: result.ok, ...(result.result !== undefined ? { result: result.result } : {}), ...(result.error ? { error: result.error } : {}) };
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(modelResult),
        });
      }
    }

    return jsonResponse({ ok: false, error: "loop_exhausted", message: "The assistant could not finish this reply. Please try again.", conversationId }, 500);
  } catch (e) {
    console.error("chat-assistant error:", e);
    return jsonResponse({
      ok: false,
      error: e instanceof Error ? e.message : "Unknown",
      message: e instanceof Error ? e.message : "Unknown error",
    }, 500);
  }
});

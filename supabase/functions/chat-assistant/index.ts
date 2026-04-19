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

// ---------- Tool definitions exposed to the model ----------
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
          start_time: {
            type: "string",
            description: "ISO timestamp when sleep started. Default: now.",
          },
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
      description:
        "End the most recent open sleep session for a baby (sets end_time and duration).",
      parameters: {
        type: "object",
        properties: {
          baby_id: { type: "string" },
          end_time: { type: "string", description: "ISO timestamp. Default: now." },
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
          feeding_type: {
            type: "string",
            enum: ["breast", "bottle", "solid"],
          },
          amount_ml: { type: "number", description: "For bottle feeds (ml)" },
          duration_minutes: { type: "number" },
          side: {
            type: "string",
            enum: ["left", "right", "both"],
            description: "For breastfeeding",
          },
          start_time: { type: "string", description: "ISO timestamp. Default: now." },
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
          diaper_type: {
            type: "string",
            enum: ["wet", "dirty", "both"],
          },
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
        "Update the user's notification preferences (enable/disable notifications, types, quiet hours).",
      parameters: {
        type: "object",
        properties: {
          notifications_enabled: { type: "boolean" },
          feeding_reminders: { type: "boolean" },
          sleep_reminders: { type: "boolean" },
          milestone_reminders: { type: "boolean" },
          pattern_alerts: { type: "boolean" },
          feeding_interval: {
            type: "number",
            description: "Minutes between feeding reminders",
          },
          quiet_hours_enabled: { type: "boolean" },
          quiet_hours_start: { type: "string", description: "HH:MM" },
          quiet_hours_end: { type: "string", description: "HH:MM" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_babies",
      description:
        "List all baby profiles the user has access to. Use when user has multiple babies and you need them to choose.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// ---------- Tool execution ----------
async function executeTool(
  name: string,
  args: any,
  ctx: { admin: any; userId: string; defaultBabyId: string | null },
): Promise<{ ok: boolean; result?: any; error?: string }> {
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
        // Check no open session exists
        const { data: open } = await admin
          .from("baby_activities")
          .select("id")
          .eq("baby_id", babyId)
          .eq("activity_type", "sleep")
          .is("end_time", null)
          .maybeSingle();
        if (open) {
          return { ok: false, error: "Sleep session already in progress" };
        }
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
        const duration = Math.max(
          1,
          Math.round(
            (new Date(endTime).getTime() - new Date(open.start_time).getTime()) /
              60000,
          ),
        );
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
        const metadata: any = {
          feeding_type: args.feeding_type,
          logged_via: "chat_assistant",
        };
        if (args.amount_ml) metadata.amount_ml = args.amount_ml;
        if (args.side) metadata.side = args.side;
        const endTime = args.duration_minutes
          ? new Date(
              new Date(startTime).getTime() + args.duration_minutes * 60000,
            ).toISOString()
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
            metadata: {
              diaper_type: args.diaper_type,
              logged_via: "chat_assistant",
            },
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
            metadata: {
              activity_name: args.activity_name,
              logged_via: "chat_assistant",
            },
          })
          .select()
          .single();
        if (error) return { ok: false, error: error.message };
        return { ok: true, result: data };
      }

      case "update_notification_settings": {
        // Whitelist allowed fields
        const allowed = [
          "notifications_enabled",
          "feeding_reminders",
          "sleep_reminders",
          "milestone_reminders",
          "pattern_alerts",
          "feeding_interval",
          "quiet_hours_enabled",
          "quiet_hours_start",
          "quiet_hours_end",
        ];
        const update: any = {};
        for (const k of allowed) {
          if (args[k] !== undefined) update[k] = args[k];
        }
        if (Object.keys(update).length === 0) {
          return { ok: false, error: "No settings provided" };
        }
        // Upsert
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
        } else {
          const { data, error } = await admin
            .from("notification_settings")
            .insert({ user_id: userId, ...update })
            .select()
            .single();
          if (error) return { ok: false, error: error.message };
          return { ok: true, result: data };
        }
      }

      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (e: any) {
    return { ok: false, error: e?.message || "Tool execution failed" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // ---------- Premium gate ----------
    const adminEarly = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: sub } = await adminEarly
      .from("subscriptions")
      .select("subscription_tier, status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    const tierOk = sub && (sub.subscription_tier === "premium" || sub.subscription_tier === "premium_annual");
    const statusOk = sub && (sub.status === "active" || sub.status === "trialing");
    const periodOk = !sub?.current_period_end || new Date(sub.current_period_end) > new Date();

    if (!tierOk || !statusOk || !periodOk) {
      return new Response(
        JSON.stringify({
          error: "premium_required",
          message: "The AI Assistant is a Premium feature. Please upgrade to continue.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { message, conversationId: incomingConvId, confirm } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message.length > 4000) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get or create conversation
    let conversationId = incomingConvId as string | undefined;
    if (conversationId) {
      const { data: conv } = await admin
        .from("chat_conversations")
        .select("id, user_id")
        .eq("id", conversationId)
        .maybeSingle();
      if (!conv || conv.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Conversation not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const title = message.slice(0, 60);
      const { data: newConv, error: convErr } = await admin
        .from("chat_conversations")
        .insert({ user_id: userId, title })
        .select("id")
        .single();
      if (convErr || !newConv) throw convErr;
      conversationId = newConv.id;
    }

    // Save user message
    await admin.from("chat_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });

    // Load history (last 30)
    const { data: history } = await admin
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(30);

    // Load baby context (active + all accessible babies)
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

    let babyContext = "No active baby profile.";
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
    } else {
      babyContext = `No active baby. Available babies: ${JSON.stringify(allBabies)}`;
    }

    const systemPrompt = `You are the SleepyBabyy assistant — a friendly support agent and baby-care helper inside the SleepyBabyy app.

CRITICAL LANGUAGE RULE: Always reply in the EXACT SAME language as the user's most recent message (Arabic → Arabic, English → English, etc.). Never mix.

You have ACTIONS available via tools to help the user log activities and manage notifications:
- start_sleep_session / end_sleep_session
- log_feeding (breast/bottle/solid, with amount/duration/side)
- log_diaper (wet/dirty/both)
- log_custom_activity (bath, play, medicine, milestones…)
- update_notification_settings (enable/disable notifications, types, quiet hours)
- list_babies (when user has multiple)

WORKFLOW FOR ACTIONS — VERY IMPORTANT:
1. When the user requests an action ("log a feeding", "بدأ النوم", "turn off notifications"):
   a. If there are MULTIPLE babies and none is active, ask which one FIRST.
   b. Otherwise use the active baby's id from BABY CONTEXT — DO NOT call list_babies unnecessarily.
2. Ask for confirmation with a short summary (one short line). Example: "سأسجل: **رضاعة 120 مل لسارة الآن** — أأكد؟ (نعم/لا)"
3. As soon as the user confirms (yes/نعم/ok/تأكيد/موافق/أيوه/sí/oui), CALL THE TOOL IMMEDIATELY in the SAME response. Do NOT send a separate "okay, doing it now" message — just call the tool.
4. After the tool runs, reply with a SHORT success line (e.g. "✅ تم تسجيل النوم — 14:30"). Maximum one sentence.
5. On error, briefly explain and offer next step.

PRICING — IMPORTANT (only mention these exact plans, never invent prices or packages):
SleepyBabyy has exactly TWO plans:
1. **Basic (Free)** — 1 baby profile, basic activity tracking, limited history.
2. **Premium** — Unlimited baby profiles, full history, family sharing, advanced analytics, premium sound library, photo memories, smart notifications, pediatrician reports, data export, priority support.
   - **Monthly:** $29.99/month (originally $49.99 — 40% OFF promo)
   - **Annual:** $299.99/year (saves ~$59.89 vs monthly, ~$24.99/month equivalent)
   - A free trial may be available on signup.

Prices are billed in USD. The app DISPLAYS converted prices in the user's local currency (EUR, GBP, SEK, NOK) for convenience, but billing is USD.
There is **NO lifetime package**, **NO $4.99 plan**, **NO $9.99 plan**. Never mention these.
For exact local price, tell the user to tap **Premium / Upgrade** in the app.

Other guidelines:
- For app questions (how to use features, support), answer normally with markdown.
- Ground baby-data answers in BABY CONTEXT. Never invent data.
- Be CONCISE — short replies are better than long ones.

BABY CONTEXT:
${babyContext}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
    ];

    // ---------- Multi-turn loop with tool calling ----------
    // We loop until the model produces a plain text reply (no more tool calls).
    // Streaming only on the FINAL turn to keep things simple.
    const MAX_TURNS = 4;
    const toolEvents: any[] = []; // Surface to UI

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const isFinalAttempt = turn === MAX_TURNS - 1;

      const aiResp = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages,
            tools,
            tool_choice: "auto",
            stream: false,
          }),
        },
      );

      if (!aiResp.ok) {
        if (aiResp.status === 429) {
          return new Response(
            JSON.stringify({ error: "rate_limit", conversationId }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (aiResp.status === 402) {
          return new Response(
            JSON.stringify({ error: "credits", conversationId }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        const t = await aiResp.text();
        console.error("AI gateway error:", aiResp.status, t);
        return new Response(JSON.stringify({ error: "ai_error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiJson = await aiResp.json();
      const choice = aiJson.choices?.[0];
      const aiMessage = choice?.message;
      const toolCalls = aiMessage?.tool_calls;

      if (!toolCalls || toolCalls.length === 0 || isFinalAttempt) {
        // Final text response
        const finalText = aiMessage?.content || "";
        await admin.from("chat_messages").insert({
          conversation_id: conversationId,
          role: "assistant",
          content: finalText,
        });
        await admin
          .from("chat_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);

        return new Response(
          JSON.stringify({
            conversationId,
            content: finalText,
            actions: toolEvents,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Execute tool calls and feed results back
      messages.push({
        role: "assistant",
        content: aiMessage.content || "",
        tool_calls: toolCalls,
      } as any);

      for (const tc of toolCalls) {
        let parsedArgs: any = {};
        try {
          parsedArgs = JSON.parse(tc.function.arguments || "{}");
        } catch {
          parsedArgs = {};
        }
        const result = await executeTool(tc.function.name, parsedArgs, {
          admin,
          userId,
          defaultBabyId: activeBaby?.id || null,
        });
        toolEvents.push({
          tool: tc.function.name,
          args: parsedArgs,
          result,
        });
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        } as any);
      }
    }

    return new Response(JSON.stringify({ error: "loop_exhausted" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

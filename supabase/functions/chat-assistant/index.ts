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

    const { message, conversationId: incomingConvId } = await req.json();

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

    // Load history (last 20)
    const { data: history } = await admin
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Load baby context
    const { data: activeBaby } = await admin
      .from("baby_profiles")
      .select("id, name, birth_date")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    let babyContext = "No active baby profile.";
    if (activeBaby) {
      const { data: activities } = await admin
        .from("baby_activities")
        .select("activity_type, start_time, end_time, duration_minutes, notes, metadata")
        .eq("baby_id", activeBaby.id)
        .order("start_time", { ascending: false })
        .limit(15);

      const { data: schedule } = await admin
        .from("sleep_schedules")
        .select("recommended_bedtime, recommended_wake_time, total_sleep_hours, nap_frequency")
        .eq("baby_id", activeBaby.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      babyContext = `Active baby: ${activeBaby.name} (born ${activeBaby.birth_date || "unknown"}).
Recent activities (newest first): ${JSON.stringify(activities || [])}
Sleep schedule: ${JSON.stringify(schedule || "none")}`;
    }

    const systemPrompt = `You are the SleepyBabyy assistant — a friendly support agent and baby-care helper inside the SleepyBabyy app (https://sleepybabyy.com).

CRITICAL LANGUAGE RULE: Always reply in the EXACT SAME language as the user's most recent message. If they write in Arabic, reply in Arabic. If English, English. If French, French. Never mix languages. Detect from their last message.

You can help with:
- App support: how to track sleep/feeding/diapers, invite family members, set up sleep schedules, manage notifications, subscriptions, memories.
- Analyzing the user's baby data (provided below) — last feeding, sleep patterns, recent activities, recommendations.
- General baby-care guidance (sleep training basics, feeding intervals by age) — but always remind serious medical concerns belong with a pediatrician.

Guidelines:
- Be warm, concise, and practical. Use markdown (bold, lists) for clarity.
- When asked about the baby, ground answers in the BABY CONTEXT below.
- If asked something outside baby-care or app support, politely redirect.
- Never invent data. If something isn't in the context, say so.

BABY CONTEXT:
${babyContext}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
    ];

    // Call Lovable AI with streaming
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

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

    // Stream + accumulate to save final assistant message
    let fullResponse = "";
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        // Send conversationId first as a custom SSE event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ conversationId })}\n\n`),
        );

        const reader = aiResp.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let idx;
            while ((idx = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) {
                controller.enqueue(encoder.encode(line + "\n"));
                continue;
              }
              const json = line.slice(6).trim();
              if (json === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }
              try {
                const parsed = JSON.parse(json);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) fullResponse += delta;
              } catch {
                // ignore
              }
              controller.enqueue(encoder.encode(line + "\n"));
            }
          }

          // Save assistant response
          if (fullResponse.trim()) {
            await admin.from("chat_messages").insert({
              conversation_id: conversationId,
              role: "assistant",
              content: fullResponse,
            });
            await admin
              .from("chat_conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", conversationId);
          }
        } catch (e) {
          console.error("Stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("chat-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

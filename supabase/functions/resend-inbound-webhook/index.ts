import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

// Strip quoted reply / signature from inbound text
function cleanReplyText(text: string): string {
  if (!text) return '';
  let t = text.replace(/\r\n/g, '\n');
  // Cut at common reply markers
  const markers = [
    /\n\s*On .+ wrote:\s*\n/i,
    /\n-{2,}\s*Original Message\s*-{2,}/i,
    /\n_{5,}\s*\n/,
    /\n>{1,}.*$/s,
    /\nFrom: .+\nSent: .+/i,
  ];
  for (const re of markers) {
    const m = t.match(re);
    if (m && m.index !== undefined && m.index > 0) {
      t = t.slice(0, m.index);
    }
  }
  return t.trim();
}

function htmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function extractThreadIdToken(subject: string): string | null {
  const m = subject?.match(/\[#([a-f0-9]{8})\]/i);
  return m ? m[1].toLowerCase() : null;
}

function extractEmailAddress(s: string): string {
  if (!s) return '';
  const m = s.match(/<([^>]+)>/);
  return (m ? m[1] : s).trim().toLowerCase();
}

function extractName(s: string): string | null {
  if (!s) return null;
  const m = s.match(/^\s*"?([^"<]+?)"?\s*</);
  return m ? m[1].trim() : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('[resend-inbound] payload type:', payload?.type);

    // Resend inbound webhook structure: { type: "email.received", data: { from, to, subject, html, text, headers, ... } }
    const data = payload?.data || payload;
    const fromRaw: string = data.from || data.From || '';
    const toRaw: string = Array.isArray(data.to) ? data.to[0] : (data.to || data.To || '');
    const subject: string = data.subject || data.Subject || '';
    const text: string = data.text || (data.html ? htmlToText(data.html) : '');
    const html: string = data.html || '';

    const senderEmail = extractEmailAddress(fromRaw);
    const senderName = extractName(fromRaw);

    if (!senderEmail) {
      console.error('[resend-inbound] No sender email found');
      return new Response(JSON.stringify({ error: 'No sender' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const cleanBody = cleanReplyText(text) || htmlToText(html).slice(0, 5000);
    if (!cleanBody) {
      console.warn('[resend-inbound] Empty body, ignoring');
      return new Response(JSON.stringify({ ok: true, skipped: 'empty' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Try to find the thread:
    // 1) by token in subject [#xxxxxxxx]
    // 2) by latest thread for this sender_email
    let threadId: string | null = null;
    const token = extractThreadIdToken(subject);
    if (token) {
      const { data: match } = await supabase
        .from('contact_messages')
        .select('thread_id')
        .ilike('thread_id', `${token}%`)
        .limit(1)
        .maybeSingle();
      if (match?.thread_id) threadId = match.thread_id;
    }
    if (!threadId) {
      const { data: existing } = await supabase
        .from('contact_messages')
        .select('thread_id, created_at')
        .eq('sender_email', senderEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing?.thread_id) threadId = existing.thread_id;
    }
    if (!threadId) {
      // brand new thread
      threadId = crypto.randomUUID();
    }

    const cleanSubject = subject.replace(/\s*\[#[a-f0-9]{8}\]\s*/i, '').trim() || '(no subject)';

    const { error } = await supabase.from('contact_messages').insert({
      thread_id: threadId,
      direction: 'inbound',
      sender_name: senderName,
      sender_email: senderEmail,
      subject: cleanSubject,
      message_body: cleanBody,
      status: 'unread',
    });

    if (error) {
      console.error('[resend-inbound] insert error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[resend-inbound] Saved reply from', senderEmail, 'thread:', threadId);
    return new Response(JSON.stringify({ ok: true, thread_id: threadId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[resend-inbound] error:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

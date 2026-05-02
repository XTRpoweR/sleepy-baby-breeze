import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

function cleanReplyText(text: string): string {
  if (!text) return '';
  let t = text
    .replace(/\r\n/g, '\n')
    .replace(/\u00ad/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Some mail clients include our HTML email template/CSS in the plain-text reply.
  // Strip that quoted template noise before saving the customer's message.
  const templateMarkers = [
    /Reply from SleepyBabyy Support/i,
    /A reply from our team/i,
    /Reply directly to this email/i,
    /Sweet dreams\s*🌙/i,
    /The SleepyBabyy Support Team/i,
    /sleepybabyy\.com/i,
  ];
  for (const re of templateMarkers) {
    const m = t.match(re);
    if (m?.index !== undefined) {
      t = t.slice(0, m.index);
      break;
    }
  }

  const markers = [
    /(^|\n)\s*On .+ wrote:\s*\n/i,
    /(^|\n)-{2,}\s*Original Message\s*-{2,}/i,
    /(^|\n)_{5,}\s*\n/,
    /(^|\n)From: .+\nSent: .+/i,
    /(^|\n)\s*>.*$/s,
  ];
  for (const re of markers) {
    const m = t.match(re);
    if (m && m.index !== undefined) {
      t = t.slice(0, m.index);
      break;
    }
  }

  return t
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && line !== '|' && line !== '>' && !/^\|+$/.test(line))
    .filter((line) => !/^#?yiv[a-z0-9_-]+/i.test(line))
    .filter((line) => !/[{}]/.test(line))
    .filter((line) => !/(border-collapse|padding|margin|font-size|line-height|max-width|@media|background-color)/i.test(line))
    .join('\n')
    .trim();
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

function extractEmailAddress(s: any): string {
  if (!s) return '';
  // Resend may send `from` as string or as { email, name }
  if (typeof s === 'object') {
    if (s.email) return String(s.email).trim().toLowerCase();
    if (Array.isArray(s) && s[0]?.email) return String(s[0].email).trim().toLowerCase();
  }
  const str = String(s);
  const m = str.match(/<([^>]+)>/);
  return (m ? m[1] : str).trim().toLowerCase();
}

function extractName(s: any): string | null {
  if (!s) return null;
  if (typeof s === 'object') {
    if (s.name) return String(s.name);
    if (Array.isArray(s) && s[0]?.name) return String(s[0].name);
  }
  const str = String(s);
  const m = str.match(/^\s*"?([^"<]+?)"?\s*</);
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
    console.log('[resend-inbound] event type:', payload?.type);

    if (payload?.type !== 'email.received') {
      return new Response(JSON.stringify({ ok: true, ignored: payload?.type }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = payload.data || {};
    const emailId: string = data.email_id || data.id || '';

    // Webhook payload usually doesn't include body — fetch full email from Resend API
    let text: string = data.text || '';
    let html: string = data.html || '';
    let fullFrom: any = data.from || '';
    let fullSubject: string = data.subject || '';

    if (emailId && (!text && !html)) {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      if (RESEND_API_KEY) {
        try {
          const r = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
            headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
          });
          if (r.ok) {
            const fetched = await r.json();
            text = fetched.text || text;
            html = fetched.html || html;
            fullFrom = fetched.from || fullFrom;
            fullSubject = fetched.subject || fullSubject;
            console.log('[resend-inbound] fetched body, has_text:', !!text, 'has_html:', !!html);
          } else {
            console.error('[resend-inbound] fetch email failed:', r.status, await r.text());
          }
        } catch (e) {
          console.error('[resend-inbound] fetch error:', e);
        }
      } else {
        console.error('[resend-inbound] RESEND_API_KEY not set');
      }
    }

    const senderEmail = extractEmailAddress(fullFrom);
    const senderName = extractName(fullFrom);

    console.log('[resend-inbound] from:', senderEmail, 'subject:', fullSubject, 'has_text:', !!text, 'has_html:', !!html);

    if (!senderEmail) {
      console.error('[resend-inbound] No sender email found in payload', JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: 'No sender' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanBody = cleanReplyText(text) || cleanReplyText(htmlToText(html)) || '(empty message)';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Find the thread:
    // 1) by [#xxxxxxxx] token in subject
    // 2) by latest thread for this sender_email
    let threadId: string | null = null;
    const token = extractThreadIdToken(fullSubject);
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
      threadId = crypto.randomUUID();
    }

    const cleanSubject = (fullSubject || '').replace(/\s*\[#[a-f0-9]{8}\]\s*/i, '').trim() || '(no subject)';

    const { error } = await supabase.from('contact_messages').insert({
      thread_id: threadId,
      direction: 'inbound',
      sender_name: senderName,
      sender_email: senderEmail,
      subject: cleanSubject,
      message_body: cleanBody,
      status: 'unread',
      resend_email_id: emailId || null,
    });

    if (error) {
      console.error('[resend-inbound] insert error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[resend-inbound] Saved reply from', senderEmail, 'thread:', threadId);
    return new Response(JSON.stringify({ ok: true, thread_id: threadId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[resend-inbound] error:', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

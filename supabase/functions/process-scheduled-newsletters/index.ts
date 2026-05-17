// Picks up pending entries in newsletter_scheduled_campaigns where scheduled_for <= now()
// and sends them via Resend. Triggered by pg_cron every minute (see migration
// cron_process_scheduled_newsletters). verify_jwt=false because pg_cron has no JWT;
// the function performs all DB work via the service-role key, so the trigger is safe
// to expose — at worst, an unauthenticated caller advances the queue a few seconds early.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function h(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
}

// Markdown -> HTML. Images first so they don't get matched by the link regex.
function md(input: string): string {
  let s = h(input);
  s = s.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (_m, alt, url) =>
    '<img src=' + JSON.stringify(url) + ' alt=' + JSON.stringify(alt) +
    ' style=' + JSON.stringify('max-width:100%;height:auto;border-radius:12px;margin:12px 0;display:block;') + '>');
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, t, url) =>
    '<a href=' + JSON.stringify(url) + ' style=' + JSON.stringify('color:#7C3AED;text-decoration:underline;') + '>' + t + '</a>');
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/\n/g, '<br>');
  return '<p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#1F2937;">' + s + '</p>';
}

function tpl(p: { title: string; subtitle?: string; body: string; tip?: string; ctaText?: string; ctaUrl?: string; userName?: string; unsubscribeUrl: string }): string {
  const safeTitle = h(p.title);
  const safeSub = p.subtitle && p.subtitle.trim() ? h(p.subtitle.trim()) : 'Update';
  const bodyHtml = md(p.body);
  const greeting = p.userName && p.userName.trim() ? h(p.userName.trim()) : 'there';
  const hasCta = p.ctaText && p.ctaUrl && /^https?:\/\//i.test(p.ctaUrl);
  const hasTip = p.tip && p.tip.trim().length > 0;
  const tipHtml = hasTip ? '<div style="background:#F3E8FF;border-left:4px solid #7C3AED;padding:18px 22px;border-radius:12px;margin:16px 32px;font-size:15px;color:#4B5563;font-style:italic;">' + h(p.tip!.trim()) + '</div>' : '';
  const ctaHtml = hasCta ? '<div style="text-align:center;padding:8px 32px 32px 32px;"><a href="' + p.ctaUrl + '" style="background:linear-gradient(135deg,#793BED 0%,#9B27B0 50%,#EC4699 100%);border-radius:100px;color:#FFFFFF;display:inline-block;font-size:18px;font-weight:bold;line-height:64px;text-align:center;text-decoration:none;width:300px;">' + h(p.ctaText!) + '</a></div>' : '';
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + safeTitle + '</title></head><body style="margin:0;background:#FAF7F2;font-family:sans-serif;"><div style="max-width:600px;margin:0 auto;padding:20px;"><div style="padding:24px 32px;"><img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="200"></div><div style="background:#FFFFFF;border-radius:20px;padding:40px;text-align:center;"><div style="font-size:56px;">\u{1F4F0}</div><h1 style="font-family:Georgia,serif;font-size:30px;color:#1F2937;">' + safeTitle + '</h1><p style="color:#6B7280;">' + safeSub + '</p></div><div style="padding:24px 32px;"><p style="font-size:18px;color:#1F2937;font-weight:600;">Hi ' + greeting + '!</p>' + bodyHtml + '</div>' + tipHtml + ctaHtml + '<div style="padding:24px 32px;text-align:center;font-size:12px;color:#9CA3AF;"><a href="' + p.unsubscribeUrl + '" style="color:#6B7280;text-decoration:underline;">Unsubscribe</a><br>© 2026 SleepyBabyy</div></div></body></html>';
}

// deno-lint-ignore no-explicit-any
async function processCampaign(sb: any, rk: string, c: any) {
  const ctaText = c.cta_text || undefined;
  const ctaUrl = c.cta_url || undefined;
  const subStr = c.subtitle || undefined;
  const tipStr = c.tip || undefined;
  type Sub = { email: string; unsubscribe_token: string | null };
  let subs: Sub[] = [];
  if (c.mode === 'custom' && Array.isArray(c.custom_emails) && c.custom_emails.length > 0) {
    const clean = Array.from(new Set(c.custom_emails.filter((e: unknown) => typeof e === 'string').map((e: string) => e.trim().toLowerCase()).filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))).slice(0, 500) as string[];
    const ex = await sb.from('newsletter_subscribers').select('email, unsubscribe_token, status').in('email', clean);
    const rows = ex.data || [];
    const tok = new Map<string, string | null>();
    for (const r of rows) tok.set(r.email, r.unsubscribe_token);
    const blocked = new Set<string>(rows.filter((s: { status: string }) => s.status === 'unsubscribed').map((s: { email: string }) => s.email));
    subs = clean.filter((e) => !blocked.has(e)).map((email) => ({ email, unsubscribe_token: tok.get(email) || null }));
  } else if (c.mode === 'selected' && Array.isArray(c.selected_emails) && c.selected_emails.length > 0) {
    const sel = await sb.from('newsletter_subscribers').select('email, unsubscribe_token').eq('status', 'active').in('email', c.selected_emails);
    if (sel.error) throw sel.error;
    subs = sel.data || [];
  } else {
    const all = await sb.from('newsletter_subscribers').select('email, unsubscribe_token').eq('status', 'active');
    if (all.error) throw all.error;
    subs = all.data || [];
  }
  if (subs.length === 0) throw new Error('No valid recipients');
  const cIns = await sb.from('newsletter_campaigns').insert({ subject: c.subject, subtitle: subStr || null, body: c.body, tip: tipStr || null, cta_text: ctaText || null, cta_url: ctaUrl || null, sent_by: c.created_by, total_recipients: subs.length }).select('id').single();
  const campaignId = cIns.data ? cIns.data.id : null;
  let sent = 0, failed = 0;
  for (const sub of subs) {
    try {
      const unsubUrl = sub.unsubscribe_token ? 'https://sleepybabyy.com/unsubscribe?token=' + sub.unsubscribe_token : 'https://sleepybabyy.com/contact?reason=unsubscribe&email=' + encodeURIComponent(sub.email);
      const nr = await sb.from('profiles').select('full_name').eq('email', sub.email).maybeSingle();
      const full = nr.data && nr.data.full_name ? nr.data.full_name.trim() : '';
      const userName = full ? full.split(/\s+/)[0] : undefined;
      const html = tpl({ title: c.subject, subtitle: subStr, body: c.body, tip: tipStr, ctaText, ctaUrl, userName, unsubscribeUrl: unsubUrl });
      const tags: { name: string; value: string }[] = [{ name: 'type', value: 'newsletter' }];
      if (campaignId) tags.push({ name: 'campaign_id', value: campaignId });
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + rk, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'SleepyBabyy <support@sleepybabyy.com>',
          to: [sub.email],
          reply_to: 'support@sleepybabyy.com',
          subject: c.subject,
          headers: {
            'List-Unsubscribe': '<' + unsubUrl + '>, <mailto:support@sleepybabyy.com?subject=unsubscribe>',
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          tags,
          html,
        }),
      });
      if (resp.ok) {
        sent++;
        if (campaignId) {
          try {
            const sd = await resp.clone().json();
            const eid = sd && sd.id ? sd.id : null;
            if (eid) await sb.from('newsletter_sends').insert({ campaign_id: campaignId, recipient_email: sub.email, resend_email_id: eid, is_test: false });
          } catch (_) { /* non-blocking */ }
        }
      } else {
        failed++;
      }
      await new Promise((r) => setTimeout(r, 120));
    } catch (_) {
      failed++;
    }
  }
  return { sent, failed, campaignId };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const rk = Deno.env.get('RESEND_API_KEY');
  if (!rk) return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  try {
    const due = await sb.from('newsletter_scheduled_campaigns').select('*').eq('status', 'pending').lte('scheduled_for', new Date().toISOString()).order('scheduled_for', { ascending: true }).limit(10);
    if (due.error) throw due.error;
    const list = due.data || [];
    const results: Array<{ id: string; status: string; sent?: number; failed?: number; error?: string }> = [];
    for (const c of list) {
      // Race-safe claim: only one worker can flip pending -> processing.
      const claim = await sb.from('newsletter_scheduled_campaigns').update({ status: 'processing' }).eq('id', c.id).eq('status', 'pending').select('id').maybeSingle();
      if (!claim.data) continue;
      try {
        const r = await processCampaign(sb, rk, c);
        await sb.from('newsletter_scheduled_campaigns').update({ status: 'sent', campaign_id: r.campaignId, processed_at: new Date().toISOString() }).eq('id', c.id);
        results.push({ id: c.id, status: 'sent', sent: r.sent, failed: r.failed });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await sb.from('newsletter_scheduled_campaigns').update({ status: 'failed', error_message: msg, processed_at: new Date().toISOString() }).eq('id', c.id);
        results.push({ id: c.id, status: 'failed', error: msg });
      }
    }
    return new Response(JSON.stringify({ success: true, processed: results.length, results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: 'Internal error', detail: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

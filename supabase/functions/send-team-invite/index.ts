// Creates an admin team invitation and emails it via Resend.
// Caller must be Manager+ (rank >= 3). Role being invited must be <= caller's role
// (never CEO). When `resend_id` is passed instead, re-sends an existing invitation
// and extends its expiry by 7 days.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ROLE_RANK: Record<string, number> = { ceo: 5, executive: 4, manager: 3, editor: 2, member: 1 };
const ROLE_LABEL: Record<string, string> = { ceo: 'CEO', executive: 'Executive', manager: 'Manager', editor: 'Editor', member: 'Member' };

function h(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
}

function inviteEmailHtml(p: { roleLabel: string; inviterName?: string | null; message?: string | null; acceptUrl: string }): string {
  const roleLabel = h(p.roleLabel);
  const inviterName = p.inviterName ? h(p.inviterName) : 'The team';
  const personal = p.message
    ? '<div style="background:#F3E8FF;border-left:4px solid #7C3AED;padding:14px 18px;border-radius:10px;margin:16px 0;font-style:italic;color:#4B5563;font-size:14px;">' + h(p.message) + '</div>'
    : '';
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>You are invited</title></head><body style="margin:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:40px 20px;"><div style="text-align:center;margin-bottom:24px;"><img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="200" style="display:inline-block;"></div><div style="background:#FFFFFF;border-radius:20px;padding:40px;box-shadow:0 4px 20px rgba(124,58,237,0.08);"><div style="text-align:center;font-size:48px;margin-bottom:12px;">🎉</div><h1 style="font-family:Georgia,serif;font-size:26px;color:#1F2937;text-align:center;margin:0 0 8px 0;">You’re invited to join SleepyBabyy admin</h1><p style="text-align:center;color:#6B7280;margin:0 0 24px 0;">' + inviterName + ' has invited you to be a <strong style="color:#7C3AED;">' + roleLabel + '</strong></p>' + personal + '<div style="text-align:center;margin:32px 0 16px 0;"><a href="' + p.acceptUrl + '" style="display:inline-block;background:linear-gradient(135deg,#793BED 0%,#9B27B0 50%,#EC4699 100%);color:#FFFFFF;padding:14px 32px;border-radius:100px;font-weight:bold;text-decoration:none;font-size:16px;box-shadow:0 10px 30px rgba(121,59,237,0.4);">Accept invitation</a></div><p style="text-align:center;font-size:12px;color:#9CA3AF;margin:24px 0 0 0;">Or paste this link in your browser:<br><a href="' + p.acceptUrl + '" style="color:#7C3AED;word-break:break-all;">' + p.acceptUrl + '</a></p><p style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:24px;">This invitation expires in 7 days.<br>If you weren’t expecting this, you can safely ignore the email.</p></div><div style="text-align:center;padding:24px;font-size:12px;color:#9CA3AF;">© 2026 SleepyBabyy</div></div></body></html>';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  try {
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const rk = Deno.env.get('RESEND_API_KEY');
    if (!rk) return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const u = await sb.auth.getUser(auth.substring(7));
    if (u.error || !u.data.user) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const userId = u.data.user.id;

    // Caller must be Manager+
    const memRes = await sb.from('admin_team_members').select('role, title').eq('user_id', userId).maybeSingle();
    if (!memRes.data) return new Response(JSON.stringify({ error: 'Not a team member' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const callerRank = ROLE_RANK[memRes.data.role] || 0;
    if (callerRank < ROLE_RANK.manager) return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const payload = await req.json();

    // RESEND path: re-send an existing pending invitation
    if (payload.resend_id && typeof payload.resend_id === 'string') {
      const invRes = await sb.from('admin_invitations').select('*').eq('id', payload.resend_id).is('accepted_at', null).is('canceled_at', null).maybeSingle();
      if (!invRes.data) return new Response(JSON.stringify({ error: 'Invitation not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      await sb.from('admin_invitations').update({ expires_at: new Date(Date.now() + 7 * 86400 * 1000).toISOString() }).eq('id', invRes.data.id);
      const inviter = await sb.from('profiles').select('full_name').eq('id', userId).maybeSingle();
      const acceptUrl = 'https://sleepybabyy.com/invite/' + invRes.data.token;
      const html = inviteEmailHtml({ roleLabel: ROLE_LABEL[invRes.data.role], inviterName: inviter.data?.full_name, message: invRes.data.message, acceptUrl });
      const resp = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer ' + rk, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'SleepyBabyy <support@sleepybabyy.com>', to: [invRes.data.email], reply_to: 'support@sleepybabyy.com', subject: 'Reminder: you are invited to join SleepyBabyy admin', html }) });
      if (!resp.ok) {
        const t = await resp.text();
        return new Response(JSON.stringify({ error: 'Resend failed', detail: t }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ success: true, resent: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // NEW invitation
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const role = typeof payload.role === 'string' ? payload.role : 'editor';
    const title = typeof payload.title === 'string' ? payload.title.slice(0, 100) : null;
    const message = typeof payload.message === 'string' ? payload.message.slice(0, 500) : null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!(role in ROLE_RANK)) return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const targetRank = ROLE_RANK[role];
    if (targetRank > callerRank) return new Response(JSON.stringify({ error: "Cannot invite a higher-ranked role than your own" }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (role === 'ceo') return new Response(JSON.stringify({ error: 'CEO role cannot be invited' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Already on the team?
    const profRes = await sb.from('profiles').select('id').eq('email', email).maybeSingle();
    if (profRes.data) {
      const existing = await sb.from('admin_team_members').select('user_id').eq('user_id', profRes.data.id).maybeSingle();
      if (existing.data) return new Response(JSON.stringify({ error: 'This user is already on the team' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Duplicate pending invitation?
    const dup = await sb.from('admin_invitations').select('id').eq('email', email).is('accepted_at', null).is('canceled_at', null).gt('expires_at', new Date().toISOString()).maybeSingle();
    if (dup.data) return new Response(JSON.stringify({ error: 'A pending invitation already exists for this email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const ins = await sb.from('admin_invitations').insert({ email, role, title, message, invited_by: userId }).select('id, token').single();
    if (ins.error) return new Response(JSON.stringify({ error: 'Failed to create invitation', detail: ins.error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const inviter = await sb.from('profiles').select('full_name').eq('id', userId).maybeSingle();
    const acceptUrl = 'https://sleepybabyy.com/invite/' + ins.data.token;
    const html = inviteEmailHtml({ roleLabel: ROLE_LABEL[role], inviterName: inviter.data?.full_name, message, acceptUrl });
    const resp = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer ' + rk, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'SleepyBabyy <support@sleepybabyy.com>', to: [email], reply_to: 'support@sleepybabyy.com', subject: 'You are invited to join SleepyBabyy admin', html }) });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: 'Email send failed', detail: t }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: true, invitation_id: ins.data.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: 'Internal error', detail: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

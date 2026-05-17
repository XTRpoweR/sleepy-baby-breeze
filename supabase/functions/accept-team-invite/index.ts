// Two modes:
//   POST { token } with NO auth -> returns invitation details (email, role, title, expires)
//     so the accept page can show what's being accepted before sign-in.
//   POST { token, accept: true } WITH auth -> adds the authenticated user to the team.
//     Email must match the invitation. Uses service role to bypass RLS on insert.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const payload = await req.json();
    const token = typeof payload.token === 'string' ? payload.token : '';
    if (!token) return new Response(JSON.stringify({ error: 'Token required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const invRes = await sb.from('admin_invitations').select('*').eq('token', token).maybeSingle();
    if (!invRes.data) return new Response(JSON.stringify({ error: 'Invitation not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const inv = invRes.data;
    if (inv.accepted_at) return new Response(JSON.stringify({ error: 'Invitation already accepted' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (inv.canceled_at) return new Response(JSON.stringify({ error: 'Invitation canceled' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (new Date(inv.expires_at).getTime() < Date.now()) return new Response(JSON.stringify({ error: 'Invitation expired' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // INFO mode: no accept flag -> just return details (the accept page calls this on load).
    if (!payload.accept) {
      let inviterName: string | null = null;
      if (inv.invited_by) {
        const ip = await sb.from('profiles').select('full_name').eq('id', inv.invited_by).maybeSingle();
        inviterName = ip.data ? ip.data.full_name : null;
      }
      return new Response(JSON.stringify({ email: inv.email, role: inv.role, title: inv.title, message: inv.message, expires_at: inv.expires_at, inviter_name: inviterName }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ACCEPT mode: requires auth + matching email.
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Sign in required to accept' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const u = await sb.auth.getUser(auth.substring(7));
    if (u.error || !u.data.user) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const user = u.data.user;
    if ((user.email || '').toLowerCase() !== inv.email.toLowerCase()) return new Response(JSON.stringify({ error: 'You must sign in with the invited email: ' + inv.email }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Already a team member? Just mark the invite accepted.
    const exist = await sb.from('admin_team_members').select('id').eq('user_id', user.id).maybeSingle();
    if (exist.data) {
      await sb.from('admin_invitations').update({ accepted_at: new Date().toISOString(), accepted_by: user.id }).eq('id', inv.id);
      return new Response(JSON.stringify({ success: true, already_member: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ins = await sb.from('admin_team_members').insert({ user_id: user.id, role: inv.role, title: inv.title, invited_by: inv.invited_by }).select('id').single();
    if (ins.error) return new Response(JSON.stringify({ error: 'Failed to add to team', detail: ins.error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    await sb.from('admin_invitations').update({ accepted_at: new Date().toISOString(), accepted_by: user.id }).eq('id', inv.id);
    return new Response(JSON.stringify({ success: true, role: inv.role }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: 'Internal error', detail: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

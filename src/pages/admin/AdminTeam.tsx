import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAdminRole, AdminRole } from '@/hooks/useAdminRole';
import {
  Users, UserPlus, Mail, Crown, Edit3, Eye, Send, MoreVertical,
  Check, X, Clock, Trash2, RefreshCw, Gem, Briefcase, ShieldCheck, Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeamMember {
  id: string;
  user_id: string;
  role: AdminRole;
  title: string | null;
  joined_at: string;
  last_active_at: string | null;
  email: string | null;
  full_name: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: AdminRole;
  expires_at: string;
  accepted_at: string | null;
  canceled_at: string | null;
  created_at: string;
}

interface RecentInvite {
  id: string;
  email: string;
  role: AdminRole;
  accepted_at: string | null;
  canceled_at: string | null;
  created_at: string;
}

const ROLE_META: Record<AdminRole, { label: string; icon: typeof Crown; color: string; bg: string; text: string; rank: number }> = {
  ceo:       { label: 'CEO',       icon: Crown,       color: 'from-amber-500 via-yellow-500 to-amber-600', bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', text: 'text-amber-800', rank: 5 },
  executive: { label: 'Executive', icon: Gem,         color: 'from-purple-500 to-pink-500',                bg: 'bg-gradient-to-r from-purple-100 to-pink-100',  text: 'text-purple-700', rank: 4 },
  manager:   { label: 'Manager',   icon: Briefcase,   color: 'from-blue-500 to-cyan-500',                  bg: 'bg-blue-100',                                   text: 'text-blue-700',   rank: 3 },
  editor:    { label: 'Editor',    icon: Edit3,       color: 'from-emerald-500 to-teal-500',               bg: 'bg-emerald-100',                                text: 'text-emerald-700', rank: 2 },
  member:    { label: 'Member',    icon: Eye,         color: 'from-slate-500 to-slate-600',                bg: 'bg-slate-100',                                  text: 'text-slate-700',  rank: 1 },
};

const AdminTeam = () => {
  const { role: currentRole, rank: currentRank, canInvite, canManageTeam } = useAdminRole();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  const load = async () => {
    const [mRes, iRes, aRes] = await Promise.all([
      supabase.from('admin_team_view').select('*').order('joined_at', { ascending: true }),
      // Pending (not accepted, not canceled, not expired)
      supabase
        .from('admin_invitations')
        .select('id, email, role, expires_at, accepted_at, canceled_at, created_at')
        .is('accepted_at', null)
        .is('canceled_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false }),
      // Recent activity: accepted or canceled in the last 30 days (for visibility)
      supabase
        .from('admin_invitations')
        .select('id, email, role, accepted_at, canceled_at, created_at')
        .or('accepted_at.not.is.null,canceled_at.not.is.null')
        .gt('created_at', new Date(Date.now() - 30 * 86400 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10),
    ]);
    if (mRes.data) setMembers(mRes.data as TeamMember[]);
    if (iRes.data) setInvitations(iRes.data as Invitation[]);
    if (aRes.data) setRecentActivity(aRes.data as RecentInvite[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Realtime: refresh whenever the team or invitations table changes.
  // Also show a celebratory toast when a pending invitation gets accepted,
  // so the admin sees confirmation without refreshing.
  useEffect(() => {
    const channel = supabase
      .channel('admin-team-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_team_members' },
        () => {
          load();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'admin_invitations' },
        (payload) => {
          // Was just accepted?
          const before = payload.old as { accepted_at: string | null } | null;
          const after = payload.new as { accepted_at: string | null; email: string } | null;
          if (before && after && !before.accepted_at && after.accepted_at) {
            toast.success(`🎉 ${after.email} accepted the invitation!`, { duration: 6000 });
          }
          load();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_invitations' },
        () => {
          load();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateRole = async (member: TeamMember, newRole: AdminRole) => {
    if (member.user_id === me) {
      toast.error("You can't change your own role");
      return;
    }
    const { error } = await supabase
      .from('admin_team_members')
      .update({ role: newRole })
      .eq('id', member.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Role updated to ${ROLE_META[newRole].label}`);
    load();
  };

  const removeMember = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.full_name || member.email} from the team?`)) return;
    const { error } = await supabase
      .from('admin_team_members')
      .delete()
      .eq('id', member.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Member removed');
    load();
  };

  const cancelInvitation = async (inv: Invitation) => {
    const { error } = await supabase
      .from('admin_invitations')
      .update({ canceled_at: new Date().toISOString() })
      .eq('id', inv.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Invitation canceled');
    load();
  };

  const resendInvitation = async (inv: Invitation) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    const resp = await fetch(`https://wjxxgccfazpkdfzbcgen.supabase.co/functions/v1/send-team-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ resend_id: inv.id }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      toast.error(`Resend failed: ${t}`);
      return;
    }
    toast.success('Invitation resent');
    load();
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Users className="h-7 w-7 text-purple-500" />
              Team
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {members.length} member{members.length === 1 ? '' : 's'}
              {invitations.length > 0 && ` · ${invitations.length} pending invite${invitations.length === 1 ? '' : 's'}`}
            </p>
          </div>
          {canInvite && (
            <Button
              onClick={() => setShowInvite(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-md shadow-purple-500/30"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite teammate
            </Button>
          )}
        </div>

        {/* Members list */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              Active members
            </h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No team members yet</div>
          ) : (
            <div className="divide-y">
              {members.map((m) => {
                const meta = ROLE_META[m.role];
                const Icon = meta.icon;
                const isYou = m.user_id === me;
                // Show full_name if available, otherwise fall back to the email
                // local-part (before @) so members without a profile name don't
                // appear as "Unknown".
                const emailLocal = m.email ? m.email.split('@')[0] : '';
                const displayName = m.full_name || emailLocal || 'Team member';
                const initial = (displayName || '?').charAt(0).toUpperCase();
                const canEdit = canManageTeam && !isYou && currentRank > meta.rank;
                return (
                  <div key={m.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-white font-semibold shadow-md flex-shrink-0`}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{displayName}</span>
                        {isYou && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 font-medium">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.title ? `${m.title} · ` : ''}{m.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.bg} ${meta.text}`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                      {canEdit && (
                        <RoleMenu currentRole={m.role} currentRank={currentRank} onChange={(r) => updateRole(m, r)} onRemove={() => removeMember(m)} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold text-sm">Pending invitations</h2>
            </div>
            <div className="divide-y">
              {invitations.map((inv) => {
                const meta = ROLE_META[inv.role];
                const Icon = meta.icon;
                const expiresIn = formatDistanceToNow(new Date(inv.expires_at), { addSuffix: true });
                const expiresSoon = new Date(inv.expires_at).getTime() - Date.now() < 86_400_000;
                return (
                  <div key={inv.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Sent {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                        {' · expires '}
                        <span className={expiresSoon ? 'text-rose-600 font-medium' : ''}>{expiresIn}</span>
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.bg} ${meta.text}`}>
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                    {canInvite && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => resendInvitation(inv)} title="Resend" className="h-8 w-8">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => cancelInvitation(inv)} title="Cancel" className="h-8 w-8 hover:text-rose-600">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Recent activity — accepted / canceled invitations */}
        {recentActivity.length > 0 && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-500" />
              <h2 className="font-semibold text-sm">Recent activity</h2>
              <span className="text-xs text-muted-foreground ml-auto">Last 30 days</span>
            </div>
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {recentActivity.map((a) => {
                const meta = ROLE_META[a.role];
                const Icon = meta.icon;
                const accepted = !!a.accepted_at;
                const eventTime = accepted ? a.accepted_at! : (a.canceled_at ?? a.created_at);
                return (
                  <div key={a.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        accepted ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {accepted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <strong className="font-medium">{a.email}</strong>
                        <span className={`ml-1.5 ${accepted ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {accepted ? 'accepted' : 'canceled'}
                        </span>
                        <span className="text-muted-foreground"> the invitation</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(eventTime), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.bg} ${meta.text}`}>
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Role legend */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            What each role can do
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            {(['ceo', 'executive', 'manager', 'editor', 'member'] as AdminRole[]).map((r) => {
              const meta = ROLE_META[r];
              const RoleIcon = meta.icon;
              return (
                <div key={r} className={`p-3 rounded-lg border ${meta.bg} border-transparent`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <RoleIcon className={`w-3.5 h-3.5 ${meta.text}`} />
                    <span className={`text-xs font-semibold ${meta.text}`}>{meta.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    {r === 'ceo' && 'Full control. Manages billing & team. Cannot be removed.'}
                    {r === 'executive' && 'Manage team & all content. View finances.'}
                    {r === 'manager' && 'Send & publish content. Invite team.'}
                    {r === 'editor' && 'Write drafts & reply to customers. No publish.'}
                    {r === 'member' && 'Read-only access. View reports & stats.'}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {showInvite && canInvite && (
        <InviteModal
          currentRank={currentRank}
          onClose={() => setShowInvite(false)}
          onInvited={() => {
            setShowInvite(false);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
};

// ---------- Role change menu ----------
// Uses Radix DropdownMenu (via shadcn) so it portals out of the Card's
// overflow-hidden container — previously the menu was clipped and invisible.
const RoleMenu: React.FC<{
  currentRole: AdminRole;
  currentRank: number;
  onChange: (r: AdminRole) => void;
  onRemove: () => void;
}> = ({ currentRole, currentRank, onChange, onRemove }) => {
  // Can assign roles equal or lower than the actor's rank (and never CEO)
  const assignable = (['executive', 'manager', 'editor', 'member'] as AdminRole[]).filter(
    (r) => ROLE_META[r].rank <= currentRank
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-400">
          Change role
        </DropdownMenuLabel>
        {assignable.map((r) => {
          const meta = ROLE_META[r];
          const Icon = meta.icon;
          const isCurrent = r === currentRole;
          return (
            <DropdownMenuItem
              key={r}
              onClick={() => !isCurrent && onChange(r)}
              disabled={isCurrent}
              className="text-xs"
            >
              <Icon className={`w-3 h-3 mr-2 ${meta.text}`} />
              {meta.label}
              {isCurrent && <Check className="w-3 h-3 ml-auto text-emerald-500" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRemove} className="text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50">
          <Trash2 className="w-3 h-3 mr-2" />
          Remove from team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ---------- Invite modal ----------
const InviteModal: React.FC<{
  currentRank: number;
  onClose: () => void;
  onInvited: () => void;
}> = ({ currentRank, onClose, onInvited }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('editor');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Inviter can only assign roles equal to or below their own rank, and never CEO
  const assignable = (['executive', 'manager', 'editor', 'member'] as AdminRole[]).filter(
    (r) => ROLE_META[r].rank <= currentRank
  );

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Enter a valid email');
      return;
    }
    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Please sign in again');
      const resp = await fetch(`https://wjxxgccfazpkdfzbcgen.supabase.co/functions/v1/send-team-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role,
          title: title.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      const respText = await resp.text();
      let data: { error?: string; detail?: string } = {};
      try { data = JSON.parse(respText); } catch { /* not JSON */ }
      if (!resp.ok || data.error) {
        throw new Error(data.detail || data.error || respText);
      }
      toast.success(`Invitation sent to ${email}`);
      onInvited();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-500" />
            Invite a teammate
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label htmlFor="invite_email">Email</Label>
            <Input
              id="invite_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="invite_title">Job title (optional)</Label>
            <Input
              id="invite_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Marketing Manager"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Role</Label>
            <div className="space-y-2 mt-1">
              {assignable.map((r) => {
                const meta = ROLE_META[r];
                const Icon = meta.icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      role === r ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${meta.text}`} />
                        <span className={`text-sm font-semibold ${role === r ? 'text-purple-900' : 'text-slate-800'}`}>
                          {meta.label}
                        </span>
                      </div>
                      {role === r && <Check className="w-4 h-4 text-purple-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label htmlFor="invite_message">Personal message (optional)</Label>
            <Textarea
              id="invite_message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Hey, joining me to help manage..."
              className="mt-1"
            />
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
            <span>They&apos;ll receive an email with a join link. Invitations expire in 7 days.</span>
          </div>
        </div>
        <div className="px-5 py-4 border-t flex justify-end gap-2 bg-slate-50/50">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={sending || !email}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            {sending ? 'Sending...' : 'Send invite'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminTeam;

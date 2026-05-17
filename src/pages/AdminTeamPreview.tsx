import React, { useState } from 'react';
import {
  Users, UserPlus, Mail, Shield, Crown, Edit3, Eye, Send, MoreVertical,
  Check, X, AlertCircle, Clock, Sparkles, Trash2, RefreshCw, Lock, Calendar,
  FileText, MessageSquare, BarChart3, Settings, Image as ImageIcon,
  ChevronRight, ShieldCheck, Gem, Briefcase,
} from 'lucide-react';

/**
 * /dev/admin-team-preview
 * Visual previews for the upcoming Team & Permissions admin module.
 *
 * Sections:
 *   2A - Team members list (avatars, roles, actions)
 *   2B - Invite modal (email + role)
 *   2C - Pending invites with resend / cancel
 *   2D - Role selector (4 tiers)
 *   2E - Permissions matrix (what each role can do)
 *   2F - Per-member granular override (advanced)
 */

const AdminTeamPreview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Admin Team & Permissions — Mockups
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Invite teammates, assign roles, control who can do what. Six previews below.
          </p>
        </div>

        <div className="space-y-16">
          <Section
            tag="2A"
            title="Team members list"
            description="Sidebar in admin: see who has access, their role, last active, and quick actions."
          >
            <TeamListMock />
          </Section>

          <Section
            tag="2B"
            title="Invite teammate modal"
            description="Send an invite with email + role. They'll receive a magic-link email to join."
          >
            <InviteModalMock />
          </Section>

          <Section
            tag="2C"
            title="Pending invitations"
            description="Track sent invites. Resend if they expire, cancel if not needed."
          >
            <PendingInvitesMock />
          </Section>

          <Section
            tag="2D"
            title="Four role tiers"
            description="Pre-built roles cover 95% of cases. Each role has a clear summary so you know what you're granting."
          >
            <RoleCardsMock />
          </Section>

          <Section
            tag="2E"
            title="Permissions matrix"
            description="What each role can do across the admin sections. Helpful when picking the right role."
          >
            <PermissionsMatrixMock />
          </Section>

          <Section
            tag="2F"
            title="Granular override (advanced)"
            description="Need a custom mix? Toggle individual permissions for one teammate without creating a new role."
          >
            <GranularOverrideMock />
          </Section>
        </div>

        <div className="mt-16 text-center text-sm text-slate-500">
          Tell me which to implement: 2A · 2B · 2C · 2D · 2E · 2F.
          The simplest viable scope is 2A + 2B + 2D + 2E (skip 2C and 2F for now).
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ tag: string; title: string; description: string; children: React.ReactNode }> = ({ tag, title, description, children }) => (
  <section>
    <div className="flex items-start gap-4 mb-6">
      <div className="px-3 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 bg-gradient-to-br from-pink-400 to-purple-500 text-white">
        {tag}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
    <div className="p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm">
      {children}
    </div>
  </section>
);

// ---------- 2A: Team members list ----------
const TeamListMock: React.FC = () => {
  const members = [
    { id: '1', name: 'Islam (You)', email: 'jhonejitx@gmail.com', role: 'ceo', avatar: 'I', color: 'from-amber-500 via-yellow-500 to-amber-600', lastActive: 'Now', isYou: true, title: 'Founder & CEO' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'executive', avatar: 'S', color: 'from-purple-500 to-pink-500', lastActive: '2 hours ago', isYou: false, title: 'VP of Operations' },
    { id: '3', name: 'Ahmed Hassan', email: 'ahmed@example.com', role: 'manager', avatar: 'A', color: 'from-blue-500 to-cyan-500', lastActive: 'Yesterday', isYou: false, title: 'Marketing Manager' },
    { id: '4', name: 'Maria Lopez', email: 'maria@example.com', role: 'editor', avatar: 'M', color: 'from-emerald-500 to-teal-500', lastActive: '3 days ago', isYou: false, title: 'Content Editor' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-purple-500" />
          <span className="font-medium text-slate-800">{members.length} members</span>
          <span className="text-slate-500">· 1 invite pending</span>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 shadow-md shadow-purple-500/30">
          <UserPlus className="w-4 h-4" />
          Invite teammate
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {members.map((m) => (
          <div key={m.id} className="px-4 py-3 flex items-center gap-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-semibold shadow-md flex-shrink-0`}>
              {m.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-900">{m.name}</span>
                {m.isYou && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 font-medium">YOU</span>}
              </div>
              <p className="text-xs text-slate-500 truncate">{m.title} · {m.email}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <RoleBadge role={m.role} />
              <span className="text-xs text-slate-400 hidden md:inline">{m.lastActive}</span>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" disabled={m.isYou}>
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const styles: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
    // 5-tier corporate hierarchy
    ceo: { label: 'CEO', bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', text: 'text-amber-800', icon: Crown },
    executive: { label: 'Executive', bg: 'bg-gradient-to-r from-purple-100 to-pink-100', text: 'text-purple-700', icon: Gem },
    manager: { label: 'Manager', bg: 'bg-blue-100', text: 'text-blue-700', icon: Briefcase },
    editor: { label: 'Editor', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Edit3 },
    member: { label: 'Member', bg: 'bg-slate-100', text: 'text-slate-700', icon: Eye },
    // legacy aliases (for older mocks until we delete them)
    owner: { label: 'CEO', bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', text: 'text-amber-800', icon: Crown },
    admin: { label: 'Manager', bg: 'bg-blue-100', text: 'text-blue-700', icon: Briefcase },
    viewer: { label: 'Member', bg: 'bg-slate-100', text: 'text-slate-700', icon: Eye },
  };
  const s = styles[role] ?? styles.member;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
};

// ---------- 2B: Invite modal ----------
const InviteModalMock: React.FC = () => {
  const [email, setEmail] = useState('teammate@example.com');
  const [role, setRole] = useState('editor');
  const [message, setMessage] = useState('');

  const roles = [
    { id: 'executive', label: 'Executive', desc: 'Top-level leadership. Almost full control.' },
    { id: 'manager', label: 'Manager', desc: 'Manage a department or section.' },
    { id: 'editor', label: 'Editor', desc: 'Create & edit content, can\'t publish.' },
    { id: 'member', label: 'Member', desc: 'Read-only access.' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md mx-auto overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-slate-900">Invite a teammate</h3>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Email address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Role</label>
          <div className="space-y-2">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  role === r.id ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-sm font-semibold ${role === r.id ? 'text-purple-900' : 'text-slate-800'}`}>{r.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                  </div>
                  {role === r.id && <Check className="w-4 h-4 text-purple-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Personal message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Hey, joining me to help manage the SleepyBabyy admin..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
          <span>They&apos;ll get a magic-link email. Invites expire in 7 days.</span>
        </div>
      </div>
      <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 shadow-md shadow-purple-500/30 flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5" />
          Send invite
        </button>
      </div>
    </div>
  );
};

// ---------- 2C: Pending invites ----------
const PendingInvitesMock: React.FC = () => {
  const invites = [
    { email: 'newperson@example.com', role: 'editor', sent: '2 days ago', expires: 'in 5 days' },
    { email: 'designer@example.com', role: 'member', sent: '6 days ago', expires: 'in 23 hours', warning: true },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
        <Clock className="w-4 h-4 text-amber-500" />
        <span>{invites.length} pending</span>
      </div>
      {invites.map((inv, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-amber-50/50 border border-amber-100 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{inv.email}</p>
            <p className="text-xs text-slate-500">
              Sent {inv.sent} · expires <span className={inv.warning ? 'text-rose-600 font-medium' : ''}>{inv.expires}</span>
            </p>
          </div>
          <RoleBadge role={inv.role} />
          <div className="flex items-center gap-1">
            <button title="Resend" className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button title="Cancel" className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------- 2D: Role cards (5-tier corporate hierarchy) ----------
const RoleCardsMock: React.FC = () => {
  const roles = [
    { id: 'ceo', name: 'CEO', icon: Crown, color: 'from-amber-500 via-yellow-500 to-amber-600', bgLight: 'from-amber-50 to-yellow-50', desc: 'Founder & top decision-maker. Only one CEO.', highlights: ['Full control of everything', 'Billing & company settings', 'Cannot be removed', 'Can transfer ownership'] },
    { id: 'executive', name: 'Executive', icon: Gem, color: 'from-purple-500 to-pink-500', bgLight: 'from-purple-50 to-pink-50', desc: 'Top-level leadership. VP, CTO, COO-style roles.', highlights: ['Manage entire team', 'All content actions', 'View finances (read-only)', 'Cannot remove CEO'] },
    { id: 'manager', name: 'Manager', icon: Briefcase, color: 'from-blue-500 to-cyan-500', bgLight: 'from-blue-50 to-cyan-50', desc: 'Department/section lead. Day-to-day management.', highlights: ['Send & publish content', 'Invite editors/members', 'View analytics', 'Manage subscribers'] },
    { id: 'editor', name: 'Editor', icon: Edit3, color: 'from-emerald-500 to-teal-500', bgLight: 'from-emerald-50 to-teal-50', desc: 'Content creator. Writes but doesn\'t publish.', highlights: ['Draft newsletters', 'Reply to customer messages', 'Upload images', 'No sending power'] },
    { id: 'member', name: 'Member', icon: Eye, color: 'from-slate-500 to-slate-600', bgLight: 'from-slate-50 to-slate-100', desc: 'Observer / Stakeholder. Read-only access.', highlights: ['View all reports', 'View campaigns', 'No write or send', 'Audit-friendly'] },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {roles.map((r) => {
        const Icon = r.icon;
        const isCEO = r.id === 'ceo';
        return (
          <div
            key={r.id}
            className={`p-5 rounded-2xl border bg-gradient-to-br ${r.bgLight} ${
              isCEO ? 'border-amber-300 shadow-lg shadow-amber-200/40 relative md:col-span-2 lg:col-span-1' : 'border-white'
            }`}
          >
            {isCEO && (
              <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[9px] font-bold tracking-wider shadow-md">
                ✨ FOUNDER
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{r.name}</h4>
                <p className="text-xs text-slate-600">{r.desc}</p>
              </div>
            </div>
            <ul className="space-y-1">
              {r.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-700">
                  <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

// ---------- 2E: Permissions matrix (5-tier corporate hierarchy) ----------
// Each section has its OWN set of actions that make sense for it.
// Campaigns are auto-generated (no Write/Send), Users has no Send, etc.
const PermissionsMatrixMock: React.FC = () => {
  const rows: Array<{
    section: string;
    icon: React.ElementType;
    actions: Array<{ label: string; allowed: string[] }>;
  }> = [
    { section: 'Messages', icon: MessageSquare, actions: [
      { label: 'View', allowed: ['ceo', 'executive', 'manager', 'editor', 'member'] },
      { label: 'Reply to customer', allowed: ['ceo', 'executive', 'manager', 'editor'] },
      { label: 'Delete', allowed: ['ceo', 'executive', 'manager'] },
    ]},
    { section: 'Newsletter', icon: Mail, actions: [
      { label: 'View', allowed: ['ceo', 'executive', 'manager', 'editor', 'member'] },
      { label: 'Write / Draft', allowed: ['ceo', 'executive', 'manager', 'editor'] },
      { label: 'Send / Publish', allowed: ['ceo', 'executive', 'manager'] },
      { label: 'Schedule', allowed: ['ceo', 'executive', 'manager'] },
    ]},
    { section: 'Campaigns', icon: BarChart3, actions: [
      { label: 'View stats', allowed: ['ceo', 'executive', 'manager', 'editor', 'member'] },
      { label: 'Export CSV', allowed: ['ceo', 'executive', 'manager'] },
    ]},
    { section: 'Users', icon: Users, actions: [
      { label: 'View list', allowed: ['ceo', 'executive', 'manager', 'member'] },
      { label: 'Manage roles', allowed: ['ceo', 'executive'] },
    ]},
    { section: 'Team', icon: Shield, actions: [
      { label: 'View members', allowed: ['ceo', 'executive', 'manager', 'editor', 'member'] },
      { label: 'Invite', allowed: ['ceo', 'executive', 'manager'] },
      { label: 'Remove', allowed: ['ceo', 'executive'] },
    ]},
    { section: 'Billing', icon: Settings, actions: [
      { label: 'View plan', allowed: ['ceo', 'executive'] },
      { label: 'Manage', allowed: ['ceo'] },
    ]},
  ];
  const cols = ['ceo', 'executive', 'manager', 'editor', 'member'];

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left font-semibold text-slate-700 py-2 px-2 sticky left-0 bg-white/70">Section</th>
            <th className="text-left font-semibold text-slate-700 py-2 px-2">Action</th>
            {cols.map((c) => (
              <th key={c} className="text-center py-2 px-2">
                <RoleBadge role={c} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <React.Fragment key={row.section}>
                {row.actions.map((a, i) => (
                  <tr key={a.label} className="hover:bg-slate-50/40">
                    {i === 0 && (
                      <td rowSpan={row.actions.length} className="py-2 px-2 align-top sticky left-0 bg-white/70">
                        <div className="flex items-center gap-2 font-medium text-slate-800">
                          <Icon className="w-4 h-4 text-purple-500" />
                          {row.section}
                        </div>
                      </td>
                    )}
                    <td className="py-1.5 px-2 text-xs text-slate-600">{a.label}</td>
                    {cols.map((c) => (
                      <td key={c} className="py-1.5 px-2 text-center">
                        {a.allowed.includes(c) ? (
                          <Check className="w-4 h-4 text-emerald-500 inline" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 inline" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ---------- 2F: Granular override ----------
const GranularOverrideMock: React.FC = () => {
  const [perms, setPerms] = useState({
    newsletter_view: true,
    newsletter_write: true,
    newsletter_send: false,
    newsletter_schedule: false,
    messages_view: true,
    messages_reply: true,
    campaigns_view: true,
    users_view: false,
    team_invite: false,
  });

  const sections = [
    { label: 'Newsletter', icon: Mail, items: [
      { key: 'newsletter_view', label: 'View newsletters' },
      { key: 'newsletter_write', label: 'Write & save drafts' },
      { key: 'newsletter_send', label: 'Send to subscribers' },
      { key: 'newsletter_schedule', label: 'Schedule for later' },
    ]},
    { label: 'Messages', icon: MessageSquare, items: [
      { key: 'messages_view', label: 'View customer messages' },
      { key: 'messages_reply', label: 'Reply to customer messages' },
    ]},
    { label: 'Other', icon: Settings, items: [
      { key: 'campaigns_view', label: 'View campaigns' },
      { key: 'users_view', label: 'View users' },
      { key: 'team_invite', label: 'Invite team members' },
    ]},
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 max-w-2xl mx-auto">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold shadow-md">
          A
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">Ahmed Hassan</p>
          <p className="text-xs text-slate-500">ahmed@example.com · custom permissions</p>
        </div>
      </div>
      <div className="p-5 space-y-5">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-semibold text-slate-800">{s.label}</h4>
              </div>
              <div className="space-y-1.5 pl-6">
                {s.items.map((item) => (
                  <label key={item.key} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <button
                      onClick={() => setPerms((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors ${
                        perms[item.key as keyof typeof perms] ? 'bg-purple-500' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`absolute inline-block w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          perms[item.key as keyof typeof perms] ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
        <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100">Reset to role default</button>
        <button className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500">Save</button>
      </div>
    </div>
  );
};

export default AdminTeamPreview;

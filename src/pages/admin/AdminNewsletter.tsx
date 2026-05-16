import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Send,
  Download,
  Mail,
  BarChart3,
  Plus,
  X,
  Trash2,
  RotateCcw,
  Search,
  Users,
  UserCheck,
  AtSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Sub {
  id: string;
  email: string;
  status: string;
  language: string;
  subscribed_at: string;
}

type SendMode = 'all' | 'selected' | 'custom';

const AdminNewsletter = () => {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [tip, setTip] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [sending, setSending] = useState(false);

  // Recipients UI state
  const [mode, setMode] = useState<SendMode>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [customEmails, setCustomEmails] = useState<string[]>(['']);

  const load = async () => {
    // Admin RLS policy allows authenticated admin to SELECT directly
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status, language, subscribed_at')
      .order('subscribed_at', { ascending: false });
    if (!error && data) setSubs(data as Sub[]);
    else if (error) {
      // Fall back to legacy RPC if direct select fails
      const { data: rpcData } = await supabase.rpc('admin_list_newsletter_subscribers');
      if (rpcData) setSubs(rpcData as Sub[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const activeCount = subs.filter((s) => s.status === 'active').length;
  const activeSubs = useMemo(() => subs.filter((s) => s.status === 'active'), [subs]);

  const filteredSubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeSubs.filter((s) => !q || s.email.toLowerCase().includes(q));
  }, [activeSubs, search]);

  // Recipient count for the Send button
  const recipientCount = useMemo(() => {
    if (mode === 'all') return activeCount;
    if (mode === 'selected') return selected.size;
    return customEmails.filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())).length;
  }, [mode, activeCount, selected, customEmails]);

  // --- Selection helpers ---
  const toggleOne = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };
  const selectAllVisible = () => setSelected(new Set(filteredSubs.map((s) => s.email)));
  const deselectAll = () => setSelected(new Set());
  const invertSelection = () => {
    setSelected((prev) => {
      const next = new Set<string>();
      filteredSubs.forEach((s) => {
        if (!prev.has(s.email)) next.add(s.email);
      });
      // Keep any selected ones that aren't currently visible
      activeSubs.forEach((s) => {
        if (prev.has(s.email) && !filteredSubs.some((f) => f.email === s.email)) {
          next.add(s.email);
        }
      });
      return next;
    });
  };

  // --- Subscriber actions ---
  const deactivate = async (sub: Sub) => {
    if (!confirm(`Deactivate ${sub.email}? They won't receive future broadcasts.`)) return;
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('id', sub.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Deactivated ${sub.email}`);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(sub.email);
      return next;
    });
    load();
  };
  const reactivate = async (sub: Sub) => {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'active' })
      .eq('id', sub.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Reactivated ${sub.email}`);
    load();
  };
  const hardDelete = async (sub: Sub) => {
    if (!confirm(`PERMANENTLY delete ${sub.email}? This cannot be undone.`)) return;
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', sub.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Deleted ${sub.email}`);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(sub.email);
      return next;
    });
    load();
  };

  // --- Custom emails helpers ---
  const updateCustomAt = (i: number, value: string) => {
    setCustomEmails((prev) => prev.map((e, idx) => (idx === i ? value : e)));
  };
  const removeCustomAt = (i: number) => {
    setCustomEmails((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      return next.length === 0 ? [''] : next;
    });
  };
  const addCustomField = () => setCustomEmails((prev) => [...prev, '']);

  // --- Send handler ---
  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and body are required');
      return;
    }
    if (recipientCount === 0) {
      toast.error('No recipients selected');
      return;
    }
    const confirmMsg =
      mode === 'all'
        ? `Send to all ${recipientCount} active subscribers?`
        : mode === 'selected'
          ? `Send to ${recipientCount} selected subscriber${recipientCount === 1 ? '' : 's'}?`
          : `Send to ${recipientCount} custom email${recipientCount === 1 ? '' : 's'}?`;
    if (!confirm(confirmMsg)) return;

    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Please sign in again before sending.');

      const payload: Record<string, unknown> = {
        subject,
        subtitle,
        body,
        tip,
        cta_text: ctaText || undefined,
        cta_url: ctaUrl || undefined,
        mode,
      };
      if (mode === 'selected') payload.selected_emails = Array.from(selected);
      if (mode === 'custom') {
        payload.custom_emails = customEmails
          .map((e) => e.trim())
          .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      }

      const { data, error } = await supabase.functions.invoke('send-newsletter-broadcast', {
        body: payload,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error(
          (data as { detail?: string; error?: string })?.detail ||
            (data as { error?: string })?.error ||
            error?.message ||
            'Send failed',
        );
      }

      const result = data as { sent: number; total: number; campaign_id?: string };
      toast.success(`Sent to ${result.sent} of ${result.total} recipients`);

      // Reset composer
      setSubject('');
      setSubtitle('');
      setBody('');
      setTip('');
      setCtaText('');
      setCtaUrl('');
      setSelected(new Set());
      setCustomEmails(['']);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const exportCsv = () => {
    const csv = [
      'email,status,language,subscribed_at',
      ...subs.map((s) => `${s.email},${s.status},${s.language},${s.subscribed_at}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendLabel = sending
    ? 'Sending...'
    : mode === 'all'
      ? `Send to all ${recipientCount}`
      : `Send to ${recipientCount}`;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Newsletter</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCount} active · {subs.length} total subscribers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/campaigns">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" /> Campaigns
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={subs.length === 0}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Composer */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold">Compose broadcast</h2>
          </div>
          <div>
            <Label htmlFor="subject">Title</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="A new feature you'll love..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle (optional)</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="This week's update"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="body">
              Body (Markdown supported: **bold**, *italic*, [link](url), - lists)
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="mt-1"
              placeholder={`We just shipped **a new feature**...\n\nCheck it out: [link](https://sleepybabyy.com)`}
            />
          </div>
          <div>
            <Label htmlFor="tip">Quick Tip / Quote (optional)</Label>
            <Textarea
              id="tip"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="A consistent bedtime routine helps babies sleep better."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cta_text">CTA button text (optional)</Label>
              <Input
                id="cta_text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Read more"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cta_url">CTA button URL (optional)</Label>
              <Input
                id="cta_url"
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://sleepybabyy.com/..."
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Recipients picker */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold">Recipients</h2>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ModeButton
              active={mode === 'all'}
              icon={<Users className="h-4 w-4" />}
              title="All subscribers"
              subtitle={`${activeCount} active`}
              onClick={() => setMode('all')}
            />
            <ModeButton
              active={mode === 'selected'}
              icon={<UserCheck className="h-4 w-4" />}
              title="Select subscribers"
              subtitle={`${selected.size} chosen`}
              onClick={() => setMode('selected')}
            />
            <ModeButton
              active={mode === 'custom'}
              icon={<AtSign className="h-4 w-4" />}
              title="Custom emails"
              subtitle={`${recipientCount} valid`}
              onClick={() => setMode('custom')}
            />
          </div>

          {/* Mode-specific content */}
          {mode === 'all' && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
              <p className="font-medium mb-1">Send to all {activeCount} active subscribers</p>
              <p className="text-xs text-purple-700">
                Everyone who hasn't unsubscribed will receive this broadcast.
              </p>
            </div>
          )}

          {mode === 'selected' && (
            <div className="space-y-3">
              {/* Search + bulk actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subscribers..."
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={selectAllVisible}>
                  Select all{search ? ' visible' : ''}
                </Button>
                <Button variant="outline" size="sm" onClick={invertSelection}>
                  Invert
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll} disabled={selected.size === 0}>
                  Clear
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                <strong>{selected.size}</strong> selected of {filteredSubs.length}
                {search && filteredSubs.length !== activeSubs.length && ` (filtered from ${activeSubs.length})`}
              </p>

              {/* Subscriber list with checkboxes */}
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : filteredSubs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {activeSubs.length === 0 ? 'No active subscribers' : 'No matches'}
                </div>
              ) : (
                <div className="border rounded-lg max-h-[400px] overflow-y-auto divide-y">
                  {filteredSubs.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 cursor-pointer"
                    >
                      <Checkbox
                        checked={selected.has(s.email)}
                        onCheckedChange={() => toggleOne(s.email)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.email}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(s.subscribed_at), 'MMM d, yyyy')} · {s.language.toUpperCase()}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'custom' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Send to any email — they don't have to be subscribers. Useful for VIPs, partners, or
                personalized one-offs.
              </p>
              <div className="space-y-2">
                {customEmails.map((email, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateCustomAt(i, e.target.value)}
                      placeholder={`recipient${i + 1}@example.com`}
                      className={
                        email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                          ? 'border-rose-300 focus-visible:ring-rose-200'
                          : ''
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomAt(i)}
                      className="flex-shrink-0 text-muted-foreground hover:text-rose-600"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addCustomField} className="rounded-full">
                <Plus className="h-4 w-4 mr-1.5" />
                Add another email
              </Button>
            </div>
          )}

          {/* Big Send button */}
          <div className="flex justify-end pt-3 border-t">
            <Button
              onClick={handleSend}
              disabled={sending || recipientCount === 0}
              size="lg"
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-md shadow-purple-500/30 rounded-full px-6"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendLabel}
            </Button>
          </div>
        </Card>

        {/* Subscribers list with manage actions */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Manage subscribers</h2>
            <span className="text-xs text-muted-foreground">
              {activeCount} active · {subs.length - activeCount} unsubscribed
            </span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : subs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No subscribers yet</div>
          ) : (
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {subs.map((s) => (
                <div
                  key={s.id}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        s.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm">{s.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(s.subscribed_at), 'MMM d, yyyy')} ·{' '}
                        {s.language.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={s.status === 'active' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {s.status}
                    </Badge>
                    {s.status === 'active' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deactivate(s)}
                        title="Deactivate (stops future emails)"
                        className="text-muted-foreground hover:text-amber-600 h-8 w-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => reactivate(s)}
                        title="Reactivate"
                        className="text-muted-foreground hover:text-emerald-600 h-8 w-8"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => hardDelete(s)}
                      title="Permanently delete"
                      className="text-muted-foreground hover:text-rose-600 h-8 w-8"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

const ModeButton = ({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
      active
        ? 'border-purple-500 bg-purple-50'
        : 'border-gray-200 bg-white hover:border-purple-200'
    }`}
  >
    <div
      className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className={`text-sm font-semibold ${active ? 'text-purple-900' : 'text-gray-900'}`}>
        {title}
      </p>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
    </div>
  </button>
);

export default AdminNewsletter;

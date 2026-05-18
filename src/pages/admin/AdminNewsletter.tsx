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
  FileText,
  Save,
  Calendar,
  Clock,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Megaphone,
  Gift,
  Lightbulb,
  Check,
  PauseCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Lock } from 'lucide-react';

interface Sub {
  id: string;
  email: string;
  status: string;
  language: string;
  subscribed_at: string;
}

interface Draft {
  id: string;
  subject: string;
  subtitle: string | null;
  body: string;
  tip: string | null;
  cta_text: string | null;
  cta_url: string | null;
  mode: string;
  selected_emails: string[] | null;
  custom_emails: string[] | null;
  updated_at: string;
}

interface ScheduledCampaign {
  id: string;
  subject: string;
  scheduled_for: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface StoredImage {
  name: string;
  url: string;
  created_at: string;
  size?: number;
}

type SendMode = 'all' | 'selected' | 'custom';
type SendTiming = 'now' | 'later';

// Hardcoded starter templates. Subject/body have {{name}}-style placeholders the admin can replace.
const NEWSLETTER_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome',
    tag: 'Onboarding',
    icon: Sparkles,
    color: 'from-pink-400 to-purple-500',
    subject: 'Welcome to SleepyBabyy! 👋',
    subtitle: "Here's how to get the most out of your account",
    body: "Hi there!\n\nWelcome to **SleepyBabyy**. We're so glad you joined us. Here are 3 things to get you started:\n\n- **Track your baby's sleep** — log naps and nighttime sleep in seconds\n- **Get insights** — see patterns and trends over time\n- **Share with family** — invite your partner or caregivers\n\nIf you have questions, just reply to this email — we read every message.",
    tip: 'Consistency is the most important factor in baby sleep — try to keep wake-up and bedtime within 30 minutes each day.',
    cta_text: 'Open Dashboard',
    cta_url: 'https://sleepybabyy.com/dashboard',
  },
  {
    id: 'update',
    name: 'Product Update',
    tag: 'News',
    icon: Megaphone,
    color: 'from-blue-400 to-indigo-500',
    subject: "What's new in SleepyBabyy",
    subtitle: 'This month we shipped some things you might love',
    body: "We've been busy! Here's what's new:\n\n- **New feature here** — a short description of what it does\n- **Improvement** — something that got faster or better\n- **Bug fix** — that annoying thing? Fixed.\n\nTry them out and let us know what you think!",
    tip: '',
    cta_text: 'See the updates',
    cta_url: 'https://sleepybabyy.com/dashboard',
  },
  {
    id: 'promo',
    name: 'Promo / Offer',
    tag: 'Marketing',
    icon: Gift,
    color: 'from-orange-400 to-amber-500',
    subject: 'A special offer just for you 🎁',
    subtitle: 'Limited time — ends soon',
    body: "Hey!\n\nFor a limited time, get **30% off** SleepyBabyy Premium. Unlock:\n\n- Unlimited baby profiles\n- Advanced analytics & reports\n- Pediatrician-ready PDFs\n- Priority support\n\nUse code **SLEEPY30** at checkout. Offer ends Sunday at midnight.",
    tip: '',
    cta_text: 'Upgrade now',
    cta_url: 'https://sleepybabyy.com/subscription',
  },
  {
    id: 'tips',
    name: 'Weekly Tips',
    tag: 'Content',
    icon: Lightbulb,
    color: 'from-emerald-400 to-teal-500',
    subject: '5 sleep tips for this week',
    subtitle: 'Small changes, big results',
    body: "This week we're sharing 5 evidence-based tips for better baby sleep:\n\n- **Create a routine** — same order, same time every night\n- **Mind the wake windows** — overtired babies sleep worse\n- **Dim the lights** an hour before bedtime\n- **Watch for sleep cues** — yawning, eye rubbing, fussiness\n- **Stay consistent** — even on weekends",
    tip: 'A 20-minute wind-down routine before bed signals the brain it\'s time to sleep.',
    cta_text: 'Read the full guide',
    cta_url: 'https://sleepybabyy.com/blog',
  },
];

const AdminNewsletter = () => {
  // Role-based gating: Member sees read-only view, Editor can write/save draft
  // but not send, Manager+ can do everything. Destructive subscriber actions
  // (deactivate / permanent delete) are CEO-only.
  const { canWrite, canPublish, role, isCeo } = useAdminRole();
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

  // Scheduling
  const [timing, setTiming] = useState<SendTiming>('now');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [scheduledList, setScheduledList] = useState<ScheduledCampaign[]>([]);

  // Drafts
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // Templates modal
  const [showTemplates, setShowTemplates] = useState(false);

  // Image library modal
  const [showImages, setShowImages] = useState(false);
  const [imageTab, setImageTab] = useState<'library' | 'upload' | 'url'>('library');
  const [imageUrl, setImageUrl] = useState('');
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [uploading, setUploading] = useState(false);

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

  // Load drafts, scheduled campaigns, and image library on mount
  const loadDrafts = async () => {
    const { data } = await supabase
      .from('newsletter_drafts')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);
    if (data) setDrafts(data as Draft[]);
  };

  const loadScheduled = async () => {
    const { data } = await supabase
      .from('newsletter_scheduled_campaigns')
      .select('id, subject, scheduled_for, status, error_message, created_at')
      .in('status', ['pending', 'processing', 'failed'])
      .order('scheduled_for', { ascending: true })
      .limit(20);
    if (data) setScheduledList(data as ScheduledCampaign[]);
  };

  const loadImages = async () => {
    const { data, error } = await supabase.storage.from('newsletter-images').list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error || !data) return;
    const imgs = data
      .filter((f) => f.name && !f.name.endsWith('/'))
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from('newsletter-images').getPublicUrl(f.name).data.publicUrl,
        created_at: f.created_at ?? '',
        size: f.metadata?.size,
      }));
    setStoredImages(imgs);
  };

  useEffect(() => {
    load();
    loadDrafts();
    loadScheduled();
    loadImages();
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

  // --- Templates ---
  const applyTemplate = (tpl: typeof NEWSLETTER_TEMPLATES[number]) => {
    setSubject(tpl.subject);
    setSubtitle(tpl.subtitle);
    setBody(tpl.body);
    setTip(tpl.tip);
    setCtaText(tpl.cta_text);
    setCtaUrl(tpl.cta_url);
    setShowTemplates(false);
    setCurrentDraftId(null);
    toast.success(`Loaded "${tpl.name}" template`);
  };

  // --- Drafts ---
  const saveDraft = async () => {
    if (!subject.trim() && !body.trim()) {
      toast.error('Nothing to save — add a subject or body first');
      return;
    }
    const payload = {
      subject,
      subtitle: subtitle || null,
      body,
      tip: tip || null,
      cta_text: ctaText || null,
      cta_url: ctaUrl || null,
      mode,
      selected_emails: Array.from(selected),
      custom_emails: customEmails.filter((e) => e.trim()),
    };
    if (currentDraftId) {
      const { error } = await supabase
        .from('newsletter_drafts')
        .update(payload)
        .eq('id', currentDraftId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Draft updated');
    } else {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      const { data, error } = await supabase
        .from('newsletter_drafts')
        .insert({ ...payload, created_by: userId })
        .select('id')
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      setCurrentDraftId(data.id);
      toast.success('Draft saved');
    }
    loadDrafts();
  };

  const loadDraft = (d: Draft) => {
    setSubject(d.subject);
    setSubtitle(d.subtitle ?? '');
    setBody(d.body);
    setTip(d.tip ?? '');
    setCtaText(d.cta_text ?? '');
    setCtaUrl(d.cta_url ?? '');
    setMode((d.mode as SendMode) ?? 'all');
    setSelected(new Set(d.selected_emails ?? []));
    setCustomEmails(d.custom_emails && d.custom_emails.length > 0 ? d.custom_emails : ['']);
    setCurrentDraftId(d.id);
    toast.success('Draft loaded');
  };

  const deleteDraft = async (id: string) => {
    if (!confirm('Delete this draft?')) return;
    const { error } = await supabase.from('newsletter_drafts').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (currentDraftId === id) setCurrentDraftId(null);
    toast.success('Draft deleted');
    loadDrafts();
  };

  // --- Image upload ---
  const uploadImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5 MB)');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('newsletter-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('newsletter-images').getPublicUrl(fileName);
    insertImageIntoBody(urlData.publicUrl, file.name);
    await loadImages();
    setUploading(false);
    setShowImages(false);
    toast.success('Image uploaded and inserted');
  };

  const insertImageIntoBody = (url: string, alt: string = 'Image') => {
    const markdown = `\n![${alt}](${url})\n`;
    setBody((prev) => prev + markdown);
  };

  const insertImageFromUrl = () => {
    if (!imageUrl.trim() || !/^https?:\/\//i.test(imageUrl)) {
      toast.error('Enter a valid http(s) URL');
      return;
    }
    insertImageIntoBody(imageUrl.trim());
    setImageUrl('');
    setShowImages(false);
    toast.success('Image inserted');
  };

  const deleteStoredImage = async (name: string) => {
    if (!confirm(`Delete ${name} from library?`)) return;
    const { error } = await supabase.storage.from('newsletter-images').remove([name]);
    if (error) {
      toast.error(error.message);
      return;
    }
    loadImages();
    toast.success('Image deleted');
  };

  // --- Scheduling ---
  const cancelScheduled = async (id: string) => {
    if (!confirm('Cancel this scheduled send?')) return;
    const { error } = await supabase
      .from('newsletter_scheduled_campaigns')
      .update({ status: 'canceled' })
      .eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Scheduled send canceled');
    loadScheduled();
  };

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

      // If scheduling, compute the UTC timestamp from the user-picked local datetime
      // and send it along — the edge function will store rather than send immediately.
      if (timing === 'later') {
        const local = new Date(`${scheduledDate}T${scheduledTime}`);
        if (isNaN(local.getTime()) || local.getTime() < Date.now()) {
          toast.error('Pick a future date/time');
          setSending(false);
          return;
        }
        payload.scheduled_for = local.toISOString();
      }

      // Call the edge function directly so we can read the response body on error.
      // supabase.functions.invoke() hides non-2xx response bodies behind a generic
      // "Edge Function returned a non-2xx status code" message, which makes it
      // impossible to tell the user why the send actually failed.
      const supabaseUrl = (supabase as unknown as { supabaseUrl: string }).supabaseUrl
        ?? import.meta.env.VITE_SUPABASE_URL
        ?? 'https://wjxxgccfazpkdfzbcgen.supabase.co';
      const resp = await fetch(`${supabaseUrl}/functions/v1/send-newsletter-broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const respText = await resp.text();
      let data: { sent?: number; total?: number; campaign_id?: string; error?: string; detail?: string } = {};
      try { data = JSON.parse(respText); } catch { /* not JSON */ }
      if (!resp.ok || data.error) {
        throw new Error(data.detail || data.error || respText || `HTTP ${resp.status}`);
      }

      const result = data as { sent?: number; total?: number; campaign_id?: string; scheduled?: boolean; scheduled_for?: string };
      if (result.scheduled) {
        toast.success(`Scheduled for ${new Date(result.scheduled_for!).toLocaleString()}`);
        loadScheduled();
      } else {
        toast.success(`Sent to ${result.sent} of ${result.total} recipients`);
      }

      // Reset composer
      setSubject('');
      setSubtitle('');
      setBody('');
      setTip('');
      setCtaText('');
      setCtaUrl('');
      setSelected(new Set());
      setCustomEmails(['']);
      setCurrentDraftId(null);
      setTiming('now');

      // If this was a saved draft, remove it now that it's been sent/scheduled
      if (currentDraftId) {
        await supabase.from('newsletter_drafts').delete().eq('id', currentDraftId);
        loadDrafts();
      }
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
    ? (timing === 'later' ? 'Scheduling...' : 'Sending...')
    : timing === 'later'
      ? `Schedule for ${recipientCount}`
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

        {/* Read-only banner for Members (cannot write/send) */}
        {!canWrite && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Read-only access</p>
                <p className="text-xs text-amber-700 mt-1">
                  As a <strong>{role === 'member' ? 'Member' : role}</strong>, you can view subscribers
                  and campaigns but cannot compose or send newsletters. Ask your CEO or Executive to upgrade your role.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Composer + Recipients — hidden for Members (read-only) */}
        {canWrite && (
          <>
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <h2 className="font-semibold">Compose broadcast</h2>
              {currentDraftId && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  EDITING DRAFT
                </span>
              )}
              {!canPublish && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> DRAFT-ONLY
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                <FileText className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                Templates
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowImages(true)}>
                <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                Image
              </Button>
              <Button variant="outline" size="sm" onClick={saveDraft}>
                <Save className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                {currentDraftId ? 'Update draft' : 'Save draft'}
              </Button>
            </div>
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

          {/* Timing: send now or schedule for later */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-sm">When to send</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTiming('now')}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  timing === 'now' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Send className={`h-4 w-4 ${timing === 'now' ? 'text-purple-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-semibold ${timing === 'now' ? 'text-purple-900' : 'text-gray-900'}`}>
                    Send now
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Deliver immediately</p>
              </button>
              <button
                type="button"
                onClick={() => setTiming('later')}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  timing === 'later' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className={`h-4 w-4 ${timing === 'later' ? 'text-purple-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-semibold ${timing === 'later' ? 'text-purple-900' : 'text-gray-900'}`}>
                    Schedule for later
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Pick a date/time</p>
              </button>
            </div>
            {timing === 'later' && (
              <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="sched_date" className="text-xs">Date</Label>
                  <Input
                    id="sched_date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sched_time" className="text-xs">Time</Label>
                  <Input
                    id="sched_time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground col-span-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  Will send on {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()} (your local time)
                </p>
              </div>
            )}
          </div>

          {/* Big Send button — only Manager+ can actually publish */}
          <div className="flex justify-end pt-3 border-t">
            {canPublish ? (
              <Button
                onClick={handleSend}
                disabled={sending || recipientCount === 0}
                size="lg"
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-md shadow-purple-500/30 rounded-full px-6"
              >
                {timing === 'later' ? <Calendar className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {sendLabel}
              </Button>
            ) : (
              <div className="flex items-center gap-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <Lock className="h-3.5 w-3.5" />
                <span>Editors can only save drafts. Ask your CEO/Manager to send.</span>
              </div>
            )}
          </div>
        </Card>
          </>
        )}

        {/* Scheduled queue */}
        {scheduledList.length > 0 && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold text-sm">Scheduled queue</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {scheduledList.length} {scheduledList.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="divide-y">
              {scheduledList.map((s) => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        s.status === 'failed'
                          ? 'bg-rose-50 text-rose-600'
                          : s.status === 'processing'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {s.status === 'failed' ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : s.status === 'processing' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <PauseCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.scheduled_for).toLocaleString()}
                        {s.error_message && ` · ${s.error_message}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={s.status === 'failed' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {s.status}
                    </Badge>
                    {s.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => cancelScheduled(s.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Drafts */}
        {drafts.length > 0 && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <h2 className="font-semibold text-sm">Drafts</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {drafts.length} saved
              </span>
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {drafts.map((d) => (
                <div key={d.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/30">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${!d.subject ? 'italic text-muted-foreground' : ''}`}>
                      {d.subject || 'Untitled draft'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {format(new Date(d.updated_at), 'MMM d, h:mm a')} · {d.body?.length ?? 0} chars
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => loadDraft(d)} className="h-7">
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDraft(d.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

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
                    {isCeo && (s.status === 'active' ? (
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
                    ))}
                    {isCeo && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => hardDelete(s)}
                        title="Permanently delete"
                        className="text-muted-foreground hover:text-rose-600 h-8 w-8"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Templates modal */}
      {showTemplates && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowTemplates(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Pick a template
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Replaces your current composer content. Save as draft first if you want to keep it.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowTemplates(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {NEWSLETTER_TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{t.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium uppercase tracking-wider">
                            {t.tag}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.subject}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {t.body.split('\n')[0].slice(0, 100)}...
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Image library modal */}
      {showImages && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowImages(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-emerald-500" />
                  Insert image
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Image will be appended to the body as markdown.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowImages(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4">
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                {[
                  { key: 'library', label: 'Library', icon: ImageIcon },
                  { key: 'upload', label: 'Upload', icon: Upload },
                  { key: 'url', label: 'From URL', icon: AtSign },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setImageTab(t.key as 'library' | 'upload' | 'url')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        imageTab === t.key
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {imageTab === 'upload' && (
                <div>
                  <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                      }}
                    />
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {uploading ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP, GIF — up to 5 MB</p>
                  </label>
                </div>
              )}

              {imageTab === 'url' && (
                <div className="space-y-3">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={insertImageFromUrl} className="bg-purple-600 hover:bg-purple-700">
                      <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                      Insert
                    </Button>
                  </div>
                </div>
              )}

              {imageTab === 'library' && (
                <div>
                  {storedImages.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No images yet. Upload one or paste a URL.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {storedImages.map((img) => (
                        <div
                          key={img.name}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                            <div className="text-[10px] text-white font-medium truncate">{img.name}</div>
                          </div>
                          <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/20 transition-all flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                insertImageIntoBody(img.url);
                                setShowImages(false);
                                toast.success('Image inserted');
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg px-3 py-1.5 text-xs font-medium text-purple-700 shadow-md"
                            >
                              <Check className="h-3 w-3 inline mr-1" /> Insert
                            </button>
                            <button
                              onClick={() => deleteStoredImage(img.name)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg p-1.5 text-rose-600 shadow-md"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

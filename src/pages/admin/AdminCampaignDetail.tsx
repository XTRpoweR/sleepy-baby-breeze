import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  Mail,
  Eye,
  MousePointer,
  XCircle,
  AlertTriangle,
  Download,
  Inbox,
} from 'lucide-react';

interface Campaign {
  id: string;
  subject: string;
  subtitle: string | null;
  body: string;
  sent_at: string;
  total_recipients: number;
  total_delivered: number;
  total_opens: number;
  total_unique_opens: number;
  total_clicks: number;
  total_unique_clicks: number;
  total_bounces: number;
  total_complaints: number;
}

interface EventRow {
  id: string;
  recipient_email: string;
  event_type: string;
  event_at: string;
  click_url: string | null;
}

interface SendRow {
  recipient_email: string;
  sent_at: string;
}

type Tab = 'opened' | 'clicked' | 'not_opened' | 'bounced' | 'all';

const pct = (num: number, denom: number): string => {
  if (!denom) return '—';
  return `${Math.round((num / denom) * 100)}%`;
};

const AdminCampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [sends, setSends] = useState<SendRow[]>([]);
  const [tab, setTab] = useState<Tab>('opened');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      const [{ data: cData }, { data: eData }, { data: sData }] = await Promise.all([
        supabase.from('newsletter_campaigns').select('*').eq('id', id).maybeSingle(),
        supabase
          .from('newsletter_events')
          .select('id, recipient_email, event_type, event_at, click_url')
          .eq('campaign_id', id)
          .order('event_at', { ascending: false })
          .limit(2000),
        supabase
          .from('newsletter_sends')
          .select('recipient_email, sent_at')
          .eq('campaign_id', id)
          .order('sent_at', { ascending: true })
          .limit(5000),
      ]);
      if (!active) return;
      if (cData) setCampaign(cData as Campaign);
      if (eData) setEvents(eData as EventRow[]);
      if (sData) setSends(sData as SendRow[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-purple-200 border-t-purple-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!campaign) {
    return (
      <AdminLayout>
        <Card className="p-10 text-center max-w-md mx-auto">
          <p className="font-semibold mb-3">Campaign not found</p>
          <Link to="/admin/campaigns" className="text-sm font-semibold text-purple-600">
            Back to campaigns
          </Link>
        </Card>
      </AdminLayout>
    );
  }

  // Unique sets by recipient email
  const openedEmails = new Set(events.filter((e) => e.event_type === 'opened').map((e) => e.recipient_email));
  const clickedEmails = new Set(events.filter((e) => e.event_type === 'clicked').map((e) => e.recipient_email));
  const bouncedEmails = new Set(events.filter((e) => e.event_type === 'bounced').map((e) => e.recipient_email));
  const allRecipients = sends.map((s) => s.recipient_email);
  const notOpened = allRecipients.filter((e) => !openedEmails.has(e));

  let listToShow: { email: string; meta?: string }[] = [];
  if (tab === 'opened') {
    const rows = events.filter((e) => e.event_type === 'opened');
    const byEmail = new Map<string, string>();
    rows.forEach((r) => {
      if (!byEmail.has(r.recipient_email)) byEmail.set(r.recipient_email, r.event_at);
    });
    listToShow = Array.from(byEmail.entries()).map(([email, t]) => ({
      email,
      meta: `Opened ${format(new Date(t), 'd MMM HH:mm')}`,
    }));
  } else if (tab === 'clicked') {
    const rows = events.filter((e) => e.event_type === 'clicked');
    listToShow = rows.map((r) => ({
      email: r.recipient_email,
      meta: `Clicked ${r.click_url || ''} · ${format(new Date(r.event_at), 'd MMM HH:mm')}`,
    }));
  } else if (tab === 'bounced') {
    listToShow = Array.from(bouncedEmails).map((email) => ({ email, meta: 'Bounced' }));
  } else if (tab === 'not_opened') {
    listToShow = notOpened.map((email) => ({ email, meta: 'No open recorded' }));
  } else {
    listToShow = allRecipients.map((email) => ({ email }));
  }

  const exportListCsv = () => {
    const csv = ['email,status', ...listToShow.map((r) => `${r.email},${r.meta || tab}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaign.id.slice(0, 8)}-${tab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const denomForRate = campaign.total_delivered || campaign.total_recipients;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="min-w-0 flex-1">
            <Link
              to="/admin/campaigns"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-3 w-3" />
              All campaigns
            </Link>
            <h1 className="text-xl md:text-2xl font-bold truncate">{campaign.subject}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Sent {format(new Date(campaign.sent_at), 'd MMM yyyy · HH:mm')} to{' '}
              {campaign.total_recipients} recipients
            </p>
          </div>
        </div>

        {/* Big stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <BigStat
            icon={<Mail className="h-4 w-4 text-gray-700" />}
            label="Sent"
            value={campaign.total_recipients}
            pct=""
            bg="bg-gray-50"
          />
          <BigStat
            icon={<Mail className="h-4 w-4 text-emerald-600" />}
            label="Delivered"
            value={campaign.total_delivered}
            pct={pct(campaign.total_delivered, campaign.total_recipients)}
            bg="bg-emerald-50"
          />
          <BigStat
            icon={<Eye className="h-4 w-4 text-purple-600" />}
            label="Opened"
            value={campaign.total_unique_opens}
            pct={pct(campaign.total_unique_opens, denomForRate)}
            bg="bg-purple-50"
          />
          <BigStat
            icon={<MousePointer className="h-4 w-4 text-blue-600" />}
            label="Clicked"
            value={campaign.total_unique_clicks}
            pct={pct(campaign.total_unique_clicks, denomForRate)}
            bg="bg-blue-50"
          />
          <BigStat
            icon={<XCircle className="h-4 w-4 text-rose-600" />}
            label="Bounced"
            value={campaign.total_bounces}
            pct={pct(campaign.total_bounces, campaign.total_recipients)}
            bg="bg-rose-50"
          />
        </div>

        {campaign.total_complaints > 0 && (
          <Card className="p-4 bg-amber-50 border-amber-200 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                {campaign.total_complaints} spam complaints
              </p>
              <p className="text-xs text-amber-700">
                Recipients marked this campaign as spam. Consider reviewing your content.
              </p>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Card className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  { key: 'opened' as const, label: `Opened (${openedEmails.size})` },
                  { key: 'clicked' as const, label: `Clicked (${clickedEmails.size})` },
                  { key: 'not_opened' as const, label: `Not opened (${notOpened.length})` },
                  { key: 'bounced' as const, label: `Bounced (${bouncedEmails.size})` },
                  { key: 'all' as const, label: `All (${allRecipients.length})` },
                ] as { key: Tab; label: string }[]
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    tab === t.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={exportListCsv} disabled={listToShow.length === 0}>
              <Download className="h-3.5 w-3.5 mr-1" />
              CSV
            </Button>
          </div>

          {listToShow.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No recipients in this category yet
            </div>
          ) : (
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {listToShow.slice(0, 500).map((row, i) => (
                <div key={`${row.email}-${i}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                  <span className="text-sm text-gray-900 truncate flex-1">{row.email}</span>
                  {row.meta && (
                    <Badge variant="outline" className="text-[10px] flex-shrink-0">
                      {row.meta}
                    </Badge>
                  )}
                </div>
              ))}
              {listToShow.length > 500 && (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  Showing first 500 · export CSV for the full list
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

const BigStat = ({
  icon,
  label,
  value,
  pct,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  pct: string;
  bg: string;
}) => (
  <Card className={`p-4 ${bg} border-0 shadow-sm`}>
    <div className="flex items-center gap-1.5 mb-1.5">
      {icon}
      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-600">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {pct && <p className="text-xs text-gray-500 mt-0.5">{pct}</p>}
  </Card>
);

export default AdminCampaignDetail;

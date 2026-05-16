import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Mail,
  Eye,
  MousePointer,
  XCircle,
  ChevronRight,
  Inbox,
} from 'lucide-react';

interface Campaign {
  id: string;
  subject: string;
  sent_at: string;
  total_recipients: number;
  total_delivered: number;
  total_opens: number;
  total_unique_opens: number;
  total_clicks: number;
  total_unique_clicks: number;
  total_bounces: number;
}

const pct = (num: number, denom: number): string => {
  if (!denom) return '—';
  return `${Math.round((num / denom) * 100)}%`;
};

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('sent_at', { ascending: false });
      if (!active) return;
      if (!error && data) setCampaigns(data as Campaign[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Campaigns</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'} sent · open & click tracking
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="p-10 flex justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-purple-200 border-t-purple-500 animate-spin" />
          </Card>
        ) : campaigns.length === 0 ? (
          <Card className="p-10 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No campaigns yet</p>
            <p className="text-sm text-muted-foreground">
              Send your first newsletter to start tracking opens, clicks, and bounces.
            </p>
            <Link
              to="/admin/newsletter"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              <Mail className="h-4 w-4" />
              Compose a broadcast
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <Link key={c.id} to={`/admin/campaigns/${c.id}`} className="block">
                <Card className="p-5 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(c.sent_at), 'd MMM yyyy · HH:mm')}
                      </p>
                      <h3 className="font-bold text-base text-gray-900 truncate">{c.subject}</h3>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {c.total_recipients} sent
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Stat
                      icon={<Mail className="h-3.5 w-3.5 text-emerald-600" />}
                      label="Delivered"
                      value={c.total_delivered}
                      pct={pct(c.total_delivered, c.total_recipients)}
                    />
                    <Stat
                      icon={<Eye className="h-3.5 w-3.5 text-purple-600" />}
                      label="Opens"
                      value={c.total_unique_opens}
                      pct={pct(c.total_unique_opens, c.total_delivered || c.total_recipients)}
                    />
                    <Stat
                      icon={<MousePointer className="h-3.5 w-3.5 text-blue-600" />}
                      label="Clicks"
                      value={c.total_unique_clicks}
                      pct={pct(c.total_unique_clicks, c.total_delivered || c.total_recipients)}
                    />
                    <Stat
                      icon={<XCircle className="h-3.5 w-3.5 text-rose-600" />}
                      label="Bounces"
                      value={c.total_bounces}
                      pct={pct(c.total_bounces, c.total_recipients)}
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-1.5 text-xs font-semibold text-purple-600 group-hover:gap-2 transition-all">
                    View details
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const Stat = ({
  icon,
  label,
  value,
  pct,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  pct: string;
}) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{label}</span>
    </div>
    <p className="text-xl font-bold text-gray-900">{value}</p>
    <p className="text-[11px] text-gray-500">{pct}</p>
  </div>
);

export default AdminCampaigns;

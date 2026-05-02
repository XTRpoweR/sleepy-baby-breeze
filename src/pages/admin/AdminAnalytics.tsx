import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Users, Baby, Activity, Mail, CreditCard, MessageSquare, TrendingUp } from 'lucide-react';

interface Analytics {
  total_users: number;
  users_last_7d: number;
  users_last_30d: number;
  total_babies: number;
  total_activities: number;
  activities_last_7d: number;
  newsletter_active: number;
  newsletter_total: number;
  subs_active: number;
  subs_trialing: number;
  subs_basic: number;
  open_threads: number;
  unread_messages: number;
  signups_by_day: { date: string; count: number }[];
}

const StatCard = ({ icon: Icon, label, value, sub, gradient }: any) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <p className="text-2xl md:text-3xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${gradient}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </Card>
);

const AdminAnalytics = () => {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: result, error } = await supabase.rpc('admin_get_analytics');
      if (!error && result) setData(result as unknown as Analytics);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Failed to load analytics.</p>
      </AdminLayout>
    );
  }

  const maxCount = Math.max(1, ...data.signups_by_day.map((d) => d.count));

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your app's growth and engagement</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={data.total_users} sub={`+${data.users_last_7d} this week`} gradient="bg-gradient-to-br from-purple-500 to-pink-500" />
          <StatCard icon={TrendingUp} label="New (30d)" value={data.users_last_30d} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" />
          <StatCard icon={Baby} label="Babies" value={data.total_babies} gradient="bg-gradient-to-br from-pink-500 to-rose-500" />
          <StatCard icon={Activity} label="Activities" value={data.total_activities} sub={`+${data.activities_last_7d} this week`} gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
          <StatCard icon={CreditCard} label="Premium Subs" value={data.subs_active} sub={`${data.subs_trialing} trialing`} gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
          <StatCard icon={CreditCard} label="Basic" value={data.subs_basic} gradient="bg-gradient-to-br from-slate-500 to-slate-700" />
          <StatCard icon={Mail} label="Newsletter" value={data.newsletter_active} sub={`${data.newsletter_total} total`} gradient="bg-gradient-to-br from-indigo-500 to-purple-500" />
          <StatCard icon={MessageSquare} label="Open Threads" value={data.open_threads} sub={`${data.unread_messages} unread`} gradient="bg-gradient-to-br from-fuchsia-500 to-pink-500" />
        </div>

        <Card className="p-5">
          <h2 className="font-semibold mb-4">Signups (last 30 days)</h2>
          {data.signups_by_day.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No signups in the last 30 days</p>
          ) : (
            <div className="flex items-end gap-1 h-48">
              {data.signups_by_day.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${new Date(d.date).toLocaleDateString()}: ${d.count}`}>
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t hover:opacity-80 transition-opacity"
                    style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;

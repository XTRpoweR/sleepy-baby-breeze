import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, Shield, Baby as BabyIcon, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  plan_label: string | null;
  baby_count: number;
  country: string | null;
  country_code: string | null;
  city: string | null;
  last_active_at: string | null;
}

const flagEmoji = (code: string | null) => {
  if (!code || code.length !== 2) return '';
  const cc = code.toUpperCase();
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
};

const planBadge = (plan: string | null) => {
  switch (plan) {
    case 'premium':
      return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">Premium</Badge>;
    case 'trial':
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Trial</Badge>;
    case 'basic':
      return <Badge variant="secondary">Basic</Badge>;
    case 'canceled':
      return <Badge variant="destructive">Canceled</Badge>;
    case 'free':
    default:
      return <Badge variant="outline" className="text-muted-foreground">Free</Badge>;
  }
};

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const load = async () => {
    const { data, error } = await supabase.rpc('admin_list_users');
    if (!error && data) setUsers(data as AdminUser[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const countries = useMemo(() => {
    const s = new Set<string>();
    users.forEach((u) => u.country && s.add(u.country));
    return Array.from(s).sort();
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      if (planFilter !== 'all' && (u.plan_label || 'free') !== planFilter) return false;
      if (countryFilter !== 'all' && u.country !== countryFilter) return false;
      if (!q) return true;
      return (
        (u.email || '').toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.country || '').toLowerCase().includes(q) ||
        (u.city || '').toLowerCase().includes(q)
      );
    });
  }, [users, search, planFilter, countryFilter]);

  const toggleAdmin = async (u: AdminUser) => {
    if (u.id === currentUser?.id && u.is_admin) {
      toast.error("You can't demote yourself");
      return;
    }
    const next = !u.is_admin;
    if (!confirm(`${next ? 'Grant' : 'Revoke'} admin access for ${u.email}?`)) return;
    const { error } = await supabase.rpc('admin_set_user_admin', { target_user_id: u.id, make_admin: next });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Admin ${next ? 'granted' : 'revoked'}`);
    load();
  };

  // Stats
  const stats = useMemo(() => {
    const byPlan: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    users.forEach((u) => {
      const p = u.plan_label || 'free';
      byPlan[p] = (byPlan[p] || 0) + 1;
      if (u.country) byCountry[u.country] = (byCountry[u.country] || 0) + 1;
    });
    const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { byPlan, topCountries };
  }, [users]);

  const renderLocation = (u: AdminUser) => {
    if (!u.country && !u.city) return <span className="text-xs text-muted-foreground">—</span>;
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        <span>{flagEmoji(u.country_code)}</span>
        <span className="text-muted-foreground">
          {[u.city, u.country].filter(Boolean).join(', ')}
        </span>
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} total users</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(['premium', 'trial', 'basic', 'free', 'canceled'] as const).map((p) => (
            <Card key={p} className="p-3">
              <div className="text-xs text-muted-foreground capitalize">{p}</div>
              <div className="text-xl font-bold">{stats.byPlan[p] || 0}</div>
            </Card>
          ))}
        </div>

        {stats.topCountries.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Top Countries</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.topCountries.map(([country, count]) => (
                <Badge key={country} variant="secondary" className="text-xs">
                  {country} · {count}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, country, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All plans</option>
            <option value="premium">Premium</option>
            <option value="trial">Trial</option>
            <option value="basic">Basic</option>
            <option value="free">Free</option>
            <option value="canceled">Canceled</option>
          </select>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All countries</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No users found</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground uppercase">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Babies</th>
                      <th className="px-4 py-3 font-medium">Last active</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium text-right">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {u.is_admin && <Shield className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />}
                            <div className="min-w-0">
                              <p className="font-medium truncate">{u.full_name || '—'}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{planBadge(u.plan_label)}</td>
                        <td className="px-4 py-3">{renderLocation(u)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <BabyIcon className="h-3.5 w-3.5" />{u.baby_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {u.last_active_at ? formatDistanceToNow(new Date(u.last_active_at), { addSuffix: true }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                        <td className="px-4 py-3 text-right">
                          <Switch
                            checked={u.is_admin}
                            onCheckedChange={() => toggleAdmin(u)}
                            disabled={u.id === currentUser?.id}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="md:hidden divide-y">
                {filtered.map((u) => (
                  <div key={u.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {u.is_admin && <Shield className="h-3.5 w-3.5 text-purple-600" />}
                          <p className="font-medium truncate">{u.full_name || '—'}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        <div className="mt-1">{renderLocation(u)}</div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {planBadge(u.plan_label)}
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <BabyIcon className="h-3 w-3" />{u.baby_count}
                          </span>
                          {u.last_active_at && (
                            <span className="text-[10px] text-muted-foreground">
                              · {formatDistanceToNow(new Date(u.last_active_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={u.is_admin}
                        onCheckedChange={() => toggleAdmin(u)}
                        disabled={u.id === currentUser?.id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;

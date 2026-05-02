import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Search, Shield, Baby as BabyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  baby_count: number;
}

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data, error } = await supabase.rpc('admin_list_users');
    if (!error && data) setUsers(data as AdminUser[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q)
    );
  }, [users, search]);

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

  const tierBadge = (tier: string | null, status: string | null) => {
    if (!tier || tier === 'basic') return <Badge variant="secondary">Basic</Badge>;
    if (status === 'trialing') return <Badge className="bg-amber-500 hover:bg-amber-600">Trial</Badge>;
    if (status === 'active') return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">Premium</Badge>;
    return <Badge variant="outline">{tier}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} total users</p>
        </div>

        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
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
                      <th className="px-4 py-3 font-medium">Babies</th>
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
                        <td className="px-4 py-3">{tierBadge(u.subscription_tier, u.subscription_status)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <BabyIcon className="h-3.5 w-3.5" />{u.baby_count}
                          </span>
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
                        <div className="flex items-center gap-2 mt-2">
                          {tierBadge(u.subscription_tier, u.subscription_status)}
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <BabyIcon className="h-3 w-3" />{u.baby_count}
                          </span>
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

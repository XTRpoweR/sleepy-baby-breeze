import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, BarChart3, Users, ArrowLeft } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Admin access required');
      navigate('/', { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const loadUnread = async () => {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('direction', 'inbound')
        .eq('status', 'unread');
      setUnreadCount(count || 0);
    };

    loadUnread();

    const channel = supabase
      .channel('admin-unread-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        () => loadUnread()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const navItems = [
    { to: '/admin/messages', icon: MessageSquare, label: 'Messages', enabled: true, badge: unreadCount },
    { to: '/admin/newsletter', icon: Mail, label: 'Newsletter', enabled: true, badge: 0 },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', enabled: true, badge: 0 },
    { to: '/admin/users', icon: Users, label: 'Users', enabled: true, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 md:min-h-screen bg-gradient-to-b from-purple-600 to-pink-600 text-white p-4 md:p-6 md:flex md:flex-col">
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/logo.png"
            alt="SleepyBabyy"
            className="w-14 h-14 object-contain flex-shrink-0 drop-shadow-lg"
            style={{ imageRendering: 'auto' }}
            loading="eager"
            decoding="async"
          />
          <div>
            <h2 className="font-bold text-lg leading-tight">Admin</h2>
            <p className="text-xs text-white/80">SleepyBabyy</p>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            item.enabled ? (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            ) : (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-50 cursor-not-allowed">
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
                <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Soon</span>
              </div>
            )
          ))}
        </nav>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 flex items-center gap-2 text-sm text-white/80 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  );
};

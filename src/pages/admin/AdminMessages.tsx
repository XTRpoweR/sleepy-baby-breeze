import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Inbox, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContactMessage {
  id: string;
  thread_id: string;
  direction: 'inbound' | 'outbound';
  sender_name: string | null;
  sender_email: string;
  subject: string | null;
  message_body: string;
  status: string;
  created_at: string;
}

interface Thread {
  thread_id: string;
  sender_name: string | null;
  sender_email: string;
  subject: string | null;
  last_message: string;
  last_at: string;
  status: string;
  unread: boolean;
}

const AdminMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied' | 'closed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      setMessages((data as ContactMessage[]) || []);
      setLoading(false);
    };
    load();

    const ch = supabase
      .channel('admin-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const threads: Thread[] = useMemo(() => {
    const map = new Map<string, ContactMessage[]>();
    for (const m of messages) {
      const arr = map.get(m.thread_id) || [];
      arr.push(m);
      map.set(m.thread_id, arr);
    }
    const out: Thread[] = [];
    for (const [thread_id, msgs] of map.entries()) {
      const sorted = [...msgs].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
      const inbound = sorted.find((m) => m.direction === 'inbound') || sorted[0];
      const last = sorted[sorted.length - 1];
      const unread = sorted.some((m) => m.direction === 'inbound' && m.status === 'unread');
      const closed = sorted.every((m) => m.status === 'closed');
      const replied = sorted.some((m) => m.direction === 'outbound');
      out.push({
        thread_id,
        sender_name: inbound.sender_name,
        sender_email: inbound.sender_email,
        subject: inbound.subject,
        last_message: last.message_body,
        last_at: last.created_at,
        status: closed ? 'closed' : unread ? 'unread' : replied ? 'replied' : 'read',
        unread,
      });
    }
    return out.sort((a, b) => +new Date(b.last_at) - +new Date(a.last_at));
  }, [messages]);

  const filtered = threads.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.sender_email.toLowerCase().includes(s) && !(t.subject || '').toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  });

  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-purple-600" />
              Customer Messages
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage support conversations</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-purple-600 hover:bg-purple-700">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="flex-1">
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="replied">Replied</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No messages found</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => {
              const initial = (t.sender_name || t.sender_email)[0]?.toUpperCase() || '?';
              return (
                <Card
                  key={t.thread_id}
                  onClick={() => navigate(`/admin/messages/${t.thread_id}`)}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{t.sender_name || t.sender_email}</span>
                        {t.unread && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        {t.status === 'replied' && <Badge variant="secondary" className="text-xs">Replied</Badge>}
                        {t.status === 'closed' && <Badge variant="outline" className="text-xs">Closed</Badge>}
                      </div>
                      <p className="text-sm font-medium text-foreground/80 truncate">{t.subject || '(no subject)'}</p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{t.last_message}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(t.last_at), { addSuffix: true })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;

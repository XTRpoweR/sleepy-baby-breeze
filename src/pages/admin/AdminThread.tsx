import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Send, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Msg {
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

const TEMPLATES = [
  { label: 'Thank you', text: 'Thank you for reaching out! We appreciate your message and will follow up shortly.' },
  { label: "We're working on it", text: "We're actively investigating this and will get back to you as soon as we have more information." },
  { label: 'Issue resolved', text: "Good news — we've resolved the issue you reported. Please let us know if you experience anything further." },
  { label: 'Need more info', text: 'Could you share a bit more detail (steps to reproduce, screenshots, or device info) so we can help you faster?' },
];

const AdminThread = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!threadId) return;
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    setMessages((data as Msg[]) || []);
    setLoading(false);

    // Mark inbound unread as read
    const unreadIds = (data as Msg[] | null)?.filter((m) => m.direction === 'inbound' && m.status === 'unread').map((m) => m.id) || [];
    if (unreadIds.length) {
      await supabase.from('contact_messages').update({ status: 'read' }).in('id', unreadIds);
    }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`thread-${threadId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages', filter: `thread_id=eq.${threadId}` }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const inbound = messages.find((m) => m.direction === 'inbound');
  const sender = inbound;

  const handleSend = async () => {
    if (!reply.trim() || !sender || !threadId) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-support-reply', {
        body: {
          thread_id: threadId,
          recipient_email: sender.sender_email,
          recipient_name: sender.sender_name || '',
          subject: sender.subject || '(no subject)',
          reply_message: reply,
          original_message_id: sender.id,
        },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      toast.success('Reply sent');
      setReply('');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!threadId) return;
    await supabase.from('contact_messages').update({ status: 'closed' }).eq('thread_id', threadId);
    toast.success('Thread closed');
    load();
  };

  const initial = (sender?.sender_name || sender?.sender_email || '?')[0]?.toUpperCase();

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/messages')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{sender?.sender_name || sender?.sender_email}</p>
              <p className="text-xs text-muted-foreground truncate">{sender?.sender_email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleClose}>
            <X className="h-4 w-4 mr-1" /> Close
          </Button>
        </div>

        {/* Messages */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      m.direction === 'outbound'
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-sm'
                        : 'bg-white text-foreground rounded-bl-sm border'
                    }`}
                  >
                    {m.direction === 'inbound' && m.subject && (
                      <p className="text-xs font-semibold opacity-70 mb-1">{m.subject}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{m.message_body}</p>
                    <p className={`text-[10px] mt-1 ${m.direction === 'outbound' ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {format(new Date(m.created_at), 'MMM d, h:mm a')}
                      {m.direction === 'outbound' && ' • Sent'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply box */}
          <div className="border-t p-3 bg-background space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  Quick templates <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover">
                {TEMPLATES.map((t) => (
                  <DropdownMenuItem key={t.label} onClick={() => setReply(t.text)}>
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Textarea
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSend}
                disabled={!reply.trim() || sending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminThread;

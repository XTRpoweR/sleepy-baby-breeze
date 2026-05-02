import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, Download, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Sub {
  id: string;
  email: string;
  status: string;
  language: string;
  subscribed_at: string;
}

const AdminNewsletter = () => {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [tip, setTip] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.rpc('admin_list_newsletter_subscribers');
    if (!error && data) setSubs(data as Sub[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const activeCount = subs.filter((s) => s.status === 'active').length;

  const handleSend = async (test: boolean) => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and body are required');
      return;
    }
    if (test && !testEmail.trim()) {
      toast.error('Enter a test email');
      return;
    }
    if (!test && !confirm(`Send to ${activeCount} subscribers?`)) return;

    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('Please sign in again before sending.');
      }

      const { data, error } = await supabase.functions.invoke('send-newsletter-broadcast', {
        body: test
          ? { subject, subtitle, body, tip, test_email: testEmail, cta_text: ctaText || undefined, cta_url: ctaUrl || undefined }
          : { subject, subtitle, body, tip, cta_text: ctaText || undefined, cta_url: ctaUrl || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.detail || (data as any)?.error || error?.message);
      if (test) {
        toast.success(`Test sent to ${testEmail}`);
      } else {
        toast.success(`Sent to ${(data as any).sent} of ${(data as any).total} subscribers`);
        setSubject('');
        setSubtitle('');
        setBody('');
        setTip('');
        setCtaText('');
        setCtaUrl('');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const exportCsv = () => {
    const csv = ['email,status,language,subscribed_at', ...subs.map((s) => `${s.email},${s.status},${s.language},${s.subscribed_at}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Newsletter</h1>
            <p className="text-sm text-muted-foreground mt-1">{activeCount} active · {subs.length} total subscribers</p>
          </div>
          <Button variant="outline" onClick={exportCsv} disabled={subs.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>

        {/* Composer */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold">Compose broadcast</h2>
          </div>
          <div>
            <Label htmlFor="subject">Title</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A new feature you'll love..." className="mt-1" />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle (optional)</Label>
            <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="This week's update" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="body">Body (Markdown supported: **bold**, *italic*, [link](url), - lists)</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="mt-1" placeholder="We just shipped **a new feature**...&#10;&#10;Check it out: [link](https://sleepybabyy.com)" />
          </div>
          <div>
            <Label htmlFor="tip">Quick Tip / Quote (optional)</Label>
            <Textarea id="tip" value={tip} onChange={(e) => setTip(e.target.value)} rows={2} className="mt-1" placeholder="A consistent bedtime routine helps babies sleep better." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cta_text">CTA button text (optional)</Label>
              <Input id="cta_text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Read more" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cta_url">CTA button URL (optional)</Label>
              <Input id="cta_url" type="url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://sleepybabyy.com/..." className="mt-1" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-3 pt-2 border-t">
            <div className="flex-1">
              <Label htmlFor="test">Send test to</Label>
              <Input id="test" type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
            </div>
            <Button variant="outline" onClick={() => handleSend(true)} disabled={sending}>
              Test send
            </Button>
            <Button
              onClick={() => handleSend(false)}
              disabled={sending || activeCount === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : `Send to ${activeCount}`}
            </Button>
          </div>
        </Card>

        {/* Subscribers list */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Subscribers</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : subs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No subscribers yet</div>
          ) : (
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {subs.map((s) => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${s.status === 'active' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm">{s.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(s.subscribed_at), 'MMM d, yyyy')} · {s.language.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="flex-shrink-0">
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNewsletter;

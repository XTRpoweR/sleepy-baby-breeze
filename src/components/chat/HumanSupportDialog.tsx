import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, LifeBuoy, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage } from '@/hooks/useChatAssistant';

interface HumanSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recentMessages: ChatMessage[];
}

export const HumanSupportDialog = ({ open, onOpenChange, recentMessages }: HumanSupportDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || message.trim().length < 10) {
      toast({ title: t('chat.support.validationError'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const transcript = recentMessages
        .slice(-10)
        .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
        .join('\n\n');

      const fullMessage = `${message.trim()}\n\n---\n${t('chat.support.transcriptHeader')}:\n${transcript || t('chat.support.noTranscript')}`;

      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          subject: `[Chat Support] ${subject.trim()}`,
          message: fullMessage,
          category: 'chat_escalation',
        },
      });

      if (error) throw error;

      setSuccess(true);
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 2500);
    } catch (e) {
      console.error('Support submission error:', e);
      toast({ title: t('chat.support.errorSend'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" />
            {t('chat.support.title')}
          </DialogTitle>
          <DialogDescription>{t('chat.support.description')}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <p className="font-medium">{t('chat.support.successTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('chat.support.successDescription')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="support-email">{t('chat.support.emailLabel')}</Label>
                <Input id="support-email" value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-subject">{t('chat.support.subjectLabel')}</Label>
                <Input
                  id="support-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('chat.support.subjectPlaceholder')}
                  maxLength={150}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-message">{t('chat.support.messageLabel')}</Label>
                <Textarea
                  id="support-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('chat.support.messagePlaceholder')}
                  rows={5}
                  maxLength={2000}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">{message.length}/2000</p>
              </div>
              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                {t('chat.support.responseTime')}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                {t('chat.support.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !subject.trim() || message.trim().length < 10}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('chat.support.sending')}
                  </>
                ) : (
                  t('chat.support.submit')
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, BellOff, BellRing } from 'lucide-react';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsletterManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewsletterManagerDialog = ({ open, onOpenChange }: NewsletterManagerDialogProps) => {
  const { user } = useAuth();
  const { subscribe, isSubscribing } = useNewsletterSubscription();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  useEffect(() => {
    if (open && user?.email) setEmail(user.email);
  }, [open, user?.email]);

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    const ok = await subscribe(email.trim());
    if (ok) onOpenChange(false);
  };

  const handleUnsubscribe = async () => {
    if (!email.trim()) return;
    setIsUnsubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-unsubscribe', {
        body: { email: email.trim(), method: 'dashboard' },
      });
      if (error) throw error;
      if (data?.success) {
        toast({
          title: 'Unsubscribed 👋',
          description: data.alreadyUnsubscribed
            ? "You're already unsubscribed from our newsletter."
            : "You've been unsubscribed from our newsletter.",
        });
        onOpenChange(false);
      } else {
        throw new Error(data?.error || 'Failed to unsubscribe');
      }
    } catch (err: any) {
      toast({
        title: 'Could not unsubscribe',
        description: err?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center">Sleep tips newsletter</DialogTitle>
          <DialogDescription className="text-center">
            Get science-backed sleep tips and gentle reminders, straight to your inbox.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubscribing || isUnsubscribing}
          />

          <Button
            onClick={handleSubscribe}
            disabled={!email.trim() || isSubscribing || isUnsubscribing}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            {isSubscribing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BellRing className="w-4 h-4 mr-2" />
            )}
            Subscribe
          </Button>

          <Button
            onClick={handleUnsubscribe}
            disabled={!email.trim() || isSubscribing || isUnsubscribing}
            variant="outline"
            className="w-full"
          >
            {isUnsubscribing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BellOff className="w-4 h-4 mr-2" />
            )}
            Unsubscribe
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-2">
            We respect your inbox. You can unsubscribe at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

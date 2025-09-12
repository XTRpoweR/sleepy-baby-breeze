
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Mail, Info } from 'lucide-react';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForgotPasswordDialog = ({ open, onOpenChange }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Detect iOS devices specifically
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Auto-focus email input when dialog opens (but not on iOS due to keyboard issues)
  useEffect(() => {
    if (open && !sent && !isIOS) {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, sent, isIOS]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      console.log('Sending password reset for:', email);
      
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email,
          redirectTo: `${window.location.origin}/reset-password`
        }
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      setSent(true);
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions. The email should arrive within a few seconds.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle specific error cases
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.message?.includes('User not found')) {
        errorMessage = "No account found with this email address.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Please confirm your email address first.";
      } else if (error.message?.includes('too many requests')) {
        errorMessage = "Too many requests. Please wait a moment before trying again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSent(false);
    onOpenChange(false);
  };

  const FormContent = () => (
    !sent ? (
      <form onSubmit={handleSubmit} className="space-y-4" data-vaul-no-drag>
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email Address</Label>
          <Input
            ref={emailInputRef}
            id="reset-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            enterKeyHint="send"
            className="text-base"
          />
        </div>
        <div className="rounded-lg bg-muted/50 p-3 border">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              We'll email you a secure link that expires in 1 hour. Check your spam folder if you don't see it.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading || !email}
            variant="info"
            className="w-full sm:w-auto"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </div>
      </form>
    ) : (
      <div className="space-y-4">
        <div className="rounded-lg bg-success/10 p-4 border border-success/20">
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-success mr-2" />
            <p className="text-sm text-success">
              Password reset instructions sent to <strong>{email}</strong>
            </p>
          </div>
          <p className="text-xs text-success/80 mt-2">
            The email should arrive within a few seconds. Check your spam folder if you don't see it.
          </p>
        </div>
        <Button onClick={handleClose} className="w-full">
          Close
        </Button>
      </div>
    )
  );

  // Use Dialog for iOS to avoid keyboard issues, Drawer for other mobile devices
  if (isMobile && !isIOS) {
    return (
      <Drawer open={open} onOpenChange={(next) => { if (!next) handleClose(); }} shouldScaleBackground={false}>
        <DrawerContent className="px-4 pb-[env(safe-area-inset-bottom)] h-[70dvh] max-h-[85dvh] flex flex-col overscroll-contain touch-pan-y">
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle className="flex items-center justify-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-info" />
              Reset Password
            </DrawerTitle>
            <DrawerDescription className="text-sm">
              {sent 
                ? "We've sent you a password reset link!"
                : "Enter your email address and we'll send you a link to reset your password."
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-2 flex-1 min-h-0 overflow-y-auto" data-vaul-no-drag>
            <FormContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-info" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            {sent 
              ? "We've sent you a password reset link!"
              : "Enter your email address and we'll send you a link to reset your password."
            }
          </DialogDescription>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};

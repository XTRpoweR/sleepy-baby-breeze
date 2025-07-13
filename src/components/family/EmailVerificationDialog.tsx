
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Shield, Clock, AlertCircle } from 'lucide-react';

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  invitedEmail: string;
  invitationToken: string;
}

export const EmailVerificationDialog = ({
  isOpen,
  onClose,
  onVerified,
  invitedEmail,
  invitationToken
}: EmailVerificationDialogProps) => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationCode = async () => {
    setSendingCode(true);
    setError(null);
    
    try {
      console.log('Sending verification code to:', invitedEmail);
      
      const { data, error } = await supabase.functions.invoke('send-email-verification', {
        body: {
          email: invitedEmail,
          invitationToken: invitationToken
        }
      });

      console.log('Email verification response:', { data, error });

      if (error) {
        console.error('Error sending verification code:', error);
        setError('Failed to send verification code. Please check your email address and try again.');
        toast({
          title: "Error",
          description: "Failed to send verification code. Please try again.",
          variant: "destructive",
        });
      } else {
        setCodeSent(true);
        setError(null);
        toast({
          title: "Verification code sent",
          description: `A 6-digit code has been sent to ${invitedEmail}. Please check your inbox and spam folder.`,
        });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setError('Network error occurred. Please check your connection and try again.');
      toast({
        title: "Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Verify the code by checking against the stored code in family_invitations
      const { data, error } = await supabase
        .from('family_invitations')
        .select('verification_code, verification_expires_at')
        .eq('invitation_token', invitationToken)
        .maybeSingle();

      if (error) {
        console.error('Error verifying code:', error);
        setError('Failed to verify code. Please try again.');
        return;
      }

      if (!data || !data.verification_code) {
        setError('No verification code found. Please request a new code.');
        return;
      }

      // Check if code has expired
      if (new Date() > new Date(data.verification_expires_at)) {
        setError('The verification code has expired. Please request a new one.');
        return;
      }

      // Check if code matches
      if (data.verification_code !== verificationCode) {
        setError('The verification code is incorrect. Please try again.');
        return;
      }

      // Code is valid - clear it from database and proceed
      await supabase
        .from('family_invitations')
        .update({
          verification_code: null,
          verification_expires_at: null,
          email_verified: true
        })
        .eq('invitation_token', invitationToken);

      toast({
        title: "Email verified!",
        description: "You can now accept the family invitation.",
      });

      onVerified();
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Verify Email Access</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              To accept this invitation, please verify that you have access to <strong>{invitedEmail}</strong>.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!codeSent ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                We'll send a 6-digit verification code to the invited email address. Please check your inbox and spam folder.
              </p>
              <Button 
                onClick={sendVerificationCode} 
                disabled={sendingCode}
                className="w-full"
              >
                {sendingCode ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send verification code
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter the 6-digit code sent to {invitedEmail}
                </label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={sendVerificationCode}
                  disabled={sendingCode}
                  className="flex-1"
                >
                  {sendingCode ? 'Sending...' : 'Resend code'}
                </Button>
                <Button
                  onClick={verifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                The code expires in 10 minutes. Check your spam folder if you don't see the email.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

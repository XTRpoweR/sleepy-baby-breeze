
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Check, Loader2 } from 'lucide-react';

const CompleteSetup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast({
          title: "Invalid Setup Link",
          description: "Please use the link from your payment confirmation email.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        // Here you would verify the Stripe session
        // For now, we'll simulate verification
        setVerifyingPayment(false);
        setPaymentVerified(true);
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerifyingPayment(false);
        toast({
          title: "Payment Verification Failed",
          description: "Please contact support if you've been charged.",
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [sessionId, navigate, toast]);

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Account Creation Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Account Created Successfully!",
          description: "Welcome to SleepyBabyy Premium! Your subscription is now active.",
        });
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your subscription...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-red-600">Payment Verification Failed</h2>
              <p className="text-gray-600 mb-4">We couldn't verify your payment. Please contact support if you've been charged.</p>
              <Button onClick={() => navigate('/')} variant="outline">
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success indicator */}
        <div className="text-center mb-6">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h1>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="h-5 w-5 text-orange-500" />
            <span className="text-orange-600 font-semibold">Premium Subscription Active</span>
          </div>
          <p className="text-gray-600">Complete your account setup to start tracking your baby's sleep patterns.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Complete Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompleteSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter the email you used for payment"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Complete Setup & Start Tracking'
                )}
              </Button>

              <div className="text-center mt-4 space-y-2 text-sm text-gray-600">
                <p>Already have an account? You can sign in instead.</p>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate('/auth')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Sign In to Existing Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Premium features reminder */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
            <Crown className="h-4 w-4 mr-2" />
            Your Premium Features Include:
          </h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>✓ Unlimited baby profiles</li>
            <li>✓ Advanced sleep analytics</li>
            <li>✓ Family sharing & collaboration</li>
            <li>✓ AI-powered sleep optimization</li>
            <li>✓ Data export & backup</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompleteSetup;

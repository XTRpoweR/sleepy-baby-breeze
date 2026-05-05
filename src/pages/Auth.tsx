
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { Mail, Lock, User, ArrowLeft, Moon, Loader2, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { fbqTrack } from '@/utils/metaPixel';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get('redirect');

  // Meta Pixel: visiting the auth page is a Lead intent
  useEffect(() => {
    fbqTrack('Lead', { content_category: 'auth', content_name: 'auth_page_view' });
  }, []);

  useEffect(() => {
    if (user && session) {
      if (redirectTo) {
        const redirectUrl = new URL(redirectTo, window.location.origin);
        if (redirectUrl.searchParams.get('success') === 'true') {
          navigate('/dashboard');
        } else {
          navigate(redirectTo);
        }
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, session, navigate, redirectTo]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Welcome back", description: "Successfully signed in!" });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: redirectTo
              ? `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectTo)}`
              : `${window.location.origin}/auth?redirect=%2Fdashboard`,
          },
        });
        if (error) {
          toast({
            title: "Registration Error",
            description: error.message === 'Invalid API key'
              ? "Configuration error. Please contact support."
              : error.message,
            variant: "destructive",
          });
        } else {
          // Meta Pixel: successful registration
          const nameParts = fullName.trim().split(/\s+/);
          fbqTrack('CompleteRegistration', {
            content_name: 'sleepybabyy_signup',
            status: data.user && !data.session ? 'pending_verification' : 'active',
          }, {
            email: email.trim(),
            external_id: data.user?.id,
            first_name: nameParts[0],
            last_name: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
          });
          if (data.user && !data.session) {
            toast({ title: "Account created", description: "Please check your email to verify your account." });
          } else {
            toast({ title: "Welcome!", description: "Account created and signed in!" });
            navigate('/onboarding', { replace: true });
          }
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
            ? `${window.location.origin}${redirectTo}`
            : `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (user && session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-amber-50 via-purple-50 to-pink-50">
      {/* Animated warm blobs */}
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-blob auth-blob-3" aria-hidden="true" />

      <div className="relative w-full max-w-md z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-full px-3 auth-fadeup"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>

        {/* Welcome header */}
        <div className="flex flex-col items-center text-center mb-6 auth-fadeup" style={{ animationDelay: '0.05s' }}>
          <div className="auth-logo-badge mb-4">
            <Moon className="h-8 w-8 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            {isLogin ? 'Welcome back' : 'Start your journey'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xs">
            {isLogin
              ? 'Track your baby’s sleep with calm and confidence.'
              : 'Join thousands of parents enjoying restful nights.'}
          </p>
        </div>

        {/* Glass card */}
        <div className="auth-card p-6 sm:p-8 auth-fadeup" style={{ animationDelay: '0.1s' }}>
          {redirectTo && (
            <p className="text-sm text-center text-slate-600 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Sign in to continue with your invitation
            </p>
          )}

          <form key={isLogin ? 'login' : 'signup'} onSubmit={handleAuth} className="space-y-4 auth-form-enter">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-slate-700 text-sm font-medium">Full Name</Label>
                <div className="auth-field relative">
                  <User className="auth-field-icon" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="auth-input"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 text-sm font-medium">Email</Label>
              <div className="auth-field relative">
                <Mail className="auth-field-icon" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">Password</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="auth-field relative">
                <Lock className="auth-field-icon" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-cta w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center">
            <div className="auth-divider flex-1" />
            <span className="px-3 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              Or continue with
            </span>
            <div className="auth-divider flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="auth-google w-full flex items-center justify-center gap-2 text-slate-700 disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-600 hover:text-purple-700 transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-purple-600 font-semibold">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-purple-600 font-semibold">Sign in</span></>
              )}
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 auth-fadeup" style={{ animationDelay: '0.2s' }}>
          <span className="auth-trust-badge">
            <ShieldCheck className="h-3.5 w-3.5" />
            SSL Encrypted
          </span>
          <span className="auth-trust-badge">
            <Heart className="h-3.5 w-3.5" style={{ color: 'hsl(330, 75%, 60%)' }} />
            Built by parents, for parents
          </span>
          <span className="auth-trust-badge">
            <Sparkles className="h-3.5 w-3.5" style={{ color: 'hsl(38, 92%, 50%)' }} />
            No commitment
          </span>
        </div>
      </div>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  );
};

export default Auth;

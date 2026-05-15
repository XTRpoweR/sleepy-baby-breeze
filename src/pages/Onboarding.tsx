import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Baby, Sparkles, Users, ArrowRight, Copy, Heart } from 'lucide-react';

type StepKey = 'welcome' | 'baby' | 'tour' | 'activity' | 'family' | 'success';
const STEPS: StepKey[] = ['welcome', 'baby', 'tour', 'activity', 'family', 'success'];

const trackEvent = async (name: string, metadata: Record<string, unknown> = {}) => {
  try {
    await supabase.from('marketing_events').insert([{
      event_name: name,
      page_url: typeof window !== 'undefined' ? window.location.href : null,
      raw_payload: metadata as never,
    }] as never);
  } catch (e) {
    console.warn('marketing event skipped', e);
  }
};

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stepIndex, setStepIndex] = useState(0);
  const [babyId, setBabyId] = useState<string | null>(null);

  // Baby form
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [savingBaby, setSavingBaby] = useState(false);

  // Family invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [manualInviteLink, setManualInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    // Mark started
    supabase
      .from('profiles')
      .update({ onboarding_started_at: new Date().toISOString() })
      .eq('id', user.id)
      .then(() => trackEvent('OnboardingStarted'));
  }, [user, authLoading, navigate]);

  const goNext = () => {
    const next = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(next);
    trackEvent('OnboardingStepCompleted', { step: STEPS[stepIndex], next: STEPS[next] });
    if (user) {
      supabase.from('profiles').update({ onboarding_step: next }).eq('id', user.id);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    trackEvent('OnboardingCompleted');
    navigate('/dashboard', { replace: true });
  };

  const skipOnboarding = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    trackEvent('OnboardingSkipped', { last_step: STEPS[stepIndex] });
    navigate('/dashboard', { replace: true });
  };

  const saveBaby = async () => {
    if (!user || !name.trim() || !birthDate) {
      toast({ title: 'Please fill in name and birth date', variant: 'destructive' });
      return;
    }
    setSavingBaby(true);
    try {
      // Deactivate other profiles
      await supabase.from('baby_profiles').update({ is_active: false }).eq('user_id', user.id);
      const { data, error } = await supabase
        .from('baby_profiles')
        .insert({
          user_id: user.id,
          name: name.trim(),
          birth_date: birthDate,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      setBabyId(data.id);
      try {
        localStorage.setItem('babytrack_active_profile_id', data.id);
      } catch {}
      goNext();
    } catch (e) {
      console.error(e);
      toast({ title: 'Could not save baby profile', variant: 'destructive' });
    } finally {
      setSavingBaby(false);
    }
  };

  const logFirstActivity = async (type: 'sleep' | 'feeding' | 'awake' | 'diaper') => {
    if (!user || !babyId) {
      goNext();
      return;
    }
    try {
      const activityType = type === 'awake' ? 'custom' : type;
      const metadata: Record<string, unknown> = type === 'awake' ? { custom_type: 'awake' } : {};
      const start = new Date().toISOString();
      const insertPayload: Record<string, unknown> = {
        baby_id: babyId,
        activity_type: activityType,
        start_time: start,
        metadata,
      };
      if (type === 'feeding' || type === 'diaper' || type === 'awake') {
        insertPayload.end_time = start;
        insertPayload.duration_minutes = 0;
      }
      const { error } = await supabase.from('baby_activities').insert(insertPayload as never);
      if (error) throw error;
      toast({ title: `Great! Your first ${type} is logged ✨` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Saved, but logging failed — you can try again later', variant: 'destructive' });
    } finally {
      goNext();
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !babyId) {
      goNext();
      return;
    }
    setSendingInvite(true);
    try {
      const normalizedEmail = inviteEmail.trim().toLowerCase();
      const { data: invitation, error: invitationError } = await supabase.from('family_invitations').insert({
        baby_id: babyId,
        email: normalizedEmail,
        role: 'caregiver',
        invited_by: user!.id,
      } as never).select('id, invitation_token').single();

      if (invitationError) throw invitationError;

      const invitationLink = `${window.location.origin}/invitation?token=${invitation.invitation_token}`;
      setManualInviteLink(invitationLink);

      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          invitationId: invitation.id,
          email: normalizedEmail,
          babyName: name.trim() || 'Baby',
          inviterName: user?.user_metadata?.full_name || user?.email || 'Someone',
          role: 'caregiver',
          invitationToken: invitation.invitation_token,
        },
      });

      if (emailError) {
        console.error('Invitation email failed:', emailError);
        toast({
          title: 'Invitation link created',
          description: 'Email could not be delivered. Please copy and share the invitation link below.',
          variant: 'destructive',
        });
        return;
      }

      toast({ title: 'Invitation sent!', description: `We sent the invitation to ${normalizedEmail}.` });
      goNext();
    } catch (e) {
      console.error(e);
      toast({ title: 'Could not create invitation — you can do this later', variant: 'destructive' });
    } finally {
      setSendingInvite(false);
    }
  };

  const copyManualInviteLink = async () => {
    if (!manualInviteLink) return;
    await navigator.clipboard.writeText(manualInviteLink);
    toast({ title: 'Invitation link copied' });
  };

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/40 to-indigo-50 flex flex-col overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-pink-300/30 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 -right-32 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-purple-300/30 blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-indigo-300/25 blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      {/* Floating decorative emojis (hidden on small screens to save space) */}
      <div aria-hidden="true" className="pointer-events-none hidden sm:block">
        <span className="absolute top-16 left-8 text-3xl animate-bounce" style={{ animationDuration: '3s' }}>🌙</span>
        <span className="absolute top-24 right-12 text-2xl animate-pulse" style={{ animationDuration: '2.5s' }}>✨</span>
        <span className="absolute top-1/2 left-6 text-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>⭐</span>
        <span className="absolute bottom-32 right-10 text-3xl animate-pulse" style={{ animationDuration: '3.5s' }}>☁️</span>
        <span className="absolute bottom-20 left-12 text-2xl animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1s' }}>💫</span>
      </div>

      {/* Header / progress */}
      <div className="relative w-full max-w-xl mx-auto px-4 pt-6 sm:pt-10">
        {step !== 'welcome' && step !== 'success' && (
          <>
            <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
              <span className="font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Step {stepIndex} of {STEPS.length - 2}
              </span>
              <button
                onClick={skipOnboarding}
                className="text-gray-500 hover:text-gray-900 transition-colors underline-offset-4 hover:underline touch-target"
              >
                Skip setup
              </button>
            </div>
            <div className="h-2 w-full rounded-full bg-white/60 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 py-8">
        <Card
          key={step}
          className="relative w-full max-w-xl p-6 sm:p-10 shadow-2xl shadow-purple-500/10 border border-white/60 bg-white/85 backdrop-blur-md rounded-3xl overflow-hidden animate-fade-in-up"
        >
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

          {step === 'welcome' && (
            <div className="text-center space-y-6 pt-2">
              <div className="relative inline-block">
                <div className="text-6xl sm:text-7xl animate-bounce" style={{ animationDuration: '2.5s' }}>🌙</div>
                <span className="absolute -top-2 -right-4 text-2xl animate-pulse">✨</span>
                <span className="absolute -bottom-1 -left-3 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight">
                  Welcome to{' '}
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    SleepyBabyy!
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Let's set up better sleep for you and your baby. 🍼
                  <br />
                  Takes less than 2 minutes ✨
                </p>
              </div>
              <Button
                size="lg"
                onClick={goNext}
                className="w-full sm:w-auto bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.03] rounded-full px-8 py-6 text-base font-semibold"
              >
                Let's Start <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="pt-4">
                <p className="text-xs sm:text-sm text-gray-500 mb-3 font-medium">You'll be able to:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <FeatureBadge emoji="😴" label="Track sleep & feeds" gradient="from-pink-100 to-pink-50" />
                  <FeatureBadge emoji="📊" label="See sleep patterns" gradient="from-purple-100 to-purple-50" />
                  <FeatureBadge emoji="👨‍👩‍👧" label="Share with family" gradient="from-indigo-100 to-indigo-50" />
                </div>
              </div>
            </div>
          )}

          {step === 'baby' && (
            <div className="space-y-6 pt-2">
              <div className="text-center space-y-2">
                <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 items-center justify-center shadow-lg shadow-purple-500/30 animate-bounce" style={{ animationDuration: '2.5s' }}>
                  <Baby className="h-9 w-9 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Tell us about your{' '}
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    baby
                  </span>{' '}
                  👶
                </h2>
                <p className="text-sm text-gray-600">A few details so we can personalize the experience</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="baby-name" className="text-sm font-medium text-gray-700">Baby's name 💝</Label>
                  <Input
                    id="baby-name"
                    placeholder="e.g. Emma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    className="rounded-xl border-purple-200/70 bg-white/70 focus-visible:ring-2 focus-visible:ring-purple-300 focus:border-purple-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="birth-date" className="text-sm font-medium text-gray-700">Birth date 🎂</Label>
                  <Input
                    id="birth-date"
                    type="date"
                    value={birthDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="rounded-xl border-purple-200/70 bg-white/70 focus-visible:ring-2 focus-visible:ring-purple-300 focus:border-purple-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Gender (optional)</Label>
                  <div className="flex gap-2">
                    <GenderButton emoji="👧" label="Girl" active={gender === 'girl'} onClick={() => setGender('girl')} activeGradient="from-pink-400 to-pink-500" />
                    <GenderButton emoji="👦" label="Boy" active={gender === 'boy'} onClick={() => setGender('boy')} activeGradient="from-indigo-400 to-indigo-500" />
                    <GenderButton emoji="—" label="Skip" active={gender === null} onClick={() => setGender(null)} activeGradient="from-gray-400 to-gray-500" />
                  </div>
                </div>
              </div>
              <Button
                onClick={saveBaby}
                disabled={savingBaby}
                size="lg"
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-full py-6 text-base font-semibold disabled:opacity-60 disabled:hover:scale-100"
              >
                {savingBaby ? 'Saving... 💫' : 'Continue'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 'tour' && (
            <div className="space-y-6 text-center pt-2">
              <div className="relative inline-block">
                <div className="text-6xl animate-bounce" style={{ animationDuration: '2.5s' }}>🎬</div>
                <span className="absolute -top-2 -right-4 text-xl animate-pulse">✨</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    Quick tour
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Tracking is as easy as 1-2-3 🌟</p>
              </div>
              <div className="space-y-3 text-left">
                <TourStep number="1" emoji="😴" title="Tap the moon" desc="when baby falls asleep" gradient="from-pink-50 to-pink-100/50" iconBg="from-pink-400 to-pink-500" />
                <TourStep number="2" emoji="⏰" title="Tap again" desc="when they wake up" gradient="from-purple-50 to-purple-100/50" iconBg="from-purple-400 to-purple-500" />
                <TourStep number="3" emoji="📊" title="We do the math" desc="and reveal sleep patterns automatically" gradient="from-indigo-50 to-indigo-100/50" iconBg="from-indigo-400 to-indigo-500" />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={goNext}
                  size="lg"
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-full py-6 text-base font-semibold"
                >
                  Got it! <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button onClick={goNext} variant="ghost" className="text-gray-500 hover:text-gray-900 hover:bg-purple-50">
                  Skip tour
                </Button>
              </div>
            </div>
          )}

          {step === 'activity' && (
            <div className="space-y-6 pt-2">
              <div className="text-center space-y-2">
                <div className="relative inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="h-9 w-9 text-white animate-pulse" />
                  <span className="absolute -top-2 -right-2 text-lg animate-bounce">✨</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Log your{' '}
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">first activity!</span>{' '}
                  🎉
                </h2>
                <p className="text-sm text-gray-600">
                  Pick what's happening with {name.trim() || 'your baby'} right now:
                </p>
              </div>
              <div className="grid gap-3">
                <ActivityButton emoji="😴" label="Baby is sleeping" hint="Tracks sleep start time" gradient="from-pink-50 to-pink-100/50" iconBg="from-pink-400 to-pink-500" onClick={() => logFirstActivity('sleep')} />
                <ActivityButton emoji="🍼" label="Just fed baby" hint="Quick feeding log" gradient="from-purple-50 to-purple-100/50" iconBg="from-purple-400 to-purple-500" onClick={() => logFirstActivity('feeding')} />
                <ActivityButton emoji="😊" label="Baby is awake" hint="Marks wake time" gradient="from-indigo-50 to-indigo-100/50" iconBg="from-indigo-400 to-indigo-500" onClick={() => logFirstActivity('awake')} />
                <ActivityButton emoji="💩" label="Diaper change" hint="Diaper change log" gradient="from-pink-50 to-purple-50" iconBg="from-pink-400 to-purple-500" onClick={() => logFirstActivity('diaper')} />
              </div>
              <Button onClick={goNext} variant="ghost" className="w-full text-gray-500 hover:text-gray-900 hover:bg-purple-50">
                I'll do this later
              </Button>
            </div>
          )}

          {step === 'family' && (
            <div className="space-y-6 pt-2">
              <div className="text-center space-y-2">
                <div className="relative inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 items-center justify-center shadow-lg shadow-purple-500/30">
                  <Users className="h-9 w-9 text-white" />
                  <Heart className="absolute -top-2 -right-2 h-5 w-5 text-pink-500 fill-pink-500 animate-pulse" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Share with{' '}
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">family</span>{' '}
                  💕
                </h2>
                <p className="text-sm text-gray-600">
                  Track together with your partner, grandparents, or caregivers
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border border-purple-100/60 p-4 space-y-3">
                <div className="flex items-center justify-center gap-3 text-2xl">
                  <span className="animate-bounce" style={{ animationDuration: '2s' }}>👨</span>
                  <span className="text-pink-400">→</span>
                  <span className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s' }}>👩</span>
                  <span className="text-pink-400">→</span>
                  <span className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.6s' }}>👴</span>
                </div>
                <p className="text-xs text-center text-gray-600">Everyone stays in sync, in real-time</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-email" className="text-sm font-medium text-gray-700">Email (optional) 📧</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="partner@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="rounded-xl border-purple-200/70 bg-white/70 focus-visible:ring-2 focus-visible:ring-purple-300 focus:border-purple-400 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={sendInvite}
                  disabled={sendingInvite || !inviteEmail.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-full py-6 text-base font-semibold disabled:opacity-60 disabled:hover:scale-100"
                >
                  {sendingInvite ? 'Sending... 💌' : 'Send Invite 💌'}
                </Button>
                <Button onClick={goNext} variant="ghost" className="text-gray-500 hover:text-gray-900 hover:bg-purple-50">
                  Maybe later
                </Button>
              </div>
              {manualInviteLink && (
                <div className="space-y-2 rounded-xl border border-purple-100 bg-gradient-to-br from-pink-50 to-purple-50 p-4">
                  <p className="text-sm font-medium text-gray-700">Email delivery failed. Share this link instead:</p>
                  <div className="flex gap-2">
                    <Input value={manualInviteLink} readOnly className="text-xs rounded-lg bg-white/80" />
                    <Button type="button" variant="outline" size="icon" onClick={copyManualInviteLink} className="rounded-lg border-purple-200">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={goNext} className="w-full rounded-full" variant="secondary">
                    Continue
                  </Button>
                </div>
              )}
              <p className="text-xs text-center text-gray-500">
                ✓ You're all set either way!
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6 pt-2">
              <div className="relative inline-block">
                <div className="text-7xl sm:text-8xl animate-bounce" style={{ animationDuration: '1.5s' }}>🎉</div>
                <span className="absolute -top-2 -left-6 text-3xl animate-pulse" style={{ animationDuration: '1.5s' }}>✨</span>
                <span className="absolute -top-4 right-0 text-2xl animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.3s' }}>⭐</span>
                <span className="absolute -bottom-2 -left-4 text-2xl animate-pulse" style={{ animationDuration: '1.8s', animationDelay: '0.6s' }}>💫</span>
                <span className="absolute -bottom-1 -right-6 text-3xl animate-pulse" style={{ animationDuration: '2.2s', animationDelay: '0.9s' }}>🌟</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                  You're all{' '}
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    set!
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Your dashboard is ready for {name.trim() || 'your baby'}. 🍼
                  <br />
                  First insights will appear after 24 hours of tracking. 📊
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border border-purple-100/60 p-4 space-y-2 text-left">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Pro tip:
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Log every sleep & feed for the first few days — that's when the patterns become clearest!
                </p>
              </div>
              <Button
                onClick={completeOnboarding}
                size="lg"
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] rounded-full py-6 text-base font-semibold"
              >
                Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ActivityButton({
  emoji,
  label,
  hint,
  gradient,
  iconBg,
  onClick,
}: {
  emoji: string;
  label: string;
  hint?: string;
  gradient: string;
  iconBg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-white/60 bg-gradient-to-r ${gradient} hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 text-left group touch-target`}
    >
      <span className={`flex h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br ${iconBg} items-center justify-center shadow-sm shadow-purple-500/20 flex-shrink-0 text-2xl sm:text-3xl group-hover:scale-110 transition-transform`}>
        {emoji}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm sm:text-base font-semibold text-gray-900">{label}</span>
        {hint && <span className="block text-xs text-gray-500">{hint}</span>}
      </span>
      <ArrowRight className="h-4 w-4 text-purple-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
    </button>
  );
}

function FeatureBadge({ emoji, label, gradient }: { emoji: string; label: string; gradient: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br ${gradient} border border-white/60 text-xs sm:text-sm text-gray-700 font-medium`}>
      <span className="text-lg sm:text-xl">{emoji}</span>
      <span className="leading-tight">{label}</span>
    </div>
  );
}

function GenderButton({
  emoji,
  label,
  active,
  activeGradient,
  onClick,
}: {
  emoji: string;
  label: string;
  active: boolean;
  activeGradient: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border transition-all duration-300 touch-target text-sm font-medium ${
        active
          ? `bg-gradient-to-br ${activeGradient} text-white border-transparent shadow-md scale-[1.02]`
          : 'bg-white/70 text-gray-700 border-purple-200/70 hover:border-purple-400 hover:bg-purple-50'
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function TourStep({
  number,
  emoji,
  title,
  desc,
  gradient,
  iconBg,
}: {
  number: string;
  emoji: string;
  title: string;
  desc: string;
  gradient: string;
  iconBg: string;
}) {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r ${gradient} border border-white/60 shadow-sm`}>
      <span className={`flex h-12 w-12 rounded-xl bg-gradient-to-br ${iconBg} items-center justify-center shadow-sm flex-shrink-0 text-2xl relative`}>
        {emoji}
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-xs font-bold text-gray-700 flex items-center justify-center shadow-sm">{number}</span>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

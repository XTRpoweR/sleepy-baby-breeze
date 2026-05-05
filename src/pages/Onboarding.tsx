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
import { Baby, Sparkles, PartyPopper, Users, ArrowRight, Copy } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header / progress */}
      <div className="w-full max-w-xl mx-auto px-4 pt-6 sm:pt-10">
        {step !== 'welcome' && step !== 'success' && (
          <>
            <div className="flex items-center justify-between mb-2 text-xs sm:text-sm text-muted-foreground">
              <span>
                Step {stepIndex} of {STEPS.length - 2}
              </span>
              <button
                onClick={skipOnboarding}
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Skip setup
              </button>
            </div>
            <Progress value={progress} className="h-1.5" />
          </>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-xl p-6 sm:p-10 shadow-xl border-white/60 bg-white/90 backdrop-blur-md">
          {step === 'welcome' && (
            <div className="text-center space-y-5">
              <div className="text-6xl">🌙</div>
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome to SleepyBabyy!</h1>
              <p className="text-muted-foreground">
                Let's set up better sleep for you and your baby.
                <br />
                Takes less than 2 minutes ✨
              </p>
              <Button size="lg" className="w-full sm:w-auto" onClick={goNext}>
                Let's Start <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground pt-4 space-y-1">
                <p>You'll be able to:</p>
                <p>✓ Track sleep & feeds</p>
                <p>✓ See sleep patterns</p>
                <p>✓ Share with family</p>
              </div>
            </div>
          )}

          {step === 'baby' && (
            <div className="space-y-5">
              <div className="text-center">
                <Baby className="h-12 w-12 mx-auto text-primary mb-2" />
                <h2 className="text-2xl font-bold">Tell us about your baby</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="baby-name">Baby's name</Label>
                  <Input
                    id="baby-name"
                    placeholder="e.g. Emma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="birth-date">Birth date</Label>
                  <Input
                    id="birth-date"
                    type="date"
                    value={birthDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Gender (optional)</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant={gender === 'girl' ? 'default' : 'outline'}
                      onClick={() => setGender('girl')}
                      className="flex-1"
                    >
                      👧 Girl
                    </Button>
                    <Button
                      type="button"
                      variant={gender === 'boy' ? 'default' : 'outline'}
                      onClick={() => setGender('boy')}
                      className="flex-1"
                    >
                      👦 Boy
                    </Button>
                    <Button
                      type="button"
                      variant={gender === null ? 'default' : 'outline'}
                      onClick={() => setGender(null)}
                      className="flex-1"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={saveBaby} disabled={savingBaby} className="w-full" size="lg">
                {savingBaby ? 'Saving...' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 'tour' && (
            <div className="space-y-5 text-center">
              <div className="text-5xl">🎬</div>
              <h2 className="text-2xl font-bold">Quick tour</h2>
              <p className="text-muted-foreground">Here's how easy tracking is:</p>
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-6 text-left space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">😴</span>
                  <p className="text-sm">
                    <b>Tap the moon</b> when baby falls asleep
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">⏱️</span>
                  <p className="text-sm">
                    <b>Tap again</b> when they wake up
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">📊</span>
                  <p className="text-sm">
                    <b>We do the math</b> and show you patterns
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={goNext} size="lg">
                  Got it! <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={goNext} variant="ghost">
                  Skip tour
                </Button>
              </div>
            </div>
          )}

          {step === 'activity' && (
            <div className="space-y-5">
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto text-primary mb-2" />
                <h2 className="text-2xl font-bold">Log your first activity!</h2>
                <p className="text-muted-foreground mt-1">
                  Pick what's happening right now:
                </p>
              </div>
              <div className="grid gap-3">
                <ActivityButton emoji="😴" label="Baby is sleeping" onClick={() => logFirstActivity('sleep')} />
                <ActivityButton emoji="🍼" label="Just fed baby" onClick={() => logFirstActivity('feeding')} />
                <ActivityButton emoji="😊" label="Baby is awake" onClick={() => logFirstActivity('awake')} />
                <ActivityButton emoji="💩" label="Diaper change" onClick={() => logFirstActivity('diaper')} />
              </div>
              <Button onClick={goNext} variant="ghost" className="w-full">
                I'll do this later
              </Button>
            </div>
          )}

          {step === 'family' && (
            <div className="space-y-5">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-primary mb-2" />
                <h2 className="text-2xl font-bold">Share with family</h2>
                <p className="text-muted-foreground mt-1">
                  Track together with your partner, grandparents, or caregivers
                </p>
              </div>
              <div>
                <Label htmlFor="invite-email">Email (optional)</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="partner@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={sendInvite}
                  disabled={sendingInvite || !inviteEmail.trim()}
                  size="lg"
                >
                  {sendingInvite ? 'Sending...' : 'Send Invite'}
                </Button>
                <Button onClick={goNext} variant="ghost">
                  Maybe later
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                ✓ You're all set either way!
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-5">
              <PartyPopper className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-3xl font-bold">You're all set! 🎉</h2>
              <p className="text-muted-foreground">
                Your dashboard is ready.
                <br />
                First insights will appear after 24 hours of tracking. 📊
              </p>
              <Button onClick={completeOnboarding} size="lg" className="w-full sm:w-auto">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
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
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all text-left"
    >
      <span className="text-3xl">{emoji}</span>
      <span className="font-medium">{label}</span>
      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
    </button>
  );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Heart,
  Moon,
  Play,
  Check,
  ChevronDown,
  Smartphone,
  BarChart3,
  Users,
  Camera,
  Lock,
  Gift,
  Award,
  Baby,
} from 'lucide-react';

import trackEverythingImg from '@/assets/features/track-everything.png';
import analyticsReportsImg from '@/assets/features/analytics-reports.png';
import familySharingImg from '@/assets/features/family-sharing.png';
import memoriesImg from '@/assets/features/memories.png';

// Dedicated ad-traffic landing page. Optimised for Meta/Instagram ad
// clicks where most traffic is mobile, has zero patience, and bounces
// fast. Honest positioning — no invented stats. Focused on a single
// CTA: "Start Free Today".

const LandingSleep = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoOpen, setVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStart = () => {
    if (user) navigate('/dashboard');
    else navigate('/auth');
  };

  const playVideo = () => {
    setVideoOpen(true);
    // Defer to next tick so the element is mounted
    setTimeout(() => videoRef.current?.play().catch(() => {}), 50);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/40 to-indigo-50 overflow-x-hidden">
      {/* Background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-pink-300/25 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-purple-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      {/* Minimal nav — logo + sign in (no menu to avoid distractions) */}
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png"
              alt="SleepyBabyy"
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
            <span className="text-base sm:text-lg font-bold text-gray-900">SleepyBabyy</span>
          </div>
          {user ? (
            <Button
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 rounded-full px-4 sm:px-5 shadow-md shadow-purple-500/30"
            >
              Dashboard
            </Button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors touch-target px-2"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 lg:pt-20 pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-pink-200/60 text-pink-700 text-xs sm:text-sm font-medium shadow-sm mb-5 animate-fade-in-up">
            <Moon className="h-3.5 w-3.5" />
            <span>For sleep-deprived parents</span>
          </div>

          {/* H1 — exact match with the Meta ad keyword */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-5 sm:mb-7 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            Better Sleep for
            <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Baby &amp; You
            </span>
          </h1>

          {/* Sub — specific outcome, no fake numbers */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-7 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Track every nap, feed and wake-up in seconds. See the pattern
            behind the chaos. Get gentle, parent-friendly tips to help
            your baby — and you — sleep longer tonight. 🌙
          </p>

          {/* Primary CTA + secondary "watch demo" */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <Button
              size="lg"
              onClick={handleStart}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.03] transition-all duration-300 rounded-full px-8 py-6 text-base sm:text-lg font-semibold touch-target group"
            >
              <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Free Today
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <button
              onClick={playVideo}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/80 hover:bg-white border border-purple-200 text-purple-700 font-medium text-sm sm:text-base transition-all hover:scale-[1.02] touch-target"
            >
              <Play className="h-4 w-4 fill-purple-700" />
              Watch 60-sec demo
            </button>
          </div>

          {/* Trust strip — only honest promises */}
          <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="font-medium">Free forever plan</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-medium">No credit card</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-pink-500" />
              <span className="font-medium">14-day money-back</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-purple-500" />
              <span className="font-medium">Privacy first</span>
            </span>
          </div>

          {/* Click-to-play video — no autoplay, fast LCP */}
          <div className="relative max-w-3xl mx-auto mt-10 sm:mt-14 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl blur-md opacity-40" />
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-black">
              {!videoOpen ? (
                <button
                  onClick={playVideo}
                  aria-label="Play demo video"
                  className="relative w-full block group"
                >
                  <img
                    src="/lovable-uploads/6667cdc7-f4a7-4fad-9507-4f558fe9e8df.png"
                    alt="SleepyBabyy app demo"
                    className="w-full h-auto block"
                    width={1280}
                    height={720}
                    loading="eager"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <span className="flex h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/95 items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 sm:h-9 sm:w-9 text-purple-600 fill-purple-600 ml-1" />
                    </span>
                  </span>
                  <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                    60 sec demo
                  </span>
                </button>
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-auto block"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/lovable-uploads/6667cdc7-f4a7-4fad-9507-4f558fe9e8df.png"
                >
                  <source src="/SleepyBabyyDemo.mp4" type="video/mp4" />
                </video>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS — empathy without fake numbers */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-20 bg-white/60 backdrop-blur-sm border-y border-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Sound familiar?{' '}
              <span className="block sm:inline bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                You're not alone.
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Every exhausted parent has felt this. The good news: it gets
              easier when you can finally see the pattern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <PainCard
              emoji="😴"
              title="Up all night, again"
              desc="You're back at 3 a.m., bouncing, swaying — and you don't know why baby keeps waking."
              gradient="from-pink-100 to-pink-50"
              accent="from-pink-400 to-pink-500"
            />
            <PainCard
              emoji="🤯"
              title="Conflicting advice everywhere"
              desc="Books, forums, Google — every source says something different. None of it fits your baby."
              gradient="from-purple-100 to-purple-50"
              accent="from-purple-400 to-purple-500"
            />
            <PainCard
              emoji="😶‍🌫️"
              title="You can't remember anything"
              desc="When was the last feed? How long was that nap? The fog makes tracking impossible."
              gradient="from-indigo-100 to-indigo-50"
              accent="from-indigo-400 to-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 3 steps */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200/60 text-purple-700 text-xs sm:text-sm font-medium shadow-sm mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>How it works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Tracking is{' '}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                ridiculously simple
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
              No spreadsheets, no notebooks. Just three taps a day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <StepCard
              num="1"
              emoji="👆"
              title="Tap when baby sleeps or eats"
              desc="One-tap logging takes 5 seconds. Works one-handed, even at 3 a.m."
              accent="from-pink-400 to-pink-500"
              gradient="from-pink-50 to-pink-100/40"
            />
            <StepCard
              num="2"
              emoji="📊"
              title="See your baby's pattern"
              desc="Beautiful charts reveal the rhythm. Spot the trigger behind those night wake-ups."
              accent="from-purple-400 to-purple-500"
              gradient="from-purple-50 to-purple-100/40"
            />
            <StepCard
              num="3"
              emoji="🌙"
              title="Sleep longer, together"
              desc="Use the insights to gently adjust naps and bedtime. Both of you rest better."
              accent="from-indigo-400 to-indigo-500"
              gradient="from-indigo-50 to-indigo-100/40"
            />
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              onClick={handleStart}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-full px-8 py-5 text-base sm:text-lg font-semibold touch-target"
            >
              Try it free — 60 sec setup
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES — 4 only */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-20 bg-white/60 backdrop-blur-sm border-y border-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                understand your baby
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Designed for tired hands and short attention spans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard
              icon={Smartphone}
              title="One-tap tracking"
              desc="Sleep, feeding, diapers, awake time — all logged in seconds. No menus, no forms."
              img={trackEverythingImg}
              accent="from-pink-400 to-pink-500"
            />
            <FeatureCard
              icon={BarChart3}
              title="Pattern insights"
              desc="Charts that show exactly when baby sleeps best, what disrupts it, and what's improving."
              img={analyticsReportsImg}
              accent="from-purple-400 to-purple-500"
            />
            <FeatureCard
              icon={Users}
              title="Share with family"
              desc="Partner, grandparents, caregivers — everyone stays in sync. Nobody asks 'did you feed her?'"
              img={familySharingImg}
              accent="from-indigo-400 to-indigo-500"
            />
            <FeatureCard
              icon={Camera}
              title="Save the magic moments"
              desc="Tiny milestones, big firsts. Keep photos and memories alongside the data — in one place."
              img={memoriesImg}
              accent="from-pink-400 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* WHY TRUST US — only honest promises */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Why parents{' '}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                feel safe here
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <TrustCard
              icon={Award}
              title="14-day money-back"
              desc="Try it risk-free. Not for you? Full refund, no questions asked."
              accent="from-pink-400 to-pink-500"
            />
            <TrustCard
              icon={Gift}
              title="Free forever plan"
              desc="Core tracking stays free. Upgrade only if and when you want more."
              accent="from-purple-400 to-purple-500"
            />
            <TrustCard
              icon={Lock}
              title="Your data, your data"
              desc="We never sell. We never share with advertisers. Export or delete anytime."
              accent="from-indigo-400 to-indigo-500"
            />
            <TrustCard
              icon={Heart}
              title="Built by parents"
              desc="Made by people who've been at 3 a.m. with a screaming baby. We get it."
              accent="from-pink-400 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* FAQ — 5 essentials */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-20 bg-white/60 backdrop-blur-sm border-y border-white/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Quick{' '}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                questions
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            <FaqItem
              q="Is it really free?"
              a="Yes. The core tracking — sleep, feeds, diapers, charts — is free forever. We offer an optional Premium plan with extras like family sharing, advanced reports and photo memories. You don't need a credit card to start, and you'll never be auto-charged."
            />
            <FaqItem
              q="Do I have to enter all my data manually?"
              a="One tap to start, one tap to stop. That's it. Most parents track an entire day in under a minute total. There are no long forms, ever."
            />
            <FaqItem
              q="What if my baby's schedule is chaotic right now?"
              a="That's exactly when this helps most. Tracking even a few days starts to reveal the pattern hiding under the chaos — and that's the first step to fixing it."
            />
            <FaqItem
              q="Is my baby's data private?"
              a="100%. We never sell or share data with advertisers. You own everything you log and can export or permanently delete it anytime from your account."
            />
            <FaqItem
              q="What if it doesn't work for us?"
              a="We have a 14-day money-back guarantee on any paid plan. Full refund, no questions asked. The free plan stays free regardless."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
            <Baby className="h-9 w-9 sm:h-11 sm:w-11 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Your baby — and you —<br className="hidden sm:block" /> deserve real sleep tonight
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
            Sign up free in 60 seconds. Track tonight. Wake up tomorrow
            already understanding more.
          </p>
          <Button
            size="lg"
            onClick={handleStart}
            className="bg-white text-purple-600 hover:bg-white/95 hover:scale-[1.03] transition-all duration-300 shadow-2xl shadow-black/20 rounded-full px-10 py-7 text-base sm:text-lg font-bold touch-target"
          >
            <Sparkles className="h-5 w-5 mr-2 text-pink-500" />
            Start Free Today
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="mt-5 text-xs sm:text-sm text-white/80">
            Free forever plan · No credit card · 14-day money-back on paid plans
          </p>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 text-gray-300 text-center">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <img
              src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png"
              alt="SleepyBabyy"
              className="h-7 w-7"
            />
            <span className="font-bold text-white">SleepyBabyy</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            <a href="/help" className="hover:text-white transition-colors">Help</a>
            <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} SleepyBabyy. Made with 💜 by tired parents.</p>
        </div>
      </footer>
    </div>
  );
};

// === Sub-components ===

function PainCard({
  emoji,
  title,
  desc,
  gradient,
  accent,
}: {
  emoji: string;
  title: string;
  desc: string;
  gradient: string;
  accent: string;
}) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-gradient-to-br ${gradient} p-5 sm:p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({
  num,
  emoji,
  title,
  desc,
  accent,
  gradient,
}: {
  num: string;
  emoji: string;
  title: string;
  desc: string;
  accent: string;
  gradient: string;
}) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-gradient-to-br ${gradient} p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center`}>
      <div className={`inline-flex h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br ${accent} items-center justify-center shadow-lg shadow-purple-500/20 mb-4 relative`}>
        <span className="text-3xl">{emoji}</span>
        <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-xs font-bold text-gray-700 flex items-center justify-center shadow-md">
          {num}
        </span>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  img,
  accent,
}: {
  icon: typeof Smartphone;
  title: string;
  desc: string;
  img: string;
  accent: string;
}) {
  return (
    <div className="relative rounded-2xl border border-white/60 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${accent}`} />
      <div className="p-5 sm:p-6 pb-3 flex items-start gap-3">
        <div className={`inline-flex h-11 w-11 rounded-xl bg-gradient-to-br ${accent} items-center justify-center shadow-md shadow-purple-500/20 flex-shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 border border-white">
          <img
            src={img}
            alt={title}
            loading="lazy"
            className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
}

function TrustCard({
  icon: Icon,
  title,
  desc,
  accent,
}: {
  icon: typeof Award;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className={`inline-flex h-11 w-11 rounded-xl bg-gradient-to-br ${accent} items-center justify-center shadow-md shadow-purple-500/20 mb-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-start justify-between gap-4 touch-target">
        <span className="text-sm sm:text-base font-semibold text-gray-900 pr-2">{q}</span>
        <ChevronDown
          className={`h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </summary>
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{a}</p>
      </div>
    </details>
  );
}

export default LandingSleep;

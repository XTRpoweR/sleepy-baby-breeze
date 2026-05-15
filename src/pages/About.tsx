import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/useAuth";
import { useSmartBack } from "@/hooks/useSmartBack";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Baby,
  Shield,
  Globe,
  Sparkles,
  Moon,
  Star,
  MessageCircle,
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const goBack = useSmartBack(user ? "/dashboard" : "/");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/40 to-indigo-50 overflow-x-hidden">
      {/* Decorative blurred blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-pink-300/25 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-purple-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      {/* Conditional Headers */}
      {user ? (
        <>
          <DesktopHeader />
          <MobileHeader />
        </>
      ) : (
        <nav className="bg-white/70 backdrop-blur-md border-b border-white/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <img
                src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png"
                alt="SleepyBabyy"
                className="h-8 w-8 sm:h-9 sm:w-9"
              />
              <span className="text-base sm:text-lg font-bold text-gray-900">{t("app.name")}</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <Button
                size="sm"
                onClick={() => navigate("/contact")}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 rounded-full px-4 sm:px-5 shadow-md shadow-purple-500/30"
              >
                <span className="hidden sm:inline">Contact Us</span>
                <span className="sm:hidden">Contact</span>
              </Button>
            </div>
          </div>
        </nav>
      )}

      {/* Hero section — Back button + Contact CTA on same row (Help Center pattern) */}
      <section className="relative py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 touch-target"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={() => navigate("/contact")}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] rounded-full px-6"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Say hi
            </Button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-pink-200/60 text-pink-700 text-xs sm:text-sm font-medium mb-5 shadow-sm">
              <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
              <span>Our story</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Made by parents,
              <span className="block mt-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                for parents
              </span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto">
              SleepyBabyy was born from sleepless nights, endless Google
              searches, and the kind of love that keeps you awake at 3 a.m.
              We've been there. We built the app we wished we'd had during
              those precious, exhausting early days. 🌙
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-white/60 backdrop-blur-sm border-y border-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-5 sm:mb-7">
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Our story
                </span>
              </h2>
              <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>
                  It started the way these things usually do — with a tiny
                  human, a sleep-deprived couple, and a Google search at 2:47
                  a.m. that returned twelve contradictory answers.
                </p>
                <p>
                  As parents who happened to also be builders, we kept reaching
                  for the same thing: a calm, simple way to <em>see</em> what
                  was actually happening. Not a 50-page sleep book. Not a
                  spreadsheet. Something we could tap with one hand at 3 a.m.
                </p>
                <p>
                  So we built it for ourselves first — then for friends, then
                  family, then more. SleepyBabyy is what we wish had existed
                  when we needed it most. We hope it gives you back even a
                  fraction of the sleep this work has cost us. 💜
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl border border-white/60 bg-white/85 backdrop-blur-md shadow-2xl shadow-purple-500/10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
                <div className="p-6 sm:p-8 text-center">
                  <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                    <Heart className="h-8 w-8 text-white fill-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    Our mission
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    To help every family get the rest they deserve — with
                    gentle, honest, science-aware tools that respect each
                    baby's unique rhythm.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Encouraging note — speaks directly to the tired parent reading at midnight */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl border border-white/60 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 shadow-xl shadow-purple-500/10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
            <div className="p-6 sm:p-10 text-center space-y-4">
              <div className="inline-flex items-center justify-center text-4xl">
                <Moon className="h-10 w-10 text-purple-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  A note for the tired parent reading this
                </span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                If you found us at 3 a.m. with a baby finally asleep on your
                chest — we see you. You are doing better than you think.
                Sleep deprivation lies to you about how well you're handling
                this. <span className="font-semibold">You're handling it
                beautifully.</span>
              </p>
              <p className="text-sm sm:text-base text-gray-600 italic">
                One night at a time. One feed at a time. You've got this. 💜
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white/60 backdrop-blur-sm border-y border-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              What we{" "}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                believe
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto">
              The principles behind every decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <ValueCard
              icon={Baby}
              title="Baby-first"
              desc="Every feature is shaped by the wellbeing and unique rhythm of one tiny human at a time."
              gradient="from-pink-400 to-pink-500"
            />
            <ValueCard
              icon={Shield}
              title="Privacy-first"
              desc="Your family's data is yours. We never sell it, we never share it with advertisers."
              gradient="from-purple-400 to-purple-500"
            />
            <ValueCard
              icon={Heart}
              title="Gentle &amp; honest"
              desc="No shame, no shouty marketing, no scare tactics. Just calm guidance, when you need it."
              gradient="from-indigo-400 to-indigo-500"
            />
            <ValueCard
              icon={Globe}
              title="Inclusive"
              desc="Families come in many shapes. We support all of them, in 8 languages and counting."
              gradient="from-pink-400 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* What we stand for — pillars (no fake numbers) */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              What we{" "}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                stand for
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              Honest, parent-friendly tools for modern families.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PillarCard emoji="🔒" label="Privacy first" sub="Your data, your data" />
            <PillarCard emoji="🆓" label="Free forever plan" sub="No card needed" />
            <PillarCard emoji="👨‍👩‍👧" label="Family sharing" sub="Track together" />
            <PillarCard emoji="🌍" label="8 languages" sub="More on the way" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-5">
            <Star className="h-7 w-7 sm:h-8 sm:w-8 text-white fill-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Join us — one peaceful night at a time
          </h2>
          <p className="text-base sm:text-lg text-white/90 mb-7 max-w-xl mx-auto">
            Become part of a community quietly transforming how families
            navigate baby sleep.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
              className="bg-white text-purple-600 hover:bg-white/95 hover:scale-[1.03] transition-all duration-300 shadow-2xl shadow-black/20 rounded-full px-8 py-6 text-base sm:text-lg font-bold touch-target"
            >
              <Sparkles className="h-5 w-5 mr-2 text-pink-500" />
              {user ? "Open your dashboard" : "Start free today"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/contact")}
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/40 hover:border-white/60 rounded-full px-7 py-6 text-base sm:text-lg font-semibold backdrop-blur-sm touch-target transition-all"
            >
              Send us a note
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

function ValueCard({
  icon: Icon,
  title,
  desc,
  gradient,
}: {
  icon: typeof Baby;
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <div className="relative rounded-2xl border border-white/60 bg-white/85 backdrop-blur-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="p-5 sm:p-6">
        <div className={`inline-flex h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} items-center justify-center shadow-sm shadow-purple-500/20 mb-3`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PillarCard({ emoji, label, sub }: { emoji: string; label: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="text-3xl sm:text-4xl mb-2">{emoji}</div>
      <div className="text-sm sm:text-base font-semibold text-gray-900">{label}</div>
      <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
    </div>
  );
}

export default About;

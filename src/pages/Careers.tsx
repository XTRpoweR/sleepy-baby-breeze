import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Heart, Mail, Sparkles, Users, Coffee, Code } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSmartBack } from "@/hooks/useSmartBack";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { LanguageSelector } from "@/components/LanguageSelector";

const SUPPORT_EMAIL = "support@sleepybabyy.com";

const Careers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const goBack = useSmartBack(user ? "/dashboard" : "/");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/40 to-indigo-50 overflow-x-hidden">
      {/* Decorative blurred blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-pink-300/25 blur-3xl" />
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
              <span className="text-base sm:text-lg font-bold text-gray-900">SleepyBabyy</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 rounded-full px-4 shadow-md shadow-purple-500/30"
              >
                Sign in
              </Button>
            </div>
          </div>
        </nav>
      )}

      {/* Back link */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 touch-target"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      {/* Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-10 sm:pb-14">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-pink-200/60 text-pink-700 text-xs sm:text-sm font-medium shadow-sm mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Careers at SleepyBabyy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-5">
            We're a{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              small team
            </span>{" "}
            building thoughtfully
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We aren't hiring right now — and we'd rather tell you that straight
            than dress up the page with roles we can't fill yet. 🌙
          </p>
        </div>
      </section>

      {/* Honest content card */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl border border-white/60 bg-white/85 backdrop-blur-md shadow-2xl shadow-purple-500/10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

            <div className="p-6 sm:p-10 space-y-8">
              {/* Why this page exists */}
              <div className="space-y-3">
                <div className="inline-flex h-11 w-11 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 items-center justify-center shadow-md shadow-purple-500/20">
                  <Heart className="h-5 w-5 text-white fill-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Honest about where we are
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  SleepyBabyy is a small product built by parents who got tired
                  of guessing at 3 a.m. Today we're focused on shipping the best
                  experience we can for the families already using us —
                  not on growing the team.
                </p>
              </div>

              {/* What we care about */}
              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500">
                  When we do hire, we'll care about:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <ValueCard
                    icon={Users}
                    title="Parents first"
                    desc="Care for the families using the product, not metrics on a dashboard."
                    accent="from-pink-400 to-pink-500"
                  />
                  <ValueCard
                    icon={Code}
                    title="Craft &amp; calm"
                    desc="We move at a sustainable pace and ship things we're proud of."
                    accent="from-purple-400 to-purple-500"
                  />
                  <ValueCard
                    icon={Coffee}
                    title="Remote, asynchronous"
                    desc="Work when you can think clearly, not by the clock."
                    accent="from-indigo-400 to-indigo-500"
                  />
                  <ValueCard
                    icon={Heart}
                    title="Built by humans, for humans"
                    desc="Empathy isn't a value, it's the job."
                    accent="from-pink-400 to-purple-500"
                  />
                </div>
              </div>

              {/* Stay in touch */}
              <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border border-purple-100/60 p-5 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/30">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                      Want to be remembered when we open roles?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Drop us a short note — what you do, what excites you about
                      SleepyBabyy, and how to reach you. We read every message.
                    </p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}?subject=Future%20careers%20%E2%80%94%20introduction&body=Hi%20SleepyBabyy%20team%2C%0A%0AA%20bit%20about%20me%3A%0A%0AWhat%20excites%20me%20about%20what%20you%27re%20building%3A%0A%0AHow%20to%20reach%20me%3A%0A%0AThanks%21`}
                      className="flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white text-sm font-semibold shadow-md shadow-purple-500/30 hover:shadow-lg hover:scale-[1.02] transition-all touch-target"
                    >
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline truncate">Email us — {SUPPORT_EMAIL}</span>
                      <span className="sm:hidden">Email us</span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    </a>
                    <p className="sm:hidden text-xs text-gray-500 mt-2 break-all">
                      {SUPPORT_EMAIL}
                    </p>
                  </div>
                </div>
              </div>

              {/* What you can do now */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500">
                  In the meantime
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/about")}
                    className="flex-1 rounded-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 transition-all touch-target"
                  >
                    Learn about us
                  </Button>
                  <Button
                    onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
                    className="flex-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-md shadow-purple-500/30 hover:shadow-lg transition-all touch-target"
                  >
                    {user ? "Open your dashboard" : "Try SleepyBabyy free"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Thanks for reading this far. 💜 We promise we'll update this page
            the moment that changes.
          </p>
        </div>
      </section>
    </div>
  );
};

function ValueCard({
  icon: Icon,
  title,
  desc,
  accent,
}: {
  icon: typeof Users;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className={`inline-flex h-9 w-9 rounded-lg bg-gradient-to-br ${accent} items-center justify-center shadow-sm mb-3`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

export default Careers;

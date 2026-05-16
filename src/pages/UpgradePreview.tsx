import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Crown,
  ArrowRight,
  Check,
  Star,
  Zap,
} from "lucide-react";

/**
 * Local-only preview page for the upgrade UI redesign options.
 * Open at /dev/upgrade-preview to compare variants side-by-side.
 * Not linked from anywhere — purely for design review.
 */
const UpgradePreview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/30 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Upgrade UI — design options
          </h1>
          <p className="text-gray-600">
            Compare variants. Tell me which one you want and I'll apply it to the real dashboard.
          </p>
        </div>

        {/* ============================================== */}
        {/* CURRENT (for reference) */}
        {/* ============================================== */}
        <Section title="Current (what you have today)" subtitle="Orange warning palette — clashes with the brand">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-100 to-orange-200/60 rounded-3xl overflow-hidden max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-full p-3 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Unlock Premium</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Unlimited profiles, family sharing & more — from $7.99/month
                  </p>
                </div>
              </div>
              <Button className="w-full mt-4 rounded-full font-semibold shadow-lg bg-orange-500 hover:bg-orange-600 text-white">
                <Crown className="h-4 w-4 mr-2" />
                View Premium Plans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Section>

        {/* ============================================== */}
        {/* OPTION A — Brand recolor (minimal change) */}
        {/* ============================================== */}
        <Section
          title="Option A — Brand recolor (minimal change)"
          subtitle="Same structure, just switched orange → pink/purple/indigo gradient"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl overflow-hidden max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-full p-3 shadow-lg shadow-purple-500/30">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Unlock Premium</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Unlimited profiles, family sharing & more — from $7.99/month
                  </p>
                </div>
              </div>
              <Button className="w-full mt-4 rounded-full font-semibold shadow-lg shadow-purple-500/30 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0">
                <Crown className="h-4 w-4 mr-2" />
                View Premium Plans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Section>

        {/* ============================================== */}
        {/* OPTION B-1 — Dark Premium (Apple/Notion vibes) */}
        {/* ============================================== */}
        <Section
          title="Option B-1 — Dark Premium"
          subtitle="Dark background with brand-color highlights — feels exclusive / Apple-like"
        >
          <div className="relative overflow-hidden rounded-3xl max-w-2xl mx-auto shadow-2xl shadow-purple-900/20">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
            {/* Glow blobs */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                  <Star className="h-3 w-3 fill-white" />
                  Premium
                </span>
                <span className="text-xs text-purple-200/80">7-day free trial</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                Unlock unlimited profiles
                <br />
                <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  & family sharing
                </span>
              </h3>
              <p className="text-purple-100/80 text-sm leading-relaxed mb-5">
                Track multiple babies, share with caregivers, and unlock pediatrician reports.
              </p>
              <Button className="w-full rounded-full font-semibold bg-white hover:bg-purple-50 text-purple-900 border-0 shadow-lg">
                Try free for 7 days
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-center text-purple-200/60 text-xs mt-3">
                from $7.99/month · cancel anytime
              </p>
            </div>
          </div>
        </Section>

        {/* ============================================== */}
        {/* OPTION B-1 COMPACT — slim version */}
        {/* ============================================== */}
        <Section
          title="Option B-1 Compact ⭐ (what I'll apply)"
          subtitle="Same Dark Premium look — slimmer, single row, doesn't dominate the dashboard"
        >
          <div className="relative overflow-hidden rounded-2xl max-w-2xl mx-auto shadow-lg shadow-purple-900/15">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-pink-500/20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl" />

            <div className="relative p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-xl p-2.5 shadow-md shadow-purple-500/30">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Unlock Premium
                    </h3>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-bold uppercase tracking-wider">
                      7-day free
                    </span>
                  </div>
                  <p className="text-purple-200/70 text-xs sm:text-sm leading-snug truncate">
                    Unlimited profiles · family sharing · pediatrician reports
                  </p>
                </div>

                {/* CTA */}
                <Button
                  size="sm"
                  className="flex-shrink-0 rounded-full font-semibold bg-white hover:bg-purple-50 text-purple-900 border-0 shadow-md px-3 sm:px-4 h-9"
                >
                  <span className="hidden sm:inline">See plans</span>
                  <span className="sm:hidden">Plans</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ============================================== */}
        {/* OPTION B-2 — Glow Premium (gradient ring) */}
        {/* ============================================== */}
        <Section
          title="Option B-2 — Glow Premium"
          subtitle="White card with animated gradient ring around it — elegant & on-brand"
        >
          <div className="relative max-w-2xl mx-auto group">
            {/* Outer gradient ring */}
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-75 group-hover:opacity-100 blur-sm transition-opacity" />
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

            <Card className="relative border-0 bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-3 shadow-lg shadow-purple-500/40">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-400 ring-2 ring-white">
                      <Star className="h-2.5 w-2.5 text-white fill-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">Get Premium</h3>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">
                        Save 20%
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Unlimited profiles · family sharing · pediatrician reports
                    </p>
                  </div>
                </div>
                <Button className="w-full rounded-full font-semibold shadow-lg shadow-purple-500/30 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0">
                  Try free for 7 days
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-center text-gray-500 text-xs mt-3">
                  from $7.99/month · cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ============================================== */}
        {/* OPTION B-3 — Mini Premium (thin pill bar) */}
        {/* ============================================== */}
        <Section
          title="Option B-3 — Mini Premium"
          subtitle="One-line slim bar — least intrusive, max focus on the dashboard itself"
        >
          <button
            type="button"
            className="group max-w-2xl mx-auto w-full flex items-center justify-between gap-4 p-3 pr-4 rounded-2xl bg-white border border-purple-200/70 shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-xl p-2 shadow-md shadow-purple-500/30 flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Try Premium free for 7 days
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Unlimited profiles, family sharing & more
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-purple-600 text-sm font-semibold flex-shrink-0">
              <span className="hidden sm:inline">See plans</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </Section>

        {/* ============================================== */}
        {/* OPTION C — Feature-led premium card */}
        {/* ============================================== */}
        <Section
          title="Option C — Feature-led premium card"
          subtitle="Bigger card showing what you actually get — best for first-time visitors"
        >
          <div className="relative max-w-2xl mx-auto">
            <Card className="border-0 bg-gradient-to-br from-pink-50 via-white to-indigo-50 rounded-3xl overflow-hidden shadow-xl shadow-purple-500/10">
              {/* Top gradient bar */}
              <div className="h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

              <CardContent className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-bold uppercase tracking-wider mb-3 shadow-sm">
                      <Star className="h-3 w-3 fill-white" />
                      Premium
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      Built for the whole family
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Everything you need to track sleep & share with caregivers.
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {[
                    "Unlimited baby profiles",
                    "Family sharing & caregiver access",
                    "Pediatrician-ready PDF reports",
                    "Smart sleep insights",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <span className="flex-shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 shadow-sm">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button className="w-full rounded-full font-semibold py-6 shadow-lg shadow-purple-500/30 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0">
                  <Zap className="h-4 w-4 mr-2" />
                  Start 7-day free trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-center text-gray-500 text-xs mt-3">
                  from $7.99/month · no credit card needed · cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Top warning pill variants */}
        <Section
          title="Top pill (the warning bar above profile picker)"
          subtitle="Three styles to choose from"
        >
          <div className="space-y-3 max-w-md mx-auto">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Pill 1 — Soft brand</p>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-purple-200/60 rounded-2xl p-3">
              <p className="text-sm text-purple-700 text-center flex items-center justify-center gap-2 font-medium">
                <Crown className="h-4 w-4 text-purple-500" />
                Upgrade to Premium for unlimited baby profiles
              </p>
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2 mt-5">Pill 2 — Gradient outline</p>
            <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              <div className="bg-white rounded-2xl p-3">
                <p className="text-sm text-gray-800 text-center flex items-center justify-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Upgrade to Premium for unlimited baby profiles
                </p>
              </div>
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2 mt-5">Pill 3 — Filled gradient (boldest)</p>
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-3 shadow-md shadow-purple-500/30">
              <p className="text-sm text-white text-center flex items-center justify-center gap-2 font-medium">
                <Crown className="h-4 w-4 fill-white" />
                Upgrade to Premium for unlimited baby profiles
              </p>
            </div>
          </div>
        </Section>

        <div className="text-center text-gray-500 text-sm mt-12 pb-8">
          Tell me which variants you want: e.g. <span className="font-mono bg-white px-2 py-1 rounded">Card: B-2 · Pill: 2</span>
        </div>
      </div>
    </div>
  );
};

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="mb-12">
    <div className="mb-5 max-w-2xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
    </div>
    {children}
  </div>
);

export default UpgradePreview;

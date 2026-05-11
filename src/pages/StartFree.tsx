import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Moon,
  Brain,
  Users,
  BarChart3,
  FileText,
  Sparkles,
  Check,
  Star,
  ChevronDown,
  Shield,
  CreditCard,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fbqTrack } from "@/utils/metaPixel";

const PRIMARY_CTA_TEXT = "Start Your Free 7-Day Trial";

const TrustBadges: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[#1A1A2E]/70 ${className}`}>
    <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[#10B981]" /> No credit card</span>
    <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[#10B981]" /> Cancel anytime</span>
    <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[#10B981]" /> 1000+ parents</span>
  </div>
);

const CTAButton: React.FC<{ source: string; className?: string }> = ({ source, className = "" }) => {
  const handleClick = () => {
    try {
      fbqTrack("Lead", { content_name: "start-free-cta", source });
      fbqTrack("StartTrial", { content_name: "free-7-day-trial", source, value: 0, currency: "USD" });
      // GA4
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "begin_trial", { source });
      }
    } catch {
      /* never break */
    }
  };
  return (
    <Button
      asChild
      size="lg"
      className={`h-14 px-8 text-base font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-lg shadow-[#4F46E5]/30 hover:shadow-xl hover:shadow-[#4F46E5]/40 hover:scale-[1.02] transition-all rounded-xl ${className}`}
    >
      <Link to="/auth?mode=signup&plan=trial" onClick={handleClick}>
        {PRIMARY_CTA_TEXT}
      </Link>
    </Button>
  );
};

const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className = "", children }) => (
  <section id={id} className={`px-5 py-16 sm:py-20 md:py-24 ${className}`}>
    <div className="mx-auto max-w-6xl">{children}</div>
  </section>
);

const PainCard: React.FC<{ emoji: string; text: string }> = ({ emoji, text }) => (
  <Card className="p-6 text-center border-[#1A1A2E]/5 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
    <div className="text-4xl mb-3">{emoji}</div>
    <p className="text-base sm:text-lg font-medium text-[#1A1A2E]">{text}</p>
  </Card>
);

const SolutionCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <Card className="p-6 border-[#1A1A2E]/5 hover:border-[#4F46E5]/30 transition-all hover:-translate-y-1 hover:shadow-xl">
    <div className="h-12 w-12 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-[#1A1A2E] mb-1.5">{title}</h3>
    <p className="text-sm text-[#1A1A2E]/70">{desc}</p>
  </Card>
);

const FeatureRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  bullets: string[];
  reverse?: boolean;
}> = ({ icon, title, desc, bullets, reverse }) => (
  <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
    <div>
      <div className="inline-flex h-12 w-12 rounded-xl bg-[#10B981]/10 text-[#10B981] items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-3">{title}</h3>
      <p className="text-[#1A1A2E]/70 mb-5">{desc}</p>
      <ul className="space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[#1A1A2E]/80">
            <Check className="h-5 w-5 text-[#10B981] mt-0.5 flex-shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="relative">
      <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#E8F0FF] to-[#F5E8FF] border border-white shadow-xl flex items-center justify-center overflow-hidden">
        <div className="text-7xl sm:text-8xl opacity-60">{icon}</div>
      </div>
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-[#4F46E5]/10 blur-2xl" aria-hidden />
    </div>
  </div>
);

const Stars: React.FC = () => (
  <div className="flex gap-0.5 text-yellow-400 mb-3">
    {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
  </div>
);

const TestimonialCard: React.FC<{ quote: string; name: string; meta: string }> = ({ quote, name, meta }) => (
  <Card className="p-6 bg-white border-[#1A1A2E]/5 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
    <Stars />
    <p className="text-[#1A1A2E]/80 mb-4 flex-1 italic">"{quote}"</p>
    <div>
      <p className="font-semibold text-[#1A1A2E]">{name}</p>
      <p className="text-sm text-[#1A1A2E]/60">{meta}</p>
    </div>
  </Card>
);

type Plan = {
  name: string;
  monthlyPrice: string;
  totalLabel?: string;
  badge?: string;
  saveBadge?: string;
  highlight?: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
};

const PriceCard: React.FC<{ plan: Plan; source: string }> = ({ plan, source }) => (
  <Card
    className={`relative p-6 flex flex-col ${
      plan.highlight ? "border-2 border-[#4F46E5] shadow-2xl shadow-[#4F46E5]/20 scale-[1.02]" : "border-[#1A1A2E]/10"
    }`}
  >
    {plan.badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#4F46E5] text-white text-xs font-semibold whitespace-nowrap">
        ⭐ {plan.badge}
      </div>
    )}
    <h3 className="text-lg font-bold text-[#1A1A2E]">{plan.name}</h3>
    <div className="mt-3 mb-1 flex items-baseline gap-1">
      <span className="text-4xl font-extrabold text-[#1A1A2E]">{plan.monthlyPrice}</span>
      <span className="text-sm text-[#1A1A2E]/60">/mo</span>
    </div>
    {plan.totalLabel && <p className="text-xs text-[#1A1A2E]/60">{plan.totalLabel}</p>}
    {plan.saveBadge && (
      <span className="mt-2 self-start inline-block px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold">
        {plan.saveBadge}
      </span>
    )}
    <ul className="mt-5 space-y-2 flex-1">
      {plan.features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm text-[#1A1A2E]/80">
          <Check className="h-4 w-4 text-[#10B981] mt-0.5 flex-shrink-0" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <Button
      asChild
      className={`mt-6 h-11 font-semibold ${
        plan.highlight ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white" : "bg-[#1A1A2E] hover:bg-[#1A1A2E]/90 text-white"
      }`}
    >
      <Link
        to={plan.ctaHref}
        onClick={() => {
          try {
            fbqTrack("Lead", { content_name: `pricing-${plan.name}`, source });
            fbqTrack("StartTrial", { content_name: plan.name, source });
          } catch {/*noop*/}
        }}
      >
        {plan.cta}
      </Link>
    </Button>
  </Card>
);

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1A1A2E]/10 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left gap-4"
        aria-expanded={open}
      >
        <span className="font-semibold text-[#1A1A2E]">{q}</span>
        <ChevronDown className={`h-5 w-5 text-[#1A1A2E]/60 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-3 text-[#1A1A2E]/70">{a}</p>}
    </div>
  );
};

const StartFree: React.FC = () => {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");

  useEffect(() => {
    document.title = "Start Your Free 7-Day Trial | SleepyBabyy";
    const setMeta = (attr: "name" | "property", key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", "Track your baby's sleep, decode wake windows, and get the rest you both deserve. Start your free 7-day trial — no credit card required.");
    setMeta("property", "og:title", "Better nights start with us — SleepyBabyy");
    setMeta("property", "og:description", "Free 7-day trial. Track sleep, understand wake windows, finally rest.");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", "https://sleepybabyy.com/start-free");
    setMeta("name", "twitter:card", "summary_large_image");
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://sleepybabyy.com/start-free";

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "SleepyBabyy",
      description: "Baby sleep tracking app with smart insights, wake window guidance, and family sharing.",
      brand: { "@type": "Brand", name: "SleepyBabyy" },
      offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: "0", highPrice: "7.99", offerCount: "4" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "1000" },
    };
    const ldId = "start-free-ld-json";
    let ld = document.getElementById(ldId) as HTMLScriptElement | null;
    if (!ld) { ld = document.createElement("script"); ld.id = ldId; ld.type = "application/ld+json"; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify(schema);

    try {
      fbqTrack("ViewContent", { content_name: "start-free-landing", content_category: "landing-page" });
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "page_view", {
          page_title: "Start Free - SleepyBabyy",
          page_location: window.location.href,
        });
      }
    } catch {/*noop*/}
  }, []);

  const monthlyPlans: Plan[] = [
    {
      name: "Free",
      monthlyPrice: "$0",
      totalLabel: "Forever",
      features: ["Basic sleep tracking", "1 baby profile", "7-day history"],
      cta: "Get started free",
      ctaHref: "/auth?mode=signup",
    },
    {
      name: "Monthly",
      monthlyPrice: "$7.99",
      totalLabel: "Billed monthly",
      features: ["Unlimited tracking", "Family sharing", "Pediatrician reports", "Smart insights"],
      cta: "Start free trial",
      ctaHref: "/auth?mode=signup&plan=monthly",
    },
  ];

  const yearlyPlans: Plan[] = [
    {
      name: "Free",
      monthlyPrice: "$0",
      totalLabel: "Forever",
      features: ["Basic sleep tracking", "1 baby profile", "7-day history"],
      cta: "Get started free",
      ctaHref: "/auth?mode=signup",
    },
    {
      name: "3-Month",
      monthlyPrice: "$6.66",
      totalLabel: "Billed $19.99 every 3 months",
      saveBadge: "Save 17%",
      features: ["Everything in Monthly", "Family sharing", "Priority support"],
      cta: "Start free trial",
      ctaHref: "/auth?mode=signup&plan=quarterly",
    },
    {
      name: "Yearly",
      monthlyPrice: "$5.83",
      totalLabel: "Billed $69.99 yearly",
      badge: "Best Value",
      saveBadge: "Save 27%",
      highlight: true,
      features: ["Everything in 3-Month", "All premium features", "Early access to new tools", "14-day refund"],
      cta: "Start free trial",
      ctaHref: "/auth?mode=signup&plan=yearly",
    },
  ];

  const plans = billing === "yearly" ? yearlyPlans : monthlyPlans;



  return (
    <div className="min-h-screen bg-white text-[#1A1A2E]" style={{ scrollBehavior: "smooth" }}>

      {/* HERO */}
      <section
        className="relative overflow-hidden px-5 pt-16 pb-20 sm:pt-20 sm:pb-24"
        style={{ background: "linear-gradient(135deg, #E8F0FF 0%, #F5E8FF 100%)" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur text-xs font-semibold text-[#4F46E5] mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Trusted by 1000+ parents
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1A1A2E] leading-tight">
            Better nights start with us. <span className="inline-block">🌙</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-[#1A1A2E]/75 max-w-2xl mx-auto">
            Track your baby's sleep, understand wake windows, and finally get the rest you both deserve.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <CTAButton source="hero" className="w-full sm:w-auto" />
            <TrustBadges />
          </div>
        </div>
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#4F46E5]/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#10B981]/10 blur-3xl" aria-hidden />
      </section>

      {/* PAIN POINTS */}
      <Section className="bg-white">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">Sound familiar? You're not alone.</h2>
        <p className="text-center text-[#1A1A2E]/60 mb-10">Every exhausted parent has been here.</p>
        <div className="grid sm:grid-cols-3 gap-5">
          <PainCard emoji="😴" text="Waking up 5 times a night?" />
          <PainCard emoji="🤯" text="Don't understand baby's sleep patterns?" />
          <PainCard emoji="😟" text="Feeling exhausted and overwhelmed?" />
        </div>
      </Section>

      {/* SOLUTION */}
      <Section className="bg-[#F8FAFC]">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">SleepyBabyy makes it simple.</h2>
        <p className="text-center text-[#1A1A2E]/60 mb-10">Three tools that work together for calmer nights.</p>
        <div className="grid sm:grid-cols-3 gap-5">
          <SolutionCard icon={<BarChart3 className="h-6 w-6" />} title="📊 SmartSleep™ Tracking" desc="Log naps in seconds with one-tap timers." />
          <SolutionCard icon={<Brain className="h-6 w-6" />} title="🧠 Wake Window Insights" desc="Know exactly when baby is ready to sleep again." />
          <SolutionCard icon={<Users className="h-6 w-6" />} title="👨‍👩‍👧 Family Sharing" desc="Both parents stay in sync, in real time." />
        </div>
      </Section>

      {/* FEATURES */}
      <Section className="bg-white space-y-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center">Everything you need for better sleep.</h2>
        <FeatureRow
          icon={<Moon className="h-6 w-6" />}
          title="Sleep Tracking that's actually fast"
          desc="One tap to start, one tap to stop. Live timers, history, and patterns at a glance."
          bullets={["One-tap nap & night logging", "Live timers across devices", "Beautiful history view"]}
        />
        <FeatureRow
          reverse
          icon={<FileText className="h-6 w-6" />}
          title="Pediatrician-Ready Reports"
          desc="Generate a clean PDF for your next checkup in seconds. Sleep, feeding, diapers — all in one place."
          bullets={["Polished PDF export", "Custom date ranges", "Share with your pediatrician"]}
        />
        <FeatureRow
          icon={<Users className="h-6 w-6" />}
          title="Family Sharing that just works"
          desc="Invite your partner, grandparents, or nanny. Real-time sync so everyone's on the same page."
          bullets={["Real-time sync", "Role-based permissions", "Up to 5 family members"]}
        />
        <FeatureRow
          reverse
          icon={<Sparkles className="h-6 w-6" />}
          title="Personalized Insights"
          desc="The more you log, the smarter it gets. Wake-window suggestions tailored to your baby's age."
          bullets={["Age-based wake windows", "Pattern detection", "Gentle weekly summaries"]}
        />
      </Section>

      {/* TESTIMONIALS */}
      <Section className="bg-gradient-to-br from-[#E8F0FF] to-[#F5E8FF]">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">Loved by parents everywhere.</h2>
        <p className="text-center text-[#1A1A2E]/60 mb-10">Real stories from real, very tired parents.</p>
        <div className="grid md:grid-cols-3 gap-5">
          <TestimonialCard
            quote="Within a week we figured out our daughter's wake windows. First full night of sleep in 4 months. I almost cried."
            name="Sarah M."
            meta="Mom of Lily (4mo) · Austin, TX"
          />
          <TestimonialCard
            quote="The family sharing is a game-changer. My husband and I finally stopped asking each other 'when did she last nap?'"
            name="Priya K."
            meta="Mom of Aarav (7mo) · Toronto, CA"
          />
          <TestimonialCard
            quote="Took the PDF report to our pediatrician and she was impressed. Made the whole appointment so much easier."
            name="James & Rob"
            meta="Dads of twins (9mo) · London, UK"
          />
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" className="bg-white">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">Simple, honest pricing.</h2>
        <p className="text-center text-[#1A1A2E]/60 mb-8">Start free. Upgrade when you're ready.</p>

        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-full bg-[#1A1A2E]/5">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === "monthly" ? "bg-white shadow text-[#1A1A2E]" : "text-[#1A1A2E]/60"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === "yearly" ? "bg-white shadow text-[#1A1A2E]" : "text-[#1A1A2E]/60"
              }`}
            >
              Yearly <span className="ml-1 text-[#10B981]">−27%</span>
            </button>
          </div>
        </div>

        <div className={`grid gap-6 ${plans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 max-w-3xl mx-auto"}`}>
          {plans.map((p) => <PriceCard key={p.name} plan={p} source="pricing" />)}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-[#F8FAFC]">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">Frequently asked questions</h2>
        <div className="max-w-3xl mx-auto">
          <FAQItem
            q="Is my baby's data private and safe?"
            a="Absolutely. Your data is encrypted, stored securely, and never sold. We're fully GDPR compliant. Read our privacy policy for full details."
          />
          <FAQItem
            q="Can I cancel anytime?"
            a="Yes. Cancel any time from your account — no questions asked. Your premium features stay active until the end of your billing period."
          />
          <FAQItem
            q="Is SleepyBabyy good for newborns?"
            a="Yes — it's designed for newborns through toddlers. The wake-window guidance automatically adjusts as your baby grows."
          />
          <FAQItem
            q="Can my partner and I both use it?"
            a="Yes. Family Sharing is included on all paid plans. Invite your partner, grandparents, or nanny — everyone stays in sync in real time."
          />
          <FAQItem
            q="What's the difference between the plans?"
            a="Free covers basic tracking. Paid plans unlock unlimited history, family sharing, pediatrician PDF reports, and personalized insights."
          />
          <FAQItem
            q="Do you offer refunds?"
            a="Yes — we offer a 14-day refund on yearly plans, no questions asked. Just email support@sleepybabyy.com."
          />
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="px-5 py-20 sm:py-24" style={{ background: "linear-gradient(135deg, #E8F0FF 0%, #F5E8FF 100%)" }}>
        <div className="mx-auto max-w-3xl text-center">
          <Heart className="h-10 w-10 text-[#4F46E5] mx-auto mb-4" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1A1A2E] mb-4">Ready for better nights?</h2>
          <p className="text-lg text-[#1A1A2E]/70 mb-8">Join 1000+ parents already getting more sleep.</p>
          <CTAButton source="final" className="w-full sm:w-auto" />
          <TrustBadges className="mt-5" />
          <div className="mt-8 flex items-center justify-center gap-5 text-xs text-[#1A1A2E]/60">
            <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> GDPR compliant</span>
            <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Secure payments</span>
            <Link to="/privacy" className="underline hover:text-[#4F46E5]">Privacy policy</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StartFree;

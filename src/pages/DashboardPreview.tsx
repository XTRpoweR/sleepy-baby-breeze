import { Card } from "@/components/ui/card";
import {
  Activity,
  Moon,
  BarChart3,
  Bell,
  Camera,
  Users,
  FileText,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Baby,
  TrendingUp,
  Mail,
  Plus,
  Milk,
  Volume2,
  Menu,
  Bell as BellIcon,
  PlayCircle,
  Zap,
  Clock,
} from "lucide-react";

/**
 * Local-only preview page for the dashboard redesign options — v2.
 * Three modern directions (Bento / Clay / Glass) — open at /dev/dashboard-preview.
 */
const DashboardPreview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Modern dashboard — 3 fresh directions</h1>
          <p className="text-gray-600">
            All include hamburger menu · newsletter button · sounds section · consistent background.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <DirectionWrapper
            title="C-Light Polished ⭐ NEW"
            description="Same as C-Light, but Quick cards now have crafted soft shadows for depth"
          >
            <LiquidGlassLightPolishedMock />
          </DirectionWrapper>

          <DirectionWrapper
            title="C-Light Polished — Variant 2"
            description="Quick cards: subtle colored glow + lift on hover feel"
          >
            <LiquidGlassLightPolishedV2Mock />
          </DirectionWrapper>

          <DirectionWrapper
            title="C-Light (original — for comparison)"
            description="The version you liked, before shadow polish"
          >
            <LiquidGlassLightMock />
          </DirectionWrapper>
        </div>

        <div className="text-center text-gray-600 mt-10 pb-8">
          Tell me which one (A / B / C) and any tweaks. I'll apply it to the real dashboard.
        </div>
      </div>
    </div>
  );
};

const DirectionWrapper = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div className="mx-auto bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ maxWidth: 400 }}>
      <div className="bg-white rounded-[2rem] overflow-hidden" style={{ height: 760 }}>
        <div className="h-full overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  </div>
);

/* ============================================================== */
/* DIRECTION A — BENTO MODERN 2026                                  */
/* ============================================================== */
const BentoModernMock = () => (
  <div className="relative min-h-full pb-6 overflow-hidden">
    {/* Mesh gradient background */}
    <div className="absolute inset-0 bg-white" />
    <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-pink-200/40 blur-3xl" />
    <div className="absolute top-20 right-0 w-64 h-64 rounded-full bg-purple-200/40 blur-3xl" />
    <div className="absolute bottom-40 left-10 w-72 h-72 rounded-full bg-indigo-200/30 blur-3xl" />

    <div className="relative">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center">
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center relative">
            <Mail className="h-4 w-4 text-gray-700" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500" />
          </button>
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center">
            <BellIcon className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 mb-5">
        <p className="text-xs text-gray-500 font-medium mb-1">Wednesday, May 15</p>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight tracking-tight">
          Hi Hema <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">Let's track today.</p>
      </div>

      {/* BENTO GRID */}
      <div className="px-5 grid grid-cols-2 gap-3">
        {/* Hero: Track (span 2) */}
        <div className="col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-5 shadow-xl shadow-purple-500/30">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-pink-300/30 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                <Zap className="h-2.5 w-2.5" />
                Quick
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Track activities</h2>
            <p className="text-white/80 text-xs mb-4">Sleep, feeding, diapers</p>
            <div className="flex items-center gap-3">
              <button className="bg-white hover:bg-purple-50 text-purple-700 rounded-2xl px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-1.5 shadow-md">
                <Plus className="h-4 w-4" />
                Log now
              </button>
              <button className="text-white/90 text-xs inline-flex items-center gap-1">
                Quick log <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile (tall, 1 col) */}
        <div className="row-span-2 bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-3">Profile</p>
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 blur-md opacity-50" />
            <div className="relative h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <Baby className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <p className="text-center font-bold text-gray-900 text-sm">Gh</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <p className="text-[10px] text-gray-500">Active</p>
          </div>
          <button className="w-full mt-3 text-xs font-semibold text-purple-600 inline-flex items-center justify-center gap-1">
            Switch <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Sleep schedule */}
        <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-4 shadow-sm">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl w-9 h-9 flex items-center justify-center mb-2 shadow-md">
            <Moon className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-bold text-gray-900">Schedule</p>
          <p className="text-[10px] text-gray-500">Smart plan</p>
        </div>

        {/* Sounds */}
        <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-4 shadow-sm">
          <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl w-9 h-9 flex items-center justify-center mb-2 shadow-md">
            <Volume2 className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-bold text-gray-900">Sounds</p>
          <p className="text-[10px] text-gray-500">White noise</p>
        </div>

        {/* Premium (span 2) */}
        <div className="col-span-2 relative overflow-hidden rounded-3xl shadow-xl shadow-purple-900/15">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-pink-500/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="relative p-4 flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-xl p-2.5 shadow-md flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">Get Premium</p>
                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-200 bg-white/10 px-1.5 py-0.5 rounded">
                  7 days free
                </span>
              </div>
              <p className="text-[11px] text-purple-200/70 truncate">Unlimited profiles · sharing · reports</p>
            </div>
            <ArrowRight className="h-4 w-4 text-white/70" />
          </div>
        </div>

        {/* Stats row (span 2) */}
        <div className="col-span-2 grid grid-cols-3 gap-3 mt-1">
          <StatTile icon={<Moon className="h-3.5 w-3.5" />} value="0h" label="Sleep" color="text-indigo-600" />
          <StatTile icon={<Milk className="h-3.5 w-3.5" />} value="0" label="Feeds" color="text-emerald-600" />
          <StatTile icon={<Baby className="h-3.5 w-3.5" />} value="0" label="Diapers" color="text-amber-600" />
        </div>

        {/* More features */}
        <div className="col-span-2 bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-4 mt-1">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-3">More features</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { i: BarChart3, l: "Reports", g: "from-rose-400 to-pink-500" },
              { i: Bell, l: "Alerts", g: "from-blue-400 to-indigo-500" },
              { i: Camera, l: "Photos", g: "from-pink-400 to-fuchsia-500" },
              { i: Users, l: "Family", g: "from-emerald-400 to-teal-500" },
            ].map((f, idx) => (
              <button key={idx} className="flex flex-col items-center gap-1.5">
                <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${f.g} flex items-center justify-center shadow-md`}>
                  <f.i className="h-5 w-5 text-white" />
                </div>
                <p className="text-[10px] font-medium text-gray-700">{f.l}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Newsletter pill (span 2) */}
        <div className="col-span-2">
          <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 border border-white/80 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="bg-white rounded-xl p-1.5 shadow-sm">
                <Mail className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-900">Sleep tips by email</p>
                <p className="text-[10px] text-gray-500">Weekly · unsubscribe anytime</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-purple-600" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StatTile = ({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) => (
  <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-3">
    <div className={`flex items-center gap-1 ${color} mb-1`}>{icon}</div>
    <p className="text-lg font-bold text-gray-900">{value}</p>
    <p className="text-[10px] text-gray-500">{label}</p>
  </div>
);

/* ============================================================== */
/* DIRECTION B — CLAYMORPHISM WARM                                  */
/* ============================================================== */
const ClayMock = () => (
  <div className="min-h-full pb-6" style={{ backgroundColor: "#FDF6F0" }}>
    {/* Header */}
    <div className="px-5 pt-6 pb-3 flex items-center justify-between">
      <button
        className="h-11 w-11 rounded-2xl flex items-center justify-center"
        style={{
          background: "#FDF6F0",
          boxShadow: "6px 6px 12px #e8dfd6, -6px -6px 12px #ffffff",
        }}
      >
        <Menu className="h-5 w-5 text-orange-900" />
      </button>
      <div className="flex items-center gap-2">
        <button
          className="h-11 w-11 rounded-2xl flex items-center justify-center"
          style={{
            background: "#FDF6F0",
            boxShadow: "6px 6px 12px #e8dfd6, -6px -6px 12px #ffffff",
          }}
        >
          <Mail className="h-4 w-4 text-orange-900" />
        </button>
        <button
          className="h-11 w-11 rounded-2xl flex items-center justify-center"
          style={{
            background: "#FDF6F0",
            boxShadow: "6px 6px 12px #e8dfd6, -6px -6px 12px #ffffff",
          }}
        >
          <BellIcon className="h-4 w-4 text-orange-900" />
        </button>
      </div>
    </div>

    {/* Greeting + profile in one clay block */}
    <div className="px-5 pb-5 mt-3">
      <div
        className="rounded-3xl p-5 flex items-center gap-4"
        style={{
          background: "#FDF6F0",
          boxShadow: "10px 10px 20px #e8dfd6, -10px -10px 20px #ffffff",
        }}
      >
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #F9C5D5, #C9A0F2)",
            boxShadow: "inset 4px 4px 8px rgba(255,255,255,0.4), inset -4px -4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Baby className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-orange-900/70 uppercase tracking-wider">Welcome</p>
          <h1 className="text-xl font-bold text-orange-950">Hema</h1>
          <p className="text-xs text-orange-900/60 mt-0.5">Profile: Gh · Active</p>
        </div>
      </div>
    </div>

    {/* Premium card — clay style */}
    <div className="px-5 mb-5">
      <div
        className="relative overflow-hidden rounded-3xl p-4"
        style={{
          background: "linear-gradient(135deg, #F9C5D5 0%, #E5BFF0 50%, #C5D1F7 100%)",
          boxShadow: "10px 10px 20px #e8dfd6, -10px -10px 20px #ffffff",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="rounded-2xl p-2.5 flex-shrink-0"
            style={{
              background: "white",
              boxShadow: "inset 3px 3px 6px rgba(255,255,255,0.5), 3px 3px 6px rgba(0,0,0,0.05)",
            }}
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-purple-900">Premium · 7 days free</p>
            <p className="text-[11px] text-purple-900/70 truncate">Unlimited profiles & family sharing</p>
          </div>
          <ArrowRight className="h-4 w-4 text-purple-700" />
        </div>
      </div>
    </div>

    {/* Quick actions row */}
    <div className="px-5 mb-5">
      <p className="text-[11px] uppercase tracking-wider font-bold text-orange-900/60 mb-3">Quick actions</p>
      <div className="grid grid-cols-2 gap-3">
        <ClayActionCard icon={<Activity className="h-6 w-6 text-pink-700" />} title="Track" subtitle="Log activity" iconBg="#F9C5D5" />
        <ClayActionCard icon={<Moon className="h-6 w-6 text-indigo-700" />} title="Sleep" subtitle="Schedule" iconBg="#C5D1F7" />
        <ClayActionCard icon={<Volume2 className="h-6 w-6 text-purple-700" />} title="Sounds" subtitle="White noise" iconBg="#E5BFF0" />
        <ClayActionCard icon={<Clock className="h-6 w-6 text-amber-700" />} title="Quick log" subtitle="Past session" iconBg="#FBD9A8" />
      </div>
    </div>

    {/* Stats — clay */}
    <div className="px-5 mb-5">
      <p className="text-[11px] uppercase tracking-wider font-bold text-orange-900/60 mb-3">This week</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: "Avg Sleep", v: "0h 0m", c: "#C5D1F7" },
          { l: "Feeds", v: "0", c: "#B8E6C7" },
          { l: "Diapers", v: "0", c: "#FBD9A8" },
          { l: "Growth", v: "Steady", c: "#E5BFF0" },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-3xl p-4"
            style={{
              background: "#FDF6F0",
              boxShadow: "6px 6px 12px #e8dfd6, -6px -6px 12px #ffffff",
            }}
          >
            <div className="h-7 w-7 rounded-xl mb-2" style={{ background: s.c }} />
            <p className="text-lg font-bold text-orange-950">{s.v}</p>
            <p className="text-[10px] text-orange-900/60">{s.l}</p>
          </div>
        ))}
      </div>
    </div>

    {/* More features list */}
    <div className="px-5 mb-5">
      <p className="text-[11px] uppercase tracking-wider font-bold text-orange-900/60 mb-3">More</p>
      <div
        className="rounded-3xl p-2"
        style={{
          background: "#FDF6F0",
          boxShadow: "6px 6px 12px #e8dfd6, -6px -6px 12px #ffffff",
        }}
      >
        {[
          { i: BarChart3, l: "Reports", c: "#F9C5D5" },
          { i: Bell, l: "Notifications", c: "#C5D1F7" },
          { i: Camera, l: "Photos", c: "#FBD9A8" },
          { i: Users, l: "Family sharing", c: "#B8E6C7" },
          { i: FileText, l: "Pediatrician", c: "#E5BFF0" },
        ].map((f, idx) => (
          <button key={idx} className="w-full flex items-center gap-3 p-2.5 rounded-2xl">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: f.c, boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.5)" }}
            >
              <f.i className="h-4 w-4 text-gray-800" />
            </div>
            <p className="flex-1 text-sm font-medium text-orange-950 text-left">{f.l}</p>
            <ChevronRight className="h-4 w-4 text-orange-900/40" />
          </button>
        ))}
      </div>
    </div>

    {/* Newsletter clay tile */}
    <div className="px-5">
      <button
        className="w-full rounded-3xl p-4 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #FFE5EC, #F5E1FF)",
          boxShadow: "6px 6px 12px #e8dfd6, -6px -6px 12px #ffffff",
        }}
      >
        <div className="bg-white rounded-2xl p-2.5 shadow-inner">
          <Mail className="h-4 w-4 text-pink-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-orange-950">Get sleep tips</p>
          <p className="text-[11px] text-orange-900/70">Weekly to your inbox</p>
        </div>
        <ArrowRight className="h-4 w-4 text-pink-700" />
      </button>
    </div>
  </div>
);

const ClayActionCard = ({
  icon,
  title,
  subtitle,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconBg: string;
}) => (
  <div
    className="rounded-3xl p-4"
    style={{
      background: "#FDF6F0",
      boxShadow: "8px 8px 16px #e8dfd6, -8px -8px 16px #ffffff",
    }}
  >
    <div
      className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3"
      style={{
        background: iconBg,
        boxShadow: "inset 3px 3px 6px rgba(255,255,255,0.5), inset -3px -3px 6px rgba(0,0,0,0.05)",
      }}
    >
      {icon}
    </div>
    <p className="text-sm font-bold text-orange-950">{title}</p>
    <p className="text-[10px] text-orange-900/60">{subtitle}</p>
  </div>
);

/* ============================================================== */
/* C-LIGHT POLISHED — same as C-Light, Quick cards with crafted shadows */
/* ============================================================== */
const LiquidGlassLightPolishedMock = () => (
  <div className="relative min-h-full pb-6 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50" />
    <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-pink-300/40 blur-3xl" />
    <div className="absolute top-40 right-0 w-80 h-80 rounded-full bg-purple-300/40 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-300/30 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6),transparent_50%)]" />

    <div className="relative">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-center">
            <Menu className="h-5 w-5 text-gray-800" />
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="" className="h-7 w-7 rounded-md" />
            <span className="text-sm font-bold text-gray-900">SleepyBabyy</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-center relative">
            <Mail className="h-4 w-4 text-gray-800" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500" />
          </button>
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-center">
            <BellIcon className="h-4 w-4 text-gray-800" />
          </button>
        </div>
      </div>

      <div className="px-5 mb-5">
        <p className="text-xs text-gray-500 font-medium mb-1">Wednesday, May 15</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Hi <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Hema</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">Let's track today.</p>
      </div>

      {/* Profile glass */}
      <div className="px-5 mb-4">
        <button className="w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 blur-md opacity-50" />
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Baby className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-gray-900">Gh</p>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            </div>
            <p className="text-[11px] text-gray-500">1 profile · Active</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Premium */}
      <div className="px-5 mb-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-60 blur" />
          <div className="relative bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-2.5 shadow-lg shadow-purple-500/30 flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">Get Premium</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded">
                    7 days
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 truncate">Unlimited · sharing · reports</p>
              </div>
              <button className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex-shrink-0 shadow-md">
                Try
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Quick actions — POLISHED with crafted shadows */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">Quick</p>
        <div className="grid grid-cols-2 gap-3">
          <PolishedActionCard icon={<Activity className="h-5 w-5 text-white" />} title="Track" subtitle="Log activity" grad="from-pink-500 to-rose-500" shadowColor="shadow-pink-500/25" />
          <PolishedActionCard icon={<Moon className="h-5 w-5 text-white" />} title="Schedule" subtitle="Sleep plan" grad="from-indigo-500 to-purple-500" shadowColor="shadow-indigo-500/25" />
          <PolishedActionCard icon={<Volume2 className="h-5 w-5 text-white" />} title="Sounds" subtitle="White noise" grad="from-purple-500 to-fuchsia-500" shadowColor="shadow-purple-500/25" />
          <PolishedActionCard icon={<Clock className="h-5 w-5 text-white" />} title="Quick log" subtitle="Past session" grad="from-amber-500 to-orange-500" shadowColor="shadow-amber-500/25" />
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">This week</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "0h", l: "Sleep" },
            { v: "0", l: "Feeds" },
            { v: "0", l: "Diapers" },
            { v: "—", l: "Growth" },
          ].map((s, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-2.5 text-center shadow-sm">
              <p className="text-base font-bold text-gray-900">{s.v}</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* More features */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">More</p>
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl divide-y divide-purple-100/50 shadow-sm">
          {[
            { i: BarChart3, l: "Reports" },
            { i: Bell, l: "Smart notifications" },
            { i: Camera, l: "Photo memories" },
            { i: Users, l: "Family sharing" },
            { i: FileText, l: "Pediatrician reports" },
          ].map((f, idx) => (
            <button key={idx} className="w-full flex items-center gap-3 p-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-purple-100/60 flex items-center justify-center flex-shrink-0">
                <f.i className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <p className="flex-1 text-sm font-medium text-left text-gray-900">{f.l}</p>
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm">
                <Sparkles className="h-2 w-2 text-white" strokeWidth={3} />
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="px-5">
        <button className="w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl p-2 shadow-md flex-shrink-0">
            <Mail className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-900">Sleep tips by email</p>
            <p className="text-[10px] text-gray-500">Weekly · unsubscribe anytime</p>
          </div>
          <ArrowRight className="h-4 w-4 text-purple-600" />
        </button>
      </div>
    </div>
  </div>
);

/**
 * Polished Quick action card — Variant 1:
 * - white tinted glass base
 * - layered shadows: outer soft drop + inner top highlight
 * - colored shadow underneath matching icon for subtle "glow lift"
 */
const PolishedActionCard = ({
  icon,
  title,
  subtitle,
  grad,
  shadowColor,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  grad: string;
  shadowColor: string;
}) => (
  <button
    className={`relative bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-4 text-left transition-all hover:scale-[1.02] shadow-lg ${shadowColor}`}
    style={{
      boxShadow:
        "0 10px 30px -10px rgba(168, 85, 247, 0.15), 0 4px 12px -4px rgba(236, 72, 153, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)",
    }}
  >
    {/* Subtle inner glow at top */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent rounded-t-3xl" />

    <div className={`bg-gradient-to-br ${grad} rounded-xl w-10 h-10 flex items-center justify-center mb-3 shadow-lg`}>
      {icon}
    </div>
    <p className="text-sm font-bold text-gray-900">{title}</p>
    <p className="text-[10px] text-gray-500">{subtitle}</p>
  </button>
);

/* ============================================================== */
/* C-LIGHT POLISHED V2 — colored glow underneath cards              */
/* ============================================================== */
const LiquidGlassLightPolishedV2Mock = () => (
  <div className="relative min-h-full pb-6 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50" />
    <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-pink-300/40 blur-3xl" />
    <div className="absolute top-40 right-0 w-80 h-80 rounded-full bg-purple-300/40 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-300/30 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6),transparent_50%)]" />

    <div className="relative">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-center">
            <Menu className="h-5 w-5 text-gray-800" />
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="" className="h-7 w-7 rounded-md" />
            <span className="text-sm font-bold text-gray-900">SleepyBabyy</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-center relative">
            <Mail className="h-4 w-4 text-gray-800" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500" />
          </button>
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-center">
            <BellIcon className="h-4 w-4 text-gray-800" />
          </button>
        </div>
      </div>

      <div className="px-5 mb-5">
        <p className="text-xs text-gray-500 font-medium mb-1">Wednesday, May 15</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Hi <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Hema</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">Let's track today.</p>
      </div>

      {/* Profile */}
      <div className="px-5 mb-4">
        <button className="w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Baby className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm text-gray-900">Gh</p>
            <p className="text-[11px] text-gray-500">1 profile · Active</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Premium */}
      <div className="px-5 mb-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-60 blur" />
          <div className="relative bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-2.5 shadow-lg flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">Get Premium</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded">
                    7 days
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 truncate">Unlimited · sharing · reports</p>
              </div>
              <button className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex-shrink-0 shadow-md">
                Try
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Quick — V2 with colored glow underneath */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">Quick</p>
        <div className="grid grid-cols-2 gap-3">
          <PolishedActionCardV2 icon={<Activity className="h-5 w-5 text-white" />} title="Track" subtitle="Log activity" grad="from-pink-500 to-rose-500" glowColor="bg-pink-400/40" />
          <PolishedActionCardV2 icon={<Moon className="h-5 w-5 text-white" />} title="Schedule" subtitle="Sleep plan" grad="from-indigo-500 to-purple-500" glowColor="bg-indigo-400/40" />
          <PolishedActionCardV2 icon={<Volume2 className="h-5 w-5 text-white" />} title="Sounds" subtitle="White noise" grad="from-purple-500 to-fuchsia-500" glowColor="bg-purple-400/40" />
          <PolishedActionCardV2 icon={<Clock className="h-5 w-5 text-white" />} title="Quick log" subtitle="Past session" grad="from-amber-500 to-orange-500" glowColor="bg-amber-400/40" />
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">This week</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "0h", l: "Sleep" },
            { v: "0", l: "Feeds" },
            { v: "0", l: "Diapers" },
            { v: "—", l: "Growth" },
          ].map((s, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-2.5 text-center shadow-sm">
              <p className="text-base font-bold text-gray-900">{s.v}</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* More */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">More</p>
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl divide-y divide-purple-100/50 shadow-sm">
          {[
            { i: BarChart3, l: "Reports" },
            { i: Bell, l: "Smart notifications" },
            { i: Camera, l: "Photo memories" },
            { i: Users, l: "Family sharing" },
            { i: FileText, l: "Pediatrician reports" },
          ].map((f, idx) => (
            <button key={idx} className="w-full flex items-center gap-3 p-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-purple-100/60 flex items-center justify-center flex-shrink-0">
                <f.i className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <p className="flex-1 text-sm font-medium text-left text-gray-900">{f.l}</p>
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm">
                <Sparkles className="h-2 w-2 text-white" strokeWidth={3} />
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="px-5">
        <button className="w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl p-2 shadow-md flex-shrink-0">
            <Mail className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-900">Sleep tips by email</p>
            <p className="text-[10px] text-gray-500">Weekly · unsubscribe anytime</p>
          </div>
          <ArrowRight className="h-4 w-4 text-purple-600" />
        </button>
      </div>
    </div>
  </div>
);

/**
 * Polished card V2:
 * - Soft colored glow blob underneath card (matching icon)
 * - White glass card on top
 * - Visible "lift" effect — card seems to float
 */
const PolishedActionCardV2 = ({
  icon,
  title,
  subtitle,
  grad,
  glowColor,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  grad: string;
  glowColor: string;
}) => (
  <div className="relative">
    {/* Colored glow underneath */}
    <div className={`absolute -bottom-2 left-3 right-3 h-12 ${glowColor} blur-2xl rounded-full opacity-70`} />
    <button className="relative w-full bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-4 text-left shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className={`bg-gradient-to-br ${grad} rounded-xl w-10 h-10 flex items-center justify-center mb-3 shadow-lg`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-900">{title}</p>
      <p className="text-[10px] text-gray-500">{subtitle}</p>
    </button>
  </div>
);

/* ============================================================== */
/* C-LIGHT REFINED — same icons, tinted translucent card bg         */
/* ============================================================== */
const LiquidGlassLightRefinedMock = () => (
  <div className="relative min-h-full pb-6 overflow-hidden">
    {/* Same light gradient mesh as C-Light */}
    <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50" />
    <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-pink-300/40 blur-3xl" />
    <div className="absolute top-40 right-0 w-80 h-80 rounded-full bg-purple-300/40 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-300/30 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.5),transparent_50%)]" />

    <div className="relative">
      {/* Header with logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/50 shadow-sm flex items-center justify-center">
            <Menu className="h-5 w-5 text-gray-800" />
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="" className="h-7 w-7 rounded-md" />
            <span className="text-sm font-bold text-gray-900">SleepyBabyy</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/50 shadow-sm flex items-center justify-center relative">
            <Mail className="h-4 w-4 text-gray-800" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500" />
          </button>
          <button className="h-10 w-10 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/50 shadow-sm flex items-center justify-center">
            <BellIcon className="h-4 w-4 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 mb-5">
        <p className="text-xs text-gray-500 font-medium mb-1">Wednesday, May 15</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Hi <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Hema</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">Let's track today.</p>
      </div>

      {/* Profile glass — tinted pink */}
      <div className="px-5 mb-4">
        <button className="w-full bg-pink-100/30 backdrop-blur-xl border border-white/50 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 blur-md opacity-50" />
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Baby className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-gray-900">Gh</p>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            </div>
            <p className="text-[11px] text-gray-600">1 profile · Active</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Premium — glowing tinted glass */}
      <div className="px-5 mb-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-50 blur" />
          <div className="relative bg-purple-100/40 backdrop-blur-xl border border-white/60 rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-2.5 shadow-lg shadow-purple-500/30 flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">Get Premium</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded">
                    7 days
                  </span>
                </div>
                <p className="text-[11px] text-gray-700 truncate">Unlimited · sharing · reports</p>
              </div>
              <button className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex-shrink-0 shadow-md">
                Try
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions — tinted glass per card */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">Quick</p>
        <div className="grid grid-cols-2 gap-3">
          <GlassActionTinted
            icon={<Activity className="h-5 w-5 text-white" />}
            title="Track"
            subtitle="Log activity"
            iconGrad="from-pink-500 to-rose-500"
            tint="bg-pink-100/40"
          />
          <GlassActionTinted
            icon={<Moon className="h-5 w-5 text-white" />}
            title="Schedule"
            subtitle="Sleep plan"
            iconGrad="from-indigo-500 to-purple-500"
            tint="bg-indigo-100/40"
          />
          <GlassActionTinted
            icon={<Volume2 className="h-5 w-5 text-white" />}
            title="Sounds"
            subtitle="White noise"
            iconGrad="from-purple-500 to-fuchsia-500"
            tint="bg-purple-100/40"
          />
          <GlassActionTinted
            icon={<Clock className="h-5 w-5 text-white" />}
            title="Quick log"
            subtitle="Past session"
            iconGrad="from-amber-500 to-orange-500"
            tint="bg-amber-100/40"
          />
        </div>
      </div>

      {/* Stats — tinted tiles */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">This week</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "0h", l: "Sleep", tint: "bg-indigo-100/40" },
            { v: "0", l: "Feeds", tint: "bg-emerald-100/40" },
            { v: "0", l: "Diapers", tint: "bg-amber-100/40" },
            { v: "—", l: "Growth", tint: "bg-purple-100/40" },
          ].map((s, i) => (
            <div key={i} className={`${s.tint} backdrop-blur-xl border border-white/50 rounded-2xl p-2.5 text-center shadow-sm`}>
              <p className="text-base font-bold text-gray-900">{s.v}</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* More features — list with tinted bg */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">More</p>
        <div className="bg-purple-50/40 backdrop-blur-xl border border-white/50 rounded-3xl divide-y divide-purple-100/40 shadow-sm">
          {[
            { i: BarChart3, l: "Reports", color: "text-rose-600", bg: "bg-rose-100/60" },
            { i: Bell, l: "Smart notifications", color: "text-indigo-600", bg: "bg-indigo-100/60" },
            { i: Camera, l: "Photo memories", color: "text-pink-600", bg: "bg-pink-100/60" },
            { i: Users, l: "Family sharing", color: "text-emerald-600", bg: "bg-emerald-100/60" },
            { i: FileText, l: "Pediatrician reports", color: "text-purple-600", bg: "bg-purple-100/60" },
          ].map((f, idx) => (
            <button key={idx} className="w-full flex items-center gap-3 p-3">
              <div className={`h-8 w-8 rounded-xl ${f.bg} border border-white/60 flex items-center justify-center flex-shrink-0`}>
                <f.i className={`h-3.5 w-3.5 ${f.color}`} />
              </div>
              <p className="flex-1 text-sm font-medium text-left text-gray-900">{f.l}</p>
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm">
                <Sparkles className="h-2 w-2 text-white" strokeWidth={3} />
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter — tinted pink */}
      <div className="px-5">
        <button className="w-full bg-pink-100/40 backdrop-blur-xl border border-white/50 rounded-3xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl p-2 shadow-md flex-shrink-0">
            <Mail className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-900">Sleep tips by email</p>
            <p className="text-[10px] text-gray-600">Weekly · unsubscribe anytime</p>
          </div>
          <ArrowRight className="h-4 w-4 text-purple-600" />
        </button>
      </div>
    </div>
  </div>
);

const GlassActionTinted = ({
  icon,
  title,
  subtitle,
  iconGrad,
  tint,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconGrad: string;
  tint: string;
}) => (
  <button className={`${tint} backdrop-blur-xl border border-white/50 rounded-3xl p-4 text-left shadow-sm hover:bg-white/40 transition-colors`}>
    <div className={`bg-gradient-to-br ${iconGrad} rounded-xl w-10 h-10 flex items-center justify-center mb-3 shadow-md`}>{icon}</div>
    <p className="text-sm font-bold text-gray-900">{title}</p>
    <p className="text-[10px] text-gray-600">{subtitle}</p>
  </button>
);

/* ============================================================== */
/* C-LIGHT — LIQUID GLASS LIGHT (recommended)                       */
/* ============================================================== */
const LiquidGlassLightMock = () => (
  <div className="relative min-h-full pb-6 overflow-hidden">
    {/* Light gradient mesh */}
    <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50" />
    <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-pink-300/40 blur-3xl" />
    <div className="absolute top-40 right-0 w-80 h-80 rounded-full bg-purple-300/40 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-300/30 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6),transparent_50%)]" />

    <div className="relative">
      {/* Header with logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-center">
            <Menu className="h-5 w-5 text-gray-800" />
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="" className="h-7 w-7 rounded-md" />
            <span className="text-sm font-bold text-gray-900">SleepyBabyy</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-center relative">
            <Mail className="h-4 w-4 text-gray-800" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500" />
          </button>
          <button className="h-10 w-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-center">
            <BellIcon className="h-4 w-4 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 mb-5">
        <p className="text-xs text-gray-500 font-medium mb-1">Wednesday, May 15</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Hi <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Hema</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">Let's track today.</p>
      </div>

      {/* Profile glass card */}
      <div className="px-5 mb-4">
        <button className="w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 blur-md opacity-50" />
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Baby className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-gray-900">Gh</p>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            </div>
            <p className="text-[11px] text-gray-500">1 profile · Active</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Premium — glowing glass */}
      <div className="px-5 mb-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-60 blur" />
          <div className="relative bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-2.5 shadow-lg shadow-purple-500/30 flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">Get Premium</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded">
                    7 days
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 truncate">Unlimited · sharing · reports</p>
              </div>
              <button className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex-shrink-0 shadow-md">
                Try
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">Quick</p>
        <div className="grid grid-cols-2 gap-3">
          <GlassActionLight icon={<Activity className="h-5 w-5 text-white" />} title="Track" subtitle="Log activity" grad="from-pink-500 to-rose-500" />
          <GlassActionLight icon={<Moon className="h-5 w-5 text-white" />} title="Schedule" subtitle="Sleep plan" grad="from-indigo-500 to-purple-500" />
          <GlassActionLight icon={<Volume2 className="h-5 w-5 text-white" />} title="Sounds" subtitle="White noise" grad="from-purple-500 to-fuchsia-500" />
          <GlassActionLight icon={<Clock className="h-5 w-5 text-white" />} title="Quick log" subtitle="Past session" grad="from-amber-500 to-orange-500" />
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">This week</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "0h", l: "Sleep" },
            { v: "0", l: "Feeds" },
            { v: "0", l: "Diapers" },
            { v: "—", l: "Growth" },
          ].map((s, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-2.5 text-center shadow-sm">
              <p className="text-base font-bold text-gray-900">{s.v}</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* More features */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">More</p>
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl divide-y divide-purple-100/50 shadow-sm">
          {[
            { i: BarChart3, l: "Reports" },
            { i: Bell, l: "Smart notifications" },
            { i: Camera, l: "Photo memories" },
            { i: Users, l: "Family sharing" },
            { i: FileText, l: "Pediatrician reports" },
          ].map((f, idx) => (
            <button key={idx} className="w-full flex items-center gap-3 p-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-purple-100/60 flex items-center justify-center flex-shrink-0">
                <f.i className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <p className="flex-1 text-sm font-medium text-left text-gray-900">{f.l}</p>
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm">
                <Sparkles className="h-2 w-2 text-white" strokeWidth={3} />
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="px-5">
        <button className="w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl p-2 shadow-md flex-shrink-0">
            <Mail className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-900">Sleep tips by email</p>
            <p className="text-[10px] text-gray-500">Weekly · unsubscribe anytime</p>
          </div>
          <ArrowRight className="h-4 w-4 text-purple-600" />
        </button>
      </div>
    </div>
  </div>
);

const GlassActionLight = ({
  icon,
  title,
  subtitle,
  grad,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  grad: string;
}) => (
  <button className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 text-left shadow-sm hover:bg-white/85 transition-colors">
    <div className={`bg-gradient-to-br ${grad} rounded-xl w-10 h-10 flex items-center justify-center mb-3 shadow-md`}>{icon}</div>
    <p className="text-sm font-bold text-gray-900">{title}</p>
    <p className="text-[10px] text-gray-500">{subtitle}</p>
  </button>
);

/* ============================================================== */
/* C-TWILIGHT — LIQUID GLASS TWILIGHT (mid-tone purple)             */
/* ============================================================== */
const LiquidGlassTwilightMock = () => (
  <div className="relative min-h-full pb-6 overflow-hidden text-white">
    {/* Twilight gradient — mid purple/lavender */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500" />
    <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-pink-400/40 blur-3xl" />
    <div className="absolute top-40 right-0 w-80 h-80 rounded-full bg-fuchsia-400/30 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-400/40 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.2),transparent_60%)]" />

    <div className="relative">
      {/* Header with logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center">
            <Menu className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="" className="h-7 w-7 rounded-md" />
            <span className="text-sm font-bold text-white">SleepyBabyy</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center relative">
            <Mail className="h-4 w-4 text-white" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-300" />
          </button>
          <button className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center">
            <BellIcon className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 mb-5">
        <p className="text-xs text-purple-100/80 font-medium mb-1">Wednesday, May 15</p>
        <h1 className="text-3xl font-bold tracking-tight">
          Hi <span className="bg-gradient-to-r from-pink-200 via-white to-indigo-200 bg-clip-text text-transparent">Hema</span>
        </h1>
        <p className="text-sm text-purple-100/80 mt-1">Let's track today.</p>
      </div>

      {/* Profile glass */}
      <div className="px-5 mb-4">
        <button className="w-full bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Baby className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">Gh</p>
            <p className="text-[11px] text-purple-100/70">1 profile · Active</p>
          </div>
          <ChevronRight className="h-4 w-4 text-purple-100/70" />
        </button>
      </div>

      {/* Premium */}
      <div className="px-5 mb-4">
        <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-4 flex items-center gap-3">
          <div className="bg-white rounded-2xl p-2.5 shadow-lg flex-shrink-0">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Get Premium · 7 days free</p>
            <p className="text-[11px] text-purple-100/70 truncate">Unlimited · sharing · reports</p>
          </div>
          <button className="bg-white text-purple-700 rounded-xl px-3 py-1.5 text-xs font-bold flex-shrink-0 shadow">
            Try
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-purple-100/70 mb-3">Quick</p>
        <div className="grid grid-cols-2 gap-3">
          <GlassActionTwilight icon={<Activity className="h-5 w-5 text-white" />} title="Track" subtitle="Log activity" grad="from-pink-400 to-rose-500" />
          <GlassActionTwilight icon={<Moon className="h-5 w-5 text-white" />} title="Schedule" subtitle="Sleep plan" grad="from-indigo-400 to-blue-500" />
          <GlassActionTwilight icon={<Volume2 className="h-5 w-5 text-white" />} title="Sounds" subtitle="White noise" grad="from-fuchsia-400 to-purple-500" />
          <GlassActionTwilight icon={<Clock className="h-5 w-5 text-white" />} title="Quick log" subtitle="Past session" grad="from-amber-400 to-orange-500" />
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-purple-100/70 mb-3">This week</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "0h", l: "Sleep" },
            { v: "0", l: "Feeds" },
            { v: "0", l: "Diapers" },
            { v: "—", l: "Growth" },
          ].map((s, i) => (
            <div key={i} className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-2.5 text-center">
              <p className="text-base font-bold">{s.v}</p>
              <p className="text-[9px] text-purple-100/70 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* More features */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-purple-100/70 mb-3">More</p>
        <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl divide-y divide-white/10">
          {[
            { i: BarChart3, l: "Reports" },
            { i: Bell, l: "Smart notifications" },
            { i: Camera, l: "Photo memories" },
            { i: Users, l: "Family sharing" },
            { i: FileText, l: "Pediatrician reports" },
          ].map((f, idx) => (
            <button key={idx} className="w-full flex items-center gap-3 p-3">
              <div className="h-8 w-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
                <f.i className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="flex-1 text-sm font-medium text-left">{f.l}</p>
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500">
                <Sparkles className="h-2 w-2 text-white" strokeWidth={3} />
              </span>
              <ChevronRight className="h-4 w-4 text-purple-100/50 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="px-5">
        <button className="w-full bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-3.5 flex items-center gap-3">
          <div className="bg-white rounded-xl p-2 shadow-md flex-shrink-0">
            <Mail className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold">Sleep tips by email</p>
            <p className="text-[10px] text-purple-100/70">Weekly · unsubscribe anytime</p>
          </div>
          <ArrowRight className="h-4 w-4 text-purple-100/70" />
        </button>
      </div>
    </div>
  </div>
);

const GlassActionTwilight = ({
  icon,
  title,
  subtitle,
  grad,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  grad: string;
}) => (
  <button className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-4 text-left">
    <div className={`bg-gradient-to-br ${grad} rounded-xl w-10 h-10 flex items-center justify-center mb-3 shadow-md`}>{icon}</div>
    <p className="text-sm font-bold text-white">{title}</p>
    <p className="text-[10px] text-purple-100/70">{subtitle}</p>
  </button>
);

/* ============================================================== */
/* DIRECTION C — LIQUID GLASS (visionOS-like, dark original)         */
/* ============================================================== */
const LiquidGlassMock = () => (
  <div className="relative min-h-full pb-6 overflow-hidden text-white">
    {/* Dark gradient mesh */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950" />
    <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-pink-500/30 blur-3xl" />
    <div className="absolute top-40 right-0 w-80 h-80 rounded-full bg-purple-500/30 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-500/30 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_50%)]" />

    <div className="relative">
      {/* Header with logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
            <Menu className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="" className="h-7 w-7 rounded-md" />
            <span className="text-sm font-bold text-white">SleepyBabyy</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center relative">
            <Mail className="h-4 w-4 text-white" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-400" />
          </button>
          <button className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
            <BellIcon className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 mb-5">
        <p className="text-xs text-purple-200/70 font-medium mb-1">Wednesday, May 15</p>
        <h1 className="text-3xl font-bold tracking-tight">
          Hi <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">Hema</span>
        </h1>
        <p className="text-sm text-purple-200/70 mt-1">Let's track today.</p>
      </div>

      {/* Profile glass card */}
      <div className="px-5 mb-4">
        <button className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex items-center gap-3 shadow-2xl shadow-purple-900/30">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 blur-md opacity-60" />
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Baby className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm">Gh</p>
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-glow" />
            </div>
            <p className="text-[11px] text-purple-200/60">1 profile · Active</p>
          </div>
          <ChevronRight className="h-4 w-4 text-purple-200/60" />
        </button>
      </div>

      {/* Premium — glowing glass */}
      <div className="px-5 mb-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-50 blur" />
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-2.5 shadow-lg flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">Get Premium</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                    7 days
                  </span>
                </div>
                <p className="text-[11px] text-purple-200/70 truncate">Unlimited · sharing · reports</p>
              </div>
              <button className="bg-white text-purple-900 rounded-xl px-3 py-1.5 text-xs font-bold flex-shrink-0">
                Try
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions — 2 col */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-purple-200/60 mb-3">Quick</p>
        <div className="grid grid-cols-2 gap-3">
          <GlassAction icon={<Activity className="h-5 w-5 text-white" />} title="Track" subtitle="Log activity" grad="from-pink-500 to-rose-500" />
          <GlassAction icon={<Moon className="h-5 w-5 text-white" />} title="Schedule" subtitle="Sleep plan" grad="from-indigo-500 to-purple-500" />
          <GlassAction icon={<Volume2 className="h-5 w-5 text-white" />} title="Sounds" subtitle="White noise" grad="from-purple-500 to-fuchsia-500" />
          <GlassAction icon={<Clock className="h-5 w-5 text-white" />} title="Quick log" subtitle="Past session" grad="from-amber-500 to-orange-500" />
        </div>
      </div>

      {/* Stats — glass tiles */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-purple-200/60 mb-3">This week</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "0h", l: "Sleep" },
            { v: "0", l: "Feeds" },
            { v: "0", l: "Diapers" },
            { v: "—", l: "Growth" },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2.5 text-center">
              <p className="text-base font-bold">{s.v}</p>
              <p className="text-[9px] text-purple-200/60 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* More features */}
      <div className="px-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-purple-200/60 mb-3">More</p>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl divide-y divide-white/10">
          {[
            { i: BarChart3, l: "Reports" },
            { i: Bell, l: "Smart notifications" },
            { i: Camera, l: "Photo memories" },
            { i: Users, l: "Family sharing" },
            { i: FileText, l: "Pediatrician reports" },
          ].map((f, idx) => (
            <button key={idx} className="w-full flex items-center gap-3 p-3">
              <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <f.i className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="flex-1 text-sm font-medium text-left">{f.l}</p>
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500">
                <Sparkles className="h-2 w-2 text-white" strokeWidth={3} />
              </span>
              <ChevronRight className="h-4 w-4 text-purple-200/40 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="px-5">
        <button className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-3.5 flex items-center gap-3">
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl p-2 shadow-md flex-shrink-0">
            <Mail className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold">Sleep tips by email</p>
            <p className="text-[10px] text-purple-200/60">Weekly · unsubscribe anytime</p>
          </div>
          <ArrowRight className="h-4 w-4 text-purple-200/70" />
        </button>
      </div>
    </div>
  </div>
);

const GlassAction = ({
  icon,
  title,
  subtitle,
  grad,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  grad: string;
}) => (
  <button className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 text-left hover:bg-white/15 transition-colors">
    <div className={`bg-gradient-to-br ${grad} rounded-xl w-10 h-10 flex items-center justify-center mb-3 shadow-lg`}>{icon}</div>
    <p className="text-sm font-bold">{title}</p>
    <p className="text-[10px] text-purple-200/60">{subtitle}</p>
  </button>
);

export default DashboardPreview;

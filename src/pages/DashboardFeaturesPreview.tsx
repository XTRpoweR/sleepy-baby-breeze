import React, { useState } from 'react';
import {
  Sparkles, TrendingUp, TrendingDown, Moon, Sun, Clock, Bell, Milk,
  ArrowUpRight, ArrowDownRight, Zap, Activity, Calendar, ChevronRight,
  Lightbulb, BarChart3, Heart, Star,
} from 'lucide-react';

/**
 * /dev/dashboard-features-preview
 * Visual previews of 5 new dashboard widgets/features.
 * A — Smart Insight Card
 * B — Weekly Sleep Sparkline
 * C — Next Up Reminder
 * D — Dark Mode preview
 * E — Compare Mode (week vs week)
 */

// ---------- Mock data ----------
const sleepDays = [7.2, 8.1, 6.9, 9.0, 8.4, 7.8, 9.2]; // last 7 days hours
const sleepDayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const DashboardFeaturesPreview = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen py-10 px-4 transition-colors ${darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Dashboard — New Feature Mockups
          </h1>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} max-w-2xl mx-auto`}>
            Five new widgets to enhance the dashboard. Pick which ones to implement.
          </p>
        </div>

        <div className="space-y-16">
          <FeatureSection
            tag="A"
            title="Smart Insight Card"
            description="Daily AI-driven tip at the top of the dashboard. Uses last 7 days to surface one actionable insight."
            darkMode={darkMode}
          >
            <SmartInsightCard darkMode={darkMode} />
          </FeatureSection>

          <FeatureSection
            tag="B"
            title="Weekly Sleep Sparkline"
            description="Mini chart embedded in the Weekly Insights cards — see the pattern at a glance, not just numbers."
            darkMode={darkMode}
          >
            <SparklineCard darkMode={darkMode} />
          </FeatureSection>

          <FeatureSection
            tag="C"
            title="Next Up Reminder"
            description="Shows the next predicted event (feed, nap, bedtime) with countdown."
            darkMode={darkMode}
          >
            <NextUpCard darkMode={darkMode} />
          </FeatureSection>

          <FeatureSection
            tag="D"
            title="Dark Mode"
            description="Toggle for night use — won't blast bright light when checking on the baby."
            darkMode={darkMode}
          >
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg transition-all ${
                  darkMode
                    ? 'bg-slate-800 text-yellow-300 hover:bg-slate-700'
                    : 'bg-white text-purple-600 hover:bg-purple-50'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">
                  {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </span>
              </button>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Click to preview the whole page in {darkMode ? 'light' : 'dark'} mode.
              </p>
            </div>
          </FeatureSection>

          <FeatureSection
            tag="E"
            title="Compare Mode — This Week vs Last Week"
            description="At-a-glance progress: are things improving or getting worse?"
            darkMode={darkMode}
          >
            <CompareCard darkMode={darkMode} />
          </FeatureSection>
        </div>

        {/* Footer note */}
        <div className={`mt-16 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
          Tell me which mockups (A, B, C, D, E) to implement. You can pick one, several, or all of them.
        </div>
      </div>
    </div>
  );
};

// ---------- Section wrapper ----------
const FeatureSection: React.FC<{
  tag: string;
  title: string;
  description: string;
  children: React.ReactNode;
  darkMode: boolean;
}> = ({ tag, title, description, children, darkMode }) => (
  <section>
    <div className="flex items-start gap-4 mb-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
        darkMode
          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
          : 'bg-gradient-to-br from-pink-400 to-purple-500 text-white'
      }`}>
        {tag}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">{title}</h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
      </div>
    </div>
    <div className={`p-6 md:p-8 rounded-3xl border ${
      darkMode
        ? 'bg-slate-900/60 border-slate-800'
        : 'bg-white/70 border-white/80 backdrop-blur-sm'
    }`}>
      {children}
    </div>
  </section>
);

// ---------- A: Smart Insight Card ----------
const SmartInsightCard: React.FC<{ darkMode: boolean }> = ({ darkMode }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 ${
    darkMode
      ? 'bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-purple-900/40 border border-purple-700/30'
      : 'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 border border-purple-200/50'
  }`}>
    <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl" />
    <div className="relative flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
        <Lightbulb className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
            Daily Insight
          </span>
          <Sparkles className={`w-3.5 h-3.5 ${darkMode ? 'text-purple-300' : 'text-purple-500'}`} />
        </div>
        <p className={`text-base md:text-lg font-medium leading-relaxed ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          Emma slept <span className="font-bold">9 hours</span> last night —{' '}
          <span className="text-green-500 font-bold">45 min above</span> her weekly average.
          Keep bedtime around <span className="font-bold">7:30 PM</span> for consistency.
        </p>
        <div className="flex items-center gap-1 mt-3">
          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Based on the last 7 days</span>
          <ChevronRight className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
        </div>
      </div>
    </div>
  </div>
);

// ---------- B: Sparkline Card ----------
const SparklineCard: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const max = Math.max(...sleepDays);
  const min = Math.min(...sleepDays);
  const range = max - min || 1;
  const W = 280;
  const H = 60;
  const stepX = W / (sleepDays.length - 1);

  const points = sleepDays.map((v, i) => {
    const x = i * stepX;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M0,${H} L${points.split(' ').join(' L')} L${W},${H} Z`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card 1 — with sparkline */}
      <div className={`rounded-2xl p-5 ${
        darkMode
          ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-700/30'
          : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon className={`w-5 h-5 ${darkMode ? 'text-indigo-300' : 'text-indigo-500'}`} />
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Sleep</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'
          }`}>
            ↑ 12%
          </span>
        </div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>8.1</span>
          <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>hrs avg</span>
        </div>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={darkMode ? '#a78bfa' : '#8b5cf6'} stopOpacity="0.4" />
              <stop offset="100%" stopColor={darkMode ? '#a78bfa' : '#8b5cf6'} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#sparkGrad)" />
          <polyline
            points={points}
            fill="none"
            stroke={darkMode ? '#c4b5fd' : '#8b5cf6'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {sleepDays.map((v, i) => {
            const x = i * stepX;
            const y = H - ((v - min) / range) * H;
            return (
              <circle key={i} cx={x} cy={y} r="2.5"
                fill={darkMode ? '#c4b5fd' : '#8b5cf6'} />
            );
          })}
        </svg>
        <div className="flex justify-between mt-1">
          {sleepDayLabels.map((d, i) => (
            <span key={i} className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d}</span>
          ))}
        </div>
      </div>

      {/* Card 2 — same idea, feedings */}
      <div className={`rounded-2xl p-5 ${
        darkMode
          ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-700/30'
          : 'bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Milk className={`w-5 h-5 ${darkMode ? 'text-pink-300' : 'text-pink-500'}`} />
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Feedings</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            darkMode ? 'bg-rose-900/40 text-rose-300' : 'bg-rose-100 text-rose-700'
          }`}>
            ↓ 5%
          </span>
        </div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>6.4</span>
          <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>per day</span>
        </div>
        <FeedingSpark darkMode={darkMode} />
      </div>
    </div>
  );
};

const FeedingSpark: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const data = [6, 7, 5, 8, 6, 7, 5];
  const W = 280;
  const H = 60;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = W / (data.length - 1);
  const points = data.map((v, i) => `${i * stepX},${H - ((v - min) / range) * H}`).join(' ');
  return (
    <>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={darkMode ? '#f9a8d4' : '#ec4899'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex justify-between mt-1">
        {sleepDayLabels.map((d, i) => (
          <span key={i} className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d}</span>
        ))}
      </div>
    </>
  );
};

// ---------- C: Next Up Reminder ----------
const NextUpCard: React.FC<{ darkMode: boolean }> = ({ darkMode }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 ${
    darkMode
      ? 'bg-gradient-to-r from-orange-900/40 to-amber-900/40 border border-orange-700/30'
      : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100'
  }`}>
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Milk className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
            Next Up
          </div>
          <div className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Feeding time in 23 minutes
          </div>
          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Predicted at 2:45 PM · based on Emma's pattern
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
          darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'
        } border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          Snooze
        </button>
        <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30">
          Log now
        </button>
      </div>
    </div>
    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700/50' : 'border-orange-200/50'} flex gap-6 text-sm`}>
      <div className="flex items-center gap-2">
        <Moon className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Nap at 4:00 PM</span>
      </div>
      <div className="flex items-center gap-2">
        <Star className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Bedtime at 7:30 PM</span>
      </div>
    </div>
  </div>
);

// ---------- E: Compare Card ----------
const CompareCard: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const compareData = [
    { label: 'Sleep', thisWk: '8.1 hrs', lastWk: '7.3 hrs', delta: '+12%', positive: true, icon: Moon, color: 'indigo' },
    { label: 'Feedings', thisWk: '6.4 / day', lastWk: '6.7 / day', delta: '-5%', positive: false, icon: Milk, color: 'pink' },
    { label: 'Diapers', thisWk: '8.2 / day', lastWk: '7.9 / day', delta: '+4%', positive: true, icon: Activity, color: 'amber' },
    { label: 'Naps', thisWk: '3.1 / day', lastWk: '2.8 / day', delta: '+11%', positive: true, icon: Sun, color: 'orange' },
  ];

  return (
    <div className={`rounded-2xl overflow-hidden ${
      darkMode
        ? 'bg-slate-900/60 border border-slate-800'
        : 'bg-white border border-slate-100'
    }`}>
      <div className={`px-5 py-4 flex items-center justify-between border-b ${
        darkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <BarChart3 className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            This Week vs Last Week
          </h3>
        </div>
        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Last 14 days</span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {compareData.map((row, i) => {
          const Icon = row.icon;
          return (
            <div key={i} className={`px-5 py-4 flex items-center justify-between ${darkMode ? 'border-slate-800' : ''} ${i > 0 ? (darkMode ? 'border-t border-slate-800' : 'border-t border-slate-100') : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  darkMode ? 'bg-slate-800' : `bg-${row.color}-50`
                }`}>
                  <Icon className={`w-5 h-5 ${darkMode ? `text-${row.color}-300` : `text-${row.color}-500`}`} />
                </div>
                <div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{row.label}</div>
                  <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>was {row.lastWk}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{row.thisWk}</div>
                <div className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${
                  row.positive ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-rose-400' : 'text-rose-600')
                }`}>
                  {row.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {row.delta}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardFeaturesPreview;

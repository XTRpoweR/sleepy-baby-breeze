const steps = [
  {
    n: "01",
    emoji: "📱",
    title: "Track in seconds",
    desc: "Tap to log sleep, feeds, diapers. No forms, no friction.",
  },
  {
    n: "02",
    emoji: "🧠",
    title: "AI finds patterns",
    desc: "SmartSleep™ analyzes your baby's unique rhythm in days.",
  },
  {
    n: "03",
    emoji: "🌙",
    title: "Sleep better tonight",
    desc: "Get personalized predictions and routines that actually work.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 px-3 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50/40 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 mb-4">
            <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">How it works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Three steps to <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">peaceful nights</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <span className="text-3xl font-black text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text opacity-30">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 z-10 text-2xl text-indigo-300">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

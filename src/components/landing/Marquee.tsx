export const Marquee = () => {
  const items = [
    '⭐ "Life-changing"',
    "🏆 #1 Sleep Tracker 2026",
    "💜 Pediatrician recommended",
    "🌙 1,247+ families this month",
    "✨ 4.9 rating from parents",
    "🛡️ 14-day money-back guarantee",
  ];
  const loop = [...items, ...items, ...items];
  return (
    <section
      aria-label="Trust marquee"
      className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-fuchsia-50 border-y border-purple-100 overflow-hidden"
    >
      <div className="marquee-mask overflow-hidden">
        <div className="marquee gap-10 py-3">
          {loop.map((t, i) => (
            <div
              key={i}
              className="text-sm sm:text-base font-semibold text-gray-700 whitespace-nowrap flex items-center gap-3"
            >
              <span>{t}</span>
              <span className="text-purple-300">•</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Marquee;

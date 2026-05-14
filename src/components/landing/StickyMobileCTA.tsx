import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const StickyMobileCTA = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 600;
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 400;
      setShow(scrolled && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-white via-white/95 to-transparent transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <Link
        to="/auth?mode=signup"
        className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold text-base shadow-2xl shadow-purple-600/40 active:scale-[0.98] transition-transform"
      >
        Start Your 7-Day Free Trial
        <ArrowRight className="h-5 w-5" />
      </Link>
      <div className="text-center text-[11px] text-gray-500 mt-1.5 font-medium">
        ✓ No credit card  ✓ Cancel anytime
      </div>
    </div>
  );
};

export default StickyMobileCTA;

import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const AnnouncementBar = () => {
  return (
    <Link
      to="/auth?mode=signup"
      className="block w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 text-center hover:brightness-110 transition-all group"
    >
      <span className="inline-flex items-center gap-2 flex-wrap justify-center">
        <span aria-hidden>🎉</span>
        <span className="opacity-95">
          Limited: First 100 parents this month get{" "}
          <span className="underline decoration-white/60 underline-offset-2">50% off Yearly</span>!
        </span>
        <span className="inline-flex items-center gap-1 font-bold">
          Claim now
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </span>
    </Link>
  );
};

export default AnnouncementBar;

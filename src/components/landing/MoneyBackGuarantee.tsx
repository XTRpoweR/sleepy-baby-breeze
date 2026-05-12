import { Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const MoneyBackGuarantee = () => {
  return (
    <section className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-1 shadow-2xl">
          <div className="rounded-[calc(1.5rem-4px)] bg-gradient-to-br from-emerald-50 via-white to-green-50 p-7 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl">
                <Shield className="h-10 w-10 text-white" strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold tracking-widest text-emerald-700 uppercase mb-1">
                  Risk-free
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                  🛡️ 14-Day Money-Back Guarantee
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Try SleepyBabyy Premium completely risk-free. If you're not sleeping better
                  within 14 days, we'll refund every cent — no questions asked.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-emerald-800 font-medium">
                  <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Full refund</span>
                  <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> One-click cancel</span>
                  <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Keep your data</span>
                </div>
              </div>
              <Button
                asChild
                className="shrink-0 bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white font-bold rounded-full px-6 py-6 shadow-lg"
              >
                <Link to="/auth?mode=signup">Start Risk-Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoneyBackGuarantee;

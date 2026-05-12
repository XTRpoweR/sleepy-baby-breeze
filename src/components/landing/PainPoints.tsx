import { Card, CardContent } from "@/components/ui/card";
import { Moon, HelpCircle, Clock } from "lucide-react";

const items = [
  {
    icon: Moon,
    stat: "5x",
    title: "Wake-ups every night",
    desc: "Your baby wakes constantly and you can't figure out the trigger.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: HelpCircle,
    stat: "0%",
    title: "Idea what's normal",
    desc: "Endless Googling, conflicting advice — still no clear answers.",
    color: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: Clock,
    stat: "2.3h",
    title: "Lost productivity daily",
    desc: "Sleep deprivation steals your focus, mood, and patience.",
    color: "from-fuchsia-500 to-pink-500",
  },
];

export const PainPoints = () => {
  return (
    <section className="py-16 sm:py-20 px-3 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Sound familiar? <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">You're not alone.</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Every exhausted parent feels this. The good news: it's solvable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <Card
                key={i}
                className="border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${it.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent mb-1">
                    {it.stat}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-2">{it.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{it.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PainPoints;

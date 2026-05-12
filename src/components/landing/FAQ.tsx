import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do I need a credit card to start?",
    a: "No. The Free Forever plan and the 7-day trial both work without a credit card. You only add payment if you decide to upgrade.",
  },
  {
    q: "How does the 14-day money-back guarantee work?",
    a: "If you upgrade to Premium and aren't satisfied within 14 days, contact support@sleepybabyy.com for a full refund — no questions asked.",
  },
  {
    q: "Will SleepyBabyy work for newborns?",
    a: "Yes. SleepyBabyy is designed for babies from day one through toddlerhood. The AI adapts to your baby's age and patterns.",
  },
  {
    q: "Can my partner or caregivers access the same data?",
    a: "Absolutely. Family Sharing lets multiple caregivers track and view the same baby in real time, with privacy controls.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. Your data is encrypted, never sold, and owned entirely by you. You can export or delete it any time.",
  },
  {
    q: "How do I cancel?",
    a: "One click in your subscription settings. No phone calls, no retention questions — your access continues until the end of your billing period.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-16 sm:py-20 px-3 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Questions? <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">We've got answers.</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-gray-200 rounded-2xl px-5 bg-gradient-to-br from-white to-purple-50/30"
            >
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;

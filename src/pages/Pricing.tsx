import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Check, X, Crown, Baby, Star, Users, BarChart3, Shield, Clock, Heart } from "lucide-react";
const Pricing = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    t
  } = useTranslation();
  const [isAnnual, setIsAnnual] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  const features = {
    basic: ["1 baby profile", "Current day tracking", "Basic sleep reports", "Essential sound library", "Mobile app access", "Basic customer support"],
    premium: ["Unlimited baby profiles", "Extended activity history", "Family sharing & collaboration", "Advanced analytics & trends", "Premium sound library", "Photo & video memories", "Smart notifications", "Pediatrician reports", "Data backup & export", "Priority customer support", "Sleep coaching resources", "Custom activity types"]
  };
  const monthlyPrice = 9.99;
  const annualPrice = 99.99;
  const originalPrice = 14.99;
  const annualSavings = (monthlyPrice * 12 - annualPrice).toFixed(2);
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <DesktopHeader />
      <MobileHeader />

      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
            Simple, Transparent
            <span className="text-blue-600 block">Pricing</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
            Choose the plan that works best for your family. Start with our free Basic plan 
            or unlock premium features with our affordable Premium plan.
          </p>

          {/* Special Offer Banner */}
          <div className="mb-6 md:mb-8 inline-flex items-center space-x-2 bg-red-100 px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-red-200">
            <Badge className="bg-red-500 text-white text-xs md:text-sm font-bold">LIMITED TIME</Badge>
            <span className="text-base md:text-lg text-gray-600 line-through">$14.99/month</span>
            <span className="text-xl md:text-2xl font-bold text-red-600">$9.99/month</span>
            <span className="text-red-600 font-semibold text-sm md:text-base">(40% OFF)</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Basic Plan */}
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-4 md:pb-6">
                <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
                  <Baby className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  <CardTitle className="text-xl md:text-2xl">SleepyBaby Basic</CardTitle>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">Free</div>
                  <CardDescription className="text-base md:text-lg">
                    Perfect for getting started with baby tracking
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <Button className="w-full" variant="outline" onClick={handleGetStarted}>
                  Get Started Free
                </Button>
                
                <div className="space-y-3 md:space-y-4">
                  <h4 className="font-semibold text-gray-900">What's included:</h4>
                  <ul className="space-y-2 md:space-y-3">
                    {features.basic.map((feature, index) => <li key={index} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-700">{feature}</span>
                      </li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-orange-500 hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white px-3 md:px-4 py-1">
                  <Crown className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-4 md:pb-6">
                <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
                  <Crown className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                  <CardTitle className="text-xl md:text-2xl">SleepyBaby Premium</CardTitle>
                </div>
                
                {/* Discount Badge */}
                <div className="mb-3 md:mb-4">
                  <Badge className="bg-red-500 text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1">40% OFF LIMITED TIME</Badge>
                </div>
                
                <div className="space-y-2">
                  {/* Pricing with old price crossed out */}
                  <div className="flex items-center justify-center space-x-2 md:space-x-3">
                    <span className="text-lg md:text-xl text-gray-500 line-through font-medium">${originalPrice.toFixed(2)}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-3xl md:text-4xl font-bold text-gray-900">
                        $9.99
                      </span>
                      <span className="text-gray-600 text-sm md:text-base">/month</span>
                    </div>
                  </div>
                  <p className="text-red-600 text-xs md:text-sm font-medium">Save $5.00 per month!</p>
                  <CardDescription className="text-base md:text-lg">
                    Complete baby tracking solution for modern families
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={user ? () => navigate('/subscription') : handleGetStarted}>
                  {user ? 'Upgrade to Premium' : 'Start Premium Trial'}
                </Button>
                
                <div className="space-y-3 md:space-y-4">
                  <h4 className="font-semibold text-gray-900">Everything in Basic, plus:</h4>
                  <ul className="space-y-2 md:space-y-3">
                    {features.premium.map((feature, index) => <li key={index} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-700">{feature}</span>
                      </li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Detailed Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 md:py-4 pr-4 md:pr-8 font-semibold text-gray-900 text-sm md:text-base">Features</th>
                  <th className="text-center py-3 md:py-4 px-2 md:px-4 font-semibold text-gray-900 text-sm md:text-base">Basic</th>
                  <th className="text-center py-3 md:py-4 px-2 md:px-4 font-semibold text-gray-900 text-sm md:text-base">
                    Premium
                    <div className="text-xs font-normal text-red-600 mt-1">
                      <span className="line-through">$14.99</span> $9.99/mo
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[{
                feature: "Baby Profiles",
                basic: "1",
                premium: "Unlimited"
              }, {
                feature: "Activity History",
                basic: "Current day",
                premium: "Extended history"
              }, {
                feature: "Family Sharing",
                basic: false,
                premium: true
              }, {
                feature: "Advanced Analytics",
                basic: false,
                premium: true
              }, {
                feature: "Photo & Video Storage",
                basic: false,
                premium: true
              }, {
                feature: "Smart Notifications",
                basic: false,
                premium: true
              }, {
                feature: "Pediatrician Reports",
                basic: false,
                premium: true
              }, {
                feature: "Data Export",
                basic: false,
                premium: true
              }, {
                feature: "Priority Support",
                basic: false,
                premium: true
              }, {
                feature: "Sleep Coaching",
                basic: false,
                premium: true
              }].map((row, index) => <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 md:py-4 pr-4 md:pr-8 font-medium text-gray-900 text-sm md:text-base">{row.feature}</td>
                    <td className="text-center py-3 md:py-4 px-2 md:px-4">
                      {typeof row.basic === 'boolean' ? row.basic ? <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" /> : <X className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mx-auto" /> : <span className="text-gray-700 text-sm md:text-base">{row.basic}</span>}
                    </td>
                    <td className="text-center py-3 md:py-4 px-2 md:px-4">
                      {typeof row.premium === 'boolean' ? row.premium ? <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" /> : <X className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mx-auto" /> : <span className="text-gray-700 text-sm md:text-base">{row.premium}</span>}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            {[{
            question: "Can I switch plans anytime?",
            answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
          }, {
            question: "Is there a free trial?",
            answer: "Yes, Premium comes with a 7-day free trial. No credit card required to start."
          }, {
            question: "What if I have multiple babies?",
            answer: "Basic includes 1 baby profile. Premium includes unlimited baby profiles for your growing family."
          }, {
            question: "Do you offer refunds?",
            answer: "Yes, we offer a 30-day money-back guarantee if you're not completely satisfied."
          }, {
            question: "Is my data secure?",
            answer: "Absolutely. We use enterprise-grade encryption and never share your personal data."
          }, {
            question: "Can I cancel anytime?",
            answer: "Yes, you can cancel your subscription at any time. Your data remains accessible during your billing period."
          }].map((faq, index) => <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{faq.question}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{faq.answer}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
            Ready to Get Better Sleep?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8">
            Join thousands of families who've transformed their sleep experience with SleepyBaby.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button onClick={handleGetStarted} className="bg-white text-blue-600 hover:bg-blue-50">
              Start Free Today
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 bg-white/5">
              View All Features
            </Button>
          </div>
          <p className="text-blue-100 text-xs md:text-sm mt-4 md:mt-6">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>;
};
export default Pricing;
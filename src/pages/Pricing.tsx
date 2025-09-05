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
import { LanguageSelector } from "@/components/LanguageSelector";
import { Check, X, Crown, Baby, Star, Users, BarChart3, Shield, Clock, Heart, ArrowLeft } from "lucide-react";
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
  const handleBackNavigation = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };
  const features = {
    basic: ["1 baby profile", "Current day tracking", "Basic sleep reports", "Essential sound library", "Mobile app access", "Basic customer support"],
    premium: ["Unlimited baby profiles", "Extended activity history", "Family sharing & collaboration", "Advanced analytics & trends", "Premium sound library", "Photo memories", "Smart notifications", "Pediatrician reports", "Data backup & export", "Priority customer support", "Sleep coaching resources", "Custom activity types"]
  };
  const monthlyPrice = 29.99;
  const annualPrice = 299.99;
  const originalPrice = 49.99;
  const annualSavings = (monthlyPrice * 12 - annualPrice).toFixed(2);
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Conditional Navigation */}
      {user ? <>
          <DesktopHeader />
          <MobileHeader />
        </> : <>
          {/* Landing-style Desktop Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="SleepyBabyy Logo" className="h-12 w-auto" />
                  <span className="text-xl font-bold text-gray-900">{t('app.name')}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <LanguageSelector />
                  <Button variant="ghost" onClick={() => navigate('/')}>
                    Home
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/features')}>
                    Features
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth')}>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Landing-style Mobile Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 lg:hidden">
            <div className="flex justify-between items-center h-16 px-4">
              <div className="flex items-center space-x-2">
                <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="SleepyBabyy Logo" className="h-10 w-auto" />
                <span className="text-lg font-bold text-gray-900">SleepyBabyy</span>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSelector />
                <Button size="sm" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </div>
            </div>
          </header>
        </>}

      {/* Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 md:pt-8">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={handleBackNavigation} className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{user ? t('navigation.backToDashboard') : 'Back to Home'}</span>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
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
            <span className="text-base md:text-lg text-gray-600 line-through">$49.99/month</span>
            <span className="text-xl md:text-2xl font-bold text-red-600">$29.99/month</span>
            <span className="text-red-600 font-semibold text-sm md:text-base">(40% OFF)</span>
          </div>
        </div>
      </section>

      {/* Stripe Pricing Table */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <stripe-pricing-table 
            pricing-table-id="prctbl_1S47kXKxuyUBlfIJtoR1f6a4"
            publishable-key="pk_live_51RVFtVKxuyUBlfIJsr75K3hDv2yTrySwB6WHRFJ0Hom525KyP9UzUWgdAhoISUgTC7IHDNyszOkFGpP1eGaR5ldG00lkSelsRu"
          />
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
                      <span className="line-through">$49.99</span> $29.99/mo
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
                feature: "Photo Storage",
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

      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
            Ready to Get Better Sleep?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8">Join thousands of families who've transformed their sleep experience with SleepyBabyy.</p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button onClick={handleGetStarted} className="bg-white text-blue-600 hover:bg-blue-50">
              Start Free Today
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
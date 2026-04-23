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
import { useGeoCurrency } from "@/hooks/useGeoCurrency";
import { Check, X, Crown, Baby, Star, Users, BarChart3, Shield, Clock, Heart, ArrowLeft, Zap } from "lucide-react";
import { fbqTrack } from "@/utils/metaPixel";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currency, loading: currencyLoading, convertPrice, isUSD } = useGeoCurrency();

  // Scroll to top + Meta Pixel ViewContent
  useEffect(() => {
    window.scrollTo(0, 0);
    fbqTrack('ViewContent', {
      content_type: 'product_group',
      content_category: 'pricing',
      content_name: 'pricing_page',
      content_ids: ['premium_monthly', 'premium_quarterly', 'premium_annual'],
    });
  }, []);

  const handleGetStarted = () => {
    if (user) navigate('/dashboard');
    else navigate('/auth');
  };
  const handleBackNavigation = () => {
    if (user) navigate('/dashboard');
    else navigate('/');
  };
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
            {t('pricing.hero.title')}
            <span className="text-blue-600 block">{t('pricing.hero.titleAccent')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
            {t('pricing.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Pricing Cards (4-tier unified component) */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <SubscriptionPlans />
      </section>

      {/* Feature Comparison */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            {t('pricing.comparison.title')}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 md:py-4 pr-4 md:pr-8 font-semibold text-gray-900 text-sm md:text-base">{t('pricing.comparison.featuresHeader')}</th>
                  <th className="text-center py-3 md:py-4 px-2 md:px-4 font-semibold text-gray-900 text-sm md:text-base">{t('pricing.plans.basic.name')}</th>
                  <th className="text-center py-3 md:py-4 px-2 md:px-4 font-semibold text-gray-900 text-sm md:text-base">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: t('pricing.comparison.rows.profiles'), basic: '1', premium: t('pricing.comparison.unlimited') },
                  { feature: t('pricing.comparison.rows.history'), basic: t('pricing.comparison.currentDay'), premium: t('pricing.comparison.extended') },
                  { feature: t('pricing.comparison.rows.familySharing'), basic: false, premium: true },
                  { feature: t('pricing.comparison.rows.advancedAnalytics'), basic: false, premium: true },
                  { feature: t('pricing.comparison.rows.photoStorage'), basic: false, premium: true },
                  { feature: t('pricing.comparison.rows.smartNotifications'), basic: false, premium: true },
                  { feature: t('pricing.comparison.rows.pediatricianReports'), basic: false, premium: true },
                  { feature: t('pricing.comparison.rows.dataExport'), basic: false, premium: true },
                  { feature: t('pricing.comparison.rows.prioritySupport'), basic: false, premium: true },
                  { feature: t('pricing.comparison.rows.sleepCoaching'), basic: false, premium: true },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 md:py-4 pr-4 md:pr-8 font-medium text-gray-900 text-sm md:text-base">{row.feature}</td>
                    <td className="text-center py-3 md:py-4 px-2 md:px-4">
                      {typeof row.basic === 'boolean' ? (row.basic ? <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" /> : <X className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mx-auto" />) : <span className="text-gray-700 text-sm md:text-base">{row.basic}</span>}
                    </td>
                    <td className="text-center py-3 md:py-4 px-2 md:px-4">
                      {typeof row.premium === 'boolean' ? (row.premium ? <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" /> : <X className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mx-auto" />) : <span className="text-gray-700 text-sm md:text-base">{row.premium}</span>}
                    </td>
                  </tr>
                ))}

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
            answer: "Yes, we offer a 15-day money-back guarantee if you're not completely satisfied."
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
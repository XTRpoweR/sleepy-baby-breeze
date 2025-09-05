import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Clock, Calendar, Volume2, Users, BarChart3, Globe, Baby, Heart, CheckCircle, ArrowLeft, Smartphone, Shield, Zap, Bell, Camera, Share2 } from "lucide-react";

const Features = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

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

  const handleSignIn = () => {
    navigate('/auth');
  };

  const coreFeatures = [{
    icon: Clock,
    title: "Complete Activity Tracking",
    description: "Track sleep, feeding, diaper changes, and custom activities with precise timing and detailed notes.",
    color: "text-blue-500",
    benefits: ["One-tap logging for quick entries", "Automatic duration calculations", "Custom activity types", "Detailed notes and observations"]
  }, {
    icon: Calendar,
    title: "Smart Sleep Schedules",
    description: "AI-powered sleep schedule recommendations based on your baby's age and patterns.",
    color: "text-purple-500",
    benefits: ["Age-appropriate schedules", "Personalized recommendations", "Flexible adjustments", "Schedule progress tracking"]
  }, {
    icon: Volume2,
    title: "Soothing Sound Library",
    description: "Premium collection of white noise, lullabies, and nature sounds to help your baby sleep.",
    color: "text-green-500",
    benefits: ["High-quality audio recordings", "Timer and fade-out options", "Offline playback", "Custom sound playlists"]
  }, {
    icon: Users,
    title: "Family Collaboration",
    description: "Share access with partners, grandparents, and caregivers for seamless coordination.",
    color: "text-orange-500",
    benefits: ["Real-time sync across devices", "Role-based permissions", "Activity notifications", "Handoff coordination"]
  }, {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Beautiful charts and insights to understand your baby's patterns and progress.",
    color: "text-indigo-500",
    benefits: ["Weekly and monthly trends", "Pattern recognition", "Sleep quality scoring", "Milestone tracking"]
  }, {
    icon: Globe,
    title: "Multilingual Support",
    description: "Available in 8 languages with culturally appropriate guidance and tips.",
    color: "text-pink-500",
    benefits: ["8 supported languages", "Cultural sleep practices", "Localized content", "Regional expert advice"]
  }];

  const premiumFeatures = [{
    icon: Camera,
    title: "Photo & Video Memories",
    description: "Capture and organize precious moments with integrated photo and video storage.",
    badge: "Premium"
  }, {
    icon: Bell,
    title: "Smart Notifications",
    description: "Intelligent reminders for feeding times, sleep windows, and important milestones.",
    badge: "Premium"
  }, {
    icon: Share2,
    title: "Pediatrician Reports",
    description: "Generate professional reports to share with your healthcare provider.",
    badge: "Premium",
    advantages: ["Easy to download and securely share with your doctor"]
  }, {
    icon: Shield,
    title: "Data Backup & Export",
    description: "Secure cloud backup and export your data in multiple formats.",
    badge: "Premium"
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Conditional Headers */}
      {user ? (
        <>
          <DesktopHeader />
          <MobileHeader />
          
          {/* Back Button for Mobile (authenticated users) */}
          <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-blue-100 px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Non-authenticated Desktop Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
                    alt="SleepyBabyy Logo" 
                    className="h-12 w-auto"
                  />
                  <span className="text-xl font-bold text-gray-900">SleepyBabyy</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate('/')}>
                    Home
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/features')}>
                    Features
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/pricing')}>
                    Pricing
                  </Button>
                  <LanguageSelector />
                  <Button variant="outline" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted}>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Non-authenticated Mobile Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 lg:hidden">
            <div className="flex justify-between items-center h-16 px-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
                  alt="SleepyBabyy Logo" 
                  className="h-10 w-auto"
                />
                <span className="text-lg font-bold text-gray-900">SleepyBabyy</span>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSelector />
                <Button size="sm" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>
            </div>
          </header>

          {/* Back Button for Mobile (non-authenticated users) */}
          <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-blue-100 px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need for
            <span className="text-blue-600 block">Better Baby Sleep</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Discover all the powerful features that make SleepyBaby the most comprehensive 
            baby tracking and sleep improvement app for modern families.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">
              Try All Features Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/pricing')}>
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything included in both our Basic and Premium plans
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-2xl bg-gray-50 mb-4 w-fit`}>
                      <IconComponent className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premium Features
            </h2>
            <p className="text-xl text-gray-600">
              Unlock additional powerful features with SleepyBaby Premium
            </p>
            {/* Added discount info */}
            <div className="mt-4 inline-flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full">
              <span className="text-lg text-gray-500 line-through">$49.99/month</span>
              <span className="text-xl font-bold text-red-600">$29.99/month</span>
              <Badge className="bg-red-500 text-white text-xs">40% OFF</Badge>
            </div>
          </div>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {premiumFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex p-3 rounded-2xl bg-orange-100">
                        <IconComponent className="h-8 w-8 text-orange-600" />
                      </div>
                      <Badge className="bg-orange-600 text-white">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                    {feature.advantages && (
                      <ul className="mt-4 space-y-1 pl-4 list-disc text-gray-700 text-sm">
                        {feature.advantages.map((adv, aidx) => (
                          <li key={aidx}>
                            {adv}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate('/pricing')} className="bg-orange-600 hover:bg-orange-700">
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Modern Families
            </h2>
            <p className="text-xl text-gray-600">
              Designed with security, reliability, and ease of use in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Cross-Platform</h3>
                <p className="text-gray-600">Works seamlessly on iOS, Android, and web browsers</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                <p className="text-gray-600">Enterprise-grade security with end-to-end encryption</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Optimized for quick logging even when you're sleep-deprived</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience All Features?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free trial today and discover how SleepyBaby can transform your family's sleep experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="bg-white text-blue-600 hover:bg-blue-50">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link to="/contact" className="flex items-center space-x-2">
                <span className="text-violet-600">Contact Sales</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;

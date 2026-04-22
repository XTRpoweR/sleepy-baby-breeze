import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { Clock, Calendar, Volume2, Users, BarChart3, Star, Heart, CheckCircle, Play, Globe, Check, Crown, Badge, Menu, X, ArrowRight, Sparkles, Moon, Sun, Award, TrendingUp, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { memo, useMemo, useState, useEffect, useRef, useCallback } from "react";
import CountUp from "@/components/CountUp";

// Import feature images
import trackEverythingImg from "@/assets/features/track-everything.png";
import sleepSchedulesImg from "@/assets/features/sleep-schedules.png";
import familySharingImg from "@/assets/features/family-sharing.png";
import memoriesImg from "@/assets/features/memories.png";
import analyticsReportsImg from "@/assets/features/analytics-reports.png";
import whiteNoiseImg from "@/assets/features/white-noise.png";

// Memoized components for better performance
const FeatureCard = memo(({
  feature,
  index,
  size = 'md',
}: {
  feature: any;
  index: number;
  size?: 'sm' | 'md' | 'lg' | 'tall';
}) => {
  const IconComponent = feature.icon;
  const formattedNumber = (index + 1).toString().padStart(2, '0');
  const cardRef = useRef<HTMLDivElement>(null);

  // Bulletproof gradient map (Tailwind purges dynamic class names — use inline styles)
  const gradientMap: Record<string, string> = {
    blue:   'linear-gradient(135deg, #3b82f6, #6366f1)',
    purple: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
    teal:   'linear-gradient(135deg, #14b8a6, #06b6d4)',
    pink:   'linear-gradient(135deg, #ec4899, #f43f5e)',
    orange: 'linear-gradient(135deg, #f97316, #f59e0b)',
    green:  'linear-gradient(135deg, #10b981, #84cc16)',
  };
  const gradientStyle = { background: gradientMap[feature.colorScheme] || gradientMap.blue };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  const sizeClasses = {
    sm: 'sm:col-span-1 sm:row-span-1',
    md: 'sm:col-span-1 sm:row-span-1',
    lg: 'sm:col-span-2 sm:row-span-1',
    tall: 'sm:col-span-1 sm:row-span-2',
  }[size];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`bento-card group relative rounded-3xl overflow-hidden animate-fade-in-up gpu-accelerated ${sizeClasses}`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* Animated rotating gradient border */}
      <div className={`bento-border feature-gradient-${feature.colorScheme}`} aria-hidden="true" />

      {/* Inner card surface */}
      <div className="bento-inner relative h-full bg-white rounded-[calc(1.5rem-2px)] p-6 sm:p-7 flex flex-col">
        {/* Spotlight follow-cursor */}
        <div className="bento-spotlight" aria-hidden="true" />

        {/* Floating particles */}
        <span className="floating-particle particle-1" aria-hidden="true" />
        <span className="floating-particle particle-2" aria-hidden="true" />
        <span className="floating-particle particle-3" aria-hidden="true" />

        {/* Top row: number + badges */}
        <div className="relative z-10 flex items-start justify-between mb-4">
          <span className={`text-3xl sm:text-4xl font-black opacity-15 feature-gradient-${feature.colorScheme} bg-clip-text text-transparent leading-none`}>
            {formattedNumber}
          </span>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] font-bold tracking-widest text-primary/70 bg-primary/5 px-2 py-1 rounded-full border border-primary/15 backdrop-blur-sm uppercase">
              {feature.category}
            </span>
            {feature.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full badge-glow ${
                feature.badge === 'POPULAR'
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-purple-100 text-purple-700 border border-purple-300'
              }`}>
                {feature.badge === 'POPULAR' ? '🔥 POPULAR' : '⭐ PREMIUM'}
              </span>
            )}
          </div>
        </div>

        {/* Animated visual hero area with feature image + colored gradient */}
        <div className="relative z-10 mb-5 h-36 sm:h-40 rounded-2xl overflow-hidden feature-visual" style={gradientStyle}>
          {/* Feature illustration as background */}
          {feature.image && (
            <img
              src={feature.image}
              alt={feature.title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          )}

          {/* Animated mesh + dark gradient for text contrast */}
          <div className="feature-mesh" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" aria-hidden="true" />

          {/* Orbiting glowing dots */}
          <span className="orbit-dot orbit-dot-1" aria-hidden="true" />
          <span className="orbit-dot orbit-dot-2" aria-hidden="true" />
          <span className="orbit-dot orbit-dot-3" aria-hidden="true" />

          {/* Wave bottom */}
          <svg className="feature-wave" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,20 Q50,5 100,20 T200,20 L200,40 L0,40 Z" fill="rgba(255,255,255,0.22)" />
            <path d="M0,28 Q50,12 100,28 T200,28 L200,40 L0,40 Z" fill="rgba(255,255,255,0.14)" />
          </svg>

          {/* Center icon with rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 shadow-xl icon-3d-tilt">
              <span className="ripple-ring rounded-2xl" style={{ background: 'rgba(255,255,255,0.5)' }} aria-hidden="true" />
              <span className="ripple-ring ripple-ring-delay rounded-2xl" style={{ background: 'rgba(255,255,255,0.5)' }} aria-hidden="true" />
              <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="relative z-10 flex-1 space-y-2.5">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
            {feature.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {feature.description}
          </p>
        </div>

        {/* Bottom: metric only (no Learn more button) */}
        {feature.metric && (
          <div className="relative z-10 mt-5 pt-4 border-t border-gray-100 flex items-center">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              <span className="font-medium">{feature.metric}</span>
            </div>
          </div>
        )}

        {/* Bottom progress bar */}
        <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out feature-gradient-${feature.colorScheme}`} />
      </div>
    </div>
  );
});
const TestimonialCard = memo(({
  testimonial,
  index
}: {
  testimonial: any;
  index: number;
}) => <Card key={index} className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up gpu-accelerated" style={{
  animationDelay: `${index * 100}ms`
}}>
    <CardContent className="p-4 sm:p-6 md:p-8">
      <div className="flex space-x-1 mb-3 sm:mb-4">
        {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />)}
      </div>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 italic font-light leading-relaxed">"{testimonial.content}"</p>
      <div>
        <div className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
        <div className="text-xs sm:text-sm text-gray-500 font-medium">{testimonial.role}</div>
      </div>
    </CardContent>
  </Card>);
const Index = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  const handleScrollToPricing = () => {
    const element = document.getElementById('pricing');
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleScrollToFeatures = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDownloadComingSoon = () => {
    toast({
      title: "Coming Soon",
      description: "The Download feature is not available yet. Stay tuned!"
    });
  };

  // Memoized data to prevent recalculation
  const features = useMemo(() => [{
    icon: Clock,
    title: t('features.trackEverything.title'),
    description: t('features.trackEverything.description'),
    colorScheme: 'blue',
    category: 'CORE FEATURE',
    badge: 'POPULAR',
    metric: 'Used by 10,000+ families',
    image: trackEverythingImg
  }, {
    icon: Calendar,
    title: t('features.customSchedules.title'),
    description: t('features.customSchedules.description'),
    colorScheme: 'purple',
    category: 'PLANNING',
    metric: '95% report better sleep',
    image: sleepSchedulesImg
  }, {
    icon: Volume2,
    title: t('features.soothingSounds.title'),
    description: t('features.soothingSounds.description'),
    colorScheme: 'teal',
    category: 'WELLNESS',
    badge: 'POPULAR',
    metric: '20+ soothing sounds',
    image: whiteNoiseImg
  }, {
    icon: Users,
    title: t('features.multiCaregiver.title'),
    description: t('features.multiCaregiver.description'),
    colorScheme: 'pink',
    category: 'PREMIUM',
    badge: 'PREMIUM',
    image: familySharingImg
  }, {
    icon: BarChart3,
    title: t('features.insights.title'),
    description: t('features.insights.description'),
    colorScheme: 'orange',
    category: 'ANALYTICS',
    metric: 'Smart recommendations',
    image: analyticsReportsImg
  }, {
    icon: Globe,
    title: t('features.multilingual.title'),
    description: t('features.multilingual.description'),
    colorScheme: 'green',
    category: 'GLOBAL',
    metric: 'Available in 8 languages',
    image: memoriesImg
  }], [t]);
  const testimonials = useMemo(() => [{
    name: "Sarah M.",
    role: "New Mom",
    content: "This app saved my sanity! Finally understanding my baby's sleep patterns made everything so much easier.",
    rating: 5
  }, {
    name: "Mike & Jessica",
    role: "First-time Parents",
    content: "The multi-caregiver feature is a game-changer. My partner and I can both stay on top of our baby's sleep schedule.",
    rating: 5
  }, {
    name: "Dr. Emily Chen",
    role: "Pediatric Sleep Specialist",
    content: "I recommend this app to all my patients. The insights help parents make better sleep decisions for their babies.",
    rating: 5
  }], []);
  return <div className="min-h-screen gradient-dynamic-slow font-sans gpu-accelerated">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50 animate-fade-in safe-area-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 group">
              <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="SleepyBabyy Logo" className="h-8 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-110" loading="eager" width="40" height="40" />
              <span className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">{t('app.name')}</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium text-sm xl:text-base">{t('navigation.features')}</a>
              <a href="#insights" className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium text-sm xl:text-base">{t('navigation.insights')}</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium text-sm xl:text-base">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium text-sm xl:text-base">{t('navigation.reviews')}</a>
              <LanguageSelector />
              {user ? <Button onClick={() => navigate('/dashboard')} className="gradient-dynamic hover:scale-105 transition-all duration-300 font-medium text-white border-0 text-sm xl:text-base px-4 xl:px-6">
                  {t('navigation.dashboard')}
                </Button> : <Button onClick={handleGetStarted} className="gradient-dynamic hover:scale-105 transition-all duration-300 font-medium text-white border-0 text-sm xl:text-base px-4 xl:px-6">
                  {t('navigation.getStarted')}
                </Button>}
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="touch-target">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && <div className="lg:hidden py-4 border-t border-gray-200 animate-fade-in">
              <div className="flex flex-col space-y-3">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium py-2 touch-target">{t('navigation.features')}</a>
                <a href="#insights" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium py-2 touch-target">{t('navigation.insights')}</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium py-2 touch-target">Pricing</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium py-2 touch-target">{t('navigation.reviews')}</a>
                {user ? <Button onClick={() => {
              navigate('/dashboard');
              setMobileMenuOpen(false);
            }} className="gradient-dynamic hover:scale-105 transition-all duration-300 font-medium text-white border-0 w-full mt-2 touch-target">
                    {t('navigation.dashboard')}
                  </Button> : <Button onClick={() => {
              handleGetStarted();
              setMobileMenuOpen(false);
            }} className="gradient-dynamic hover:scale-105 transition-all duration-300 font-medium text-white border-0 w-full mt-2 touch-target">
                    {t('navigation.getStarted')}
                  </Button>}
              </div>
            </div>}
        </div>
      </nav>

      {/* Hero Section — Cinematic with aurora blobs and rotating words */}
      <section className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden mesh-bg">
        {/* Aurora background blobs */}
        <div className="aurora-blob aurora-1 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] -top-32 -left-32" aria-hidden="true" />
        <div className="aurora-blob aurora-2 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] top-20 -right-32" aria-hidden="true" />
        <div className="aurora-blob aurora-3 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bottom-0 left-1/3" aria-hidden="true" />

        {/* Floating sparkle decorations */}
        <Sparkles className="absolute top-24 right-[15%] h-5 w-5 text-primary/40 sparkle hidden sm:block" style={{ animationDelay: '0s' }} aria-hidden="true" />
        <Moon className="absolute top-1/3 left-[8%] h-6 w-6 text-accent/40 float-gentle hidden sm:block" aria-hidden="true" />
        <Star className="absolute bottom-32 right-[10%] h-4 w-4 text-pink-400/50 sparkle hidden sm:block" style={{ animationDelay: '1.2s' }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Trust badge */}
          <div className="flex justify-center mb-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-primary/20 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">
                <span className="text-gradient">10,000+</span> happy families · 4.9 ★
              </span>
            </div>
          </div>

          {/* Centered headline with rotating word */}
          <div className="text-center mb-10 sm:mb-14 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-5 sm:mb-7">
              {t('hero.title')}
              <span className="text-shimmer block mt-2 sm:mt-3 font-black">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            {/* Modern static tagline */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="group relative inline-flex items-center gap-2.5 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/85 backdrop-blur-xl shadow-[0_8px_32px_-8px_hsl(var(--gradient-from)/0.35)] hover:shadow-[0_14px_44px_-10px_hsl(var(--gradient-via)/0.55)] transition-all duration-500 hover:-translate-y-0.5 tagline-border">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500" />
                </span>
                <Sparkles className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-primary shrink-0 animate-spin-slow" />
                <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                  {t('hero.word1', 'Peaceful nights')}
                </span>
                <Heart className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-pink-500 shrink-0 animate-pulse fill-pink-500/30" />
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light mb-3">
              {t('hero.subtitle')}
            </p>
            <p className="text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-8">
              {t('hero.subtitleExtra')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6">
              <Button size="lg" className="gradient-dynamic btn-glow text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl font-bold text-white border-0 touch-target w-full sm:w-auto group" onClick={handleGetStarted}>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-12 transition-transform" />
                {t('hero.startTracking')}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-full border-2 border-primary/30 hover:bg-primary/5 hover:border-primary transition-all duration-300 hover:scale-105 font-semibold text-primary touch-target w-full sm:w-auto bg-white/70 backdrop-blur-sm" onClick={handleScrollToFeatures}>
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t('hero.exploreFeatures')}
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500" /><span className="font-medium">Free forever plan</span></div>
              <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-blue-500" /><span className="font-medium">{t('hero.noCreditCard')}</span></div>
              <div className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-red-400" /><span className="font-medium">{t('hero.madeByParents')}</span></div>
            </div>
          </div>

          {/* Video — large, centered, with floating effect */}
          <div className="relative max-w-5xl mx-auto animate-scale-in float-gentle">
            {/* Animated gradient border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-pink-500 rounded-3xl blur-md opacity-60 gradient-dynamic" />
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <video className="w-full h-auto block" autoPlay loop muted playsInline preload="auto" poster="/lovable-uploads/6667cdc7-f4a7-4fad-9507-4f558fe9e8df.png" width="1280" height="720">
                <source src="/SleepyBabyyDemo.mp4" type="video/mp4" />
                <img src="/lovable-uploads/6667cdc7-f4a7-4fad-9507-4f558fe9e8df.png" alt="SleepyBabyy demo" className="w-full h-auto" />
              </video>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mt-12 sm:mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '10K+', label: 'Happy Families', icon: Heart },
              { value: '2M+', label: 'Sleep Sessions', icon: Moon },
              { value: '4.9★', label: 'App Rating', icon: Star },
              { value: '8', label: 'Languages', icon: Globe },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 hover:scale-105 duration-300">
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl sm:text-3xl font-black text-gradient">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section — Bento grid with premium animations */}
      <section id="features" className="relative py-16 sm:py-20 md:py-28 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/30 to-white overflow-hidden">
        <div className="aurora-blob aurora-1 w-[500px] h-[500px] -top-32 -left-20 opacity-40" aria-hidden="true" />
        <div className="aurora-blob aurora-2 w-[600px] h-[600px] -bottom-40 right-0 opacity-30" aria-hidden="true" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-primary/20 shadow-sm mb-5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-xs font-bold text-primary tracking-wider uppercase">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.1]">
              {t('features.title')}
              <span className="text-shimmer block mt-2">that just work</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              {t('features.subtitle')}
            </p>

            {/* Trust strip */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm text-gray-500">
              <div className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-pink-500" /> <span className="font-medium">10,000+ families</span></div>
              <span className="text-gray-300">•</span>
              <div className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /> <span className="font-medium">4.9 rating</span></div>
              <span className="text-gray-300">•</span>
              <div className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-blue-500" /> <span className="font-medium">8 languages</span></div>
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 auto-rows-fr">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} size="md" />
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-14 sm:mt-20 relative animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="cta-banner-glow absolute -inset-1 rounded-3xl opacity-70 blur-xl" aria-hidden="true" />
            <div className="relative gradient-dynamic rounded-3xl p-7 sm:p-10 md:p-12 overflow-hidden shadow-2xl">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-7">
                <div className="text-center md:text-left max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-4">
                    <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                    <span className="text-[11px] font-bold text-white tracking-wider uppercase">Start tonight</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                    Ready to give your baby <span className="underline decoration-white/40 decoration-4 underline-offset-4">better sleep</span> tonight?
                  </h3>
                  <p className="text-white/85 text-sm sm:text-base font-light leading-relaxed">
                    Join thousands of parents who finally figured out their baby's sleep — in just a few taps.
                  </p>

                  <div className="mt-5 flex items-center justify-center md:justify-start gap-3">
                    <div className="flex -space-x-2">
                      {['from-pink-400 to-rose-500','from-blue-400 to-indigo-500','from-emerald-400 to-teal-500','from-amber-400 to-orange-500'].map((g, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} ring-2 ring-white flex items-center justify-center text-white text-[10px] font-bold`}>
                          {['JM','SK','AL','RT'][i]}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-white/90">
                      <div className="font-semibold">Joined by 10,000+ parents</div>
                      <div className="flex items-center gap-1 text-white/70">
                        {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 fill-yellow-300 text-yellow-300" />)}
                        <span className="ml-1">4.9 average</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 w-full md:w-auto shrink-0">
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    className="cta-pulse-glow w-full md:w-auto bg-white text-primary hover:bg-white/95 hover:scale-105 font-bold text-base px-8 py-6 rounded-full shadow-2xl border-0 group transition-all duration-300"
                  >
                    <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Start Free Today
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                  <div className="flex items-center gap-2 text-[11px] text-white/80 font-medium">
                    <Shield className="h-3 w-3" />
                    No credit card · Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section — Interactive with animated counters */}
      <section id="insights" className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8 gradient-dynamic-slow">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary tracking-wider uppercase">Smart Analytics</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Turn Sleep Data Into
                <span className="text-shimmer block mt-1">Actionable Insights</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light">
                Our intelligent analytics help you spot patterns, predict optimal bedtimes, and understand what works best for your unique baby. No more guessing - just gentle, data-driven guidance.
              </p>
              <div className="space-y-3 sm:space-y-4">
                {["Weekly sleep pattern analysis", "Personalized bedtime recommendations", "Sleep regression alerts and tips", "Progress tracking and milestones"].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:translate-x-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors duration-300">
                      <Check className="h-3.5 w-3.5 text-green-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{item}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" className="gradient-dynamic btn-glow transition-all duration-300 hover:scale-105 hover:shadow-lg font-semibold text-white border-0 touch-target w-full sm:w-auto rounded-full group" onClick={handleGetStarted}>
                <BarChart3 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                See Your Sleep Insights
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Interactive Summary Card — Live & Animated */}
            <div className="summary-card-live bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl order-1 lg:order-2 relative overflow-hidden group/card">
              {/* Animated decorative gradient corners */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/20 via-accent/20 to-pink-400/20 rounded-full blur-2xl animate-blob-float" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-blue-400/15 via-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-blob-float-delayed" />

              {/* Floating sparkle particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className="summary-sparkle"
                    style={{
                      left: `${10 + i * 11}%`,
                      top: `${15 + (i % 4) * 20}%`,
                      animationDelay: `${i * 0.7}s`,
                      animationDuration: `${4 + (i % 3)}s`,
                    }}
                  />
                ))}
              </div>

              <div className="relative space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    This Week's Summary
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    Live
                  </span>
                </div>

                {/* Animated stat cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="stat-card-interactive gradient-dynamic rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                    <div className="absolute inset-0 shimmer-overlay" />
                    <div className="relative">
                      <div className="text-3xl sm:text-4xl font-black text-white mb-1 animate-number-pop"><CountUp end={11.2} decimals={1} suffix="h" /></div>
                      <div className="text-xs sm:text-sm text-white/90 font-medium flex items-center justify-center gap-1">
                        <Moon className="h-3 w-3 animate-pulse" />
                        Avg. Night Sleep
                      </div>
                    </div>
                  </div>
                  <div className="stat-card-interactive bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border border-green-200 relative overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <div className="absolute inset-0 shimmer-overlay-light" />
                    <div className="relative">
                      <div className="text-3xl sm:text-4xl font-black text-green-600 mb-1 animate-number-pop" style={{ animationDelay: '0.2s' }}><CountUp end={2.1} decimals={1} suffix="h" delay={200} /></div>
                      <div className="text-xs sm:text-sm text-gray-600 font-medium flex items-center justify-center gap-1">
                        <Sun className="h-3 w-3 text-yellow-500 animate-spin-slow" />
                        Avg. Day Naps
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bars section */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Night Sleep Goal</span>
                      <span className="font-bold text-primary"><CountUp end={93} suffix="%" delay={300} /></span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div className="progress-bar-fill-glow" style={{'--progress-width': '93%'} as React.CSSProperties} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Nap Consistency</span>
                      <span className="font-bold text-accent"><CountUp end={78} suffix="%" delay={500} /></span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div className="progress-bar-fill-glow accent" style={{'--progress-width': '78%'} as React.CSSProperties} />
                    </div>
                  </div>
                </div>

                {/* Sleep quality with twinkling animated stars */}
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-xl border border-yellow-100 relative overflow-hidden">
                  <div className="absolute inset-0 shimmer-overlay-light" />
                  <span className="text-sm text-gray-700 font-semibold relative z-10">Sleep Quality</span>
                  <div className="flex space-x-1 relative z-10">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400 star-twinkle drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]"
                        style={{ animationDelay: `${star * 0.25}s` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Recommendation card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 relative overflow-hidden hover:border-green-300 transition-colors group/rec">
                  <div className="absolute inset-0 shimmer-overlay-light" />
                  <div className="flex items-start gap-3 relative">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center animate-icon-bounce">
                      <Sparkles className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-green-800 mb-1">AI Recommendation</div>
                      <div className="text-xs text-green-700 leading-relaxed">
                        Bedtime routine is working great! Try shifting bedtime 15 min earlier for even better results.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly trend mini chart with animated bars */}
                <div className="flex items-end justify-between gap-1 h-20 px-2 pt-2">
                  {[65, 78, 72, 85, 90, 88, 93].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar cursor-pointer">
                      <span className="text-[9px] font-bold text-primary opacity-0 group-hover/bar:opacity-100 transition-opacity tabular-nums">{val}%</span>
                      <div
                        className="w-full rounded-t-md chart-bar-grow group-hover/bar:opacity-90 group-hover/bar:scale-y-105 origin-bottom transition-transform"
                        style={{
                          '--bar-height': `${val}%`,
                          background: i === 6
                            ? 'linear-gradient(to top, hsl(261 83% 58%), hsl(291 64% 52%))'
                            : 'linear-gradient(to top, hsl(261 83% 58% / 0.4), hsl(261 83% 58% / 0.15))',
                          animationDelay: `${i * 0.12}s`,
                          boxShadow: i === 6 ? '0 0 12px hsl(261 83% 58% / 0.5)' : 'none',
                        } as React.CSSProperties}
                      />
                      <span className="text-[9px] text-gray-400 font-medium">
                        {['M','T','W','T','F','S','S'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section — Eye-catching header with badge */}
      <section id="pricing" className="relative py-16 sm:py-20 md:py-28 px-3 sm:px-4 md:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="aurora-blob aurora-1 w-[500px] h-[500px] -bottom-32 -left-32 opacity-25" aria-hidden="true" />
        <div className="aurora-blob aurora-3 w-[400px] h-[400px] -top-20 right-10 opacity-25" aria-hidden="true" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Crown className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-bold text-accent tracking-wider uppercase">Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.1]">
              Simple pricing,
              <span className="text-shimmer block mt-2">priceless sleep</span>
            </h2>
            <div className="space-y-2">
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                Start free forever. Upgrade anytime to unlock premium features for your whole family.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700 bg-green-50 inline-flex px-4 py-1.5 rounded-full mt-3 border border-green-200">
                <CheckCircle className="h-4 w-4" />
                <span>No credit card required · Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <SubscriptionPlans />
          </div>
        </div>
      </section>

      {/* Testimonials Section — Marquee scrolling */}
      <section id="testimonials" className="relative py-16 sm:py-20 md:py-28 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-300 mb-4">
              <Star className="h-3.5 w-3.5 text-yellow-600 fill-yellow-500" />
              <span className="text-xs font-bold text-yellow-700 tracking-wider uppercase">4.9 / 5 from 10,000+ reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.1]">
              Loved by parents
              <span className="text-shimmer block mt-2">around the world</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light leading-relaxed">
              Join thousands of families who've found their way to better sleep.
            </p>
          </div>
        </div>

        {/* Scrolling marquee — duplicated for seamless loop */}
        <div className="marquee-mask overflow-hidden">
          <div className="marquee gap-6 px-3">
            {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
              <div key={index} className="w-[320px] sm:w-[380px] flex-shrink-0">
                <TestimonialCard testimonial={testimonial} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8 gradient-dynamic">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
            Ready for Better Nights?
          </h2>
          <div className="space-y-2 mb-6 sm:mb-8">
            <p className="text-base sm:text-lg md:text-xl text-blue-100 font-light leading-relaxed">
              Start your journey to understanding your baby's sleep patterns today.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-blue-100 font-medium">
              Your whole family will thank you.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
             <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium touch-target w-full sm:w-auto" onClick={handleGetStarted}>
               Start Free Trial
             </Button>
             <Button size="lg" variant="outline" onClick={handleScrollToPricing} className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-white transition-all duration-300 hover:scale-105 font-medium bg-white/10 text-white hover:bg-white/20 touch-target w-full sm:w-auto">
                View Plans
              </Button>
          </div>
          
          <p className="text-blue-100 text-xs sm:text-sm mt-4 sm:mt-6 font-medium leading-relaxed">Free trial • No credit card required • Coming soon on iOS & Android</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 px-3 sm:px-4 md:px-6 lg:px-8 safe-area-bottom">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 group">
                <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="SleepyBabyy Logo" className="h-6 sm:h-8 w-auto transition-transform duration-300 group-hover:scale-110" />
                <span className="text-base sm:text-lg font-semibold tracking-tight">{t('app.name')}</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 font-light leading-relaxed">
                {t('footer.tagline')}
              </p>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">{t('footer.product')}</h3>
              <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                <Link to="/features" className="block hover:text-white transition-colors duration-300 cursor-pointer">{t('navigation.features')}</Link>
                <Link to="/pricing" className="block hover:text-white transition-colors duration-300 cursor-pointer">{t('footer.pricing')}</Link>
                {/* Replace Download link with a button that shows "Coming Soon" */}
                <button type="button" onClick={handleDownloadComingSoon} className="block w-full text-left text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer bg-transparent border-0 p-0 text-sm sm:text-base" style={{
                font: 'inherit'
              }}>
                  {t('footer.download')}
                </button>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">{t('footer.support')}</h3>
              <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                <Link to="/help" className="block hover:text-white transition-colors duration-300 cursor-pointer">{t('footer.helpCenter')}</Link>
                <Link to="/contact" className="block hover:text-white transition-colors duration-300 cursor-pointer">{t('footer.contactUs')}</Link>
                <Link to="/privacy" className="block hover:text-white transition-colors duration-300 cursor-pointer">{t('footer.privacyPolicy')}</Link>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">{t('footer.company')}</h3>
              <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                <Link to="/about" className="block hover:text-white transition-colors duration-300 cursor-pointer">{t('footer.about')}</Link>
                <Link to="/blog" className="block hover:text-white transition-colors duration-300 cursor-pointer">{t('footer.blog')}</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
      
      {/* Fixed language selector hamburger menu - mobile only */}
      <div className="fixed top-4 right-20 z-50 md:hidden">
        <LanguageSelector />
      </div>
    </div>;
};
export default Index;

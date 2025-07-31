import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Clock, Calendar, Volume2, Users, BarChart3, Star, Heart, CheckCircle, Play, Globe, Check, Crown, Badge, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { memo, useMemo, useState } from "react";

// Memoized components for better performance
const FeatureCard = memo(({
  feature,
  index
}: {
  feature: any;
  index: number;
}) => {
  const IconComponent = feature.icon;
  return <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up card-glow gpu-accelerated" style={{
    animationDelay: `${index * 50}ms`
  }}>
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="inline-flex p-2 sm:p-3 rounded-2xl gradient-dynamic-slow mb-4 sm:mb-6 transition-transform duration-300 group-hover:scale-110">
          <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">{feature.title}</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light">{feature.description}</p>
      </CardContent>
    </Card>;
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
  const handleViewPricing = () => {
    if (user) {
      navigate('/subscription');
    } else {
      navigate('/auth');
    }
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
    description: t('features.trackEverything.description')
  }, {
    icon: Calendar,
    title: t('features.customSchedules.title'),
    description: t('features.customSchedules.description')
  }, {
    icon: Volume2,
    title: t('features.soothingSounds.title'),
    description: t('features.soothingSounds.description')
  }, {
    icon: Users,
    title: t('features.multiCaregiver.title'),
    description: t('features.multiCaregiver.description')
  }, {
    icon: BarChart3,
    title: t('features.insights.title'),
    description: t('features.insights.description')
  }, {
    icon: Globe,
    title: t('features.multilingual.title'),
    description: t('features.multilingual.description')
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
            <div className="lg:hidden flex items-center space-x-2">
              <LanguageSelector />
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

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 animate-fade-in-up order-2 lg:order-1">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                  {t('hero.title')}
                  <span className="text-gradient block mt-1 sm:mt-2">{t('hero.titleHighlight')}</span>
                </h1>
                <div className="space-y-2">
                  <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                    {t('hero.subtitle')}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
                    {t('hero.subtitleExtra')}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" className="gradient-dynamic text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium text-white border-0 touch-target w-full sm:w-auto" onClick={handleGetStarted}>
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('hero.startTracking')}
                </Button>
                <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-dynamic hover:bg-primary/5 transition-all duration-300 hover:scale-105 font-medium text-primary touch-target w-full sm:w-auto">
                  {t('hero.exploreFeatures')}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center space-x-1 transition-all duration-300 hover:scale-105">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span className="font-medium">{t('hero.freeTrial')}</span>
                </div>
                <div className="flex items-center space-x-1 transition-all duration-300 hover:scale-105">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span className="font-medium">{t('hero.noCreditCard')}</span>
                </div>
                <div className="flex items-center space-x-1 transition-all duration-300 hover:scale-105">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                  <span className="font-medium">{t('hero.madeByParents')}</span>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in order-1 lg:order-2">
              <div className="gradient-dynamic rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl animate-float card-glow gpu-accelerated">
                <img src="/lovable-uploads/6667cdc7-f4a7-4fad-9507-4f558fe9e8df.png" alt="SleepyBabyy - Baby sleeping peacefully on moon" className="w-full h-auto rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105" loading="lazy" width="400" height="300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
              {t('features.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => <FeatureCard key={index} feature={feature} index={index} />)}
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8 gradient-dynamic-slow">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 animate-fade-in-up order-2 lg:order-1">
               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                 Turn Sleep Data Into 
                 <span className="text-gradient block mt-1">Actionable Insights</span>
               </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light">
                Our intelligent analytics help you spot patterns, predict optimal bedtimes, and understand what works best for your unique baby. 
                No more guessing - just gentle, data-driven guidance.
              </p>
              <div className="space-y-3 sm:space-y-4">
                {["Weekly sleep pattern analysis", "Personalized bedtime recommendations", "Sleep regression alerts and tips", "Progress tracking and milestones"].map((item, index) => <div key={index} className="flex items-center space-x-3 transition-all duration-300 hover:scale-105" style={{
                animationDelay: `${index * 100}ms`
              }}>
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700 font-medium">{item}</span>
                  </div>)}
              </div>
               <Button size="lg" className="gradient-dynamic transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium text-white border-0 touch-target w-full sm:w-auto" onClick={handleGetStarted}>
                 See Your Sleep Insights
               </Button>
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl animate-scale-in card-glow order-1 lg:order-2">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">This Week's Summary</h3>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                   <div className="gradient-dynamic-slow rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                     <div className="text-xl sm:text-2xl font-bold text-white">11.2h</div>
                    <div className="text-xs sm:text-sm text-white/80">Avg. Night Sleep</div>
                  </div>
                  <div className="bg-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">2.1h</div>
                    <div className="text-xs sm:text-sm text-gray-600">Avg. Day Naps</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Sleep Quality</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs sm:text-sm font-medium text-green-800">
                      🎉 Bedtime routine is working great! Keep it up.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
              Simple, Transparent Pricing
            </h2>
            <div className="space-y-2">
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                Start for free with our Basic plan, or unlock premium features with our affordable Premium plan.
              </p>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Perfect for families of any size.
              </p>
            </div>
          </div>
          
          <div className="animate-fade-in-up text-center" style={{
          animationDelay: '200ms'
        }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-6 sm:mb-8">
              {/* Basic Plan Preview */}
              <Card className="border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    <h3 className="text-xl sm:text-2xl font-bold">SleepyBabyy Basic</h3>
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Free</div>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Perfect for getting started</p>
                  <ul className="space-y-2 sm:space-y-3 text-left mb-6 sm:mb-8">
                    <li className="flex items-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">1 baby profile</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Current day tracking</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Basic sleep reports</span>
                    </li>
                  </ul>
                  <Button className="w-full touch-target" variant="outline" onClick={handleGetStarted}>
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Plan Preview */}
              <Card className="border-2 border-orange-500 hover:shadow-xl transition-all duration-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white text-xs sm:text-sm">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                    <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    <h3 className="text-xl sm:text-2xl font-bold">SleepyBabyy Premium</h3>
                  </div>
                  
                  {/* Discount Badge */}
                  <div className="inline-flex items-center justify-center bg-red-100 text-red-800 text-xs sm:text-sm font-bold px-3 py-1 rounded-full mb-3 sm:mb-4 animate-pulse">
                    40% OFF LIMITED TIME
                  </div>
                  
                  {/* Pricing with old price crossed out */}
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <span className="text-base sm:text-lg text-gray-500 line-through font-medium">$14.99</span>
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">$9.99</span>
                    <span className="text-sm sm:text-base text-gray-600">/month</span>
                  </div>
                  <p className="text-red-600 text-xs sm:text-sm font-medium mb-3 sm:mb-4">Save $5.00 per month!</p>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Complete baby tracking solution</p>
                  
                  <ul className="space-y-2 sm:space-y-3 text-left mb-6 sm:mb-8">
                    <li className="flex items-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Unlimited baby profiles</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Extended activity history</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Family sharing & collaboration</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Advanced analytics & trends</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 touch-target" onClick={handleViewPricing}>
                    {user ? 'View All Features' : 'Start Premium Trial'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" variant="outline" onClick={handleViewPricing} className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 touch-target">
              View Detailed Pricing & Features
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
              Loved by Parents Everywhere
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light leading-relaxed">
              Join thousands of families who've found their way to better sleep.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => <TestimonialCard key={index} testimonial={testimonial} index={index} />)}
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
             <Button size="lg" variant="outline" onClick={handleViewPricing} className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-white transition-all duration-300 hover:scale-105 font-medium bg-white/10 text-white hover:bg-white/20 touch-target w-full sm:w-auto">
               View Pricing
             </Button>
          </div>
          
          <p className="text-blue-100 text-xs sm:text-sm mt-4 sm:mt-6 font-medium leading-relaxed">
            Free 7-day trial • No credit card required • Available on iOS & Android
          </p>
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
    </div>;
};
export default Index;

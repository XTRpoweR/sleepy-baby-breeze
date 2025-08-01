
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Moon, 
  User,
  LogOut,
  Crown,
  Settings,
  ArrowLeft,
  Check,
  Star,
  Shield,
  Zap,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { LanguageSelector } from '@/components/LanguageSelector';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { InvoiceHistory } from '@/components/subscription/InvoiceHistory';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';

const Subscription = () => {
  const { user, loading, signOut } = useAuth();
  const { subscriptionTier, isPremium, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleManageSubscription = () => {
    openCustomerPortal();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Moon className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your baby's data is encrypted and secure with bank-level security."
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Data syncs instantly across all your devices and family members."
    },
    {
      icon: Users,
      title: "Family Collaboration",
      description: "Share tracking with partners, grandparents, and caregivers seamlessly."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get detailed insights and patterns to optimize your baby's routine."
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Mom of 2",
      content: "The premium features helped us understand our baby's sleep patterns so much better!",
      rating: 5
    },
    {
      name: "David & Lisa",
      role: "New Parents",
      content: "Family sharing is a game-changer. Both grandparents can help track feeding times.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes! You can cancel your subscription at any time through the customer portal. No questions asked."
    },
    {
      question: "What happens to my data if I downgrade?",
      answer: "Your data is always safe. You'll keep access to basic features and recent activity history."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 7-day free trial and a 30-day money-back guarantee for your peace of mind."
    },
    {
      question: "How many family members can I add?",
      answer: "Premium plans include unlimited family member access with full collaboration features."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Headers */}
      <DesktopHeader />
      <MobileHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Back to Dashboard</span>
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Choose Your Plan
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-xl max-w-3xl">
                Get the most out of your baby tracking experience with features designed for modern families.
              </p>
            </div>
            
            {/* Subscription Status & Language - Mobile */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Subscription Status */}
              <div className="flex items-center space-x-2">
                {isPremium ? (
                  <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    <Crown className="h-4 w-4" />
                    <span>Premium</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    <User className="h-4 w-4" />
                    <span>Basic</span>
                  </div>
                )}
                {isPremium && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManageSubscription}
                    className="flex items-center space-x-1"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Manage</span>
                  </Button>
                )}
              </div>

              {/* Mobile Language Selector */}
              <div className="sm:hidden">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="mb-12 lg:mb-16">
          <SubscriptionPlans />
        </div>

        {/* Invoice History - Show only for premium users */}
        {isPremium && (
          <div className="mb-12 lg:mb-16">
            <InvoiceHistory />
          </div>
        )}

        {/* Features Section */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 lg:mb-12">
            Why Families Love SleepyBaby Premium
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <div className="bg-blue-100 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 lg:mb-12">
            What Parents Say
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex space-x-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-3 sm:mb-4 italic text-sm sm:text-base">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 lg:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm sm:text-base">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 sm:p-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-green-100 rounded-full p-2 sm:p-3">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">30-Day Money-Back Guarantee</h3>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            Try SleepyBaby Premium risk-free. If you're not completely satisfied, we'll refund your money within 30 days.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>No questions asked</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Full refund</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscription;

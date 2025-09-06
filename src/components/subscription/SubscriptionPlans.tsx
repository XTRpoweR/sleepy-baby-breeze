import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Baby, Clock, BarChart3, Users, Calendar, Download, Sparkles, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const SubscriptionPlans = () => {
  const {
    subscriptionTier,
    createCheckout,
    upgradingMonthly,
    upgradingAnnual,
    isPremium,
    isPremiumAnnual,
    isTrial,
    trialDaysLeft
  } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  
  const handleUpgrade = (pricingPlan: 'monthly' | 'annual' = 'monthly') => {
    if (!user) {
      navigate('/auth');
      return;
    }
    createCheckout(pricingPlan);
  };

  const basicFeatures = [
    { icon: Baby, text: "1 baby profile", available: true },
    { icon: Clock, text: "Current day activity tracking", available: true },
    { icon: BarChart3, text: "Basic sleep reports", available: true },
    { icon: Calendar, text: "Simple sleep schedule", available: true }
  ];

  const premiumFeatures = [
    { icon: Baby, text: "Unlimited baby profiles", available: true },
    { icon: Clock, text: "Extended activity history", available: true },
    { icon: BarChart3, text: "Advanced analytics & trends", available: true },
    { icon: Users, text: "Family sharing & collaboration", available: true },
    { icon: Calendar, text: "AI-powered sleep optimization", available: true },
    { icon: Download, text: "Data export & backup", available: true },
    { icon: Sparkles, text: "Premium sounds library", available: true }
  ];

  const isCurrentPlan = (plan: string) => {
    if (plan === 'basic') return subscriptionTier === 'basic';
    if (plan === 'premium_monthly') return subscriptionTier === 'premium';
    if (plan === 'premium_annual') return subscriptionTier === 'premium_annual';
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Pricing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedPlan === 'annual'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Annual
            <Badge className="ml-2 bg-green-500 text-white text-xs">Save $60</Badge>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Basic Plan */}
        <Card className={`relative transition-all duration-300 hover:shadow-xl ${isCurrentPlan('basic') ? 'ring-2 ring-blue-500' : 'hover:-translate-y-1'}`}>
          <CardHeader className="text-center pb-6 lg:pb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Baby className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <CardTitle className="text-lg sm:text-xl">Basic</CardTitle>
              {isCurrentPlan('basic') && (
                <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                  Current Plan
                </Badge>
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Free</div>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Perfect for getting started</p>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6">
            <div className="space-y-3 lg:space-y-4">
              {basicFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-1">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                  </div>
                  <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
            <Button 
              className="w-full touch-target" 
              variant={isCurrentPlan('basic') ? 'default' : 'outline'} 
              disabled={isCurrentPlan('basic')} 
              onClick={() => !user && navigate('/auth')}
            >
              {user ? isCurrentPlan('basic') ? 'Current Plan' : 'Downgrade' : 'Get Started Free'}
            </Button>
          </CardContent>
        </Card>

        {/* Premium Monthly Plan */}
        <Card className={`relative transition-all duration-300 hover:shadow-xl ${
          selectedPlan === 'monthly' ? 'ring-2 ring-orange-200' : ''
        } ${isCurrentPlan('premium_monthly') ? 'ring-2 ring-orange-500' : 'hover:-translate-y-1'}`}>
          {selectedPlan === 'monthly' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-orange-500 text-white shadow-lg text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            </div>
          )}
          <CardHeader className="text-center pb-6 lg:pb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              <CardTitle className="text-lg sm:text-xl">Premium Monthly</CardTitle>
              {isCurrentPlan('premium_monthly') && !isTrial && (
                <Badge variant="default" className="bg-orange-100 text-orange-800 text-xs">
                  Current Plan
                </Badge>
              )}
              {user && isTrial && subscriptionTier === 'premium' && (
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                  Trial - {trialDaysLeft} days left
                </Badge>
              )}
            </div>
            
            <div className="mb-2">
              <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-1">
                40% OFF
              </Badge>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through font-medium">$49.99</span>
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$29.99</span>
              <span className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base">/month</span>
            </div>
            <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">Save $20.00 per month!</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Complete baby tracking solution</p>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6">
            <div className="space-y-3 lg:space-y-4">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-1">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                  </div>
                  <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
            <Button 
              className={`w-full transition-all duration-300 hover:scale-105 touch-target ${
                selectedPlan === 'monthly' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              onClick={() => handleUpgrade('monthly')} 
              disabled={upgradingMonthly || isCurrentPlan('premium_monthly')}
            >
              {upgradingMonthly ? 'Processing...' : 
               isCurrentPlan('premium_monthly') && !isTrial ? 'Current Plan' : 
               user && isTrial && subscriptionTier === 'premium' ? `Trial (${trialDaysLeft} days left)` : 
               user ? 'Start Free Trial' : 'Start Free Trial'}
            </Button>
            {(!user || !isPremium || (isTrial && subscriptionTier === 'premium')) && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                {isTrial && subscriptionTier === 'premium' ? ' • 7-day free trial • Cancel anytime during trial' : ' • 7-day free trial • Cancel anytime'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Premium Annual Plan */}
        <Card className={`relative transition-all duration-300 hover:shadow-xl ${
          selectedPlan === 'annual' ? 'ring-2 ring-purple-200' : ''
        } ${isCurrentPlan('premium_annual') ? 'ring-2 ring-purple-500' : 'hover:-translate-y-1'}`}>
          {selectedPlan === 'annual' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-500 text-white shadow-lg text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Best Value
              </Badge>
            </div>
          )}
          <CardHeader className="text-center pb-6 lg:pb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <CardTitle className="text-lg sm:text-xl">Premium Annual</CardTitle>
              {isCurrentPlan('premium_annual') && (
                <Badge variant="default" className="bg-purple-100 text-purple-800 text-xs">
                  Current Plan
                </Badge>
              )}
              {user && isTrial && subscriptionTier === 'premium_annual' && (
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                  Trial - {trialDaysLeft} days left
                </Badge>
              )}
            </div>
            
            <div className="mb-2">
              <Badge className="bg-green-500 text-white text-xs font-bold px-2 py-1">
                Save $60/year
              </Badge>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through font-medium">$359.88</span>
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$299</span>
              <span className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base">/year</span>
            </div>
            <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">Equivalent to $24.92/month</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">All premium features included</p>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6">
            <div className="space-y-3 lg:space-y-4">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-1">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                  </div>
                  <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
            <Button 
              className={`w-full transition-all duration-300 hover:scale-105 touch-target ${
                selectedPlan === 'annual' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              onClick={() => handleUpgrade('annual')} 
              disabled={upgradingAnnual || isCurrentPlan('premium_annual')}
            >
              {upgradingAnnual ? 'Processing...' : 
               isCurrentPlan('premium_annual') && !isTrial ? 'Current Plan' : 
               user && isTrial && subscriptionTier === 'premium_annual' ? `Trial (${trialDaysLeft} days left)` : 
               user ? 'Start Free Trial' : 'Start Free Trial'}
            </Button>
            {(!user || !isPremiumAnnual || (isTrial && subscriptionTier === 'premium_annual')) && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                {isTrial && subscriptionTier === 'premium_annual' ? ' • 7-day free trial • Cancel anytime during trial' : ' • 7-day free trial • Cancel anytime'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
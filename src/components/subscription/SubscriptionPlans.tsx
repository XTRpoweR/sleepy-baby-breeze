
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Crown, 
  Baby, 
  Clock, 
  BarChart3, 
  Users, 
  Calendar,
  Download,
  Sparkles
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const SubscriptionPlans = () => {
  const { subscriptionTier, createCheckout, upgrading, isPremium } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    createCheckout();
  };

  const basicFeatures = [
    { icon: Baby, text: "1 baby profile", available: true },
    { icon: Clock, text: "Current day activity tracking", available: true },
    { icon: BarChart3, text: "Basic sleep reports", available: true },
    { icon: Calendar, text: "Simple sleep schedule", available: true },
  ];

  const premiumFeatures = [
    { icon: Baby, text: "Unlimited baby profiles", available: true },
    { icon: Clock, text: "Extended activity history", available: true },
    { icon: BarChart3, text: "Advanced analytics & trends", available: true },
    { icon: Users, text: "Family sharing & collaboration", available: true },
    { icon: Calendar, text: "AI-powered sleep optimization", available: true },
    { icon: Download, text: "Data export & backup", available: true },
    { icon: Sparkles, text: "Premium sounds library", available: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
      {/* Basic Plan */}
      <Card className={`relative transition-all duration-300 hover:shadow-xl ${user && subscriptionTier === 'basic' ? 'ring-2 ring-blue-500' : 'hover:-translate-y-1'}`}>
        <CardHeader className="text-center pb-6 lg:pb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Baby className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <CardTitle className="text-lg sm:text-xl">SleepyBaby Basic</CardTitle>
            {user && subscriptionTier === 'basic' && (
              <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                Current Plan
              </Badge>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-gray-900">Free</div>
          <p className="text-gray-600 text-sm sm:text-base">Perfect for getting started</p>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-6">
          <div className="space-y-3 lg:space-y-4">
            {basicFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-1">
                  <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                </div>
                <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
          <Button 
            className="w-full touch-target" 
            variant={user && subscriptionTier === 'basic' ? 'default' : 'outline'}
            disabled={user && subscriptionTier === 'basic'}
            onClick={() => !user && navigate('/auth')}
          >
            {user ? (subscriptionTier === 'basic' ? 'Current Plan' : 'Downgrade') : 'Get Started Free'}
          </Button>
        </CardContent>
      </Card>

      {/* Premium Plan */}
      <Card className={`relative transition-all duration-300 hover:shadow-xl ${user && subscriptionTier === 'premium' ? 'ring-2 ring-orange-500' : 'ring-2 ring-orange-200 hover:-translate-y-1'}`}>
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-orange-500 text-white shadow-lg text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
        <CardHeader className="text-center pb-6 lg:pb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            <CardTitle className="text-lg sm:text-xl">SleepyBaby Premium</CardTitle>
            {user && subscriptionTier === 'premium' && (
              <Badge variant="default" className="bg-orange-100 text-orange-800 text-xs">
                Current Plan
              </Badge>
            )}
          </div>
          
          {/* Discount Badge */}
          <div className="mb-2">
            <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-1">
              40% OFF
            </Badge>
          </div>
          
          {/* Pricing with old price crossed out */}
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className="text-lg sm:text-xl text-gray-500 line-through font-medium">$14.99</span>
            <span className="text-3xl sm:text-4xl font-bold text-gray-900">$9.99</span>
            <span className="text-gray-600 font-medium text-sm sm:text-base">/month</span>
          </div>
          <p className="text-red-600 text-xs sm:text-sm font-medium">Save $5.00 per month!</p>
          <p className="text-gray-600 text-sm sm:text-base">Complete baby tracking solution</p>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-6">
          <div className="space-y-3 lg:space-y-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-1">
                  <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                </div>
                <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
          <Button 
            className="w-full bg-orange-600 hover:bg-orange-700 transition-all duration-300 hover:scale-105 touch-target" 
            onClick={handleUpgrade}
            disabled={upgrading || (user && isPremium)}
          >
            {upgrading ? 'Processing...' : (user && isPremium) ? 'Current Plan' : user ? 'Upgrade to Premium' : 'Start Premium Trial'}
          </Button>
          {(!user || !isPremium) && (
            <p className="text-xs text-center text-gray-500">
              7-day free trial • Cancel anytime
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


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

export const SubscriptionPlans = () => {
  const { subscriptionTier, createCheckout, upgrading, isPremium } = useSubscription();

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
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Basic Plan */}
      <Card className={`relative ${subscriptionTier === 'basic' ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Baby className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">SleepyBaby Basic</CardTitle>
            {subscriptionTier === 'basic' && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Current Plan
              </Badge>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">Free</div>
          <p className="text-gray-600">Perfect for getting started</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {basicFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <feature.icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
          <Button 
            className="w-full" 
            variant={subscriptionTier === 'basic' ? 'default' : 'outline'}
            disabled={subscriptionTier === 'basic'}
          >
            {subscriptionTier === 'basic' ? 'Current Plan' : 'Downgrade'}
          </Button>
        </CardContent>
      </Card>

      {/* Premium Plan */}
      <Card className={`relative ${subscriptionTier === 'premium' ? 'ring-2 ring-orange-500' : 'ring-2 ring-orange-200'}`}>
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-orange-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-xl">SleepyBaby Premium</CardTitle>
            {subscriptionTier === 'premium' && (
              <Badge variant="default" className="bg-orange-100 text-orange-800">
                Current Plan
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-3xl font-bold text-gray-900">$9.99</span>
            <span className="text-gray-600">/month</span>
          </div>
          <p className="text-gray-600">Complete baby tracking solution</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <feature.icon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
          <Button 
            className="w-full bg-orange-600 hover:bg-orange-700" 
            onClick={createCheckout}
            disabled={upgrading || isPremium}
          >
            {upgrading ? 'Processing...' : isPremium ? 'Current Plan' : 'Upgrade to Premium'}
          </Button>
          {!isPremium && (
            <p className="text-xs text-center text-gray-500">
              7-day free trial • Cancel anytime
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

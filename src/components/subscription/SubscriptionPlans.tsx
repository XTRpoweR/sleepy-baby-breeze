import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Baby, Clock, BarChart3, Users, Calendar, Download, Sparkles, Zap, Bot, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGeoCurrency } from '@/hooks/useGeoCurrency';
import { cn } from '@/lib/utils';

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
  const { currency, loading: currencyLoading, convertPrice, isUSD } = useGeoCurrency();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  const handleUpgrade = (pricingPlan: 'monthly' | 'annual' = 'monthly') => {
    if (!user) {
      navigate('/auth');
      return;
    }
    createCheckout(pricingPlan);
  };

  const basicFeatures = [
    { icon: Bot, text: "AI Q&A Assistant — ask anything about your baby & the app", available: true },
    { icon: Baby, text: "1 baby profile", available: true },
    { icon: Clock, text: "Current day activity tracking", available: true },
    { icon: BarChart3, text: "Basic sleep reports", available: true },
    { icon: Calendar, text: "Simple sleep schedule", available: true }
  ];

  const premiumFeatures = [
    { icon: Bot, text: "Smart AI Assistant — auto-logs sleep, feeding, diapers & manages notifications by command", available: true, isNew: true },
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

  const monthlySelected = selectedPlan === 'monthly';
  const annualSelected = selectedPlan === 'annual';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Pricing Toggle - Glassmorphism with sliding pill */}
      <div className="flex justify-center mb-10">
        <div className="relative bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-full p-1.5 flex border border-white/30 dark:border-white/10 shadow-lg">
          {/* Sliding pill indicator */}
          <div
            className={cn(
              "absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r shadow-md transition-all duration-500 ease-out",
              monthlySelected
                ? "left-1.5 right-[50%] from-orange-500 to-orange-600"
                : "left-[50%] right-1.5 from-purple-500 to-purple-600"
            )}
          />
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={cn(
              "relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300",
              monthlySelected ? "text-white" : "text-gray-700 dark:text-gray-300 hover:text-gray-900"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('annual')}
            className={cn(
              "relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300",
              annualSelected ? "text-white" : "text-gray-700 dark:text-gray-300 hover:text-gray-900"
            )}
          >
            Annual
            {/* Floating discount tag — always above the button, doesn't compete with the active pill */}
            <span
              className={cn(
                "absolute -top-3 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none border-2 border-white dark:border-slate-900 shadow-md transition-all duration-500 pointer-events-none",
                "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
                annualSelected ? "scale-90 opacity-90" : "scale-100 opacity-100"
              )}
            >
              -$60
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-6">
        {/* ============ Basic Plan ============ */}
        <Card
          className={cn(
            "relative overflow-hidden border border-white/40 dark:border-white/10",
            "bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl",
            "transition-all duration-500 ease-out animate-fade-in",
            "hover:-translate-y-2 hover:shadow-2xl",
            isCurrentPlan('basic') && "ring-2 ring-blue-500"
          )}
          style={{ animationDelay: '0ms' }}
        >
          {/* Soft glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

          <CardHeader className="text-center pb-6 lg:pb-8 relative">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                <Baby className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Basic</CardTitle>
              {isCurrentPlan('basic') && (
                <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                  Current Plan
                </Badge>
              )}
            </div>
            <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Free
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2">Perfect for getting started</p>
            {!isUSD && !currencyLoading && (
              <p className="text-xs text-muted-foreground mt-1">Billing in USD</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6 relative">
            <div className="space-y-3">
              {basicFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 group transition-transform duration-200 hover:translate-x-1"
                >
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-1 shadow-sm shadow-green-500/30">
                    <Check className="h-3 w-3 text-white flex-shrink-0" strokeWidth={3} />
                  </div>
                  <feature.icon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
            <Button
              className="w-full touch-target transition-all duration-300 hover:shadow-lg"
              variant={isCurrentPlan('basic') ? 'default' : 'outline'}
              disabled={isCurrentPlan('basic')}
              onClick={() => !user && navigate('/auth')}
            >
              {user ? isCurrentPlan('basic') ? 'Current Plan' : 'Downgrade' : 'Get Started Free'}
            </Button>
          </CardContent>
        </Card>

        {/* ============ Premium Monthly Plan ============ */}
        <div className="relative">
          {monthlySelected && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 animate-scale-in">
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 text-xs px-3 py-1 border-0 whitespace-nowrap">
                <Crown className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            </div>
          )}
        <Card
          className={cn(
            "relative overflow-hidden border backdrop-blur-xl animate-fade-in h-full",
            "transition-all duration-500 ease-out",
            monthlySelected
              ? "bg-white/85 dark:bg-slate-900/80 border-orange-300/60 dark:border-orange-500/40 shadow-2xl shadow-orange-500/20 lg:scale-105 lg:-translate-y-2 ring-2 ring-orange-400/60"
              : "bg-white/50 dark:bg-slate-900/40 border-white/30 dark:border-white/10 lg:scale-95 opacity-70 hover:opacity-90 hover:-translate-y-1",
            isCurrentPlan('premium_monthly') && "ring-2 ring-orange-500"
          )}
          style={{ animationDelay: '100ms' }}
        >
          {/* Animated top accent bar (only when selected) */}
          {monthlySelected && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#f97316,#fbbf24,#ef4444,#fbbf24,#f97316)] bg-[length:200%_100%] animate-gradient-shift z-10" />
          )}
          {/* Drifting glow orbs */}
          <div className={cn(
            "absolute -top-24 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity duration-500",
            monthlySelected ? "bg-orange-400/40 opacity-100 animate-orb-drift" : "bg-orange-400/10 opacity-50"
          )} />
          <div className={cn(
            "absolute -bottom-24 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity duration-500",
            monthlySelected ? "bg-amber-400/30 opacity-100 animate-glow-pulse" : "opacity-0"
          )} style={{ animationDelay: '1.5s' }} />


          <CardHeader className="text-center pb-6 lg:pb-8 relative">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="bg-orange-100 dark:bg-orange-900/40 rounded-full p-2">
                <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
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

            <div className="mb-2 flex justify-center">
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 shadow-md shadow-red-500/30 border-0">
                40% OFF
              </Badge>
            </div>

            {currencyLoading ? (
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Loading...</div>
            ) : (
              <>
                <div className="flex items-baseline justify-center space-x-2 mb-1">
                  <span className="text-base sm:text-lg text-gray-400 dark:text-gray-500 line-through font-medium">
                    {convertPrice(49.99)}
                  </span>
                  <span className={cn(
                    "text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent transition-all duration-500",
                    "bg-gradient-to-r from-orange-500 to-amber-500",
                    monthlySelected && "drop-shadow-md"
                  )}>
                    {convertPrice(29.99)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base">/month</span>
                </div>
                <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold">
                  Save {convertPrice(20.00, false)} per month!
                </p>
                {!isUSD && (
                  <p className="text-xs text-muted-foreground">Billing in USD</p>
                )}
              </>
            )}
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2">Complete baby tracking solution</p>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6 relative">
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 group transition-transform duration-200 hover:translate-x-1"
                >
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-1 shadow-sm shadow-green-500/30">
                    <Check className="h-3 w-3 text-white flex-shrink-0" strokeWidth={3} />
                  </div>
                  <feature.icon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium flex-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                  {(feature as any).isNew && (
                    <Badge className="bg-gradient-to-r from-primary to-purple-500 text-primary-foreground text-[10px] h-5 px-1.5 border-0">NEW</Badge>
                  )}
                </div>
              ))}
            </div>
            <Button
              className={cn(
                "w-full touch-target group transition-all duration-300",
                monthlySelected
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/40 hover:shadow-xl hover:shadow-orange-500/50 hover:scale-[1.02] py-6 text-base font-semibold"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200"
              )}
              onClick={() => handleUpgrade('monthly')}
              disabled={upgradingMonthly || isCurrentPlan('premium_monthly')}
            >
              <span className="flex items-center justify-center gap-2">
                {upgradingMonthly ? 'Processing...' :
                  isCurrentPlan('premium_monthly') && !isTrial ? 'Current Plan' :
                    user && isTrial && subscriptionTier === 'premium' ? `Trial (${trialDaysLeft} days left)` :
                      user ? 'Start Free Trial' : 'Start Free Trial'}
                {monthlySelected && !upgradingMonthly && !isCurrentPlan('premium_monthly') && (
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                )}
              </span>
            </Button>
            {(!user || !isPremium || (isTrial && subscriptionTier === 'premium')) && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                {isTrial && subscriptionTier === 'premium' ? ' • 7-day free trial • Cancel anytime during trial' : ' • 7-day free trial • Cancel anytime'}
              </p>
            )}
          </CardContent>
        </Card>
        </div>

        {/* ============ Premium Annual Plan ============ */}
        <div className="relative">
          {annualSelected && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 animate-scale-in">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 text-xs px-3 py-1 border-0 whitespace-nowrap">
                <Zap className="h-3 w-3 mr-1" />
                Best Value
              </Badge>
            </div>
          )}
        <Card
          className={cn(
            "relative overflow-hidden border backdrop-blur-xl animate-fade-in h-full",
            "transition-all duration-500 ease-out",
            annualSelected
              ? "bg-white/85 dark:bg-slate-900/80 border-purple-300/60 dark:border-purple-500/40 shadow-2xl shadow-purple-500/20 lg:scale-105 lg:-translate-y-2 ring-2 ring-purple-400/60"
              : "bg-white/50 dark:bg-slate-900/40 border-white/30 dark:border-white/10 lg:scale-95 opacity-70 hover:opacity-90 hover:-translate-y-1",
            isCurrentPlan('premium_annual') && "ring-2 ring-purple-500"
          )}
          style={{ animationDelay: '200ms' }}
        >
          {/* Animated top accent bar (only when selected) */}
          {annualSelected && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#a855f7,#ec4899,#8b5cf6,#ec4899,#a855f7)] bg-[length:200%_100%] animate-gradient-shift z-10" />
          )}
          {/* Drifting glow orbs */}
          <div className={cn(
            "absolute -top-24 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity duration-500",
            annualSelected ? "bg-purple-400/40 opacity-100 animate-orb-drift" : "bg-purple-400/10 opacity-50"
          )} />
          <div className={cn(
            "absolute -bottom-24 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity duration-500",
            annualSelected ? "bg-pink-400/30 opacity-100 animate-glow-pulse" : "opacity-0"
          )} style={{ animationDelay: '1.5s' }} />

          <CardHeader className="text-center pb-6 lg:pb-8 relative">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="bg-purple-100 dark:bg-purple-900/40 rounded-full p-2">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
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

            <div className="mb-2 flex justify-center">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 shadow-md shadow-green-500/30 border-0">
                Save $60/year
              </Badge>
            </div>

            {currencyLoading ? (
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Loading...</div>
            ) : (
              <>
                <div className="flex items-baseline justify-center space-x-2 mb-1">
                  <span className="text-base sm:text-lg text-gray-400 dark:text-gray-500 line-through font-medium">
                    {convertPrice(359.88)}
                  </span>
                  <span className={cn(
                    "text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent transition-all duration-500",
                    "bg-gradient-to-r from-purple-500 to-pink-500",
                    annualSelected && "drop-shadow-md"
                  )}>
                    {convertPrice(299)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base">/year</span>
                </div>
                <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold">
                  Equivalent to {convertPrice(299 / 12)}/month
                </p>
                {!isUSD && (
                  <p className="text-xs text-muted-foreground">Billing in USD</p>
                )}
              </>
            )}
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2">All premium features included</p>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6 relative">
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 group transition-transform duration-200 hover:translate-x-1"
                >
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-1 shadow-sm shadow-green-500/30">
                    <Check className="h-3 w-3 text-white flex-shrink-0" strokeWidth={3} />
                  </div>
                  <feature.icon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium flex-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                  {(feature as any).isNew && (
                    <Badge className="bg-gradient-to-r from-primary to-purple-500 text-primary-foreground text-[10px] h-5 px-1.5 border-0">NEW</Badge>
                  )}
                </div>
              ))}
            </div>
            <Button
              className={cn(
                "w-full touch-target group transition-all duration-300",
                annualSelected
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-[1.02] py-6 text-base font-semibold"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200"
              )}
              onClick={() => handleUpgrade('annual')}
              disabled={upgradingAnnual || isCurrentPlan('premium_annual')}
            >
              <span className="flex items-center justify-center gap-2">
                {upgradingAnnual ? 'Processing...' :
                  isCurrentPlan('premium_annual') && !isTrial ? 'Current Plan' :
                    user && isTrial && subscriptionTier === 'premium_annual' ? `Trial (${trialDaysLeft} days left)` :
                      user ? 'Start Free Trial' : 'Start Free Trial'}
                {annualSelected && !upgradingAnnual && !isCurrentPlan('premium_annual') && (
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                )}
              </span>
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
    </div>
  );
};

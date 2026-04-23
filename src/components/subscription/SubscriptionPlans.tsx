import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Baby, Clock, BarChart3, Users, Calendar, Download, Sparkles, Zap, Bot, ArrowRight, Star } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGeoCurrency } from '@/hooks/useGeoCurrency';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type PlanKey = 'monthly' | 'quarterly' | 'annual';

export const SubscriptionPlans = () => {
  const {
    subscriptionTier,
    createCheckout,
    upgradingMonthly,
    upgradingQuarterly,
    upgradingAnnual,
    isPremium,
    isPremiumQuarterly,
    isPremiumAnnual,
    isTrial,
    trialDaysLeft,
  } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currencyLoading, convertPrice, isUSD } = useGeoCurrency() as any;
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('quarterly');

  const handleUpgrade = (plan: PlanKey) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    createCheckout(plan);
  };

  const basicFeatures = [
    { icon: Bot, text: t('pricing.features.basic.ai') },
    { icon: Baby, text: t('pricing.features.basic.profile') },
    { icon: Clock, text: t('pricing.features.basic.todayTracking') },
    { icon: BarChart3, text: t('pricing.features.basic.basicReports') },
    { icon: Calendar, text: t('pricing.features.basic.simpleSchedule') },
  ];

  const premiumFeatures = [
    { icon: Bot, text: t('pricing.features.premium.smartAi'), isNew: true },
    { icon: Baby, text: t('pricing.features.premium.unlimitedProfiles') },
    { icon: Clock, text: t('pricing.features.premium.extendedHistory') },
    { icon: BarChart3, text: t('pricing.features.premium.advancedAnalytics') },
    { icon: Users, text: t('pricing.features.premium.familySharing') },
    { icon: Calendar, text: t('pricing.features.premium.aiSleepOptimization') },
    { icon: Download, text: t('pricing.features.premium.exportBackup') },
    { icon: Sparkles, text: t('pricing.features.premium.premiumSounds') },
  ];

  const isCurrentPlan = (plan: 'basic' | PlanKey) => {
    if (plan === 'basic') return subscriptionTier === 'basic';
    if (plan === 'monthly') return subscriptionTier === 'premium';
    if (plan === 'quarterly') return subscriptionTier === 'premium_quarterly';
    if (plan === 'annual') return subscriptionTier === 'premium_annual';
    return false;
  };

  const PRICES = { monthly: 7.99, quarterly: 19.99, annual: 69.99 };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Triple Toggle */}
      <div className="flex justify-center mb-10 px-4">
        <div className="relative bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-full p-1.5 flex border border-white/30 dark:border-white/10 shadow-lg">
          {(['monthly', 'quarterly', 'annual'] as PlanKey[]).map((plan) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={cn(
                'relative z-10 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300',
                selectedPlan === plan
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900'
              )}
            >
              {t(`pricing.toggle.${plan}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-6">
        {/* ============ Basic Plan ============ */}
        <Card
          className={cn(
            'pricing-card relative overflow-hidden border border-white/40 dark:border-white/10',
            'bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl',
            'transition-all duration-500 ease-out animate-fade-in',
            'hover:-translate-y-2 hover:shadow-2xl',
            isCurrentPlan('basic') && 'ring-2 ring-blue-500'
          )}
          style={{ animationDelay: '0ms' }}
        >
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

          <CardHeader className="text-center pb-6 relative">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                <Baby className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">{t('pricing.plans.basic.name')}</CardTitle>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {t('pricing.free')}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{t('pricing.plans.basic.subtitle')}</p>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <div className="space-y-3">
              {basicFeatures.map((f, i) => (
                <div key={i} className="flex items-center space-x-3 group transition-transform duration-200 hover:translate-x-1">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-1 shadow-sm shadow-green-500/30">
                    <Check className="h-3 w-3 text-white flex-shrink-0" strokeWidth={3} />
                  </div>
                  <f.icon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{f.text}</span>
                </div>
              ))}
            </div>
            <Button
              className="w-full rounded-full py-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
              disabled={isCurrentPlan('basic') && !!user}
              onClick={() => !user && navigate('/auth')}
            >
              {user ? (isCurrentPlan('basic') ? t('pricing.cta.currentPlan') : t('pricing.cta.downgrade')) : t('pricing.cta.getStartedFree')}
            </Button>
          </CardContent>
        </Card>

        {/* ============ Monthly Plan ============ */}
        <PlanCard
          planKey="monthly"
          icon={Crown}
          color="orange"
          title={t('pricing.plans.monthly.name')}
          subtitle={t('pricing.plans.monthly.subtitle')}
          price={convertPrice(PRICES.monthly)}
          intervalLabel={t('pricing.interval.month')}
          equivalentLabel={null}
          badge={null}
          isSelected={selectedPlan === 'monthly'}
          isCurrent={isCurrentPlan('monthly')}
          isTrialBadge={user && isTrial && subscriptionTier === 'premium' ? `${t('pricing.trial.label')} - ${trialDaysLeft} ${t('pricing.trial.daysLeft')}` : null}
          features={premiumFeatures}
          loading={upgradingMonthly}
          onClick={() => handleUpgrade('monthly')}
          ctaLabel={user ? t('pricing.cta.startFreeTrial') : t('pricing.cta.startFreeTrial')}
          isUSD={isUSD}
          currencyLoading={currencyLoading}
          delay="100ms"
          t={t}
        />

        {/* ============ Quarterly Plan (NEW - Popular) ============ */}
        <PlanCard
          planKey="quarterly"
          icon={Star}
          color="purple"
          title={t('pricing.plans.quarterly.name')}
          subtitle={t('pricing.plans.quarterly.subtitle')}
          price={convertPrice(PRICES.quarterly)}
          intervalLabel={t('pricing.interval.quarter')}
          equivalentLabel={`${t('pricing.equivalentTo')} ${convertPrice(PRICES.quarterly / 3)}/${t('pricing.interval.month')}`}
          badge={t('pricing.badges.mostPopular')}
          isSelected={selectedPlan === 'quarterly'}
          isCurrent={isCurrentPlan('quarterly')}
          isTrialBadge={user && isTrial && subscriptionTier === 'premium_quarterly' ? `${t('pricing.trial.label')} - ${trialDaysLeft} ${t('pricing.trial.daysLeft')}` : null}
          features={premiumFeatures}
          loading={upgradingQuarterly}
          onClick={() => handleUpgrade('quarterly')}
          ctaLabel={t('pricing.cta.startFreeTrial')}
          isUSD={isUSD}
          currencyLoading={currencyLoading}
          delay="200ms"
          t={t}
        />

        {/* ============ Annual Plan (Best Value) ============ */}
        <PlanCard
          planKey="annual"
          icon={Zap}
          color="emerald"
          title={t('pricing.plans.annual.name')}
          subtitle={t('pricing.plans.annual.subtitle')}
          price={convertPrice(PRICES.annual)}
          intervalLabel={t('pricing.interval.year')}
          equivalentLabel={`${t('pricing.equivalentTo')} ${convertPrice(PRICES.annual / 12)}/${t('pricing.interval.month')}`}
          badge={t('pricing.badges.bestValue')}
          isSelected={selectedPlan === 'annual'}
          isCurrent={isCurrentPlan('annual')}
          isTrialBadge={user && isTrial && subscriptionTier === 'premium_annual' ? `${t('pricing.trial.label')} - ${trialDaysLeft} ${t('pricing.trial.daysLeft')}` : null}
          features={premiumFeatures}
          loading={upgradingAnnual}
          onClick={() => handleUpgrade('annual')}
          ctaLabel={t('pricing.cta.startFreeTrial')}
          isUSD={isUSD}
          currencyLoading={currencyLoading}
          delay="300ms"
          t={t}
        />
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
        {t('pricing.trial.note')}
      </p>
    </div>
  );
};

/* ----------- Reusable Plan Card ----------- */
type Color = 'orange' | 'purple' | 'emerald';

const colorMap: Record<Color, { gradient: string; ring: string; orb: string; iconBg: string; iconColor: string; priceGradient: string }> = {
  orange: {
    gradient: 'from-orange-500 to-amber-500',
    ring: 'ring-orange-400/60',
    orb: 'bg-orange-400/20',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-600 dark:text-orange-400',
    priceGradient: 'from-orange-500 to-amber-500',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    ring: 'ring-purple-400/60',
    orb: 'bg-purple-400/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
    priceGradient: 'from-purple-500 to-pink-500',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    ring: 'ring-emerald-400/60',
    orb: 'bg-emerald-400/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    priceGradient: 'from-emerald-500 to-teal-500',
  },
};

interface PlanCardProps {
  planKey: PlanKey;
  icon: any;
  color: Color;
  title: string;
  subtitle: string;
  price: string;
  intervalLabel: string;
  equivalentLabel: string | null;
  badge: string | null;
  isSelected: boolean;
  isCurrent: boolean;
  isTrialBadge: string | null;
  features: Array<{ icon: any; text: string; isNew?: boolean }>;
  loading: boolean;
  onClick: () => void;
  ctaLabel: string;
  isUSD: boolean;
  currencyLoading: boolean;
  delay: string;
  t: (k: string) => string;
}

const PlanCard = ({
  icon: Icon, color, title, subtitle, price, intervalLabel, equivalentLabel,
  badge, isSelected, isCurrent, isTrialBadge, features, loading, onClick, ctaLabel,
  isUSD, currencyLoading, delay, t,
}: PlanCardProps) => {
  const c = colorMap[color];
  return (
    <div className="relative">
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <Badge className={cn('text-white shadow-lg text-xs px-3 py-1 border-0 whitespace-nowrap bg-gradient-to-r', c.gradient)}>
            <Icon className="h-3 w-3 mr-1" />
            {badge}
          </Badge>
        </div>
      )}
      <Card
        className={cn(
          'pricing-card relative overflow-hidden border backdrop-blur-xl animate-fade-in h-full transition-all duration-500 ease-out',
          isSelected
            ? `bg-white/85 dark:bg-slate-900/80 shadow-2xl lg:scale-105 lg:-translate-y-2 ring-2 ${c.ring}`
            : 'bg-white/60 dark:bg-slate-900/50 border-white/30 dark:border-white/10 hover:-translate-y-1',
          isCurrent && `ring-2 ${c.ring}`
        )}
        style={{ animationDelay: delay }}
      >
        <div className={cn('absolute -top-24 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none', c.orb)} />

        <CardHeader className="text-center pb-6 relative">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className={cn('rounded-full p-2', c.iconBg)}>
              <Icon className={cn('h-5 w-5', c.iconColor)} />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {isTrialBadge && (
            <div className="mb-2 flex justify-center">
              <Badge className="bg-green-100 text-green-800 text-xs">{isTrialBadge}</Badge>
            </div>
          )}
          {currencyLoading ? (
            <div className="text-3xl font-bold text-gray-900 dark:text-white">...</div>
          ) : (
            <>
              <div className="flex items-baseline justify-center space-x-1 mb-1">
                <span className={cn('text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r', c.priceGradient)}>
                  {price}
                </span>
                <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">/{intervalLabel}</span>
              </div>
              {equivalentLabel && (
                <p className="text-green-600 dark:text-green-400 text-xs font-semibold">{equivalentLabel}</p>
              )}
              {!isUSD && (
                <p className="text-xs text-muted-foreground mt-1">{t('pricing.billingInUsd')}</p>
              )}
            </>
          )}
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-1 shadow-sm shadow-green-500/30">
                  <Check className="h-3 w-3 text-white flex-shrink-0" strokeWidth={3} />
                </div>
                <f.icon className={cn('h-4 w-4 flex-shrink-0', c.iconColor)} />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium flex-1">{f.text}</span>
                {f.isNew && (
                  <Badge className="bg-gradient-to-r from-primary to-purple-500 text-primary-foreground text-[10px] h-5 px-1.5 border-0">
                    {t('pricing.badges.new')}
                  </Badge>
                )}
              </div>
            ))}
          </div>
          <Button
            className={cn(
              'w-full rounded-full py-5 text-base font-bold tracking-wide border-0 transition-all duration-300',
              'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white hover:scale-[1.02]'
            )}
            onClick={onClick}
            disabled={loading || isCurrent}
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? t('pricing.cta.processing') : isCurrent ? t('pricing.cta.currentPlan') : ctaLabel}
              {!loading && !isCurrent && <ArrowRight className="h-4 w-4" />}
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Crown, Settings, XCircle, RefreshCw, AlertTriangle, Sparkles, ArrowUpRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const planLabel = (tier: string, t: (k: string, opts?: any) => string): string => {
  switch (tier) {
    case 'premium': return t('pricing.plans.monthly.name');
    case 'premium_quarterly': return t('pricing.plans.quarterly.name');
    case 'premium_annual': return t('pricing.plans.annual.name');
    default: return t('subscription.current.free');
  }
};

const billingLabel = (cycle: string | null, t: (k: string) => string): string | null => {
  if (cycle === 'monthly') return t('subscription.current.billingMonthly');
  if (cycle === 'quarterly') return t('subscription.current.billingQuarterly');
  if (cycle === 'yearly' || cycle === 'annual') return t('subscription.current.billingYearly');
  return null;
};

const formatDate = (iso: string | null, lang: string): string => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(lang || undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return new Date(iso).toLocaleDateString();
  }
};

export const CurrentSubscriptionCard = () => {
  const { t, i18n } = useTranslation();
  const {
    subscriptionTier, isPremium, isTrial, trialDaysLeft,
    currentPeriodEnd, cancelAtPeriodEnd, billingCycle,
    openCustomerPortal,
  } = useSubscription();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isFree = !isPremium;
  const dateStr = formatDate(currentPeriodEnd, i18n.language);

  const handleConfirmCancel = async () => {
    setSubmitting(true);
    try {
      await openCustomerPortal('cancel');
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Card className={cn(
        'relative overflow-hidden border-border bg-card shadow-sm',
        cancelAtPeriodEnd && 'border-amber-300 dark:border-amber-700'
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: Plan info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className={cn(
                  'flex items-center justify-center rounded-full p-1.5',
                  isPremium ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {isPremium ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                  {planLabel(subscriptionTier, t)}
                </h2>
                {isTrial && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-0">
                    {t('subscription.current.trialBadge')}
                  </Badge>
                )}
                {!isTrial && isPremium && !cancelAtPeriodEnd && (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 hover:bg-emerald-100">
                    {t('subscription.current.activeBadge')}
                  </Badge>
                )}
                {cancelAtPeriodEnd && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-0 hover:bg-amber-100">
                    {t('subscription.current.cancelledBadge')}
                  </Badge>
                )}
              </div>

              {isFree ? (
                <p className="text-sm text-muted-foreground">{t('subscription.current.freeDesc')}</p>
              ) : (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {billingLabel(billingCycle, t) && <p>{billingLabel(billingCycle, t)}</p>}
                  {isTrial && trialDaysLeft !== null && (
                    <p className="text-blue-700 dark:text-blue-300 font-medium">
                      {t('subscription.current.trialDaysLeft', { days: trialDaysLeft })}
                    </p>
                  )}
                  {currentPeriodEnd && (
                    <p>
                      {cancelAtPeriodEnd ? t('subscription.current.endsOn') : t('subscription.current.renews')}: <span className="font-medium text-foreground">{dateStr}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
              {isFree ? (
                <Button
                  onClick={() => {
                    document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto"
                >
                  {t('subscription.current.upgrade')}
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => openCustomerPortal()}
                    className="w-full sm:w-auto"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('subscription.current.manage')}
                  </Button>
                  {cancelAtPeriodEnd ? (
                    <Button
                      variant="ghost"
                      onClick={() => openCustomerPortal()}
                      className="w-full sm:w-auto text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t('subscription.current.reactivate')}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => setConfirmOpen(true)}
                      className="w-full sm:w-auto text-muted-foreground hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('subscription.current.cancel')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cancellation banner */}
          {cancelAtPeriodEnd && currentPeriodEnd && (
            <div className="mt-5 flex gap-3 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 p-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  {t('subscription.current.cancelledTitle')}
                </p>
                <p className="text-amber-800 dark:text-amber-300/90 mt-0.5">
                  {t('subscription.current.cancelledBody', { date: dateStr })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('subscription.cancelDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('subscription.cancelDialog.body', { date: dateStr || '—' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              {t('subscription.cancelDialog.keep')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={submitting}>
              {submitting ? '...' : t('subscription.cancelDialog.continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

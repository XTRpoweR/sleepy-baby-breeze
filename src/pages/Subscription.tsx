import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, ArrowLeft, Check, Shield, Mail, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { CurrentSubscriptionCard } from '@/components/subscription/CurrentSubscriptionCard';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { fbqTrack } from '@/utils/metaPixel';
import { buildMetaUserData } from '@/utils/metaUserData';

const Subscription = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    fbqTrack('ViewContent', {
      content_type: 'product_group',
      content_category: 'subscription',
      content_name: 'subscription_page',
      content_ids: ['premium_monthly', 'premium_quarterly', 'premium_annual'],
    }, buildMetaUserData(user));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Moon className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const refundMailto = `mailto:support@sleepybabyy.com?subject=${encodeURIComponent(t('subscription.refund.emailSubject'))}&body=${t('subscription.refund.emailBody')}`;

  const faqs = [
    { question: 'Can I cancel anytime?', answer: 'Yes. Cancel from the "Manage billing" button above. You keep premium access until the end of your billing period.' },
    { question: 'What happens when I downgrade?', answer: 'Your data stays safe. Downgrades take effect at the end of your current billing period.' },
    { question: 'Do you offer refunds?', answer: 'Yes — full refund within 14 days, no questions asked. Use the Request a refund button below.' },
    { question: 'How many family members can I add?', answer: 'Premium plans include unlimited family member access with full collaboration features.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <DesktopHeader />
      <MobileHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Page header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('subscription.backToDashboard')}
          </Button>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            {t('subscription.pageTitle')}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-2xl">
            {t('subscription.pageSubtitle')}
          </p>
        </div>

        {/* Current subscription status */}
        <div className="mb-10">
          <CurrentSubscriptionCard />
        </div>

        {/* Plans */}
        <section id="plans-section" className="mb-12 scroll-mt-20">
          <SubscriptionPlans />
        </section>

        {/* Refund / Money-Back */}
        <section className="mb-12">
          <Card className="border-border bg-card overflow-hidden">
            <div className="absolute" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-shrink-0 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 p-3">
                  <Shield className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    {t('subscription.refund.title')}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                    {t('subscription.refund.subtitle')}
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    {[
                      t('subscription.refund.noQuestions'),
                      t('subscription.refund.fullRefund'),
                      t('subscription.refund.cancelAnytime'),
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-lg bg-muted/50 p-4 text-sm">
                    <p className="font-semibold text-foreground mb-2">
                      {t('subscription.refund.howTitle')}
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>{t('subscription.refund.howStep1')}</li>
                      <li>{t('subscription.refund.howStep2')}</li>
                    </ol>
                  </div>

                  <div className="mt-5">
                    <Button asChild variant="outline">
                      <a href={refundMailto}>
                        <Mail className="h-4 w-4 mr-2" />
                        {t('subscription.refund.requestButton')}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Frequently asked questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border bg-card">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-1.5 text-sm sm:text-base">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Subscription;

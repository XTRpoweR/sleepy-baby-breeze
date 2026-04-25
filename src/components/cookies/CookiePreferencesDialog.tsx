import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, ShieldCheck, BarChart3, Megaphone, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export const CookiePreferencesDialog: React.FC = () => {
  const { t } = useTranslation();
  const { preferencesOpen, closePreferences, consent, savePreferences, acceptAll, rejectAll } =
    useCookieConsent();

  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [marketing, setMarketing] = useState(consent?.marketing ?? false);
  const [functional, setFunctional] = useState(consent?.functional ?? false);

  useEffect(() => {
    if (preferencesOpen) {
      setAnalytics(consent?.analytics ?? false);
      setMarketing(consent?.marketing ?? false);
      setFunctional(consent?.functional ?? false);
    }
  }, [preferencesOpen, consent]);

  const sections = [
    {
      key: 'necessary',
      icon: ShieldCheck,
      title: t('cookies.cat.necessary.title', 'Strictly necessary'),
      desc: t(
        'cookies.cat.necessary.desc',
        'Required for the site to function: authentication, language, security. Cannot be disabled.',
      ),
      value: true,
      onChange: () => {},
      disabled: true,
    },
    {
      key: 'functional',
      icon: Sparkles,
      title: t('cookies.cat.functional.title', 'Functional'),
      desc: t(
        'cookies.cat.functional.desc',
        'Remember preferences such as audio settings and notification choices to improve your experience.',
      ),
      value: functional,
      onChange: setFunctional,
      disabled: false,
    },
    {
      key: 'analytics',
      icon: BarChart3,
      title: t('cookies.cat.analytics.title', 'Analytics'),
      desc: t(
        'cookies.cat.analytics.desc',
        'Help us understand how the app is used (Google Analytics) so we can improve it.',
      ),
      value: analytics,
      onChange: setAnalytics,
      disabled: false,
    },
    {
      key: 'marketing',
      icon: Megaphone,
      title: t('cookies.cat.marketing.title', 'Marketing'),
      desc: t(
        'cookies.cat.marketing.desc',
        'Used to measure the effectiveness of our ads (Meta Pixel) and personalize what you see.',
      ),
      value: marketing,
      onChange: setMarketing,
      disabled: false,
    },
  ];

  return (
    <Dialog open={preferencesOpen} onOpenChange={(o) => !o && closePreferences()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Cookie className="h-5 w-5 text-blue-500" />
            </div>
            <DialogTitle>{t('cookies.prefsTitle', 'Cookie preferences')}</DialogTitle>
          </div>
          <DialogDescription>
            {t(
              'cookies.prefsDesc',
              'Choose which cookies you allow. Your choice is saved on this device and you can change it any time.',
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/30 p-4"
              >
                <div className="shrink-0 h-9 w-9 rounded-full bg-white flex items-center justify-center border border-blue-100">
                  <Icon className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-sm text-gray-900">{s.title}</h3>
                    <Switch
                      checked={s.value}
                      onCheckedChange={s.onChange}
                      disabled={s.disabled}
                      aria-label={s.title}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={rejectAll}
            className="rounded-xl border-gray-300 sm:flex-1"
            size="sm"
          >
            {t('cookies.rejectAll', 'Reject all')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => savePreferences({ analytics, marketing, functional })}
            className="rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 sm:flex-1"
            size="sm"
          >
            {t('cookies.saveChoices', 'Save my choices')}
          </Button>
          <Button
            onClick={acceptAll}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl sm:flex-1"
            size="sm"
          >
            {t('cookies.acceptAll', 'Accept all')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { CookiePreferencesDialog } from './CookiePreferencesDialog';

export const CookieConsentBanner: React.FC = () => {
  const { t } = useTranslation();
  const { showBanner, acceptAll, rejectAll, openPreferences } = useCookieConsent();

  return (
    <>
      <CookiePreferencesDialog />
      {showBanner && (
        <div
          role="dialog"
          aria-label={t('cookies.bannerTitle', 'We value your privacy')}
          aria-live="polite"
          className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 lg:left-auto lg:right-4 lg:bottom-4 lg:max-w-md"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="bg-white/95 backdrop-blur-sm border border-blue-100 shadow-2xl rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Cookie className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-gray-900">
                  {t('cookies.bannerTitle', 'We value your privacy')}
                </h2>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  {t(
                    'cookies.bannerBody',
                    'We use cookies to keep SleepyBabyy running, understand how it is used, and personalize your experience. You can accept all, reject non-essential ones, or customize your choices.',
                  )}{' '}
                  <Link
                    to="/privacy"
                    className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                  >
                    {t('cookies.learnMore', 'Learn more')}
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <Button
                onClick={acceptAll}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex-1"
                size="sm"
              >
                {t('cookies.acceptAll', 'Accept all')}
              </Button>
              <Button
                onClick={rejectAll}
                variant="outline"
                className="rounded-xl flex-1 border-gray-300"
                size="sm"
              >
                {t('cookies.rejectAll', 'Reject all')}
              </Button>
              <Button
                onClick={openPreferences}
                variant="ghost"
                className="rounded-xl flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                size="sm"
              >
                {t('cookies.customize', 'Customize')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

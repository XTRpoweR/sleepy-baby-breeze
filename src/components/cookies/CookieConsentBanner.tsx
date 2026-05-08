import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Sparkles } from 'lucide-react';
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
          aria-label={t('cookies.bannerTitle', 'A little note for new parents')}
          aria-live="polite"
          className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 lg:left-auto lg:right-6 lg:bottom-6 lg:max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl border border-pink-100/80 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.25)] rounded-3xl">
            {/* Soft decorative gradient */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-pink-200/50 to-purple-200/40 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-200/40 to-pink-100/40 blur-2xl" />

            <div className="relative p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="shrink-0 h-11 w-11 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center shadow-sm">
                  <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-1.5">
                    {t('cookies.bannerTitle', 'A little note for new parents')}
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  </h2>
                  <p className="mt-1.5 text-[13.5px] text-gray-600 leading-relaxed">
                    {t(
                      'cookies.bannerBody',
                      'We use cookies only to improve your experience and share helpful, personalized content for new parents — nothing more.',
                    )}{' '}
                    <Link
                      to="/privacy"
                      className="text-pink-600 hover:text-pink-700 font-medium underline-offset-2 hover:underline"
                    >
                      {t('cookies.learnMore', 'Learn more')}
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={acceptAll}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all font-medium h-11"
                >
                  {t('cookies.acceptAll', 'Sounds good')}
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={rejectAll}
                    variant="outline"
                    className="flex-1 rounded-2xl border-gray-200 text-gray-700 hover:bg-gray-50 h-10 text-sm"
                  >
                    {t('cookies.rejectAll', 'Only essentials')}
                  </Button>
                  <Button
                    onClick={openPreferences}
                    variant="ghost"
                    className="flex-1 rounded-2xl text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-10 text-sm"
                  >
                    {t('cookies.customize', 'Customize')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

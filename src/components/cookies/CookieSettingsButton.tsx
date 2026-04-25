import React from 'react';
import { Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '@/hooks/useCookieConsent';

/**
 * Floating button (bottom-left) that lets users re-open cookie preferences.
 * Required by GDPR so users can withdraw consent at any time.
 */
export const CookieSettingsButton: React.FC = () => {
  const { t } = useTranslation();
  const { hasDecided, openPreferences, showBanner } = useCookieConsent();

  // Hide while the banner is visible to avoid overlap
  if (!hasDecided || showBanner) return null;

  return (
    <button
      type="button"
      onClick={openPreferences}
      aria-label={t('cookies.settingsAria', 'Cookie preferences')}
      title={t('cookies.settingsAria', 'Cookie preferences')}
      className="fixed bottom-4 left-4 z-40 h-11 w-11 rounded-full bg-white border border-blue-100 shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Cookie className="h-5 w-5 text-blue-500" />
    </button>
  );
};

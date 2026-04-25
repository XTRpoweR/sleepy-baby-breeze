import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ConsentState,
  acceptAllConsent,
  applyConsent,
  defaultDeniedConsent,
  loadConsent,
  saveConsent,
  CONSENT_VERSION,
} from '@/utils/consentManager';

interface CookieConsentContextValue {
  consent: ConsentState | null;
  hasDecided: boolean;
  showBanner: boolean;
  preferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (partial: Omit<ConsentState, 'necessary' | 'timestamp' | 'version'>) => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentState | null>(() => loadConsent());
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Apply persisted consent on mount so trackers initialize correctly
  useEffect(() => {
    if (consent) applyConsent(consent);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback((next: ConsentState) => {
    saveConsent(next);
    applyConsent(next);
    setConsent(next);
  }, []);

  const acceptAll = useCallback(() => {
    persist(acceptAllConsent());
    setPreferencesOpen(false);
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist(defaultDeniedConsent());
    setPreferencesOpen(false);
  }, [persist]);

  const savePreferences = useCallback(
    (partial: Omit<ConsentState, 'necessary' | 'timestamp' | 'version'>) => {
      persist({
        necessary: true,
        analytics: partial.analytics,
        marketing: partial.marketing,
        functional: partial.functional,
        timestamp: Date.now(),
        version: CONSENT_VERSION,
      });
      setPreferencesOpen(false);
    },
    [persist],
  );

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      hasDecided: consent !== null,
      showBanner: consent === null,
      preferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      acceptAll,
      rejectAll,
      savePreferences,
    }),
    [consent, preferencesOpen, acceptAll, rejectAll, savePreferences],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
};

export const useCookieConsent = (): CookieConsentContextValue => {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used inside CookieConsentProvider');
  return ctx;
};

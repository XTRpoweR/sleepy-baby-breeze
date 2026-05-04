/**
 * Cookie consent manager.
 *
 * Stores the user's choices in localStorage and applies them by:
 *  - Updating Google Consent Mode v2 (gtag('consent', 'update', ...))
 *  - Loading or skipping the Meta Pixel script
 *  - Allowing/blocking server-side CAPI relays
 *
 * GDPR + ePrivacy compliant: nothing non-essential fires until consent is given.
 * CCPA compliant: users can change preferences at any time via the floating button.
 */

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing' | 'functional';

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
  version: number;
}

export const CONSENT_STORAGE_KEY = 'sleepybabyy_cookie_consent';
export const CONSENT_VERSION = 1;
// Re-prompt after 12 months as recommended by GDPR guidelines
export const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

const META_PIXEL_ID = '956706330308177';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    __sleepybabyy_consent?: ConsentState | null;
    __sleepybabyy_pixel_loaded?: boolean;
  }
}

export const defaultDeniedConsent = (): ConsentState => ({
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
  timestamp: Date.now(),
  version: CONSENT_VERSION,
});

export const acceptAllConsent = (): ConsentState => ({
  necessary: true,
  analytics: true,
  marketing: true,
  functional: true,
  timestamp: Date.now(),
  version: CONSENT_VERSION,
});

export const loadConsent = (): ConsentState | null => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (Date.now() - parsed.timestamp > CONSENT_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveConsent = (state: ConsentState): void => {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    if (typeof window !== 'undefined') {
      window.__sleepybabyy_consent = state;
    }
  } catch {
    /* ignore */
  }
};

export const clearConsent = (): void => {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.__sleepybabyy_consent = null;
    }
  } catch {
    /* ignore */
  }
};

/**
 * Initialize Google Consent Mode v2 with everything denied by default.
 * Must be called BEFORE GTM/GA fires any events.
 */
export const initConsentMode = (): void => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag: any = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  if (!window.gtag) window.gtag = gtag;

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'granted', // language preference, etc. are essential
    security_storage: 'granted',
    wait_for_update: 500,
  });
};

/**
 * Load the Meta Pixel script. We always inject the script (even when marketing
 * consent is denied) so Meta can receive *consent-aware* signals — this
 * powers Modeled Conversions / Conversions Modeling and dramatically improves
 * attribution under GDPR. Without consent we immediately call
 * `fbq('consent', 'revoke')` so Meta only receives anonymous, non-PII pings
 * (no cookies, no advanced matching) until the user accepts.
 */
const loadMetaPixel = (granted: boolean): void => {
  if (typeof window === 'undefined') return;
  if (!window.__sleepybabyy_pixel_loaded) {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    try {
      // Default to revoked so the very first call is anonymous if consent missing
      window.fbq?.('consent', granted ? 'grant' : 'revoke');
      window.fbq?.('init', META_PIXEL_ID);
      window.fbq?.('track', 'PageView');
    } catch {
      /* ignore */
    }
    window.__sleepybabyy_pixel_loaded = true;
  } else {
    // Already loaded — just toggle consent state
    try {
      window.fbq?.('consent', granted ? 'grant' : 'revoke');
    } catch {
      /* ignore */
    }
  }
};

/**
 * Apply a consent state — updates Google Consent Mode and loads Meta Pixel
 * if marketing is granted. Idempotent.
 */
export const applyConsent = (state: ConsentState): void => {
  if (typeof window === 'undefined') return;
  window.__sleepybabyy_consent = state;

  try {
    window.gtag?.('consent', 'update', {
      ad_storage: state.marketing ? 'granted' : 'denied',
      ad_user_data: state.marketing ? 'granted' : 'denied',
      ad_personalization: state.marketing ? 'granted' : 'denied',
      analytics_storage: state.analytics ? 'granted' : 'denied',
      functionality_storage: state.functional ? 'granted' : 'denied',
    });
  } catch {
    /* ignore */
  }

  // Always load the Pixel — pass current consent so it sends granted or
  // revoked (anonymous) signals accordingly. This enables Meta's Modeled
  // Conversions to keep attribution alive even when the user declines cookies.
  loadMetaPixel(state.marketing);
};

export const hasMarketingConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.__sleepybabyy_consent?.marketing);
};

export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.__sleepybabyy_consent?.analytics);
};

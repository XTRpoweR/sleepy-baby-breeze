/**
 * Meta Pixel (Facebook Pixel) helper utilities.
 *
 * The base Pixel script (init + initial PageView) is loaded inline in
 * `index.html`. These helpers fire additional standard / custom events
 * from anywhere in the app — safely, without ever throwing if the
 * pixel hasn't loaded (ad blockers, offline, etc.).
 *
 * IMPORTANT: These helpers must NEVER throw or block business logic.
 *            All calls are wrapped in try/catch and a typeof check.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

type StandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Lead'
  | 'CompleteRegistration'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Subscribe'
  | 'Purchase'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'Contact';

/**
 * Fire a standard Meta Pixel event.
 * Silent no-op if fbq is not available.
 */
export const fbqTrack = (
  event: StandardEvent,
  params?: Record<string, unknown>
): void => {
  try {
    if (typeof window === 'undefined') return;
    if (typeof window.fbq !== 'function') return;
    if (params && Object.keys(params).length > 0) {
      window.fbq('track', event, params);
    } else {
      window.fbq('track', event);
    }
  } catch {
    // Never let analytics break the app
  }
};

/**
 * Fire a custom Meta Pixel event.
 * Silent no-op if fbq is not available.
 */
export const fbqTrackCustom = (
  event: string,
  params?: Record<string, unknown>
): void => {
  try {
    if (typeof window === 'undefined') return;
    if (typeof window.fbq !== 'function') return;
    if (params && Object.keys(params).length > 0) {
      window.fbq('trackCustom', event, params);
    } else {
      window.fbq('trackCustom', event);
    }
  } catch {
    // Never let analytics break the app
  }
};

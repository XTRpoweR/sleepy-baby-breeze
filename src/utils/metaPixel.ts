/**
 * Meta Pixel (Facebook Pixel) + Conversions API (CAPI) helper utilities.
 *
 * - Browser pixel script + initial PageView is loaded inline in `index.html`.
 * - Every event fired through these helpers is ALSO relayed server-side to
 *   Meta's Conversions API via the `meta-capi` edge function, using a shared
 *   `event_id` so Meta can deduplicate browser + server events.
 *
 * IMPORTANT: These helpers must NEVER throw or block business logic.
 *            All calls are wrapped in try/catch and a typeof check.
 */

import { supabase } from '@/integrations/supabase/client';
import { hasMarketingConsent } from '@/utils/consentManager';

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

interface UserData {
  email?: string;
  external_id?: string; // typically a hashed-by-server user id
}

const getCookie = (name: string): string | undefined => {
  try {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'),
    );
    return match ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
};

const generateEventId = (): string => {
  try {
    // crypto.randomUUID is available in all modern browsers
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const relayToCapi = (
  event_name: string,
  params: Record<string, unknown> | undefined,
  event_id: string,
  user_data: UserData | undefined,
): void => {
  try {
    if (typeof window === 'undefined') return;
    const payload = {
      event_name,
      event_id,
      event_source_url: window.location.href,
      action_source: 'website' as const,
      user_data: {
        email: user_data?.email,
        external_id: user_data?.external_id,
        client_user_agent: navigator.userAgent,
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc'),
      },
      custom_data: params ?? {},
    };
    // Fire-and-forget; never await, never throw
    void supabase.functions.invoke('meta-capi', { body: payload }).catch(() => {});
  } catch {
    // Never let analytics break the app
  }
};

/**
 * Fire a standard Meta Pixel event in the browser AND relay it server-side
 * via Conversions API with a shared event_id for deduplication.
 *
 * Pass `userData` when known (e.g. after login or checkout) for better match
 * quality.
 */
export const fbqTrack = (
  event: StandardEvent,
  params?: Record<string, unknown>,
  userData?: UserData,
): void => {
  // GDPR/ePrivacy: do nothing until the user has granted marketing consent.
  if (!hasMarketingConsent()) return;
  const eventID = generateEventId();
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      // Passing { eventID } enables browser/server dedupe in Meta
      if (params && Object.keys(params).length > 0) {
        window.fbq('track', event, params, { eventID });
      } else {
        window.fbq('track', event, {}, { eventID });
      }
    }
  } catch {
    // Never let analytics break the app
  }
  // Always relay server-side, even if the browser pixel was blocked
  relayToCapi(event, params, eventID, userData);
};

/**
 * Fire a custom Meta Pixel event (browser + CAPI).
 */
export const fbqTrackCustom = (
  event: string,
  params?: Record<string, unknown>,
  userData?: UserData,
): void => {
  if (!hasMarketingConsent()) return;
  const eventID = generateEventId();
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (params && Object.keys(params).length > 0) {
        window.fbq('trackCustom', event, params, { eventID });
      } else {
        window.fbq('trackCustom', event, {}, { eventID });
      }
    }
  } catch {
    // Never let analytics break the app
  }
  relayToCapi(event, params, eventID, userData);
};

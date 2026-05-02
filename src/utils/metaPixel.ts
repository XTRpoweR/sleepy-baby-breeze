/**
 * Meta Pixel (Facebook Pixel) + Conversions API (CAPI) helper utilities.
 *
 * - Browser pixel script + initial PageView is loaded post-consent in
 *   `src/utils/consentManager.ts`.
 * - Every event fired through these helpers is ALSO relayed server-side to
 *   Meta's Conversions API via the `meta-capi` edge function, using a shared
 *   `event_id` so Meta can deduplicate browser + server events.
 * - Forwards full advanced-matching parameters (em, ph, fn, ln, ct, country,
 *   external_id, fb_login_id) when available — server hashes PII before
 *   sending to Meta.
 *
 * IMPORTANT: These helpers must NEVER throw or block business logic.
 *            All calls are wrapped in try/catch and a typeof check.
 */

import { supabase } from '@/integrations/supabase/client';
import { hasMarketingConsent } from '@/utils/consentManager';
import { getFbc, getFbp } from '@/utils/fbTracking';

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
  | 'StartTrial'
  | 'Purchase'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'Contact';

interface UserData {
  email?: string;
  external_id?: string; // typically the Supabase user id; server hashes it
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  country?: string;
  fb_login_id?: string;
}

const generateEventId = (): string => {
  try {
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
    const fbc = getFbc();
    const fbp = getFbp();
    const payload = {
      event_name,
      event_id,
      event_source_url: window.location.href,
      action_source: 'website' as const,
      user_data: {
        email: user_data?.email,
        external_id: user_data?.external_id,
        phone: user_data?.phone,
        first_name: user_data?.first_name,
        last_name: user_data?.last_name,
        city: user_data?.city,
        country: user_data?.country,
        fb_login_id: user_data?.fb_login_id,
        client_user_agent: navigator.userAgent,
        fbp,
        fbc,
      },
      custom_data: params ?? {},
    };
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
 * quality. The browser pixel only consumes email/external_id directly; the
 * full advanced-matching set is forwarded server-side via CAPI where Meta
 * can hash and match it.
 */
export const fbqTrack = (
  event: StandardEvent,
  params?: Record<string, unknown>,
  userData?: UserData,
  customEventId?: string,
): void => {
  if (!hasMarketingConsent()) return;
  const eventID = customEventId || generateEventId();
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (params && Object.keys(params).length > 0) {
        window.fbq('track', event, params, { eventID });
      } else {
        window.fbq('track', event, {}, { eventID });
      }
    }
  } catch {
    // Never let analytics break the app
  }
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

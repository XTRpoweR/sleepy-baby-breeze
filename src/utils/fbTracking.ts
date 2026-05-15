/**
 * Facebook click-ID (fbc) + browser-ID (fbp) helpers — implements the same
 * behavior as Meta's official `capi-param-builder` client library
 * (github.com/facebook/capi-param-builder) without the external dependency.
 *
 * - On app boot:
 *     • captures `?fbclid=...` from the URL → first-party `_fbc` cookie
 *       in the format Meta expects: `fb.{subdomainIndex}.{ms}.{fbclid}`
 *     • generates a `_fbp` cookie if none exists yet (don't wait for Pixel)
 *       in Meta's standard format: `fb.1.{ms}.{10-digit-random}`
 *     • assigns a stable anonymous `external_id` for guest visitors so Lead
 *       events fired pre-login still have a high-value match key
 * - Mirrors all values to localStorage as a fallback (ITP / cookie loss).
 *
 * This is first-party, non-PII tracking data — safe to set without marketing
 * consent (identical to what the Meta Pixel itself sets once loaded).
 */

const FBC_COOKIE = '_fbc';
const FBP_COOKIE = '_fbp';
const FBC_LS_KEY = 'sb_fbc';
const FBP_LS_KEY = 'sb_fbp';
const EXT_ID_LS_KEY = 'sb_anon_eid';
// 90 days — Meta's standard click attribution window
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';

const getCookie = (name: string): string | undefined => {
  if (!isBrowser()) return undefined;
  try {
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'),
    );
    return match ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
};

const rootDomain = (): string => {
  try {
    const host = window.location.hostname;
    if (host === 'localhost' || /^[\d.]+$/.test(host)) return '';
    const parts = host.split('.');
    if (parts.length <= 2) return host;
    return parts.slice(-2).join('.');
  } catch {
    return '';
  }
};

const setCookie = (name: string, value: string): void => {
  if (!isBrowser()) return;
  try {
    const domain = rootDomain();
    const domainAttr = domain ? `; domain=.${domain}` : '';
    document.cookie = `${name}=${encodeURIComponent(
      value,
    )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${domainAttr}`;
  } catch {
    /* noop */
  }
};

const lsGet = (key: string): string | undefined => {
  if (!isBrowser()) return undefined;
  try {
    return window.localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
};

const lsSet = (key: string, value: string): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* noop */
  }
};

/** 10-digit positive random integer — matches Meta Pixel's `_fbp` random part. */
const tenDigitRandom = (): string => {
  // 10 digits → 1_000_000_000 .. 9_999_999_999
  const n = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000);
  return String(n);
};

/** UUID v4 with safe fallback for older browsers. */
const generateUuid = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  // RFC4122-ish fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Try to recover an `fbclid` from sources beyond `?fbclid=...`:
 * - in-app browsers (Facebook / Instagram) sometimes strip query strings; the
 *   `document.referrer` can still carry the click id.
 *
 * Returns the raw fbclid string or undefined.
 */
const recoverFbclid = (): string | undefined => {
  if (!isBrowser()) return undefined;
  try {
    const url = new URL(window.location.href);
    const direct = url.searchParams.get('fbclid');
    if (direct) return direct;
    if (document.referrer) {
      const ref = new URL(document.referrer);
      const refFbclid = ref.searchParams.get('fbclid');
      if (refFbclid) return refFbclid;
    }
  } catch {
    /* noop */
  }
  return undefined;
};

/**
 * Capture all first-party Meta parameters and persist them. Idempotent — safe
 * to call multiple times. Call once at app boot.
 *
 * Mirrors `processAndCollectAllParams` from Meta's official client library.
 */
export const captureFbclid = (): void => {
  if (!isBrowser()) return;
  try {
    // --- _fbc (click ID) ---
    const fbclid = recoverFbclid();
    if (fbclid) {
      const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
      setCookie(FBC_COOKIE, fbcValue);
      lsSet(FBC_LS_KEY, fbcValue);
    } else {
      // Re-hydrate cookie from localStorage if cookie was dropped (ITP, etc.)
      const lsFbc = lsGet(FBC_LS_KEY);
      if (lsFbc && !getCookie(FBC_COOKIE)) setCookie(FBC_COOKIE, lsFbc);
    }

    // --- _fbp (browser ID) ---
    // Generate ourselves if Pixel hasn't set it yet. Meta accepts any value
    // following its format and Pixel will reuse the cookie on load.
    let fbp = getCookie(FBP_COOKIE) || lsGet(FBP_LS_KEY);
    if (!fbp) {
      fbp = `fb.1.${Date.now()}.${tenDigitRandom()}`;
    }
    setCookie(FBP_COOKIE, fbp);
    lsSet(FBP_LS_KEY, fbp);

    // --- anonymous external_id for guests ---
    if (!lsGet(EXT_ID_LS_KEY)) {
      lsSet(EXT_ID_LS_KEY, generateUuid());
    }
  } catch {
    /* noop */
  }
};

/**
 * Returns the current `_fbc` value (cookie first, localStorage fallback).
 */
export const getFbc = (): string | undefined => {
  const c = getCookie(FBC_COOKIE);
  if (c) return c;
  const ls = lsGet(FBC_LS_KEY);
  if (ls) {
    setCookie(FBC_COOKIE, ls);
    return ls;
  }
  return undefined;
};

/**
 * Returns the current `_fbp` value (cookie first, localStorage fallback).
 */
export const getFbp = (): string | undefined => {
  const c = getCookie(FBP_COOKIE);
  if (c) {
    lsSet(FBP_LS_KEY, c);
    return c;
  }
  const ls = lsGet(FBP_LS_KEY);
  if (ls) {
    setCookie(FBP_COOKIE, ls);
    return ls;
  }
  return undefined;
};

/**
 * Returns a stable anonymous identifier for the current browser. Survives
 * across visits via localStorage; used as `external_id` for Meta CAPI when
 * the visitor isn't logged in yet, so Lead events still have a match key.
 */
export const getAnonExternalId = (): string | undefined => {
  const v = lsGet(EXT_ID_LS_KEY);
  if (v) return v;
  // Lazy-create on demand if captureFbclid hasn't run yet
  if (isBrowser()) {
    const fresh = generateUuid();
    lsSet(EXT_ID_LS_KEY, fresh);
    return fresh;
  }
  return undefined;
};

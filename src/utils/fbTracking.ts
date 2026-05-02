/**
 * Facebook click-ID (fbc) + browser-ID (fbp) helpers.
 *
 * - On app boot, captures `?fbclid=...` from the URL and persists it as the
 *   first-party `_fbc` cookie in the format Meta expects:
 *     fb.{subdomainIndex}.{timestamp_ms}.{fbclid}
 * - Mirrors `_fbc` and `_fbp` to localStorage as a fallback (some browsers
 *   restrict third-party-ish cookies, ITP, etc.) so server-side events fired
 *   later (e.g. Stripe webhook lookups) can still attribute back to the click.
 *
 * This is first-party, non-PII tracking data — safe to set without marketing
 * consent (it's identical to what the Meta Pixel itself sets once loaded).
 */

const FBC_COOKIE = '_fbc';
const FBP_COOKIE = '_fbp';
const FBC_LS_KEY = 'sb_fbc';
const FBP_LS_KEY = 'sb_fbp';
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
    // localhost / IPs — let the browser default
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

/**
 * Capture `?fbclid=...` from the current URL and persist it as the `_fbc`
 * cookie + localStorage fallback. Idempotent — does nothing if a value is
 * already present.
 *
 * Call once at app boot (e.g. in main.tsx).
 */
export const captureFbclid = (): void => {
  if (!isBrowser()) return;
  try {
    const url = new URL(window.location.href);
    const fbclid = url.searchParams.get('fbclid');
    if (!fbclid) {
      // Re-hydrate cookie from localStorage if cookie was dropped (ITP, etc.)
      const lsFbc = lsGet(FBC_LS_KEY);
      if (lsFbc && !getCookie(FBC_COOKIE)) setCookie(FBC_COOKIE, lsFbc);
      const lsFbp = lsGet(FBP_LS_KEY);
      if (lsFbp && !getCookie(FBP_COOKIE)) setCookie(FBP_COOKIE, lsFbp);
      return;
    }
    const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
    setCookie(FBC_COOKIE, fbcValue);
    lsSet(FBC_LS_KEY, fbcValue);
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
    // Best-effort re-hydrate so the Pixel script also sees it
    setCookie(FBC_COOKIE, ls);
    return ls;
  }
  return undefined;
};

/**
 * Returns the current `_fbp` value (cookie first, localStorage fallback).
 * The Meta Pixel script sets `_fbp` itself once loaded; we mirror it to
 * localStorage so we can re-hydrate it across sessions / cookie loss.
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

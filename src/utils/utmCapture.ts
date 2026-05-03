/**
 * Captures UTM parameters and click IDs from the URL on landing and stores them
 * in sessionStorage so they persist across signup/checkout for attribution.
 */

const STORAGE_KEY = 'sby_utm';
const KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const;

export const captureUtmParams = (): void => {
  try {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const data: Record<string, string> = {};
    KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) data[k] = v;
    });
    if (Object.keys(data).length > 0) {
      data.captured_at = new Date().toISOString();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    /* ignore */
  }
};

export const getStoredUtm = (): Record<string, string> | null => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

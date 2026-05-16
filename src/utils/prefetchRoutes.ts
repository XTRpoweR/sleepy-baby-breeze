/**
 * Route prefetcher — eagerly downloads route chunks in the background so
 * subsequent navigation feels instant.
 *
 * Strategy:
 * - `prefetchDashboardRoutes()` is called once the dashboard mounts. It fires
 *   `import()` for the most-used routes on `requestIdleCallback` so it doesn't
 *   compete with rendering or user interaction.
 * - `prefetchRoute(key)` is called on `onTouchStart` / `onPointerDown` of nav
 *   buttons — by the time the user releases the touch, the chunk is cached.
 *
 * Each chunk is fetched at most once per page load (browser caches the rest).
 */

const fired = new Set<string>();

const importers: Record<string, () => Promise<unknown>> = {
  track: () => import('@/pages/TrackActivity'),
  sleep: () => import('@/pages/SleepSchedule'),
  reports: () => import('@/pages/Reports'),
  memories: () => import('@/pages/Memories'),
  family: () => import('@/pages/FamilySharing'),
  pediatrician: () => import('@/pages/PediatricianReports'),
  notifications: () => import('@/pages/Notifications'),
  subscription: () => import('@/pages/Subscription'),
  account: () => import('@/pages/Account'),
  sounds: () => import('@/pages/Sounds'),
};

const idle = (cb: () => void): void => {
  if (typeof window === 'undefined') return;
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void })
    .requestIdleCallback;
  if (ric) {
    ric(cb, { timeout: 2000 });
  } else {
    setTimeout(cb, 200);
  }
};

/** Fire a single route's import (idempotent). */
export const prefetchRoute = (key: keyof typeof importers): void => {
  if (fired.has(key)) return;
  const importer = importers[key];
  if (!importer) return;
  fired.add(key);
  importer().catch(() => fired.delete(key));
};

/**
 * Prefetch the most-likely-next routes after dashboard mounts.
 * Fires during idle time, in priority order, with small staggering so the
 * network isn't saturated.
 */
export const prefetchDashboardRoutes = (): void => {
  idle(() => prefetchRoute('track'));
  idle(() => prefetchRoute('sleep'));
  setTimeout(() => idle(() => prefetchRoute('reports')), 500);
  setTimeout(() => idle(() => prefetchRoute('memories')), 800);
  setTimeout(() => idle(() => prefetchRoute('family')), 1000);
};

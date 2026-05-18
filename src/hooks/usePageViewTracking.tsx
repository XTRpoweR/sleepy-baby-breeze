import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fbqTrack } from '@/utils/metaPixel';
import { useAuth } from '@/hooks/useAuth';
import { buildMetaUserData } from '@/utils/metaUserData';

/**
 * Fires a Meta Pixel `PageView` event on every SPA route change AND on the
 * initial load. The pixel script itself no longer fires PageView, so this is
 * the single source of truth — every event carries an `event_id` and is
 * relayed server-side via the Conversions API for deduplication.
 *
 * When a user is signed in we forward their advanced-matching data
 * (email/external_id/first_name/last_name) to raise Meta's Event Match
 * Quality. We key on `user?.id` (not the whole user object) so periodic
 * Supabase session refreshes don't re-fire PageView for the same identity.
 */
export const usePageViewTracking = (): void => {
  const location = useLocation();
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const metaUser = buildMetaUserData(user);
    fbqTrack('PageView', {}, metaUser);
    // We intentionally exclude `user` from deps so PageView fires per route
    // change and per identity change (login/logout) only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, userId]);
};

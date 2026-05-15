import type { User } from '@supabase/supabase-js';
import { getAnonExternalId } from '@/utils/fbTracking';

interface MetaUserData {
  email?: string;
  external_id?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Build the advanced-matching `userData` payload for Meta Pixel/CAPI.
 *
 * - When a Supabase user is provided: uses their id as `external_id` and
 *   splits `user_metadata.full_name` into `first_name` / `last_name` so Meta
 *   can hash and match (`fn`, `ln`).
 * - When no user is provided (guest / pre-login Lead events): falls back to
 *   the stable anonymous browser ID so Meta still has a high-value match key
 *   on every event. This raises External ID coverage to ~100%.
 */
export const buildMetaUserData = (user: User | null | undefined): MetaUserData | undefined => {
  if (!user) {
    const anonId = getAnonExternalId();
    return anonId ? { external_id: anonId } : undefined;
  }
  const data: MetaUserData = {
    email: user.email ?? undefined,
    external_id: user.id,
  };
  const fullName: string | undefined = user.user_metadata?.full_name || user.user_metadata?.name;
  if (fullName && typeof fullName === 'string') {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 1) data.first_name = parts[0];
    if (parts.length >= 2) data.last_name = parts.slice(1).join(' ');
  }
  return data;
};

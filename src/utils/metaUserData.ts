import type { User } from '@supabase/supabase-js';

interface MetaUserData {
  email?: string;
  external_id?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Build the advanced-matching `userData` payload for Meta Pixel/CAPI from a
 * Supabase auth user. Splits `user_metadata.full_name` into first/last name
 * so Meta can hash and match (`fn`, `ln`).
 */
export const buildMetaUserData = (user: User | null | undefined): MetaUserData | undefined => {
  if (!user) return undefined;
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

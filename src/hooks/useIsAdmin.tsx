import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Returns true when the current user has admin-section access.
 * Backed by either the legacy profiles.is_admin boolean OR membership in
 * the new admin_team_members table (any role grants access; per-action
 * restrictions are handled at the UI/RLS layer via useAdminRole).
 */
export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [profileRes, teamRes] = await Promise.all([
        supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle(),
        supabase.from('admin_team_members').select('user_id').eq('user_id', user.id).maybeSingle(),
      ]);
      if (!cancelled) {
        setIsAdmin(!!profileRes.data?.is_admin || !!teamRes.data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};

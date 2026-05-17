import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AdminRole = 'ceo' | 'executive' | 'manager' | 'editor' | 'member';

const RANK: Record<AdminRole, number> = {
  ceo: 5,
  executive: 4,
  manager: 3,
  editor: 2,
  member: 1,
};

/**
 * Returns the current user's admin team role, or null if not a team member.
 * Replaces the simpler boolean is_admin check for fine-grained role-based UI.
 */
export const useAdminRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole(null);
      setTitle(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('admin_team_members')
        .select('role, title')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled) {
        setRole((data?.role as AdminRole) ?? null);
        setTitle(data?.title ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const rank = role ? RANK[role] : 0;

  return {
    role,
    title,
    rank,
    loading: loading || authLoading,
    isMember: role !== null,
    canInvite: rank >= RANK.manager,       // manager+
    canManageTeam: rank >= RANK.executive, // executive+
    canPublish: rank >= RANK.manager,      // manager+
    canWrite: rank >= RANK.editor,         // editor+
    isCeo: role === 'ceo',
  };
};

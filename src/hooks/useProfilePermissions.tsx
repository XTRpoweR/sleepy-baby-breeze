
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useProfilePermissions = (babyId: string | null) => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useProfilePermissions] Effect triggered:', { user: user?.id, babyId });
    
    if (!user || !babyId) {
      console.log('[useProfilePermissions] Missing user or babyId, clearing role');
      setRole(null);
      setLoading(false);
      return;
    }
    
    const fetchRole = async () => {
      try {
        console.log('[useProfilePermissions] Fetching role for:', { userId: user.id, babyId });
        const { data, error } = await supabase.rpc('get_family_member_role', {
          user_uuid: user.id,
          baby_uuid: babyId
        });
        
        if (error) {
          console.error('[useProfilePermissions] Error fetching role:', error);
          setRole(null);
        } else {
          const validRole = data && ['owner', 'caregiver', 'viewer'].includes(data) ? data : null;
          console.log('[useProfilePermissions] Fetched role:', { rawData: data, validRole });
          setRole(validRole);
        }
      } catch (error) {
        console.error('[useProfilePermissions] Exception fetching role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [user, babyId]);

  const canEdit = role === 'owner' || role === 'caregiver';
  const canDelete = role === 'owner';
  const canInvite = role === 'owner';
  // Prevent leaks - never default to true!
  const canView = !!role;

  console.log('[useProfilePermissions] Calculated permissions:', {
    role,
    loading,
    canEdit,
    canDelete,
    canInvite,
    canView
  });

  return {
    role,
    loading,
    permissions: {
      canEdit,
      canDelete,
      canInvite,
      canView
    }
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { profileEventManager } from '@/utils/profileEvents';

export const useProfilePermissions = (babyId: string | null) => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  // Subscribe to profile change events for instant updates
  useEffect(() => {
    const unsubscribe = profileEventManager.subscribe((newProfileId) => {
      console.log('[useProfilePermissions] Profile change event received:', newProfileId);
      // Immediately clear role and show switching state
      setRole(null);
      setSwitching(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log('[useProfilePermissions] Effect triggered:', { user: user?.id, babyId });
    
    // Immediately clear role when babyId changes for instant UI update
    setRole(null);
    setSwitching(true);
    
    if (!user || !babyId) {
      console.log('[useProfilePermissions] Missing user or babyId, clearing role');
      setRole(null);
      setLoading(false);
      setSwitching(false);
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
        setSwitching(false);
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
    switching,
    permissions: {
      canEdit,
      canDelete,
      canInvite,
      canView
    }
  };
};

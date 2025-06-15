
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useProfilePermissions = (babyId: string | null) => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !babyId) {
      setRole(null);
      setLoading(false);
      return;
    }
    const fetchRole = async () => {
      try {
        const { data, error } = await supabase.rpc('get_family_member_role', {
          user_uuid: user.id,
          baby_uuid: babyId
        });
        // Only allow known roles
        setRole(data && ['owner', 'caregiver', 'viewer'].includes(data) ? data : null);
      } catch (error) {
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

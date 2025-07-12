
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useOwnerPermission = (babyId: string | null) => {
  const { user } = useAuth();
  const [ownerCheck, setOwnerCheck] = useState(false);

  const checkOwnerPermission = useCallback(async () => {
    if (!user || !babyId) {
      setOwnerCheck(false);
      return false;
    }
    try {
      const { data, error } = await supabase.rpc('get_family_member_role', {
        user_uuid: user.id,
        baby_uuid: babyId
      });
      if (error || !data || data !== 'owner') {
        setOwnerCheck(false);
        return false;
      }
      setOwnerCheck(true);
      return true;
    } catch (error) {
      console.error('Error checking owner permission:', error);
      setOwnerCheck(false);
      return false;
    }
  }, [user, babyId]);

  return { ownerCheck, checkOwnerPermission };
};

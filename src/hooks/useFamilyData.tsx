
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FamilyMember, FamilyInvitation } from '@/types/familyMembers';

export const useFamilyData = (babyId: string | null, checkOwnerPermission: () => Promise<boolean>) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFamilyMembers = useCallback(async (forceRefresh = false) => {
    if (!user || !babyId) {
      setLoading(false);
      return;
    }

    if (!forceRefresh) {
      setLoading(true);
    }

    await checkOwnerPermission();
    console.log('Fetching family members for baby:', babyId, 'user:', user.id, 'forceRefresh:', forceRefresh);

    try {
      const { data: familyMembersData, error: membersError } = await supabase.rpc('get_family_members_with_profiles', {
        baby_uuid: babyId
      });

      if (membersError) {
        console.error('Error fetching family members:', membersError);
        if (!forceRefresh) {
          toast({
            title: "Error",
            description: `Failed to load family members: ${membersError.message}`,
            variant: "destructive",
          });
        }
      } else {
        console.log('Successfully fetched family members:', familyMembersData);
        setMembers(familyMembersData || []);
      }

      const { data: familyInvitations, error: invitationsError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('baby_id', babyId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError);
        setInvitations([]);
      } else {
        setInvitations(familyInvitations || []);
      }
    } catch (error) {
      console.error('Unexpected error in fetchFamilyMembers:', error);
      if (!forceRefresh) {
        toast({
          title: "Error",
          description: "Unexpected error loading family data",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, babyId, checkOwnerPermission, toast]);

  const refreshFamilyData = useCallback(() => {
    console.log('Refreshing family data...');
    return fetchFamilyMembers(true);
  }, [fetchFamilyMembers]);

  return {
    members,
    invitations,
    loading,
    fetchFamilyMembers,
    refreshFamilyData
  };
};

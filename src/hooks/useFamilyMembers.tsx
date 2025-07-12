
import { useEffect } from 'react';
import { useOwnerPermission } from './useOwnerPermission';
import { useFamilyData } from './useFamilyData';
import { useFamilyActions } from './useFamilyActions';

export const useFamilyMembers = (babyId: string | null) => {
  const { ownerCheck, checkOwnerPermission } = useOwnerPermission(babyId);
  const { members, invitations, loading, fetchFamilyMembers, refreshFamilyData } = useFamilyData(babyId, checkOwnerPermission);
  const { inviteFamilyMember, removeFamilyMember, cancelInvitation } = useFamilyActions(babyId, checkOwnerPermission, refreshFamilyData);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  return {
    members,
    invitations,
    loading,
    inviteFamilyMember,
    removeFamilyMember,
    cancelInvitation,
    refetch: fetchFamilyMembers,
    refreshFamilyData,
    ownerCheck
  };
};

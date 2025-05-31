
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  baby_id: string;
  user_id: string;
  role: 'owner' | 'caregiver' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  permissions: {
    can_edit: boolean;
    can_invite: boolean;
    can_delete: boolean;
  };
  invited_at: string;
  joined_at: string | null;
  invited_by: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface FamilyInvitation {
  id: string;
  baby_id: string;
  invited_by: string;
  email: string;
  role: 'caregiver' | 'viewer';
  permissions: {
    can_edit: boolean;
    can_invite: boolean;
    can_delete: boolean;
  };
  invitation_token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
}

export const useFamilyMembers = (babyId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && babyId) {
      fetchMembers();
      fetchInvitations();
      setupRealtimeSubscription();
    }
  }, [user, babyId]);

  const fetchMembers = async () => {
    if (!babyId) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('baby_id', babyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching family members:', error);
        toast({
          title: "Error",
          description: "Failed to load family members",
          variant: "destructive",
        });
      } else {
        // Type-safe conversion of the data
        const typedMembers: FamilyMember[] = (data || []).map(member => ({
          ...member,
          role: member.role as 'owner' | 'caregiver' | 'viewer',
          status: member.status as 'pending' | 'accepted' | 'declined',
          permissions: typeof member.permissions === 'object' && member.permissions !== null 
            ? member.permissions as { can_edit: boolean; can_invite: boolean; can_delete: boolean }
            : { can_edit: false, can_invite: false, can_delete: false }
        }));
        setMembers(typedMembers);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (!babyId) return;

    try {
      const { data, error } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('baby_id', babyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
      } else {
        // Type-safe conversion of the data
        const typedInvitations: FamilyInvitation[] = (data || []).map(invitation => ({
          ...invitation,
          role: invitation.role as 'caregiver' | 'viewer',
          status: invitation.status as 'pending' | 'accepted' | 'declined' | 'expired',
          permissions: typeof invitation.permissions === 'object' && invitation.permissions !== null 
            ? invitation.permissions as { can_edit: boolean; can_invite: boolean; can_delete: boolean }
            : { can_edit: false, can_invite: false, can_delete: false }
        }));
        setInvitations(typedInvitations);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!babyId) return;

    const channel = supabase
      .channel('family-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_members',
          filter: `baby_id=eq.${babyId}`
        },
        () => {
          fetchMembers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_invitations',
          filter: `baby_id=eq.${babyId}`
        },
        () => {
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const inviteMember = async (email: string, role: 'caregiver' | 'viewer') => {
    if (!babyId || !user) return false;

    try {
      const permissions = role === 'caregiver' 
        ? { can_edit: true, can_invite: false, can_delete: false }
        : { can_edit: false, can_invite: false, can_delete: false };

      const { error } = await supabase
        .from('family_invitations')
        .insert({
          baby_id: babyId,
          invited_by: user.id,
          email: email.toLowerCase(),
          role,
          permissions
        });

      if (error) {
        console.error('Error sending invitation:', error);
        toast({
          title: "Error",
          description: "Failed to send invitation",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Invitation Sent!",
        description: `Invitation sent to ${email}`,
      });
      return true;
    } catch (error) {
      console.error('Error sending invitation:', error);
      return false;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        toast({
          title: "Error",
          description: "Failed to remove family member",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Member Removed",
        description: "Family member has been removed",
      });
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('family_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) {
        console.error('Error canceling invitation:', error);
        toast({
          title: "Error",
          description: "Failed to cancel invitation",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Invitation Canceled",
        description: "The invitation has been canceled",
      });
      return true;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      return false;
    }
  };

  const updateMemberRole = async (memberId: string, role: 'caregiver' | 'viewer') => {
    try {
      const permissions = role === 'caregiver' 
        ? { can_edit: true, can_invite: false, can_delete: false }
        : { can_edit: false, can_invite: false, can_delete: false };

      const { error } = await supabase
        .from('family_members')
        .update({ role, permissions })
        .eq('id', memberId);

      if (error) {
        console.error('Error updating member role:', error);
        toast({
          title: "Error",
          description: "Failed to update member role",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Role Updated",
        description: "Member role has been updated",
      });
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  };

  return {
    members,
    invitations,
    loading,
    inviteMember,
    removeMember,
    cancelInvitation,
    updateMemberRole,
    refetch: () => {
      fetchMembers();
      fetchInvitations();
    }
  };
};

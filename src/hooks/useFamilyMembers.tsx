import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  user_id: string;
  baby_id: string;
  role: string;
  status: string;
  permissions: any;
  invited_at: string | null;
  joined_at: string | null;
  invited_by: string | null;
  email?: string;
  full_name?: string;
}

interface FamilyInvitation {
  id: string;
  baby_id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string;
  expires_at: string;
  invitation_token: string;
  permissions: any;
}

export const useFamilyMembers = (babyId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFamilyMembers = async () => {
    if (!user || !babyId) {
      console.log('Missing user or babyId:', { user: !!user, babyId });
      setLoading(false);
      return;
    }

    console.log('Fetching family members for baby:', babyId);

    try {
      // First verify baby access
      const { data: babyProfile, error: babyError } = await supabase
        .from('baby_profiles')
        .select('id, name, user_id')
        .eq('id', babyId)
        .single();

      if (babyError) {
        console.error('Error accessing baby profile:', babyError);
        toast({
          title: "Error",
          description: "Cannot access baby profile",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Baby profile verified:', babyProfile);

      // Fetch family members
      const { data: familyMembers, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .eq('baby_id', babyId);

      if (membersError) {
        console.error('Error fetching family members:', membersError);
        console.error('Error details:', {
          message: membersError.message,
          details: membersError.details,
          hint: membersError.hint,
          code: membersError.code
        });
        
        toast({
          title: "Error",
          description: `Failed to load family members: ${membersError.message}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Family members found:', familyMembers?.length || 0);

      // Fetch profile data for each member
      const memberIds = familyMembers?.map(m => m.user_id) || [];
      let profiles: any[] = [];
      
      if (memberIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', memberIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          // Continue without profile data rather than failing completely
          profiles = [];
        } else {
          profiles = profilesData || [];
        }
      }

      // Merge the data
      const membersWithProfiles = familyMembers?.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        return {
          ...member,
          email: profile?.email,
          full_name: profile?.full_name
        };
      }) || [];

      setMembers(membersWithProfiles);

      // Fetch pending invitations
      const { data: pendingInvitations, error: invitationsError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('baby_id', babyId)
        .eq('status', 'pending');

      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError);
        // Continue without invitations rather than failing completely
        setInvitations([]);
      } else {
        console.log('Invitations found:', pendingInvitations?.length || 0);
        setInvitations(pendingInvitations || []);
      }
    } catch (error) {
      console.error('Unexpected error in fetchFamilyMembers:', error);
      toast({
        title: "Error",
        description: "Unexpected error loading family data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteFamilyMember = async (email: string, role: string = 'caregiver') => {
    if (!user || !babyId) return false;

    try {
      const { error } = await supabase
        .from('family_invitations')
        .insert({
          baby_id: babyId,
          email: email.toLowerCase(),
          role,
          invited_by: user.id,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating invitation:', error);
        toast({
          title: "Error",
          description: "Failed to send invitation",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success!",
        description: `Invitation sent to ${email}`,
      });

      await fetchFamilyMembers();
      return true;
    } catch (error) {
      console.error('Error inviting family member:', error);
      return false;
    }
  };

  const removeFamilyMember = async (memberId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing family member:', error);
        toast({
          title: "Error",
          description: "Failed to remove family member",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success!",
        description: "Family member removed successfully",
      });

      await fetchFamilyMembers();
      return true;
    } catch (error) {
      console.error('Error removing family member:', error);
      return false;
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('family_invitations')
        .delete()
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
        title: "Success!",
        description: "Invitation canceled successfully",
      });

      await fetchFamilyMembers();
      return true;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, [user, babyId]);

  return {
    members,
    invitations,
    loading,
    inviteFamilyMember,
    removeFamilyMember,
    cancelInvitation,
    refetch: fetchFamilyMembers
  };
};

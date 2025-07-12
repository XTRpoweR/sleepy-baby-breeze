
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const validateRole = (role: string) =>
  ['caregiver', 'viewer'].includes(role) ? role : 'viewer';

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
  created_at: string;
  updated_at: string;
}

export const useFamilyMembers = (babyId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerCheck, setOwnerCheck] = useState(false);

  // Only allow baby owners to fetch/manipulate family/invitations
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

  // Retry function for profile fetching
  const fetchProfilesWithRetry = async (memberIds: string[], maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', memberIds);

        if (profilesError) {
          console.error(`Profile fetch attempt ${attempt} failed:`, profilesError);
          if (attempt === maxRetries) {
            throw profilesError;
          }
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }

        return profilesData || [];
      } catch (error) {
        console.error(`Profile fetch attempt ${attempt} error:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    return [];
  };

  const fetchFamilyMembers = useCallback(async (forceRefresh = false) => {
    if (!user || !babyId) {
      setLoading(false);
      return;
    }

    // Only set loading to true if this is not a background refresh
    if (!forceRefresh) {
      setLoading(true);
    }

    await checkOwnerPermission();
    console.log('Fetching family members for baby:', babyId, 'user:', user.id, 'forceRefresh:', forceRefresh);

    try {
      // Fetch family members
      const { data: familyMembers, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .eq('baby_id', babyId);

      if (membersError) {
        console.error('Error fetching family members:', membersError);
        if (!forceRefresh) {
          toast({
            title: "Error",
            description: `Failed to load family members: ${membersError.message}`,
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      console.log('Family members found:', familyMembers?.length || 0);

      // Fetch profile data for each member with retry logic
      const memberIds = familyMembers?.map(m => m.user_id) || [];
      let profiles: any[] = [];
      
      if (memberIds.length > 0) {
        try {
          profiles = await fetchProfilesWithRetry(memberIds);
          console.log('Profiles fetched:', profiles.length, 'for members:', memberIds.length);
        } catch (profilesError) {
          console.error('Failed to fetch profiles after retries:', profilesError);
          // Don't fail the whole operation if profiles can't be fetched
          profiles = [];
        }
      }

      // Merge the data
      const membersWithProfiles = familyMembers?.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        const result = {
          ...member,
          email: profile?.email || 'Unknown Email',
          full_name: profile?.full_name || null
        };
        
        console.log('Member profile mapping:', {
          user_id: member.user_id,
          found_profile: !!profile,
          email: result.email,
          full_name: result.full_name
        });
        
        return result;
      }) || [];

      setMembers(membersWithProfiles);

      // Fetch family invitations
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

  // Auto-refresh function that can be called after invitation acceptance
  const refreshFamilyData = useCallback(() => {
    console.log('Refreshing family data...');
    return fetchFamilyMembers(true);
  }, [fetchFamilyMembers]);

  const inviteFamilyMember = async (email: string, role: string = 'caregiver') => {
    if (!user || !babyId) return false;

    // Enforce normalization
    email = normalizeEmail(email);
    role = validateRole(role);

    if (!(await checkOwnerPermission())) {
      toast({
        title: "No Permission",
        description: "Only baby owners can invite family.",
        variant: "destructive",
      });
      return false;
    }

    console.log('Inviting family member:', email, 'role:', role);

    try {
      // Check if there's already a pending invitation for this email
      const { data: existingInvitations, error: checkError } = await supabase
        .from('family_invitations')
        .select('id, email')
        .eq('baby_id', babyId)
        .eq('email', email.trim().toLowerCase())
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (checkError) {
        console.error('Error checking existing invitation:', checkError);
        toast({
          title: "Error",
          description: `Failed to check existing invitations: ${checkError.message}`,
          variant: "destructive",
        });
        return false;
      }

      if (existingInvitations && existingInvitations.length > 0) {
        toast({
          title: "Invitation already sent",
          description: "There's already a pending invitation for this email address.",
          variant: "default",
        });
        return false;
      }

      // Get baby and user details for email - use maybeSingle to handle missing data
      const { data: babyProfile, error: babyError } = await supabase
        .from('baby_profiles')
        .select('name')
        .eq('id', babyId)
        .maybeSingle();

      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (babyError) {
        console.error('Error fetching baby profile:', babyError);
        toast({
          title: "Error",
          description: "Failed to get baby information",
          variant: "destructive",
        });
        return false;
      }

      if (userError) {
        console.error('Error fetching user profile:', userError);
        toast({
          title: "Error",
          description: "Failed to get user information",
          variant: "destructive",
        });
        return false;
      }

      // Use fallback values if profile data is missing
      const babyName = babyProfile?.name || 'Baby';
      const inviterName = userProfile?.full_name || user.email || 'Someone';

      // Create the invitation
      const insertData = {
        baby_id: babyId,
        email: email.trim().toLowerCase(),
        role,
        status: 'pending',
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: role === 'caregiver' 
          ? { can_edit: true, can_delete: false, can_invite: false }
          : { can_edit: false, can_delete: false, can_invite: false }
      };

      const { data, error } = await supabase
        .from('family_invitations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        toast({
          title: "Error",
          description: `Failed to send invitation: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Invitation created:', data);

      // Send invitation email via the correct edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-family-invitation', {
          body: {
            invitationId: data.id,
            email: email.trim().toLowerCase(),
            babyName: babyName,
            inviterName: inviterName,
            role: role,
            invitationToken: data.invitation_token
          }
        });

        if (emailError) {
          console.error('Error sending email:', emailError);
          toast({
            title: "Invitation created but email failed",
            description: "The invitation was created but the email could not be sent. You can share the invitation link manually.",
            variant: "default",
          });
        } else {
          toast({
            title: "Invitation sent!",
            description: `Family invitation sent to ${email}. They have 7 days to accept.`,
          });
        }
      } catch (emailError) {
        console.error('Error calling email function:', emailError);
        toast({
          title: "Invitation created",
          description: "The invitation was created. You can share the invitation link manually.",
          variant: "default",
        });
      }

      await refreshFamilyData();
      return true;
    } catch (error) {
      console.error('Error inviting family member:', error);
      toast({
        title: "Error",
        description: "Unexpected error sending invitation",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFamilyMember = async (memberId: string) => {
    if (!user) return false;
    if (!(await checkOwnerPermission())) {
      toast({
        title: "No Permission",
        description: "Only baby owners can remove family.",
        variant: "destructive",
      });
      return false;
    }

    console.log('Removing family member:', memberId);

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing family member:', error);
        toast({
          title: "Error",
          description: `Failed to remove family member: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success!",
        description: "Family member removed successfully",
      });

      await refreshFamilyData();
      return true;
    } catch (error) {
      console.error('Error removing family member:', error);
      toast({
        title: "Error",
        description: "Unexpected error removing family member",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!user) return false;
    if (!(await checkOwnerPermission())) {
      toast({
        title: "No Permission",
        description: "Only baby owners can cancel invitations.",
        variant: "destructive",
      });
      return false;
    }

    console.log('Canceling invitation:', invitationId);

    try {
      const { error } = await supabase
        .from('family_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) {
        console.error('Error canceling invitation:', error);
        toast({
          title: "Error",
          description: `Failed to cancel invitation: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled successfully",
      });

      await refreshFamilyData();
      return true;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast({
        title: "Error",
        description: "Unexpected error canceling invitation",
        variant: "destructive",
      });
      return false;
    }
  };

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

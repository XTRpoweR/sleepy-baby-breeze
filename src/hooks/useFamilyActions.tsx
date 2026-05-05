
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { securityUtils, rateLimiters } from '@/utils/securityUtils';

export const useFamilyActions = (
  babyId: string | null,
  checkOwnerPermission: () => Promise<boolean>,
  refreshFamilyData: () => Promise<void>
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const inviteFamilyMember = useCallback(async (email: string, role: string = 'caregiver') => {
    if (!user || !babyId) return false;

    // Rate limiting check
    if (!rateLimiters.invitation.isAllowed(user.id)) {
      const remainingTime = Math.ceil(rateLimiters.invitation.getRemainingTime(user.id) / 1000);
      toast({
        title: "Too Many Requests",
        description: `Please wait ${remainingTime} seconds before sending another invitation.`,
        variant: "destructive",
      });
      return false;
    }

    // Enhanced email validation
    const emailValidation = securityUtils.validateSecureEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email",
        description: emailValidation.error,
        variant: "destructive",
      });
      return false;
    }

    // Enhanced role validation
    if (!securityUtils.validateRole(role)) {
      toast({
        title: "Invalid Role",
        description: "Invalid role specified",
        variant: "destructive",
      });
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!(await checkOwnerPermission())) {
      toast({
        title: "No Permission",
        description: "Only baby owners can invite family.",
        variant: "destructive",
      });
      return false;
    }

    console.log('Inviting family member:', normalizedEmail, 'role:', role);

    try {
      const { data: existingInvitations, error: checkError } = await supabase
        .from('family_invitations')
        .select('id, email')
        .eq('baby_id', babyId)
        .eq('email', normalizedEmail)
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

      const babyName = securityUtils.sanitizeUserContent(babyProfile?.name || 'Baby');
      const inviterName = securityUtils.sanitizeUserContent(userProfile?.full_name || user.email || 'Someone');

      const insertData = {
        baby_id: babyId,
        email: normalizedEmail,
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

      try {
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            invitationId: data.id,
            email: normalizedEmail,
            babyName: babyName,
            inviterName: inviterName,
            role: role,
            invitationToken: data.invitation_token
          }
        });

        console.log('Email function response:', { emailResult, emailError });

        if (emailError) {
          console.error('Error sending email:', emailError);
          toast({
            title: "Invitation created — email failed",
            description: `Email error: ${emailError.message || 'unknown'}. Use "Copy Link" to share manually.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Invitation sent!",
            description: `Family invitation sent to ${normalizedEmail}. They have 7 days to accept.`,
          });
        }
      } catch (emailError: any) {
        console.error('Error calling email function:', emailError);
        toast({
          title: "Invitation created — email failed",
          description: `${emailError?.message || 'Unknown error'}. Use "Copy Link" to share manually.`,
          variant: "destructive",
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
  }, [user, babyId, checkOwnerPermission, refreshFamilyData, toast]);

  const removeFamilyMember = useCallback(async (memberId: string) => {
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
  }, [user, checkOwnerPermission, refreshFamilyData, toast]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
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
  }, [user, checkOwnerPermission, refreshFamilyData, toast]);

  const resendInvitationEmail = useCallback(async (invitationId: string) => {
    if (!user || !babyId) return false;

    try {
      const { data: invitation, error: invError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('id', invitationId)
        .maybeSingle();

      if (invError || !invitation) {
        toast({ title: "Error", description: "Invitation not found", variant: "destructive" });
        return false;
      }

      // Extend expiry if expired
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase
          .from('family_invitations')
          .update({
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', invitationId);
      }

      const { data: babyProfile } = await supabase
        .from('baby_profiles').select('name').eq('id', invitation.baby_id).maybeSingle();
      const { data: userProfile } = await supabase
        .from('profiles').select('full_name').eq('id', user.id).maybeSingle();

      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          invitationId: invitation.id,
          email: invitation.email,
          babyName: securityUtils.sanitizeUserContent(babyProfile?.name || 'Baby'),
          inviterName: securityUtils.sanitizeUserContent(userProfile?.full_name || user.email || 'Someone'),
          role: invitation.role,
          invitationToken: invitation.invitation_token,
        },
      });

      console.log('Resend email response:', { emailResult, emailError });

      if (emailError) {
        toast({
          title: "Email failed",
          description: `${emailError.message || 'Unknown error'}. Use "Copy Link" to share manually.`,
          variant: "destructive",
        });
        return false;
      }

      toast({ title: "Invitation resent!", description: `Email sent to ${invitation.email}.` });
      await refreshFamilyData();
      return true;
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({ title: "Error", description: error?.message || 'Failed to resend', variant: "destructive" });
      return false;
    }
  }, [user, babyId, refreshFamilyData, toast]);

  return {
    inviteFamilyMember,
    removeFamilyMember,
    cancelInvitation,
    resendInvitationEmail,
  };
};

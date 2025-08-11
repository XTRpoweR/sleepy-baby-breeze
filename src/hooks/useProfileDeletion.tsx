
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useProfileDeletion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeletingProfile, setIsDeletingProfile] = useState<string | null>(null);

  const deleteProfileCompletely = async (profileId: string, profileName: string) => {
    if (!user || isDeletingProfile) {
      console.log('Cannot delete: no user or already deleting');
      return false;
    }

    console.log('Starting complete profile deletion for:', profileId, profileName);
    setIsDeletingProfile(profileId);

    try {
      // Try the RPC function first
      console.log('Calling delete_baby_profile_completely RPC...');
      const { data, error } = await supabase.rpc('delete_baby_profile_completely', {
        profile_id: profileId,
        user_id_param: user.id
      });

      if (error) {
        console.error('RPC deletion failed:', error);
        // Fallback to manual deletion
        const manualResult = await manualProfileDeletion(profileId, profileName);
        return manualResult;
      }

      console.log('Profile deleted successfully via RPC');
      toast({
        title: "Success!",
        description: `${profileName}'s profile has been permanently deleted`,
      });
      return true;

    } catch (error) {
      console.error('Unexpected error during RPC deletion:', error);
      // Fallback to manual deletion
      const manualResult = await manualProfileDeletion(profileId, profileName);
      return manualResult;
    } finally {
      setIsDeletingProfile(null);
    }
  };

  const manualProfileDeletion = async (profileId: string, profileName: string) => {
    console.log('Starting manual profile deletion...');
    
    try {
      // Delete in specific order to avoid foreign key constraints
      console.log('Deleting family members...');
      const { error: familyError } = await supabase
        .from('family_members')
        .delete()
        .eq('baby_id', profileId);
      
      if (familyError) {
        console.warn('Warning deleting family members:', familyError);
      }

      console.log('Deleting baby activities...');
      const { error: activitiesError } = await supabase
        .from('baby_activities')
        .delete()
        .eq('baby_id', profileId);
      
      if (activitiesError) {
        console.warn('Warning deleting activities:', activitiesError);
      }

      console.log('Deleting baby memories...');
      const { error: memoriesError } = await supabase
        .from('baby_memories')
        .delete()
        .eq('baby_id', profileId);
      
      if (memoriesError) {
        console.warn('Warning deleting memories:', memoriesError);
      }

      console.log('Deleting sleep schedules...');
      const { error: sleepError } = await supabase
        .from('sleep_schedules')
        .delete()
        .eq('baby_id', profileId);
      
      if (sleepError) {
        console.warn('Warning deleting sleep schedules:', sleepError);
      }

      console.log('Deleting family invitations...');
      const { error: invitationsError } = await supabase
        .from('family_invitations')
        .delete()
        .eq('baby_id', profileId);
      
      if (invitationsError) {
        console.warn('Warning deleting invitations:', invitationsError);
      }

      // Finally delete the profile
      console.log('Deleting baby profile...');
      const { error: profileError } = await supabase
        .from('baby_profiles')
        .delete()
        .eq('id', profileId)
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Failed to delete profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to delete profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      console.log('Manual profile deletion completed successfully');
      toast({
        title: "Success!",
        description: `${profileName}'s profile has been permanently deleted`,
      });
      return true;

    } catch (error) {
      console.error('Manual deletion failed:', error);
      toast({
        title: "Error",
        description: "An error occurred during deletion. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    deleteProfileCompletely,
    isDeletingProfile
  };
};

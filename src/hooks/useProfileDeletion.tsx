
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
      console.log('Starting manual profile deletion...');
      
      // Delete in specific order to avoid foreign key constraints
      console.log('Deleting family members...');
      const { error: familyMembersError } = await supabase
        .from('family_members')
        .delete()
        .eq('baby_id', profileId);
      
      if (familyMembersError) {
        console.warn('Warning deleting family members:', familyMembersError);
      }

      console.log('Deleting baby activities...');
      const { error: activitiesError } = await supabase
        .from('baby_activities')
        .delete()
        .eq('baby_id', profileId);
      
      if (activitiesError) {
        console.warn('Warning deleting baby activities:', activitiesError);
      }

      console.log('Deleting baby memories...');
      const { error: memoriesError } = await supabase
        .from('baby_memories')
        .delete()
        .eq('baby_id', profileId);
      
      if (memoriesError) {
        console.warn('Warning deleting baby memories:', memoriesError);
      }

      console.log('Deleting sleep schedules...');
      const { error: schedulesError } = await supabase
        .from('sleep_schedules')
        .delete()
        .eq('baby_id', profileId);
      
      if (schedulesError) {
        console.warn('Warning deleting sleep schedules:', schedulesError);
      }

      console.log('Deleting family invitations...');
      const { error: invitationsError } = await supabase
        .from('family_invitations')
        .delete()
        .eq('baby_id', profileId);
      
      if (invitationsError) {
        console.warn('Warning deleting family invitations:', invitationsError);
      }

      // Finally delete the profile itself
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

      console.log('Profile deletion completed successfully');
      toast({
        title: "Success!",
        description: `${profileName}'s profile has been permanently deleted`,
      });
      return true;

    } catch (error) {
      console.error('Unexpected error during deletion:', error);
      toast({
        title: "Error",
        description: "An error occurred during deletion. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeletingProfile(null);
    }
  };

  return {
    deleteProfileCompletely,
    isDeletingProfile
  };
};

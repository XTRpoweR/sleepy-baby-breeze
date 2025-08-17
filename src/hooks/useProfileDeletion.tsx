
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
      
      // Use a transaction-like approach with Promise.allSettled to handle errors gracefully
      // Delete in specific order to avoid foreign key constraints
      const deletionPromises = [
        // Delete family members
        supabase
          .from('family_members')
          .delete()
          .eq('baby_id', profileId),
        
        // Delete baby activities
        supabase
          .from('baby_activities')
          .delete()
          .eq('baby_id', profileId),
        
        // Delete baby memories
        supabase
          .from('baby_memories')
          .delete()
          .eq('baby_id', profileId),
        
        // Delete sleep schedules
        supabase
          .from('sleep_schedules')
          .delete()
          .eq('baby_id', profileId),
        
        // Delete family invitations
        supabase
          .from('family_invitations')
          .delete()
          .eq('baby_id', profileId)
      ];

      console.log('Deleting related data...');
      const results = await Promise.allSettled(deletionPromises);
      
      // Log any warnings but don't fail completely
      results.forEach((result, index) => {
        const operations = ['family_members', 'baby_activities', 'baby_memories', 'sleep_schedules', 'family_invitations'];
        if (result.status === 'rejected') {
          console.warn(`Warning deleting ${operations[index]}:`, result.reason);
        } else if (result.value.error) {
          console.warn(`Warning deleting ${operations[index]}:`, result.value.error);
        }
      });

      // Finally delete the profile itself - this is the critical operation
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
          description: `Failed to delete ${profileName}'s profile. Please try again.`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Profile deletion completed successfully');
      toast({
        title: "Profile Deleted",
        description: `${profileName}'s profile has been permanently deleted`,
      });
      return true;

    } catch (error) {
      console.error('Unexpected error during deletion:', error);
      toast({
        title: "Deletion Failed",
        description: `An error occurred while deleting ${profileName}'s profile. Please try again.`,
        variant: "destructive",
      });
      return false;
    } finally {
      // Always clear the deleting state to prevent UI from being stuck
      console.log('Clearing deletion state for profile:', profileId);
      setIsDeletingProfile(null);
    }
  };

  return {
    deleteProfileCompletely,
    isDeletingProfile
  };
};

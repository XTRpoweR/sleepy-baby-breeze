
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
      // Use a single RPC call to delete everything in the correct order
      console.log('Calling delete_baby_profile_completely RPC...');
      const { data, error } = await supabase.rpc('delete_baby_profile_completely', {
        profile_id: profileId,
        user_id_param: user.id
      });

      if (error) {
        console.error('RPC deletion failed:', error);
        // Fallback to manual deletion
        return await manualProfileDeletion(profileId, profileName);
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
      return await manualProfileDeletion(profileId, profileName);
    } finally {
      setIsDeletingProfile(null);
    }
  };

  const manualProfileDeletion = async (profileId: string, profileName: string) => {
    console.log('Starting manual profile deletion...');
    
    try {
      // Delete in specific order to avoid foreign key constraints
      const deletions = [
        { table: 'family_members', condition: { baby_id: profileId } },
        { table: 'baby_activities', condition: { baby_id: profileId } },
        { table: 'baby_memories', condition: { baby_id: profileId } },
        { table: 'sleep_schedules', condition: { baby_id: profileId } },
        { table: 'family_invitations', condition: { baby_id: profileId } },
      ];

      for (const deletion of deletions) {
        console.log(`Deleting from ${deletion.table}...`);
        const { error } = await supabase
          .from(deletion.table)
          .delete()
          .match(deletion.condition);
        
        if (error) {
          console.warn(`Warning deleting from ${deletion.table}:`, error);
          // Continue with other deletions
        }
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

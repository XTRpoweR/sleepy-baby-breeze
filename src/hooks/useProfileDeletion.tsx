
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useProfileDeletion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeletingProfile, setIsDeletingProfile] = useState<string | null>(null);
  const [deletionProgress, setDeletionProgress] = useState<number>(0);

  const deleteProfileCompletely = async (profileId: string, profileName: string) => {
    if (!user || isDeletingProfile) {
      console.log('Cannot delete: no user or already deleting');
      return false;
    }

    console.log('Starting complete profile deletion for:', profileId, profileName);
    setIsDeletingProfile(profileId);
    setDeletionProgress(0);

    try {
      console.log('Starting manual profile deletion...');
      
      // Delete in specific order to avoid foreign key constraints
      const deletionSteps = [
        { name: 'family members', table: 'family_members' },
        { name: 'baby activities', table: 'baby_activities' },
        { name: 'baby memories', table: 'baby_memories' },
        { name: 'sleep schedules', table: 'sleep_schedules' },
        { name: 'family invitations', table: 'family_invitations' }
      ];

      // Process each deletion step with progress updates
      for (let i = 0; i < deletionSteps.length; i++) {
        const step = deletionSteps[i];
        console.log(`Deleting ${step.name}...`);
        
        // Update progress (each step is worth 15%, profile deletion is worth 25%)
        setDeletionProgress(((i + 1) / (deletionSteps.length + 1)) * 75);
        
        try {
          const { error } = await supabase
            .from(step.table as any)
            .delete()
            .eq('baby_id', profileId);
          
          if (error) {
            console.warn(`Warning deleting ${step.name}:`, error);
            // Continue with deletion even if some related records fail
          }
          
          // Small delay to prevent UI blocking and show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (stepError) {
          console.warn(`Error deleting ${step.name}:`, stepError);
          // Continue with deletion
        }
      }

      // Finally delete the profile itself
      console.log('Deleting baby profile...');
      setDeletionProgress(90);
      
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

      setDeletionProgress(100);
      console.log('Profile deletion completed successfully');
      
      toast({
        title: "Success!",
        description: `${profileName}'s profile has been permanently deleted`,
      });
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      setDeletionProgress(0);
    }
  };

  return {
    deleteProfileCompletely,
    isDeletingProfile,
    deletionProgress
  };
};

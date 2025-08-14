
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
      // First, try manual deletion approach for better reliability
      console.log('Starting manual profile deletion...');
      
      // Delete in specific order to avoid foreign key constraints
      const deletions = [
        { table: 'family_members', column: 'baby_id', name: 'family members' },
        { table: 'baby_activities', column: 'baby_id', name: 'baby activities' },
        { table: 'baby_memories', column: 'baby_id', name: 'baby memories' },
        { table: 'sleep_schedules', column: 'baby_id', name: 'sleep schedules' },
        { table: 'family_invitations', column: 'baby_id', name: 'family invitations' }
      ];

      // Delete related records
      for (const deletion of deletions) {
        console.log(`Deleting ${deletion.name}...`);
        const { error } = await supabase
          .from(deletion.table)
          .delete()
          .eq(deletion.column, profileId);
        
        if (error) {
          console.warn(`Warning deleting ${deletion.name}:`, error);
          // Continue with deletion even if some related records fail
        }
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

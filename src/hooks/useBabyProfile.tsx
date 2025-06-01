
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BabyProfile {
  id: string;
  name: string;
  birth_date: string | null;
  photo_url: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useBabyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<BabyProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<BabyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching baby profiles:', error);
        toast({
          title: "Error",
          description: "Failed to load baby profiles",
          variant: "destructive",
        });
      } else {
        setProfiles(data || []);
        const active = data?.find(profile => profile.is_active) || data?.[0] || null;
        setActiveProfile(active);
      }
    } catch (error) {
      console.error('Error fetching baby profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: { name: string; birth_date?: string; photo_url?: string }) => {
    if (!user) return false;

    try {
      // If this is the first profile, make it active
      const isFirstProfile = profiles.length === 0;

      const { data, error } = await supabase
        .from('baby_profiles')
        .insert({
          user_id: user.id,
          name: profileData.name,
          birth_date: profileData.birth_date || null,
          photo_url: profileData.photo_url || null,
          is_active: isFirstProfile
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating baby profile:', error);
        toast({
          title: "Error",
          description: "Failed to create baby profile",
          variant: "destructive",
        });
        return false;
      }

      setProfiles(prev => [...prev, data]);
      
      if (isFirstProfile) {
        setActiveProfile(data);
      }

      toast({
        title: "Success!",
        description: `Baby profile for ${profileData.name} created successfully`,
      });
      return true;
    } catch (error) {
      console.error('Error creating baby profile:', error);
      return false;
    }
  };

  const updateProfile = async (profileId: string, updates: Partial<BabyProfile>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('baby_profiles')
        .update(updates)
        .eq('id', profileId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating baby profile:', error);
        toast({
          title: "Error",
          description: "Failed to update baby profile",
          variant: "destructive",
        });
        return false;
      }

      setProfiles(prev => prev.map(p => p.id === profileId ? data : p));
      
      if (activeProfile?.id === profileId) {
        setActiveProfile(data);
      }

      toast({
        title: "Success!",
        description: "Baby profile updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating baby profile:', error);
      return false;
    }
  };

  const switchProfile = async (profileId: string) => {
    if (!user || switching) return false;

    console.log('Starting profile switch to:', profileId);
    setSwitching(true);

    try {
      // Immediately update local state for instant UI feedback
      const targetProfile = profiles.find(p => p.id === profileId);
      if (targetProfile) {
        console.log('Setting active profile immediately:', targetProfile.name);
        setActiveProfile({ ...targetProfile, is_active: true });
        
        // Update profiles list to reflect new active state
        const updatedProfiles = profiles.map(p => ({ 
          ...p, 
          is_active: p.id === profileId 
        }));
        setProfiles(updatedProfiles);
      }

      // Update database in background
      const { error } = await supabase.rpc('set_active_profile', {
        profile_id: profileId,
        user_id_param: user.id
      });

      if (error) {
        console.error('Error switching profile in database:', error);
        // Revert local state on database error
        await fetchProfiles();
        toast({
          title: "Error",
          description: "Failed to switch profile",
          variant: "destructive",
        });
        return false;
      }

      console.log('Profile switch completed successfully');
      return true;
    } catch (error) {
      console.error('Error switching profile:', error);
      // Revert local state on error
      await fetchProfiles();
      return false;
    } finally {
      setSwitching(false);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('baby_profiles')
        .delete()
        .eq('id', profileId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting baby profile:', error);
        toast({
          title: "Error",
          description: "Failed to delete baby profile",
          variant: "destructive",
        });
        return false;
      }

      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);

      // If we deleted the active profile, switch to the first remaining one
      if (activeProfile?.id === profileId) {
        if (updatedProfiles.length > 0) {
          await switchProfile(updatedProfiles[0].id);
        } else {
          setActiveProfile(null);
        }
      }

      toast({
        title: "Success!",
        description: "Baby profile deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting baby profile:', error);
      return false;
    }
  };

  // Backwards compatibility - return single profile as before
  const profile = activeProfile;

  return {
    profile,
    profiles,
    activeProfile,
    loading,
    switching,
    createProfile,
    updateProfile,
    switchProfile,
    deleteProfile,
    refetch: fetchProfiles
  };
};

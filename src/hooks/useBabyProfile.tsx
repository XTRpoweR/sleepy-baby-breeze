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
  user_id?: string;
  is_shared?: boolean;
  user_role?: string;
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
      const { data: ownedProfiles, error: ownedError } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (ownedError) {
        console.error('Error fetching owned profiles:', ownedError);
        toast({
          title: "Error",
          description: "Failed to load baby profiles",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Fetch shared profiles
      const { data: familyMembers, error: familyError } = await supabase
        .from('family_members')
        .select(`
          baby_id,
          role,
          status,
          baby_profiles!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (familyError) {
        console.error('Error fetching shared profiles:', familyError);
        // Don't fail completely, just continue with owned profiles
      }

      // Only show profiles user has valid role for
      const allProfiles = [
        ...(ownedProfiles || []).map(profile => ({
          ...profile,
          is_shared: false,
          user_role: 'owner'
        })),
        ...(familyMembers || [])
          .filter(member => ['owner', 'caregiver', 'viewer'].includes(member.role))
          .map(member => ({
            ...member.baby_profiles,
            is_shared: true,
            user_role: member.role,
            is_active: false // Shared profiles are not active by default
          }))
      ];

      setProfiles(allProfiles);

      // Find the active profile (prioritize owned profiles)
      const ownedActive = ownedProfiles?.find(profile => profile.is_active);
      if (ownedActive) {
        setActiveProfile({
          ...ownedActive,
          is_shared: false,
          user_role: 'owner'
        });
      } else if (allProfiles.length > 0) {
        // If no owned active profile, use the first profile
        setActiveProfile(allProfiles[0]);
      } else {
        setActiveProfile(null);
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
      console.log('Creating profile for user:', user.id);
      
      // Get current owned profiles count
      const ownedProfiles = profiles.filter(p => !p.is_shared);
      console.log('Current owned profiles count:', ownedProfiles.length);

      // Check subscription tier to enforce limits
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      console.log('Subscription data:', subscriptionData);
      
      const isBasicUser = !subscriptionData || subscriptionData.subscription_tier === 'basic';
      console.log('Is basic user:', isBasicUser);
      
      // Fixed logic: Allow first profile for basic users (0 profiles is allowed, 1+ is blocked)
      if (isBasicUser && ownedProfiles.length >= 1) {
        console.log('Profile limit reached for basic user - they already have', ownedProfiles.length, 'profile(s)');
        toast({
          title: "Profile Limit Reached",
          description: "Basic plan allows only 1 baby profile. Upgrade to Premium for unlimited profiles.",
          variant: "destructive",
        });
        return false;
      }

      // If this is the first profile, make it active
      const isFirstProfile = ownedProfiles.length === 0;
      console.log('Is first profile:', isFirstProfile);

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

      console.log('Profile created successfully:', data);

      const newProfile = {
        ...data,
        is_shared: false,
        user_role: 'owner'
      };

      setProfiles(prev => [...prev, newProfile]);
      
      if (isFirstProfile) {
        setActiveProfile(newProfile);
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

      setProfiles(prev => prev.map(p => p.id === profileId ? { ...data, is_shared: p.is_shared, user_role: p.user_role } : p));
      
      if (activeProfile?.id === profileId) {
        setActiveProfile({ ...data, is_shared: activeProfile.is_shared, user_role: activeProfile.user_role });
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
      // Find the target profile
      const targetProfile = profiles.find(p => p.id === profileId);
      if (!targetProfile) {
        console.error('Target profile not found');
        setSwitching(false);
        return false;
      }

      // Immediately update local state for instant UI feedback
      console.log('Setting active profile immediately:', targetProfile.name);
      setActiveProfile(targetProfile);

      // If it's an owned profile, update the database
      if (!targetProfile.is_shared) {
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

        // Update profiles list to reflect new active state for owned profiles
        const updatedProfiles = profiles.map(p => ({ 
          ...p, 
          is_active: !p.is_shared && p.id === profileId 
        }));
        setProfiles(updatedProfiles);
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
        const ownedProfiles = updatedProfiles.filter(p => !p.is_shared);
        if (ownedProfiles.length > 0) {
          await switchProfile(ownedProfiles[0].id);
        } else if (updatedProfiles.length > 0) {
          setActiveProfile(updatedProfiles[0]);
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

  // Set shared baby as active after accepting invitation
  const setSharedBabyAsActive = (babyId: string) => {
    const sharedProfile = profiles.find(p => p.id === babyId && p.is_shared);
    if (sharedProfile) {
      setActiveProfile(sharedProfile);
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
    setSharedBabyAsActive,
    refetch: fetchProfiles
  };
};

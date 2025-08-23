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
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);

  console.log('useBabyProfile hook render:', {
    profiles: profiles.length,
    activeProfile: activeProfile?.name,
    loading,
    switching,
    forceUpdateCounter
  });

  useEffect(() => {
    if (user) {
      console.log('User available, fetching profiles for user:', user.id);
      fetchProfiles();
    } else {
      console.log('No user available, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;
    console.log('=== Starting fetchProfiles ===');
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

      console.log('Fetched owned profiles:', ownedProfiles);

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

      console.log('Fetched family members:', familyMembers);

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

      console.log('Combined profiles:', allProfiles);
      setProfiles(allProfiles);

      // Find the active profile (prioritize owned profiles)
      const ownedActive = ownedProfiles?.find(profile => profile.is_active);
      let newActiveProfile = null;

      if (ownedActive) {
        newActiveProfile = {
          ...ownedActive,
          is_shared: false,
          user_role: 'owner'
        };
        console.log('Found owned active profile:', newActiveProfile);
      } else if (allProfiles.length > 0) {
        // If no owned active profile, use the first profile
        newActiveProfile = allProfiles[0];
        console.log('Using first available profile as active:', newActiveProfile);
      } else {
        console.log('No profiles available');
        newActiveProfile = null;
      }

      setActiveProfile(newActiveProfile);
      console.log('Set active profile to:', newActiveProfile);
    } catch (error) {
      console.error('Error fetching baby profiles:', error);
    } finally {
      setLoading(false);
      console.log('=== Finished fetchProfiles ===');
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
    if (!user || switching) {
      console.log('Cannot switch profile - user:', !!user, 'switching:', switching);
      return false;
    }

    console.log('=== Starting profile switch ===');
    console.log('Target profile ID:', profileId);
    console.log('Current active profile ID:', activeProfile?.id);
    
    if (activeProfile?.id === profileId) {
      console.log('Target profile is already active, no switch needed');
      return true;
    }

    setSwitching(true);

    try {
      // Find the target profile
      const targetProfile = profiles.find(p => p.id === profileId);
      if (!targetProfile) {
        console.error('Target profile not found in profiles list');
        setSwitching(false);
        return false;
      }

      console.log('Switching to profile:', {
        id: targetProfile.id,
        name: targetProfile.name,
        is_shared: targetProfile.is_shared,
        user_role: targetProfile.user_role
      });

      // Update local state first for immediate UI feedback
      console.log('Updating local state - setting active profile to:', targetProfile.name);
      setActiveProfile(targetProfile);
      
      // Force re-render by incrementing counter
      setForceUpdateCounter(prev => prev + 1);

      // For shared profiles, we only need to update local state
      if (targetProfile.is_shared) {
        console.log('Switching to shared profile - skipping database update');
        console.log('Successfully switched to shared profile:', targetProfile.name);
        
        // Small delay to ensure state propagation
        setTimeout(() => {
          console.log('Profile switch completed for shared profile');
          toast({
            title: "Profile Switched",
            description: `Now viewing ${targetProfile.name}'s profile`,
          });
        }, 100);
        
        return true;
      }

      // For owned profiles, update the database
      console.log('Switching to owned profile - updating database');
      
      const { error } = await supabase.rpc('set_active_profile', {
        profile_id: profileId,
        user_id_param: user.id
      });

      if (error) {
        console.error('Error switching profile in database:', error);
        toast({
          title: "Warning",
          description: "Profile switched locally but couldn't save preference",
          variant: "destructive",
        });
        return true; // Still return true since local switch worked
      }

      // Update profiles list to reflect new active state for owned profiles only
      const updatedProfiles = profiles.map(p => ({ 
        ...p, 
        is_active: !p.is_shared && p.id === profileId 
      }));
      setProfiles(updatedProfiles);

      console.log('Successfully switched to owned profile:', targetProfile.name);
      
      toast({
        title: "Profile Switched",
        description: `Now viewing ${targetProfile.name}'s profile`,
      });

      return true;
    } catch (error) {
      console.error('Unexpected error switching profile:', error);
      toast({
        title: "Warning", 
        description: "Profile switched but there was an error",
        variant: "destructive",
      });
      return true; // Return true to keep UI working
    } finally {
      setSwitching(false);
      console.log('=== Profile switch completed ===');
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!user) return false;

    const profileToDelete = profiles.find(p => p.id === profileId);
    if (!profileToDelete) {
      toast({
        title: "Error",
        description: "Profile not found",
        variant: "destructive",
      });
      return false;
    }

    // Only allow deleting owned profiles
    if (profileToDelete.is_shared || profileToDelete.user_role !== 'owner') {
      toast({
        title: "Error",
        description: "You can only delete profiles you own",
        variant: "destructive",
      });
      return false;
    }

    console.log('Starting profile deletion for:', profileToDelete.name);

    try {
      // Start a transaction-like deletion process
      // We'll delete in the correct order to maintain referential integrity

      // 1. Delete family members first
      console.log('Deleting family members...');
      const { error: familyError } = await supabase
        .from('family_members')
        .delete()
        .eq('baby_id', profileId);

      if (familyError) {
        console.error('Error deleting family members:', familyError);
        toast({
          title: "Error",
          description: "Failed to delete family relationships",
          variant: "destructive",
        });
        return false;
      }

      // 2. Delete baby activities
      console.log('Deleting baby activities...');
      const { error: activitiesError } = await supabase
        .from('baby_activities')
        .delete()
        .eq('baby_id', profileId);

      if (activitiesError) {
        console.error('Error deleting baby activities:', activitiesError);
        toast({
          title: "Error",
          description: "Failed to delete activity records",
          variant: "destructive",
        });
        return false;
      }

      // 3. Delete baby memories (photos/videos)
      console.log('Deleting baby memories...');
      const { error: memoriesError } = await supabase
        .from('baby_memories')
        .delete()
        .eq('baby_id', profileId);

      if (memoriesError) {
        console.error('Error deleting baby memories:', memoriesError);
        toast({
          title: "Error",
          description: "Failed to delete photo memories",
          variant: "destructive",
        });
        return false;
      }

      // 4. Delete sleep schedules
      console.log('Deleting sleep schedules...');
      const { error: sleepError } = await supabase
        .from('sleep_schedules')
        .delete()
        .eq('baby_id', profileId);

      if (sleepError) {
        console.error('Error deleting sleep schedules:', sleepError);
        toast({
          title: "Error",
          description: "Failed to delete sleep schedules",
          variant: "destructive",
        });
        return false;
      }

      // 5. Delete family invitations
      console.log('Deleting family invitations...');
      const { error: invitationsError } = await supabase
        .from('family_invitations')
        .delete()
        .eq('baby_id', profileId);

      if (invitationsError) {
        console.error('Error deleting family invitations:', invitationsError);
        // Don't fail here as this is not critical
      }

      // 6. Finally, delete the baby profile itself
      console.log('Deleting baby profile...');
      const { error: profileError } = await supabase
        .from('baby_profiles')
        .delete()
        .eq('id', profileId)
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error deleting baby profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to delete baby profile",
          variant: "destructive",
        });
        return false;
      }

      console.log('Profile deletion completed successfully');

      // Update local state
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);

      // If we deleted the active profile, switch to the first remaining owned profile
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
        description: `${profileToDelete.name}'s profile and all associated data have been permanently deleted`,
      });
      return true;
    } catch (error) {
      console.error('Unexpected error during profile deletion:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the profile",
        variant: "destructive",
      });
      return false;
    }
  };

  // Set shared baby as active after accepting invitation
  const setSharedBabyAsActive = (babyId: string) => {
    const sharedProfile = profiles.find(p => p.id === babyId && p.is_shared);
    if (sharedProfile) {
      console.log('Setting shared baby as active via setSharedBabyAsActive:', sharedProfile.name);
      setActiveProfile(sharedProfile);
      setForceUpdateCounter(prev => prev + 1);
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
    refetch: fetchProfiles,
    forceUpdateCounter
  };
};

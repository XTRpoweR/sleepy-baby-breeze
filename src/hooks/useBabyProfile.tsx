
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BabyProfile {
  id: string;
  name: string;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useBabyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching baby profile:', error);
        toast({
          title: "Error",
          description: "Failed to load baby profile",
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching baby profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: { name: string; birth_date?: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('baby_profiles')
        .insert({
          user_id: user.id,
          name: profileData.name,
          birth_date: profileData.birth_date || null
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

      setProfile(data);
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

  return {
    profile,
    loading,
    createProfile,
    refetch: fetchProfile
  };
};


import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { securityUtils, rateLimiters } from '@/utils/securityUtils';
import { supabase } from '@/integrations/supabase/client';

export const useSecureBabyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createSecureProfile = useCallback(async (profileData: { 
    name: string; 
    birth_date?: string; 
    photo_url?: string 
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a profile.",
        variant: "destructive",
      });
      return false;
    }

    // Rate limiting check
    if (!rateLimiters.profileUpdate.isAllowed(user.id)) {
      const remainingTime = Math.ceil(rateLimiters.profileUpdate.getRemainingTime(user.id) / 300000);
      toast({
        title: "Too Many Requests",
        description: `Please wait ${remainingTime} minutes before creating another profile.`,
        variant: "destructive",
      });
      return false;
    }

    // Validate baby name
    const nameValidation = securityUtils.validateBabyName(profileData.name);
    if (!nameValidation.isValid) {
      toast({
        title: "Invalid Name",
        description: nameValidation.error,
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Creating secure profile for user:', user.id);
      
      // Validate birth date if provided
      if (profileData.birth_date) {
        const birthDate = new Date(profileData.birth_date);
        const today = new Date();
        const maxAge = new Date();
        maxAge.setFullYear(today.getFullYear() - 10); // Max 10 years old
        
        if (birthDate > today) {
          toast({
            title: "Invalid Birth Date",
            description: "Birth date cannot be in the future.",
            variant: "destructive",
          });
          return false;
        }
        
        if (birthDate < maxAge) {
          toast({
            title: "Invalid Birth Date",
            description: "This app is designed for babies under 10 years old.",
            variant: "destructive",
          });
          return false;
        }
      }

      const sanitizedData = {
        user_id: user.id,
        name: securityUtils.sanitizeUserContent(profileData.name),
        birth_date: profileData.birth_date || null,
        photo_url: profileData.photo_url ? securityUtils.sanitizeUserContent(profileData.photo_url) : null,
        is_active: false // Will be set by the database logic
      };

      const { data, error } = await supabase
        .from('baby_profiles')
        .insert(sanitizedData)
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
      
      toast({
        title: "Success!",
        description: `Baby profile for ${profileData.name} created successfully`,
      });
      return true;
    } catch (error) {
      console.error('Error creating baby profile:', error);
      toast({
        title: "Error",
        description: "Unexpected error creating profile",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  const updateSecureProfile = useCallback(async (profileId: string, updates: { 
    name?: string; 
    birth_date?: string; 
    photo_url?: string 
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update profile.",
        variant: "destructive",
      });
      return false;
    }

    // Rate limiting check
    if (!rateLimiters.profileUpdate.isAllowed(user.id)) {
      const remainingTime = Math.ceil(rateLimiters.profileUpdate.getRemainingTime(user.id) / 300000);
      toast({
        title: "Too Many Requests",
        description: `Please wait ${remainingTime} minutes before updating again.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      const sanitizedUpdates: any = {};
      
      if (updates.name !== undefined) {
        const nameValidation = securityUtils.validateBabyName(updates.name);
        if (!nameValidation.isValid) {
          toast({
            title: "Invalid Name",
            description: nameValidation.error,
            variant: "destructive",
          });
          return false;
        }
        sanitizedUpdates.name = securityUtils.sanitizeUserContent(updates.name);
      }
      
      if (updates.birth_date !== undefined) {
        if (updates.birth_date) {
          const birthDate = new Date(updates.birth_date);
          const today = new Date();
          
          if (birthDate > today) {
            toast({
              title: "Invalid Birth Date",
              description: "Birth date cannot be in the future.",
              variant: "destructive",
            });
            return false;
          }
        }
        sanitizedUpdates.birth_date = updates.birth_date;
      }
      
      if (updates.photo_url !== undefined) {
        sanitizedUpdates.photo_url = updates.photo_url ? 
          securityUtils.sanitizeUserContent(updates.photo_url) : null;
      }

      const { data, error } = await supabase
        .from('baby_profiles')
        .update(sanitizedUpdates)
        .eq('id', profileId)
        .eq('user_id', user.id) // Ensure user owns the profile
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

      toast({
        title: "Success!",
        description: "Baby profile updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating baby profile:', error);
      toast({
        title: "Error",
        description: "Unexpected error updating profile",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  return {
    createSecureProfile,
    updateSecureProfile
  };
};

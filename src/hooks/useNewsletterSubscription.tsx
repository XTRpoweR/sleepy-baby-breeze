
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNewsletterSubscription = () => {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const subscribe = async (email: string): Promise<boolean> => {
    if (!email || !email.trim()) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    setIsSubscribing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email: email.trim() }
      });

      if (error) {
        console.error('Newsletter subscription error:', error);
        
        // Check if it's an "already subscribed" error
        if (error.message && error.message.includes('already subscribed')) {
          toast({
            title: "Already Subscribed! 📧",
            description: "You're already on our newsletter list. Thank you for your interest!",
          });
          return true; // Treat as success since they're already subscribed
        }
        
        toast({
          title: "Subscription Failed",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
        return false;
      }

      if (data.success) {
        toast({
          title: "Successfully Subscribed! 🎉",
          description: data.message || "Welcome to SleepyBabyy newsletter!",
        });
        return true;
      } else if (data.error) {
        // Handle error responses from the function
        if (data.error.includes('already subscribed')) {
          toast({
            title: "Already Subscribed! 📧",
            description: "You're already on our newsletter list. Thank you for your interest!",
          });
          return true; // Treat as success since they're already subscribed
        }
        
        toast({
          title: "Subscription Failed",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }
      
      // Fallback for unexpected response format
      toast({
        title: "Subscription Failed",
        description: "Unexpected response format. Please try again.",
        variant: "destructive",
      });
      return false;
      
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      
      toast({
        title: "Subscription Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubscribing(false);
    }
  };

  return {
    subscribe,
    isSubscribing
  };
};

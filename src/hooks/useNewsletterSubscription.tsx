
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
        throw error;
      }

      if (data.success) {
        toast({
          title: "Successfully Subscribed! 🎉",
          description: data.message || "Welcome to SleepyBabyy newsletter!",
        });
        return true;
      } else {
        throw new Error(data.error || 'Subscription failed');
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again later.",
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

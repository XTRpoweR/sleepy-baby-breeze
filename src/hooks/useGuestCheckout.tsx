
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGuestCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createGuestCheckout = async () => {
    if (loading) {
      console.log('Already processing checkout, skipping...');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Starting guest checkout process...');

      const { data, error } = await supabase.functions.invoke('create-checkout');

      console.log('Guest checkout response:', { data, error });

      if (error) {
        console.error('Guest checkout error:', error);
        toast({
          title: "Checkout Error",
          description: error.message || "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('No checkout URL received:', data);
        toast({
          title: "Checkout Error",
          description: "Failed to get checkout URL. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Guest checkout URL received, redirecting:', data.url);
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('Guest checkout exception:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  return {
    createGuestCheckout,
    loading
  };
};

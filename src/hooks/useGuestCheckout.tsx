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

      // Show loading toast to user
      toast({
        title: "Setting up checkout...",
        description: "Please wait while we prepare your payment session.",
      });

      const { data, error } = await supabase.functions.invoke('create-checkout');

      console.log('Guest checkout response:', { data, error });

      if (error) {
        console.error('Guest checkout error:', error);
        
        // Show specific error message based on error type
        let errorMessage = "Failed to create checkout session. Please try again.";
        if (error.message?.includes('STRIPE_SECRET_KEY')) {
          errorMessage = "Payment system configuration error. Please contact support.";
        } else if (error.message?.includes('not configured')) {
          errorMessage = "Payment system not ready. Please contact support.";
        }
        
        toast({
          title: "Checkout Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('No checkout URL received:', data);
        toast({
          title: "Checkout Error", 
          description: "Unable to start checkout process. Please try again or contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log('Guest checkout URL received, redirecting:', data.url);
      
      // Show success message before redirect
      toast({
        title: "Redirecting to checkout...",
        description: "You'll be taken to our secure payment page.",
      });

      // Small delay to show the toast, then redirect
      setTimeout(() => {
        window.location.href = data.url;
      }, 1000);
      
    } catch (error: any) {
      console.error('Guest checkout exception:', error);
      toast({
        title: "Checkout Failed",
        description: "An unexpected error occurred. Please refresh the page and try again.",
        variant: "destructive",
      });
    } finally {
      // Keep loading state for a bit longer to prevent multiple clicks
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  return {
    createGuestCheckout,
    loading
  };
};

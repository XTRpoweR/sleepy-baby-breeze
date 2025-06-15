import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface SubscriptionContextType {
  subscriptionTier: 'basic' | 'premium';
  status: string;
  currentPeriodEnd: string | null;
  loading: boolean;
  upgrading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  isPremium: boolean;
  isBasic: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [subscriptionTier, setSubscriptionTier] = useState<'basic' | 'premium'>('basic');
  const [status, setStatus] = useState('active');
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const checkSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Checking subscription status for user:', user.id);

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        // Don't show error toast for authentication issues, just default to basic
        setSubscriptionTier('basic');
        setStatus('active');
        setCurrentPeriodEnd(null);
        return;
      }

      console.log('Subscription data received:', data);
      setSubscriptionTier(data.subscription_tier || 'basic');
      setStatus(data.status || 'active');
      setCurrentPeriodEnd(data.current_period_end);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Default to basic subscription on any error
      setSubscriptionTier('basic');
      setStatus('active');
      setCurrentPeriodEnd(null);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async () => {
    if (upgrading) return;

    try {
      setUpgrading(true);
      // Always get the latest session before making the call
      const sessionResult = await supabase.auth.getSession();
      const accessToken = sessionResult.data.session?.access_token;

      if (!user || !accessToken) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upgrade your subscription.",
          variant: "destructive",
        });
        setUpgrading(false);
        return;
      }

      console.log('Creating checkout session...');

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error || !data?.url) {
        // Check for likely authentication errors
        const msg = error?.message || data?.error || '';
        if (
          msg.includes('User not authenticated') ||
          msg.includes('No authorization header') ||
          msg.includes('Session from session_id claim in JWT does not exist')
        ) {
          toast({
            title: "Your login session expired",
            description: "Please sign in again to continue with subscription checkout.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to create checkout session",
            variant: "destructive",
          });
        }
        setUpgrading(false);
        return;
      }

      console.log('Checkout URL received:', data.url);

      if (isMobile) {
        window.location.href = data.url;
      } else {
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          toast({
            title: "Popup Blocked",
            description: "Please allow popups or click the link to continue to checkout",
            variant: "default",
          });
          setTimeout(() => {
            if (confirm('Click OK to redirect to checkout page')) {
              window.location.href = data.url;
            }
          }, 1000);
        }
      }
    } catch (error: any) {
      const msg = error?.message || '';
      if (
        msg.includes('User not authenticated') ||
        msg.includes('No authorization header') ||
        msg.includes('Session from session_id claim in JWT does not exist')
      ) {
        toast({
          title: "Your login session expired",
          description: "Please sign in again to continue with subscription checkout.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive",
        });
      }
    } finally {
      setUpgrading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      console.log('Opening customer portal...');

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal:', error);
        
        // Check for specific Stripe configuration error
        if (error.message?.includes('No configuration provided') || 
            error.message?.includes('default configuration has not been created')) {
          toast({
            title: "Customer Portal Not Configured",
            description: "The subscription management portal needs to be set up. Please contact support to manage your subscription.",
            variant: "destructive",
          });
          return;
        }

        // Generic error handling
        toast({
          title: "Portal Access Error",
          description: error.message || "Unable to access customer portal. Please try again or contact support.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        toast({
          title: "Portal Error",
          description: "Unable to generate portal access. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log('Portal URL received:', data.url);
      
      // Handle mobile vs desktop differently for customer portal too
      if (isMobile) {
        window.location.href = data.url;
      } else {
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          toast({
            title: "Popup Blocked",
            description: "Please allow popups or click OK to continue to customer portal",
            variant: "default",
          });
          setTimeout(() => {
            if (confirm('Click OK to redirect to customer portal')) {
              window.location.href = data.url;
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      
      // More specific error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('configuration') || errorMessage.includes('portal')) {
        toast({
          title: "Service Configuration Issue",
          description: "The customer portal is not properly configured. Please contact support for assistance with managing your subscription.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the subscription management service. Please check your internet connection and try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Check subscription on auth state change
  useEffect(() => {
    if (!authLoading && user) {
      checkSubscription();
    } else if (!authLoading && !user) {
      setLoading(false);
      setSubscriptionTier('basic');
      setStatus('active');
      setCurrentPeriodEnd(null);
    }
  }, [user, authLoading]);

  const isPremium = subscriptionTier === 'premium';
  const isBasic = subscriptionTier === 'basic';

  return (
    <SubscriptionContext.Provider value={{
      subscriptionTier,
      status,
      currentPeriodEnd,
      loading,
      upgrading,
      checkSubscription,
      createCheckout,
      openCustomerPortal,
      isPremium,
      isBasic,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

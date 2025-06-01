
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    if (!user || upgrading) return;

    try {
      setUpgrading(true);
      console.log('Creating checkout session...');

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive",
        });
        return;
      }

      console.log('Opening checkout URL:', data.url);
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
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
        toast({
          title: "Error",
          description: "Failed to open customer portal",
          variant: "destructive",
        });
        return;
      }

      console.log('Opening portal URL:', data.url);
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
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

import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface SubscriptionContextType {
  subscriptionTier: 'basic' | 'premium' | 'premium_annual';
  status: string;
  currentPeriodEnd: string | null;
  loading: boolean;
  upgrading: boolean;
  upgradingMonthly: boolean;
  upgradingAnnual: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (pricingPlan?: 'monthly' | 'annual') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  isPremium: boolean;
  isPremiumAnnual: boolean;
  isBasic: boolean;
  isTrial: boolean;
  trialEnd: string | null;
  trialDaysLeft: number | null;
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
  const { user, session, loading: authLoading, refreshSession } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [subscriptionTier, setSubscriptionTier] = useState<'basic' | 'premium' | 'premium_annual'>('basic');
  const [status, setStatus] = useState('active');
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingMonthly, setUpgradingMonthly] = useState(false);
  const [upgradingAnnual, setUpgradingAnnual] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [trialEnd, setTrialEnd] = useState<string | null>(null);

  // Initialize subscription record for new users
  useEffect(() => {
    const initializeSubscriptionRecord = async () => {
      if (!user?.email) return;

      try {
        // Check if subscription record exists
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Create basic subscription record if none exists
        if (!existingSubscription) {
          console.log('Creating initial subscription record for user:', user.id);
          
          const { error } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              email: user.email,
              subscription_tier: 'basic',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error('Error creating initial subscription:', error);
          } else {
            console.log('Successfully created initial subscription record');
          }
        }
      } catch (error) {
        console.error('Error initializing subscription:', error);
      }
    };

    if (user && !authLoading) {
      initializeSubscriptionRecord();
    }
  }, [user, authLoading]);

  const ensureValidSession = async (): Promise<string | null> => {
    if (!user || !session) {
      console.error('No user or session available');
      return null;
    }

    // Check if session is expired or about to expire (within 5 minutes)
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;

    if (expiresAt - now < fiveMinutes) {
      console.log('Session expired or expiring soon, refreshing...');
      const refreshed = await refreshSession();
      if (!refreshed) {
        console.error('Failed to refresh session');
        return null;
      }
      
      // Get the new session after refresh
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token || null;
    }

    return session.access_token;
  };

  const checkSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Checking subscription status for user:', user.id);

      const accessToken = await ensureValidSession();
      if (!accessToken) {
        console.error('No valid access token available');
        // Fallback to basic subscription for new users
        setSubscriptionTier('basic');
        setStatus('active');
        setCurrentPeriodEnd(null);
        setIsTrial(false);
        setTrialEnd(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        // Fallback to basic subscription
        setSubscriptionTier('basic');
        setStatus('active');
        setCurrentPeriodEnd(null);
        setIsTrial(false);
        setTrialEnd(null);
        return;
      }

      console.log('Subscription data received:', data);
      setSubscriptionTier(data.subscription_tier || 'basic');
      setStatus(data.status || 'active');
      setCurrentPeriodEnd(data.current_period_end);
      setIsTrial(data.is_trial || false);
      setTrialEnd(data.trial_end);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Fallback to basic subscription
      setSubscriptionTier('basic');
      setStatus('active');
      setCurrentPeriodEnd(null);
      setIsTrial(false);
      setTrialEnd(null);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (pricingPlan: 'monthly' | 'annual' = 'monthly') => {
    const isUpgrading = pricingPlan === 'monthly' ? upgradingMonthly : upgradingAnnual;
    if (isUpgrading) {
      console.log('Already processing upgrade, skipping...');
      return;
    }
    
    try {
      if (pricingPlan === 'monthly') {
        setUpgradingMonthly(true);
      } else {
        setUpgradingAnnual(true);
      }
      console.log('Starting checkout process...');
      
      if (!user) {
        console.error('User not authenticated');
        toast({
          title: "Authentication Required",
          description: "Please log in to upgrade your subscription.",
          variant: "destructive",
        });
        return;
      }

      const accessToken = await ensureValidSession();
      if (!accessToken) {
        console.error('No valid access token available for checkout');
        toast({
          title: "Session Expired",
          description: "Your login session has expired. Please sign in again to continue.",
          variant: "destructive",
        });
        return;
      }

      console.log('Creating checkout session for user:', user.email);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: { pricingPlan },
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout error:', error);
        const msg = error?.message || '';
        
        if (msg.includes('User not authenticated') || 
            msg.includes('No authorization header') || 
            msg.includes('Session from session_id claim in JWT does not exist') ||
            msg.includes('session_not_found')) {
          toast({
            title: "Session Expired",
            description: "Your login session has expired. Please sign in again to continue with checkout.",
            variant: "destructive",
          });
        } else if (msg.includes('STRIPE_SECRET_KEY')) {
          toast({
            title: "Configuration Error",
            description: "Payment system is not properly configured. Please contact support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Checkout Error",
            description: error.message || "Failed to create checkout session. Please try again.",
            variant: "destructive",
          });
        }
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

      console.log('Checkout URL received, redirecting:', data.url);
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('Checkout exception:', error);
      const msg = error?.message || '';
      
      if (msg.includes('User not authenticated') || 
          msg.includes('No authorization header') || 
          msg.includes('Session from session_id claim in JWT does not exist')) {
        toast({
          title: "Session Expired",
          description: "Your login session has expired. Please sign in again to continue with checkout.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setTimeout(() => {
        if (pricingPlan === 'monthly') {
          setUpgradingMonthly(false);
        } else {
          setUpgradingAnnual(false);
        }
      }, 2000);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      console.log('Opening customer portal...');

      const accessToken = await ensureValidSession();
      if (!accessToken) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to access customer portal.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal:', error);
        
        if (error.message?.includes('No configuration provided') || 
            error.message?.includes('default configuration has not been created')) {
          toast({
            title: "Customer Portal Not Configured",
            description: "The subscription management portal needs to be set up. Please contact support to manage your subscription.",
            variant: "destructive",
          });
          return;
        }

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
      setIsTrial(false);
      setTrialEnd(null);
    }
  }, [user, authLoading]);

  const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'premium_annual';
  const isPremiumAnnual = subscriptionTier === 'premium_annual';
  const isBasic = subscriptionTier === 'basic';
  
  // Computed upgrading state for backward compatibility
  const upgrading = upgradingMonthly || upgradingAnnual;
  
  // Calculate trial days left
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <SubscriptionContext.Provider value={{
      subscriptionTier,
      status,
      currentPeriodEnd,
      loading,
      upgrading,
      upgradingMonthly,
      upgradingAnnual,
      checkSubscription,
      createCheckout,
      openCustomerPortal,
      isPremium,
      isPremiumAnnual,
      isBasic,
      isTrial,
      trialEnd,
      trialDaysLeft,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

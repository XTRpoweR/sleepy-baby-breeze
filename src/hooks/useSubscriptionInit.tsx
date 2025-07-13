
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionInit = () => {
  const { user } = useAuth();

  useEffect(() => {
    const initializeSubscription = async () => {
      if (!user) return;

      try {
        // Check if user already has a subscription record
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // If no subscription record exists, create a basic one
        if (!existingSubscription && user.email) {
          console.log('Creating initial subscription record for new user:', user.id);
          
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

    initializeSubscription();
  }, [user]);
};

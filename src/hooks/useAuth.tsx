
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { applyMetaAdvancedMatching } from '@/utils/metaPixel';
import { buildMetaUserData } from '@/utils/metaUserData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session retrieved:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            const ud = buildMetaUserData(session.user);
            if (ud) applyMetaAdvancedMatching(ud);
          }
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No session');
        
        // Handle the session and user state
        setSession(session);
        setUser(session?.user ?? null);

        // Push Advanced Matching params to Meta Pixel for higher EMQ
        if (session?.user) {
          const ud = buildMetaUserData(session.user);
          if (ud) applyMetaAdvancedMatching(ud);

          // Send welcome email once, after email is confirmed
          if (event === 'SIGNED_IN' && session.user.email_confirmed_at && session.user.email) {
            const lang = (typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en');
            setTimeout(() => {
              supabase.functions.invoke('send-welcome-email', {
                body: {
                  user_id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
                  language: lang,
                },
              }).catch((err) => console.warn('welcome email skipped', err));
            }, 0);
          }

          // Track user geo location (debounced server-side, max 1/day per user)
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              supabase.functions.invoke('track-user-location', { body: {} })
                .catch((err) => console.warn('location tracking skipped', err));
            }, 1500);
          }
        }


        // Only set loading to false after we've processed the auth change
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Log security event for sign out
      if (user) {
        try {
          await supabase.functions.invoke('security-notifications', {
            body: {
              action: 'log_event',
              eventType: 'user_signout',
              description: 'User signed out',
              severity: 'info'
            }
          });
        } catch (error) {
          console.error('Failed to log signout event:', error);
        }
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      // Clear local state immediately
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

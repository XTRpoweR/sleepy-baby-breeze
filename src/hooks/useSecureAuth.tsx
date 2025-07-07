
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { RateLimiter } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  secureSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  secureSignUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  isLocked: boolean;
  lockoutTimeRemaining: number;
}

// Rate limiter for failed login attempts (5 attempts per 15 minutes)
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

export const useSecureAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Reset lockout on successful login
        if (event === 'SIGNED_IN') {
          setIsLocked(false);
          setLockoutTimeRemaining(0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (lockoutTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockoutTimeRemaining(prev => {
          if (prev <= 1000) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [lockoutTimeRemaining]);

  const secureSignIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const clientId = `${email}-${window.navigator.userAgent}`;
    
    // Check rate limiting
    if (!loginRateLimiter.isAllowed(clientId)) {
      const remainingTime = loginRateLimiter.getRemainingTime(clientId);
      setIsLocked(true);
      setLockoutTimeRemaining(remainingTime);
      
      const minutes = Math.ceil(remainingTime / 60000);
      return { 
        success: false, 
        error: `Account temporarily locked. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` 
      };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        // Log security event for failed login
        console.warn(`Failed login attempt for email: ${email}`, error.message);
        
        toast({
          title: "Sign In Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        
        return { success: false, error: "Invalid email or password" };
      }

      console.log(`Successful login for email: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const secureSignUp = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.warn(`Failed signup attempt for email: ${email}`, error.message);
        return { success: false, error: error.message };
      }

      console.log(`Successful signup for email: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signOut,
    secureSignIn,
    secureSignUp,
    isLocked,
    lockoutTimeRemaining
  };
};

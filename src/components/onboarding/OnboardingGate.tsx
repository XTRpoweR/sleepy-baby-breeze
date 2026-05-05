import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Redirects newly-signed-up users to /onboarding until they finish (or skip) the flow.
 * Existing users (onboarding_completed = true, set by migration) are unaffected.
 */
export const OnboardingGate = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  // Routes where we never force the redirect (the onboarding page itself, auth, public marketing pages)
  const PUBLIC_PATHS = [
    '/',
    '/auth',
    '/onboarding',
    '/reset-password',
    '/security',
    '/features',
    '/pricing',
    '/about',
    '/contact',
    '/help',
    '/privacy',
    '/blog',
    '/careers',
    '/download',
    '/tutorial',
    '/getting-started',
    '/unsubscribe',
    '/invitation',
    '/404',
  ];

  useEffect(() => {
    if (loading || !user) {
      setChecked(false);
      return;
    }
    // Don't gate public/marketing/auth routes
    if (PUBLIC_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'))) {
      return;
    }
    let active = true;
    const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
    const isRecentlyCreatedUser = createdAt > Date.now() - 24 * 60 * 60 * 1000;

    (async () => {
      let data: { onboarding_completed: boolean } | null = null;
      let error: unknown = null;

      // New signups can hit protected routes before the profile trigger is visible to RLS.
      // Retry briefly so the onboarding redirect does not get skipped on first login.
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const result = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        data = result.data;
        error = result.error;
        if (data || error || !isRecentlyCreatedUser) break;
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      if (!active) return;
      if (!error && ((data && data.onboarding_completed === false) || (!data && isRecentlyCreatedUser))) {
        navigate('/onboarding', { replace: true });
      }
      setChecked(true);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, location.pathname]);

  return null;
};

export default OnboardingGate;

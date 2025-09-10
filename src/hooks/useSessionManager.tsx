import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserSession {
  id: string;
  session_id: string;
  device_info: string;
  ip_address: string;
  user_agent: string;
  location_info: any;
  login_at: string;
  last_activity_at: string;
  is_active: boolean;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  event_description: string;
  metadata: any;
  ip_address: string;
  user_agent: string;
  severity: string;
  created_at: string;
}

export const useSessionManager = () => {
  const { user, session } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSessionId] = useState(() => {
    // Generate a unique session ID for this browser session
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  // Track current session
  useEffect(() => {
    if (user && session) {
      trackCurrentSession();
      // Update activity every 5 minutes
      const interval = setInterval(updateSessionActivity, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, session]);

  const trackCurrentSession = useCallback(async () => {
    if (!user || !session) return;

    try {
      const deviceInfo = {
        device: navigator.platform || 'Unknown',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      await supabase.functions.invoke('session-manager', {
        body: {
          action: 'track_session',
          sessionId: currentSessionId,
          deviceInfo
        }
      });
    } catch (error) {
      console.error('Failed to track session:', error);
    }
  }, [user, session, currentSessionId]);

  const updateSessionActivity = useCallback(async () => {
    if (!user || !session) return;

    try {
      await supabase.functions.invoke('session-manager', {
        body: {
          action: 'update_activity',
          sessionId: currentSessionId
        }
      });
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, [user, session, currentSessionId]);

  const fetchSessions = useCallback(async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: { action: 'get_sessions' }
      });

      if (error) throw error;
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  const fetchSecurityEvents = useCallback(async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('security-notifications', {
        body: { action: 'get_events' }
      });

      if (error) throw error;
      setSecurityEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  const invalidateSession = useCallback(async (sessionId: string) => {
    if (!user || !session) return;

    try {
      const { error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'invalidate_session',
          sessionId
        }
      });

      if (error) throw error;
      
      // Refresh sessions list
      await fetchSessions();
      
      return true;
    } catch (error) {
      console.error('Failed to invalidate session:', error);
      return false;
    }
  }, [user, session, fetchSessions]);

  const invalidateAllOtherSessions = useCallback(async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'invalidate_all_sessions',
          sessionId: currentSessionId
        }
      });

      if (error) throw error;
      
      // Refresh sessions list
      await fetchSessions();
      
      return data.invalidated_count || 0;
    } catch (error) {
      console.error('Failed to invalidate all sessions:', error);
      return 0;
    }
  }, [user, session, currentSessionId, fetchSessions]);

  const logSecurityEvent = useCallback(async (
    eventType: string,
    description: string,
    metadata?: any,
    severity: string = 'info'
  ) => {
    if (!user || !session) return;

    try {
      await supabase.functions.invoke('security-notifications', {
        body: {
          action: 'log_event',
          eventType,
          description,
          metadata,
          severity
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user, session]);

  const handlePasswordChanged = useCallback(async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase.functions.invoke('security-notifications', {
        body: { action: 'password_changed' }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Failed to handle password change:', error);
      return null;
    }
  }, [user, session]);

  return {
    sessions,
    securityEvents,
    loading,
    currentSessionId,
    fetchSessions,
    fetchSecurityEvents,
    invalidateSession,
    invalidateAllOtherSessions,
    logSecurityEvent,
    handlePasswordChanged,
    updateSessionActivity
  };
};
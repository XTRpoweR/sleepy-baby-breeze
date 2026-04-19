
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = 'BNRRv_wFm_weccCMzsyiqs8nrIllND0pU2dJsFl3ZCPJRfrGSNNaDgeztzxHwGj6yS5y2mu5sdnvdFweb0BjUdk';

/**
 * Detect the device/browser notification support level.
 * Returns detailed info so the UI can show helpful messages.
 */
export interface NotificationSupportInfo {
  supported: boolean;
  canReceivePush: boolean;
  isIOS: boolean;
  isStandalone: boolean; // installed as PWA
  reason: 'ok' | 'ios-needs-pwa' | 'no-notification-api' | 'insecure-context' | 'no-service-worker';
}

export const detectNotificationSupport = (): NotificationSupportInfo => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  if (!window.isSecureContext && location.hostname !== 'localhost') {
    return { supported: false, canReceivePush: false, isIOS, isStandalone, reason: 'insecure-context' };
  }
  if (!('Notification' in window)) {
    return { supported: false, canReceivePush: false, isIOS, isStandalone, reason: 'no-notification-api' };
  }
  // On iOS, Web Push only works in PWAs installed to the Home Screen (iOS 16.4+).
  if (isIOS && !isStandalone) {
    return { supported: true, canReceivePush: false, isIOS, isStandalone, reason: 'ios-needs-pwa' };
  }
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { supported: true, canReceivePush: false, isIOS, isStandalone, reason: 'no-service-worker' };
  }
  return { supported: true, canReceivePush: true, isIOS, isStandalone, reason: 'ok' };
};


function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface NotificationSettings {
  feedingReminders: boolean;
  sleepReminders: boolean;
  milestoneReminders: boolean;
  patternAlerts: boolean;
  feedingInterval: number;
  sleepWindowAlert: boolean;
  notificationsEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultSettings: NotificationSettings = {
  feedingReminders: true,
  sleepReminders: true,
  milestoneReminders: true,
  patternAlerts: true,
  feedingInterval: 180,
  sleepWindowAlert: true,
  notificationsEnabled: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00'
  }
};

export const useNotifications = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  const isSupported = useCallback(() => {
    if (!('Notification' in window)) return false;
    if (!window.isSecureContext && location.hostname !== 'localhost') return false;
    try {
      if (typeof Notification.requestPermission !== 'function') return false;
      return true;
    } catch {
      return false;
    }
  }, []);

  // Auto-register Service Worker on mount if permission is already granted.
  // Without this, pushes from the server stop arriving after a page reload
  // because the SW subscription lapses.
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (!('serviceWorker' in navigator)) return;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          await navigator.serviceWorker.register('/sw.js');
        }
      } catch (e) {
        console.warn('[SW] Auto-register failed:', e);
      }
    })();
  }, []);

  // Load settings from DB on mount
  useEffect(() => {
    if (isSupported()) {
      setPermission(Notification.permission);
    }

    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage for unauthenticated
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
          try { setSettings({ ...defaultSettings, ...JSON.parse(saved) }); } catch {}
        }
        return;
      }

      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings({
          feedingReminders: data.feeding_reminders,
          sleepReminders: data.sleep_reminders,
          milestoneReminders: data.milestone_reminders,
          patternAlerts: data.pattern_alerts,
          feedingInterval: data.feeding_interval,
          sleepWindowAlert: true,
          notificationsEnabled: (data as any).notifications_enabled ?? true,
          quietHours: {
            enabled: data.quiet_hours_enabled,
            start: String(data.quiet_hours_start).substring(0, 5),
            end: String(data.quiet_hours_end).substring(0, 5),
          },
        });
      }
    };

    loadSettings();
  }, [isSupported]);

  // Sync settings to DB
  const syncSettingsToDB = useCallback(async (updatedSettings: NotificationSettings) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('notification_settings').upsert({
      user_id: user.id,
      feeding_reminders: updatedSettings.feedingReminders,
      sleep_reminders: updatedSettings.sleepReminders,
      milestone_reminders: updatedSettings.milestoneReminders,
      pattern_alerts: updatedSettings.patternAlerts,
      feeding_interval: updatedSettings.feedingInterval,
      quiet_hours_enabled: updatedSettings.quietHours.enabled,
      quiet_hours_start: updatedSettings.quietHours.start,
      quiet_hours_end: updatedSettings.quietHours.end,
      notifications_enabled: updatedSettings.notificationsEnabled,
    } as any, { onConflict: 'user_id' });
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted' || !isSupported()) return;
    if (!settings.notificationsEnabled) return;

    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = parseInt(settings.quietHours.start.split(':')[0]) * 60 + parseInt(settings.quietHours.start.split(':')[1]);
      const endTime = parseInt(settings.quietHours.end.split(':')[0]) * 60 + parseInt(settings.quietHours.end.split(':')[1]);
      
      if (startTime > endTime) {
        if (currentTime >= startTime || currentTime <= endTime) return;
      } else {
        if (currentTime >= startTime && currentTime <= endTime) return;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'sleepybaby-notification',
        requireInteraction: true,
        ...options
      });
      setTimeout(() => notification.close(), 10000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission, settings.quietHours, settings.notificationsEnabled, isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported()) {
      toast({ title: "Not Supported", description: "Your browser doesn't support notifications.", variant: "destructive" });
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({ title: "Notifications Blocked", description: "Please enable notifications in your browser settings", variant: "destructive" });
      return false;
    }

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await registerServiceWorkerAndSubscribe();
        toast({ title: "Notifications Enabled!", description: "You'll now receive smart reminders for your baby's care" });
        showNotification('Welcome!', { body: 'Notifications are now enabled.', tag: 'welcome-notification' });
        return true;
      } else {
        toast({ title: "Notifications Blocked", description: "You can enable them later in your browser settings", variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({ title: "Error", description: "Failed to request notification permission", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, isSupported, showNotification]);

  const registerServiceWorkerAndSubscribe = useCallback(async () => {
    const isInIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
    if (isInIframe || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const sw = await navigator.serviceWorker.ready;

      let subscription = await sw.pushManager.getSubscription();
      if (!subscription) {
        subscription = await sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user && subscription) {
        const subJson = subscription.toJSON();
        await supabase.from('push_subscriptions').upsert(
          { user_id: user.id, endpoint: subJson.endpoint!, p256dh: subJson.keys?.p256dh || '', auth: subJson.keys?.auth || '' },
          { onConflict: 'user_id,endpoint' }
        );
      }
    } catch (error) {
      console.error('[Push] Registration error:', error);
    }
  }, []);

  const unsubscribeFromPush = useCallback(async () => {
    const isInIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    if (isInIframe || !('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;
      const subscription = await reg.pushManager.getSubscription();
      if (!subscription) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }
      await subscription.unsubscribe();
    } catch (error) {
      console.error('[Push] Unsubscribe error:', error);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
    syncSettingsToDB(updatedSettings);
    if (newSettings.notificationsEnabled === false && settings.notificationsEnabled !== false) {
      unsubscribeFromPush();
    }
    if (newSettings.notificationsEnabled === true && settings.notificationsEnabled !== true && permission === 'granted') {
      registerServiceWorkerAndSubscribe();
    }
  }, [settings, syncSettingsToDB, unsubscribeFromPush, permission, registerServiceWorkerAndSubscribe]);

  const saveSettings = useCallback(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    syncSettingsToDB(settings);
    toast({ title: "Settings Saved", description: "Your notification preferences have been saved successfully" });
  }, [settings, toast, syncSettingsToDB]);

  return {
    permission,
    settings,
    isLoading,
    requestPermission,
    showNotification,
    updateSettings,
    saveSettings,
    isSupported: isSupported(),
    registerServiceWorkerAndSubscribe,
    unsubscribeFromPush
  };
};

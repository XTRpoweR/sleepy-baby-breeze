
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NotificationSettings {
  feedingReminders: boolean;
  sleepReminders: boolean;
  milestoneReminders: boolean;
  patternAlerts: boolean;
  feedingInterval: number; // minutes
  sleepWindowAlert: boolean;
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
  feedingInterval: 180, // 3 hours
  sleepWindowAlert: true,
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

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive smart reminders for your baby's care",
        });
        return true;
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You can enable them later in your browser settings",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return;

    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = parseInt(settings.quietHours.start.split(':')[0]) * 60 + parseInt(settings.quietHours.start.split(':')[1]);
      const endTime = parseInt(settings.quietHours.end.split(':')[0]) * 60 + parseInt(settings.quietHours.end.split(':')[1]);
      
      if (startTime > endTime) {
        // Quiet hours span midnight
        if (currentTime >= startTime || currentTime <= endTime) return;
      } else {
        // Quiet hours within the same day
        if (currentTime >= startTime && currentTime <= endTime) return;
      }
    }

    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'sleepybaby-notification',
      ...options
    });
  }, [permission, settings.quietHours]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
  }, [settings]);

  return {
    permission,
    settings,
    isLoading,
    requestPermission,
    showNotification,
    updateSettings,
    isSupported: 'Notification' in window
  };
};

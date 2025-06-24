
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

  // More robust browser support detection
  const isSupported = useCallback(() => {
    if (!('Notification' in window)) {
      console.log('Notification API not available');
      return false;
    }

    if (!window.isSecureContext && location.hostname !== 'localhost') {
      console.log('Notifications require HTTPS');
      return false;
    }

    try {
      if (typeof Notification.requestPermission !== 'function') {
        console.log('Notification.requestPermission not available');
        return false;
      }
      return true;
    } catch (error) {
      console.log('Error checking notification support:', error);
      return false;
    }
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (isSupported()) {
      setPermission(Notification.permission);
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
        console.log('Loaded notification settings from localStorage:', parsed);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported()) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications. Try using Chrome, Firefox, or Safari on HTTPS.",
        variant: "destructive",
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      toast({
        title: "Notifications Already Enabled",
        description: "You're all set to receive smart reminders!",
      });
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings and refresh the page",
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
          title: "Notifications Enabled!",
          description: "You'll now receive smart reminders for your baby's care",
        });
        
        // Send a test notification to confirm it works
        showNotification('Welcome!', {
          body: 'Notifications are now enabled. You\'ll receive reminders based on your settings.',
          tag: 'welcome-notification'
        });
        
        return true;
      } else if (result === 'denied') {
        toast({
          title: "Notifications Blocked",
          description: "You can enable them later in your browser settings",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Permission Needed",
          description: "Please allow notifications to receive reminders",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, isSupported, showNotification]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted' || !isSupported()) {
      console.log('Cannot show notification - permission not granted or not supported');
      return;
    }

    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = parseInt(settings.quietHours.start.split(':')[0]) * 60 + parseInt(settings.quietHours.start.split(':')[1]);
      const endTime = parseInt(settings.quietHours.end.split(':')[0]) * 60 + parseInt(settings.quietHours.end.split(':')[1]);
      
      if (startTime > endTime) {
        // Quiet hours span midnight
        if (currentTime >= startTime || currentTime <= endTime) {
          console.log('Notification suppressed due to quiet hours');
          return;
        }
      } else {
        // Quiet hours within the same day
        if (currentTime >= startTime && currentTime <= endTime) {
          console.log('Notification suppressed due to quiet hours');
          return;
        }
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'sleepybaby-notification',
        requireInteraction: true, // Keep notification visible until user interacts
        ...options
      });

      // Auto-close after 10 seconds if user doesn't interact
      setTimeout(() => {
        notification.close();
      }, 10000);

      console.log('Notification sent:', title);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission, settings.quietHours, isSupported]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage immediately
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
    console.log('Notification settings saved:', updatedSettings);
    
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been saved successfully",
    });
  }, [settings, toast]);

  const saveSettings = useCallback(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been saved successfully",
    });
    console.log('Notification settings manually saved:', settings);
  }, [settings, toast]);

  return {
    permission,
    settings,
    isLoading,
    requestPermission,
    showNotification,
    updateSettings,
    saveSettings,
    isSupported: isSupported()
  };
};

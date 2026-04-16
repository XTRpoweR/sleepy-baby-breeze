
-- Add notifications_enabled column to notification_settings
ALTER TABLE public.notification_settings 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true;

-- Clean up orphaned scheduled notifications for deleted baby profiles
DELETE FROM public.scheduled_notifications 
WHERE baby_id NOT IN (SELECT id FROM public.baby_profiles);

-- Clean up orphaned baby_activities for deleted baby profiles
DELETE FROM public.baby_activities 
WHERE baby_id NOT IN (SELECT id FROM public.baby_profiles);

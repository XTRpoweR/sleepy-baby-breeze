-- Enable realtime for sleep_schedules table
ALTER TABLE public.sleep_schedules REPLICA IDENTITY FULL;

-- Add sleep_schedules to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_schedules;
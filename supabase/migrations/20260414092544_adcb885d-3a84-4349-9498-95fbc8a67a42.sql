SELECT cron.schedule(
  'schedule-notifications-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://wjxxgccfazpkdfzbcgen.supabase.co/functions/v1/schedule-notifications',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeHhnY2NmYXpwa2RmemJjZ2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDIyNDUsImV4cCI6MjA2NzMxODI0NX0.dfYtSo4xFI80fZjHUFE_p3a6J3QwkX90UiTzHc_Y7iQ"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'send-push-notifications-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://wjxxgccfazpkdfzbcgen.supabase.co/functions/v1/send-push-notification',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeHhnY2NmYXpwa2RmemJjZ2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDIyNDUsImV4cCI6MjA2NzMxODI0NX0.dfYtSo4xFI80fZjHUFE_p3a6J3QwkX90UiTzHc_Y7iQ"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);
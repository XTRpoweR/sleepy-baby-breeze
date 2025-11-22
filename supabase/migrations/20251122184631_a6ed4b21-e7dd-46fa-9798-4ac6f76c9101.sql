-- Enable realtime for baby_activities table
-- This allows real-time updates when activities are added, modified, or deleted

-- Set replica identity to FULL to capture complete row data during updates
ALTER TABLE baby_activities REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE baby_activities;
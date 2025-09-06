-- Add trial tracking fields to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN trial_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_trial BOOLEAN DEFAULT false;
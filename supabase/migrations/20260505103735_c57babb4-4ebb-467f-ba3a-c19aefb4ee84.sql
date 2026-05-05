ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Mark all existing users as already onboarded (they have data / already explored the app)
UPDATE public.profiles
SET onboarding_completed = true,
    onboarding_completed_at = COALESCE(onboarding_completed_at, now())
WHERE onboarding_completed = false;

-- Allow users to update their own onboarding columns via existing RLS UPDATE policy
-- (no policy change needed — current "Users can update their own profile" policy already covers this,
--  and is_admin field is protected by its WITH CHECK clause)

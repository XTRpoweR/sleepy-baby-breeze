-- Fix security issue: Remove overly permissive policy on family_invitations
-- This prevents public exposure of email addresses while maintaining functionality

-- Drop the insecure policy that allows anyone to view all invitations
DROP POLICY IF EXISTS "Anyone can view invitations by token" ON public.family_invitations;

-- The invitation flow will now work as follows:
-- 1. Unauthenticated users can view basic invitation info via edge function
-- 2. After sign up/login, users can view invitations sent to their email via existing policy:
--    "Users can view invitations sent to their email"
-- 3. Baby owners can manage all invitations via existing policy:
--    "Baby owners can manage invitations"

-- This maintains all functionality while protecting email addresses from public exposure

-- Add verification columns to family_invitations table
ALTER TABLE public.family_invitations 
ADD COLUMN verification_code TEXT,
ADD COLUMN verification_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Create index for performance on verification lookups
CREATE INDEX idx_family_invitations_verification_code ON public.family_invitations(verification_code) WHERE verification_code IS NOT NULL;
CREATE INDEX idx_family_invitations_verification_expires ON public.family_invitations(verification_expires_at) WHERE verification_expires_at IS NOT NULL;

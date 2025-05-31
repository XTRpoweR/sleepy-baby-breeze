
-- Create family_invitations table for managing invitations to join family sharing
CREATE TABLE public.family_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'caregiver',
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  permissions JSONB DEFAULT '{"can_edit": true, "can_delete": false, "can_invite": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for family invitations
CREATE POLICY "Baby owners manage invitations"
ON public.family_invitations
FOR ALL
TO authenticated
USING (public.is_baby_owner(auth.uid(), baby_id))
WITH CHECK (public.is_baby_owner(auth.uid(), baby_id));

-- Create index for performance
CREATE INDEX idx_family_invitations_baby_id ON public.family_invitations(baby_id);
CREATE INDEX idx_family_invitations_email ON public.family_invitations(email);
CREATE INDEX idx_family_invitations_status ON public.family_invitations(status);

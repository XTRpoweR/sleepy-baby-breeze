
-- Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Create is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- Set admin user
UPDATE public.profiles SET is_admin = true WHERE email = 'jhonejitx@gmail.com';

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_name text,
  sender_email text NOT NULL,
  subject text,
  message_body text NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'closed')),
  replied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_message_id uuid REFERENCES public.contact_messages(id) ON DELETE SET NULL,
  resend_email_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contact_messages_thread_id ON public.contact_messages(thread_id);
CREATE INDEX idx_contact_messages_sender_email ON public.contact_messages(sender_email);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Service role can insert contact messages"
  ON public.contact_messages FOR INSERT
  TO public
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

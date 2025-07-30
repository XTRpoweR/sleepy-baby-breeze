
-- Create family_messages table for storing messages
CREATE TABLE public.family_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  attachment_url TEXT,
  attachment_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_participants table to track who can see messages
CREATE TABLE public.message_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.family_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for family_messages
CREATE POLICY "Users can view messages for accessible babies" 
  ON public.family_messages 
  FOR SELECT 
  USING (can_access_baby(auth.uid(), baby_id));

CREATE POLICY "Users can create messages for accessible babies" 
  ON public.family_messages 
  FOR INSERT 
  WITH CHECK (can_access_baby(auth.uid(), baby_id) AND sender_id = auth.uid());

CREATE POLICY "Senders can update their own messages" 
  ON public.family_messages 
  FOR UPDATE 
  USING (sender_id = auth.uid()) 
  WITH CHECK (sender_id = auth.uid());

-- RLS policies for message_participants
CREATE POLICY "Users can view their own message participation" 
  ON public.message_participants 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "System can create message participants" 
  ON public.message_participants 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own read status" 
  ON public.message_participants 
  FOR UPDATE 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

-- Enable realtime for messages
ALTER TABLE public.family_messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_participants;

-- Create function to automatically add message participants
CREATE OR REPLACE FUNCTION public.create_message_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Add all family members as participants
  INSERT INTO public.message_participants (message_id, user_id)
  SELECT NEW.id, user_id
  FROM public.family_members
  WHERE baby_id = NEW.baby_id AND status = 'active'
  UNION
  -- Add baby owner as participant
  SELECT NEW.id, user_id
  FROM public.baby_profiles
  WHERE id = NEW.baby_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create participants
CREATE TRIGGER create_message_participants_trigger
  AFTER INSERT ON public.family_messages
  FOR EACH ROW EXECUTE FUNCTION public.create_message_participants();

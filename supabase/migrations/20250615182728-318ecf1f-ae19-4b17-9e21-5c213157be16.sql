
-- Create a table for baby memories (photos and videos)
CREATE TABLE public.baby_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  file_size BIGINT,
  mime_type TEXT,
  taken_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.baby_memories ENABLE ROW LEVEL SECURITY;

-- Create policies for memories access
CREATE POLICY "Users can view memories for babies they have access to" 
  ON public.baby_memories 
  FOR SELECT 
  USING (public.can_access_baby(auth.uid(), baby_id));

CREATE POLICY "Users can create memories for babies they can edit" 
  ON public.baby_memories 
  FOR INSERT 
  WITH CHECK (public.can_edit_baby_activities(auth.uid(), baby_id) AND auth.uid() = user_id);

CREATE POLICY "Users can update their own memories for babies they can edit" 
  ON public.baby_memories 
  FOR UPDATE 
  USING (public.can_edit_baby_activities(auth.uid(), baby_id) AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories for babies they can edit" 
  ON public.baby_memories 
  FOR DELETE 
  USING (public.can_edit_baby_activities(auth.uid(), baby_id) AND auth.uid() = user_id);

-- Create storage bucket for baby memories
INSERT INTO storage.buckets (id, name, public) 
VALUES ('baby-memories', 'baby-memories', true);

-- Create storage policies for the memories bucket
CREATE POLICY "Users can upload memories for babies they can edit" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'baby-memories' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view memories" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'baby-memories');

CREATE POLICY "Users can update their own memory files" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'baby-memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own memory files" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'baby-memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

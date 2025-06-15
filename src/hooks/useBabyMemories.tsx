
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BabyMemory {
  id: string;
  baby_id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: 'photo' | 'video';
  file_size: number | null;
  mime_type: string | null;
  taken_at: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to convert a raw Supabase row to the correct BabyMemory type
const toBabyMemory = (row: any): BabyMemory => ({
  ...row,
  media_type: row.media_type === 'video' ? 'video' : 'photo',
});

export const useBabyMemories = (babyId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [memories, setMemories] = useState<BabyMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user && babyId) {
      fetchMemories();
    } else {
      setLoading(false);
    }
  }, [user, babyId]);

  const fetchMemories = async () => {
    if (!user || !babyId) return;

    try {
      const { data, error } = await supabase
        .from('baby_memories')
        .select('*')
        .eq('baby_id', babyId)
        .order('taken_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching memories:', error);
        toast({
          title: "Error",
          description: "Failed to load memories",
          variant: "destructive",
        });
        return;
      }

      setMemories((data || []).map(toBabyMemory));
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadMemory = async (
    file: File,
    title?: string,
    description?: string,
    takenAt?: Date
  ) => {
    if (!user || !babyId) return false;

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${babyId}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('baby-memories')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast({
          title: "Upload Error",
          description: "Failed to upload file",
          variant: "destructive",
        });
        return false;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('baby-memories')
        .getPublicUrl(fileName);

      // Create memory record
      const { data, error } = await supabase
        .from('baby_memories')
        .insert({
          baby_id: babyId,
          user_id: user.id,
          title: title || null,
          description: description || null,
          media_url: publicUrl,
          media_type: file.type.startsWith('video/') ? 'video' : 'photo',
          file_size: file.size,
          mime_type: file.type,
          taken_at: takenAt ? takenAt.toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating memory record:', error);
        // Clean up uploaded file if record creation fails
        await supabase.storage.from('baby-memories').remove([fileName]);
        toast({
          title: "Error",
          description: "Failed to save memory",
          variant: "destructive",
        });
        return false;
      }

      setMemories(prev => [toBabyMemory(data), ...prev]);
      toast({
        title: "Success!",
        description: "Memory uploaded successfully",
      });
      return true;
    } catch (error) {
      console.error('Error uploading memory:', error);
      toast({
        title: "Error",
        description: "Failed to upload memory",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    if (!user) return false;

    try {
      const memory = memories.find(m => m.id === memoryId);
      if (!memory) return false;

      // Delete from database
      const { error } = await supabase
        .from('baby_memories')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting memory:', error);
        toast({
          title: "Error",
          description: "Failed to delete memory",
          variant: "destructive",
        });
        return false;
      }

      // Delete from storage
      const fileName = memory.media_url.split('/').pop();
      if (fileName) {
        const storageKey = `${user.id}/${babyId}/${fileName}`;
        await supabase.storage.from('baby-memories').remove([storageKey]);
      }

      setMemories(prev => prev.filter(m => m.id !== memoryId));
      toast({
        title: "Success!",
        description: "Memory deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  };

  const updateMemory = async (
    memoryId: string,
    updates: { title?: string; description?: string; taken_at?: Date | null }
  ) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('baby_memories')
        .update({
          title: updates.title,
          description: updates.description,
          taken_at: updates.taken_at ? updates.taken_at.toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memoryId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating memory:', error);
        toast({
          title: "Error",
          description: "Failed to update memory",
          variant: "destructive",
        });
        return false;
      }

      setMemories(prev => prev.map(m => m.id === memoryId ? toBabyMemory(data) : m));
      toast({
        title: "Success!",
        description: "Memory updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating memory:', error);
      return false;
    }
  };

  return {
    memories,
    loading,
    uploading,
    uploadMemory,
    deleteMemory,
    updateMemory,
    refetch: fetchMemories
  };
};


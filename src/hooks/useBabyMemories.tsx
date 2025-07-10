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
      toast({
        title: "Error",
        description: "Failed to load memories",
        variant: "destructive",
      });
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

    // Check file size before upload (10MB limit recommended, 50MB absolute max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const recommendedSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the maximum limit of 50MB. Please choose a smaller file.`,
        variant: "destructive",
      });
      return false;
    }

    if (file.size > recommendedSize) {
      console.warn(`Large file upload: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
    }

    setUploading(true);
    try {
      console.log('Starting memory upload:', { fileName: file.name, fileSize: file.size, fileType: file.type });

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${babyId}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('baby-memories')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        
        let errorMessage = 'Failed to upload file';
        if (uploadError.message?.includes('Payload too large') || uploadError.message?.includes('413')) {
          errorMessage = `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please try a smaller file or compress the video.`;
        } else if (uploadError.message?.includes('quota') || uploadError.message?.includes('storage')) {
          errorMessage = 'Storage limit reached. Please contact support or free up space.';
        }
        
        toast({
          title: "Upload Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      console.log('File uploaded successfully:', uploadData.path);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('baby-memories')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

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

      console.log('Memory record created successfully:', data.id);

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

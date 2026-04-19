import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Baby, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProfileAvatarEditorProps {
  profileId: string;
  currentPhoto?: string | null;
  name: string;
  canEdit: boolean;
  onPhotoChange: (url: string) => Promise<void> | void;
}

export const ProfileAvatarEditor = ({
  currentPhoto,
  name,
  canEdit,
  onPhotoChange,
}: ProfileAvatarEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File must be under 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(data.path);

      await onPhotoChange(publicUrl);
      toast({ title: 'Photo updated', description: 'Profile photo updated successfully' });
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Upload failed', description: 'Could not upload photo', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Avatar className="h-12 w-12 border-2 border-primary/20">
        <AvatarImage src={currentPhoto || ''} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary">
          <Baby className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      {canEdit && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:scale-110 transition-transform disabled:opacity-50"
          aria-label="Change photo"
        >
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Camera className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
};

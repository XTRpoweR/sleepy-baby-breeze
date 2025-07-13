
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Baby, Calendar, ArrowLeft } from 'lucide-react';
import { PhotoUpload } from '@/components/ui/photo-upload';

interface BabyProfileSetupProps {
  onProfileCreated: (profileData: { name: string; birth_date?: string; photo_url?: string }) => Promise<boolean>;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const BabyProfileSetup = ({ onProfileCreated, showBackButton = false, onBack }: BabyProfileSetupProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const success = await onProfileCreated({
      name: name.trim(),
      birth_date: birthDate || undefined,
      photo_url: photoUrl || undefined
    });
    
    if (success) {
      setName('');
      setBirthDate('');
      setPhotoUrl(null);
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        {showBackButton && onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-2 self-start flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        )}
        <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Baby className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>{t('tracking.babyProfileSetup.title')}</CardTitle>
        <p className="text-gray-600">{t('tracking.babyProfileSetup.subtitle')}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('tracking.babyProfileSetup.nameRequired')}</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('tracking.babyProfileSetup.namePlaceholder')}
              required
            />
          </div>

          <div>
            <Label htmlFor="birthDate" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{t('tracking.babyProfileSetup.birthDateLabel')}</span>
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-3 block">{t('tracking.babyProfileSetup.photoLabel')}</Label>
            <PhotoUpload
              value={photoUrl || undefined}
              onChange={setPhotoUrl}
              fallbackText={name.charAt(0).toUpperCase() || 'B'}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? t('tracking.babyProfileSetup.creatingButton') : t('tracking.babyProfileSetup.createButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

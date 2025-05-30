
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Baby, Calendar } from 'lucide-react';

interface BabyProfileSetupProps {
  onProfileCreated: (profileData: { name: string; birth_date?: string }) => Promise<boolean>;
}

export const BabyProfileSetup = ({ onProfileCreated }: BabyProfileSetupProps) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const success = await onProfileCreated({
      name: name.trim(),
      birth_date: birthDate || undefined
    });
    
    if (success) {
      setName('');
      setBirthDate('');
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Baby className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Set Up Baby Profile</CardTitle>
        <p className="text-gray-600">Create a profile to start tracking activities</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Baby's Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter baby's name"
              required
            />
          </div>

          <div>
            <Label htmlFor="birthDate" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Birth Date (Optional)</span>
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

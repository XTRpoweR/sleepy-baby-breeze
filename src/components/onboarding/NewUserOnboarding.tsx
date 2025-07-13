
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, Crown, Users, Check } from 'lucide-react';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';

interface NewUserOnboardingProps {
  onProfileCreated: (profileData: { name: string; birth_date?: string; photo_url?: string }) => Promise<boolean>;
  onSkip: () => void;
}

export const NewUserOnboarding = ({ onProfileCreated, onSkip }: NewUserOnboardingProps) => {
  const [step, setStep] = useState<'welcome' | 'profile'>('welcome');

  const handleStartSetup = () => {
    setStep('profile');
  };

  const handleProfileCreated = async (profileData: { name: string; birth_date?: string; photo_url?: string }) => {
    const success = await onProfileCreated(profileData);
    if (success) {
      onSkip(); // Close onboarding after successful profile creation
    }
    return success;
  };

  if (step === 'profile') {
    return <BabyProfileSetup onProfileCreated={handleProfileCreated} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader className="text-center">
          <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Baby className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to SleepyBaby!</CardTitle>
          <p className="text-gray-600 mt-2">
            Let's get you started with tracking your baby's activities and sleep patterns.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Baby className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Track Activities</h3>
              <p className="text-sm text-gray-600">Feeding, sleep, diaper changes, and more</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Family Sharing</h3>
              <p className="text-sm text-gray-600">Share access with partners and caregivers</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Crown className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Premium Features</h3>
              <p className="text-sm text-gray-600">Advanced analytics and unlimited profiles</p>
            </div>
          </div>

          {/* What's included in Basic (Free) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Your Basic Plan includes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">1 baby profile</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Activity tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Sleep schedules</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Basic reports</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleStartSetup}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Baby Profile
            </Button>
            <Button 
              variant="outline"
              onClick={onSkip}
              className="flex-1"
            >
              Skip for Now
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can always create profiles later from your dashboard
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

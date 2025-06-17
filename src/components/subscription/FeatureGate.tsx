
import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';

interface FeatureGateProps {
  children: ReactNode;
  feature: 'profiles' | 'history' | 'sharing' | 'reports' | 'sounds' | 'pediatrician' | 'notifications';
  fallback?: ReactNode;
  showUpgrade?: boolean;
  onUpgradeClick?: () => void;
}

export const FeatureGate = ({ 
  children, 
  feature, 
  fallback, 
  showUpgrade = true, 
  onUpgradeClick 
}: FeatureGateProps) => {
  const { isPremium, createCheckout, upgrading } = useSubscription();

  // For now, only profiles and notifications features are gated for basic users
  const isFeatureAllowed = (feature === 'profiles' || feature === 'notifications') ? isPremium : true;

  if (isFeatureAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const featureNames = {
    profiles: 'Multiple Baby Profiles',
    history: 'Extended History',
    sharing: 'Family Sharing',
    reports: 'Advanced Reports',
    sounds: 'Premium Sounds',
    pediatrician: 'Pediatrician Reports',
    notifications: 'Smart Notifications'
  };

  return (
    <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 rounded-full p-3">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          {featureNames[feature]} - Premium Feature
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upgrade to Premium to unlock this feature and get access to unlimited baby profiles, 
          extended history, family sharing, and more.
        </p>
        {showUpgrade && (
          <Button 
            onClick={onUpgradeClick || createCheckout}
            disabled={upgrading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            {upgrading ? 'Processing...' : 'Upgrade to Premium'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

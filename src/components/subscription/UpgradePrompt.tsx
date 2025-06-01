
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Crown, Sparkles, Users, BarChart3 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'profiles' | 'history' | 'sharing' | 'reports' | 'sounds';
  title?: string;
  description?: string;
}

export const UpgradePrompt = ({ 
  isOpen, 
  onClose, 
  feature, 
  title, 
  description 
}: UpgradePromptProps) => {
  const { createCheckout, upgrading } = useSubscription();

  const featureConfig = {
    profiles: {
      icon: Crown,
      title: 'Multiple Baby Profiles',
      description: 'Track multiple children with unlimited baby profiles. Perfect for families with more than one child.',
      benefits: ['Unlimited baby profiles', 'Individual tracking per child', 'Easy profile switching']
    },
    history: {
      icon: BarChart3,
      title: 'Extended Activity History',
      description: 'Access your complete activity history and track long-term patterns with advanced analytics.',
      benefits: ['Unlimited history access', 'Advanced analytics', 'Trend analysis', 'Pattern recognition']
    },
    sharing: {
      icon: Users,
      title: 'Family Sharing',
      description: 'Share baby tracking with your partner, grandparents, and caregivers for collaborative care.',
      benefits: ['Family member invitations', 'Real-time sharing', 'Collaborative tracking', 'Multiple caregiver access']
    },
    reports: {
      icon: BarChart3,
      title: 'Advanced Reports',
      description: 'Get detailed insights with comprehensive reports and analytics to optimize your baby\'s routine.',
      benefits: ['Detailed sleep analysis', 'Feeding patterns', 'Growth tracking', 'Custom date ranges']
    },
    sounds: {
      icon: Sparkles,
      title: 'Premium Sounds Library',
      description: 'Access our complete collection of soothing sounds and white noise to help your baby sleep better.',
      benefits: ['50+ premium sounds', 'High-quality audio', 'Sleep-optimized sounds', 'Timer functionality']
    }
  };

  const config = featureConfig[feature];
  const IconComponent = config.icon;

  const handleUpgrade = async () => {
    await createCheckout();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 rounded-full p-3">
              <IconComponent className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-xl">
            {title || config.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description || config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <h4 className="font-medium text-sm text-gray-900 mb-2">Premium includes:</h4>
          <ul className="space-y-1">
            {config.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <Crown className="h-3 w-3 text-orange-500 mr-2 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <AlertDialogFooter className="flex-col gap-2">
          <AlertDialogAction 
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {upgrading ? 'Processing...' : 'Upgrade to Premium - $9.99/mo'}
          </AlertDialogAction>
          <AlertDialogCancel onClick={onClose} className="w-full">
            Maybe Later
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, X, Check, Users, BarChart3, Baby, Heart, Volume2, FileText, Bell } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'profiles' | 'history' | 'sharing' | 'reports' | 'sounds' | 'memories' | 'pediatrician' | 'notifications';
}

export const UpgradePrompt = ({ isOpen, onClose, feature }: UpgradePromptProps) => {
  const { createCheckout, upgrading } = useSubscription();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await createCheckout();
    } catch (error) {
      console.error('Error creating checkout:', error);
      setIsUpgrading(false);
    }
  };

  const handleViewPlans = () => {
    navigate('/subscription');
    onClose();
  };

  const featureDetails = {
    profiles: {
      icon: Baby,
      title: 'Multiple Baby Profiles',
      description: 'Track multiple children with separate profiles and data.',
      benefits: [
        'Unlimited baby profiles',
        'Individual tracking for each child',
        'Separate data and reports',
        'Family-wide overview'
      ]
    },
    history: {
      icon: BarChart3,
      title: 'Extended History',
      description: 'Access unlimited historical data and advanced analytics.',
      benefits: [
        'Unlimited data history',
        'Advanced trend analysis',
        'Long-term pattern recognition',
        'Export capabilities'
      ]
    },
    sharing: {
      icon: Users,
      title: 'Family Sharing',
      description: 'Share your baby\'s progress with family members and caregivers.',
      benefits: [
        'Invite family members',
        'Real-time data sharing',
        'Multiple caregiver access',
        'Collaborative tracking'
      ]
    },
    reports: {
      icon: BarChart3,
      title: 'Advanced Reports',
      description: 'Get detailed insights and comprehensive reports.',
      benefits: [
        'Detailed analytics',
        'Custom report generation',
        'Trend visualization',
        'Growth tracking'
      ]
    },
    sounds: {
      icon: Volume2,
      title: 'Premium Sounds',
      description: 'Access to premium sleep sounds and white noise.',
      benefits: [
        'Premium sound library',
        'High-quality audio',
        'Custom sound mixing',
        'Sleep optimization'
      ]
    },
    memories: {
      icon: Heart,
      title: 'Photo & Video Memories',
      description: 'Capture and organize precious moments with unlimited storage.',
      benefits: [
        'Unlimited photo storage',
        'Video memory creation',
        'Timeline organization',
        'Memory sharing'
      ]
    },
    pediatrician: {
      icon: FileText,
      title: 'Pediatrician Reports',
      description: 'Generate professional reports for your pediatrician visits.',
      benefits: [
        'Professional report formatting',
        'Comprehensive health summaries',
        'Growth chart integration',
        'Visit preparation tools'
      ]
    },
    notifications: {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Intelligent reminders and notifications for your baby\'s care.',
      benefits: [
        'Feeding time reminders',
        'Sleep window notifications',
        'Milestone alerts',
        'Custom notification settings'
      ]
    }
  };

  const currentFeature = featureDetails[feature];
  const FeatureIcon = currentFeature.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-orange-600" />
            <span>Upgrade to Premium</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Feature Highlight */}
          <Card className="border-2 border-orange-200 bg-orange-50/50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                  <FeatureIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {currentFeature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {currentFeature.description}
                  </p>
                  <div className="space-y-1">
                    {currentFeature.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <div className="text-center py-2">
            <div className="text-2xl font-bold text-gray-900">$9.99/month</div>
            <div className="text-sm text-gray-600">Unlock all Premium features</div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              onClick={handleUpgrade}
              disabled={isUpgrading || upgrading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              {isUpgrading || upgrading ? 'Processing...' : 'Upgrade Now'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleViewPlans}
              className="w-full"
            >
              View All Plans
            </Button>
          </div>

          {/* Additional Benefits */}
          <div className="text-xs text-gray-500 text-center">
            Includes unlimited baby profiles, extended history, family sharing, 
            advanced reports, premium sounds, memories, and more!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

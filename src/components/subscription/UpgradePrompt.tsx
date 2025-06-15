
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Crown, Baby, History, Users, BarChart3, Volume2, Camera, X, FileText } from "lucide-react";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'profiles' | 'history' | 'sharing' | 'reports' | 'sounds' | 'memories' | 'pediatrician';
}

export const UpgradePrompt = ({ isOpen, onClose, feature }: UpgradePromptProps) => {
  const navigate = useNavigate();

  const featureConfig = {
    profiles: {
      icon: Baby,
      title: "Unlimited Baby Profiles",
      description: "Track multiple babies with unlimited profiles and switch between them seamlessly.",
      benefits: [
        "Create unlimited baby profiles",
        "Switch between profiles instantly", 
        "Perfect for families with multiple children",
        "Individual tracking for each baby"
      ]
    },
    history: {
      icon: History,
      title: "Extended Activity History",
      description: "Access complete historical data and track long-term patterns and trends.",
      benefits: [
        "View complete activity history",
        "Track long-term patterns",
        "Export historical data",
        "Never lose important milestones"
      ]
    },
    sharing: {
      icon: Users,
      title: "Family Sharing & Collaboration",
      description: "Share baby tracking with family members and caregivers for coordinated care.",
      benefits: [
        "Invite family members and caregivers",
        "Real-time collaboration",
        "Synchronized data across devices",
        "Role-based permissions"
      ]
    },
    reports: {
      icon: BarChart3,
      title: "Advanced Analytics & Reports",
      description: "Get detailed insights with comprehensive reports and trend analysis.",
      benefits: [
        "Detailed analytics and trends",
        "Pediatrician-ready reports",
        "Pattern recognition",
        "Growth tracking insights"
      ]
    },
    sounds: {
      icon: Volume2,
      title: "Premium Sound Library",
      description: "Access an extensive collection of soothing sounds and white noise.",
      benefits: [
        "Premium sound collection",
        "High-quality audio",
        "Sleep timer functionality",
        "Custom sound mixing"
      ]
    },
    memories: {
      icon: Camera,
      title: "Photo & Video Memories",
      description: "Capture and organize unlimited photos and videos of your baby's precious moments.",
      benefits: [
        "Unlimited photo and video storage",
        "Organize memories by date",
        "Add titles and descriptions",
        "Share memories with family"
      ]
    },
    pediatrician: {
      icon: FileText,
      title: "Pediatrician Reports",
      description: "Generate professional reports to share with your healthcare provider.",
      benefits: [
        "Generate comprehensive health reports",
        "Easy to download and securely share",
        "Professional formatting for doctors",
        "Track growth and development milestones"
      ]
    }
  };

  const config = featureConfig[feature];
  const IconComponent = config.icon;

  const handleUpgrade = () => {
    navigate('/subscription');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <IconComponent className="h-8 w-8 text-orange-600" />
            </div>
            <Badge className="bg-orange-500 text-white mb-2 mx-auto">
              <Crown className="h-3 w-3 mr-1" />
              Premium Feature
            </Badge>
            <CardTitle className="text-xl">{config.title}</CardTitle>
            <p className="text-gray-600 text-sm">{config.description}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">What you'll get:</h4>
              <ul className="space-y-2">
                {config.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">$9.99/month</div>
              <div className="text-sm text-gray-600">7-day free trial • Cancel anytime</div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button 
                onClick={handleUpgrade}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Start Free Trial
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

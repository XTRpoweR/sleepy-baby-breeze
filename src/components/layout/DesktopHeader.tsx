
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  User,
  LogOut,
  Crown,
  Settings,
  Baby,
  Bell,
  HelpCircle
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useNavigate } from 'react-router-dom';

export const DesktopHeader = () => {
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleManageSubscription = () => {
    navigate('/account');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleHelp = () => {
    navigate('/help');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/9b4eb9aa-e73c-46e3-9c09-a17f8136d14c.png" 
              alt="SleepyBaby Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-900">{t('app.name')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {/* Help & Support Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleHelp}
              className="flex items-center space-x-1"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Button>
            
            {/* Notifications Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotifications}
              className="flex items-center space-x-1 relative"
            >
              <Bell className="h-4 w-4" />
              <span>{t('notifications.title')}</span>
            </Button>
            
            {/* Subscription Status */}
            <div className="flex items-center space-x-2">
              {isPremium ? (
                <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  <Crown className="h-4 w-4" />
                  <span>Premium</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  <Baby className="h-4 w-4" />
                  <span>Basic</span>
                </div>
              )}
              <Button 
                variant="outline"
                size="sm" 
                onClick={handleManageSubscription}
                className="flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span>Account</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('navigation.signOut')}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

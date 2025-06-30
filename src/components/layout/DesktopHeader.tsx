
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  User,
  LogOut,
  Crown,
  Settings,
  Baby,
  Bell
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

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-coral-100 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Moon className="h-8 w-8 text-coral-500" />
            <span className="text-xl font-bold text-gray-900">{t('app.name')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {/* Notifications Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotifications}
              className="flex items-center space-x-1 relative border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Bell className="h-4 w-4" />
              <span>{t('notifications.title')}</span>
            </Button>
            
            {/* Subscription Status */}
            <div className="flex items-center space-x-2">
              {isPremium ? (
                <div className="flex items-center space-x-2 bg-soft-orange-100 text-soft-orange-800 px-3 py-1 rounded-full text-sm">
                  <Crown className="h-4 w-4" />
                  <span>Premium</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-lavender-100 text-lavender-700 px-3 py-1 rounded-full text-sm">
                  <Baby className="h-4 w-4" />
                  <span>Basic</span>
                </div>
              )}
              <Button 
                variant="outline"
                size="sm" 
                onClick={handleManageSubscription}
                className="flex items-center space-x-1 border-teal-200 text-teal-700 hover:bg-teal-50"
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
              className="flex items-center space-x-1 border-coral-200 text-coral-700 hover:bg-coral-50"
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

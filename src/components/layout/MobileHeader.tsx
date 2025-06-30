
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Moon, 
  User,
  LogOut,
  Crown,
  Settings,
  Menu,
  Bell
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const MobileHeader = () => {
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleManageSubscription = () => {
    navigate('/account');
    setIsOpen(false);
  };

  const handleNotifications = () => {
    navigate('/notifications');
    setIsOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-coral-100 lg:hidden">
      <div className="flex justify-between items-center h-14 px-4">
        <div className="flex items-center space-x-2">
          <Moon className="h-6 w-6 text-coral-500" />
          <span className="text-lg font-bold text-gray-900">Baby Tracker</span>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col space-y-6 pt-6">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-4 border-b">
                <div className="bg-coral-100 rounded-full p-2">
                  <User className="h-5 w-5 text-coral-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {user?.user_metadata?.full_name || user?.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <span className="text-sm font-medium">{t('notifications.title')}</span>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={handleNotifications}
                  className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  <span>{t('notifications.title')}</span>
                </Button>
              </div>

              {/* Subscription Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Subscription</span>
                  {isPremium ? (
                    <div className="flex items-center space-x-1 bg-soft-orange-100 text-soft-orange-800 px-2 py-1 rounded-full text-xs">
                      <Crown className="h-3 w-3" />
                      <span>Premium</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 bg-lavender-100 text-lavender-700 px-2 py-1 rounded-full text-xs">
                      <span>Basic</span>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={handleManageSubscription}
                  className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Account Settings</span>
                </Button>
              </div>

              {/* Language Selector */}
              <div className="space-y-3">
                <span className="text-sm font-medium">Language</span>
                <LanguageSelector />
              </div>

              {/* Sign Out */}
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 border-coral-200 text-coral-700 hover:bg-coral-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

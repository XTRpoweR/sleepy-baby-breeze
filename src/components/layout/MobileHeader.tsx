import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  User,
  LogOut,
  Crown,
  Settings,
  Menu,
  Bell,
  HelpCircle,
  MessageCircle
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

  const handleHelp = () => {
    navigate('/help');
    setIsOpen(false);
  };

  const handleContact = () => {
    navigate('/contact');
    setIsOpen(false);
  };

  const handleTutorial = () => {
    navigate('/tutorial');
    setIsOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 lg:hidden">
      <div className="flex flex-col">
        {/* Logo Row */}
        <div className="flex justify-center items-center h-16 px-4">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
              alt="SleepyBabyy Logo" 
              className="h-10 w-auto"
            />
            <span className="text-lg font-bold text-gray-900">SleepyBabyy</span>
          </div>
        </div>
        
        {/* Menu Button Row */}
        <div className="flex justify-start px-4 pb-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col space-y-6 pt-6">
                {/* User Info */}
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <div className="bg-blue-100 rounded-full p-2">
                    <User className="h-5 w-5 text-blue-600" />
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

                {/* Help & Support */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Help & Support</span>
                  <div className="space-y-2">
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={handleHelp}
                      className="w-full justify-start"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      <span>Help Center</span>
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={handleContact}
                      className="w-full justify-start"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      <span>Contact Support</span>
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={handleTutorial}
                      className="w-full justify-start"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Tutorial</span>
                    </Button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">{t('notifications.title')}</span>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={handleNotifications}
                    className="w-full"
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
                      <div className="flex items-center space-x-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        <Crown className="h-3 w-3" />
                        <span>Premium</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        <span>Basic</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={handleManageSubscription}
                    className="w-full"
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
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

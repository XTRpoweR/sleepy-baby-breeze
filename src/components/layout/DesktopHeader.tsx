
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
  Baby
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';

export const DesktopHeader = () => {
  const { user, signOut } = useAuth();
  const { isPremium, openCustomerPortal } = useSubscription();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleManageSubscription = () => {
    if (isPremium) {
      openCustomerPortal();
    } else {
      window.location.href = '/subscription';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Moon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">{t('app.name')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
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
                variant={isPremium ? "outline" : "default"} 
                size="sm" 
                onClick={handleManageSubscription}
                className={`flex items-center space-x-1 ${!isPremium ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
              >
                {isPremium ? (
                  <>
                    <Settings className="h-4 w-4" />
                    <span>Manage</span>
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    <span>Upgrade</span>
                  </>
                )}
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

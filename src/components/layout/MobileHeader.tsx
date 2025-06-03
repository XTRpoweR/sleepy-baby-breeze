
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
  Globe
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';

export const MobileHeader = () => {
  const { user, signOut } = useAuth();
  const { isPremium, openCustomerPortal } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleManageSubscription = () => {
    if (isPremium) {
      openCustomerPortal();
    } else {
      // Navigate to subscription page
      window.location.href = '/subscription';
    }
    setIsOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 lg:hidden">
      <div className="flex justify-between items-center h-14 px-4">
        <div className="flex items-center space-x-2">
          <Moon className="h-6 w-6 text-blue-600" />
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
                  variant={isPremium ? "outline" : "default"} 
                  size="sm" 
                  onClick={handleManageSubscription}
                  className={`w-full ${!isPremium ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                >
                  {isPremium ? (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Manage Subscription</span>
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      <span>Upgrade to Premium</span>
                    </>
                  )}
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
    </header>
  );
};

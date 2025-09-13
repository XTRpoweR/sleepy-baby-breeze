import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { 
  User,
  LogOut,
  Crown,
  Settings,
  Menu,
  Bell,
  HelpCircle,
  MessageCircle,
  Shield,
  Sparkles,
  Globe,
  GraduationCap
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const UnifiedHeader = () => {
  const { user, signOut } = useAuth();
  const { isPremium, loading } = useSubscription();
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

  const handleSecurity = () => {
    navigate('/security');
    setIsOpen(false);
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="flex justify-between tablet:justify-start items-center h-14 tablet:h-16 px-4 tablet:px-6 lg:px-8 max-w-7xl mx-auto tablet:gap-6">
        {/* Hamburger Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-gradient-to-br from-slate-50 to-slate-100/50 p-0">
            <div className="flex flex-col space-y-4 pt-6 pb-32 px-6 max-h-screen overflow-y-auto scroll-smooth" style={{WebkitOverflowScrolling: 'touch'}}>
              {/* User Profile Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-3 shadow-sm">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">
                      {user?.user_metadata?.full_name || user?.email}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </div>
                  </div>
                  {loading ? (
                    <Skeleton className="h-6 w-16 rounded-full" />
                  ) : isPremium ? (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                      <Crown className="h-3 w-3" />
                      <span>Premium</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium">
                      <span>Basic</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account & Security Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                    <span className="text-sm font-semibold text-foreground">Account & Security</span>
                  </div>
                  
                  <button 
                    onClick={handleManageSubscription}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 group touch-manipulation"
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 shadow-sm group-hover:shadow-md transition-shadow">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">Account Settings</div>
                      <div className="text-xs text-muted-foreground">Manage subscription & preferences</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleSecurity}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 group touch-manipulation"
                  >
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-2 shadow-sm group-hover:shadow-md transition-shadow">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">Security</div>
                      <div className="text-xs text-muted-foreground">Sessions & security events</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleNotifications}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 group touch-manipulation"
                  >
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 shadow-sm group-hover:shadow-md transition-shadow">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">{t('notifications.title')}</div>
                      <div className="text-xs text-muted-foreground">Alerts & updates</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Help & Support Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                    <span className="text-sm font-semibold text-foreground">Help & Support</span>
                  </div>
                  
                  <button 
                    onClick={handleHelp}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 group touch-manipulation"
                  >
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-2 shadow-sm group-hover:shadow-md transition-shadow">
                      <HelpCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">Help Center</div>
                      <div className="text-xs text-muted-foreground">FAQ & documentation</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleContact}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 group touch-manipulation"
                  >
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-2 shadow-sm group-hover:shadow-md transition-shadow">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">Contact Support</div>
                      <div className="text-xs text-muted-foreground">Get help from our team</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleTutorial}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 group touch-manipulation"
                  >
                    <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg p-2 shadow-sm group-hover:shadow-md transition-shadow">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">Tutorial</div>
                      <div className="text-xs text-muted-foreground">Learn how to use the app</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full"></div>
                    <span className="text-sm font-semibold text-foreground">Preferences</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50/50">
                    <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg p-2 shadow-sm">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground mb-1">Language</div>
                      <div className="w-full">
                        <LanguageSelector />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 font-medium touch-manipulation"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Logo */}
        <div className="flex items-center space-x-2 tablet:flex-1">
          <img 
            src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
            alt="SleepyBabyy Logo" 
            className="h-8 w-auto tablet:h-10"
          />
          <span className="text-base tablet:text-lg font-bold text-foreground">SleepyBabyy</span>
        </div>

        {/* Tablet Profile Hub - Hidden on mobile */}
        <div className="hidden tablet:block tablet:flex-1 max-w-sm">
          {user && (
            <div className="w-full">
              {/* Placeholder for TabletProfileHub - will be added in dashboard */}
            </div>
          )}
        </div>
        
        {/* Tutorial Button */}
        <Button
          onClick={handleTutorial}
          variant="secondary"
          size="sm"
          className="rounded-full w-8 h-8 tablet:w-10 tablet:h-10 p-0 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <GraduationCap className="h-4 w-4 tablet:h-5 tablet:w-5" />
        </Button>
      </div>
    </header>
  );
};
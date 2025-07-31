
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { UserProfileDropdown } from '@/components/layout/UserProfileDropdown';
import { useNavigate } from 'react-router-dom';

export const DesktopHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleHelp = () => {
    navigate('/help');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and global actions */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
                alt="SleepyBabyy Logo" 
                className="h-12 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">{t('app.name')}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleHelp}
                className="flex items-center space-x-1"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </Button>
            </div>
          </div>
          
          {/* Right side - User profile dropdown */}
          <div className="flex items-center">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

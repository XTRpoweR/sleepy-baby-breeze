
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { HelpCircle, GraduationCap } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { UserProfileDropdown } from '@/components/layout/UserProfileDropdown';
import { useNavigate } from 'react-router-dom';

export const DesktopHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleHelp = () => {
    navigate('/help');
  };

  const handleTutorial = () => {
    navigate('/tutorial');
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
          
          {/* Right side - Tutorial button, Hexagonal button and User profile dropdown */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleTutorial}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
              size="icon"
            >
              <GraduationCap className="h-5 w-5" />
            </Button>
            
            <Button
              className="bg-gray-800 hover:bg-gray-900 text-white w-10 h-10 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'
              }}
              size="icon"
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </Button>
            
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

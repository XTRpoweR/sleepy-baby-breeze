
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', comingSoon: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', comingSoon: false },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪', comingSoon: false },
  { code: 'es', name: 'Español', flag: '🇪🇸', comingSoon: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', comingSoon: false },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', comingSoon: false },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷', comingSoon: false },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮', comingSoon: false },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Only show real language or fallback to English
  const currentLanguage =
    languages.find(l => l.code === i18n.language && !l.comingSoon) ||
    languages[0];

  const handleLanguageChange = async (language) => {
    if (language.comingSoon) {
      toast({
        title: `${language.name}`,
        description: "This language is coming soon!",
        variant: "default",
      });
      return;
    }
    await i18n.changeLanguage(language.code);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2 min-w-[120px]"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        className="w-56 bg-white shadow-lg border z-50 max-h-80 overflow-y-auto"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={20}
        sticky="always"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            disabled={language.comingSoon}
            className={`flex items-center justify-between space-x-2 cursor-pointer ${
              i18n.language === language.code && !language.comingSoon
                ? 'bg-blue-50 font-medium'
                : ''
            }`}
          >
            <span className="flex items-center space-x-2">
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </span>
            {language.comingSoon && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                Coming soon
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

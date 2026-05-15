import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

type Language = {
  code: string;
  name: string;        // native name
  englishName: string; // english subtitle
};

const languages: Language[] = [
  { code: 'en', name: 'English',    englishName: 'English' },
  { code: 'de', name: 'Deutsch',    englishName: 'German' },
  { code: 'sv', name: 'Svenska',    englishName: 'Swedish' },
  { code: 'es', name: 'Español',    englishName: 'Spanish' },
  { code: 'fr', name: 'Français',   englishName: 'French' },
  { code: 'it', name: 'Italiano',   englishName: 'Italian' },
  { code: 'el', name: 'Ελληνικά',   englishName: 'Greek' },
  { code: 'fi', name: 'Suomi',      englishName: 'Finnish' },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const current = languages.find((l) => l.code === i18n.language) ?? languages[0];

  const handleSelect = async (lang: Language) => {
    if (lang.code !== i18n.language) {
      await i18n.changeLanguage(lang.code);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Change language. Current: ${current.englishName}`}
          className="group inline-flex items-center gap-2 h-9 px-3 rounded-full border border-gray-200/80 bg-white/70 hover:bg-white hover:border-purple-300 transition-all duration-200 font-medium text-gray-700 hover:text-purple-700"
        >
          <Globe className="h-4 w-4 text-gray-500 group-hover:text-purple-600 transition-colors" />
          {/* Mobile: 2-letter code · Desktop: native name */}
          <span className="text-sm font-semibold uppercase tracking-wider sm:hidden">
            {current.code}
          </span>
          <span className="hidden sm:inline text-sm">{current.name}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        avoidCollisions
        collisionPadding={16}
        className="w-64 p-1.5 rounded-2xl border border-gray-200/80 shadow-xl shadow-purple-500/10 bg-white/95 backdrop-blur-md overflow-hidden"
      >
        {/* Soft gradient accent at top of panel */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

        <div className="px-3 pt-2 pb-1.5 mt-0.5">
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-gray-400">
            Choose your language
          </p>
        </div>

        <div className="space-y-0.5">
          {languages.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className={`group/item flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors focus:outline-none ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50'
                    : 'hover:bg-purple-50/70 focus:bg-purple-50/70'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm font-semibold leading-tight ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'
                        : 'text-gray-900'
                    }`}
                  >
                    {lang.name}
                  </span>
                  <span className="text-xs text-gray-500 leading-tight mt-0.5">
                    {lang.englishName}
                  </span>
                </div>
                {isActive ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 shadow-md shadow-purple-500/30 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400 group-hover/item:text-purple-500 transition-colors flex-shrink-0">
                    {lang.code}
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

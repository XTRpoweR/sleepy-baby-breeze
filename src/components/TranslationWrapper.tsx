
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TranslationWrapperProps {
  children: React.ReactNode;
}

export const TranslationWrapper = ({ children }: TranslationWrapperProps) => {
  const { i18n } = useTranslation();
  const [key, setKey] = useState(0);

  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('TranslationWrapper: Forcing re-render due to language change');
      setKey(prev => prev + 1);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  // Force re-render when language changes by using key prop
  return <div key={`${i18n.language}-${key}`}>{children}</div>;
};

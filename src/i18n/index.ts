
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import deCommon from '../locales/de/common.json';
import svCommon from '../locales/sv/common.json';
import esCommon from '../locales/es/common.json';
import frCommon from '../locales/fr/common.json';
import itCommon from '../locales/it/common.json';
import elCommon from '../locales/el/common.json';
import fiCommon from '../locales/fi/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  de: {
    common: deCommon,
  },
  sv: {
    common: svCommon,
  },
  es: {
    common: esCommon,
  },
  fr: {
    common: frCommon,
  },
  it: {
    common: itCommon,
  },
  el: {
    common: elCommon,
  },
  fi: {
    common: fiCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    defaultNS: 'common',
    ns: ['common'],
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // Add more robust fallback and retry options
    react: {
      useSuspense: false,
    },
    
    // Ensure translations are loaded synchronously
    initImmediate: false,
  });

// Add event listener for language changes
i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
  // Force a page refresh of translation-dependent components
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: lng }));
});

export default i18n;


import { format, parseISO } from 'date-fns';
import { 
  enUS, 
  de, 
  sv, 
  es, 
  fr, 
  it, 
  el, 
  fi 
} from 'date-fns/locale';

const localeMap = {
  en: enUS,
  de: de,
  sv: sv,
  es: es,
  fr: fr,
  it: it,
  el: el,
  fi: fi
};

export const formatLocalizedDate = (date: string | Date, formatString: string, locale: string = 'en'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const dateLocale = localeMap[locale as keyof typeof localeMap] || enUS;
  
  return format(dateObj, formatString, { locale: dateLocale });
};

export const getLocalizedDateRangeLabel = (dateRange: string, locale: string = 'en'): string => {
  const translations = {
    en: {
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      custom: 'Custom Range'
    },
    de: {
      today: 'Heute',
      yesterday: 'Gestern',
      thisWeek: 'Diese Woche',
      lastWeek: 'Letzte Woche',
      thisMonth: 'Diesen Monat',
      lastMonth: 'Letzten Monat',
      last7Days: 'Letzten 7 Tage',
      last30Days: 'Letzten 30 Tage',
      custom: 'Benutzerdefinierter Bereich'
    },
    sv: {
      today: 'Idag',
      yesterday: 'Igår',
      thisWeek: 'Denna vecka',
      lastWeek: 'Förra veckan',
      thisMonth: 'Denna månad',
      lastMonth: 'Förra månaden',
      last7Days: 'Senaste 7 dagarna',
      last30Days: 'Senaste 30 dagarna',
      custom: 'Anpassat intervall'
    },
    es: {
      today: 'Hoy',
      yesterday: 'Ayer',
      thisWeek: 'Esta semana',
      lastWeek: 'Semana pasada',
      thisMonth: 'Este mes',
      lastMonth: 'Mes pasado',
      last7Days: 'Últimos 7 días',
      last30Days: 'Últimos 30 días',
      custom: 'Rango personalizado'
    },
    fr: {
      today: "Aujourd'hui",
      yesterday: 'Hier',
      thisWeek: 'Cette semaine',
      lastWeek: 'Semaine dernière',
      thisMonth: 'Ce mois',
      lastMonth: 'Mois dernier',
      last7Days: '7 derniers jours',
      last30Days: '30 derniers jours',
      custom: 'Plage personnalisée'
    },
    it: {
      today: 'Oggi',
      yesterday: 'Ieri',
      thisWeek: 'Questa settimana',
      lastWeek: 'Settimana scorsa',
      thisMonth: 'Questo mese',
      lastMonth: 'Mese scorso',
      last7Days: 'Ultimi 7 giorni',
      last30Days: 'Ultimi 30 giorni',
      custom: 'Intervallo personalizzato'
    },
    el: {
      today: 'Σήμερα',
      yesterday: 'Χθες',
      thisWeek: 'Αυτή την εβδομάδα',
      lastWeek: 'Την προηγούμενη εβδομάδα',
      thisMonth: 'Αυτόν τον μήνα',
      lastMonth: 'Τον προηγούμενο μήνα',
      last7Days: 'Τελευταίες 7 ημέρες',
      last30Days: 'Τελευταίες 30 ημέρες',
      custom: 'Προσαρμοσμένο εύρος'
    },
    fi: {
      today: 'Tänään',
      yesterday: 'Eilen',
      thisWeek: 'Tällä viikolla',
      lastWeek: 'Viime viikolla',
      thisMonth: 'Tässä kuussa',
      lastMonth: 'Viime kuussa',
      last7Days: 'Viimeiset 7 päivää',
      last30Days: 'Viimeiset 30 päivää',
      custom: 'Mukautettu aikaväli'
    }
  };

  const localeTranslations = translations[locale as keyof typeof translations] || translations.en;
  return localeTranslations[dateRange as keyof typeof localeTranslations] || dateRange;
};

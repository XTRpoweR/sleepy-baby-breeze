export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD
  locale: string;
  position: 'before' | 'after'; // Symbol position
}

export const currencies: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    rate: 1.0,
    locale: 'en-US',
    position: 'before'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    rate: 0.92,
    locale: 'de-DE',
    position: 'before'
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    rate: 10.50,
    locale: 'sv-SE',
    position: 'after'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    rate: 0.79,
    locale: 'en-GB',
    position: 'before'
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    rate: 10.80,
    locale: 'no-NO',
    position: 'after'
  }
};

export const countryToCurrency: Record<string, string> = {
  US: 'USD',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  SE: 'SEK',
  GB: 'GBP',
  NO: 'NOK',
  DK: 'DKK',
};

export const formatPrice = (
  usdPrice: number,
  currencyInfo: CurrencyInfo,
  includeDecimals: boolean = true
): string => {
  const convertedPrice = usdPrice * currencyInfo.rate;
  const rounded = includeDecimals 
    ? convertedPrice.toFixed(2)
    : Math.round(convertedPrice).toString();

  if (currencyInfo.position === 'before') {
    return `${currencyInfo.symbol}${rounded}`;
  } else {
    return `${rounded} ${currencyInfo.symbol}`;
  }
};

export const getAnnualSavings = (
  monthlyPrice: number,
  annualPrice: number,
  currencyInfo: CurrencyInfo
): string => {
  const savings = (monthlyPrice * 12 - annualPrice) * currencyInfo.rate;
  return formatPrice(savings / currencyInfo.rate, currencyInfo, false);
};

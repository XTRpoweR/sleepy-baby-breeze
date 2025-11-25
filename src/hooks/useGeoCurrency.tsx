import { useState, useEffect } from 'react';
import { currencies, countryToCurrency, formatPrice, type CurrencyInfo } from '@/utils/currencyConfig';

interface GeolocationResponse {
  country_code?: string;
  country?: string;
}

export const useGeoCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyInfo>(currencies.USD);
  const [countryCode, setCountryCode] = useState<string>('US');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Check if we have cached data
        const cachedCountry = localStorage.getItem('user-country');
        const cachedTimestamp = localStorage.getItem('user-country-timestamp');
        const now = Date.now();
        
        // Cache for 24 hours
        if (cachedCountry && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 86400000) {
          const currencyCode = countryToCurrency[cachedCountry] || 'USD';
          setCurrency(currencies[currencyCode]);
          setCountryCode(cachedCountry);
          setLoading(false);
          return;
        }

        // Fetch geolocation data
        const response = await fetch('https://ipapi.co/json/', {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Geolocation API failed');
        }

        const data: GeolocationResponse = await response.json();
        const detectedCountry = data.country_code || 'US';
        
        // Cache the result
        localStorage.setItem('user-country', detectedCountry);
        localStorage.setItem('user-country-timestamp', now.toString());

        const currencyCode = countryToCurrency[detectedCountry] || 'USD';
        setCurrency(currencies[currencyCode]);
        setCountryCode(detectedCountry);
      } catch (error) {
        console.error('Failed to detect currency:', error);
        // Fallback to USD
        setCurrency(currencies.USD);
        setCountryCode('US');
      } finally {
        setLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const convertPrice = (usdPrice: number, includeDecimals: boolean = true) => {
    return formatPrice(usdPrice, currency, includeDecimals);
  };

  return {
    currency,
    countryCode,
    loading,
    convertPrice,
    isUSD: currency.code === 'USD'
  };
};

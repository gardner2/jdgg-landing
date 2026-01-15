export type Currency = 'GBP' | 'USD' | 'EUR';

export interface PricingPlan {
  name: string;
  basePriceGBP: number;
  features: string[];
  highlighted?: boolean;
}

export interface PricingConfig {
  baseCurrency: Currency;
  currenciesSupported: Currency[];
  fxEndpoint: string;
  marketAdjustments: Record<Currency, number>;
  rounding: {
    strategy: 'psychological';
    rules: Record<Currency, number>;
  };
  detection: {
    prefer: 'browser-locale';
    fallback: 'manual-toggle';
    mappingExamples: Record<string, Currency>;
  };
  fallbackRates: Record<Currency, number>;
}

export const PRICING_CONFIG: PricingConfig = {
  baseCurrency: 'GBP',
  currenciesSupported: ['GBP', 'USD', 'EUR'],
  fxEndpoint: 'https://api.exchangerate.host/latest?base=GBP&symbols=USD,EUR',
  marketAdjustments: { GBP: 1.0, USD: 1.1, EUR: 1.05 },
  rounding: {
    strategy: 'psychological',
    rules: { GBP: 9, USD: 9, EUR: 9 }
  },
  detection: {
    prefer: 'browser-locale',
    fallback: 'manual-toggle',
    mappingExamples: {
      'en-GB': 'GBP',
      'en-US': 'USD',
      'en-IE': 'EUR',
      'de-DE': 'EUR',
      'fr-FR': 'EUR'
    }
  },
  fallbackRates: { GBP: 1.0, USD: 1.30, EUR: 1.17 }
};

export const PLANS: PricingPlan[] = [
  {
    name: 'Single Website',
    basePriceGBP: 2500,
    features: [
      'Strategy & wireframe',
      'Design + development',
      '1 round of revisions',
      'Basic analytics & contact form'
    ],
    highlighted: true
  },
  {
    name: 'Single Website + CMS',
    basePriceGBP: 3200,
    features: [
      'Everything in Single Website',
      'CMS for editable content',
      'Blog or updates page'
    ]
  }
];

export function detectCurrencyFromLocale(): Currency {
  if (typeof window === 'undefined') return 'GBP';
  
  const locale = navigator.language;
  const mapping = PRICING_CONFIG.detection.mappingExamples;
  
  // Direct mapping
  if (mapping[locale]) {
    return mapping[locale];
  }
  
  // Language-based fallback
  const language = locale.split('-')[0];
  if (language === 'en') {
    return locale.includes('US') ? 'USD' : 'GBP';
  }
  if (['de', 'fr', 'es', 'it', 'nl'].includes(language)) {
    return 'EUR';
  }
  
  return 'GBP';
}

export async function fetchExchangeRates(): Promise<Record<Currency, number> | null> {
  try {
    const response = await fetch(PRICING_CONFIG.fxEndpoint);
    if (!response.ok) throw new Error('Failed to fetch rates');
    
    const data = await response.json();
    return {
      GBP: 1.0,
      USD: data.rates.USD,
      EUR: data.rates.EUR
    };
  } catch (error) {
    console.warn('Failed to fetch exchange rates:', error);
    return null;
  }
}

export function getCachedRates(): Record<Currency, number> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = sessionStorage.getItem('fx-rates');
    if (!cached) return null;
    
    const { rates, timestamp } = JSON.parse(cached);
    const now = Date.now();
    const cacheAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - timestamp > cacheAge) {
      sessionStorage.removeItem('fx-rates');
      return null;
    }
    
    return rates;
  } catch {
    return null;
  }
}

export function cacheRates(rates: Record<Currency, number>): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem('fx-rates', JSON.stringify({
      rates,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore storage errors
  }
}

export function calculatePrice(
  basePriceGBP: number,
  currency: Currency,
  rates: Record<Currency, number> | null
): { price: number; isApproximate: boolean } {
  let rate = 1.0;
  let isApproximate = false;
  
  if (currency === 'GBP') {
    rate = 1.0;
  } else if (rates) {
    rate = rates[currency] || PRICING_CONFIG.fallbackRates[currency];
  } else {
    rate = PRICING_CONFIG.fallbackRates[currency];
    isApproximate = true;
  }
  
  // Apply market adjustment
  const adjustedRate = rate * PRICING_CONFIG.marketAdjustments[currency];
  let price = basePriceGBP * adjustedRate;
  
  // Apply psychological pricing
  const roundingDigit = PRICING_CONFIG.rounding.rules[currency];
  price = Math.floor(price / 100) * 100 + roundingDigit;
  
  return { price, isApproximate };
}

export function formatPrice(price: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export async function getPricingForCurrency(currency: Currency): Promise<{
  plans: Array<PricingPlan & { price: number; formattedPrice: string; isApproximate: boolean }>;
  isApproximate: boolean;
}> {
  let rates = getCachedRates();
  let isApproximate = false;
  
  if (!rates) {
    rates = await fetchExchangeRates();
    if (rates) {
      cacheRates(rates);
    } else {
      isApproximate = true;
    }
  }
  
  const plans = PLANS.map(plan => {
    const { price, isApproximate: planApproximate } = calculatePrice(
      plan.basePriceGBP,
      currency,
      rates
    );
    
    return {
      ...plan,
      price,
      formattedPrice: formatPrice(price, currency),
      isApproximate: planApproximate
    };
  });
  
  return { plans, isApproximate };
}

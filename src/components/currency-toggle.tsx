'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Currency } from '@/lib/pricing';

interface CurrencyToggleProps {
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencyToggle({ 
  currentCurrency, 
  onCurrencyChange, 
  className 
}: CurrencyToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currencies: { code: Currency; symbol: string; label: string }[] = [
    { code: 'GBP', symbol: '£', label: 'GBP' },
    { code: 'USD', symbol: '$', label: 'USD' },
    { code: 'EUR', symbol: '€', label: 'EUR' },
  ];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-sm text-muted-foreground mr-2">Currency:</span>
      <div className="flex border rounded-lg p-1 bg-background">
        {currencies.map((currency) => (
          <Button
            key={currency.code}
            variant={currentCurrency === currency.code ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onCurrencyChange(currency.code)}
            className="h-8 px-3 text-xs"
            aria-label={`Switch to ${currency.label}`}
          >
            {currency.symbol} {currency.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';
import { CurrencyToggle } from '@/components/currency-toggle';
import { trackEvent } from '@/lib/analytics';
import { 
  Currency, 
  getPricingForCurrency, 
  detectCurrencyFromLocale,
  type PricingPlan 
} from '@/lib/pricing';

interface PricingProps {
  calendlyUrl?: string;
}

interface PlanWithPricing extends PricingPlan {
  price: number;
  formattedPrice: string;
  isApproximate: boolean;
}

export function Pricing({ calendlyUrl = 'https://calendly.com/jgdd/30min' }: PricingProps) {
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [plans, setPlans] = useState<PlanWithPricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproximate, setIsApproximate] = useState(false);

  useEffect(() => {
    // Detect initial currency
    const detectedCurrency = detectCurrencyFromLocale();
    setCurrency(detectedCurrency);
  }, []);

  useEffect(() => {
    const loadPricing = async () => {
      setIsLoading(true);
      try {
        const { plans: pricingPlans, isApproximate: approximate } = await getPricingForCurrency(currency);
        setPlans(pricingPlans);
        setIsApproximate(approximate);
      } catch (error) {
        console.error('Failed to load pricing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPricing();
  }, [currency]);

  if (isLoading) {
    return (
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Starting prices for one-time projects with no hidden fees.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              All projects are custom-quoted based on your specific requirements.
            </p>
            
            {/* Currency Toggle */}
            <div className="flex justify-center mb-4">
              <CurrencyToggle 
                currentCurrency={currency}
                onCurrencyChange={setCurrency}
              />
            </div>
            
            {isApproximate && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>Prices shown are approximate due to exchange rate fluctuations</span>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.highlighted ? 'border-primary shadow-lg lg:scale-105' : 'border-border'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-sm text-muted-foreground block mb-1">Starting from</span>
                    <span className="text-4xl font-bold">{plan.formattedPrice}</span>
                    {plan.isApproximate && (
                      <span className="text-muted-foreground ml-1">≈</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    asChild
                    className={`w-full ${plan.highlighted ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    <a
                      href={calendlyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('cta_book_strategy_call', { location: `pricing_${plan.name.toLowerCase().replace(/\s+/g, '_')}` })}
                    >
                      Book a Strategy Call
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              All projects include strategy, design, development, and deployment. 
              Additional revisions available at hourly rates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
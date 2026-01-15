'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface CalendlyBlockProps {
  calendlyUrl?: string;
}

export function CalendlyBlock({ calendlyUrl }: CalendlyBlockProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  if (!calendlyUrl) {
    return (
      <section id="book" className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Book a quick intro
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Grab a slot to see if we&apos;re a fit.
            </p>
            <p className="text-sm text-muted-foreground">
              Please set CALENDLY_URL in your environment variables to enable booking.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Book a quick intro
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Grab a slot to see if we&apos;re a fit.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {isLoaded ? (
              <div 
                className="calendly-inline-widget" 
                data-url={calendlyUrl}
                style={{ minWidth: '320px', height: '700px' }}
              />
            ) : (
              <div className="flex items-center justify-center h-[700px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading calendar...</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <Button variant="outline" asChild>
              <a 
                href={calendlyUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Open in new tab
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

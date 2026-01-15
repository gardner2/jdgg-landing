'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onBookCall: () => void;
}

export function Hero({ onBookCall }: HeroProps) {
  const badges = ['Performance-first', 'Standards-based', 'No fluff'];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {badges.map((badge) => (
              <Badge 
                key={badge} 
                variant="secondary" 
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {badge}
              </Badge>
            ))}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Design. Develop. Deploy —{' '}
            <span className="text-primary">Faster.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A single, production-grade website built with clear scope and quick turnarounds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onBookCall}
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
            >
              Book a Call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              asChild
              className="px-8 py-3 text-lg"
            >
              <a href="#work">See Work</a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 text-sm text-muted-foreground">
            <p>Trusted by founders and teams who value quality over quantity</p>
          </div>
        </div>
      </div>
    </section>
  );
}
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail } from 'lucide-react';

interface ContactBannerProps {
  onBookCall: () => void;
}

export function ContactBanner({ onBookCall }: ContactBannerProps) {
  return (
    <section id="contact" className="py-20 sm:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to launch faster?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tell us what you&apos;re building — we&apos;ll take it from here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onBookCall}
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg"
            >
              Book a Call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              asChild
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg"
            >
              <a href="mailto:hello@quietforge.studio" className="inline-flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

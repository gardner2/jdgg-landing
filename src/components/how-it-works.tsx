import { FileText, Wrench, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: FileText,
    title: 'Submit your brief',
    text: 'Tell us the page, goals, and any assets.'
  },
  {
    icon: Wrench,
    title: 'We build and iterate',
    text: 'Design + dev handled end-to-end with live previews.'
  },
  {
    icon: Rocket,
    title: 'Launch fast',
    text: 'Ship with confidence; performance and a11y included.'
  }
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How it Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Simple process, clear communication, fast delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}






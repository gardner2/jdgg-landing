import { LayoutDashboard, Gauge, ShieldCheck, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const valueProps = [
  {
    icon: LayoutDashboard,
    title: 'Design + build',
    text: 'We don\'t just mock up; we ship live code.'
  },
  {
    icon: Gauge,
    title: 'Speed with quality',
    text: '24–72h per request, reviewable previews.'
  },
  {
    icon: ShieldCheck,
    title: 'Standards-based',
    text: 'Accessible, responsive, SEO-friendly by default.'
  },
  {
    icon: Wand2,
    title: 'Tasteful motion',
    text: 'Micro-interactions without distraction.'
  }
];

export function ValueProps() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why JGDD
          </h2>
          <p className="text-xl text-muted-foreground">
            Built for teams who value quality, speed, and clarity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{prop.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{prop.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}






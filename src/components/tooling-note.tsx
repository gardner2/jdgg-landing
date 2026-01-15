import { Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ToolingNote() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-8 sm:p-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">
                  Faster through modern tooling
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We quietly use automation and contemporary tools (including AI) to speed up research, 
                  layout, and QA. Outcomes without the buzzwords.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}






import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const projects = [
  {
    title: 'SaaS Landing',
    tags: ['Next.js', 'Tailwind', 'Vercel'],
    image: '/placeholders/saas-1.png',
    link: '#',
    description: 'Conversion-focused hero, features, pricing.'
  },
  {
    title: 'Fintech Marketing',
    tags: ['Figma', 'Design System'],
    image: '/placeholders/fintech-1.png',
    link: '#',
    description: 'Trust-led layout with logos and testimonials.'
  },
  {
    title: 'Creator Portfolio',
    tags: ['Performance', 'SEO'],
    image: '/placeholders/creator-1.png',
    link: '#',
    description: 'Fast image grids, case study pages, blog cards.'
  }
];

export function WorkShowcase() {
  return (
    <section id="work" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Selected Work
          </h2>
          <p className="text-xl text-muted-foreground">
            Replace with your projects later.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <Card key={index} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
                  <Link href={project.link} className="text-primary hover:text-primary/80">
                    View project <ExternalLink className="ml-1 w-3 h-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="#contact">View more</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}






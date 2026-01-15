'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  tags: string;
  image_url?: string;
  live_url?: string;
  featured: boolean;
}

export function Portfolio() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    // Refresh projects every 30 seconds to catch updates
    const interval = setInterval(() => {
      fetchProjects();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`/api/portfolio?featured=true&t=${Date.now()}`);
      const data = await response.json();
      console.log('Portfolio projects fetched:', data.projects);
      // Log each project's image_url to debug
      data.projects?.forEach((project: PortfolioProject) => {
        console.log(`Project "${project.title}": image_url =`, project.image_url);
      });
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="portfolio" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-4 sm:mb-6">
            Recent Work
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Selected engagements with clear scope, structured delivery, and measurable outcomes.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading portfolio...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card className="border border-border rounded-3xl p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-foreground/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Portfolio Coming Soon</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We&apos;re currently working on exciting projects with our clients. 
                Check back soon to see examples of our work, or{' '}
                <a
                  href="https://calendly.com/jgdd/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('cta_book_strategy_call', { location: 'portfolio_empty_state' })}
                  className="text-foreground underline hover:text-foreground/80 transition-colors"
                >
                  book a strategy call
                </a>{' '}
                to see what we can build for you.
              </p>
            </Card>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.id}`}
                className="group block"
              >
                <Card 
                  className="overflow-hidden border border-border rounded-3xl hover:border-foreground/20 transition-all duration-500 animate-scale-in h-full flex flex-col"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {project.image_url && project.image_url.trim() ? (
                    <div className="aspect-video bg-muted overflow-hidden relative">
                      <img 
                        src={`${project.image_url}${project.image_url.includes('?') ? '&' : '?'}t=${Date.now()}&v=${project.id}`}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          console.error('Image failed to load for project:', project.title, 'URL:', project.image_url);
                          // Replace with placeholder
                          const img = e.currentTarget;
                          const container = img.parentElement;
                          if (container) {
                            img.style.display = 'none';
                            // Check if placeholder already exists
                            if (!container.querySelector('.image-placeholder')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'image-placeholder aspect-video bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center absolute inset-0';
                              placeholder.innerHTML = '<span class="text-4xl">📱</span>';
                              container.appendChild(placeholder);
                            }
                          }
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully for project:', project.title, 'from URL:', project.image_url);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
                      <span className="text-4xl">📱</span>
                      {process.env.NODE_ENV === 'development' && (
                        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                          No image_url
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.split(',').slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag.trim()} 
                          variant="secondary" 
                          className="text-xs bg-foreground/5 text-foreground border border-border"
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                      {project.tags.split(',').length > 3 && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-foreground/5 text-foreground border border-border"
                        >
                          +{project.tags.split(',').length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-semibold mb-3 group-hover:text-foreground transition-colors duration-300">
                      {project.title}
                    </h3>
                    
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 line-clamp-2 group-hover:text-foreground/80 transition-colors duration-300 flex-1">
                      {project.description}
                    </p>
                    
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors mt-auto">
                      View project
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12 sm:mt-16">
          <a 
            href="https://calendly.com/jgdd/30min" 
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('cta_book_strategy_call', { location: 'portfolio' })}
            className="modern-button bg-foreground text-background px-8 py-4 rounded-full text-lg font-medium hover:bg-foreground/90 transition-all duration-300"
          >
            Book a Strategy Call
          </a>
        </div>
      </div>
    </section>
  );
}

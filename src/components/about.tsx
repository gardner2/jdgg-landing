'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function About() {
  return (
    <section id="about" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-4 sm:mb-6">
            About JGDD
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Building production-grade websites with clarity and speed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mb-12">
          {/* Introduction */}
          <Card className="border border-border rounded-3xl p-6 sm:p-8 animate-scale-in">
            <h3 className="text-2xl sm:text-3xl font-semibold mb-4">Who We Are</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              JGDD is a web development agency focused on delivering high-quality websites 
              with clear scope, modern tooling, and fast turnaround times. We believe in building 
              production-ready solutions that perform well, look great, and are maintainable long-term.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We partner with SaaS teams, professional services, and founder-led businesses that 
              need a calm, controlled delivery process with clear accountability.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our approach combines strategic thinking with technical excellence, ensuring every 
              project meets both business goals and technical standards. We work with founders, 
              startups, and established businesses who value quality over quantity.
            </p>
          </Card>

          {/* Experience & Background */}
          <Card className="border border-border rounded-3xl p-6 sm:p-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-2xl sm:text-3xl font-semibold mb-4">Experience & Background</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              With years of experience in modern web development, we&apos;ve built everything from 
              simple landing pages to complex web applications. Our expertise spans the full stack, 
              from design and user experience to backend systems and deployment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We stay current with the latest technologies and best practices, ensuring your 
              website is built with tools that will stand the test of time. Every project is 
              an opportunity to deliver something exceptional.
            </p>
          </Card>
        </div>

        {/* Skills & Expertise */}
        <div className="mb-12">
          <Card className="border border-border rounded-3xl p-6 sm:p-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl sm:text-3xl font-semibold mb-6">Skills & Expertise</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Frontend</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>React & Next.js</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>TypeScript</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>Tailwind CSS</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>Responsive Design</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Backend & Tools</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>Node.js & APIs</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>Database Design</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>Deployment & DevOps</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>Performance Optimization</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Design & Strategy</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>User Experience Design</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>Wireframing & Prototyping</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>SEO & Analytics</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground" />
                    <span>Accessibility Standards</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Approach & Philosophy */}
        <Card className="border border-border rounded-3xl p-6 sm:p-8 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-2xl sm:text-3xl font-semibold mb-6">Our Approach</h3>
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Clear Communication</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We believe in transparency. You&apos;ll always know what&apos;s happening, 
                what&apos;s included, and what to expect. No surprises, no hidden costs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quality First</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every line of code is written with care. We focus on performance, accessibility, 
                and maintainability to ensure your site works well for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Fast Delivery</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We work efficiently without cutting corners. Our streamlined process means 
                you get results faster without sacrificing quality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Long-term Thinking</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We build websites that grow with you. Clean architecture and modern practices 
                ensure your site remains maintainable and scalable.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <a 
            href="https://calendly.com/jgdd/30min" 
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('cta_book_strategy_call', { location: 'about' })}
            className="modern-button bg-foreground text-background px-8 py-4 rounded-full text-lg font-medium hover:bg-foreground/90 transition-all duration-300"
          >
            Book a Strategy Call
          </a>
        </div>
      </div>
    </section>
  );
}

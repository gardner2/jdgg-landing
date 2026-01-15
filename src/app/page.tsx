'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Portfolio } from '@/components/portfolio';
import { About } from '@/components/about';
import { Pricing } from '@/components/pricing';
import { trackEvent } from '@/lib/analytics';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCtaClick = (location: string) => () =>
    trackEvent('cta_book_strategy_call', { location });

  const handleProcessClick = () =>
    trackEvent('cta_view_process', { location: 'hero' });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Floating CTA */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block animate-slide-up" style={{ animationDelay: '2s' }}>
        <a 
          href="https://calendly.com/jgdd/30min" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={handleCtaClick('floating')}
          className="modern-button bg-foreground text-background px-6 py-3 rounded-full font-semibold hover:scale-110 transition-all duration-300 shadow-2xl flex items-center gap-2 group animate-subtle-pulse"
        >
          <span className="hidden lg:inline">Book a Strategy Call</span>
          <span className="lg:hidden">Strategy Call</span>
          <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </a>
      </div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-semibold tracking-tight">JGDD</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
              <a href="#process" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Process</a>
              <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Services</a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Pricing</a>
              <a href="#portfolio" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Work</a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">About</a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Contact</a>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <a
                href="https://calendly.com/jgdd/30min"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCtaClick('header')}
                className="modern-button hidden md:inline-flex bg-foreground text-background px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Book a Strategy Call
              </a>
              <button
                type="button"
                aria-label="Toggle navigation"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-border text-foreground hover:bg-muted transition-colors"
              >
                {isMenuOpen ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50">
            <div className="px-4 sm:px-6 py-4 space-y-3">
              <a href="#process" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Process</a>
              <a href="#services" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#portfolio" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Work</a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              <a
                href="https://calendly.com/jgdd/30min"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handleCtaClick('mobile_menu')();
                  setIsMenuOpen(false);
                }}
                className="modern-button bg-foreground text-background px-5 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-all duration-300 inline-flex w-full justify-center"
              >
                Book a Strategy Call
              </a>
            </div>
          </div>
        )}
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-foreground/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-foreground/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl">
              <div className="animate-fade-in">
                <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-semibold leading-none tracking-tight mb-6 sm:mb-8">
                  <span className="inline-block animate-slide-up">Visible,</span>
                  <br />
                  <span className="text-muted-foreground inline-block animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    controlled delivery
                  </span>
                  <br />
                  <span className="inline-block animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    for modern web.
                  </span>
                </h1>
              </div>
              
              <div className="animate-slide-up mt-8 sm:mt-12 max-w-2xl" style={{ animationDelay: '0.6s' }}>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 sm:mb-12">
                  Premium websites for SaaS and service firms, delivered through a 
                  clear, visible process that reduces risk and keeps scope tight.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start items-center">
                  <a
                    href="#process"
                    onClick={handleProcessClick}
                    className="modern-button border border-border text-foreground px-8 py-4 sm:px-10 sm:py-5 rounded-full text-lg sm:text-xl font-semibold hover:bg-muted transition-all duration-300 text-center"
                  >
                    View Our Process
                  </a>
                  <a
                    href="https://calendly.com/jgdd/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCtaClick('hero')}
                    className="modern-button bg-foreground text-background px-8 py-4 sm:px-10 sm:py-5 rounded-full text-lg sm:text-xl font-semibold hover:bg-foreground/90 hover:scale-105 transition-all duration-300 text-center group relative overflow-hidden shadow-lg hover:shadow-2xl animate-subtle-pulse"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Book a Strategy Call
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Free 30-minute strategy call
                  </p>
                </div>

                <div className="mt-6 text-sm text-muted-foreground">
                  Typical engagements: £8k–£25k+ • 2–6 week delivery
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="modern-card border border-border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Delivery speed</p>
                <p className="text-2xl font-semibold">2–6 weeks</p>
                <p className="text-sm text-muted-foreground mt-2">Clear scope and rapid execution.</p>
              </div>
              <div className="modern-card border border-border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Premium build quality</p>
                <p className="text-2xl font-semibold">Performance-first</p>
                <p className="text-sm text-muted-foreground mt-2">Accessibility, SEO, and maintainability built in.</p>
              </div>
              <div className="modern-card border border-border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Client experience</p>
                <p className="text-2xl font-semibold">Portal included</p>
                <p className="text-sm text-muted-foreground mt-2">Track progress and request updates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-4 sm:mb-6">
                How we work
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                A controlled process designed to reduce risk and protect scope.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              <div className="modern-card text-center group animate-slide-up">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 sm:mb-8 bg-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl sm:text-2xl text-background">01</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Brief</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Align goals, scope, and success criteria before build starts.
                </p>
              </div>

              <div className="modern-card text-center group animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 sm:mb-8 bg-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl sm:text-2xl text-background">02</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Build</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Structured feedback with clear checkpoints and visibility.
                </p>
              </div>

              <div className="modern-card text-center group animate-slide-up sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.4s' }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 sm:mb-8 bg-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl sm:text-2xl text-background">03</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Launch</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Tested for performance, accessibility, and long-term stability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-4 sm:mb-6">
                What we do
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Full-service web development from concept to launch.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="modern-card border border-border rounded-3xl p-6 sm:p-8 hover:border-foreground/20 transition-all duration-500 animate-scale-in group cursor-pointer">
                <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-2xl text-background">🎨</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 group-hover:text-foreground transition-colors duration-300">Design & Strategy</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 group-hover:text-foreground/80 transition-colors duration-300">
                  Clear positioning and structured UX so the site supports growth and long-term change.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                    <span>Conversion-focused UX</span>
                  </li>
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                    <span>Scalable design systems</span>
                  </li>
                </ul>
              </div>

              <div className="modern-card border border-border rounded-3xl p-6 sm:p-8 hover:border-foreground/20 transition-all duration-500 animate-scale-in group cursor-pointer" style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-2xl text-background">⚡</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 group-hover:text-foreground transition-colors duration-300">Development</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 group-hover:text-foreground/80 transition-colors duration-300">
                  Clean, maintainable code built for speed, security, and future expansion.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                    <span>Modern, stable stack</span>
                  </li>
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                    <span>Performance and SEO baked in</span>
                  </li>
                </ul>
              </div>

              <div className="modern-card border border-border rounded-3xl p-6 sm:p-8 hover:border-foreground/20 transition-all duration-500 animate-scale-in sm:col-span-2 lg:col-span-1 group cursor-pointer" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-2xl text-background">🚀</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 group-hover:text-foreground transition-colors duration-300">Launch & Support</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 group-hover:text-foreground/80 transition-colors duration-300">
                  Stable launches and ongoing support without operational overhead.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                    <span>Managed launch and rollout</span>
                  </li>
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                    <span>Care plans and optimization</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-12 sm:mt-16">
              <a
                href="https://calendly.com/jgdd/30min"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCtaClick('services')}
                className="modern-button bg-foreground text-background px-8 py-4 rounded-full text-lg font-medium hover:bg-foreground/90 transition-all duration-300"
              >
                Book a Strategy Call
              </a>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <Pricing />

        {/* Portfolio Section */}
        <Portfolio />

        {/* Portal Showcase Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-4 sm:mb-6">
                  Delivery Portal included with every project
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Keep stakeholders aligned with transparent progress, feedback loops, and approvals.
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2"></div>
                    <span>Review requests, change tracking, and approvals in one place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2"></div>
                    <span>Clear visibility into timelines, priorities, and deliverables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2"></div>
                    <span>Billing transparency and monthly usage tracking</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <a
                    href="https://calendly.com/jgdd/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCtaClick('portal_section')}
                    className="modern-button bg-foreground text-background px-8 py-4 rounded-full text-lg font-medium hover:bg-foreground/90 transition-all duration-300"
                  >
                    Book a Strategy Call
                  </a>
                </div>
              </div>

              <div className="modern-card border border-border rounded-3xl p-8 bg-background">
                <p className="text-sm text-muted-foreground mb-2">Client experience preview</p>
                <h3 className="text-2xl font-semibold mb-4">Progress, requests, billing</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your clients see what&apos;s shipping, what&apos;s in review, and what&apos;s next — without endless email threads.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="border border-border rounded-xl p-4">
                    <p className="text-muted-foreground">Monthly reviews</p>
                    <p className="text-2xl font-semibold">8 / 10</p>
                  </div>
                  <div className="border border-border rounded-xl p-4">
                    <p className="text-muted-foreground">Active requests</p>
                    <p className="text-2xl font-semibold">3</p>
                  </div>
                  <div className="border border-border rounded-xl p-4">
                    <p className="text-muted-foreground">Next milestone</p>
                    <p className="text-sm font-medium">Review sprint</p>
                  </div>
                  <div className="border border-border rounded-xl p-4">
                    <p className="text-muted-foreground">Status</p>
                    <p className="text-sm font-medium">On track</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose JGDD Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-4 sm:mb-6">
                Why Choose JGDD
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Built for teams who need clarity, stability, and control.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="modern-card border border-border rounded-3xl p-6 sm:p-8 animate-scale-in text-center group h-full flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 bg-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-background">⚡</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Speed & Efficiency</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Short timelines without chaos. Delivery is structured and predictable.
                </p>
              </div>

              <div className="modern-card border border-border rounded-3xl p-6 sm:p-8 animate-scale-in text-center group h-full flex flex-col items-center" style={{ animationDelay: '0.1s' }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 bg-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-background">✨</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Quality Standards</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Defined review and testing stages ensure performance, accessibility, and SEO.
                </p>
              </div>

              <div className="modern-card border border-border rounded-3xl p-6 sm:p-8 animate-scale-in text-center group h-full flex flex-col items-center" style={{ animationDelay: '0.2s' }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 bg-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-background">🛠️</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Modern Tooling</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Tooling chosen for longevity, maintainability, and hiring ease.
                </p>
              </div>

              <div className="modern-card border border-border rounded-3xl p-6 sm:p-8 animate-scale-in text-center group sm:col-span-2 lg:col-span-1 h-full flex flex-col items-center" style={{ animationDelay: '0.3s' }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 bg-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-background">💬</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Clear Communication</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Client portal visibility reduces meetings and eliminates surprises.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <About />

        {/* Contact Section */}
        <section id="contact" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-foreground text-background relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-background/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-background/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-6 sm:mb-8">
                Ready to build?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-background/80 mb-8 sm:mb-12 leading-relaxed">
                Let&apos;s discuss your project and get started.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <a
                  href="https://calendly.com/jgdd/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCtaClick('contact')}
                  className="modern-button bg-background text-foreground px-8 py-4 sm:px-10 sm:py-5 rounded-full text-lg sm:text-xl font-semibold hover:bg-background/90 hover:scale-105 transition-all duration-300 group relative overflow-hidden shadow-xl"
                >
                  <span className="relative z-10 flex items-center gap-2 justify-center">
                    Book a Strategy Call
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </a>
                <a 
                  href="mailto:hello@quietforge.studio" 
                  className="modern-button border-2 border-background/20 text-background px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-medium hover:bg-background/10 transition-all duration-300 group"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">hello@quietforge.studio</span>
                </a>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-background/80">
                  Free 30-minute strategy call • No commitment required
                </p>
              </div>
              
              <div className="mt-12 pt-8 border-t border-background/20">
                <p className="text-sm text-background/60">
                  Response time: Usually within 24 hours
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8">
            <div>
              <span className="text-xl sm:text-2xl font-semibold tracking-tight">JGDD</span>
              <p className="text-muted-foreground mt-2">Design. Develop. Deploy.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
              <nav className="flex flex-wrap gap-6 sm:gap-8">
                <a href="#process" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Process</a>
                <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</a>
                <a href="#portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Work</a>
                <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
                <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
                <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
                <a href="mailto:hello@quietforge.studio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              </nav>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              © 2024 JGDD. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
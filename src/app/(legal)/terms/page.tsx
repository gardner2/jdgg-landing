import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata(
  'Terms of Service - JGDD',
  'Terms of service for JGDD website and services.',
  '/terms'
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-neutral max-w-none">
            <p className="text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using JGDD services, you accept and agree to be bound by 
                the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                JGDD provides web design and development services. All work is performed 
                according to the specifications agreed upon in the project brief and contract.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Payment terms will be specified in your project contract. Generally, we require 
                a deposit to begin work, with the balance due upon project completion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                Upon full payment, you will own the rights to the custom work created for your project. 
                We retain the right to use general knowledge and techniques gained during the project.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                JGDD&apos;s liability is limited to the amount paid for the services. We are not 
                liable for any indirect, incidental, or consequential damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:hello@quietforge.studio" className="text-primary hover:underline">
                  hello@quietforge.studio
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

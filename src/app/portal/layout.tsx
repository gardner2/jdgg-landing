import { getClientSession } from '@/lib/client-auth';
import { PortalNav } from '@/components/portal/portal-nav';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getClientSession();

  // Only render with nav if user is authenticated
  if (session) {
    return (
      <div className="min-h-screen bg-background">
        <PortalNav clientName={session.name} clientEmail={session.email} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  // If no session, render children without nav (for login/verify pages)
  return <>{children}</>;
}

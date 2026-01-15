import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { Sidebar } from '@/components/admin/sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Only render with sidebar if user is authenticated
  if (session) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar adminName={session.name} adminEmail={session.email} />
        <main className="lg:pl-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // If no session, render children without sidebar (for login/verify pages)
  return <>{children}</>;
}

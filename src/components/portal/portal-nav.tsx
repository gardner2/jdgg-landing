'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Briefcase, Mail, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/portal/projects', icon: Briefcase },
  { name: 'Requests', href: '/portal/requests', icon: Mail },
];

interface PortalNavProps {
  clientName?: string;
  clientEmail: string;
}

export function PortalNav({ clientName, clientEmail }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: 'client' }),
      });
      router.push('/portal/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/portal/dashboard">
              <h1 className="text-xl font-bold">JGDD</h1>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium
                      ${isActive 
                        ? 'bg-foreground text-background' 
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <Icon size={16} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{clientName || 'Client'}</p>
              <p className="text-xs text-muted-foreground">{clientEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs font-medium flex-1 justify-center
                  ${isActive 
                    ? 'bg-foreground text-background' 
                    : 'text-foreground/70 hover:bg-muted'
                  }
                `}
              >
                <Icon size={14} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

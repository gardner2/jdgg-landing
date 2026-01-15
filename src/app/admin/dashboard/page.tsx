import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { crmDb } from '@/lib/crm-db';
import { StatsCard } from '@/components/admin/stats-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { Briefcase, Users, Mail, FileText, ArrowRight, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboard() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/admin/login');
  }
  const stats = await crmDb.getStats();
  const recentContacts = (await crmDb.getAllContactSubmissions()).slice(0, 5);
  const recentProjects = (await crmDb.getAllProjects()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={Briefcase}
          description="Currently in progress"
        />
        <StatsCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          description="Active clients"
        />
        <StatsCard
          title="New Contacts"
          value={stats.newContacts}
          icon={Mail}
          description="Awaiting response"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={FileText}
          description="Client requests"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <div className="modern-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Contacts</h2>
            <Link href="/admin/contacts">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentContacts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No contacts yet</p>
          ) : (
            <div className="space-y-4">
              {recentContacts.map((contact: any) => (
                <Link
                  key={contact.id}
                  href={`/admin/contacts`}
                  className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                    <StatusBadge status={contact.status} />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {contact.message}
                  </p>
                  {contact.company && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {contact.company}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="modern-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <Link href="/admin/projects">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No projects yet</p>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.client_name}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  {project.budget && (
                    <p className="text-sm font-medium">
                      £{project.budget.toLocaleString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="modern-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/clients">
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </Link>
          <Link href="/admin/projects">
            <Button variant="outline" className="w-full justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
          <Link href="/admin/portfolio">
            <Button variant="outline" className="w-full justify-start">
              <FolderOpen className="mr-2 h-4 w-4" />
              Add Portfolio Item
            </Button>
          </Link>
          <Link href="/admin/contacts">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              View Contacts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

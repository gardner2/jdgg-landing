'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/admin/status-badge';
import { Briefcase, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Project {
  id: number;
  title: string;
  type: string;
  status: string;
  budget: number;
  timeline: string;
  created_at: string;
}

export default function PortalDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/portal/projects');
      
      if (response.status === 401) {
        router.push('/portal/login');
        return;
      }
      
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's an overview of your projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="modern-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
              <p className="text-3xl font-bold">{projects.length}</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <Briefcase size={24} className="text-foreground/70" />
            </div>
          </div>
        </div>

        <div className="modern-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">In Progress</p>
              <p className="text-3xl font-bold">{activeProjects.length}</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-foreground/70" />
            </div>
          </div>
        </div>

        <div className="modern-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-3xl font-bold">{completedProjects.length}</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-foreground/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Projects</h2>
          <div className="grid gap-4">
            {activeProjects.map((project) => (
              <Link
                key={project.id}
                href={`/portal/projects/${project.id}`}
                className="modern-card border border-border rounded-xl p-6 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{project.type}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                {project.timeline && (
                  <p className="text-sm text-muted-foreground">
                    Timeline: {project.timeline}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">All Projects</h2>
          <Link href="/portal/projects">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No projects yet</p>
            <p className="text-sm text-muted-foreground">
              Your projects will appear here once they're created
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/portal/projects/${project.id}`}
                className="modern-card border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{project.title}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-muted-foreground capitalize">{project.type}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="modern-card bg-foreground text-background rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
        <p className="text-background/80 mb-4">
          Have questions about your project? We're here to help!
        </p>
        <a href="mailto:hello@quietforge.studio">
          <Button className="bg-background text-foreground hover:bg-background/90">
            Contact Support
          </Button>
        </a>
      </div>
    </div>
  );
}

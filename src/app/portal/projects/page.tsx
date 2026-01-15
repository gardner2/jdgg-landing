'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/admin/status-badge';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  type: string;
  status: string;
  budget: number;
  timeline: string;
  description: string;
  created_at: string;
}

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/portal/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Projects</h1>
        <p className="text-muted-foreground">{projects.length} total projects</p>
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
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/portal/projects/${project.id}`}
              className="modern-card border border-border rounded-xl p-6 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{project.type}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {project.timeline && (
                  <span>Timeline: {project.timeline}</span>
                )}
                {project.budget && (
                  <span>Budget: £{project.budget.toLocaleString()}</span>
                )}
                <span className="ml-auto">
                  Started {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

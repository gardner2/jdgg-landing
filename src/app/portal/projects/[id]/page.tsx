'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StatusBadge } from '@/components/admin/status-badge';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

interface Update {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchProject();
    }
  }, [params?.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/portal/projects/${params?.id}`);
      const data = await response.json();
      setProject(data.project);
      setUpdates(data.updates || []);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Link href="/portal/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/portal/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground capitalize">{project.type} Project</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <div className="modern-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            
            {project.description ? (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {project.description}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                No description provided
              </p>
            )}
          </div>

          {/* Timeline Updates */}
          <div className="modern-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Updates & Progress</h2>

            {updates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No updates yet. Updates will appear here as work progresses.
              </p>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.id} className="border-l-2 border-foreground/20 pl-4 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium">{update.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(update.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {update.description && (
                      <p className="text-sm text-muted-foreground">
                        {update.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="modern-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Project Information</h3>
            <div className="space-y-3">
              {project.timeline && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="text-sm font-medium">{project.timeline}</p>
                  </div>
                </div>
              )}

              {project.budget && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-sm font-medium">£{project.budget.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="text-sm font-medium">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="modern-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-3">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Questions about this project? Get in touch!
            </p>
            <a href="mailto:hello@quietforge.studio">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

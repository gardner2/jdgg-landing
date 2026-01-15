'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/status-badge';
import { ArrowLeft, Edit, Save, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Project {
  id: number;
  client_id: number;
  client_name: string;
  client_email: string;
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
  created_by: string;
  created_at: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    status: '',
    budget: '',
    timeline: '',
    description: '',
  });
  const [updateData, setUpdateData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (params?.id) {
      fetchProject();
    }
  }, [params?.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${params?.id}`);
      const data = await response.json();
      setProject(data.project);
      setUpdates(data.updates || []);
      setFormData({
        title: data.project.title,
        type: data.project.type || '',
        status: data.project.status,
        budget: data.project.budget || '',
        timeline: data.project.timeline || '',
        description: data.project.description || '',
      });
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`/api/admin/projects/${params?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget as string) : null,
        }),
      });
      
      setEditing(false);
      fetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await fetch(`/api/admin/projects/${params?.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      setShowUpdateDialog(false);
      setUpdateData({ title: '', description: '' });
      fetchProject();
    } catch (error) {
      console.error('Error adding update:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!project) {
    return <div className="text-center py-12">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">
              {project.client_name} • {project.client_email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={handleSave} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditing(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="modern-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    >
                      <option value="website">Website</option>
                      <option value="webapp">Web App</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="landing">Landing Page</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    >
                      <option value="quoted">Quoted</option>
                      <option value="active">Active</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget (£)</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Timeline</label>
                    <input
                      type="text"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{project.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={project.status} />
                </div>
                {project.budget && (
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">£{project.budget.toLocaleString()}</p>
                  </div>
                )}
                {project.timeline && (
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-medium">{project.timeline}</p>
                  </div>
                )}
                {project.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium whitespace-pre-wrap">{project.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline Updates */}
          <div className="modern-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Timeline Updates</h2>
              <Button onClick={() => setShowUpdateDialog(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Update
              </Button>
            </div>

            {updates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No updates yet</p>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.id} className="border-l-2 border-foreground/20 pl-4 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium">{update.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {update.description && (
                      <p className="text-sm text-muted-foreground">{update.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      by {update.created_by}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="modern-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Client</h3>
            <div className="space-y-2">
              <Link href={`/admin/clients/${project.client_id}`}>
                <Button variant="outline" className="w-full justify-start">
                  View Client Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="modern-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Updates</p>
                <p className="font-medium">{updates.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Project Update</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={updateData.title}
                onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={updateData.description}
                onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Add Update
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowUpdateDialog(false);
                  setUpdateData({ title: '', description: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

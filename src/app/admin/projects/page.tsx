'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/status-badge';
import Link from 'next/link';

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
  created_at: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    type: 'website',
    status: 'quoted',
    budget: '',
    timeline: '',
    description: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients');
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          client_id: parseInt(formData.client_id),
          budget: formData.budget ? parseFloat(formData.budget) : null,
        }),
      });
      
      setShowDialog(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      title: '',
      type: 'website',
      status: 'quoted',
      budget: '',
      timeline: '',
      description: '',
    });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group projects by status for Kanban view
  const projectsByStatus = {
    quoted: filteredProjects.filter(p => p.status === 'quoted'),
    active: filteredProjects.filter(p => p.status === 'active' || p.status === 'in_progress'),
    completed: filteredProjects.filter(p => p.status === 'completed'),
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">{projects.length} total projects</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background min-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="quoted">Quoted</option>
          <option value="active">Active</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Kanban Board */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Quoted Column */}
        <div>
          <div className="mb-4">
            <h2 className="font-semibold text-base">Quoted ({projectsByStatus.quoted.length})</h2>
            <p className="text-sm text-muted-foreground">Awaiting approval</p>
          </div>
          <div className="space-y-3">
            {projectsByStatus.quoted.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="block modern-card border border-border rounded-lg p-4 hover:bg-muted transition-colors"
              >
                <h3 className="font-medium mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{project.client_name}</p>
                {project.budget && (
                  <p className="text-sm font-medium">£{project.budget.toLocaleString()}</p>
                )}
              </Link>
            ))}
            {projectsByStatus.quoted.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                No quoted projects
              </p>
            )}
          </div>
        </div>

        {/* Active Column */}
        <div>
          <div className="mb-4">
            <h2 className="font-semibold text-base">Active ({projectsByStatus.active.length})</h2>
            <p className="text-sm text-muted-foreground">In progress</p>
          </div>
          <div className="space-y-3">
            {projectsByStatus.active.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="block modern-card border border-border rounded-lg p-4 hover:bg-muted transition-colors"
              >
                <h3 className="font-medium mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{project.client_name}</p>
                {project.timeline && (
                  <p className="text-xs text-muted-foreground">Timeline: {project.timeline}</p>
                )}
              </Link>
            ))}
            {projectsByStatus.active.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                No active projects
              </p>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div>
          <div className="mb-4">
            <h2 className="font-semibold text-base">Completed ({projectsByStatus.completed.length})</h2>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </div>
          <div className="space-y-3">
            {projectsByStatus.completed.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="block modern-card border border-border rounded-lg p-4 hover:bg-muted transition-colors"
              >
                <h3 className="font-medium mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{project.client_name}</p>
                {project.budget && (
                  <p className="text-sm font-medium">£{project.budget.toLocaleString()}</p>
                )}
              </Link>
            ))}
            {projectsByStatus.completed.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                No completed projects
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Client *</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
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
                  step="0.01"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timeline</label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="e.g., 4-6 weeks"
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

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Create Project
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
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

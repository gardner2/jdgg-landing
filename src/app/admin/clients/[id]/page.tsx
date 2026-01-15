'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/status-badge';
import { ArrowLeft, Edit, Save, X, Mail, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: number;
  email: string;
  name: string;
  company: string;
  phone: string;
  status: string;
  portal_access: boolean;
  notes: string;
  created_at: string;
}

interface Project {
  id: number;
  title: string;
  status: string;
  budget: number;
  created_at: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    status: '',
    portal_access: false,
    notes: '',
  });

  useEffect(() => {
    if (params?.id) {
      fetchClient();
    }
  }, [params?.id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${params?.id}`);
      const data = await response.json();
      setClient(data.client);
      setProjects(data.projects || []);
      setFormData({
        name: data.client.name,
        company: data.client.company || '',
        phone: data.client.phone || '',
        status: data.client.status,
        portal_access: data.client.portal_access,
        notes: data.client.notes || '',
      });
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`/api/admin/clients/${params?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      setEditing(false);
      fetchClient();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!client) {
    return <div className="text-center py-12">Client not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">{client.email}</p>
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
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: client.name,
                    company: client.company || '',
                    phone: client.phone || '',
                    status: client.status,
                    portal_access: client.portal_access,
                    notes: client.notes || '',
                  });
                }}
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
        {/* Client Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="modern-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="portal_access"
                    checked={formData.portal_access}
                    onChange={(e) => setFormData({ ...formData, portal_access: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="portal_access" className="text-sm font-medium">
                    Portal access enabled
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
                {client.company && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{client.company}</p>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={client.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Portal Access</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    client.portal_access 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.portal_access ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {client.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium whitespace-pre-wrap">{client.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="modern-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Projects ({projects.length})</h2>
              <Link href={`/admin/projects?client=${client.id}`}>
                <Button size="sm">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Add Project
                </Button>
              </Link>
            </div>

            {projects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No projects yet</p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}`}
                    className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{project.title}</p>
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

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="modern-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a href={`mailto:${client.email}`}>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </a>
              <Link href={`/admin/projects?client=${client.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </div>
          </div>

          <div className="modern-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Client since</p>
                <p className="font-medium">
                  {new Date(client.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Projects</p>
                <p className="font-medium">{projects.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  tags: string;
  image_url?: string;
  live_url?: string;
  featured: boolean;
}

export default function PortfolioManagementPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    image_url: '',
    live_url: '',
    featured: false,
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Add cache-busting to ensure fresh data
      const response = await fetch(`/api/admin/portfolio?t=${Date.now()}`);
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare data - convert empty strings to null for optional fields
      // Validate URLs if provided (but allow empty)
      let liveUrl = formData.live_url.trim() || null;
      if (liveUrl && !liveUrl.match(/^https?:\/\//i)) {
        // If it doesn't start with http:// or https://, add https://
        liveUrl = `https://${liveUrl}`;
      }
      
      const submitData = {
        ...formData,
        image_url: formData.image_url.trim() || null,
        live_url: liveUrl,
      };
      
      if (editingProject) {
        // Update
        const response = await fetch(`/api/admin/portfolio/${editingProject.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update project');
        }
      } else {
        // Create
        const response = await fetch('/api/admin/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create project');
        }
      }
      
      setShowDialog(false);
      resetForm();
      // Force refresh projects with a small delay to ensure DB update is complete
      setTimeout(() => {
        fetchProjects();
      }, 100);
    } catch (error: any) {
      console.error('Error saving project:', error);
      alert(error.message || 'Failed to save project. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEdit = (project: PortfolioProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      tags: project.tags,
      image_url: project.image_url || '',
      live_url: project.live_url || '',
      featured: project.featured,
    });
    setImagePreview(project.image_url || '');
    setSelectedFile(null);
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      tags: '',
      image_url: '',
      live_url: '',
      featured: false,
    });
    setSelectedFile(null);
    setImagePreview('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      // Ensure we're using the correct URL format
      const imageUrl = data.url.startsWith('/') ? data.url : `/${data.url}`;
      // Add cache-busting parameter to force refresh
      const imageUrlWithCache = `${imageUrl}?t=${Date.now()}`;
      setFormData({ ...formData, image_url: imageUrl });
      setImagePreview(imageUrlWithCache);
      setSelectedFile(null);
      alert('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData({ ...formData, image_url: '' });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-2">Portfolio Management</h1>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground mb-4">No portfolio projects yet</p>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="modern-card border border-border rounded-xl overflow-hidden">
              {project.image_url && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img 
                    src={`${project.image_url}?v=${project.id}`}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', project.image_url);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  {project.featured ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.split(',').map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-xs px-2 py-1 bg-muted rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(project)}
                    className="flex-1"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'hsl(var(--background))' }}>
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </DialogTitle>
            <DialogDescription>
              {editingProject ? 'Update the portfolio project details below.' : 'Fill in the details to add a new project to your portfolio.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ backgroundColor: 'hsl(var(--muted))' }}
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                style={{ backgroundColor: 'hsl(var(--muted))' }}
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated) *</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Next.js, React, Tailwind"
                required
                style={{ backgroundColor: 'hsl(var(--muted))' }}
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Portfolio Image</label>
              
              {/* Image Preview */}
              {(imagePreview || formData.image_url) && (
                <div className="mb-4 relative">
                  <img
                    src={imagePreview || `${formData.image_url}?t=${Date.now()}`}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-border"
                    key={formData.image_url || 'preview'}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Choose Image</span>
                    </div>
                  </label>
                  {selectedFile && (
                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-shrink-0"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  )}
                </div>
                
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}

                {/* Or use URL */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="/portfolio/filename.jpg or https://example.com/image.jpg"
                  style={{ backgroundColor: 'hsl(var(--muted))' }}
                  className="w-full px-4 py-2 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Live URL (optional)</label>
              <input
                type="text"
                value={formData.live_url}
                onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                placeholder="https://example.com"
                style={{ backgroundColor: 'hsl(var(--muted))' }}
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Featured Project (shown on homepage)
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingProject ? 'Update' : 'Create'} Project
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

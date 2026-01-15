'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/admin/status-badge';
import { Search } from 'lucide-react';

interface Request {
  id: number;
  client_id: number;
  client_name: string;
  client_email: string;
  project_id: number;
  project_title: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // This will be implemented when we add client requests API
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-2">Client Requests</h1>
        <p className="text-muted-foreground">Manage client support requests and change requests</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
        />
      </div>

      <div className="text-center py-12 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground">
          No client requests yet. Requests will appear here when clients submit them through the portal.
        </p>
      </div>
    </div>
  );
}

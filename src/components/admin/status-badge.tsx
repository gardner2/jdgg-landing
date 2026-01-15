import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'outline';
}

const statusConfig: Record<string, { color: string; label: string }> = {
  // Project statuses
  'quoted': { color: 'bg-blue-100 text-blue-800', label: 'Quoted' },
  'active': { color: 'bg-green-100 text-green-800', label: 'Active' },
  'in_progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
  'completed': { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
  'on_hold': { color: 'bg-orange-100 text-orange-800', label: 'On Hold' },
  'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  
  // Contact statuses
  'new': { color: 'bg-blue-100 text-blue-800', label: 'New' },
  'contacted': { color: 'bg-purple-100 text-purple-800', label: 'Contacted' },
  'converted': { color: 'bg-green-100 text-green-800', label: 'Converted' },
  'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  
  // Request statuses
  'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  'reviewing': { color: 'bg-blue-100 text-blue-800', label: 'Reviewing' },
  'resolved': { color: 'bg-green-100 text-green-800', label: 'Resolved' },
  
  // Priority levels
  'low': { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  'medium': { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  'high': { color: 'bg-orange-100 text-orange-800', label: 'High' },
  'urgent': { color: 'bg-red-100 text-red-800', label: 'Urgent' },
};

export function StatusBadge({ status, variant = 'outline' }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { 
    color: 'bg-gray-100 text-gray-800', 
    label: status 
  };

  return (
    <Badge variant={variant} className={`${config.color} border-0`}>
      {config.label}
    </Badge>
  );
}

'use client';

import { Mail } from 'lucide-react';

export default function PortalRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Support Requests</h1>
        <p className="text-muted-foreground">Submit and track your support requests</p>
      </div>

      <div className="text-center py-12 border border-dashed border-border rounded-xl">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">Request system coming soon</p>
        <p className="text-sm text-muted-foreground mb-4">
          For now, please email us directly at{' '}
          <a href="mailto:hello@quietforge.studio" className="underline">
            hello@quietforge.studio
          </a>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ProjectSubmission } from '@/lib/database';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submit');
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data.submissions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="text-xl sm:text-2xl font-semibold tracking-tight hover:opacity-80 transition-opacity">JGDD</a>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeToggle />
              <a href="/admin/quotes" className="modern-button border border-border text-foreground px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-muted transition-all duration-300">
                Manage Quotes
              </a>
              <a href="/onboard" className="modern-button border border-border text-foreground px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-muted transition-all duration-300">
                New Project
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 sm:pt-24 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Project Submissions</h1>
            <p className="text-muted-foreground">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} received
            </p>
          </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No submissions yet</p>
            <p className="text-muted-foreground">Form submissions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {submissions.map((submission) => (
              <div key={submission.id} className="modern-card bg-card border border-border rounded-2xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-1">
                      {submission.client.name} - {submission.project_type}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {submission.client.email} • {submission.client.company || 'No company'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      submission.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      submission.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                      submission.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                      submission.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {submission.status}
                    </span>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(submission.created_at!).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">Project Details</h4>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-medium">Type:</span> {submission.project_type}</p>
                      <p><span className="font-medium">Pages:</span> {submission.scope.pages}</p>
                      <p><span className="font-medium">Complexity:</span> {submission.scope.complexity}</p>
                      <p><span className="font-medium">Features:</span> {submission.scope.features.slice(0, 2).join(', ')}{submission.scope.features.length > 2 && '...'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">Timeline & Budget</h4>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-medium">Deadline:</span> {submission.timeline.deadline}</p>
                      <p><span className="font-medium">Urgency:</span> {submission.timeline.urgency}</p>
                      <p><span className="font-medium">Budget:</span> {submission.budget.range}</p>
                      <p><span className="font-medium">Flexibility:</span> {submission.budget.flexibility}</p>
                    </div>
                  </div>
                </div>

                {submission.requirements && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">Requirements</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {submission.requirements.length > 100 ? `${submission.requirements.substring(0, 100)}...` : submission.requirements}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button className="modern-button px-3 py-2 bg-foreground text-background rounded-lg text-xs sm:text-sm hover:bg-foreground/90 transition-all duration-300">
                      View Details
                    </button>
                    <button className="modern-button px-3 py-2 border border-border rounded-lg text-xs sm:text-sm hover:bg-muted transition-all duration-300">
                      Send Quote
                    </button>
                    <button className="modern-button px-3 py-2 border border-border rounded-lg text-xs sm:text-sm hover:bg-muted transition-all duration-300">
                      Contact Client
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

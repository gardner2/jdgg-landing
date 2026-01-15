'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
// Define Quote interface for the ultra-simple database
interface Quote {
  id: number;
  client_email: string;
  client_name: string | null;
  project_type: string;
  quote_amount: number;
  quote_token: string;
  created_at: string;
  expires_at: string | null;
  ai_analysis: string | null;
  status: string;
  admin_notes: string | null;
  final_amount: number | null;
  sent_to_client: boolean;
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'sent_to_client' | 'accepted' | 'declined' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('q', search.trim());
      const response = await fetch(`/api/admin/quotes?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setQuotes(data.quotes);
      } else {
        setError(data.error || 'Failed to fetch quotes');
      }
    } catch (err) {
      setError('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const openQuoteModal = (quote: Quote) => {
    setSelectedQuote(quote);
    setAdminNotes(quote.admin_notes || '');
    setFinalAmount(quote.final_amount || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuote(null);
    setAdminNotes('');
    setFinalAmount(null);
  };

  const saveAdminNotes = async () => {
    if (!selectedQuote) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/quotes/${selectedQuote.quote_token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_notes: adminNotes,
          final_amount: finalAmount
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the quote in the list
        setQuotes(quotes.map(q => 
          q.id === selectedQuote.id 
            ? { ...q, admin_notes: adminNotes, final_amount: finalAmount }
            : q
        ));
        closeModal();
      } else {
        alert(data.error || 'Failed to save notes');
      }
    } catch (err) {
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const sendToClient = async (quote: Quote) => {
    if (!confirm(`Send quote to ${quote.client_name || quote.client_email}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/quotes/${quote.quote_token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_to_client'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the quote in the list
        setQuotes(quotes.map(q => 
          q.id === quote.id 
            ? { ...q, status: 'sent_to_client', sent_to_client: true }
            : q
        ));
        alert('Quote sent to client successfully!');
      } else {
        alert(data.error || 'Failed to send quote');
      }
    } catch (err) {
      alert('Failed to send quote');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'sent_to_client': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-orange-100 text-orange-800';
      case 'enterprise': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quotes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <svg className="w-12 h-12 text-destructive mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Quotes</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchQuotes}
              className="inline-block bg-destructive text-destructive-foreground px-6 py-2 rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-foreground leading-tight mb-1">Quote Management</h1>
              <p className="text-muted-foreground text-[11px] sm:text-xs">Review and manage AI-generated quotes</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <ThemeToggle />
              <a
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
              >
                ← Back to Admin
              </a>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                >
                  <option value="all">All</option>
                  <option value="pending_review">New</option>
                  <option value="sent_to_client">Quote Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="paid">Paid</option>
                </select>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, token..."
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                />
                <button
                  onClick={fetchQuotes}
                  className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {quotes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">No quotes yet</h3>
            <p className="text-muted-foreground">Quotes will appear here as clients submit project requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
            {['pending_review','sent_to_client','accepted','declined','paid'].map((col) => (
              <div key={col} className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide">
                    {col === 'pending_review' ? 'New' : col === 'sent_to_client' ? 'Sent' : col.charAt(0).toUpperCase() + col.slice(1)}
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                      {quotes.filter(q => q.status === col).length}
                    </span>
                  </h3>
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverCol(col); }}
                  onDragEnter={() => setDragOverCol(col)}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={async (e) => {
                    const token = e.dataTransfer.getData('text/plain');
                    if (!token) return;
                    await fetch(`/api/admin/quotes/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_status', status: col }) });
                    setQuotes(prev => prev.map(q => q.quote_token === token ? { ...q, status: col as any } : q));
                    setDragOverCol(null);
                  }}
                  className={`min-h-[150px] space-y-1 rounded-md transition ring-1 pt-1 ${dragOverCol===col ? 'ring-primary/40 bg-primary/5' : 'ring-transparent'}`}
                >
                  {quotes.filter(q => q.status === col)
                    .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((quote) => {
              let aiAnalysis = null;
              let quoteBreakdown = null;
              
              try {
                if (quote.ai_analysis && quote.ai_analysis !== 'undefined') {
                  aiAnalysis = JSON.parse(quote.ai_analysis);
                  quoteBreakdown = aiAnalysis?.quoteBreakdown;
                }
              } catch (error) {
                console.error('Error parsing AI analysis for quote:', quote.id, error);
              }
              
              const isOpen = !!expanded[quote.id];
              return (
                <div key={quote.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', quote.quote_token)}
                  onClick={(e) => { const el = e.target as HTMLElement; if (el.closest('button')) return; openQuoteModal(quote); }}
                  className="group bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm hover:shadow-lg hover:border-blue-300/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold text-gray-900 truncate" title={quote.client_name || quote.client_email}>
                          {quote.client_name || quote.client_email}
                        </div>
                        <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {quote.project_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span>•</span>
                          <span>{formatDate(quote.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                          {quote.status === 'pending_review' ? 'New' : quote.status === 'sent_to_client' ? 'Sent' : quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                        {aiAnalysis && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getComplexityColor(aiAnalysis.complexity)}`}>{aiAnalysis.complexity}</span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(quote.final_amount || quote.quote_amount)}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-end">
                        <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-2">
                        {quote.status === 'pending_review' && (
                          <button
                            onClick={() => sendToClient(quote)}
                            title="Send"
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-green-600 hover:to-green-700 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            Send
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this quote? This cannot be undone.')) return;
                            const res = await fetch(`/api/admin/quotes/${quote.quote_token}`, { method: 'DELETE' });
                            const data = await res.json();
                            if (data.success) {
                              setQuotes(quotes.filter(q => q.id !== quote.id));
                            } else {
                              alert(data.error || 'Failed to delete quote');
                            }
                          }}
                          title="Delete"
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [quote.id]: !prev[quote.id] }))}
                    className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:underline mb-2 font-medium"
                  >
                    {isOpen ? 'Hide details' : 'View details'}
                  </button>

                  {isOpen && (
                  <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                    <h4 className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-3">Client Information</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground text-right truncate" title={quote.client_email}>{quote.client_email}</span>
                      {quote.client_name && (
                        <>
                          <span className="text-muted-foreground">Name</span>
                          <span className="text-foreground text-right truncate" title={quote.client_name}>{quote.client_name}</span>
                        </>
                      )}
                      {quote.client_company && (
                        <>
                          <span className="text-muted-foreground">Company</span>
                          <span className="text-foreground text-right truncate" title={quote.client_company}>{quote.client_company}</span>
                        </>
                      )}
                      {quote.client_phone && (
                        <>
                          <span className="text-muted-foreground">Phone</span>
                          <span className="text-foreground text-right">{quote.client_phone}</span>
                        </>
                      )}
                      <span className="text-muted-foreground">Project Type</span>
                      <span className="text-foreground text-right capitalize">{quote.project_type.replace('-', ' ')}</span>
                      {quote.timeline && (
                        <>
                          <span className="text-muted-foreground">Timeline</span>
                          <span className="text-foreground text-right">{quote.timeline}</span>
                        </>
                      )}
                      {quote.budget_range && (
                        <>
                          <span className="text-muted-foreground">Budget Range</span>
                          <span className="text-foreground text-right">{quote.budget_range}</span>
                        </>
                      )}
                    </div>
                  </div>
                  )}

                  {isOpen && (
                  <div className="space-y-2 sm:space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">AI Quote:</span>
                      <span className="text-base sm:text-lg font-semibold text-foreground">
                        {formatCurrency(quote.quote_amount)}
                      </span>
                    </div>
                    
                    {quote.final_amount && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Final Amount:</span>
                        <span className="text-base sm:text-lg font-semibold text-primary">
                          {formatCurrency(quote.final_amount)}
                        </span>
                      </div>
                    )}

                    {aiAnalysis && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Est. Hours:</span>
                        <span className="text-xs sm:text-sm text-foreground">{aiAnalysis.estimatedHours}h</span>
                      </div>
                    )}

                    {quoteBreakdown && quoteBreakdown.timeline && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">AI Timeline:</span>
                        <span className="text-xs sm:text-sm text-foreground">{quoteBreakdown.timeline}</span>
                      </div>
                    )}
                    {quoteBreakdown && quoteBreakdown.budgetRange && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">AI Budget Range:</span>
                        <span className="text-xs sm:text-sm text-foreground">{quoteBreakdown.budgetRange}</span>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Project Requirements */}
                  {isOpen && quote.requirements && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                      <h4 className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-3">Project Requirements</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {quote.requirements}
                      </p>
                    </div>
                  )}

                  {isOpen && (
                  <div className="mb-3">
                    <h4 className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">Selected Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        try {
                          const features = quote.scope_features && quote.scope_features !== 'undefined' 
                            ? JSON.parse(quote.scope_features) 
                            : [];
                          return features.slice(0, 3).map((feature: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                              {feature.replace('-', ' ')}
                            </span>
                          ));
                        } catch (error) {
                          return <span className="text-xs text-muted-foreground">No features available</span>;
                        }
                      })()}
                      {(() => {
                        try {
                          const features = quote.scope_features && quote.scope_features !== 'undefined' 
                            ? JSON.parse(quote.scope_features) 
                            : [];
                          return features.length > 3 && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                              +{features.length - 3} more
                            </span>
                          );
                        } catch (error) {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                  )}

                  {isOpen && quote.admin_notes && (
                    <div className="mb-3 p-3 bg-primary/10 rounded-lg">
                      <h4 className="text-xs sm:text-sm font-medium text-primary mb-1">Admin Notes:</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{quote.admin_notes}</p>
                    </div>
                  )}

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openQuoteModal(quote)}
                      className="bg-primary text-primary-foreground px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-sm sm:text-xs font-medium hover:bg-primary/90 transition-colors min-h-[44px] sm:min-h-0"
                    >
                      Review & Edit
                    </button>
                    {quote.status === 'pending_review' && (
                      <button
                        onClick={() => sendToClient(quote)}
                        className="bg-green-600 text-white px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-sm sm:text-xs font-medium hover:bg-green-700 transition-colors min-h-[44px] sm:min-h-0"
                      >
                        Send
                      </button>
                    )}
                    {/* Backlog removed in Kanban version */}
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this quote? This cannot be undone.')) return;
                        const res = await fetch(`/api/admin/quotes/${quote.quote_token}`, { method: 'DELETE' });
                        const data = await res.json();
                        if (data.success) {
                          setQuotes(quotes.filter(q => q.id !== quote.id));
                        } else {
                          alert(data.error || 'Failed to delete quote');
                        }
                      }}
                      className="col-span-2 bg-destructive text-white px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-sm sm:text-xs font-medium hover:bg-destructive/90 transition-colors min-h-[44px] sm:min-h-0"
                    >
                      Delete
                    </button>

                  </div>
                </div>
                </div>
              );
            })}
                  {quotes.filter(q => q.status === col).length === 0 && (
                    <div className="text-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl py-8 bg-gray-50/50">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <span className="font-medium">Drag quotes here</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Quote Review Modal */}
        {showModal && selectedQuote && (
          <div className="fixed inset-0 bg-white flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-border shadow-2xl rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 bg-white">
                <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-border pb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    Review Quote #{selectedQuote.id}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Client Form Data */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Client Information</h3>
                  
                  <div className="bg-muted rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-foreground mb-3 text-sm sm:text-base">Contact Details</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-foreground">{selectedQuote.client_email}</span>
                      </div>
                      {selectedQuote.client_name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="text-foreground">{selectedQuote.client_name}</span>
                        </div>
                      )}
                      {selectedQuote.client_company && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Company:</span>
                          <span className="text-foreground">{selectedQuote.client_company}</span>
                        </div>
                      )}
                      {selectedQuote.client_phone && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="text-foreground">{selectedQuote.client_phone}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Project Type:</span>
                        <span className="text-foreground capitalize">{selectedQuote.project_type.replace('-', ' ')}</span>
                      </div>
                      {selectedQuote.timeline && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Timeline:</span>
                          <span className="text-foreground">{selectedQuote.timeline}</span>
                        </div>
                      )}
                      {selectedQuote.budget_range && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Budget Range:</span>
                          <span className="text-foreground">{selectedQuote.budget_range}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedQuote.requirements && (
                    <div className="bg-muted rounded-lg p-3 sm:p-4">
                      <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Project Requirements</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {selectedQuote.requirements}
                      </p>
                    </div>
                  )}

                  {selectedQuote.scope_features && selectedQuote.scope_features !== 'undefined' && (() => {
                    try {
                      const features = JSON.parse(selectedQuote.scope_features);
                      return (
                        <div className="bg-muted rounded-lg p-3 sm:p-4">
                          <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Selected Features</h4>
                          <div className="flex flex-wrap gap-1">
                            {features.map((feature: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-background text-foreground text-xs rounded">
                                {feature.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      return null;
                    }
                  })()}
                </div>

                {/* AI Analysis */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">AI Analysis</h3>
                  
                  {selectedQuote.ai_analysis && selectedQuote.ai_analysis !== 'undefined' ? (() => {
                    try {
                      const analysis = JSON.parse(selectedQuote.ai_analysis);
                      const quoteBreakdown = analysis.quoteBreakdown;
                      
                      // Debug: Log the analysis structure
                      console.log('AI Analysis Structure:', analysis);
                      console.log('Quote Breakdown:', quoteBreakdown);
                      
                      return (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="bg-muted rounded-lg p-3 sm:p-4">
                            <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Project Complexity</h4>
                            <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getComplexityColor(analysis.complexity)}`}>
                              {analysis.complexity}
                            </span>
                          </div>

                          <div className="bg-muted rounded-lg p-3 sm:p-4">
                            <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Time Estimation</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{analysis.estimatedHours} hours</p>
                          </div>

                          <div className="bg-muted rounded-lg p-3 sm:p-4">
                            <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">AI Confidence</h4>
                            <div className="flex items-center">
                              <div className="flex-1 bg-secondary rounded-full h-2 mr-3">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${analysis.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-xs sm:text-sm text-muted-foreground">{analysis.confidence}%</span>
                            </div>
                          </div>

                          {quoteBreakdown && (
                            <>
                              <div className="bg-muted rounded-lg p-3 sm:p-4">
                                <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Project Timeline</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">{quoteBreakdown.timeline}</p>
                              </div>

                              <div className="bg-muted rounded-lg p-3 sm:p-4">
                                <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Project Scope</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">{quoteBreakdown.projectScope}</p>
                              </div>

                              <div className="bg-muted rounded-lg p-3 sm:p-4">
                                <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Cost Breakdown</h4>
                                <div className="space-y-2 text-xs sm:text-sm">
                                  {/* Line items if present */}
                                  {Array.isArray(quoteBreakdown.lineItems) && quoteBreakdown.lineItems.length > 0 && (
                                    <div className="mb-2 space-y-1">
                                      {quoteBreakdown.lineItems.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between">
                                          <span className="text-muted-foreground">{item.label} ({item.hours}h @ £{item.rate}/h)</span>
                                          <span className="text-foreground">£{Number(item.cost).toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Price:</span>
                                    <span className="text-foreground">£{quoteBreakdown.basePrice?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Price:</span>
                                    <span className="font-semibold text-foreground">£{quoteBreakdown.totalPrice?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Estimated Hours:</span>
                                    <span className="text-foreground">{quoteBreakdown.estimatedHours}h</span>
                                  </div>
                                </div>
                              </div>

                              {/* Simple Spec */}
                              {quoteBreakdown.spec && (
                                <div className="bg-muted rounded-lg p-3 sm:p-4">
                                  <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Proposed Specification</h4>
                                  {quoteBreakdown.spec.overview && (
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">{quoteBreakdown.spec.overview}</p>
                                  )}
                                  {Array.isArray(quoteBreakdown.spec.features) && quoteBreakdown.spec.features.length > 0 && (
                                    <div className="mb-2">
                                      <h5 className="text-xs font-medium text-foreground mb-1">Features</h5>
                                      <ul className="text-xs sm:text-sm text-muted-foreground list-disc pl-4">
                                        {quoteBreakdown.spec.features.map((f: string, i: number) => (
                                          <li key={i}>{f}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {Array.isArray(quoteBreakdown.spec.pages) && quoteBreakdown.spec.pages.length > 0 && (
                                    <div>
                                      <h5 className="text-xs font-medium text-foreground mb-1">Pages</h5>
                                      <ul className="text-xs sm:text-sm text-muted-foreground list-disc pl-4">
                                        {quoteBreakdown.spec.pages.map((p: string, i: number) => (
                                          <li key={i}>{p}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="bg-muted rounded-lg p-3 sm:p-4">
                                <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Deliverables</h4>
                                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                                  {quoteBreakdown.deliverables?.slice(0, 5).map((deliverable: string, index: number) => (
                                    <li key={index} className="flex items-center">
                                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      {deliverable}
                                    </li>
                                  ))}
                                  {quoteBreakdown.deliverables?.length > 5 && (
                                    <li className="text-muted-foreground">+{quoteBreakdown.deliverables.length - 5} more items</li>
                                  )}
                                </ul>
                              </div>

                              <div className="bg-muted rounded-lg p-3 sm:p-4">
                                <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Potential Risks</h4>
                                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                                  {quoteBreakdown.risks?.map((risk: string, index: number) => (
                                    <li key={index} className="flex items-start">
                                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      {risk}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-muted rounded-lg p-3 sm:p-4">
                                <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">AI Recommendations</h4>
                                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                                  {quoteBreakdown.recommendations?.map((rec: string, index: number) => (
                                    <li key={index} className="flex items-start">
                                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                      </svg>
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-primary/10 rounded-lg p-3 sm:p-4">
                                <h4 className="font-medium text-primary mb-2 text-sm sm:text-base">AI Quote Summary</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">{quoteBreakdown.quoteText}</p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    } catch (error) {
                      console.error('Error parsing AI analysis:', error);
                      console.error('Raw AI analysis data:', selectedQuote.ai_analysis);
                      return (
                        <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                          <h4 className="font-medium text-yellow-900 mb-2 text-sm sm:text-base">AI Analysis Error</h4>
                          <p className="text-xs sm:text-sm text-yellow-800">Unable to parse AI analysis data. Please check the quote generation.</p>
                          <details className="mt-2">
                            <summary className="text-xs text-yellow-700 cursor-pointer">Show raw data</summary>
                            <pre className="text-xs text-yellow-700 mt-1 overflow-auto">{selectedQuote.ai_analysis}</pre>
                          </details>
                        </div>
                      );
                    }
                  })() : (
                    <div className="bg-muted rounded-lg p-3 sm:p-4">
                      <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">No AI Analysis Available</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">This quote was generated without AI analysis.</p>
                    </div>
                  )}
                </div>

                {/* Admin Controls */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Admin Review</h3>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-xs sm:text-sm"
                      placeholder="Add your notes about this quote..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                      Final Amount (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs sm:text-sm">£</span>
                      <input
                        type="number"
                        value={finalAmount || ''}
                        onChange={(e) => setFinalAmount(e.target.value ? parseInt(e.target.value) : null)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-xs sm:text-sm"
                        placeholder="Override AI amount"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to use AI-generated amount: {formatCurrency(selectedQuote.quote_amount)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={saveAdminNotes}
                      disabled={saving}
                      className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {saving ? 'Saving...' : 'Save Review'}
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

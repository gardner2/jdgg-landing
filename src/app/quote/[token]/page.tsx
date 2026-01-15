'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
// Define Quote interface for the ultra-simple database
interface Quote {
  id: number;
  client_email: string;
  client_name: string | null;
  client_company: string | null;
  client_phone: string | null;
  project_type: string;
  scope_features: string | null;
  timeline: string | null;
  budget_range: string | null;
  requirements: string | null;
  quote_amount: number;
  quote_token: string;
  created_at: string;
  expires_at: string | null;
  ai_analysis: string | null;
  status: 'pending_review' | 'sent_to_client' | 'accepted' | 'declined' | 'paid' | 'backlog';
  admin_notes: string | null;
  final_amount: number | null;
  sent_to_client: boolean;
}

export default function QuoteReviewPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [action, setAction] = useState<'accept' | 'decline' | null>(null);

  useEffect(() => {
    if (token) {
      fetchQuote();
    }
  }, [token]);

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/quotes/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setQuote(data.quote);
      } else {
        setError(data.error || 'Quote not found');
      }
    } catch (err) {
      setError('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAction('accept');
    setProcessing(true);
    
    try {
      const response = await fetch(`/api/quotes/${token}/accept`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to payment
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'Failed to accept quote');
      }
    } catch (err) {
      alert('Failed to accept quote');
    } finally {
      setProcessing(false);
      setAction(null);
    }
  };

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this quote? This action cannot be undone.')) {
      return;
    }
    
    setAction('decline');
    setProcessing(true);
    
    try {
      const response = await fetch(`/api/quotes/${token}/decline`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Quote declined. Thank you for your interest.');
        window.location.href = '/';
      } else {
        alert(data.error || 'Failed to decline quote');
      }
    } catch (err) {
      alert('Failed to decline quote');
    } finally {
      setProcessing(false);
      setAction(null);
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Quote Not Found</h2>
            <p className="text-red-600 mb-4">{error || 'This quote may have expired or been removed.'}</p>
            <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = quote.expires_at ? new Date(quote.expires_at) < new Date() : false;
  const canAccept = quote.status === 'sent_to_client' && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Quote</h1>
              <p className="text-gray-600">Review your custom project proposal</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Quote #{quote.id}</p>
              <p className="text-sm text-gray-500">Created {formatDate(quote.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quote Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Type</label>
                  <p className="text-gray-900 capitalize">{quote.project_type.replace('-', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Timeline</label>
                  <p className="text-gray-900 capitalize">{quote.timeline.replace('-', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Budget Range</label>
                  <p className="text-gray-900">{quote.budget_range}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Client</label>
                  <p className="text-gray-900">{quote.client_name || quote.client_email}</p>
                </div>
              </div>
            </div>

            {/* Scope & Features */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scope & Features</h2>
              <div className="space-y-3">
                {quote.scope_features ? (() => {
                  try {
                    const features = JSON.parse(quote.scope_features);
                    return features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-900 capitalize">{feature.replace('-', ' ')}</span>
                      </div>
                    ));
                  } catch (error) {
                    return <p className="text-gray-500">Features information not available</p>;
                  }
                })() : <p className="text-gray-500">Features information not available</p>}
              </div>
            </div>

            {/* Requirements */}
            {quote.requirements && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Requirements</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{quote.requirements}</p>
              </div>
            )}
          </div>

          {/* Quote Summary & Actions */}
          <div className="space-y-6">
            {/* Quote Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quote Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Project Cost</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(quote.quote_amount, quote.currency)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(quote.quote_amount, quote.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quote Status</h2>
              
              {isExpired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-800 font-medium">Quote Expired</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">This quote expired on {formatDate(quote.expires_at)}</p>
                </div>
              )}

              {quote.status === 'accepted' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium">Quote Accepted</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">Quote has been accepted</p>
                </div>
              )}

              {quote.status === 'paid' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-blue-800 font-medium">Payment Complete</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">Your project is now confirmed and work will begin shortly</p>
                </div>
              )}

              {quote.status === 'declined' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-800 font-medium">Quote Declined</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">This quote has been declined</p>
                </div>
              )}

              {quote.status === 'pending_review' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-yellow-800 font-medium">Under Review</span>
                  </div>
                  <p className="text-yellow-600 text-sm mt-1">This quote is still being reviewed by our team</p>
                </div>
              )}

              {canAccept && (
                <div className="space-y-3">
                  <button
                    onClick={handleAccept}
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing && action === 'accept' ? 'Processing...' : 'Accept Quote & Pay'}
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={processing}
                    className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing && action === 'decline' ? 'Processing...' : 'Decline Quote'}
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Quote expires on {formatDate(quote.expires_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

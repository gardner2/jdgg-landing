'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface QuoteData {
  id: number;
  client_name: string;
  client_email: string;
  project_type: string;
  quote_amount: number;
  quote_token: string;
  created_at: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchQuoteData();
    }
  }, [token]);

  const fetchQuoteData = async () => {
    try {
      const response = await fetch(`/api/quotes/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setQuote(data.quote);
      }
    } catch (err) {
      console.error('Failed to fetch quote data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for your payment. Your project is now confirmed and we'll begin work shortly.
          </p>
        </div>

        {/* Quote Summary */}
        {quote && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Project Confirmation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Client Name</label>
                  <p className="text-lg text-gray-900">{quote.client_name || quote.client_email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Type</label>
                  <p className="text-lg text-gray-900 capitalize">
                    {quote.project_type.replace('-', ' ')}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Quote ID</label>
                  <p className="text-lg font-mono text-gray-600">#{quote.id}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: 'GBP'
                    }).format(quote.quote_amount)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Date</label>
                  <p className="text-lg text-gray-900">
                    {new Date().toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Paid & Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-8 mb-8">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">What Happens Next?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">Project Kickoff</h4>
              <p className="text-sm text-blue-700">
                Our team will contact you within 24 hours to schedule a project kickoff call.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">Development Begins</h4>
              <p className="text-sm text-blue-700">
                We'll start working on your project according to the agreed timeline and scope.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">Regular Updates</h4>
              <p className="text-sm text-blue-700">
                You'll receive regular progress updates and have access to our client portal.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Contact Our Team</h4>
              <p className="text-gray-600 mb-3">
                If you have any questions about your project or need to make changes, don't hesitate to reach out.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> hello@quietforge.com
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> +44 (0) 20 1234 5678
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Client Portal</h4>
              <p className="text-gray-600 mb-3">
                Access your project dashboard to track progress, request changes, and communicate with our team.
              </p>
              <Link
                href="/portal"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Access Portal
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </Link>
            
            <Link
              href="/portal"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Client Portal
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}






'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setError('No verification token provided');
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        setStatus('success');
        // Redirect to portal after a short delay
        setTimeout(() => {
          router.push('/portal');
        }, 2000);
      } else {
        const errorData = await response.json();
        setStatus('error');
        setError(errorData.error || 'Verification failed');
      }
    } catch (err) {
      setStatus('error');
      setError('Network error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold mb-2">Verifying your access...</h1>
            <p className="text-muted-foreground">Please wait while we verify your magic link.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Access Verified!</h1>
            <p className="text-muted-foreground mb-4">You're being redirected to your portal...</p>
            <div className="animate-pulse">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-foreground h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <a href="/" className="modern-button bg-foreground text-background px-6 py-3 rounded-full block">
                Back to Home
              </a>
              <button 
                onClick={() => window.location.reload()} 
                className="modern-button border border-border text-foreground px-6 py-3 rounded-full block w-full"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

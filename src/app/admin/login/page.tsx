'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDevLink('');

    try {
      const response = await fetch('/api/auth/admin/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send magic link');
      }

      const data = await response.json();
      
      // In development, show the link directly
      if (data.devLink) {
        setDevLink(data.devLink);
      }

      setSent(true);
    } catch (err) {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your email to receive a secure login link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Check your email</h3>
              <p className="text-muted-foreground mb-4">
                We sent a magic link to <strong>{email}</strong>
              </p>
              
              {/* Development mode - show link directly */}
              {devLink && (
                <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm font-semibold mb-2 text-foreground">Development Mode</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    In development, emails are logged to console. Click the link below:
                  </p>
                  <a
                    href={devLink}
                    className="inline-block px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors break-all mb-2"
                  >
                    {devLink}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(devLink);
                      alert('Link copied to clipboard!');
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Copy link
                  </button>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground mt-4">
                Click the link in the email to securely login. The link expires in 15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@quietforge.studio"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

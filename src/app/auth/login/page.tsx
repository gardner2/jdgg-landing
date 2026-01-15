'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        if (data.magicLink) {
          setMessage(data.message + ' (Development mode: ' + data.magicLink + ')');
        }
      } else {
        setError(data.error || 'Failed to send magic link');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

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
              <a href="/" className="modern-button border border-border text-foreground px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-muted transition-all duration-300">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 sm:pt-24 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="modern-card border border-border rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Access Your Portal</h1>
              <p className="text-muted-foreground">
                Enter your email to receive a secure magic link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full modern-button bg-foreground text-background py-3 rounded-lg font-medium hover:bg-foreground/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                    Sending Magic Link...
                  </div>
                ) : (
                  'Send Magic Link'
                )}
              </button>
            </form>

            {message && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Magic links expire after 15 minutes for security.
                <br />
                Check your spam folder if you don't see the email.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}






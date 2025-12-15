'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement Firebase authentication
      console.log('Login with:', { email, password });
    } catch (err) {
      setError('Failed to log in. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0a1a] relative overflow-hidden">
      {/* Gradient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="card border border-purple-500/30">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              💰 FundTrack
            </h1>
            <p className="text-[#b0afc0]">
              Your premium expense companion
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#2d1f45]/50 border border-[#3d2e5f] rounded-xl hover:border-purple-500/50 transition-all">
              <span className="text-xl">🔵</span>
              <span className="text-sm font-semibold text-white">
                Sign in with Google
              </span>
            </button>

            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#2d1f45]/50 border border-[#3d2e5f] rounded-xl hover:border-purple-500/50 transition-all">
              <span className="text-xl">🍎</span>
              <span className="text-sm font-semibold text-white">
                Sign in with Apple
              </span>
            </button>
          </div>

          <div className="mt-8 text-center space-y-3">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[#d4af37] hover:text-[#f4d46a] transition-colors block"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-[#b0afc0]">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-[#d4af37] hover:text-[#f4d46a] transition-colors font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

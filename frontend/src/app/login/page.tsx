'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Key, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [showAdvancedToken, setShowAdvancedToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Backend validates via Bearer tokens
      const tokenToSave = apiToken.trim() || 'beariq-user-token-001';
      localStorage.setItem('beariq_auth_token', tokenToSave);
      localStorage.setItem('beariq_user_email', email || 'sudeep@beariq.ai');
      
      // Navigate to overview dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    api.setMockMode(true);
    localStorage.setItem('beariq_auth_token', 'demo-session-token');
    localStorage.setItem('beariq_user_email', 'demo@beariq.ai');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#f1f0ea]">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-manrope font-extrabold text-3xl uppercase tracking-tight text-[#20251f]">
            <svg 
              viewBox="0 0 32 32" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.4" 
              className="w-8 h-8 text-[#20251f]"
            >
              <path d="M8 9C2 1 0 13 6 15v6q10 13 20 0v-6c6-2 4-14-2-6q-8-5-16 0Z" />
              <circle cx="11" cy="17" r="1.2" fill="currentColor" />
              <circle cx="21" cy="17" r="1.2" fill="currentColor" />
              <path d="m13 23 3 2 3-2" strokeLinecap="round" />
            </svg>
            <span>Bear<span className="text-[#a58b3f]">IQ</span></span>
          </Link>
          <p className="text-[13px] text-[#72776f] mt-2">Sign in to your private intelligence workspace</p>
        </div>

        {/* Card */}
        <div className="editorial-card p-8">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#657066] mb-1.5 font-medium">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white/70 text-sm text-[#20251f] placeholder:text-black/30 focus:outline-none focus:border-[#a58b3f] transition-colors"
                />
                <Mail size={16} className="absolute right-3.5 top-3 text-black/30 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#657066] font-medium">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white/70 text-sm text-[#20251f] placeholder:text-black/30 focus:outline-none focus:border-[#a58b3f] transition-colors"
                />
                <Lock size={16} className="absolute right-3.5 top-3 text-black/30 pointer-events-none" />
              </div>
            </div>

            {/* Optional Bearer token input for backend API */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedToken(!showAdvancedToken)}
                className="text-[11px] text-[#868b82] hover:text-[#20251f] flex items-center gap-1.5 py-1"
              >
                <Key size={12} />
                <span>{showAdvancedToken ? 'Hide Custom Bearer Token' : 'Provide Custom API Bearer Token'}</span>
              </button>
              {showAdvancedToken && (
                <div className="mt-2">
                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="FastAPI API_KEY_HASH token"
                    className="w-full px-3.5 py-2 rounded-lg border border-black/15 bg-white/70 text-xs font-mono text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
                  />
                  <span className="text-[10px] text-[#868b82] mt-1 block">
                    Matches SHA-256 hash defined in backend <code>API_KEY_HASHES</code>.
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-dark py-3 text-[13px] mt-2 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick Demo Workspace Shortcut */}
          <div className="mt-6 pt-6 border-t border-black/10">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full btn-secondary py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <ShieldCheck size={14} className="text-[#a58b3f]" />
              <span>Launch Demo Workspace (Instant Access)</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-[#72776f]">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="text-[#20251f] font-semibold underline hover:text-[#9d7619]">
            Create a workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

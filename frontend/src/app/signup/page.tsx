'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('beariq_user_name', name);
    localStorage.setItem('beariq_user_email', email);
    localStorage.setItem('beariq_auth_token', 'beariq-user-token-001');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#f1f0ea]">
      <div className="w-full max-w-md">
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
          <p className="text-[13px] text-[#72776f] mt-2">Initialize your private AI memory repository</p>
        </div>

        <div className="editorial-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#657066] mb-1.5 font-medium">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sudeep Sharma"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white/70 text-sm text-[#20251f] placeholder:text-black/30 focus:outline-none focus:border-[#a58b3f]"
                />
                <User size={16} className="absolute right-3.5 top-3 text-black/30 pointer-events-none" />
              </div>
            </div>

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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white/70 text-sm text-[#20251f] placeholder:text-black/30 focus:outline-none focus:border-[#a58b3f]"
                />
                <Mail size={16} className="absolute right-3.5 top-3 text-black/30 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#657066] mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white/70 text-sm text-[#20251f] placeholder:text-black/30 focus:outline-none focus:border-[#a58b3f]"
                />
                <Lock size={16} className="absolute right-3.5 top-3 text-black/30 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-dark py-3 text-[13px] mt-2 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating workspace...' : 'Create Workspace'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-xs text-[#72776f]">
          Already registered?{' '}
          <Link href="/login" className="text-[#20251f] font-semibold underline hover:text-[#9d7619]">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

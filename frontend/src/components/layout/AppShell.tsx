'use client';

import React, { useState, Suspense } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, ArrowUpRight, Search } from 'lucide-react';
import Link from 'next/link';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function AppShell({ children, title, subtitle, action }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f1f0ea] text-[#20251f]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Suspense fallback={<div className="w-64 border-r border-[#20251f16] bg-[#f1f0ea]/80" />}>
          <Sidebar />
        </Suspense>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 bg-[#f1f0ea] h-full shadow-2xl flex flex-col">
            <div className="p-4 flex justify-end">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-[#72776f]"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-[#20251f14] bg-white/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md hover:bg-black/5 text-[#5e655e]"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#899185]">Workspace</span>
                <span className="text-[#899185]">/</span>
                <h1 className="text-[15px] font-semibold text-[#20251f] font-manrope">{title || 'Overview'}</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/playground"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md bg-[#ffffff50] border border-black/10 hover:bg-white text-[#3a433a] transition-colors"
            >
              <span>Test Memory Query</span>
              <ArrowUpRight size={14} className="text-[#a58b3f]" />
            </Link>

            <Link
              href="/imports"
              className="btn-primary py-1.5 px-3.5 text-[12px]"
            >
              <span>+ Import ZIP</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {(title || action) && (
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#20251f12]">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-manrope text-[#20251f]">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[13px] text-[#72776f] mt-1.5 max-w-2xl leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

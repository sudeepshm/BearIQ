'use client';

import React from 'react';
import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="h-[96px] max-w-[1440px] mx-auto px-6 sm:px-12 flex items-center justify-between border-b border-[#20251f16] w-full">
      <Link href="/" className="flex items-center gap-2.5 font-manrope font-extrabold text-[26px] tracking-tight text-[#20251f]">
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          className="w-7 h-7 text-[#232b2d]"
        >
          <path d="M8 9C2 1 0 13 6 15v6q10 13 20 0v-6c6-2 4-14-2-6q-8-5-16 0Z" />
          <circle cx="11" cy="17" r="1.2" fill="currentColor" />
          <circle cx="21" cy="17" r="1.2" fill="currentColor" />
          <path d="m13 23 3 2 3-2" strokeLinecap="round" />
        </svg>
        <span className="uppercase tracking-tight">
          Bear<span className="text-[#a58b3f]">IQ</span>
        </span>
      </Link>

      <nav className="flex items-center gap-6 sm:gap-9 text-[13px] text-[#5e655e]">
        <a href="#how-it-works" className="hidden sm:inline-block hover:text-[#9d7619] transition-colors">
          How it works
        </a>
        <a href="#features" className="hidden md:inline-block hover:text-[#9d7619] transition-colors">
          Architecture
        </a>
        <Link href="/login" className="hover:text-[#9d7619] transition-colors font-medium">
          Sign In
        </Link>
        <Link 
          href="/dashboard"
          className="btn-dark text-[12px] py-2.5 px-4 sm:px-5 flex items-center gap-2"
        >
          <span>Launch Workspace</span>
          <span className="text-[#e7cc73]">↗</span>
        </Link>
      </nav>
    </header>
  );
}

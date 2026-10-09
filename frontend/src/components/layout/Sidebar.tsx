'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BrainCircuit, 
  TerminalSquare, 
  Sparkles, 
  Cpu, 
  ShoppingBag, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Import Chats', href: '/imports', icon: UploadCloud },
  { name: 'Memories', href: '/memories', icon: BrainCircuit },
  { name: 'Query Playground', href: '/playground', icon: TerminalSquare },
  { name: 'Skills', href: '/skills', icon: Sparkles },
  { name: 'Integrations', href: '/integrations', icon: Cpu },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag, badge: 'Phase 5' },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    setIsMock(api.isMockMode());
  }, []);

  const toggleMock = () => {
    const next = !isMock;
    api.setMockMode(next);
    setIsMock(next);
    window.location.reload();
  };

  return (
    <aside
      className={`relative flex flex-col justify-between border-r border-[#20251f16] bg-[#f1f0ea]/80 backdrop-blur-md transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-20 flex items-center justify-between px-5 border-b border-[#20251f12]">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <svg 
              viewBox="0 0 32 32" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.4" 
              className="w-7 h-7 text-[#20251f] shrink-0"
            >
              <path d="M8 9C2 1 0 13 6 15v6q10 13 20 0v-6c6-2 4-14-2-6q-8-5-16 0Z" />
              <circle cx="11" cy="17" r="1.2" fill="currentColor" />
              <circle cx="21" cy="17" r="1.2" fill="currentColor" />
              <path d="m13 23 3 2 3-2" strokeLinecap="round" />
            </svg>
            {!collapsed && (
              <span className="font-manrope font-extrabold text-[20px] tracking-tight uppercase text-[#20251f]">
                Bear<span className="text-[#a58b3f]">IQ</span>
              </span>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#72776f] hover:text-[#20251f] hover:bg-black/5 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
                  active
                    ? 'bg-[#232923] text-white shadow-sm'
                    : 'text-[#5e655e] hover:text-[#20251f] hover:bg-black/[0.04]'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={18} className={active ? 'text-[#e7cc73]' : 'text-[#72776f] group-hover:text-[#20251f]'} />
                {!collapsed && (
                  <span className="flex-1 truncate flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[#a58b3f] uppercase">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User & Mode Section */}
      <div className="p-3 border-t border-[#20251f12] space-y-3">
        {/* Backend Connectivity Status */}
        {!collapsed ? (
          <div className="px-3 py-2 rounded-lg bg-black/[0.03] border border-black/[0.06] text-[11px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium text-[#4b544d]">API Mode</span>
              <button 
                onClick={toggleMock}
                className="text-[10px] text-[#a58b3f] font-mono hover:underline uppercase"
              >
                {isMock ? 'Demo Mock' : 'Live FastAPI'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[#72776f]">
              <span className={`w-2 h-2 rounded-full ${isMock ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="truncate">{isMock ? 'Isolated Demo' : 'http://localhost:8000'}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={isMock ? 'Mock Demo Mode' : 'Connected to Backend'}>
            <span className={`w-2.5 h-2.5 rounded-full ${isMock ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          </div>
        )}

        {/* Profile preview & sign out */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link href="/" className="flex items-center gap-2 text-[12px] text-[#72776f] hover:text-[#20251f]">
            <ExternalLink size={14} />
            {!collapsed && <span>Landing Page</span>}
          </Link>
          <Link 
            href="/login" 
            aria-label="Sign out"
            className="text-[#72776f] hover:text-red-600 transition-colors" 
            title="Sign out"
          >
            <LogOut size={16} />
          </Link>
        </div>
      </div>
    </aside>
  );
}

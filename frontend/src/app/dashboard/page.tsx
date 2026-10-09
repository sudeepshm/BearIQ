'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { MemoryItem, SkillItem } from '@/lib/types';
import { 
  BrainCircuit, 
  UploadCloud, 
  Sparkles, 
  ArrowUpRight, 
  TerminalSquare, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Tag,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [memRes, skillRes] = await Promise.all([
        api.listMemories('active', 50, 0),
        api.listSkills(50, 0)
      ]);
      setMemories(memRes.memories || []);
      setSkills(skillRes.skills || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute category distribution
  const categoryCounts = memories.reduce((acc, m) => {
    const key = m.type || 'other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppShell
      title="Intelligence Overview"
      subtitle="Live metrics and recent memory activity for your personal AI layer."
      action={
        <button
          onClick={fetchData}
          disabled={loading}
          className="btn-secondary text-[12px] py-1.5 px-3 flex items-center gap-1.5"
          title="Refresh metrics from backend"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#856404] text-xs flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => { api.setMockMode(true); fetchData(); }} 
            className="underline font-semibold text-[#a58b3f]"
          >
            Switch to Isolated Demo Mode
          </button>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="editorial-card p-6">
          <div className="flex items-center justify-between text-[#899185] mb-3">
            <span className="editorial-tag">MEMORIES</span>
            <BrainCircuit size={18} className="text-[#a58b3f]" />
          </div>
          <div className="font-manrope text-3xl font-bold text-[#20251f]">
            {loading ? '—' : memories.length}
          </div>
          <span className="text-[12px] text-[#72776f] mt-1 block">Active evidence-backed items</span>
        </div>

        <div className="editorial-card p-6">
          <div className="flex items-center justify-between text-[#899185] mb-3">
            <span className="editorial-tag">SKILLS</span>
            <Sparkles size={18} className="text-[#a58b3f]" />
          </div>
          <div className="font-manrope text-3xl font-bold text-[#20251f]">
            {loading ? '—' : skills.length}
          </div>
          <span className="text-[12px] text-[#72776f] mt-1 block">Reusable compiled skills</span>
        </div>

        <div className="editorial-card p-6">
          <div className="flex items-center justify-between text-[#899185] mb-3">
            <span className="editorial-tag">CATEGORIES</span>
            <Tag size={18} className="text-[#a58b3f]" />
          </div>
          <div className="font-manrope text-3xl font-bold text-[#20251f]">
            {loading ? '—' : Object.keys(categoryCounts).length}
          </div>
          <span className="text-[12px] text-[#72776f] mt-1 block">Knowledge domains indexed</span>
        </div>

        <div className="editorial-card p-6">
          <div className="flex items-center justify-between text-[#899185] mb-3">
            <span className="editorial-tag">VERIFICATION</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div className="font-manrope text-3xl font-bold text-[#20251f]">
            {loading ? '—' : `${Math.round((memories.filter(m => (m.confidence || 0) >= 0.9).length / (memories.length || 1)) * 100)}%`}
          </div>
          <span className="text-[12px] text-[#72776f] mt-1 block">High confidence ratio (&ge;90%)</span>
        </div>
      </div>

      {/* Main Grid: Onboarding Checklist & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Onboarding Checklist / Quick Actions */}
        <div className="editorial-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="editorial-tag">WORKFLOW GUIDE</span>
              <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1">
                Memory Layer Progress
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#a58b3f] bg-black/5 px-2.5 py-1 rounded">
              ROADMAP STEP
            </span>
          </div>

          <div className="space-y-3">
            <Link 
              href="/imports"
              className="flex items-center justify-between p-3.5 rounded-xl border border-black/10 bg-white/50 hover:bg-white hover:border-[#a58b3f]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e7cc73]/30 flex items-center justify-center text-[#20251f]">
                  <UploadCloud size={16} />
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-[#20251f] group-hover:text-[#9d7619] transition-colors">
                    1. Import ChatGPT Export Archive
                  </h4>
                  <p className="text-[11px] text-[#72776f]">Drop conversations.json ZIP export to extract candidates.</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-[#899185] group-hover:text-[#20251f]" />
            </Link>

            <Link 
              href="/memories"
              className="flex items-center justify-between p-3.5 rounded-xl border border-black/10 bg-white/50 hover:bg-white hover:border-[#a58b3f]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e7cc73]/30 flex items-center justify-center text-[#20251f]">
                  <BrainCircuit size={16} />
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-[#20251f] group-hover:text-[#9d7619] transition-colors">
                    2. Inspect & Confirm Extracted Memories
                  </h4>
                  <p className="text-[11px] text-[#72776f]">Review supporting conversational evidence and adjust importance.</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-[#899185] group-hover:text-[#20251f]" />
            </Link>

            <Link 
              href="/playground"
              className="flex items-center justify-between p-3.5 rounded-xl border border-black/10 bg-white/50 hover:bg-white hover:border-[#a58b3f]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e7cc73]/30 flex items-center justify-center text-[#20251f]">
                  <TerminalSquare size={16} />
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-[#20251f] group-hover:text-[#9d7619] transition-colors">
                    3. Test Memory Retrieval in Playground
                  </h4>
                  <p className="text-[11px] text-[#72776f]">Simulate agent prompts and preview assembled system context.</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-[#899185] group-hover:text-[#20251f]" />
            </Link>

            <Link 
              href="/skills"
              className="flex items-center justify-between p-3.5 rounded-xl border border-black/10 bg-white/50 hover:bg-white hover:border-[#a58b3f]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e7cc73]/30 flex items-center justify-center text-[#20251f]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-[#20251f] group-hover:text-[#9d7619] transition-colors">
                    4. Generate Reusable AI Skills
                  </h4>
                  <p className="text-[11px] text-[#72776f]">Compile verified memories into portable Markdown skill files.</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-[#899185] group-hover:text-[#20251f]" />
            </Link>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="editorial-card p-6 flex flex-col justify-between">
          <div>
            <span className="editorial-tag">INDEX DISTRIBUTION</span>
            <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1 mb-4">
              Memory Domains
            </h3>

            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-[#72776f] italic py-8 text-center">No memories indexed yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const pct = Math.round((count / memories.length) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs text-[#20251f] font-mono">
                        <span className="capitalize">{cat.replace('_', ' ')}</span>
                        <span className="text-[#899185]">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#a58b3f] rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-black/10 flex justify-between items-center text-xs text-[#72776f]">
            <span>Hybrid Classification</span>
            <span className="font-mono text-[#a58b3f]">Gemini 2.5 Embeddings</span>
          </div>
        </div>
      </div>

      {/* Recent Memories Section */}
      <div className="editorial-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="editorial-tag">RECENT EXTRACTIONS</span>
            <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1">
              Latest Evidence-Backed Memories
            </h3>
          </div>
          <Link href="/memories" className="text-xs font-semibold text-[#a58b3f] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {memories.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#72776f]">
            No memories extracted yet. Start by importing a ChatGPT ZIP archive.
          </div>
        ) : (
          <div className="divide-y divide-black/10">
            {memories.slice(0, 4).map((m) => (
              <div key={m.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 text-[#4a534c] uppercase">
                      {m.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {Math.round(m.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-[13px] text-[#20251f] font-medium leading-snug">
                    {m.content}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-[#899185] font-mono flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/memories/${m.id}`}
                    className="btn-secondary py-1 px-2.5 text-[11px]"
                  >
                    Evidence
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

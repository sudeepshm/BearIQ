'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { MemoryDetail } from '@/lib/types';
import { 
  ArrowLeft, 
  BrainCircuit, 
  ShieldCheck, 
  MessageSquareQuote, 
  Clock, 
  Check, 
  Edit3, 
  Trash2, 
  RotateCw,
  Quote,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

function MemoryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [memory, setMemory] = useState<MemoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getMemory(id);
        setMemory(res);
        setEditContent(res.content);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Memory detail not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleConfirm = async () => {
    if (!memory) return;
    setActionLoading(true);
    try {
      const updated = await api.reviewMemory(memory.id, 'confirm');
      setMemory((prev) => prev ? { ...prev, ...updated, status: 'active', confidence: 1.0 } : null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!memory || !editContent.trim()) return;
    setActionLoading(true);
    try {
      const replacement = await api.reviewMemory(memory.id, 'edit', editContent);
      setEditing(false);
      router.push(`/memories/${replacement.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Edit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!memory || !confirm('Permanently delete this memory?')) return;
    setActionLoading(true);
    try {
      await api.deleteMemory(memory.id);
      router.push('/memories');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppShell
      title="Evidence Inspector"
      subtitle="Examine supporting conversational evidence and validity provenance for this memory."
    >
      <div className="mb-6">
        <Link
          href="/memories"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#72776f] hover:text-[#20251f] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Memories Registry</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RotateCw size={24} className="animate-spin mx-auto text-[#a58b3f]" />
          <p className="text-xs text-[#72776f] font-mono">Loading memory evidence...</p>
        </div>
      ) : error || !memory ? (
        <div className="editorial-card p-10 text-center space-y-3">
          <h3 className="font-manrope font-semibold text-lg text-[#20251f]">
            {error || 'Memory not found'}
          </h3>
          <p className="text-xs text-[#72776f]">The requested memory could not be retrieved from the database.</p>
          <Link href="/memories" className="btn-secondary py-1.5 px-3 text-xs inline-block mt-2">
            Return to list
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Full Memory & Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="editorial-card p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-black/5 text-[#20251f] font-semibold">
                    {memory.type.replace('_', ' ')}
                  </span>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border capitalize ${
                    memory.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : memory.status === 'pending'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-black/5 text-[#72776f] border-black/10'
                  }`}>
                    {memory.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {memory.status === 'pending' && (
                    <button
                      onClick={handleConfirm}
                      disabled={actionLoading}
                      className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Confirm Active</span>
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(!editing)}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Edit3 size={14} />
                    <span>{editing ? 'Cancel Edit' : 'Edit Version'}</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                    title="Delete memory"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#657066]">
                    Updated Content Statement
                  </label>
                  <textarea
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-black/20 bg-white text-sm text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(false)} className="btn-secondary py-1.5 px-3 text-xs">
                      Cancel
                    </button>
                    <button onClick={handleSaveEdit} className="btn-primary py-1.5 px-4 text-xs">
                      Save as New Version
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="editorial-tag">CONFIRMED CONTENT</span>
                  <p className="font-manrope font-semibold text-xl text-[#20251f] mt-2 leading-relaxed">
                    {memory.content}
                  </p>
                </div>
              )}
            </div>

            {/* Evidence Quotes */}
            <div className="editorial-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="editorial-tag">VALIDITY CITATIONS</span>
                  <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1 flex items-center gap-2">
                    <MessageSquareQuote size={18} className="text-[#a58b3f]" />
                    <span>Supporting Conversation Messages</span>
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#899185]">
                  {memory.evidence?.length || 0} citations found
                </span>
              </div>

              {!memory.evidence || memory.evidence.length === 0 ? (
                <p className="text-xs text-[#72776f] italic py-4">
                  This memory was created explicitly by the user without automated conversation extraction.
                </p>
              ) : (
                <div className="space-y-4">
                  {memory.evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-xl border border-black/10 bg-white/70 space-y-3 relative"
                    >
                      <Quote className="text-[#e7cc73]/40 absolute top-4 right-4 w-8 h-8 pointer-events-none" />
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#899185]">
                        <span className="text-[#20251f] font-semibold uppercase">{ev.platform || 'chatgpt'}</span>
                        <span>•</span>
                        <span>Message: {ev.message_id}</span>
                        <span>•</span>
                        <span>{new Date(ev.timestamp).toLocaleString()}</span>
                      </div>
                      <blockquote className="text-[13px] text-[#343e37] italic border-l-2 border-[#a58b3f] pl-3.5 leading-relaxed">
                        &ldquo;{ev.text}&rdquo;
                      </blockquote>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata & System Provenance */}
          <div className="space-y-6">
            <div className="editorial-card p-6 space-y-4">
              <span className="editorial-tag">PROVENANCE METRICS</span>
              <h4 className="font-manrope font-semibold text-base text-[#20251f]">
                Memory Scoring
              </h4>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between py-2 border-b border-black/10">
                  <span className="text-[#72776f]">Confidence</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {Math.round((memory.confidence || 0) * 100)}%
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-black/10">
                  <span className="text-[#72776f]">Importance</span>
                  <span className="font-mono font-bold text-[#20251f]">
                    {Math.round((memory.importance || 0) * 10)} / 10
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-black/10">
                  <span className="text-[#72776f]">Temporality</span>
                  <span className="font-mono font-semibold text-[#20251f] capitalize">
                    {memory.temporality}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-black/10">
                  <span className="text-[#72776f]">Source Type</span>
                  <span className="font-mono font-semibold text-[#20251f] capitalize">
                    {memory.source_type}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-black/10">
                  <span className="text-[#72776f]">Created</span>
                  <span className="font-mono text-[#899185]">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </span>
                </div>

                {memory.last_confirmed && (
                  <div className="flex justify-between py-2 border-b border-black/10">
                    <span className="text-[#72776f]">Last Confirmed</span>
                    <span className="font-mono text-[#899185]">
                      {new Date(memory.last_confirmed).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {memory.supersedes_id && (
                  <div className="flex justify-between py-2 border-b border-black/10">
                    <span className="text-[#72776f]">Supersedes</span>
                    <Link
                      href={`/memories/${memory.supersedes_id}`}
                      className="font-mono text-[#a58b3f] hover:underline"
                    >
                      {memory.supersedes_id}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="editorial-card p-6">
              <span className="editorial-tag">INTEGRATION USAGE</span>
              <h4 className="font-manrope font-semibold text-sm text-[#20251f] mt-1 mb-2">
                Agent Retrieval
              </h4>
              <p className="text-xs text-[#72776f] leading-relaxed">
                This memory is active in semantic search queries. When an AI agent queries topics related to {memory.type}, this entry is weighted into the generated context block.
              </p>
              <div className="mt-4">
                <Link href="/playground" className="btn-secondary py-1.5 px-3 text-xs w-full justify-center">
                  <span>Test in Query Playground</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function MemoryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f1f0ea] flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#a58b3f] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-[#72776f] font-mono">Loading memory inspector...</p>
          </div>
        </div>
      }
    >
      <MemoryDetailContent />
    </Suspense>
  );
}

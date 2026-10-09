'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { MemoryItem, MemoryStatus } from '@/lib/types';
import { 
  Search, 
  Filter, 
  BrainCircuit, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle,
  RotateCw,
  Plus
} from 'lucide-react';

const STATUS_TABS: { label: string; value: MemoryStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Pending Review', value: 'pending' },
  { label: 'Superseded', value: 'superseded' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Deleted', value: 'deleted' },
];

const CATEGORIES = [
  'All',
  'technical_preference',
  'communication_style',
  'project',
  'fact',
  'skill',
  'goal',
  'habit',
  'other',
];

export default function MemoriesPage() {
  const [status, setStatus] = useState<MemoryStatus>('active');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await api.listMemories(status, 50, 0);
      setMemories(res.memories || []);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to fetch memories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [status]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleConfirm = async (id: string) => {
    setActionLoading(id);
    try {
      await api.reviewMemory(id, 'confirm');
      showToast('Memory confirmed and marked as active.');
      fetchMemories();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Confirmation failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await api.reviewMemory(id, 'reject');
      showToast('Memory candidate rejected.');
      fetchMemories();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Rejection failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    setActionLoading(id);
    try {
      await api.deleteMemory(id);
      showToast('Memory deleted.');
      fetchMemories();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMemory || !editContent.trim()) return;
    setActionLoading(editingMemory.id);
    try {
      await api.reviewMemory(editingMemory.id, 'edit', editContent);
      showToast('Memory updated with new version.');
      setEditingMemory(null);
      fetchMemories();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Edit failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter memories locally by search and category
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesSearch =
        m.content.toLowerCase().includes(search.toLowerCase()) ||
        m.type.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || m.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [memories, search, selectedCategory]);

  return (
    <AppShell
      title="Memories Registry"
      subtitle="Inspect, edit, and confirm durable intelligence extracted from your conversations."
      action={
        <Link href="/playground" className="btn-primary text-xs py-1.5 px-3">
          <span>Test in Playground</span>
          <span>↗</span>
        </Link>
      }
    >
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-red-900 text-red-100 border-red-700'
          }`}
        >
          {notification.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Edit Modal */}
      {editingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="editorial-card p-6 max-w-lg w-full bg-[#f5f3e9] space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-manrope font-semibold text-base text-[#20251f]">
                Edit Memory Content
              </h3>
              <button onClick={() => setEditingMemory(null)} className="text-[#72776f] hover:text-[#20251f]">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#72776f]">
              Editing will record a new superseding version, retaining the original record and evidence citations in history.
            </p>

            <textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 rounded-lg border border-black/15 bg-white text-sm text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingMemory(null)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading === editingMemory.id}
                className="btn-primary py-1.5 px-4 text-xs"
              >
                {actionLoading === editingMemory.id ? 'Saving...' : 'Save & Replace'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-4 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === tab.value
                ? 'bg-[#232923] text-white shadow-sm'
                : 'text-[#5e655e] hover:bg-black/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories or tags..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-black/15 bg-white/70 text-xs text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-black/35 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-[#899185] shrink-0" />
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors shrink-0 capitalize ${
                  selectedCategory === cat
                    ? 'bg-[#e7cc73] text-[#20251f] border-[#b3984c] font-semibold'
                    : 'bg-white/50 text-[#72776f] border-black/10 hover:bg-white'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memories Listing */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RotateCw size={24} className="animate-spin mx-auto text-[#a58b3f]" />
          <p className="text-xs text-[#72776f] font-mono">Loading memories registry...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="editorial-card p-12 text-center space-y-3">
          <BrainCircuit size={36} className="mx-auto text-[#899185]" />
          <h3 className="font-manrope font-semibold text-lg text-[#20251f]">
            No {status} memories found
          </h3>
          <p className="text-xs text-[#72776f] max-w-sm mx-auto">
            {search || selectedCategory !== 'All'
              ? 'Try modifying your search query or category filters.'
              : 'Import conversations to extract durable memories into your profile.'}
          </p>
          <div className="pt-2">
            <Link href="/imports" className="btn-primary py-2 px-4 text-xs">
              Go to Import Chats
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              className="editorial-card p-5 transition-all hover:border-[#b3984c]/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Category and badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black/5 text-[#20251f] font-semibold">
                      {m.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {Math.round((m.confidence || 0) * 100)}% Confidence
                    </span>
                    <span className="text-[10px] font-mono text-[#72776f] px-2 py-0.5 rounded bg-black/5">
                      Importance: {Math.round((m.importance || 0) * 10)}/10
                    </span>
                    <span className="text-[10px] font-mono text-[#899185]">
                      {m.temporality}
                    </span>
                  </div>

                  {/* Memory content */}
                  <p className="text-[14px] text-[#20251f] font-medium leading-relaxed">
                    {m.content}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-[#899185] font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Created: {new Date(m.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Source: {m.source_type}</span>
                    {m.conflict_id && (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Resolved conflict
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  <Link
                    href={`/memories/${m.id}`}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                    title="View Evidence & Provenance"
                  >
                    <span>Evidence</span>
                    <ArrowUpRight size={13} className="text-[#a58b3f]" />
                  </Link>

                  {status === 'pending' && (
                    <button
                      onClick={() => handleConfirm(m.id)}
                      disabled={actionLoading === m.id}
                      className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      title="Confirm memory"
                    >
                      <Check size={15} />
                    </button>
                  )}

                  {status !== 'rejected' && status !== 'deleted' && (
                    <button
                      onClick={() => {
                        setEditingMemory(m);
                        setEditContent(m.content);
                      }}
                      className="p-1.5 rounded-md hover:bg-black/5 text-[#5e655e]"
                      title="Edit memory"
                    >
                      <Edit3 size={15} />
                    </button>
                  )}

                  {status === 'pending' && (
                    <button
                      onClick={() => handleReject(m.id)}
                      disabled={actionLoading === m.id}
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-600 border border-red-200"
                      title="Reject candidate"
                    >
                      <X size={15} />
                    </button>
                  )}

                  {status !== 'deleted' && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={actionLoading === m.id}
                      className="p-1.5 rounded-md hover:bg-red-50 text-[#899185] hover:text-red-700"
                      title="Delete memory"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

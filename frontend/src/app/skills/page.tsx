'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { SkillItem } from '@/lib/types';
import { 
  Sparkles, 
  Plus, 
  FileDown, 
  Copy, 
  Check, 
  RotateCw, 
  ExternalLink, 
  BrainCircuit, 
  Code, 
  ShoppingBag,
  ArrowRight,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newQuery, setNewQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await api.listSkills();
      setSkills(res.skills || []);
      if (res.skills && res.skills.length > 0 && !selectedSkill) {
        setSelectedSkill(res.skills[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newQuery.trim()) return;

    setGenerating(true);
    try {
      const generated = await api.generateSkill(newTitle, newQuery);
      setSkills((prev) => [generated, ...prev]);
      setSelectedSkill(generated);
      setCreateModalOpen(false);
      setNewTitle('');
      setNewQuery('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Skill generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyMarkdown = (markdown: string, id: string) => {
    navigator.clipboard.writeText(markdown);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportFile = (skill: SkillItem) => {
    const blob = new Blob([skill.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      title="Reusable AI Skills"
      subtitle="Compile verified memory insights into exportable, reusable AI skill definitions."
      action={
        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Generate New Skill</span>
        </button>
      }
    >
      {/* Create Skill Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="editorial-card p-6 sm:p-8 max-w-lg w-full bg-[#f5f3e9] space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#a58b3f]" />
                <h3 className="font-manrope font-semibold text-lg text-[#20251f]">
                  Generate AI Skill Artifact
                </h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-[#72776f] hover:text-[#20251f]">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#72776f]">
              BearIQ queries your validated memory embeddings and uses the backend LLM skill generator to produce an exportable Markdown persona definition.
            </p>

            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#657066] mb-1">
                  Skill Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Python Backend Architecture Specialist"
                  className="w-full px-3.5 py-2 rounded-lg border border-black/15 bg-white text-xs text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#657066] mb-1">
                  Focus Query (Filters Source Memories)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  placeholder="e.g. FastAPI architecture, Pydantic validation, database transactions"
                  className="w-full p-3 rounded-lg border border-black/15 bg-white text-xs text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="btn-primary py-1.5 px-4 text-xs flex items-center gap-2"
                >
                  {generating ? <RotateCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>{generating ? 'Generating via Backend...' : 'Compile Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RotateCw size={24} className="animate-spin mx-auto text-[#a58b3f]" />
          <p className="text-xs text-[#72776f] font-mono">Loading skills library...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="editorial-card p-12 text-center space-y-3">
          <Sparkles size={36} className="mx-auto text-[#899185]" />
          <h3 className="font-manrope font-semibold text-lg text-[#20251f]">
            No AI Skills Generated Yet
          </h3>
          <p className="text-xs text-[#72776f] max-w-sm mx-auto">
            Generate your first reusable skill by combining your active memories into a modular directive file.
          </p>
          <div className="pt-2">
            <button onClick={() => setCreateModalOpen(true)} className="btn-primary py-2 px-4 text-xs">
              Generate Your First Skill
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Skill selector list */}
          <div className="lg:col-span-5 space-y-3">
            <span className="editorial-tag block mb-1">SKILL DIRECTORY</span>
            {skills.map((s) => {
              const active = selectedSkill?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSkill(s)}
                  className={`editorial-card p-4 cursor-pointer transition-all ${
                    active ? 'border-[#b3984c] shadow-md bg-white' : 'hover:border-black/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-manrope font-semibold text-sm text-[#20251f]">
                      {s.title}
                    </h4>
                    <span className="text-[10px] font-mono text-[#899185] shrink-0 bg-black/5 px-1.5 py-0.5 rounded">
                      {s.memory_ids?.length || 0} memories
                    </span>
                  </div>

                  <p className="text-xs text-[#72776f] mt-1.5 line-clamp-2 leading-relaxed">
                    {s.markdown.replace(/^[#\s]+/, '').substring(0, 120)}...
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#899185] mt-3 pt-2 border-t border-black/5">
                    <span>ID: {s.id.substring(0, 12)}</span>
                    <span className="text-[#a58b3f] font-medium flex items-center gap-1">
                      <span>View Definition</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skill detail preview */}
          <div className="lg:col-span-7">
            {selectedSkill ? (
              <div className="editorial-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
                  <div>
                    <span className="editorial-tag">COMPILED ARTIFACT</span>
                    <h3 className="font-manrope font-bold text-xl text-[#20251f] mt-1">
                      {selectedSkill.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyMarkdown(selectedSkill.markdown, selectedSkill.id)}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                      title="Copy markdown text"
                    >
                      {copiedId === selectedSkill.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedId === selectedSkill.id ? 'Copied' : 'Copy MD'}</span>
                    </button>

                    <button
                      onClick={() => handleExportFile(selectedSkill)}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                      title="Export as .md file"
                    >
                      <FileDown size={13} />
                      <span>Export .md</span>
                    </button>

                    <Link
                      href="/marketplace"
                      className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                      title="Publish to Marketplace"
                    >
                      <ShoppingBag size={13} />
                      <span>Publish</span>
                    </Link>
                  </div>
                </div>

                {/* Markdown Viewer */}
                <div className="bg-[#18201a] text-[#d6dfd7] p-6 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">{selectedSkill.markdown}</pre>
                </div>

                {/* Source Memories linked */}
                {selectedSkill.memory_ids && selectedSkill.memory_ids.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-[#899185] uppercase block mb-2">
                      Linked Source Memory IDs:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.memory_ids.map((mid) => (
                        <Link
                          key={mid}
                          href={`/memories/${mid}`}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white border border-black/10 hover:border-[#b3984c] text-[#20251f] flex items-center gap-1 transition-colors"
                        >
                          <span>{mid}</span>
                          <ExternalLink size={10} className="text-[#a58b3f]" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AppShell>
  );
}

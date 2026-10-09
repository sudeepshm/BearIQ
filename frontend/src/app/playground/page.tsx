'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { MemoryItem } from '@/lib/types';
import { 
  TerminalSquare, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCw, 
  BrainCircuit, 
  Layers, 
  Code2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const EXAMPLE_QUERIES = [
  'Help me design a backend using my preferences.',
  'What are my coding habits and preferred languages?',
  'What is the status and vision of BearIQ?',
  'What database solutions do I prefer for embeddings?'
];

export default function PlaygroundPage() {
  const [query, setQuery] = useState('Help me design a backend using my preferences.');
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[] | null>(null);
  const [contextBlock, setContextBlock] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'memories' | 'context' | 'prompt'>('memories');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Execute both query retrieval and context builder from backend
      const [memRes, ctxRes] = await Promise.all([
        api.queryMemories(query, 10),
        api.getContext(query)
      ]);

      setMemories(memRes.memories || []);
      setContextBlock(typeof ctxRes === 'string' ? ctxRes : JSON.stringify(ctxRes, null, 2));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell
      title="Memory Query Playground"
      subtitle="Simulate agent retrieval requests, test semantic similarity, and preview assembled LLM context."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input and Example Prompts */}
        <div className="space-y-6">
          <div className="editorial-card p-6">
            <span className="editorial-tag">SIMULATE AGENT REQUEST</span>
            <h3 className="font-manrope font-semibold text-base text-[#20251f] mt-1 mb-4">
              Query Input
            </h3>

            <form onSubmit={handleExecute} className="space-y-4">
              <div>
                <textarea
                  rows={4}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Help me design a backend using my preferences."
                  className="w-full p-3.5 rounded-xl border border-black/15 bg-white text-sm text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
              >
                {loading ? <RotateCw size={14} className="animate-spin" /> : <TerminalSquare size={14} />}
                <span>{loading ? 'Retrieving Memories...' : 'Execute Memory Query'}</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-black/10">
              <span className="text-[11px] font-mono text-[#899185] block mb-2 uppercase">
                Example Developer Queries:
              </span>
              <div className="space-y-1.5">
                {EXAMPLE_QUERIES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(ex);
                    }}
                    className="w-full text-left text-xs p-2 rounded-lg bg-black/[0.03] hover:bg-black/[0.07] text-[#4b544d] transition-colors truncate"
                  >
                    &ldquo;{ex}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="editorial-card p-6">
            <span className="editorial-tag">ENDPOINT SPECS</span>
            <h4 className="font-manrope font-semibold text-sm text-[#20251f] mt-1 mb-2">
              POST /api/memories/query
            </h4>
            <p className="text-xs text-[#72776f] leading-relaxed">
              This request embeds the query vector and computes cosine distance against all active memories in the user scope.
            </p>
          </div>
        </div>

        {/* Right Column: Output Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="editorial-card p-6">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('memories')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'memories'
                      ? 'bg-[#232923] text-white'
                      : 'text-[#5e655e] hover:bg-black/5'
                  }`}
                >
                  Retrieved Memories ({memories?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('context')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'context'
                      ? 'bg-[#232923] text-white'
                      : 'text-[#5e655e] hover:bg-black/5'
                  }`}
                >
                  Assembled Context
                </button>
                <button
                  onClick={() => setActiveTab('prompt')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'prompt'
                      ? 'bg-[#232923] text-white'
                      : 'text-[#5e655e] hover:bg-black/5'
                  }`}
                >
                  Agent Prompt Injection
                </button>
              </div>

              {contextBlock && (
                <button
                  onClick={() => handleCopy(contextBlock)}
                  className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
                  title="Copy context payload"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-24 text-center space-y-3">
                <RotateCw size={24} className="animate-spin mx-auto text-[#a58b3f]" />
                <p className="text-xs text-[#72776f] font-mono">
                  Calculating vector similarities and assembling context...
                </p>
              </div>
            ) : memories === null ? (
              <div className="py-20 text-center space-y-3">
                <TerminalSquare size={36} className="mx-auto text-[#899185]" />
                <h4 className="font-manrope font-semibold text-base text-[#20251f]">
                  Playground Ready
                </h4>
                <p className="text-xs text-[#72776f] max-w-sm mx-auto">
                  Click &ldquo;Execute Memory Query&rdquo; or choose an example query from the sidebar to inspect real retrieval.
                </p>
              </div>
            ) : activeTab === 'memories' ? (
              memories.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#72776f]">
                  No relevant memories matched this query above threshold.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {memories.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-4 rounded-xl border border-black/10 bg-white/70 space-y-2 hover:border-[#b3984c]/50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="uppercase text-[#a58b3f] font-semibold">
                          #{idx + 1} • {m.type.replace('_', ' ')}
                        </span>
                        {m.similarity && (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Sim: {(m.similarity * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#20251f] font-medium leading-relaxed">
                        {m.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#899185] pt-1">
                        <span>Confidence: {Math.round((m.confidence || 0) * 100)}%</span>
                        <Link
                          href={`/memories/${m.id}`}
                          className="text-[#a58b3f] hover:underline flex items-center gap-1"
                        >
                          <span>Inspect Evidence</span>
                          <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'context' ? (
              <div className="bg-[#18201a] text-[#ededed] p-5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
                <pre>{contextBlock || 'No context assembled.'}</pre>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#72776f]">
                  Here is how the assembled context looks when prefixed into an LLM system prompt:
                </p>
                <div className="bg-[#0c120d] text-[#c3cebe] p-5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-white/10">
                  <pre>{`SYSTEM PROMPT:
You are an expert AI paired with the user.
Adhere strictly to the user's verified persistent long-term memories below:

--- BEARIQ USER CONTEXT ---
${contextBlock}
---------------------------

Now proceed to assist the user with their request:
"${query}"`}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

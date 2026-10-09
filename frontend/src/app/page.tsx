'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import NeuralCanvas from '@/components/canvas/NeuralCanvas';
import { 
  ArrowUpRight, 
  BrainCircuit, 
  ShieldCheck, 
  Sparkles, 
  FileCode2, 
  Layers, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Check,
  ChevronRight,
  Terminal
} from 'lucide-react';

export default function LandingPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const copyCode = () => {
    navigator.clipboard.writeText(`import requests

response = requests.post(
    "http://localhost:8000/api/context",
    headers={"Authorization": "Bearer YOUR_BEARIQ_TOKEN"},
    json={"query": "Design a clean backend API following my coding habits"}
)

print(response.json())`);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#e7cc73] selection:text-[#171914]">
      {/* Header */}
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto min-h-[730px] px-6 sm:px-12 pt-12 sm:pt-16 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_1.06fr] items-center gap-12 sm:gap-14">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[2.5px] uppercase text-[#657066] font-semibold">
              <span className="gold-dot" />
              <span>Intelligence, distinctly yours.</span>
            </div>

            <h1 className="font-manrope font-extrabold text-[62px] sm:text-[88px] xl:text-[104px] tracking-tight leading-[0.98] uppercase my-6 text-[#20251f]">
              Bear<span className="text-[#b3984c]">IQ</span>
            </h1>

            <h2 className="font-manrope font-medium text-[30px] sm:text-[42px] leading-[1.2] tracking-tight text-[#20251f] max-w-lg">
              Carry your personal<br />
              <em className="not-italic text-[#303d39] relative inline-block">
                AI layer
                <span className="absolute bottom-1 left-0 right-0 h-2 bg-[#dbc46570] -z-10" />
              </em>{' '}
              anywhere.
            </h2>

            <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#72776f] max-w-md my-6">
              Your knowledge. Your perspective. Your expertise.<br />
              BearIQ transforms your conversation history into evidence-backed, reusable memory for any AI application.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/dashboard" className="btn-primary text-[13px] py-3.5 px-6">
                <span>Explore your AI layer</span>
                <span>↗</span>
              </Link>
              <a 
                href="#how-it-works" 
                className="btn-secondary text-[13px] py-3.5 px-5"
              >
                <span>How it works</span>
                <span>▷</span>
              </a>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#868b82] mt-8">
              <ShieldCheck size={14} className="text-[#a58b3f]" />
              <span>100% private, client-owned evidence and exportable AI skills.</span>
            </div>
          </div>

          {/* Interactive Neural Canvas Visualizer */}
          <div className="w-full">
            <NeuralCanvas />
          </div>
        </section>

        {/* Dynamic Ticker */}
        <div className="bg-[#e5e5dc]/60 border-y border-[#23302612] py-5 px-6 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-[10px] sm:text-[11px] uppercase tracking-[1.8px] text-[#687168] font-mono">
          <span>One source of intelligence</span>
          <i className="not-italic text-[#ad944c] text-sm">✦</i>
          <span>Anywhere you go</span>
          <i className="not-italic text-[#ad944c] text-sm">✦</i>
          <span>Your expertise, amplified</span>
          <i className="not-italic text-[#ad944c] text-sm hidden sm:inline">✦</i>
          <span className="hidden sm:inline">Evidence-backed memories</span>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-[1440px] mx-auto py-20 px-6 sm:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-[2.5px] uppercase text-[#657066] font-semibold">
                <span className="gold-dot" />
                <span>End-to-End Workflow</span>
              </div>
              <h2 className="font-manrope font-semibold text-[32px] sm:text-[42px] tracking-tight text-[#29322b] mt-3">
                What you know.<br />Wherever you need it.
              </h2>
            </div>
            <p className="text-[13px] text-[#747d74] leading-relaxed max-w-sm">
              It begins with your exported ChatGPT conversations. BearIQ parses, de-duplicates, classifies, and indexes your real insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="editorial-card p-8">
              <span className="editorial-tag">01 / INGESTION</span>
              <h3 className="font-manrope font-semibold text-2xl text-[#29372c] mt-4 mb-3">
                Import Chat History
              </h3>
              <p className="text-[13px] text-[#758072] leading-relaxed">
                Drop your standard ChatGPT data export ZIP archive. Our streaming validator parses thousands of messages with bounded memory overhead.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[11px] text-[#a58b3f] font-medium font-mono">
                <span>ZIP PARSER</span>
                <span>→</span>
                <span>HYBRID CHUNKER</span>
              </div>
            </div>

            <div className="editorial-card p-8">
              <span className="editorial-tag">02 / VALIDATION</span>
              <h3 className="font-manrope font-semibold text-2xl text-[#29372c] mt-4 mb-3">
                Evidence-Backed Memories
              </h3>
              <p className="text-[13px] text-[#758072] leading-relaxed">
                Every extracted memory links directly to supporting message quotes. Review, edit, confirm, or reject candidates with full provenance.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[11px] text-[#a58b3f] font-medium font-mono">
                <span>CONFIDENCE SCORING</span>
                <span>→</span>
                <span>DEDUPLICATION</span>
              </div>
            </div>

            <div className="editorial-card p-8">
              <span className="editorial-tag">03 / APPLICATION</span>
              <h3 className="font-manrope font-semibold text-2xl text-[#29372c] mt-4 mb-3">
                Reuse & Sell Skills
              </h3>
              <p className="text-[13px] text-[#758072] leading-relaxed">
                Inject structured context into Claude, Cursor, or Gemini via API. Package your verified expertise into exportable, monetizeable AI skills.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[11px] text-[#a58b3f] font-medium font-mono">
                <span>SEMANTIC QUERY</span>
                <span>→</span>
                <span>SKILL MARKETPLACE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards: Store vs Sell Expertise */}
        <section className="max-w-[1440px] mx-auto py-12 px-6 sm:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="editorial-card p-10 relative overflow-hidden group">
              <span className="editorial-tag">01 / YOUR KNOWLEDGE</span>
              <span className="absolute right-8 top-8 text-[#a78b3d] text-3xl">◈</span>
              <h3 className="font-manrope font-semibold text-3xl text-[#29372c] mt-6 mb-3">
                A platform to store your expertise.
              </h3>
              <p className="text-[14px] text-[#758072] leading-relaxed max-w-md">
                Give your experience, code patterns, and specialist knowledge a home of their own. Your personal AI layer moves with you across platforms.
              </p>
              <div className="mt-8">
                <Link href="/memories" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#475b46] hover:text-[#20251f]">
                  <span>Explore memory catalog</span>
                  <ArrowUpRight size={14} className="text-[#a58b3f]" />
                </Link>
              </div>
            </article>

            <article className="editorial-card p-10 relative overflow-hidden group">
              <span className="editorial-tag">02 / YOUR OPPORTUNITY</span>
              <span className="absolute right-8 top-8 text-[#a78b3d] text-3xl">↗</span>
              <h3 className="font-manrope font-semibold text-3xl text-[#29372c] mt-6 mb-3">
                Sell Your Expertise.
              </h3>
              <p className="text-[14px] text-[#758072] leading-relaxed max-w-md">
                Turn what you know into reusable AI skills that others can purchase and install in their workflows. Complete control over what remains private.
              </p>
              <div className="mt-8">
                <Link href="/marketplace" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#475b46] hover:text-[#20251f]">
                  <span>Browse skills marketplace</span>
                  <ArrowUpRight size={14} className="text-[#a58b3f]" />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Developer Integration Code Preview */}
        <section id="features" className="max-w-[1440px] mx-auto py-16 px-6 sm:px-12">
          <div className="bg-[#18201a] text-[#ededed] rounded-2xl p-8 sm:p-12 border border-white/10 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-10 items-start justify-between">
              <div className="max-w-lg">
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#e7cc73] uppercase">
                  <Terminal size={14} />
                  <span>Developer API</span>
                </div>
                <h3 className="font-manrope font-bold text-3xl sm:text-4xl mt-3 tracking-tight text-white">
                  Query your memories in two lines of code.
                </h3>
                <p className="text-[13px] text-[#a7b2a9] mt-4 leading-relaxed">
                  Integrate BearIQ directly into your agentic loops, prompt pipelines, or CLI coding assistants.
                  Memories are fetched semantically using cosine distance over vector embeddings with hybrid temporal filtering.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3 text-[13px] text-[#d1d8d2]">
                    <CheckCircle2 size={16} className="text-[#e7cc73]" />
                    <span>Bounded request limits & HMAC API token auth</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-[#d1d8d2]">
                    <CheckCircle2 size={16} className="text-[#e7cc73]" />
                    <span>Sub-50ms vector similarity lookups</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-[#d1d8d2]">
                    <CheckCircle2 size={16} className="text-[#e7cc73]" />
                    <span>Formatted Markdown context builder for LLM system prompts</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link href="/integrations" className="btn-primary py-2.5 px-5 text-[12px]">
                    <span>View API Reference</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Code window */}
              <div className="w-full lg:max-w-xl bg-[#0c120d] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="h-10 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="text-[11px] font-mono text-[#8b968d] ml-2">agent_context.py</span>
                  </div>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-[11px] text-[#a7b2a9] hover:text-white transition-colors"
                  >
                    {copiedSnippet ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-5 text-[12px] sm:text-[13px] font-mono leading-relaxed text-[#c3cebe] overflow-x-auto">
{`import requests

# 1. Fetch relevant memory context for the incoming prompt
response = requests.post(
    "http://localhost:8000/api/context",
    headers={"Authorization": "Bearer YOUR_BEARIQ_TOKEN"},
    json={"query": "Design a clean backend API following my coding habits"}
)

context_block = response.json()

# 2. Inject directly into system prompt:
system_prompt = f"""You are paired with the user.
Here is their verified long-term memory:
{context_block}"""`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-[1440px] mx-auto py-20 px-6 sm:px-12 border-t border-[#273b251b]">
          <div className="editorial-card p-10 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h3 className="font-manrope font-bold text-3xl sm:text-4xl text-[#29322b] tracking-tight">
                Your next layer of intelligence starts now.
              </h3>
              <p className="text-[14px] text-[#72776f] mt-2">
                Import your chat history in seconds and inspect your memories with zero vendor lock-in.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="btn-dark py-3.5 px-6 text-[13px]">
                <span>Launch BearIQ</span>
                <span className="text-[#e7cc73]">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#23302617] max-w-[1440px] mx-auto px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8b9287]">
        <div className="flex items-center gap-3">
          <span className="font-manrope font-bold text-[#424c3e] text-base uppercase">
            Bear<span className="text-[#a78b3d]">IQ</span>
          </span>
          <span>Personal intelligence. Infinite possibility.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/integrations" className="hover:text-[#20251f]">API Documentation</Link>
          <Link href="/settings" className="hover:text-[#20251f]">Privacy & Security</Link>
          <span>© 2026 BearIQ. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

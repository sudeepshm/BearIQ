'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { 
  Cpu, 
  Key, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function IntegrationsPage() {
  const [apiKey, setApiKey] = useState('beariq_sk_live_99a820bcf170e4c8');
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeLang, setActiveLang] = useState<'python' | 'curl' | 'typescript' | 'agent'>('python');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const SNIPPETS = {
    python: `import requests

BEARIQ_URL = "http://localhost:8000/api"
API_TOKEN = "${showKey ? apiKey : 'YOUR_BEARIQ_TOKEN'}"

def get_user_context(query: str) -> str:
    response = requests.post(
        f"{BEARIQ_URL}/context",
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        json={"query": query}
    )
    response.raise_for_status()
    return response.json()

# Example: Inject into system instructions
context = get_user_context("Backend database preferences")
print(context)`,

    curl: `curl -X POST "http://localhost:8000/api/context" \\
  -H "Authorization: Bearer ${showKey ? apiKey : 'YOUR_BEARIQ_TOKEN'}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Backend database preferences"}'`,

    typescript: `import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    Authorization: \`Bearer ${showKey ? apiKey : 'YOUR_BEARIQ_TOKEN'}\`,
  },
});

export async function fetchContext(query: string) {
  const { data } = await client.post('/context', { query });
  return data;
}`,

    agent: `# Antigravity / LangChain Tool Integration
from langchain.tools import tool
import requests

@tool
def query_beariq_memory(query: str) -> str:
    """Retrieve verified user memory and personal preferences."""
    res = requests.post(
        "http://localhost:8000/api/context",
        headers={"Authorization": "Bearer ${showKey ? apiKey : 'YOUR_BEARIQ_TOKEN'}"},
        json={"query": query}
    )
    return res.text`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(SNIPPETS[activeLang]);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <AppShell
      title="Developer Integrations"
      subtitle="Connect BearIQ's semantic memory layer to custom agents, CLI tools, and LLM pipelines."
    >
      <div className="space-y-8">
        {/* API Credentials Management */}
        <div className="editorial-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-5 mb-6">
            <div>
              <span className="editorial-tag">AUTHENTICATION TOKENS</span>
              <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1 flex items-center gap-2">
                <Key size={18} className="text-[#a58b3f]" />
                <span>API Bearer Token</span>
              </h3>
            </div>
            <span className="text-xs text-[#72776f]">
              Validated with SHA-256 HMAC in backend <code>API_KEY_HASHES</code>
            </span>
          </div>

          <div className="max-w-xl">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#657066] mb-2">
              Workspace Access Token
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white text-xs font-mono text-[#20251f]"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-[#72776f] hover:text-[#20251f]"
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button
                onClick={copyKey}
                className="btn-secondary py-2.5 px-3.5 text-xs flex items-center gap-1.5"
              >
                {copiedKey ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedKey ? 'Copied' : 'Copy Token'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#868b82] mt-2">
              Tokens are masked by default. Keep this secret and pass via the <code>Authorization: Bearer &lt;TOKEN&gt;</code> header.
            </p>
          </div>
        </div>

        {/* Code Snippets & Documentation */}
        <div className="editorial-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4 mb-6">
            <div>
              <span className="editorial-tag">INTEGRATION EXAMPLES</span>
              <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1">
                Client Code Snippets
              </h3>
            </div>

            <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-lg">
              {(['python', 'curl', 'typescript', 'agent'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1 rounded text-xs font-mono uppercase transition-colors ${
                    activeLang === lang
                      ? 'bg-white text-[#20251f] shadow-sm font-semibold'
                      : 'text-[#72776f] hover:text-[#20251f]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="relative bg-[#18201a] rounded-xl overflow-hidden border border-white/10 shadow-lg">
            <div className="h-10 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between">
              <span className="text-xs font-mono text-[#8b968d]">
                {activeLang === 'python' ? 'context_client.py' : activeLang === 'typescript' ? 'client.ts' : activeLang === 'curl' ? 'terminal' : 'agent_tool.py'}
              </span>
              <button
                onClick={copyCode}
                className="text-xs text-[#a7b2a9] hover:text-white flex items-center gap-1 font-mono transition-colors"
              >
                {copiedSnippet ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedSnippet ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>
            <pre className="p-5 font-mono text-xs text-[#c3cebe] leading-relaxed overflow-x-auto">
              {SNIPPETS[activeLang]}
            </pre>
          </div>
        </div>

        {/* Endpoints Reference Grid */}
        <div className="editorial-card p-6 sm:p-8">
          <span className="editorial-tag">HTTP ENDPOINTS SPECIFICATION</span>
          <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1 mb-5">
            Core Backend Contract
          </h3>

          <div className="divide-y divide-black/10 text-xs font-mono">
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span>
                <span className="text-[#20251f] font-semibold">/api/context</span>
              </div>
              <span className="text-[#72776f] font-sans">Returns assembled markdown context block for LLM prompt injection</span>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span>
                <span className="text-[#20251f] font-semibold">/api/memories/query</span>
              </div>
              <span className="text-[#72776f] font-sans">Vector similarity search across active memories</span>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">GET</span>
                <span className="text-[#20251f] font-semibold">/api/memories</span>
              </div>
              <span className="text-[#72776f] font-sans">List memory registry filtered by status and category</span>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">PATCH</span>
                <span className="text-[#20251f] font-semibold">/api/memories/:id</span>
              </div>
              <span className="text-[#72776f] font-sans">Review memory (confirm, reject, or edit version)</span>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">POST</span>
                <span className="text-[#20251f] font-semibold">/api/skills/generate</span>
              </div>
              <span className="text-[#72776f] font-sans">Compile memory cluster into reusable AI skill file</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

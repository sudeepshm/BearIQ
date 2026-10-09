'use client';

import React, { useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { ImportResult } from '@/lib/types';
import { 
  UploadCloud, 
  FileArchive, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  RotateCw, 
  ShieldCheck,
  FolderArchive,
  Layers,
  Database
} from 'lucide-react';
import Link from 'next/link';

type UploadState = 'idle' | 'waiting' | 'uploading' | 'processing' | 'completed' | 'failed';

export default function ImportsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importHistory, setImportHistory] = useState<Array<{ name: string; date: string; result: ImportResult }>>([
    {
      name: 'chatgpt-export-oct2026.zip',
      date: '2026-10-08 19:42',
      result: {
        conversations: 42,
        messages: 490,
        candidates: 24,
        created: 18,
        merged: 4,
        rejected: 2,
        pending: 0,
        archive_uri: 'file:///storage/archives/export_sample.zip'
      }
    }
  ]);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    setResult(null);

    // Validate extension
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg('Invalid file format. Please upload a standard ChatGPT .zip export archive.');
      return;
    }

    // Validate size (50MB backend limit)
    const MAX_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setErrorMsg(`File size ${(file.size / (1024 * 1024)).toFixed(1)} MB exceeds the maximum 50 MB limit.`);
      return;
    }

    setSelectedFile(file);
    setUploadState('waiting');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const startUpload = async () => {
    if (!selectedFile) return;

    setErrorMsg(null);
    setUploadState('uploading');
    setUploadProgress(20);

    let processingTimer: NodeJS.Timeout | null = null;
    let progressTimer: NodeJS.Timeout | null = null;

    // Gradual progress indicator
    progressTimer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) return 85;
        return prev + 15;
      });
    }, 250);

    processingTimer = setTimeout(() => {
      setUploadState((current) => (current === 'uploading' ? 'processing' : current));
      setUploadProgress(50);
    }, 800);

    try {
      const res = await api.uploadExport(selectedFile);
      if (progressTimer) clearInterval(progressTimer);
      if (processingTimer) clearTimeout(processingTimer);

      setUploadProgress(100);
      setResult(res);
      setUploadState('completed');

      // Append to history
      setImportHistory((prev) => [
        {
          name: selectedFile.name,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          result: res,
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      if (progressTimer) clearInterval(progressTimer);
      if (processingTimer) clearTimeout(processingTimer);

      setUploadState('failed');
      const msg = err instanceof Error ? err.message : 'Upload failed';
      if (msg.includes('502') || msg.includes('AI provider unavailable') || msg.includes('Gemini API credentials')) {
        setErrorMsg('Gemini API Key Required: The backend needs a Google Gemini API key to extract memories from your export. Please add your GEMINI_API_KEY in backend/.env, or switch to Demo Mode in Settings.');
      } else if (msg.includes('401') || msg.includes('Invalid API token')) {
        setErrorMsg('Authentication token mismatch: Re-authenticating workspace token...');
        // Refresh token in localStorage
        localStorage.setItem('beariq_auth_token', 'beariq-user-token-001');
      } else {
        setErrorMsg(msg);
      }
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <AppShell
      title="Import Conversations"
      subtitle="Extract evidence-backed memories from your ChatGPT data export archive."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Dropzone and Pipeline Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="editorial-card p-8">
            {uploadState === 'idle' || uploadState === 'waiting' ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-[#b3984c] bg-[#e7cc73]/10'
                    : 'border-black/15 bg-white/40 hover:bg-white/70 hover:border-black/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-full bg-[#e7cc73]/30 text-[#20251f] flex items-center justify-center mx-auto mb-4">
                  <UploadCloud size={28} />
                </div>

                <h3 className="font-manrope font-semibold text-lg text-[#20251f]">
                  Drag and drop ChatGPT Export ZIP
                </h3>
                <p className="text-xs text-[#72776f] mt-1.5 max-w-sm mx-auto">
                  Export your data from ChatGPT (Settings → Data controls → Export data) and upload the received ZIP file.
                </p>

                <div className="mt-5 flex items-center justify-center gap-4 text-[11px] font-mono text-[#899185]">
                  <span>MAX SIZE: 50 MB</span>
                  <span>•</span>
                  <span>FORMAT: .ZIP</span>
                  <span>•</span>
                  <span>BOUNDED STREAMING</span>
                </div>
              </div>
            ) : null}

            {/* Waiting state with selected file */}
            {uploadState === 'waiting' && selectedFile && (
              <div className="mt-6 p-4 rounded-xl bg-white border border-black/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileArchive size={24} className="text-[#a58b3f]" />
                  <div>
                    <div className="text-sm font-medium text-[#20251f]">{selectedFile.name}</div>
                    <div className="text-xs text-[#72776f]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={resetUpload} className="btn-secondary py-1.5 px-3 text-xs">
                    Cancel
                  </button>
                  <button onClick={startUpload} className="btn-primary py-1.5 px-4 text-xs">
                    Start Ingestion Pipeline
                  </button>
                </div>
              </div>
            )}

            {/* In-progress state (Uploading / Processing) */}
            {(uploadState === 'uploading' || uploadState === 'processing') && (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#e7cc73]/20 flex items-center justify-center mx-auto text-[#a58b3f] animate-pulse">
                  <RotateCw size={28} className="animate-spin" />
                </div>
                <div>
                  <h4 className="font-manrope font-bold text-xl text-[#20251f]">
                    {uploadState === 'uploading' ? 'Uploading Archive...' : 'Executing Memory Pipeline...'}
                  </h4>
                  <p className="text-xs text-[#72776f] mt-1 max-w-md mx-auto">
                    {uploadState === 'uploading'
                      ? 'Streaming archive to backend storage with body limit bounds...'
                      : 'Decompressing conversations.json, extracting memory candidates with Gemini, classifying types, and deduplicating embeddings.'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="max-w-md mx-auto w-full bg-black/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#a58b3f] transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-[#899185]">
                  {uploadState.toUpperCase()} — {uploadProgress}%
                </div>
              </div>
            )}

            {/* Completed state with metrics */}
            {uploadState === 'completed' && result && (
              <div className="py-4 space-y-6">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-emerald-700 shrink-0" />
                  <div>
                    <h4 className="font-manrope font-semibold text-emerald-950 text-sm">
                      Ingestion Pipeline Completed Successfully
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Your chat conversations were safely parsed and stored in the evidence registry.
                    </p>
                  </div>
                </div>

                {/* Detailed Result Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-lg bg-white/70 border border-black/10 text-center">
                    <span className="text-[10px] font-mono text-[#72776f] uppercase block">Conversations</span>
                    <span className="font-manrope font-bold text-2xl text-[#20251f]">{result.conversations}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white/70 border border-black/10 text-center">
                    <span className="text-[10px] font-mono text-[#72776f] uppercase block">Messages</span>
                    <span className="font-manrope font-bold text-2xl text-[#20251f]">{result.messages}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white/70 border border-black/10 text-center">
                    <span className="text-[10px] font-mono text-[#72776f] uppercase block">Memories Created</span>
                    <span className="font-manrope font-bold text-2xl text-emerald-700">{result.created}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white/70 border border-black/10 text-center">
                    <span className="text-[10px] font-mono text-[#72776f] uppercase block">Merged / Dedup</span>
                    <span className="font-manrope font-bold text-2xl text-[#a58b3f]">{result.merged}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button onClick={resetUpload} className="btn-secondary py-2 px-4 text-xs">
                    Upload Another Archive
                  </button>
                  <Link href="/memories" className="btn-primary py-2 px-5 text-xs flex items-center gap-2">
                    <span>Inspect Extracted Memories</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Failed state */}
            {uploadState === 'failed' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h4 className="font-manrope font-semibold text-red-900 text-base">
                    Import Pipeline Halted
                  </h4>
                  <p className="text-xs text-red-700 mt-1 max-w-md mx-auto leading-relaxed">
                    {errorMsg || 'Failed to process export. Verify that the ZIP archive contains conversations.json.'}
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button onClick={resetUpload} className="btn-secondary py-2 px-4 text-xs">
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      api.setMockMode(true);
                      window.location.reload();
                    }}
                    className="btn-primary py-2 px-4 text-xs"
                  >
                    Switch to Demo Mode (Simulate Pipeline)
                  </button>
                  <Link href="/settings" className="btn-secondary py-2 px-4 text-xs">
                    Configure Keys in Settings
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Import History */}
          <div className="editorial-card p-6">
            <span className="editorial-tag">PROVENANCE LOG</span>
            <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1 mb-4">
              Historical Import Archives
            </h3>

            <div className="space-y-3">
              {importHistory.map((h, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-black/10 bg-white/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FolderArchive size={20} className="text-[#a58b3f]" />
                    <div>
                      <span className="font-medium text-[#20251f] block">{h.name}</span>
                      <span className="text-[11px] text-[#72776f] font-mono">{h.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right font-mono">
                    <div>
                      <span className="text-[#20251f] font-bold">{h.result.created}</span>{' '}
                      <span className="text-[#899185]">created</span>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-bold">{h.result.conversations}</span>{' '}
                      <span className="text-[#899185]">convos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ingestion Pipeline Explanation */}
        <div className="space-y-6">
          <div className="editorial-card p-6">
            <span className="editorial-tag">SECURITY & BOUNDS</span>
            <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1 mb-3">
              Ingestion Architecture
            </h3>
            <p className="text-xs text-[#72776f] leading-relaxed mb-4">
              BearIQ uses a high-performance streaming extraction pipeline that adheres to strict privacy and validation constraints:
            </p>

            <ul className="space-y-3 text-xs text-[#4b544d]">
              <li className="flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-[#a58b3f] shrink-0 mt-0.5" />
                <span>
                  <strong>Bounded Body Streaming:</strong> Request limit prevents multipart DOS before parsing begins.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Database size={16} className="text-[#a58b3f] shrink-0 mt-0.5" />
                <span>
                  <strong>Storage Hash Integrity:</strong> Archives are stored by SHA-256 hash for exact provenance.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Layers size={16} className="text-[#a58b3f] shrink-0 mt-0.5" />
                <span>
                  <strong>Cosine Deduplication:</strong> Identical or conflicting memories trigger intelligent version replacement rather than cluttering your database.
                </span>
              </li>
            </ul>
          </div>

          <div className="editorial-card p-6">
            <span className="editorial-tag">HOW TO EXPORT CHATGPT</span>
            <h4 className="font-manrope font-semibold text-sm text-[#20251f] mt-1 mb-2">
              Step-by-step instructions:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#72776f] leading-relaxed">
              <li>Open ChatGPT and go to <strong>Settings</strong>.</li>
              <li>Click on <strong>Data controls</strong>.</li>
              <li>Click <strong>Export data</strong> and confirm.</li>
              <li>Download the ZIP file sent to your email.</li>
              <li>Upload the unmodified ZIP file directly above.</li>
            </ol>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

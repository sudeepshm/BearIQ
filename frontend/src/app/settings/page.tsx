'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { 
  Settings as SettingsIcon, 
  Server, 
  Key, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Check, 
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [authToken, setAuthToken] = useState('beariq-user-token-001');
  const [isMock, setIsMock] = useState(false);
  const [userName, setUserName] = useState('Sudeep Sharma');
  const [userEmail, setUserEmail] = useState('sudeep@beariq.ai');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiUrl(localStorage.getItem('beariq_api_url') || 'http://localhost:8000');
      setAuthToken(localStorage.getItem('beariq_auth_token') || 'beariq-user-token-001');
      setUserName(localStorage.getItem('beariq_user_name') || 'Sudeep Sharma');
      setUserEmail(localStorage.getItem('beariq_user_email') || 'sudeep@beariq.ai');
      setIsMock(api.isMockMode());
    }
    checkBackend();
  }, []);

  const checkBackend = async () => {
    setBackendStatus('checking');
    const ok = await api.checkHealth();
    setBackendStatus(ok ? 'connected' : 'disconnected');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('beariq_api_url', apiUrl.trim());
    localStorage.setItem('beariq_auth_token', authToken.trim());
    localStorage.setItem('beariq_user_name', userName.trim());
    localStorage.setItem('beariq_user_email', userEmail.trim());
    api.setMockMode(isMock);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    checkBackend();
  };

  const handleExportData = () => {
    const data = {
      user: { name: userName, email: userEmail },
      exported_at: new Date().toISOString(),
      note: 'BearIQ portable memory profile'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beariq-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      title="Workspace Settings"
      subtitle="Configure API backend endpoints, authentication tokens, and privacy controls."
    >
      <div className="max-w-3xl space-y-8">
        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check size={16} />
            <span>Settings saved successfully.</span>
          </div>
        )}

        {/* Backend Connectivity Configuration */}
        <form onSubmit={handleSaveConfig} className="editorial-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <span className="editorial-tag">CONNECTION TARGET</span>
              <h3 className="font-manrope font-semibold text-lg text-[#20251f] mt-1 flex items-center gap-2">
                <Server size={18} className="text-[#a58b3f]" />
                <span>FastAPI Backend Endpoint</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={checkBackend}
                className="hover:text-black text-[#72776f] p-1"
                title="Re-check health"
              >
                <RefreshCw size={12} className={backendStatus === 'checking' ? 'animate-spin' : ''} />
              </button>
              <span className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-emerald-500' : backendStatus === 'checking' ? 'bg-amber-400' : 'bg-red-500'
              }`} />
              <span className="capitalize">{backendStatus}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#657066] mb-1.5 font-medium">
                Backend Base URL
              </label>
              <input
                type="text"
                required
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white text-xs font-mono text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
              />
              <span className="text-[11px] text-[#72776f] mt-1 block">
                The URL where your BearIQ FastAPI server is running (default: <code>http://localhost:8000</code>).
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#657066] mb-1.5 font-medium">
                Bearer Auth Token
              </label>
              <input
                type="password"
                required
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white text-xs font-mono text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
              />
              <span className="text-[11px] text-[#72776f] mt-1 block">
                Passed in the <code>Authorization: Bearer</code> header for all requests.
              </span>
            </div>

            {/* Mock Mode Switch */}
            <div className="pt-2 flex items-center justify-between p-3.5 rounded-xl bg-black/[0.03] border border-black/10">
              <div>
                <span className="text-xs font-semibold text-[#20251f] block">Isolated Demo Mode</span>
                <span className="text-[11px] text-[#72776f]">
                  Run frontend entirely in demo simulation without connecting to FastAPI.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isMock}
                onChange={(e) => setIsMock(e.target.checked)}
                className="w-4 h-4 accent-[#b3984c] rounded cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary py-2 px-5 text-xs">
                Save Backend Configuration
              </button>
            </div>
          </div>
        </form>

        {/* User Profile */}
        <div className="editorial-card p-6 sm:p-8 space-y-4">
          <span className="editorial-tag">USER PROFILE</span>
          <h3 className="font-manrope font-semibold text-lg text-[#20251f]">
            Identity & Organization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono uppercase text-[#657066] mb-1">Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-black/15 bg-white text-xs text-[#20251f]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#657066] mb-1">Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-black/15 bg-white text-xs text-[#20251f]"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Data Export */}
        <div className="editorial-card p-6 sm:p-8 space-y-4">
          <span className="editorial-tag">DATA SOVEREIGNTY</span>
          <h3 className="font-manrope font-semibold text-lg text-[#20251f]">
            Export & Privacy Controls
          </h3>
          <p className="text-xs text-[#72776f] leading-relaxed">
            All memories extracted into BearIQ belong completely to you. Download a copy of your verified profile or purge cache.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="btn-secondary py-2 px-4 text-xs flex items-center gap-2"
            >
              <Download size={14} />
              <span>Export Workspace Data (.json)</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Clear local storage and cached session?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="p-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Reset Local Workspace Cache</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

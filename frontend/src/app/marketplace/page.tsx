'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { MARKETPLACE_CATALOG } from '@/lib/mockData';
import { MarketplaceSkill } from '@/lib/types';
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Tag, 
  Check, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  User, 
  Filter,
  DollarSign,
  X,
  FileCode2
} from 'lucide-react';

const CATEGORIES = ['All', 'Backend Development', 'Frontend & UI', 'Product & Writing', 'Strategy & Ops'];

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedListing, setSelectedListing] = useState<MarketplaceSkill | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'seller'>('browse');

  const filtered = MARKETPLACE_CATALOG.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === 'All' || item.category === category;
    return matchSearch && matchCat;
  });

  const handlePurchase = (item: MarketplaceSkill) => {
    setPurchasedIds([...purchasedIds, item.id]);
    alert(`Acquisition complete for "${item.title}". The skill definition has been linked to your workspace.`);
    setSelectedListing(null);
  };

  return (
    <AppShell
      title="AI Skills Marketplace"
      subtitle="Discover and acquire verified AI skills, or publish your own expertise for the community."
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'browse' ? 'bg-[#232923] text-white' : 'text-[#72776f] hover:bg-black/5'
            }`}
          >
            Browse Catalog
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'seller' ? 'bg-[#232923] text-white' : 'text-[#72776f] hover:bg-black/5'
            }`}
          >
            Seller Portal
          </button>
        </div>
      }
    >
      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="editorial-card p-6 sm:p-8 max-w-xl w-full bg-[#f5f3e9] space-y-5">
            <div className="flex items-start justify-between border-b border-black/10 pb-4">
              <div>
                <span className="editorial-tag">{selectedListing.category}</span>
                <h3 className="font-manrope font-bold text-xl text-[#20251f] mt-1">
                  {selectedListing.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#72776f] mt-1">
                  <span>Created by {selectedListing.creator}</span>
                  <span>•</span>
                  <span>Version {selectedListing.version}</span>
                </div>
              </div>
              <button onClick={() => setSelectedListing(null)} className="text-[#72776f] hover:text-[#20251f]">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-[#4b544d] leading-relaxed">
              {selectedListing.description}
            </p>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#657066] block mb-1.5">
                Included Directives Preview
              </span>
              <div className="bg-[#18201a] text-[#c3cebe] p-4 rounded-xl font-mono text-xs leading-relaxed max-h-40 overflow-y-auto">
                <pre>{selectedListing.markdownPreview}</pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/10">
              <div>
                <span className="text-xs text-[#72776f]">License Price</span>
                <div className="font-manrope font-bold text-2xl text-[#20251f]">
                  ${selectedListing.price} <span className="text-xs font-normal text-[#899185]">USD</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedListing(null)} className="btn-secondary py-2 px-3 text-xs">
                  Close
                </button>
                {purchasedIds.includes(selectedListing.id) ? (
                  <span className="btn-secondary py-2 px-4 text-xs text-emerald-800 bg-emerald-50 border-emerald-300">
                    Already Acquired
                  </span>
                ) : (
                  <button
                    onClick={() => handlePurchase(selectedListing)}
                    className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
                  >
                    <span>Acquire Skill</span>
                    <Sparkles size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'browse' ? (
        <div className="space-y-6">
          {/* Search & Categories toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills, domains, or tags..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-black/15 bg-white/70 text-xs text-[#20251f] focus:outline-none focus:border-[#a58b3f]"
              />
              <Search size={15} className="absolute left-3 top-2.5 text-black/35 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] font-mono px-3 py-1 rounded border transition-colors shrink-0 ${
                    category === cat
                      ? 'bg-[#e7cc73] text-[#20251f] border-[#b3984c] font-semibold'
                      : 'bg-white/50 text-[#72776f] border-black/10 hover:bg-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="editorial-card p-6 flex flex-col justify-between hover:border-[#b3984c]/50 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="editorial-tag">{item.category}</span>
                    <div className="flex items-center gap-1 text-xs text-[#a58b3f] font-mono">
                      <Star size={13} fill="currentColor" />
                      <span>{item.rating}</span>
                      <span className="text-[#899185]">({item.reviewsCount})</span>
                    </div>
                  </div>

                  <h3 className="font-manrope font-semibold text-lg text-[#20251f] group-hover:text-[#9d7619] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#72776f] mt-1.5 leading-relaxed">
                    {item.tagline}
                  </p>

                  <div className="flex flex-wrap gap-1.5 my-4">
                    {item.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 text-[#5e655e]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-manrope font-bold text-lg text-[#20251f]">
                    ${item.price}
                    <span className="text-[11px] font-normal text-[#899185]">/ one-time</span>
                  </div>

                  <button
                    onClick={() => setSelectedListing(item)}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                  >
                    <span>Inspect Details</span>
                    <ArrowUpRight size={13} className="text-[#a58b3f]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Seller Portal Dashboard */
        <div className="space-y-6">
          <div className="editorial-card p-8">
            <span className="editorial-tag">CREATOR DASHBOARD</span>
            <h3 className="font-manrope font-bold text-2xl text-[#20251f] mt-1 mb-2">
              Monetize Your Intelligence
            </h3>
            <p className="text-xs text-[#72776f] max-w-xl leading-relaxed mb-6">
              You own your validated memories. Package curated reasoning habits into a published AI skill listing and earn revenue whenever other developers install your workflows.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white border border-black/10">
                <span className="text-[10px] font-mono text-[#899185] uppercase block">Published Listings</span>
                <span className="font-manrope font-bold text-2xl text-[#20251f]">2</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-black/10">
                <span className="text-[10px] font-mono text-[#899185] uppercase block">Total Installs</span>
                <span className="font-manrope font-bold text-2xl text-emerald-700">102</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-black/10">
                <span className="text-[10px] font-mono text-[#899185] uppercase block">Gross Earnings</span>
                <span className="font-manrope font-bold text-2xl text-[#a58b3f]">$2,380</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-700 shrink-0" />
              <span>
                <strong>Privacy Guarantee:</strong> BearIQ strictly isolates your raw conversations and private entities. Only explicitly generated Markdown skill directives are shared.
              </span>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

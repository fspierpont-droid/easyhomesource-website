'use client';

import React, { useState, useEffect } from 'react';

export interface ReadyBuyer {
  id: string;
  ghlContactId: string;
  ghlOpportunityId: string;
  ghlPipelineId: string;
  ghlPipelineStageId: string;
  name: string;
  phone: string;
  email: string;
  landStatus: string;
  interestedModel: string;
  budget: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  source: string;
  createdAt: string;
}

interface ReadyToQuoteViewProps {
  onStartQuoteForBuyer: (buyer: ReadyBuyer) => void;
}

export function ReadyToQuoteView({ onStartQuoteForBuyer }: ReadyToQuoteViewProps) {
  const [buyers, setBuyers] = useState<ReadyBuyer[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const fetchLiveReadyLeads = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      setConnectionError(null);
      const res = await fetch('/api/portal/ready-to-quote/ghl-sync', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.readyBuyers)) throw new Error(data.error || 'GHL request failed');
      setBuyers(data.readyBuyers);
      if (!silent) setSyncMsg(`✓ Synced ${data.readyBuyers.length} qualified leads from GHL.`);
    } catch (err) {
      console.error('Ready leads GHL sync failed:', err);
      setBuyers([]);
      setConnectionError('Unable to load GHL data. Check the connection and try again.');
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveReadyLeads(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0284c7]">
              GHL LEAD CONVERSION QUEUE
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Filtered: Send Lead To Quote System [✓]
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Ready to Quote Pipeline ({buyers.length} Qualified Buyers)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pulling GoHighLevel opportunities where <strong className="text-slate-800">Send Lead To Quote System</strong> is checked.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLiveReadyLeads(false)}
          disabled={isSyncing}
          className="px-4 py-2 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className={isSyncing ? 'animate-spin' : ''}>⚡</span>
          <span>{isSyncing ? 'Checking GHL...' : 'Sync Ready Leads from GHL'}</span>
        </button>
      </div>

      {syncMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{syncMsg}</span>
          <button onClick={() => setSyncMsg(null)} className="text-blue-600 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {connectionError && <div role="alert" className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-800">{connectionError}</div>}
      {!connectionError && buyers.length === 0 && <div className="p-8 rounded-2xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-600">No leads are currently ready to quote.</div>}

      {/* Buyer Cards List */}
      <div className="grid gap-4">
        {buyers.map((buyer) => (
          <div
            key={buyer.id}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-[#0B4F86] transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900">{buyer.name}</h4>
                {buyer.urgency && <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    buyer.urgency === 'HIGH'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {buyer.urgency} PRIORITY
                </span>}
                <span className="text-[10px] text-slate-400 font-mono">{buyer.createdAt}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-slate-600">
                <p>
                  📍 <strong>Land:</strong> {buyer.landStatus}
                </p>
                <p>
                  🏡 <strong>Model:</strong> {buyer.interestedModel}
                </p>
                <p>
                  📞 <strong>Phone:</strong> {buyer.phone} • {buyer.email}
                </p>
                <p>
                  💰 <strong>Target Budget:</strong> {buyer.budget}
                </p>
              </div>

              <div className="text-[10px] text-slate-400">
                <span>Source: {buyer.source}</span>
              </div>
            </div>

            {/* 1-Click Action */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStartQuoteForBuyer(buyer)}
                className="px-4 py-2.5 bg-[#0B4F86] hover:bg-[#083860] text-white font-bold rounded-xl shadow-xs text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>⚡</span>
                <span>Generate Master Quote</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

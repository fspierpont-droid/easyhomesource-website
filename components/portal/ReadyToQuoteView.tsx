'use client';

import React from 'react';

export interface ReadyBuyer {
  id: string;
  name: string;
  phone: string;
  email: string;
  landStatus: string;
  interestedModel: string;
  budget: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  createdAt: string;
}

interface ReadyToQuoteViewProps {
  onStartQuoteForBuyer: (buyer: ReadyBuyer) => void;
}

export function ReadyToQuoteView({ onStartQuoteForBuyer }: ReadyToQuoteViewProps) {
  const readyBuyers: ReadyBuyer[] = [
    {
      id: 'buyer-1',
      name: 'Sarah Jenkins',
      phone: '352-555-0192',
      email: 'sarah.j@example.com',
      landStatus: 'Owns 1.5 acres in Hernando County',
      interestedModel: 'Move on Up (3b/2ba)',
      budget: '$180k - $210k turnkey',
      urgency: 'HIGH',
      source: 'AI Chatbot Quote Request',
      createdAt: '2026-08-07 09:30 AM'
    },
    {
      id: 'buyer-2',
      name: 'Carlos Mendez',
      phone: '813-555-0481',
      email: 'cmendez88@example.com',
      landStatus: 'Looking for Land & Home Package (Citrus)',
      interestedModel: 'Tulip ($39,888) or Dogwood',
      budget: '$120k max turnkey',
      urgency: 'HIGH',
      source: 'Get a Quote Page',
      createdAt: '2026-08-07 08:45 AM'
    },
    {
      id: 'buyer-3',
      name: 'David & Michelle Miller',
      phone: '352-555-0331',
      email: 'millerfamilyfl@example.com',
      landStatus: 'Owns lot in Denmarsh Woods, Brooksville',
      interestedModel: 'Oak (4b/2ba double wide)',
      budget: '$200k - $230k',
      urgency: 'MEDIUM',
      source: 'Phone Inbound (352-558-8888)',
      createdAt: '2026-08-06 04:15 PM'
    },
    {
      id: 'buyer-4',
      name: 'Robert Vance',
      phone: '727-555-0819',
      email: 'rvance.contracting@example.com',
      landStatus: 'Builder looking for New Port Richey lots',
      interestedModel: 'Boujee XL 2 or Paxton',
      budget: '$250k+',
      urgency: 'MEDIUM',
      source: 'Lot Tour Appointment',
      createdAt: '2026-08-06 02:00 PM'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0284c7]">
            LEAD CONVERSION QUEUE
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5">
            Ready to Quote Pipeline ({readyBuyers.length} Qualified Buyers)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Buyers with confirmed land status ready for formal QS Master Quote calculation.
          </p>
        </div>
      </div>

      {/* Buyer Cards List */}
      <div className="grid gap-4">
        {readyBuyers.map((buyer) => (
          <div
            key={buyer.id}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-[#0B4F86] transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900">{buyer.name}</h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    buyer.urgency === 'HIGH'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {buyer.urgency} PRIORITY
                </span>
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
            </div>

            {/* 1-Click Action */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStartQuoteForBuyer(buyer)}
                className="px-4 py-2.5 bg-[#0B4F86] hover:bg-[#083860] text-white font-bold rounded-xl shadow-xs text-xs transition-all active:scale-95 flex items-center gap-1.5"
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

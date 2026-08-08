'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SiteLogo } from '@/components/SiteLogo';
import { getSavedQuoteById, type SavedQuote } from '@/data/quotesStore';

export default function CustomerShareQuotePage() {
  const params = useParams();
  const token = (params?.shareToken as string) || 'quote-1';
  const [copied, setCopied] = useState(false);
  const [quoteData, setQuoteData] = useState<SavedQuote | null>(null);

  useEffect(() => {
    const existing = getSavedQuoteById(token);
    if (existing) {
      setQuoteData(existing);
    }
  }, [token]);

  // Proposal state
  const quote = {
    id: quoteData?.id || token,
    quoteNumber: quoteData?.quoteNumber || (token.startsWith('quote-') ? 'Q-2026-0801' : token),
    customerName: quoteData?.customerName || 'Sarah Jenkins',
    customerPhone: quoteData?.customerPhone || '352-555-0192',
    customerEmail: quoteData?.customerEmail || 'sarah.j@example.com',
    homeModel: quoteData?.homeModel || 'Move on Up (18x60 3b/2ba)',
    manufacturer: quoteData?.manufacturer || 'CLAYTON Addison',
    series: quoteData?.series || 'Tempo Series',
    beds: quoteData?.beds || 3,
    baths: quoteData?.baths || 2,
    sqft: quoteData?.sqft || 1080,
    dimensions: quoteData?.dimensions || "18' x 60'",
    homePrice: Number(quoteData?.homePrice) || 94900.00,
    propertyAddress: quoteData?.propertyAddress || '6645 W Erlen Ln, Homosassa, FL 34446',
    propertyPrice: Number(quoteData?.propertyPrice) || 0.00,
    deliveryRoute: quoteData?.deliveryRouteType === 'dealer_to_customer' ? 'Dealership to Customer Site' : 'Factory Direct Delivery',
    deliveryMiles: quoteData?.deliveryMiles || 32,
    freightDelivery: Number(quoteData?.freightDelivery) || 3850.00,
    siteWorkTotal: Number(quoteData?.siteWorkTotal) || 30650.00,
    discounts: Number(quoteData?.discounts) || 0,
    salesperson: quoteData?.salesperson || 'Scott Pierpont',
    salespersonTitle: 'Operations & Principal Consultant',
    salespersonPhone: '(352) 558-8888',
    salespersonEmail: quoteData?.salespersonEmail || 'scott@easyhomesource.com',
    status: quoteData?.status || 'APPROVED',
    notes: quoteData?.notesCustomer || quoteData?.notes || 'Complete turnkey land and manufactured home package for Central Florida. Includes county building permits, site prep, potable water well, 1050-gal septic system, 200A electric panel, 3.0-ton heat pump, vented vinyl skirting, and code entrance stairs.',
    lineItems: (quoteData?.lineItems && quoteData.lineItems.length > 0)
      ? quoteData.lineItems.map((li) => ({
          id: li.id,
          name: li.name,
          description: li.description,
          price: Number(li.totalPrice || li.unitPrice || 0)
        }))
      : [
          {
            id: 'li-1',
            name: 'Block & Hurricane Tie-Down Installation',
            description: 'Concrete pier pads, cinder blocks, leveling, and Florida wind zone ground anchors (60ft double table).',
            price: 5835.00
          },
          {
            id: 'li-2',
            name: '3.0-Ton Central A/C Heat Pump System (14.3 SEER2)',
            description: 'High-efficiency heat pump with digital programmable thermostat, outdoor equipment pad, whip, and ductwork plenum tie-in.',
            price: 5555.00
          },
          {
            id: 'li-3',
            name: 'Dirt Pad & Laser Site Grading (2 Loads)',
            description: 'Land clearing, clean fill dirt import, compacting, and laser leveling for solid home foundation.',
            price: 2700.00
          },
          {
            id: 'li-4',
            name: 'Vented Vinyl Perimeter Skirting & Steps (2 Sets)',
            description: 'Full perimeter vinyl skirting with top rail, ground track, access door, and 2 sets of code stairs.',
            price: 3200.00
          },
          {
            id: 'li-5',
            name: 'County Building, Zoning & Health Dept Permits',
            description: 'Hernando/Citrus county building permit processing, plan review, zoning, and health inspections ($2,000 standard).',
            price: 2000.00
          }
        ],
    createdAt: quoteData?.quoteDate || 'August 8, 2026'
  };

  const subtotal = quoteData?.subtotal || (quote.homePrice + quote.propertyPrice + quote.freightDelivery + quote.siteWorkTotal - quote.discounts);
  const salesTax = quoteData?.salesTax || Math.round(subtotal * 0.03 * 100) / 100;
  const estimatedTotal = quoteData?.estimatedTotal || Math.round((subtotal + salesTax) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased print:bg-white print:p-0">
      {/* Top Bar (Hidden in Print) */}
      <header className="no-print bg-[#0B1E38] text-white border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-extrabold text-sm text-white tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#1E6FA8] flex items-center justify-center text-xs font-black text-white">E</span>
            <span>Easy HomeSource Customer Proposal</span>
          </Link>
          <span className="text-white/30">|</span>
          <span className="font-mono text-xs text-emerald-400 font-bold">
            {quote.quoteNumber}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🔗</span>
            <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-[#1E6FA8] hover:bg-[#165a8a] text-white font-black rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>📄</span>
            <span>Download / Print PDF</span>
          </button>
        </div>
      </header>

      {/* Proposal Main Document */}
      <div className="max-w-4xl mx-auto my-6 sm:my-10 space-y-8 print:my-0 print:space-y-0 print:max-w-full">
        {/* PAGE 1: Proposal Overview */}
        <section className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl border border-slate-200 space-y-6 print:p-0 print:border-none print:shadow-none print:break-after-page print:min-h-screen">
          <div className="text-[10px] text-slate-400 font-bold flex justify-between border-b border-slate-100 pb-2">
            <span>Easy HomeSource | 352-558-8888 | info@easyhomesource.com | 9011 McIntyre Rd, Brooksville, FL 34601</span>
            <span>Page 1</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pt-2">
            <div className="flex items-center gap-4">
              <SiteLogo size="lg" />
              <div>
                <h1 className="text-xl font-black text-[#0B1E38] tracking-tight">Easy HomeSource</h1>
                <p className="text-xs text-slate-500 font-bold">Central Florida Manufactured Housing Turnkey Operations</p>
                <div className="text-[10.5px] text-slate-600 mt-1 space-y-0.5">
                  <p>📍 9011 McIntyre Rd, Brooksville, FL 34601</p>
                  <p>📞 352-558-8888 | ✉️ info@easyhomesource.com</p>
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[220px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8] block">Official Proposal</span>
              <div className="text-base font-black text-[#0B1E38] font-mono mt-0.5">{quote.quoteNumber}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">Date: {quote.createdAt}</div>
            </div>
          </div>

          {/* Customer & Rep */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">CUSTOMER</span>
              <div className="text-base font-black text-[#0B1E38]">{quote.customerName}</div>
              <div className="text-slate-600 font-semibold">📞 {quote.customerPhone}</div>
              <div className="text-slate-600 font-medium">✉️ {quote.customerEmail}</div>
              <div className="text-slate-500 text-[11px]">📍 {quote.propertyAddress}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">HOUSING CONSULTANT</span>
              <div className="text-base font-black text-[#0B1E38]">{quote.salesperson}</div>
              <div className="text-slate-600 font-semibold">✉️ {quote.salespersonEmail}</div>
              <div className="text-slate-500 text-[11px]">Easy HomeSource Operations</div>
            </div>
          </div>

          {/* Navy ESTIMATED TOTAL Banner */}
          <div className="flex items-center justify-between rounded-2xl bg-[#0F2A47] text-white px-6 py-4 shadow-md">
            <span className="text-xs uppercase tracking-wider font-extrabold">ESTIMATED TOTAL</span>
            <span className="font-black text-3xl tracking-tight font-mono">
              ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Selected Home */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">Selected Manufactured Home</h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="text-base font-black text-[#0B1E38]">{quote.homeModel}</div>
              <div className="text-slate-600 font-bold mt-0.5">{quote.manufacturer} • {quote.series}</div>
              <div className="text-slate-500 font-semibold mt-1">
                {quote.beds} Beds | {quote.baths} Baths | {quote.sqft.toLocaleString()} Sq. Ft. | {quote.dimensions}
              </div>
            </div>
          </div>

          {/* Scope of Work Table */}
          <div className="space-y-3 pt-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">Scope of Work &amp; Line Items</h2>
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F2A47] text-white text-[11px]">
                    <th className="py-2.5 px-4 font-bold">Service / Item</th>
                    <th className="py-2.5 px-4 text-right font-bold w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">Factory Freight &amp; Transport Carrier Delivery</div>
                      <div className="text-[10.5px] text-slate-500">{quote.deliveryRoute} • {quote.deliveryMiles} Miles</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${quote.freightDelivery.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {quote.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10.5px] text-slate-500">{item.description}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* PAGE 2: Financial Summary & Next Steps */}
        <section className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl border border-slate-200 space-y-6 print:p-0 print:border-none print:shadow-none print:min-h-screen">
          <div className="text-[10px] text-slate-400 font-bold flex justify-between border-b border-slate-100 pb-2">
            <span>Easy HomeSource | 352-558-8888 | info@easyhomesource.com | 9011 McIntyre Rd, Brooksville, FL 34601</span>
            <span>Page 2</span>
          </div>

          {/* Summary Box */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">Turnkey Pricing Summary</h2>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between font-semibold">
                <span>Base Manufactured Home</span>
                <span className="font-mono font-bold text-slate-900">${quote.homePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {quote.propertyPrice > 0 && (
                <div className="flex justify-between font-semibold">
                  <span>Land / Homesite Parcel</span>
                  <span className="font-mono font-bold text-slate-900">${quote.propertyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Freight Transport &amp; Delivery</span>
                <span className="font-mono font-bold text-slate-900">${quote.freightDelivery.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Site Work, Prep &amp; Utilities</span>
                <span className="font-mono font-bold text-slate-900">${quote.siteWorkTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="my-2 border-t border-slate-200" />

              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>Subtotal</span>
                <span className="font-mono font-black">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1E6FA8]">
                <span>Sales Tax (3.00%)</span>
                <span className="font-mono">${salesTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#0F2A47] text-white px-5 py-3.5 mt-2 shadow-md">
                <span className="text-xs uppercase tracking-wider font-extrabold">Estimated Total</span>
                <span className="font-black text-2xl font-mono">
                  ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs">
            <h3 className="font-black text-sm text-[#0B1E38]">Next Steps</h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 font-medium leading-relaxed">
              <li>Review this proposal and contact your consultant with any questions.</li>
              <li>Sign the deposit agreement to reserve your home.</li>
              <li>Schedule your site visit and begin the financing and permitting process.</li>
            </ol>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
            <h3 className="font-black text-xs text-slate-700 uppercase tracking-wider">Disclaimer</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Site development pricing is an estimate based on visible conditions. Final pricing is subject to change based on actual site-specific requirements during installation. Prices are valid for 30 days from the quote date.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Authorized Housing Consultant</span>
              <div className="font-black text-sm text-[#0B1E38]">{quote.salesperson}</div>
              <div className="text-slate-500">📞 (352) 558-8888 • ✉️ {quote.salespersonEmail}</div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Easy HomeSource Dealership</span>
              <div className="font-bold text-slate-800">Licensed &amp; Insured Manufactured Retailer</div>
              <div className="text-slate-500">9011 McIntyre Rd, Brooksville, FL 34601</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

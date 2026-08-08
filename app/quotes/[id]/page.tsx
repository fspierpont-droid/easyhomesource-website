'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SiteLogo } from '@/components/SiteLogo';
import { calculateComprehensiveQuoteTotals, type QuoteFinancialTotals } from '@/data/pricingSpreadsheet';

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = (params?.id as string) || 'quote-1';
  const [copied, setCopied] = useState(false);

  // Proposal state
  const quote = {
    id: quoteId,
    quoteNumber: 'Q-2026-0801',
    customerName: 'Sarah Jenkins',
    customerPhone: '352-555-0192',
    customerEmail: 'sarah.j@example.com',
    homeModel: 'Boujee 2 (18x60 3b/2ba)',
    manufacturer: 'CLAYTON Addison',
    series: 'Boujee Series',
    beds: 3,
    baths: 2,
    sqft: 1580,
    dimensions: "28' x 60'",
    homePrice: 129475.03,
    propertyAddress: '6645 W Erlen Ln, Homosassa, FL 34446',
    propertyPrice: 189900.00,
    deliveryRoute: 'Dealership to Customer Site',
    deliveryMiles: 32,
    freightDelivery: 2860.00,
    siteWorkTotal: 25650.00,
    discounts: 0,
    salesperson: 'Scott Pierpont',
    salespersonTitle: 'Principal & Operations Admin',
    salespersonPhone: '(352) 558-8888',
    salespersonEmail: 'scott@easyhomesource.com',
    status: 'APPROVED',
    notes: 'Turnkey land and home package proposal for Homosassa homesite. Includes county building permits, site prep, potable water well, 1050-gal septic system, 200A electric panel, 3.0-ton heat pump, vented vinyl skirting, and code steps.',
    lineItems: [
      {
        id: 'li-1',
        name: 'Block & Hurricane Tie-Down Installation',
        description: 'Concrete pier pads, cinder blocks, leveling, and Florida wind zone ground anchors (60ft double table).',
        price: 12195.00
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
        description: 'Full perimeter vinyl skirting (156 linear ft) with top rail, ground track, access door, and 2 sets of code stairs.',
        price: 3200.00
      },
      {
        id: 'li-5',
        name: 'County Building, Zoning & Health Dept Permits',
        description: 'Hernando/Citrus county building permit processing, plan review, zoning, and health inspections ($2,000 standard).',
        price: 2000.00
      }
    ],
    createdAt: 'August 7, 2026'
  };

  const totals: QuoteFinancialTotals = calculateComprehensiveQuoteTotals(
    quote.homePrice || 0,
    quote.propertyPrice || 0,
    quote.freightDelivery || 0,
    quote.siteWorkTotal || 0,
    0,
    quote.discounts || 0,
    0,
    0,
    0,
    0,
    0.03
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/quote/${quote.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased print:bg-white print:p-0">
      {/* Top App Bar (Strictly Hidden in Print) */}
      <header className="no-print bg-[#0B1E38] text-white border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/portal?view=library"
            className="text-xs font-bold text-[#A8C8E6] hover:text-white flex items-center gap-1 transition-colors"
          >
            ← Back to Quote Library
          </Link>
          <span className="text-white/30">|</span>
          <span className="font-mono text-xs text-emerald-400 font-black tracking-wider">
            {quote.quoteNumber}
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-400/30">
            {quote.status}
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

          <Link
            href={`/quotes/${quote.id}/edit`}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>✏️</span>
            <span>Edit Quote</span>
          </Link>

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

      {/* Main Quote Sheet Document */}
      <main className="max-w-4xl mx-auto my-6 sm:my-10 p-6 sm:p-10 bg-white rounded-[2rem] shadow-xl border border-slate-200 space-y-8 print:my-0 print:p-0 print:border-none print:shadow-none print:max-w-full">
        {/* Document Header with Official Logo */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b-2 border-[#0F2A47]/15">
          <div className="flex items-center gap-4">
            <SiteLogo size="lg" />
            <div>
              <h1 className="text-2xl font-black text-[#0B1E38] tracking-tight">
                Easy HomeSource
              </h1>
              <p className="text-[11px] text-slate-500 font-bold">
                Central Florida Turnkey Manufactured Housing Operations
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                9011 McIntyre Rd, Brooksville, FL 34601 • (352) 558-8888 • info@easyhomesource.com
              </p>
            </div>
          </div>

          <div className="sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200/80 min-w-[240px]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8] block">
              Official Proposal
            </span>
            <div className="text-lg font-black text-[#0B1E38] font-mono mt-0.5">
              {quote.quoteNumber}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Date: {quote.createdAt}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Consultant: <span className="font-bold text-slate-800">{quote.salesperson}</span>
            </div>
          </div>
        </div>

        {/* Customer & Homesite Information Bar */}
        <div className="grid sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
              Prepared For
            </span>
            <div className="text-base font-black text-[#0B1E38]">
              {quote.customerName}
            </div>
            <div className="text-xs text-slate-600 mt-0.5 font-medium">
              📞 {quote.customerPhone} {quote.customerEmail && `• ✉️ ${quote.customerEmail}`}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
              Delivery &amp; Installation Homesite
            </span>
            <div className="text-xs font-bold text-slate-800">
              📍 {quote.propertyAddress}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Route: {quote.deliveryRoute} ({quote.deliveryMiles} miles from Brooksville Dealership)
            </div>
          </div>
        </div>

        {/* Selected Home Specifications */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">
              1. Selected Manufactured Home Model
            </h2>
            <span className="text-xs font-black text-[#0B1E38]">
              Base Price: ${quote.homePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 grid sm:grid-cols-4 gap-3 text-xs shadow-2xs">
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Manufacturer</span>
              <span className="font-bold text-slate-900">{quote.manufacturer}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Model / Series</span>
              <span className="font-bold text-slate-900">{quote.homeModel}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Bed / Bath</span>
              <span className="font-bold text-slate-900">{quote.beds} Beds / {quote.baths} Baths</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Size &amp; Dimensions</span>
              <span className="font-bold text-slate-900">{quote.dimensions} ({quote.sqft} sq ft)</span>
            </div>
          </div>
        </section>

        {/* Itemized Site Work & Delivery Scope */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">
              2. Delivery, Setup &amp; Site Work Scope
            </h2>
            <span className="text-xs font-black text-[#0B1E38]">
              Site Subtotal: ${(quote.freightDelivery + quote.siteWorkTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-2.5 px-4">Scope of Work / Service Description</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4">
                    <div className="font-bold text-slate-900">Factory Freight &amp; Transport Carrier Delivery</div>
                    <div className="text-[10.5px] text-slate-500">
                      Transport delivery to {quote.propertyAddress} ({quote.deliveryMiles} miles, Florida DOT permits &amp; escorts included).
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right font-black text-slate-900 tabular">
                    ${quote.freightDelivery.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {quote.lineItems?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10.5px] text-slate-500">{item.description}</div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900 tabular">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Customer Financial Breakdown & 3% Sales Tax */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">
            3. Turnkey Investment &amp; Florida Sales Tax
          </h2>

          <div className="p-6 bg-slate-50 rounded-[1.75rem] border border-slate-200 space-y-3">
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between font-semibold">
                <span>1. Base Manufactured Home:</span>
                <span className="tabular font-bold text-slate-900">${quote.homePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {quote.propertyPrice > 0 && (
                <div className="flex justify-between font-semibold">
                  <span>2. Land / Homesite Parcel:</span>
                  <span className="tabular font-bold text-slate-900">${quote.propertyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold">
                <span>3. Freight Transport &amp; Delivery:</span>
                <span className="tabular font-bold text-slate-900">${quote.freightDelivery.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between font-semibold">
                <span>4. Site Work, Utilities &amp; Permits:</span>
                <span className="tabular font-bold text-slate-900">${quote.siteWorkTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="my-2 border-t border-slate-200" />

              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>Subtotal (Exact Sum):</span>
                <span className="tabular">${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Financed subtotal:</span>
                <span className="tabular">${totals.financed_subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Tax basis:</span>
                <span className="tabular">${totals.tax_basis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1E6FA8]">
                <span>3% Florida Sales Tax (3.00%):</span>
                <span className="tabular">${totals.sales_tax_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Prominent Dark Navy ESTIMATED TOTAL banner */}
              <div className="flex items-center justify-between rounded-2xl bg-[#0F2A47] text-white px-5 py-4 mt-3 shadow-lg">
                <span className="text-xs uppercase tracking-wider font-extrabold">ESTIMATED TOTAL</span>
                <span className="font-black text-3xl tracking-tight tabular">
                  ${totals.estimated_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
          <span className="font-bold text-slate-900 block">Next Steps:</span>
          <p className="text-slate-600 leading-relaxed">
            1. Review this proposal and contact your associate with any questions.<br />
            2. Sign the deposit agreement to reserve your home and lock factory production timing.<br />
            3. Schedule your site visit and begin the financing and permitting process.
          </p>
        </div>

        {/* Consultant Signature Card */}
        <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Housing Consultant
            </span>
            <div className="font-black text-sm text-[#0B1E38]">{quote.salesperson}</div>
            <div className="text-slate-500">{quote.salespersonTitle}</div>
            <div className="text-slate-500">📞 {quote.salespersonPhone} • ✉️ {quote.salespersonEmail}</div>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Easy HomeSource Dealership
            </span>
            <div className="font-bold text-slate-800">Licensed &amp; Insured Manufactured Retailer</div>
            <div className="text-slate-500">9011 McIntyre Rd, Brooksville, FL 34601</div>
            <div className="text-[10px] text-slate-400 mt-2">
              Florida DBPR / HUD Licensed Dealership
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-[9.5px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
          * Site development pricing is an estimate based on visible conditions. Final pricing is subject to change based on actual site-specific requirements during installation. Prices are valid for 30 days from the quote date. Florida sales tax calculated at statutory 3.00% manufactured housing basis.
        </div>
      </main>
    </div>
  );
}

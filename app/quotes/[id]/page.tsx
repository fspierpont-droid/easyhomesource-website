'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SiteLogo } from '@/components/SiteLogo';
import { calculateComprehensiveQuoteTotals, type QuoteFinancialTotals } from '@/data/pricingSpreadsheet';

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = (params?.id as string) || '2026_06_29_PIERPONT_NEW';
  const [copied, setCopied] = useState(false);

  // Proposal state matching official EHS structure
  const quote = {
    id: quoteId,
    quoteNumber: quoteId.startsWith('quote-') ? '2026_06_29_PIERPONT_NEW' : quoteId,
    quoteDate: '2026-06-29',
    customerName: 'Angie Floyd',
    customerPhone: '352-568-6946',
    customerEmail: 'angielynn011477@gmail.com',
    customerAddress: 'Homosassa, FL 34446',
    salesperson: 'Scott Pierpont',
    salespersonEmail: 'scott@easyhomesource.com',
    homeModel: 'Sebastian 32644D',
    manufacturer: 'Cavco Douglas',
    series: 'Douglas Collection',
    beds: 4,
    baths: 2.0,
    sqft: 1920,
    dimensions: '32 x 64',
    homePrice: 144776.71,
    propertyPrice: 0.00, // Customer owns land default ($0.00)
    deliveryItems: [
      {
        id: 'del-1',
        item: 'Freight (Factory To Dealer · 50 mi · 2 side(s))',
        qty: 1,
        amount: 2860.00
      }
    ],
    siteWorkItems: [
      { id: 'sw-1', item: 'Wooden Steps — Two Sets', qty: 1, amount: 2500.00 },
      { id: 'sw-2', item: 'Permit & Site Plan', qty: 1, amount: 2000.00 },
      { id: 'sw-3', item: "Block & Tie-Down (Double · 66' table)", qty: 1, amount: 11000.00 },
      { id: 'sw-4', item: 'Trim Out', qty: 1, amount: 1500.00 },
      { id: 'sw-5', item: 'Electric Pole & Panel', qty: 1, amount: 1850.00 },
      { id: 'sw-6', item: 'Electric Hookups', qty: 1, amount: 2300.00 },
      { id: 'sw-7', item: 'AC Unit & Installation (4 ton · Package · Straight Cool)', qty: 1, amount: 5200.00 },
      { id: 'sw-8', item: 'Well System', qty: 1, amount: 9400.00 },
      { id: 'sw-9', item: 'Septic System', qty: 1, amount: 8500.00 },
      { id: 'sw-10', item: 'Skirting Basic Valor (192 Linear Feet @ $8.00/ft)', qty: 192, amount: 1536.00 }
    ],
    addons: [] as any[],
    homeDescription: 'The Sebastian 32644D built by Cavco Douglas is a spacious 4-bedroom, 2-bath ranch-style home offering 1,920 sq. ft. of well-designed living space across two sections. Inside, you’ll find 8-foot flat ceilings, recessed lighting throughout, a farm sink with spring faucet, 42-inch overhead cabinets, and pendant lights that add a warm glow to the kitchen.'
  };

  const deliveryTotal = quote.deliveryItems.reduce((acc, i) => acc + i.amount, 0);
  const siteWorkTotal = quote.siteWorkItems.reduce((acc, i) => acc + i.amount, 0);
  const addonsTotal = quote.addons.reduce((acc, i) => acc + (i.amount || 0), 0);

  const subtotal = quote.homePrice + quote.propertyPrice + deliveryTotal + siteWorkTotal + addonsTotal;
  const salesTax = Math.round(subtotal * 0.03 * 100) / 100;
  const estimatedTotal = Math.round((subtotal + salesTax) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/quote/${quote.quoteNumber}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased print:bg-white print:p-0">
      {/* Top Floating App Bar (Strictly Hidden on Print & PDF) */}
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
            Quote #{quote.quoteNumber}
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

      {/* Official 2-Page Executive Proposal Document (Exact 100% Match to 2026_06_29_PIERPONT_NEW.pdf) */}
      <div className="max-w-4xl mx-auto my-6 sm:my-10 space-y-8 print:my-0 print:space-y-0 print:max-w-full">
        {/* PAGE 1: Quote Summary & Pricing Details */}
        <section className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl border border-slate-200 space-y-6 print:p-0 print:border-none print:shadow-none print:break-after-page print:min-h-screen">
          {/* Running Document Header */}
          <div className="text-[10px] text-slate-400 font-bold flex justify-between border-b border-slate-100 pb-2">
            <span>Easy HomeSource | 352-558-8888 | info@easyhomesource.com | 9011 McIntyre Rd, Brooksville, FL 34601</span>
            <span>Page 1</span>
          </div>

          {/* Master Logo & Brand Info Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pt-2">
            <div className="flex items-center gap-4">
              <SiteLogo size="lg" />
              <div>
                <h1 className="text-xl font-black text-[#0B1E38] tracking-tight">
                  Easy HomeSource
                </h1>
                <p className="text-xs text-slate-500 font-bold">
                  Your trusted manufactured home dealership
                </p>
                <div className="text-[10.5px] text-slate-600 mt-1 space-y-0.5">
                  <p>📍 9011 McIntyre Rd, Brooksville, FL 34601</p>
                  <p>📞 352-558-8888 | ✉️ info@easyhomesource.com</p>
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[220px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8] block">
                Quote Summary
              </span>
              <div className="text-base font-black text-[#0B1E38] font-mono mt-0.5">
                Quote #{quote.quoteNumber}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                Date: {quote.quoteDate}
              </div>
            </div>
          </div>

          {/* Customer & Sales Rep Side-by-Side Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                CUSTOMER
              </span>
              <div className="text-base font-black text-[#0B1E38]">{quote.customerName}</div>
              <div className="text-slate-600 font-semibold">📞 {quote.customerPhone}</div>
              <div className="text-slate-600 font-medium">✉️ {quote.customerEmail}</div>
              <div className="text-slate-500 text-[11px]">📍 {quote.customerAddress}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                SALES REP
              </span>
              <div className="text-base font-black text-[#0B1E38]">{quote.salesperson}</div>
              <div className="text-slate-600 font-semibold">✉️ {quote.salespersonEmail}</div>
              <div className="text-slate-500 text-[11px]">Easy HomeSource Operations Admin</div>
            </div>
          </div>

          {/* Prominent Navy ESTIMATED TOTAL Banner */}
          <div className="flex items-center justify-between rounded-2xl bg-[#0F2A47] text-white px-6 py-4 shadow-md">
            <span className="text-xs uppercase tracking-wider font-extrabold">ESTIMATED TOTAL</span>
            <span className="font-black text-3xl tracking-tight font-mono">
              ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Selected Home Specifications Box */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">
              Selected Home
            </h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="text-base font-black text-[#0B1E38]">{quote.homeModel}</div>
              <div className="text-slate-600 font-bold mt-0.5">{quote.manufacturer}</div>
              <div className="text-slate-500 font-semibold mt-1">
                {quote.beds} Beds | {quote.baths} Baths | {quote.sqft.toLocaleString()} Sq. Ft. | {quote.dimensions}
              </div>
            </div>
          </div>

          {/* Itemized Pricing Details: Delivery & Site Work */}
          <div className="space-y-4 pt-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">
              Pricing Details
            </h2>

            {/* Delivery Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-[#0F2A47] text-white px-4 py-2 font-bold text-[11px] flex justify-between">
                <span>Delivery</span>
                <span>Qty / Amount</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {quote.deliveryItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 bg-white">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{item.item}</td>
                      <td className="py-2.5 px-4 text-center font-mono w-16">{item.qty}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 w-28">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-[#0B1E38]">
                    <td colSpan={2} className="py-2 px-4">Delivery Total</td>
                    <td className="py-2 px-4 text-right font-mono font-black">
                      ${deliveryTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Site Work Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-[#0F2A47] text-white px-4 py-2 font-bold text-[11px] flex justify-between">
                <span>Site Work</span>
                <span>Qty / Amount</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {quote.siteWorkItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 bg-white">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{item.item}</td>
                      <td className="py-2.5 px-4 text-center font-mono w-16">{item.qty}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 w-28">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-[#0B1E38]">
                    <td colSpan={2} className="py-2 px-4">Site Work Total</td>
                    <td className="py-2 px-4 text-right font-mono font-black">
                      ${siteWorkTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* PAGE 2: Pricing Summary, 3% Sales Tax, Next Steps & Disclaimer */}
        <section className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl border border-slate-200 space-y-6 print:p-0 print:border-none print:shadow-none print:min-h-screen">
          {/* Running Document Header */}
          <div className="text-[10px] text-slate-400 font-bold flex justify-between border-b border-slate-100 pb-2">
            <span>Easy HomeSource | 352-558-8888 | info@easyhomesource.com | 9011 McIntyre Rd, Brooksville, FL 34601</span>
            <span>Page 2</span>
          </div>

          {/* Pricing Summary Box matching PDF Page 2 */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">
              Pricing Summary
            </h2>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between font-semibold">
                <span>Home Subtotal</span>
                <span className="font-mono font-bold text-slate-900">${quote.homePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Delivery</span>
                <span className="font-mono font-bold text-slate-900">${deliveryTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Site Work</span>
                <span className="font-mono font-bold text-slate-900">${siteWorkTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Add-ons</span>
                <span className="font-mono font-bold text-slate-900">${addonsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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

              {/* Blue Estimated Total Banner */}
              <div className="flex items-center justify-between rounded-xl bg-[#0F2A47] text-white px-5 py-3.5 mt-2 shadow-md">
                <span className="text-xs uppercase tracking-wider font-extrabold">Estimated Total</span>
                <span className="font-black text-2xl font-mono">
                  ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps Card matching PDF */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs">
            <h3 className="font-black text-sm text-[#0B1E38]">Next Steps</h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 font-medium leading-relaxed">
              <li>Review this quote and contact your associate with any questions.</li>
              <li>Sign the deposit agreement to reserve your home.</li>
              <li>Schedule your site visit and begin the financing process.</li>
            </ol>
          </div>

          {/* Disclaimer Card matching PDF */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
            <h3 className="font-black text-xs text-slate-700 uppercase tracking-wider">Disclaimer</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Site development pricing is an estimate based on visible conditions. Final pricing is subject to change based on actual site-specific requirements during installation. Prices are valid for 30 days from the quote date.
            </p>
          </div>

          {/* Housing Consultant Signature Block */}
          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Authorized Housing Consultant
              </span>
              <div className="font-black text-sm text-[#0B1E38]">{quote.salesperson}</div>
              <div className="text-slate-500">📞 (352) 558-8888 • ✉️ {quote.salespersonEmail}</div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Easy HomeSource Dealership
              </span>
              <div className="font-bold text-slate-800">Licensed &amp; Insured Manufactured Retailer</div>
              <div className="text-slate-500">9011 McIntyre Rd, Brooksville, FL 34601</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

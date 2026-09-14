'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SiteLogo } from '@/components/SiteLogo';
import type { SavedQuote } from '@/data/quotesStore';

export default function CustomerShareQuotePage() {
  const params = useParams();
  const token = String(params?.shareToken || '').trim();
  const [copied, setCopied] = useState(false);
  const [quoteData, setQuoteData] = useState<SavedQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadQuote() {
      if (!token || token.length < 32) {
        setQuoteData(null);
        setError('This quote link is invalid or has expired.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/public/quotes/${encodeURIComponent(token)}`,
          { cache: 'no-store', signal: controller.signal },
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success || !data.quote) {
          setQuoteData(null);
          setError(
            response.status === 404
              ? 'This quote link is invalid, expired, or no longer shared.'
              : data.error || 'The quote service is temporarily unavailable.',
          );
          return;
        }

        setQuoteData(data.quote as SavedQuote);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error('Failed to load shared quote:', loadError);
        setQuoteData(null);
        setError('The quote service is temporarily unavailable. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadQuote();
    return () => controller.abort();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex justify-center">
            <SiteLogo size="lg" />
          </div>
          <h1 className="text-xl font-black text-[#0B1E38]">Loading your Easy HomeSource proposal</h1>
          <p className="mt-2 text-sm text-slate-500">Retrieving the permanent quote record…</p>
        </div>
      </div>
    );
  }

  if (error || !quoteData) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex justify-center">
            <SiteLogo size="lg" />
          </div>
          <h1 className="text-xl font-black text-[#0B1E38]">Quote unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {error || 'This quote could not be found.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-[#0B1E38] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#132f50]"
            >
              Return to Easy HomeSource
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const quote = {
    id: quoteData.id,
    quoteNumber: quoteData.quoteNumber,
    customerName: quoteData.customerName,
    customerPhone: quoteData.customerPhone,
    customerEmail: quoteData.customerEmail,
    homeModel: quoteData.homeModel,
    manufacturer: quoteData.manufacturer || '',
    series: quoteData.series || '',
    beds: Number(quoteData.beds || 0),
    baths: Number(quoteData.baths || 0),
    sqft: Number(quoteData.sqft || 0),
    dimensions: quoteData.dimensions || '',
    homePrice: Number(quoteData.homePrice || 0),
    propertyAddress: quoteData.propertyAddress || '',
    propertyPrice: Number(quoteData.propertyPrice || 0),
    deliveryRoute:
      quoteData.deliveryRouteType === 'dealer_to_customer'
        ? 'Dealership to Customer Site'
        : quoteData.deliveryRouteType === 'factory_to_dealer'
          ? 'Factory to Dealership'
          : 'Factory Direct Delivery',
    deliveryMiles: Number(quoteData.deliveryMiles || 0),
    freightDelivery: Number(quoteData.freightDelivery || 0),
    siteWorkTotal: Number(quoteData.siteWorkTotal || 0),
    discounts: Number(quoteData.discounts || 0),
    salesperson: quoteData.salesperson || 'Easy HomeSource',
    salespersonEmail: quoteData.salespersonEmail || 'info@easyhomesource.com',
    lineItems: (quoteData.lineItems || []).map((lineItem) => ({
      id: lineItem.id,
      name: lineItem.name,
      description: lineItem.description,
      price: Number(lineItem.totalPrice || lineItem.unitPrice || 0),
    })),
    createdAt: quoteData.quoteDate || quoteData.createdAt || '',
  };

  const subtotal = Number(quoteData.subtotal || 0);
  const salesTax = Number(quoteData.salesTax || 0);
  const estimatedTotal = Number(quoteData.estimatedTotal || quoteData.totalTurnkeyPrice || 0);
  const salesTaxRate = Number(quoteData.financialTotals?.sales_tax_rate ?? 0.03);

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased print:bg-white print:p-0">
      <header className="no-print bg-[#0B1E38] text-white border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-extrabold text-sm text-white tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#1E6FA8] flex items-center justify-center text-xs font-black text-white">E</span>
            <span>Easy HomeSource Customer Proposal</span>
          </Link>
          <span className="text-white/30">|</span>
          <span className="font-mono text-xs text-emerald-400 font-bold">{quote.quoteNumber}</span>
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

      <div className="max-w-4xl mx-auto my-6 sm:my-10 space-y-8 print:my-0 print:space-y-0 print:max-w-full">
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">CUSTOMER</span>
              <div className="text-base font-black text-[#0B1E38]">{quote.customerName}</div>
              {quote.customerPhone && <div className="text-slate-600 font-semibold">📞 {quote.customerPhone}</div>}
              {quote.customerEmail && <div className="text-slate-600 font-medium">✉️ {quote.customerEmail}</div>}
              {quote.propertyAddress && <div className="text-slate-500 text-[11px]">📍 {quote.propertyAddress}</div>}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">HOUSING CONSULTANT</span>
              <div className="text-base font-black text-[#0B1E38]">{quote.salesperson}</div>
              <div className="text-slate-600 font-semibold">✉️ {quote.salespersonEmail}</div>
              <div className="text-slate-500 text-[11px]">Easy HomeSource Operations</div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[#0F2A47] text-white px-6 py-4 shadow-md">
            <span className="text-xs uppercase tracking-wider font-extrabold">ESTIMATED TOTAL</span>
            <span className="font-black text-3xl tracking-tight font-mono">
              ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">Selected Manufactured Home</h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="text-base font-black text-[#0B1E38]">{quote.homeModel}</div>
              {(quote.manufacturer || quote.series) && (
                <div className="text-slate-600 font-bold mt-0.5">
                  {[quote.manufacturer, quote.series].filter(Boolean).join(' • ')}
                </div>
              )}
              <div className="text-slate-500 font-semibold mt-1">
                {quote.beds} Beds | {quote.baths} Baths | {quote.sqft.toLocaleString()} Sq. Ft. | {quote.dimensions}
              </div>
            </div>
          </div>

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
                  {quote.freightDelivery > 0 && (
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">Factory Freight &amp; Transport Carrier Delivery</div>
                        <div className="text-[10.5px] text-slate-500">
                          {quote.deliveryRoute}{quote.deliveryMiles > 0 ? ` • ${quote.deliveryMiles} Miles` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${quote.freightDelivery.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {quote.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{item.name}</div>
                        {item.description && <div className="text-[10.5px] text-slate-500">{item.description}</div>}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {quote.freightDelivery <= 0 && quote.lineItems.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-5 px-4 text-center text-slate-500">
                        No additional line items are listed on this proposal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl border border-slate-200 space-y-6 print:p-0 print:border-none print:shadow-none print:min-h-screen">
          <div className="text-[10px] text-slate-400 font-bold flex justify-between border-b border-slate-100 pb-2">
            <span>Easy HomeSource | 352-558-8888 | info@easyhomesource.com | 9011 McIntyre Rd, Brooksville, FL 34601</span>
            <span>Page 2</span>
          </div>

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
              {quote.freightDelivery > 0 && (
                <div className="flex justify-between font-semibold">
                  <span>Freight Transport &amp; Delivery</span>
                  <span className="font-mono font-bold text-slate-900">${quote.freightDelivery.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {quote.siteWorkTotal > 0 && (
                <div className="flex justify-between font-semibold">
                  <span>Site Work, Prep &amp; Utilities</span>
                  <span className="font-mono font-bold text-slate-900">${quote.siteWorkTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="my-2 border-t border-slate-200" />

              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>Subtotal</span>
                <span className="font-mono font-black">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1E6FA8]">
                <span>Sales Tax ({(salesTaxRate * 100).toFixed(2)}%)</span>
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

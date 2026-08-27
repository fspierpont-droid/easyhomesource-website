'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SiteLogo } from '@/components/SiteLogo';
import { getEffectiveMasterCatalog } from '@/data/fullMasterCatalog.generated';
import { fetchQuoteFromServer, type SavedQuote } from '@/data/quotesStore';

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = String((params?.id as string) || '');
  const [copied, setCopied] = useState(false);
  const [quoteData, setQuoteData] = useState<SavedQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadQuote() {
      if (!quoteId) {
        setLoadError('Quote not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);
      try {
        const quote = await fetchQuoteFromServer(quoteId);
        if (cancelled) return;
        if (!quote) {
          setQuoteData(null);
          setLoadError('Quote not found.');
        } else {
          setQuoteData(quote);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load permanent quote:', error);
        setQuoteData(null);
        setLoadError('Unable to load this quote from the permanent EHS system.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center max-w-md w-full">
          <div className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">Easy HomeSource</div>
          <h1 className="mt-2 text-xl font-black text-[#0B1E38]">Loading quote…</h1>
          <p className="mt-2 text-sm text-slate-500">Retrieving the permanent quote record.</p>
        </div>
      </div>
    );
  }

  if (!quoteData || loadError) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center max-w-lg w-full">
          <div className="text-xs font-black uppercase tracking-wider text-rose-600">Quote unavailable</div>
          <h1 className="mt-2 text-xl font-black text-[#0B1E38]">{loadError || 'Quote not found.'}</h1>
          <p className="mt-2 text-sm text-slate-500">No substitute or sample customer data has been loaded.</p>
          <Link
            href="/portal?view=library"
            className="inline-flex mt-5 px-4 py-2.5 bg-[#0B1E38] text-white font-bold rounded-xl text-xs"
          >
            ← Back to Quote Library
          </Link>
        </div>
      </div>
    );
  }

  const quote = {
    id: quoteData.id,
    quoteNumber: quoteData.quoteNumber,
    quoteDate: quoteData.quoteDate || '',
    customerName: quoteData.customerName || '',
    customerPhone: quoteData.customerPhone || '',
    customerEmail: quoteData.customerEmail || '',
    customerAddress: quoteData.customerAddress || quoteData.propertyAddress || '',
    salesperson: quoteData.salesperson || '',
    salespersonEmail: quoteData.salespersonEmail || '',
    homeModel: quoteData.homeModel || '',
    manufacturer: quoteData.manufacturer || '',
    series: quoteData.series || '',
    beds: Number(quoteData.beds) || 0,
    baths: Number(quoteData.baths) || 0,
    sqft: Number(quoteData.sqft) || 0,
    dimensions: quoteData.dimensions || '',
    homePrice: Number(quoteData.homePrice) || 0,
    propertyPrice: Number(quoteData.propertyPrice) || 0,
    freightDelivery: Number(quoteData.freightDelivery) || 0,
    siteWorkTotal: Number(quoteData.siteWorkTotal) || 0,
    deliveryItems: quoteData.freightDelivery > 0
      ? [
          {
            id: 'delivery',
            item: `Freight (${quoteData.deliveryRouteType === 'dealer_to_customer' ? 'Dealer to Site' : quoteData.deliveryRouteType === 'factory_to_customer' ? 'Factory to Site' : 'Factory to Dealer'}${quoteData.deliveryMiles ? ` · ${quoteData.deliveryMiles} mi` : ''}${quoteData.escortsCount ? ` · ${quoteData.escortsCount} escort/side` : ''})`,
            qty: 1,
            amount: Number(quoteData.freightDelivery) || 0,
          },
        ]
      : [],
    siteWorkItems: (quoteData.lineItems || [])
      .filter((line) => line.category === 'mandatory_services' || line.category === 'site_work' || line.category === 'custom')
      .map((line) => ({
        id: line.id,
        item: line.name,
        qty: line.quantity || 1,
        amount: Number(line.totalPrice || line.unitPrice || 0),
      })),
    addons: (quoteData.lineItems || [])
      .filter((line) => line.category === 'addons' || line.category === 'options')
      .map((line) => ({
        id: line.id,
        item: line.name,
        qty: line.quantity || 1,
        amount: Number(line.totalPrice || line.unitPrice || 0),
      })),
    homeDescription: quoteData.homeDescription || '',
  };

  const catalogHomes = getEffectiveMasterCatalog();
  const catalogHome = catalogHomes.find((home) =>
    home.name === quote.homeModel && (!quote.manufacturer || home.manufacturer === quote.manufacturer),
  ) || catalogHomes.find((home) => home.name === quote.homeModel);
  const msrpPrice = Number(quoteData.msrpPrice) || Number(catalogHome?.msrp) || 0;
  const ehsPrice = Number(quoteData.ehsPrice) || Number(catalogHome?.ehsPrice) || Number(quoteData.financialTotals?.ehs_price_calculated) || quote.homePrice;
  const vipPrice = Number(quoteData.vipPrice) > 0
    ? Number(quoteData.vipPrice)
    : quote.homePrice > 0 && ehsPrice > 0 && quote.homePrice < ehsPrice - 0.005
      ? quote.homePrice
      : 0;
  const customerHomePrice = vipPrice > 0 ? vipPrice : quote.homePrice;
  const ehsSavings = msrpPrice > ehsPrice ? msrpPrice - ehsPrice : 0;
  const vipSavings = vipPrice > 0 && ehsPrice > vipPrice ? ehsPrice - vipPrice : 0;
  const totalHomeSavings = msrpPrice > customerHomePrice ? msrpPrice - customerHomePrice : 0;

  const deliveryTotal = quote.deliveryItems.reduce((acc, item) => acc + item.amount, 0);
  const siteWorkTotal = quote.siteWorkItems.reduce((acc, item) => acc + item.amount, 0);
  const addonsTotal = quote.addons.reduce((acc, item) => acc + item.amount, 0);

  const calculatedSubtotal = quote.homePrice + quote.propertyPrice + deliveryTotal + siteWorkTotal + addonsTotal - (quoteData.discounts || 0);
  const subtotal = quoteData.subtotal ?? calculatedSubtotal;
  const salesTax = quoteData.salesTax ?? Math.round(subtotal * 0.03 * 100) / 100;
  const estimatedTotal = quoteData.estimatedTotal ?? Math.round((subtotal + salesTax) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/quotes/${encodeURIComponent(quote.id)}`;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased print:bg-white print:p-0">
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
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <Link
            href={`/quotes/${quote.id}/edit`}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Edit this quote in the full quote system"
          >
            <span>✏️</span>
            <span>Edit Full Quote</span>
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
                <p className="text-xs text-slate-500 font-bold">Your trusted manufactured home dealership</p>
                <div className="text-[10.5px] text-slate-600 mt-1 space-y-0.5">
                  <p>📍 9011 McIntyre Rd, Brooksville, FL 34601</p>
                  <p>📞 352-558-8888 | ✉️ info@easyhomesource.com</p>
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[220px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8] block">Quote Summary</span>
              <div className="text-base font-black text-[#0B1E38] font-mono mt-0.5">Quote #{quote.quoteNumber}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">Date: {quote.quoteDate}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">CUSTOMER</span>
              <div className="text-base font-black text-[#0B1E38]">{quote.customerName}</div>
              {quote.customerPhone && <div className="text-slate-600 font-semibold">📞 {quote.customerPhone}</div>}
              {quote.customerEmail && <div className="text-slate-600 font-medium">✉️ {quote.customerEmail}</div>}
              {quote.customerAddress && <div className="text-slate-500 text-[11px]">📍 {quote.customerAddress}</div>}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">SALES REP</span>
              <div className="text-base font-black text-[#0B1E38]">{quote.salesperson}</div>
              {quote.salespersonEmail && <div className="text-slate-600 font-semibold">✉️ {quote.salespersonEmail}</div>}
              <div className="text-slate-500 text-[11px]">Easy HomeSource Housing Consultant</div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[#0F2A47] text-white px-6 py-4 shadow-md">
            <span className="text-xs uppercase tracking-wider font-extrabold">ESTIMATED TOTAL</span>
            <span className="font-black text-3xl tracking-tight font-mono">
              ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">Selected Home</h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="text-base font-black text-[#0B1E38]">{quote.homeModel || 'Home not specified'}</div>
              {quote.manufacturer && <div className="text-slate-600 font-bold mt-0.5">{quote.manufacturer}</div>}
              <div className="text-slate-500 font-semibold mt-1">
                {[quote.beds ? `${quote.beds} Beds` : '', quote.baths ? `${quote.baths} Baths` : '', quote.sqft ? `${quote.sqft.toLocaleString()} Sq. Ft.` : '', quote.dimensions].filter(Boolean).join(' | ')}
              </div>
              {quote.homeDescription && <p className="text-[11px] text-slate-500 leading-relaxed mt-2">{quote.homeDescription}</p>}
            </div>
          </div>

          {(msrpPrice > 0 || ehsPrice > 0) && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">Home Price Advantage</h2>
                  <p className="mt-0.5 text-[10.5px] text-slate-500">See the difference between MSRP and your Easy HomeSource home price.</p>
                </div>
                {totalHomeSavings > 0 && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
                    YOU SAVE ${totalHomeSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              <div className={`grid gap-3 ${vipPrice > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {msrpPrice > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">MSRP</div>
                    <div className="mt-1 font-mono text-lg font-black text-slate-500 line-through">
                      ${msrpPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="mt-1 text-[9.5px] text-slate-400">Manufacturer suggested retail price</div>
                  </div>
                )}

                {ehsPrice > 0 && (
                  <div className="rounded-xl border border-sky-200 bg-white p-3">
                    <div className="text-[9px] font-black uppercase tracking-wider text-[#1E6FA8]">Easy HomeSource Price</div>
                    <div className="mt-1 font-mono text-lg font-black text-[#0B4F86]">
                      ${ehsPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {ehsSavings > 0 && <div className="mt-1 text-[9.5px] font-bold text-emerald-700">${ehsSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} below MSRP</div>}
                  </div>
                )}

                {vipPrice > 0 && (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 shadow-xs">
                    <div className="text-[9px] font-black uppercase tracking-wider text-emerald-700">VIP Price</div>
                    <div className="mt-1 font-mono text-xl font-black text-emerald-800">
                      ${vipPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="mt-1 text-[9.5px] font-bold text-emerald-700">Additional VIP savings: ${vipSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">Pricing Details</h2>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-[#0F2A47] text-white px-4 py-2 font-bold text-[11px] flex justify-between">
                <span>Delivery</span><span>Qty / Amount</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {quote.deliveryItems.length > 0 ? quote.deliveryItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 bg-white">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{item.item}</td>
                      <td className="py-2.5 px-4 text-center font-mono w-16">{item.qty}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 w-28">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="py-3 px-4 text-slate-400">No delivery charge recorded.</td></tr>
                  )}
                  <tr className="bg-slate-50 font-bold text-[#0B1E38]">
                    <td colSpan={2} className="py-2 px-4">Delivery Total</td>
                    <td className="py-2 px-4 text-right font-mono font-black">${deliveryTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-[#0F2A47] text-white px-4 py-2 font-bold text-[11px] flex justify-between">
                <span>Site Work</span><span>Qty / Amount</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {quote.siteWorkItems.length > 0 ? quote.siteWorkItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 bg-white">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{item.item}</td>
                      <td className="py-2.5 px-4 text-center font-mono w-16">{item.qty}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 w-28">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="py-3 px-4 text-slate-400">No site-work line items recorded.</td></tr>
                  )}
                  <tr className="bg-slate-50 font-bold text-[#0B1E38]">
                    <td colSpan={2} className="py-2 px-4">Site Work Total</td>
                    <td className="py-2 px-4 text-right font-mono font-black">${siteWorkTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
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
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E6FA8]">Pricing Summary</h2>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between font-semibold"><span>{vipPrice > 0 ? 'VIP Home Price' : 'Easy HomeSource Home Price'}</span><span className="font-mono font-bold text-slate-900">${quote.homePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              {quote.propertyPrice > 0 && <div className="flex justify-between font-semibold"><span>Land / Homesite Parcel</span><span className="font-mono font-bold text-slate-900">${quote.propertyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>}
              <div className="flex justify-between font-semibold"><span>Delivery</span><span className="font-mono font-bold text-slate-900">${deliveryTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between font-semibold"><span>Site Work</span><span className="font-mono font-bold text-slate-900">${siteWorkTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              {addonsTotal > 0 && <div className="flex justify-between font-semibold"><span>Add-ons</span><span className="font-mono font-bold text-slate-900">${addonsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>}
              {quoteData.discounts > 0 && <div className="flex justify-between font-semibold text-emerald-700"><span>Discounts</span><span className="font-mono font-bold">-${quoteData.discounts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>}

              <div className="my-2 border-t border-slate-200" />
              <div className="flex justify-between font-bold text-slate-900 text-sm"><span>Subtotal</span><span className="font-mono font-black">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between font-bold text-[#1E6FA8]"><span>Sales Tax ({((quoteData.financialTotals?.sales_tax_rate ?? 0.03) * 100).toFixed(2)}%)</span><span className="font-mono">${salesTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>

              <div className="flex items-center justify-between rounded-xl bg-[#0F2A47] text-white px-5 py-3.5 mt-2 shadow-md">
                <span className="text-xs uppercase tracking-wider font-extrabold">Estimated Total</span>
                <span className="font-black text-2xl font-mono">${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs">
            <h3 className="font-black text-sm text-[#0B1E38]">Next Steps</h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 font-medium leading-relaxed">
              <li>Review this quote and contact your associate with any questions.</li>
              <li>Sign the deposit agreement to reserve your home.</li>
              <li>Schedule your site visit and begin the financing process.</li>
            </ol>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
            <h3 className="font-black text-xs text-slate-700 uppercase tracking-wider">Disclaimer</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">Site development pricing is an estimate based on visible conditions. Final pricing is subject to change based on actual site-specific requirements during installation. Prices are valid for 30 days from the quote date.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Authorized Housing Consultant</span>
              <div className="font-black text-sm text-[#0B1E38]">{quote.salesperson}</div>
              <div className="text-slate-500">📞 {quoteData.salespersonPhone || '(352) 558-8888'}{quote.salespersonEmail ? ` • ✉️ ${quote.salespersonEmail}` : ''}</div>
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

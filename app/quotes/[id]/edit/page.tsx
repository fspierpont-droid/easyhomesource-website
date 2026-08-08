'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { VERIFIED_TEAM_USERS } from '@/data/teamMembers';
import { FULL_MASTER_CATALOG_HOMES, type MasterCatalogHome } from '@/data/fullMasterCatalog.generated';
import {
  SERVICE_CATALOG,
  calculateBlockTieDown,
  calculateComprehensiveQuoteTotals,
  type QuoteFinancialTotals
} from '@/data/pricingSpreadsheet';
import { AuthGate } from '@/components/portal/AuthGate';
import { useAuth } from '@/lib/auth/AuthContext';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quoteId = params?.id as string;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    { key: 'customer', title: 'Customer', description: 'Who is this quote for?' },
    { key: 'home', title: 'Home', description: 'Choose the manufactured home' },
    { key: 'site', title: 'Site & Delivery', description: 'Where is it going?' },
    { key: 'pricing', title: 'Pricing', description: 'Line items, services, add-ons' },
    { key: 'financing', title: 'Financing', description: 'Payment & loan officer' },
    { key: 'notes', title: 'Notes', description: 'Customer & internal notes' },
    { key: 'review', title: 'Review', description: 'Generate & send' }
  ];

  // Quote State
  const [quoteNumber, setQuoteNumber] = useState('Q-2026-0801');
  const [customerName, setCustomerName] = useState('Sarah Jenkins');
  const [customerPhone, setCustomerPhone] = useState('352-555-0192');
  const [customerEmail, setCustomerEmail] = useState('sarah.j@example.com');
  const [salesperson, setSalesperson] = useState(user?.name || 'Scott Pierpont');

  // Home State
  const [selectedHome, setSelectedHome] = useState<MasterCatalogHome | null>(FULL_MASTER_CATALOG_HOMES[0]);
  const [basePrice, setBasePrice] = useState<number>(94900);
  const [factoryCost, setFactoryCost] = useState<number>(68328);
  const [builderFilter, setBuilderFilter] = useState('ALL');
  const [homeSearch, setHomeSearch] = useState('');

  // Site & Delivery State (NO SETBACKS)
  const [ownsLand, setOwnsLand] = useState(true);
  const [hasLien, setHasLien] = useState(false);
  const [landBudget, setLandBudget] = useState(0);
  const [deliveryRouteType, setDeliveryRouteType] = useState<'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer'>('dealer_to_customer');
  const [deliveryAddress, setDeliveryAddress] = useState('6645 W Erlen Ln, Homosassa, FL 34446');
  const [deliveryFreightPrice, setDeliveryFreightPrice] = useState(6600);
  const [deliveryFreightCost, setDeliveryFreightCost] = useState(5500);

  // Line Items & Services
  const [lineItems, setLineItems] = useState<any[]>([
    {
      id: 'li-1',
      sku: 'SITE-BLOCK-TIEDOWN',
      name: 'Block & Hurricane Tie-Down Installation',
      description: 'Concrete pier pads, cinder blocks, leveling, and Florida wind zone ground anchors.',
      category: 'mandatory_services',
      unitPrice: 5835,
      unitCost: 4668,
      quantity: 1,
      totalPrice: 5835,
      totalCost: 4668
    },
    {
      id: 'li-2',
      sku: 'HVAC-HP-3TON',
      name: '3.0-Ton Central A/C Heat Pump System (14.3 SEER2)',
      description: 'High-efficiency heat pump with digital thermostat, pad, and plenum tie-in.',
      category: 'mandatory_services',
      unitPrice: 5555,
      unitCost: 5050,
      quantity: 1,
      totalPrice: 5555,
      totalCost: 5050
    },
    {
      id: 'li-3',
      sku: 'SITE-DIRTPAD',
      name: 'Dirt Pad & Laser Site Grading (2 Loads)',
      description: 'Clearing, clean fill dirt import, compacting, and laser leveling.',
      category: 'mandatory_services',
      unitPrice: 2700,
      unitCost: 1800,
      quantity: 1,
      totalPrice: 2700,
      totalCost: 1800
    },
    {
      id: 'li-4',
      sku: 'SITE-WELL-4INCH',
      name: '4-Inch Potable Water Well System',
      description: 'Drilling up to 120ft, submersible pump, pressure tank, and plumbing tie-in.',
      category: 'mandatory_services',
      unitPrice: 7500,
      unitCost: 5800,
      quantity: 1,
      totalPrice: 7500,
      totalCost: 5800
    },
    {
      id: 'li-5',
      sku: 'SITE-SEPTIC-1050',
      name: '1,050-Gallon Septic Tank & Drainfield',
      description: 'Standard concrete septic tank, header line, distribution box, and gravity drainfield.',
      category: 'mandatory_services',
      unitPrice: 6800,
      unitCost: 5200,
      quantity: 1,
      totalPrice: 6800,
      totalCost: 5200
    },
    {
      id: 'li-6',
      sku: 'SITE-ELEC-PANEL',
      name: '200-Amp Electric Pole & Meter Panel',
      description: '200A service disconnect, utility pole/riser, and electrical conduit hookup.',
      category: 'mandatory_services',
      unitPrice: 2450,
      unitCost: 1850,
      quantity: 1,
      totalPrice: 2450,
      totalCost: 1850
    },
    {
      id: 'li-7',
      sku: 'SITE-PERMIT-PLAN',
      name: 'County Building, Zoning & Health Dept Permits',
      description: 'Hernando/Citrus county building permit processing and inspection fees.',
      category: 'mandatory_services',
      unitPrice: 2650,
      unitCost: 2650,
      quantity: 1,
      totalPrice: 2650,
      totalCost: 2650
    },
    {
      id: 'li-8',
      sku: 'SITE-SKIRTING-VINYL',
      name: 'Vented Vinyl Perimeter Skirting & Steps (2 Sets)',
      description: 'Full perimeter vinyl skirting with ground channel and 2 sets of code stairs.',
      category: 'mandatory_services',
      unitPrice: 3200,
      unitCost: 2200,
      quantity: 1,
      totalPrice: 3200,
      totalCost: 2200
    }
  ]);
  const [selectedServiceSku, setSelectedServiceSku] = useState(SERVICE_CATALOG[0].sku);
  const [discounts, setDiscounts] = useState(0);

  // Financing Tab (Optional Loan Officer)
  const [purchaseType, setPurchaseType] = useState<'cash' | 'financing'>('financing');
  const [financingStatus, setFinancingStatus] = useState('approved');
  const [preApprovalAmount, setPreApprovalAmount] = useState(180000);
  const [targetBudget, setTargetBudget] = useState(180000);
  const [ehsLoanOfficerUsed, setEhsLoanOfficerUsed] = useState(false);

  // Notes
  const [notesCustomer, setNotesCustomer] = useState('Turnkey land and home package proposal for Homosassa homesite.');
  const [notesInternal, setNotesInternal] = useState('FHA pre-approval active.');
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  // Handle Home Selection
  const handleSelectHome = (h: MasterCatalogHome) => {
    setSelectedHome(h);
    setBasePrice(h.ehsPrice || 0);
    setFactoryCost(h.estFactoryCost || Math.round((h.ehsPrice || 0) * 0.72));

    const homeClass = (h.width || 14) > 18 ? 'double' : 'single';
    const bt = calculateBlockTieDown(h.length || 60, homeClass);

    setLineItems((prev) =>
      prev.map((item) =>
        item.sku === 'SITE-BLOCK-TIEDOWN'
          ? {
              ...item,
              unitPrice: bt.price,
              unitCost: bt.cost,
              totalPrice: bt.price * item.quantity,
              totalCost: bt.cost * item.quantity,
              description: `Concrete pier pads, cinder blocks, leveling, and ground anchors (${bt.matchedLength}ft ${homeClass} table).`
            }
          : item
      )
    );
  };

  const handleAddLineItem = () => {
    const item = SERVICE_CATALOG.find((s) => s.sku === selectedServiceSku);
    if (!item) return;

    const newItem = {
      id: `li-${Date.now()}`,
      sku: item.sku,
      name: item.name,
      description: item.description,
      category: item.category,
      unitPrice: item.defaultPrice,
      unitCost: item.defaultCost || Math.round(item.defaultPrice * 0.75),
      quantity: 1,
      totalPrice: item.defaultPrice,
      totalCost: item.defaultCost || Math.round(item.defaultPrice * 0.75)
    };

    setLineItems((prev) => [...prev, newItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Calculate Totals
  const siteWorkItems = lineItems.filter((i) => i.category === 'mandatory_services' || i.category === 'site_work');
  const addOnItems = lineItems.filter((i) => i.category === 'addons' || i.category === 'options');

  const subtotalSiteWork = siteWorkItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  const subtotalAddOns = addOnItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  const costSiteWork = siteWorkItems.reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);
  const costAddOns = addOnItems.reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);

  const quoteTotals: QuoteFinancialTotals = calculateComprehensiveQuoteTotals(
    basePrice + landBudget,
    deliveryFreightPrice,
    subtotalSiteWork,
    subtotalAddOns,
    discounts,
    factoryCost,
    deliveryFreightCost,
    costSiteWork,
    costAddOns,
    0.03
  );

  const activeLoanFee = ehsLoanOfficerUsed ? 1000 : 0;
  const netTakeHome = (quoteTotals.house_gross_margin + quoteTotals.service_profit) - (quoteTotals.admin_fee + activeLoanFee + quoteTotals.salesperson_commission);
  const targetMet = netTakeHome >= 20000;

  const filteredCatalog = FULL_MASTER_CATALOG_HOMES.filter((h) => {
    if (builderFilter !== 'ALL' && h.manufacturer !== builderFilter) return false;
    if (!homeSearch.trim()) return true;
    const text = [h.name, h.manufacturer, h.series, h.dimensions].filter(Boolean).join(' ').toLowerCase();
    return text.includes(homeSearch.toLowerCase().trim());
  });

  const distinctBuilders = ['ALL', ...new Set(FULL_MASTER_CATALOG_HOMES.map((h) => h.manufacturer))];

  const handleSaveQuote = (status: 'DRAFT' | 'SENT_TO_BUYER' = 'SENT_TO_BUYER') => {
    setSavingStatus('saving');
    setTimeout(() => {
      setSavingStatus('saved');
      router.push('/portal?view=library');
    }, 500);
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
        <PortalSidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          totalPropertiesCount={17}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href="/portal?view=library" className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-semibold">
                ← All quotes
              </Link>
              <div className="text-[10.5px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">
                Edit Proposal • {quoteNumber}
              </div>
              <h1 className="text-2xl font-black text-[#0B1E38] tracking-tight">
                {customerName}
              </h1>
              {selectedHome && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedHome.manufacturer} • {selectedHome.name} • {selectedHome.dimensions}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">
                {savingStatus === 'saving' && 'Saving…'}
                {savingStatus === 'saved' && 'All changes saved'}
              </span>
              <button
                type="button"
                onClick={() => handleSaveQuote('DRAFT')}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs shadow-2xs cursor-pointer"
              >
                Save draft
              </button>
            </div>
          </div>

          {/* Workflow Body & Split Layout */}
          <div className="p-6 sm:p-8 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[220px_1fr_340px] gap-6 items-start">
            {/* Step Navigation Ribbon */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Workflow</span>
                <span className="text-xs font-black text-slate-800">Step {currentStep + 1} of {steps.length}</span>
              </div>
              {steps.map((step, idx) => {
                const isActive = currentStep === idx;
                const isPassed = idx < currentStep;

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1E6FA8]/10 border border-[#1E6FA8]/20 text-[#0B1E38]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isPassed ? 'bg-emerald-100 text-emerald-800' : isActive ? 'bg-[#0B1E38] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate">{step.title}</div>
                      <div className="text-[9.5px] text-slate-400 truncate">{step.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Form Workspace */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
              {/* STEP 1: CUSTOMER */}
              {currentStep === 0 && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-base font-black text-[#0B1E38]">Customer Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#1E6FA8]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Assigned Consultant</label>
                      <select
                        value={salesperson}
                        onChange={(e) => setSalesperson(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                      >
                        {VERIFIED_TEAM_USERS.map((u) => (
                          <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: HOME CATALOG */}
              {currentStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-base font-black text-[#0B1E38]">Select Manufactured Home</h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={builderFilter}
                        onChange={(e) => setBuilderFilter(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-xl font-bold bg-white"
                      >
                        {distinctBuilders.map((b) => (
                          <option key={b} value={b}>{b === 'ALL' ? 'All Builders' : b}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Search models..."
                        value={homeSearch}
                        onChange={(e) => setHomeSearch(e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {filteredCatalog.map((h) => {
                      const isSelected = selectedHome?.slug === h.slug;

                      return (
                        <div
                          key={h.slug}
                          onClick={() => handleSelectHome(h)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1E6FA8]/10 border-[#1E6FA8] ring-2 ring-[#1E6FA8]/20 shadow-xs'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-bold text-xs text-[#0B1E38] truncate">{h.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{h.manufacturer} • {h.dimensions}</div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-black text-[#1E6FA8]">${Math.round(h.ehsPrice || 0).toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400">{h.bedrooms}b/{h.bathrooms}ba</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: SITE & DELIVERY (NO SETBACKS) */}
              {currentStep === 2 && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-base font-black text-[#0B1E38]">Site &amp; Delivery Destination</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-700">Customer owns the land?</span>
                      <input
                        type="checkbox"
                        checked={ownsLand}
                        onChange={(e) => setOwnsLand(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0F2A47]"
                      />
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-700">Lien on land?</span>
                      <input
                        type="checkbox"
                        checked={hasLien}
                        onChange={(e) => setHasLien(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0F2A47]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Delivery Destination Address</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Route Type</label>
                      <select
                        value={deliveryRouteType}
                        onChange={(e) => setDeliveryRouteType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                      >
                        <option value="dealer_to_customer">Dealership to Customer Site</option>
                        <option value="factory_to_customer">Factory Direct to Customer Site</option>
                        <option value="factory_to_dealer">Factory to Dealership Lot</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Delivery Freight Price ($)</label>
                      <input
                        type="number"
                        value={deliveryFreightPrice}
                        onChange={(e) => setDeliveryFreightPrice(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-black text-[#1E6FA8]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PRICING & LINE ITEMS */}
              {currentStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-base font-black text-[#0B1E38]">Service Catalog &amp; Site Work</h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedServiceSku}
                        onChange={(e) => setSelectedServiceSku(e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white max-w-xs"
                      >
                        {SERVICE_CATALOG.map((s) => (
                          <option key={s.sku} value={s.sku}>{s.name} - ${s.defaultPrice.toLocaleString()}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="px-3.5 py-1.5 bg-[#0F2A47] text-white font-bold rounded-xl shadow-2xs cursor-pointer"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-600">
                        <tr>
                          <th className="py-2.5 px-3">Line Item / Service</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Price ($)</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lineItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <div className="text-[10px] text-slate-400">{item.description}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-900">
                              ${item.totalPrice.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveLineItem(item.id)}
                                className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 5: FINANCING TAB (OPTIONAL LOAN OFFICER & DEPOSITS) */}
              {currentStep === 4 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-base font-black text-[#0B1E38]">Payment &amp; Financing (Optional Loan Officer)</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Tracks payment type, lender status, and whether an EHS loan officer is assigned to the sale.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Purchase Type</label>
                      <select
                        value={purchaseType}
                        onChange={(e) => setPurchaseType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                      >
                        <option value="cash">Cash / Self-Pay Sale</option>
                        <option value="financing">Lender Financing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Financing Status</label>
                      <select
                        value={financingStatus}
                        onChange={(e) => setFinancingStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                      >
                        <option value="not_applicable">Not applicable</option>
                        <option value="pending">Pending Application</option>
                        <option value="pre_approved">Pre-approved</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">EHS loan officer used?</div>
                        <div className="text-xs text-slate-500">Adds $1,000.00 loan fee to internal calculations.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={ehsLoanOfficerUsed}
                        onChange={(e) => setEhsLoanOfficerUsed(e.target.checked)}
                        className="w-5 h-5 rounded text-[#0F2A47] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Customer Target Budget ($)</label>
                      <input
                        type="number"
                        value={targetBudget}
                        onChange={(e) => setTargetBudget(Number(e.target.value) || 0)}
                        placeholder="e.g. 180000"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pre-approval Amount ($)</label>
                      <input
                        type="number"
                        value={preApprovalAmount}
                        onChange={(e) => setPreApprovalAmount(Number(e.target.value) || 0)}
                        placeholder="e.g. 200000"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: NOTES */}
              {currentStep === 5 && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-base font-black text-[#0B1E38]">Proposal &amp; Internal Notes</h3>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Customer-Facing Notes</label>
                    <textarea
                      rows={3}
                      value={notesCustomer}
                      onChange={(e) => setNotesCustomer(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Internal Notes (Hidden from customer)</label>
                    <textarea
                      rows={2}
                      value={notesInternal}
                      onChange={(e) => setNotesInternal(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50"
                    />
                  </div>
                </div>
              )}

              {/* STEP 7: REVIEW */}
              {currentStep === 6 && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-base font-black text-[#0B1E38]">Review &amp; Update Proposal</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Check the live totals panel on the right. Your proposal includes all itemized services, DOT transport, and statutory 3% Florida sales tax.
                  </p>
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleSaveQuote('SENT_TO_BUYER')}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xs cursor-pointer"
                    >
                      ✓ Save &amp; Mark as Sent
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-5 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      📄 Download / Print PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  ← Back
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                    className="px-5 py-2 bg-[#0F2A47] hover:bg-[#081628] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveQuote('SENT_TO_BUYER')}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* LIVE TOTALS PANEL ON THE RIGHT (Exact 100% Match to User Screenshot) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 sticky top-6 text-xs">
              {/* CUSTOMER-FACING Section */}
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                  CUSTOMER-FACING
                </div>
                <div className="mt-2 space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span>Home</span>
                    <span className="font-semibold tabular">${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold tabular">${deliveryFreightPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Site Work</span>
                    <span className="font-semibold tabular">${subtotalSiteWork.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add-ons</span>
                    <span className="font-semibold tabular">${subtotalAddOns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="my-1.5 border-t border-slate-100" />

                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Subtotal</span>
                    <span className="tabular">${quoteTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Financed subtotal</span>
                    <span className="tabular">${quoteTotals.financed_subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Non-financed subtotal</span>
                    <span className="tabular">${quoteTotals.non_financed_subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Tax basis</span>
                    <span className="tabular">${quoteTotals.tax_basis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-bold">
                    <span>3% sales tax (3.00%)</span>
                    <span className="tabular text-[#1E6FA8]">${quoteTotals.sales_tax_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {/* Dark Navy ESTIMATED TOTAL Banner matching screenshot */}
                  <div className="flex items-center justify-between rounded-xl bg-[#0F2A47] text-white px-3.5 py-3 mt-2 shadow-md">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider">ESTIMATED TOTAL</span>
                    <span className="font-black text-xl tabular">
                      ${quoteTotals.estimated_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* INTERNAL ONLY Section matching screenshot */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                  INTERNAL ONLY
                </div>
                <div className="mt-2 space-y-1.5 text-slate-700 text-[11px]">
                  <div className="flex justify-between">
                    <span>Factory cost</span>
                    <span className="tabular">${quoteTotals.factory_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calculated EHS price</span>
                    <span className="tabular">${quoteTotals.ehs_price_calculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House gross margin</span>
                    <span className="tabular">${quoteTotals.house_gross_margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commissionable house margin</span>
                    <span className="tabular">${quoteTotals.commissionable_house_margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service profit</span>
                    <span className="font-bold text-emerald-700 tabular">${quoteTotals.service_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin fee (5%)</span>
                    <span className="tabular">${quoteTotals.admin_fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan fee</span>
                    <span className="tabular">${activeLoanFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salesperson commission (20%)</span>
                    <span className="tabular">${quoteTotals.salesperson_commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {/* Net Take Home Box matching screenshot */}
                  <div className={`p-2.5 rounded-xl border mt-2 flex items-center justify-between ${
                    targetMet
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <span className="font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1">
                      {targetMet ? '✓' : '⚠️'} NET TAKE HOME
                    </span>
                    <span className="font-black text-sm tabular">
                      ${netTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Floor: $20,000.00
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
EOF
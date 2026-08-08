'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { VERIFIED_TEAM_USERS } from '@/data/teamMembers';
import { FULL_MASTER_CATALOG_HOMES, type MasterCatalogHome } from '@/data/fullMasterCatalog.generated';
import { INITIAL_PROPERTIES } from '@/lib/db/propertyStore';
import {
  SERVICE_CATALOG,
  calculateBlockTieDown,
  calculateSkirtingByDimensions,
  calculateComprehensiveQuoteTotals,
  type QuoteFinancialTotals
} from '@/data/pricingSpreadsheet';
import { AuthGate } from '@/components/portal/AuthGate';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  saveQuoteToStore,
  type SavedQuote,
  type SelectedQuoteLineItem,
  type DepositItem
} from '@/data/quotesStore';

export default function NewQuoteBuilderPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'home' | 'site' | 'pricing' | 'financing' | 'notes' | 'review'>('customer');

  const newId = useMemo(() => `quote-${Date.now()}`, []);
  const newQuoteNumber = useMemo(() => `Q-2026-${Math.floor(1000 + Math.random() * 9000)}`, []);

  // 1. Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('352-555-0199');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Central Florida Homesite');
  const [salesperson, setSalesperson] = useState(user?.name || 'Scott Pierpont');
  const [salespersonEmail, setSalespersonEmail] = useState(user?.email || 'scott@easyhomesource.com');
  const [status, setStatus] = useState<'DRAFT' | 'SENT_TO_BUYER' | 'LENDER_REVIEW' | 'APPROVED' | 'IN_CONTRACT'>('DRAFT');

  // 2. Selected Home (from verified Master Catalog)
  const [homeSearch, setHomeSearch] = useState('');
  const [builderFilter, setBuilderFilter] = useState('ALL');
  const [selectedHome, setSelectedHome] = useState<MasterCatalogHome | null>(FULL_MASTER_CATALOG_HOMES[0] || null);
  const [homeModel, setHomeModel] = useState(FULL_MASTER_CATALOG_HOMES[0]?.name || 'Move on Up (18x60 3b/2ba)');
  const [manufacturer, setManufacturer] = useState(FULL_MASTER_CATALOG_HOMES[0]?.manufacturer || 'CLAYTON Addison');
  const [series, setSeries] = useState(FULL_MASTER_CATALOG_HOMES[0]?.series || 'Tempo Series');
  const [beds, setBeds] = useState<number>(FULL_MASTER_CATALOG_HOMES[0]?.bedrooms || 3);
  const [baths, setBaths] = useState<number>(FULL_MASTER_CATALOG_HOMES[0]?.bathrooms || 2);
  const [sqft, setSqft] = useState<number>(FULL_MASTER_CATALOG_HOMES[0]?.squareFeet || 1080);
  const [dimensions, setDimensions] = useState(FULL_MASTER_CATALOG_HOMES[0]?.dimensions || "18' x 60'");
  const [homeWidth, setHomeWidth] = useState<number>(FULL_MASTER_CATALOG_HOMES[0]?.width || 18);
  const [homeLength, setHomeLength] = useState<number>(FULL_MASTER_CATALOG_HOMES[0]?.length || 60);
  const [basePrice, setBasePrice] = useState<number>(FULL_MASTER_CATALOG_HOMES[0]?.ehsPrice || 94900);
  const [factoryCost, setFactoryCost] = useState<number>(FULL_MASTER_CATALOG_HOMES[0]?.estFactoryCost || 68328);

  // 3. Site & Delivery
  const [landOption, setLandOption] = useState<'OWNED' | 'PARCEL' | 'CUSTOM'>('OWNED');
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('6645 W Erlen Ln, Homosassa, FL 34446');
  const [propertyPrice, setPropertyPrice] = useState<number>(0);
  const [deliveryRouteType, setDeliveryRouteType] = useState<'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer'>('dealer_to_customer');
  const [deliveryMiles, setDeliveryMiles] = useState<number>(32);
  const [escortsCount, setEscortsCount] = useState<number>(1);
  const [deliveryFreightPrice, setDeliveryFreightPrice] = useState<number>(3850);
  const [deliveryFreightCost, setDeliveryFreightCost] = useState<number>(3500);

  // 4. Line Items & Services (Permits $2,000 flat)
  const [lineItems, setLineItems] = useState<SelectedQuoteLineItem[]>([
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
      description: 'High-efficiency heat pump with digital thermostat, equipment pad, and plenum tie-in.',
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
      description: 'Clearing, clean fill dirt import, compacting, and laser leveling for solid home pad.',
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
      sku: 'SITE-PERMIT-PLAN',
      name: 'County Building, Zoning & Health Dept Permits',
      description: 'Hernando/Citrus county building permit processing, plan review, zoning, and health inspections ($2,000 standard).',
      category: 'mandatory_services',
      unitPrice: 2000,
      unitCost: 2000,
      quantity: 1,
      totalPrice: 2000,
      totalCost: 2000
    },
    {
      id: 'li-7',
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
  const [selectedServiceSku, setSelectedServiceSku] = useState(SERVICE_CATALOG[0]?.sku || 'SITE-PERMIT-PLAN');
  const [discounts, setDiscounts] = useState<number>(0);

  // 5. Financing Tab (Optional Loan Officer & Deposits)
  const [purchaseType, setPurchaseType] = useState<'cash' | 'financing'>('financing');
  const [financingStatus, setFinancingStatus] = useState('pending');
  const [preApprovalAmount, setPreApprovalAmount] = useState<number>(180000);
  const [targetBudget, setTargetBudget] = useState<number>(180000);
  const [ehsLoanOfficerUsed, setEhsLoanOfficerUsed] = useState<boolean>(false);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);

  // 6. Notes
  const [notesCustomer, setNotesCustomer] = useState('Standard turnkey package proposal for Central Florida.');
  const [notesInternal, setNotesInternal] = useState('');

  // Handle Home Selection
  const handleSelectHome = (h: MasterCatalogHome) => {
    if (!h) return;
    const homeDisplayName = h.name || 'Manufactured Home';
    const bedCount = h.bedrooms ?? 3;
    const bathCount = h.bathrooms ?? 2;
    const sqftCount = h.squareFeet ?? 1200;
    const dimText = h.dimensions || `${h.width || 24}' x ${h.length || 50}'`;

    setSelectedHome(h);
    setHomeModel(homeDisplayName);
    setManufacturer(h.manufacturer || 'CAVCO Plant City');
    setSeries(h.series || '');
    setBeds(bedCount);
    setBaths(bathCount);
    setSqft(sqftCount);
    setDimensions(dimText);
    setHomeWidth(h.width || 24);
    setHomeLength(h.length || 50);
    setBasePrice(h.ehsPrice || 0);
    setFactoryCost(h.estFactoryCost || Math.round((h.ehsPrice || 0) * 0.72));

    const homeClass = (h.width || 14) > 18 ? 'double' : 'single';
    const bt = calculateBlockTieDown(h.length || 60, homeClass);
    const skirting = calculateSkirtingByDimensions(h.width || 24, h.length || 50);

    setLineItems((prev) =>
      prev.map((item) => {
        if (item.sku === 'SITE-BLOCK-TIEDOWN') {
          return {
            ...item,
            unitPrice: bt.price,
            unitCost: bt.cost,
            totalPrice: bt.price * (item.quantity || 1),
            totalCost: bt.cost * (item.quantity || 1),
            description: `Concrete pier pads, cinder blocks, leveling, and ground anchors (${bt.matchedLength}ft ${homeClass} table).`
          };
        }
        if (item.sku === 'SITE-SKIRTING-VINYL' || item.sku === 'SITE-SKIRTING-VALOR') {
          return {
            ...item,
            quantity: skirting.linearFeet,
            description: `Vented vinyl perimeter skirting (${skirting.linearFeet} linear ft) with top rail and ground track.`
          };
        }
        return item;
      })
    );
  };

  const handleAddLineItem = () => {
    const item = SERVICE_CATALOG.find((s) => s.sku === selectedServiceSku);
    if (!item) return;

    const newItem: SelectedQuoteLineItem = {
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
  const addOnItems = lineItems.filter((i) => i.category === 'addons' || i.category === 'options' || i.category === 'custom');

  const subtotalSiteWork = siteWorkItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  const subtotalAddOns = addOnItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  const costSiteWork = siteWorkItems.reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);
  const costAddOns = addOnItems.reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);

  const activeLoanFee = ehsLoanOfficerUsed ? 1000 : 0;

  const quoteTotals: QuoteFinancialTotals = useMemo(() => {
    return calculateComprehensiveQuoteTotals(
      basePrice + propertyPrice,
      deliveryFreightPrice,
      subtotalSiteWork,
      subtotalAddOns,
      discounts,
      factoryCost,
      deliveryFreightCost,
      costSiteWork + costAddOns,
      activeLoanFee,
      0.03
    );
  }, [
    basePrice,
    propertyPrice,
    deliveryFreightPrice,
    subtotalSiteWork,
    subtotalAddOns,
    discounts,
    factoryCost,
    deliveryFreightCost,
    costSiteWork,
    costAddOns,
    activeLoanFee
  ]);

  const netTakeHome = quoteTotals.house_gross_margin + quoteTotals.service_profit - quoteTotals.admin_fee - quoteTotals.loan_fee - quoteTotals.salesperson_commission;
  const targetMet = netTakeHome >= 20000;

  const filteredCatalog = useMemo(() => {
    return FULL_MASTER_CATALOG_HOMES.filter((h) => {
      if (!h) return false;
      if (builderFilter !== 'ALL' && h.manufacturer !== builderFilter) return false;
      if (!homeSearch.trim()) return true;
      const text = `${h.name || ''} ${h.manufacturer || ''} ${h.series || ''} ${h.bedrooms || ''} bed ${h.bathrooms || ''} bath ${h.squareFeet || ''}`.toLowerCase();
      return text.includes(homeSearch.toLowerCase().trim());
    });
  }, [builderFilter, homeSearch]);

  const handleSaveAndCreate = (initialStatus?: 'DRAFT' | 'SENT_TO_BUYER' | 'LENDER_REVIEW' | 'APPROVED' | 'IN_CONTRACT') => {
    const finalQuote: SavedQuote = {
      id: newId,
      quoteNumber: newQuoteNumber,
      quoteDate: new Date().toISOString().slice(0, 10),
      customerName: customerName.trim() || 'New Home Buyer',
      customerPhone,
      customerEmail,
      customerAddress,
      salesperson,
      salespersonEmail,
      salespersonTitle: 'Authorized Housing Consultant',
      salespersonPhone: '(352) 558-8888',
      status: initialStatus || status,
      homeModel,
      manufacturer,
      series,
      beds,
      baths,
      sqft,
      dimensions,
      homeWidth,
      homeLength,
      homePrice: basePrice,
      factoryCost,
      propertyAddress,
      propertyPrice,
      deliveryRouteType,
      deliveryMiles,
      escortsCount,
      freightDelivery: deliveryFreightPrice,
      freightCost: deliveryFreightCost,
      siteWorkTotal: subtotalSiteWork + subtotalAddOns,
      siteWorkCost: costSiteWork + costAddOns,
      lineItems,
      discounts,
      purchaseType,
      financingStatus,
      preApprovalAmount,
      targetBudget,
      ehsLoanOfficerUsed,
      activeLoanFee,
      deposits,
      subtotal: quoteTotals.subtotal,
      financedSubtotal: quoteTotals.financed_subtotal,
      nonFinancedSubtotal: quoteTotals.non_financed_subtotal,
      taxBasis: quoteTotals.tax_basis,
      salesTax: quoteTotals.sales_tax_total,
      totalTurnkeyPrice: quoteTotals.estimated_total,
      estimatedTotal: quoteTotals.estimated_total,
      financialTotals: quoteTotals,
      notes: notesCustomer,
      notesCustomer,
      notesInternal,
      shareToken: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveQuoteToStore(finalQuote);
    router.push(`/quotes/${newId}/edit`);
  };

  return (
    <AuthGate>
      <div className="flex h-screen bg-slate-100/70 font-sans text-slate-800 antialiased overflow-hidden">
        <PortalSidebar
          activeNav="library"
          onNavChange={(nav) => {
            if (nav === 'library') router.push('/portal?view=library');
            else if (nav === 'dashboard') router.push('/portal');
            else if (nav === 'ready') router.push('/portal?view=ready');
            else if (nav === 'catalog') router.push('/portal?view=catalog');
            else if (nav === 'properties') router.push('/portal?view=properties');
            else if (nav === 'settings') router.push('/settings');
          }}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/portal?view=library"
                  className="text-xs font-bold text-[#1E6FA8] hover:underline flex items-center gap-1"
                >
                  ← Back to Quote Library
                </Link>
                <span className="text-slate-300">|</span>
                <span className="font-mono text-xs font-black text-[#0B1E38] bg-slate-100 px-2 py-0.5 rounded">
                  {newQuoteNumber}
                </span>
              </div>
              <h1 className="text-xl font-black text-[#0B1E38] mt-0.5">
                New Master Quote Proposal Builder
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveAndCreate('DRAFT')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer"
              >
                ✓ Create &amp; Open in Full Editor
              </button>
            </div>
          </header>

          {/* Tabs */}
          <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'customer', label: '1. Customer & Rep', icon: '👤' },
              { id: 'home', label: '2. Home Selection', icon: '🏡' },
              { id: 'site', label: '3. Land & Freight', icon: '🚚' },
              { id: 'pricing', label: '4. Line Items & Services', icon: '🛠️' },
              { id: 'financing', label: '5. Financing & Deposits', icon: '💳' },
              { id: 'notes', label: '6. Notes & Terms', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#1E6FA8] text-[#0B1E38] bg-slate-50/80'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 max-w-7xl w-full mx-auto grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'customer' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h2 className="text-lg font-black text-[#0B1E38]">Customer &amp; Consultant</h2>
                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
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

              {activeTab === 'home' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h2 className="text-lg font-black text-[#0B1E38]">Select Manufactured Home (225 Verified Models)</h2>
                  <input
                    type="text"
                    value={homeSearch}
                    onChange={(e) => setHomeSearch(e.target.value)}
                    placeholder="Search 225 models by name, beds, sqft..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl text-xs">
                    {filteredCatalog.slice(0, 40).map((h) => {
                      const homeDisplayName = h.name || 'Manufactured Home';
                      const bedCount = h.bedrooms ?? 3;
                      const bathCount = h.bathrooms ?? 2;
                      const sqftCount = h.squareFeet ?? 1200;
                      const dimText = h.dimensions || `${h.width || 24}' x ${h.length || 50}'`;

                      return (
                        <div
                          key={h.slug || h.name}
                          onClick={() => handleSelectHome(h)}
                          className={`p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                            (selectedHome?.name === h.name || homeModel === homeDisplayName) ? 'bg-sky-50 border-l-4 border-[#1E6FA8]' : ''
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[#0B1E38] text-sm">{homeDisplayName}</div>
                            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              {h.manufacturer} • {h.series ? `${h.series} • ` : ''}{bedCount}b/{bathCount}ba • {sqftCount.toLocaleString()} sq ft • {dimText}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-[#0F2A47] text-sm">
                              ${(h.ehsPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Cost: ${(h.estFactoryCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'site' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h2 className="text-lg font-black text-[#0B1E38]">Land &amp; Delivery Freight</h2>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800">Default Rule:</span> Customer owns land ($0.00). Or enter land budget:
                    <input
                      type="number"
                      value={propertyPrice}
                      onChange={(e) => setPropertyPrice(Number(e.target.value) || 0)}
                      className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h2 className="text-lg font-black text-[#0B1E38]">Services &amp; Line Items</h2>
                  <div className="flex gap-2">
                    <select
                      value={selectedServiceSku}
                      onChange={(e) => setSelectedServiceSku(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                    >
                      {SERVICE_CATALOG.map((s) => (
                        <option key={s.sku} value={s.sku}>{s.name} — ${s.defaultPrice.toLocaleString()}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="px-4 py-2 bg-[#0F2A47] text-white font-bold rounded-xl text-xs"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl text-xs">
                    {lineItems.map((item) => (
                      <div key={item.id} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-[10.5px] text-slate-500">{item.description}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-900">${(item.totalPrice || 0).toLocaleString()}</span>
                          <button onClick={() => handleRemoveLineItem(item.id)} className="text-rose-600 font-bold">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'financing' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <h2 className="text-lg font-black text-[#0B1E38]">Financing &amp; Loan Officer</h2>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span>EHS Loan Officer Used ($1,000 fee)?</span>
                    <input
                      type="checkbox"
                      checked={ehsLoanOfficerUsed}
                      onChange={(e) => setEhsLoanOfficerUsed(e.target.checked)}
                      className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <h2 className="text-lg font-black text-[#0B1E38]">Proposal Notes</h2>
                  <textarea
                    rows={4}
                    value={notesCustomer}
                    onChange={(e) => setNotesCustomer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* Sticky Live Totals */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 sticky top-24 self-start text-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                CUSTOMER-FACING
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Home</span>
                  <span className="font-semibold tabular">${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {propertyPrice > 0 && (
                  <div className="flex justify-between">
                    <span>Land / Parcel</span>
                    <span className="font-semibold tabular">${propertyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold tabular">${deliveryFreightPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Site Work</span>
                  <span className="font-semibold tabular">${subtotalSiteWork.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="my-1.5 border-t border-slate-100" />

                <div className="flex justify-between font-bold text-slate-800">
                  <span>Subtotal</span>
                  <span className="tabular">${quoteTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-bold">
                  <span>3% sales tax (3.00%)</span>
                  <span className="tabular text-[#1E6FA8]">${quoteTotals.sales_tax_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#0F2A47] text-white px-3.5 py-3 mt-2 shadow-md">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider">ESTIMATED TOTAL</span>
                  <span className="font-black text-xl tabular font-mono">
                    ${quoteTotals.estimated_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveAndCreate('DRAFT')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
              >
                ✓ Create &amp; Save Master Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

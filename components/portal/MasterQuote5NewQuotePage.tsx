'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/portal/AuthGate';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import {
  FULL_MASTER_CATALOG_HOMES,
  getEffectiveMasterCatalog,
  type MasterCatalogHome,
} from '@/data/fullMasterCatalog.generated';
import {
  SERVICE_CATALOG,
  calculateBlockTieDown,
  calculateSkirtingByDimensions,
  calculateTrimOut,
  getRecommendedSepticTankSize,
  type ServiceCatalogItem,
} from '@/data/pricingSpreadsheet';
import { VERIFIED_TEAM_USERS } from '@/data/teamMembers';
import { useAuth } from '@/lib/auth/AuthContext';
import { calculateNewQuoteTotals } from '@/lib/quotes/newQuoteTotals';
import {
  saveQuoteToServer,
  type DepositItem,
  type SavedQuote,
  type SelectedQuoteLineItem,
} from '@/data/quotesStore';
import type { Property } from '@/types/property';

type Tab = 'customer' | 'home' | 'site' | 'services' | 'financing' | 'review';
type RouteType = 'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer';

const SETUP_SKUS = new Set([
  'SITE-BLOCK-TIEDOWN',
  'SITE-TRIMOUT',
  'SITE-PERIMETER-STABILIZATION',
  'SITE-STEPS-2SET',
  'SITE-SKIRTING-VALOR',
]);

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
}

function sectionCount(home: MasterCatalogHome) {
  const floors = Number(home.floors) || 0;
  if (floors >= 1 && floors <= 3) return floors;
  const width = Number(home.width) || 14;
  if (width <= 18) return 1;
  if (width <= 36) return 2;
  return 3;
}

function homeClass(home: MasterCatalogHome): 'single' | 'double' | 'triple' {
  const sections = sectionCount(home);
  return sections === 1 ? 'single' : sections === 2 ? 'double' : 'triple';
}

function makeLine(
  id: string,
  sku: string,
  name: string,
  description: string,
  category: SelectedQuoteLineItem['category'],
  unitCost: number,
  unitPrice: number,
  quantity = 1,
): SelectedQuoteLineItem {
  return {
    id,
    sku,
    name,
    description,
    category,
    unitCost,
    unitPrice,
    quantity,
    totalCost: unitCost * quantity,
    totalPrice: unitPrice * quantity,
  };
}

function buildRequiredSetup(home: MasterCatalogHome): SelectedQuoteLineItem[] {
  const sections = sectionCount(home);
  const cls = homeClass(home);
  const block = calculateBlockTieDown(Number(home.length) || 60, cls);
  const trim = calculateTrimOut(sections);
  const skirting = calculateSkirtingByDimensions(Number(home.width) || 14, Number(home.length) || 60);

  return [
    makeLine(
      'setup-block',
      'SITE-BLOCK-TIEDOWN',
      'Block & Tie-Down & Vapor Barrier',
      `Master Quote 5 ${cls}-section table at ${block.matchedLength} ft.`,
      'mandatory_services',
      block.cost,
      block.price,
    ),
    makeLine(
      'setup-trim',
      'SITE-TRIMOUT',
      `Trim Out - ${trim.label}`,
      'Final interior/exterior trim after set; priced by home section count.',
      'mandatory_services',
      trim.cost,
      trim.price,
    ),
    makeLine(
      'setup-stabilization',
      'SITE-PERIMETER-STABILIZATION',
      'Perimeter Stabilization',
      'Perimeter stabilization to prevent washouts and maintain level ground around the home.',
      'mandatory_services',
      1000,
      1100,
    ),
    makeLine(
      'setup-steps',
      'SITE-STEPS-2SET',
      'Wooden Steps - 2 Sets',
      'Master Quote 5 two-set wooden-step package.',
      'mandatory_services',
      1000,
      2500,
    ),
    makeLine(
      'setup-skirting',
      'SITE-SKIRTING-VALOR',
      'Basic Valor Skirting',
      `${skirting.linearFeet} linear ft at $10/ft customer price ($8/ft cost), including vents, corners and trim.`,
      'mandatory_services',
      skirting.cost,
      skirting.price,
    ),
  ];
}

function calculateDelivery(
  routeType: RouteType,
  miles: number,
  sections: number,
  escortsPerSide: number,
) {
  if (routeType === 'factory_to_customer' || routeType === 'factory_to_dealer') {
    const cost = 6000 * sections;
    return { cost, price: cost * 1.1, note: '$6,000 cost / $6,600 price per transported section.' };
  }

  if (!(miles > 0)) return { cost: 0, price: 0, note: 'Enter actual dealership-to-site mileage to calculate delivery.' };
  const over50 = Math.max(0, miles - 50);
  const costPerSide = 800 + (250 * escortsPerSide) + (8.5 * over50) + (2 * escortsPerSide * over50);
  const cost = costPerSide * sections;
  return {
    cost,
    price: Math.round(cost * 1.1 * 100) / 100,
    note: '$800 base per section + $250 per escort; over 50 miles adds $8.50/truck-mile + $2/escort-mile.',
  };
}

function lineFromCatalog(item: ServiceCatalogItem, home: MasterCatalogHome): SelectedQuoteLineItem {
  if (item.sku === 'SITE-BLOCK-TIEDOWN') return buildRequiredSetup(home)[0];
  if (item.sku === 'SITE-TRIMOUT') return buildRequiredSetup(home)[1];
  if (item.sku === 'SITE-PERIMETER-STABILIZATION') return buildRequiredSetup(home)[2];
  if (item.sku === 'SITE-STEPS-2SET') return buildRequiredSetup(home)[3];
  if (item.sku === 'SITE-SKIRTING-VALOR') return buildRequiredSetup(home)[4];

  return makeLine(
    `li-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    item.sku,
    item.name,
    item.description,
    item.category,
    Number(item.defaultCost) || 0,
    Number(item.defaultPrice) || 0,
  );
}

export default function MasterQuote5NewQuotePage() {
  const router = useRouter();
  const { user } = useAuth();
  const initialHome = FULL_MASTER_CATALOG_HOMES[0];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('customer');
  const [catalog, setCatalog] = useState<MasterCatalogHome[]>(FULL_MASTER_CATALOG_HOMES);
  const [selectedHome, setSelectedHome] = useState<MasterCatalogHome>(initialHome);
  const [homeSearch, setHomeSearch] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('ALL');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [salespersonEmail, setSalespersonEmail] = useState(user?.email || 'scott@easyhomesource.com');
  const [salesperson, setSalesperson] = useState(user?.name || 'Scott Pierpont');

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyPrice, setPropertyPrice] = useState(0);

  const [routeType, setRouteType] = useState<RouteType>('dealer_to_customer');
  const [deliveryMiles, setDeliveryMiles] = useState(0);
  const [escortsPerSide, setEscortsPerSide] = useState(Number(initialHome?.width) > 14 ? 1 : 0);
  const [deliveryPriceOverride, setDeliveryPriceOverride] = useState<number | null>(null);

  const [lineItems, setLineItems] = useState<SelectedQuoteLineItem[]>(() => buildRequiredSetup(initialHome));
  const [selectedServiceSku, setSelectedServiceSku] = useState('');
  const [ehsLoanOfficerUsed, setEhsLoanOfficerUsed] = useState(false);
  const [notesCustomer, setNotesCustomer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const quoteId = useMemo(() => `quote-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, []);
  const quoteNumber = useMemo(() => `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`, []);

  useEffect(() => {
    if (!user) return;
    setSalesperson(user.name);
    setSalespersonEmail(user.email);
  }, [user]);

  useEffect(() => {
    const sync = () => setCatalog(getEffectiveMasterCatalog());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('ehs_catalog_updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('ehs_catalog_updated', sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch('/api/portal/properties', { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && data.success && Array.isArray(data.properties)) {
          setProperties(data.properties.filter((property: Property) => property.status === 'AVAILABLE'));
        }
      } catch (error) {
        console.error('Failed to load permanent properties for quote builder:', error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const manufacturers = useMemo(
    () => Array.from(new Set(catalog.map((home) => home.manufacturer))).sort(),
    [catalog],
  );

  const filteredHomes = useMemo(() => {
    const q = homeSearch.trim().toLowerCase();
    return catalog.filter((home) => {
      if (manufacturerFilter !== 'ALL' && home.manufacturer !== manufacturerFilter) return false;
      if (!q) return true;
      return `${home.manufacturer} ${home.series} ${home.name}`.toLowerCase().includes(q);
    });
  }, [catalog, homeSearch, manufacturerFilter]);

  const sections = sectionCount(selectedHome);
  const recommendedSepticTank = getRecommendedSepticTankSize(
    Number(selectedHome.bedrooms) || 0,
    Number(selectedHome.squareFeet) || 0,
  );

  const deliveryCalculated = useMemo(
    () => calculateDelivery(routeType, deliveryMiles, sections, escortsPerSide),
    [routeType, deliveryMiles, sections, escortsPerSide],
  );
  const deliveryPrice = deliveryPriceOverride ?? deliveryCalculated.price;
  const deliveryCost = deliveryCalculated.cost;

  const siteWorkPrice = lineItems
    .filter((item) => item.category === 'mandatory_services' || item.category === 'site_work' || item.category === 'custom')
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const siteWorkCost = lineItems
    .filter((item) => item.category === 'mandatory_services' || item.category === 'site_work' || item.category === 'custom')
    .reduce((sum, item) => sum + item.totalCost, 0);
  const addonsPrice = lineItems
    .filter((item) => item.category === 'addons' || item.category === 'options')
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const addonsCost = lineItems
    .filter((item) => item.category === 'addons' || item.category === 'options')
    .reduce((sum, item) => sum + item.totalCost, 0);

  const totals = useMemo(() => calculateNewQuoteTotals({
    homePrice: Number(selectedHome.ehsPrice) || 0,
    landPrice: propertyPrice,
    deliveryPrice,
    siteWorkPrice,
    addonsPrice,
    discountsPrice: 0,
    factoryCost: Number(selectedHome.estFactoryCost) || 0,
    deliveryCost,
    siteWorkCost,
    addonsCost,
    taxRate: 0.03,
  }), [selectedHome, propertyPrice, deliveryPrice, siteWorkPrice, addonsPrice, deliveryCost, siteWorkCost, addonsCost]);

  const serviceOptions = useMemo(
    () => SERVICE_CATALOG.filter((service) => !lineItems.some((line) => line.sku === service.sku)),
    [lineItems],
  );

  useEffect(() => {
    if (!serviceOptions.some((item) => item.sku === selectedServiceSku)) {
      setSelectedServiceSku(serviceOptions[0]?.sku || '');
    }
  }, [serviceOptions, selectedServiceSku]);

  function selectHome(home: MasterCatalogHome) {
    setSelectedHome(home);
    setEscortsPerSide(Number(home.width) > 14 ? 1 : 0);
    setDeliveryPriceOverride(null);
    setLineItems((current) => [
      ...buildRequiredSetup(home),
      ...current.filter((item) => !SETUP_SKUS.has(item.sku)),
    ]);
  }

  function selectProperty(id: string) {
    setSelectedPropertyId(id);
    if (!id) return;
    const property = properties.find((item) => item.id === id);
    if (!property) return;
    setPropertyAddress([property.address, property.city, property.state, property.zip].filter(Boolean).join(', '));
    setPropertyPrice(Number(property.price) || 0);
  }

  function addService() {
    const service = SERVICE_CATALOG.find((item) => item.sku === selectedServiceSku);
    if (!service || lineItems.some((line) => line.sku === service.sku)) return;
    setLineItems((current) => [...current, lineFromCatalog(service, selectedHome)]);
  }

  function updateLine(id: string, field: 'unitPrice' | 'quantity', value: number) {
    setLineItems((current) => current.map((item) => {
      if (item.id !== id) return item;
      const packaged = item.sku.startsWith('SITE-DIRTPAD-') || SETUP_SKUS.has(item.sku);
      const quantity = field === 'quantity' && !packaged ? Math.max(0, Number(value) || 0) : item.quantity;
      const unitPrice = field === 'unitPrice' ? Math.max(0, Number(value) || 0) : item.unitPrice;
      return {
        ...item,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        totalCost: item.unitCost * quantity,
      };
    }));
  }

  async function saveAndOpen() {
    if (isSaving) return;
    setSaveError(null);
    if (!customerName.trim()) {
      setSaveError('Customer name is required before creating a quote.');
      setActiveTab('customer');
      return;
    }

    setIsSaving(true);
    const now = new Date().toISOString();
    const assigned = VERIFIED_TEAM_USERS.find((member) => member.email === salespersonEmail);
    const quote: SavedQuote = {
      id: quoteId,
      quoteNumber,
      quoteDate: now,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      customerAddress: customerAddress.trim(),
      salesperson,
      salespersonEmail,
      salespersonTitle: assigned?.title,
      salespersonPhone: assigned?.phone,
      status: 'DRAFT',
      homeModel: selectedHome.name,
      manufacturer: selectedHome.manufacturer,
      series: selectedHome.series,
      beds: selectedHome.bedrooms,
      baths: selectedHome.bathrooms,
      sqft: selectedHome.squareFeet,
      dimensions: selectedHome.dimensions,
      homeWidth: selectedHome.width,
      homeLength: selectedHome.length,
      homePrice: Number(selectedHome.ehsPrice) || 0,
      factoryCost: Number(selectedHome.estFactoryCost) || 0,
      propertyAddress,
      propertyPrice,
      deliveryRouteType: routeType,
      deliveryMiles,
      escortsCount: escortsPerSide * sections,
      freightDelivery: deliveryPrice,
      freightCost: deliveryCost,
      siteWorkTotal: siteWorkPrice,
      siteWorkCost,
      lineItems,
      discounts: 0,
      purchaseType: 'financing',
      financingStatus: 'pending',
      preApprovalAmount: 0,
      targetBudget: 0,
      ehsLoanOfficerUsed,
      activeLoanFee: ehsLoanOfficerUsed ? 1000 : 0,
      deposits: [] as DepositItem[],
      subtotal: totals.subtotal,
      financedSubtotal: totals.financed_subtotal,
      nonFinancedSubtotal: totals.non_financed_subtotal,
      taxBasis: totals.tax_basis,
      salesTax: totals.sales_tax_total,
      totalTurnkeyPrice: totals.estimated_total,
      estimatedTotal: totals.estimated_total,
      financialTotals: totals,
      notes: notesCustomer,
      notesCustomer,
      notesInternal: '',
      createdAt: now,
      updatedAt: now,
    };

    try {
      const saved = await saveQuoteToServer(quote);
      router.push(`/quotes/${encodeURIComponent(saved.id)}/edit`);
    } catch (error) {
      console.error('Permanent quote create failed:', error);
      setSaveError(error instanceof Error ? error.message : 'Permanent quote save failed.');
      setIsSaving(false);
    }
  }

  const tabs: Array<[Tab, string]> = [
    ['customer', '1. Customer & Rep'],
    ['home', '2. Home Selection'],
    ['site', '3. Land & Freight'],
    ['services', '4. Line Items'],
    ['financing', '5. Financing'],
    ['review', '6. Review & Save'],
  ];

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <PortalSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href="/quotes" className="text-sm font-semibold text-sky-700">← Back to Quote Library</Link>
                <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">New Master Quote Proposal Builder</h1>
                <p className="mt-1 text-sm text-slate-500">Master Quote 5 pricing · {catalog.length} approved homes · permanent Mongo save before editor handoff</p>
              </div>
              <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold lg:hidden">Menu</button>
            </div>

            {saveError && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700">{saveError}</div>}

            <div className="mb-5 overflow-x-auto border-b border-slate-200 bg-white">
              <div className="flex min-w-max">
                {tabs.map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setActiveTab(key)} className={`min-h-12 px-5 py-3 text-sm font-extrabold ${activeTab === key ? 'border-b-4 border-sky-600 text-slate-950' : 'text-slate-500'}`}>{label}</button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                {activeTab === 'customer' && (
                  <div className="space-y-5">
                    <h2 className="text-2xl font-black">Customer & Consultant</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="sm:col-span-2"><span className="mb-2 block font-bold">Customer Name *</span><input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Customer full name" /></label>
                      <label><span className="mb-2 block font-bold">Phone</span><input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Optional" /></label>
                      <label><span className="mb-2 block font-bold">Email</span><input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Optional" /></label>
                      <label className="sm:col-span-2"><span className="mb-2 block font-bold">Current Address</span><input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Optional" /></label>
                      <label className="sm:col-span-2"><span className="mb-2 block font-bold">Assigned Consultant</span><select value={salespersonEmail} onChange={(e) => { const member = VERIFIED_TEAM_USERS.find((item) => item.email === e.target.value); setSalespersonEmail(e.target.value); setSalesperson(member?.name || e.target.value); }} className="w-full rounded-xl border border-slate-300 px-4 py-3">{VERIFIED_TEAM_USERS.filter((member) => member.active).map((member) => <option key={member.email} value={member.email}>{member.name} ({member.role})</option>)}</select></label>
                    </div>
                  </div>
                )}

                {activeTab === 'home' && (
                  <div className="space-y-5">
                    <div><h2 className="text-2xl font-black">Home Selection</h2><p className="mt-1 text-sm text-slate-500">Skyline Ocala, Champion Lake City and Clayton Russellville are excluded. Prices below come from Master Quote 5.</p></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={homeSearch} onChange={(e) => setHomeSearch(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3" placeholder="Search model / series / manufacturer" />
                      <select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3"><option value="ALL">All approved manufacturers</option>{manufacturers.map((name) => <option key={name}>{name}</option>)}</select>
                    </div>
                    <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                      {filteredHomes.map((home) => (
                        <button key={`${home.manufacturer}-${home.name}`} type="button" onClick={() => selectHome(home)} className={`w-full rounded-2xl border p-4 text-left ${selectedHome.manufacturer === home.manufacturer && selectedHome.name === home.name ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                          <div className="flex flex-wrap items-start justify-between gap-2"><div><div className="font-black">{home.name}</div><div className="text-sm text-slate-500">{home.manufacturer} · {home.series}</div><div className="mt-1 text-xs text-slate-500">{home.dimensions} · {home.bedrooms}/{home.bathrooms} · {home.squareFeet?.toLocaleString()} sq ft</div></div><div className="text-lg font-black text-slate-900">{money(home.ehsPrice)}</div></div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'site' && (
                  <div className="space-y-5">
                    <h2 className="text-2xl font-black">Land & Freight</h2>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No fake mileage or free freight is assumed. Dealer-to-customer pricing uses Master Quote 5 only after actual miles are entered.</div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="sm:col-span-2"><span className="mb-2 block font-bold">Permanent Property Package (optional)</span><select value={selectedPropertyId} onChange={(e) => selectProperty(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="">Customer-owned / custom site</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.address}, {property.city} {property.price ? `- ${money(property.price)}` : ''}</option>)}</select></label>
                      <label className="sm:col-span-2"><span className="mb-2 block font-bold">Delivery / Site Address</span><input value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Enter actual site address" /></label>
                      <label><span className="mb-2 block font-bold">Land Price</span><input type="number" min="0" value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value) || 0)} className="w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
                      <label><span className="mb-2 block font-bold">Route Type</span><select value={routeType} onChange={(e) => { setRouteType(e.target.value as RouteType); setDeliveryPriceOverride(null); }} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="dealer_to_customer">Dealership → Customer</option><option value="factory_to_customer">Factory → Customer</option><option value="factory_to_dealer">Factory → Dealership</option></select></label>
                      <label><span className="mb-2 block font-bold">Actual Miles</span><input type="number" min="0" step="0.1" value={deliveryMiles} onChange={(e) => { setDeliveryMiles(Number(e.target.value) || 0); setDeliveryPriceOverride(null); }} className="w-full rounded-xl border border-slate-300 px-4 py-3" disabled={routeType !== 'dealer_to_customer'} /></label>
                      <label><span className="mb-2 block font-bold">Escorts Per Section</span><input type="number" min="0" value={escortsPerSide} onChange={(e) => { setEscortsPerSide(Math.max(0, Number(e.target.value) || 0)); setDeliveryPriceOverride(null); }} className="w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
                      <label><span className="mb-2 block font-bold">Delivery Price / Custom Price</span><input type="number" min="0" step="0.01" value={deliveryPrice} onChange={(e) => setDeliveryPriceOverride(Math.max(0, Number(e.target.value) || 0))} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" /></label>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-bold uppercase text-slate-500">Calculated EHS Cost</div><div className="mt-1 text-xl font-black">{money(deliveryCost)}</div></div>
                    </div>
                    <p className="text-sm text-slate-500">{deliveryCalculated.note} Sections: {sections}. Total escorts recorded: {escortsPerSide * sections}.</p>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="space-y-5">
                    <div><h2 className="text-2xl font-black">Paid Line Items</h2><p className="mt-1 text-sm text-slate-500">Dirt, well, septic, utilities and bid work are never silently included. Add only what the site requires.</p></div>
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900"><strong>Septic sizing:</strong> Master Quote 5 indicates a minimum {recommendedSepticTank.toLocaleString()}-gallon tank for this home based on {selectedHome.bedrooms} bedrooms / {selectedHome.squareFeet?.toLocaleString()} sq ft. Only the 900-gallon base package has a verified base price in the supplied table, so larger tank pricing must be verified/custom-priced rather than invented.</div>
                    <div className="flex flex-col gap-3 sm:flex-row"><select value={selectedServiceSku} onChange={(e) => setSelectedServiceSku(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3">{serviceOptions.map((item) => <option key={item.sku} value={item.sku}>{item.name} - {money(item.defaultPrice)}</option>)}</select><button type="button" onClick={addService} disabled={!selectedServiceSku} className="rounded-xl bg-slate-900 px-5 py-3 font-black text-white disabled:opacity-50">+ Add Item</button></div>
                    <div className="space-y-3">
                      {lineItems.map((item) => {
                        const fixedQty = item.sku.startsWith('SITE-DIRTPAD-') || SETUP_SKUS.has(item.sku);
                        return <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-3"><div><div className="font-black">{item.name}</div><div className="mt-1 text-sm text-slate-500">{item.description}</div></div><button type="button" onClick={() => setLineItems((current) => current.filter((line) => line.id !== item.id))} className="min-h-11 min-w-11 rounded-xl border border-rose-200 text-xl text-rose-600" aria-label={`Remove ${item.name}`}>×</button></div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_180px]">
                            <label><span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Price / Custom Price</span><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateLine(item.id, 'unitPrice', Number(e.target.value))} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" /></label>
                            <label><span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Qty</span><input type="number" min="0" step="1" value={item.quantity} disabled={fixedQty} onChange={(e) => updateLine(item.id, 'quantity', Number(e.target.value))} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold disabled:bg-slate-100" /></label>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><div className="text-xs font-black uppercase text-slate-500">Line Total</div><div className="mt-1 text-lg font-black">{money(item.totalPrice)}</div></div>
                          </div>
                        </div>;
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'financing' && (
                  <div className="space-y-5"><h2 className="text-2xl font-black">Financing</h2><label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"><input type="checkbox" checked={ehsLoanOfficerUsed} onChange={(e) => setEhsLoanOfficerUsed(e.target.checked)} className="mt-1 h-5 w-5" /><div><div className="font-black">EHS Loan Officer Used</div><div className="text-sm text-slate-500">Master Quote 5 applies the $1,000 loan fee inside the home-profit/commission calculation when applicable.</div></div></label><label><span className="mb-2 block font-bold">Customer-facing Notes</span><textarea value={notesCustomer} onChange={(e) => setNotesCustomer(e.target.value)} rows={5} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Proposal notes" /></label></div>
                )}

                {activeTab === 'review' && (
                  <div className="space-y-5"><h2 className="text-2xl font-black">Review & Save</h2><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-4"><div className="text-xs font-black uppercase text-slate-500">Customer</div><div className="mt-1 font-black">{customerName || 'Customer name required'}</div><div className="text-sm text-slate-500">{customerPhone || 'No phone'} · {customerEmail || 'No email'}</div></div><div className="rounded-2xl border border-slate-200 p-4"><div className="text-xs font-black uppercase text-slate-500">Home</div><div className="mt-1 font-black">{selectedHome.name}</div><div className="text-sm text-slate-500">{selectedHome.manufacturer} · {money(selectedHome.ehsPrice)}</div></div></div><button type="button" onClick={saveAndOpen} disabled={isSaving} className="w-full rounded-2xl bg-emerald-600 px-5 py-4 text-lg font-black text-white shadow-sm disabled:opacity-60">{isSaving ? 'Saving to Permanent Quote Library…' : '✓ Create & Open in Full Editor'}</button></div>
                )}
              </section>

              <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-5">
                <div className="text-xs font-black uppercase tracking-wider text-sky-700">Customer-facing</div>
                <div className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-4"><span>Home</span><strong>{money(selectedHome.ehsPrice)}</strong></div><div className="flex justify-between gap-4"><span>Land</span><strong>{money(propertyPrice)}</strong></div><div className="flex justify-between gap-4"><span>Delivery</span><strong>{money(deliveryPrice)}</strong></div><div className="flex justify-between gap-4"><span>Site Work</span><strong>{money(siteWorkPrice)}</strong></div><div className="flex justify-between gap-4"><span>Add-Ons</span><strong>{money(addonsPrice)}</strong></div><div className="mt-3 flex justify-between gap-4 border-t border-slate-200 pt-3 text-base"><strong>Subtotal</strong><strong>{money(totals.subtotal)}</strong></div><div className="flex justify-between gap-4"><span>3% Sales Tax</span><strong className="text-sky-700">{money(totals.sales_tax_total)}</strong></div></div>
                <div className="mt-5 rounded-2xl bg-slate-900 p-5 text-white"><div className="text-xs font-black uppercase tracking-widest text-slate-300">Estimated Total</div><div className="mt-2 text-3xl font-black">{money(totals.estimated_total)}</div></div>
                <div className="mt-4 text-xs text-slate-500">Quote #{quoteNumber}. Dirt pad is $0 until an actual load package is selected. A/C, well, septic, utilities and bid work are also $0 until explicitly added.</div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}

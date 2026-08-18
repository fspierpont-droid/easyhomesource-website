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
  calculateDeliveryFromInputs,
  calculateSkirtingByDimensions,
  calculateTrimOut,
  getRecommendedSepticTankSize,
} from '@/data/pricingSpreadsheet';
import { VERIFIED_TEAM_USERS } from '@/data/teamMembers';
import {
  saveQuoteToServer,
  type DepositItem,
  type SavedQuote,
  type SelectedQuoteLineItem,
} from '@/data/quotesStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { calculateModernQuoteTotals } from '@/lib/quotes/modernQuoteTotals';
import type { Property } from '@/types/property';

type Tab = 'customer' | 'home' | 'site' | 'pricing' | 'financing' | 'notes';
type LandOption = 'OWNED' | 'EHS_PROPERTY' | 'CUSTOM';
type RouteType = 'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer';

const SETUP_SKUS = new Set([
  'SITE-BLOCK-TIEDOWN',
  'SITE-TRIMOUT',
  'SITE-PERIMETER-STABILIZATION',
  'SITE-STEPS-2SET',
  'SITE-SKIRTING-VALOR',
  'SITE-PERMIT-PLAN',
]);

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function sectionCount(home: MasterCatalogHome) {
  const explicit = Number(home.floors) || 0;
  if (explicit >= 1 && explicit <= 3) return explicit;
  const width = Number(home.width) || 14;
  if (width <= 18) return 1;
  if (width <= 36) return 2;
  return 3;
}

function sectionClass(home: MasterCatalogHome): 'single' | 'double' | 'triple' {
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

function catalogLine(sku: string, id: string): SelectedQuoteLineItem | null {
  const source = SERVICE_CATALOG.find((item) => item.sku === sku);
  if (!source) return null;
  return makeLine(
    id,
    source.sku,
    source.name,
    source.description,
    source.category,
    Number(source.defaultCost) || 0,
    Number(source.defaultPrice) || 0,
    1,
  );
}

function requiredSetup(home: MasterCatalogHome): SelectedQuoteLineItem[] {
  const cls = sectionClass(home);
  const sections = sectionCount(home);
  const block = calculateBlockTieDown(Number(home.length) || 60, cls);
  const trim = calculateTrimOut(sections);
  const skirting = calculateSkirtingByDimensions(
    Number(home.width) || 14,
    Number(home.length) || 60,
  );

  const lines: Array<SelectedQuoteLineItem | null> = [
    makeLine(
      'setup-block',
      'SITE-BLOCK-TIEDOWN',
      'Block & Tie-Down & Vapor Barrier',
      `Calculated from the ${block.matchedLength}-ft ${cls}-section Master Quote 5 table.`,
      'mandatory_services',
      block.cost,
      block.price,
    ),
    makeLine(
      'setup-trim',
      'SITE-TRIMOUT',
      `Trim Out - ${trim.label}`,
      'Calculated from the selected home section count.',
      'mandatory_services',
      trim.cost,
      trim.price,
    ),
    catalogLine('SITE-PERIMETER-STABILIZATION', 'setup-stabilization'),
    catalogLine('SITE-STEPS-2SET', 'setup-steps'),
    makeLine(
      'setup-skirting',
      'SITE-SKIRTING-VALOR',
      'Basic Valor Skirting',
      `${skirting.linearFeet} actual perimeter linear feet at the Master Quote 5 $8 cost / $10 customer rate.`,
      'mandatory_services',
      8,
      10,
      skirting.linearFeet,
    ),
    catalogLine('SITE-PERMIT-PLAN', 'setup-permits'),
  ];

  return lines.filter((line): line is SelectedQuoteLineItem => Boolean(line));
}

export default function ModernQuoteBuilderV2() {
  const router = useRouter();
  const { user } = useAuth();
  const initialHome = FULL_MASTER_CATALOG_HOMES[0];
  const fallbackConsultant = VERIFIED_TEAM_USERS.find((member) => member.active);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('customer');

  const [catalog, setCatalog] = useState<MasterCatalogHome[]>(FULL_MASTER_CATALOG_HOMES);
  const [selectedHome, setSelectedHome] = useState<MasterCatalogHome>(initialHome);
  const [homeSearch, setHomeSearch] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('ALL');
  const [homePrice, setHomePrice] = useState(Number(initialHome?.ehsPrice) || 0);
  const [factoryCost, setFactoryCost] = useState(Number(initialHome?.estFactoryCost) || 0);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [salesperson, setSalesperson] = useState(user?.name || fallbackConsultant?.name || '');
  const [salespersonEmail, setSalespersonEmail] = useState(user?.email || fallbackConsultant?.email || '');

  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyLoadError, setPropertyLoadError] = useState('');
  const [landOption, setLandOption] = useState<LandOption>('OWNED');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyPrice, setPropertyPrice] = useState(0);

  const [routeType, setRouteType] = useState<RouteType>('dealer_to_customer');
  const [deliveryMiles, setDeliveryMiles] = useState(0);
  const [escortsCount, setEscortsCount] = useState(Number(initialHome?.width) > 14 ? 1 : 0);
  const [deliveryFreightPrice, setDeliveryFreightPrice] = useState(0);
  const [deliveryFreightCost, setDeliveryFreightCost] = useState(0);
  const [deliveryNote, setDeliveryNote] = useState('Enter the actual route inputs, then calculate freight.');

  const [lineItems, setLineItems] = useState<SelectedQuoteLineItem[]>(() => requiredSetup(initialHome));
  const [selectedServiceSku, setSelectedServiceSku] = useState(
    SERVICE_CATALOG.find((item) => !SETUP_SKUS.has(item.sku))?.sku || SERVICE_CATALOG[0]?.sku || '',
  );
  const [discounts, setDiscounts] = useState(0);

  const [purchaseType, setPurchaseType] = useState<'cash' | 'financing'>('financing');
  const [financingStatus, setFinancingStatus] = useState('pending');
  const [preApprovalAmount, setPreApprovalAmount] = useState(0);
  const [targetBudget, setTargetBudget] = useState(0);
  const [ehsLoanOfficerUsed, setEhsLoanOfficerUsed] = useState(false);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [depositName, setDepositName] = useState('Initial Deposit');
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositDate, setDepositDate] = useState('');
  const [depositStatus, setDepositStatus] = useState('planned');

  const [notesCustomer, setNotesCustomer] = useState('');
  const [notesInternal, setNotesInternal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const quoteId = useMemo(
    () => `quote-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    [],
  );
  const quoteNumber = useMemo(
    () => `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    [],
  );

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
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok || !payload.success || !Array.isArray(payload.properties)) {
          throw new Error(payload.error || 'Unable to load the permanent Property Center.');
        }
        setProperties(
          payload.properties.filter((property: Property) => property.status === 'AVAILABLE'),
        );
        setPropertyLoadError('');
      } catch (error) {
        if (!cancelled) {
          setPropertyLoadError(
            error instanceof Error ? error.message : 'Unable to load the permanent Property Center.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const manufacturers = useMemo(
    () => Array.from(new Set(catalog.map((home) => home.manufacturer))).sort(),
    [catalog],
  );

  const filteredHomes = useMemo(() => {
    const query = homeSearch.trim().toLowerCase();
    return catalog.filter((home) => {
      if (manufacturerFilter !== 'ALL' && home.manufacturer !== manufacturerFilter) return false;
      if (!query) return true;
      return [
        home.name,
        home.manufacturer,
        home.series,
        home.bedrooms,
        home.bathrooms,
        home.squareFeet,
        home.dimensions,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [catalog, homeSearch, manufacturerFilter]);

  const siteWorkItems = lineItems.filter(
    (item) =>
      item.category === 'mandatory_services' ||
      item.category === 'site_work' ||
      item.category === 'custom',
  );
  const addOnItems = lineItems.filter(
    (item) => item.category === 'addons' || item.category === 'options',
  );
  const siteWorkPrice = siteWorkItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const siteWorkCost = siteWorkItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const addonsPrice = addOnItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const addonsCost = addOnItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const activeLoanFee = ehsLoanOfficerUsed ? 1000 : 0;

  const totals = useMemo(
    () =>
      calculateModernQuoteTotals({
        homePrice,
        landPrice: propertyPrice,
        deliveryPrice: deliveryFreightPrice,
        siteWorkPrice,
        addonsPrice,
        discountsPrice: discounts,
        factoryCost,
        deliveryCost: deliveryFreightCost,
        siteWorkCost,
        addonsCost,
        taxRate: 0.03,
        ehsLoanOfficerUsed,
      }),
    [
      homePrice,
      propertyPrice,
      deliveryFreightPrice,
      siteWorkPrice,
      addonsPrice,
      discounts,
      factoryCost,
      deliveryFreightCost,
      siteWorkCost,
      addonsCost,
      ehsLoanOfficerUsed,
    ],
  );

  const recommendedSeptic = getRecommendedSepticTankSize(
    Number(selectedHome.bedrooms) || 0,
    Number(selectedHome.squareFeet) || 0,
  );

  function invalidateDelivery(message: string) {
    setDeliveryFreightCost(0);
    setDeliveryFreightPrice(0);
    setDeliveryNote(message);
  }

  function selectHome(home: MasterCatalogHome) {
    setSelectedHome(home);
    setHomePrice(Number(home.ehsPrice) || 0);
    setFactoryCost(Number(home.estFactoryCost) || 0);
    setEscortsCount(Number(home.width) > 14 ? 1 : 0);
    setLineItems((current) => [
      ...requiredSetup(home),
      ...current.filter((item) => !SETUP_SKUS.has(item.sku)),
    ]);
    invalidateDelivery('Home changed — recalculate freight for the new home size.');
  }

  function setLand(next: LandOption) {
    setLandOption(next);
    setSelectedPropertyId('');
    if (next === 'OWNED') setPropertyPrice(0);
    if (next === 'EHS_PROPERTY' && properties[0]) selectProperty(properties[0].id);
  }

  function selectProperty(id: string) {
    setSelectedPropertyId(id);
    const property = properties.find((item) => item.id === id);
    if (!property) return;
    setPropertyAddress(
      [property.address, property.city, property.state, property.zip].filter(Boolean).join(', '),
    );
    setPropertyPrice(Number(property.price) || 0);
    invalidateDelivery('Property changed — enter/confirm the actual route mileage and recalculate freight.');
  }

  function calculateFreight() {
    const result = calculateDeliveryFromInputs(
      routeType,
      deliveryMiles,
      Number(selectedHome.width) || 14,
      escortsCount,
    );
    setDeliveryFreightCost(result.totalFreightCost);
    setDeliveryFreightPrice(result.totalFreightPrice);
    setDeliveryNote(
      result.warning ||
      `${result.transportSides} transported section${result.transportSides === 1 ? '' : 's'} · ${result.miles} actual route miles · ${result.escortCount} escort${result.escortCount === 1 ? '' : 's'} per section.`,
    );
  }

  function lineForCatalogSku(sku: string): SelectedQuoteLineItem | null {
    if (sku === 'SITE-BLOCK-TIEDOWN') return requiredSetup(selectedHome)[0] || null;
    if (sku === 'SITE-TRIMOUT') return requiredSetup(selectedHome)[1] || null;
    if (sku === 'SITE-SKIRTING-VALOR') {
      return requiredSetup(selectedHome).find((line) => line.sku === sku) || null;
    }
    return catalogLine(sku, `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  }

  function addLineItem() {
    if (lineItems.some((item) => item.sku === selectedServiceSku)) return;
    const line = lineForCatalogSku(selectedServiceSku);
    if (!line) return;
    setLineItems((current) => [...current, line]);
  }

  function addCustomLine() {
    const id = `custom-${Date.now()}`;
    setLineItems((current) => [
      ...current,
      makeLine(
        id,
        id,
        'Custom Site Work / Add-On',
        'Enter the confirmed customer price and quantity for this deal-specific item.',
        'custom',
        0,
        0,
        1,
      ),
    ]);
  }

  function updateLine(id: string, field: 'unitPrice' | 'quantity', value: number) {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const quantity = field === 'quantity' ? Math.max(1, Number(value) || 1) : item.quantity;
        const unitPrice = field === 'unitPrice' ? Math.max(0, Number(value) || 0) : item.unitPrice;
        return {
          ...item,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
          totalCost: quantity * item.unitCost,
        };
      }),
    );
  }

  function resetLine(id: string) {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== id || item.category === 'custom') return item;
        const replacement = lineForCatalogSku(item.sku);
        return replacement ? { ...replacement, id: item.id } : item;
      }),
    );
  }

  function addDeposit() {
    if (!(depositAmount > 0)) return;
    setDeposits((current) => [
      ...current,
      {
        id: `deposit-${Date.now()}`,
        name: depositName.trim() || 'Deposit',
        amount: depositAmount,
        date: depositDate,
        status: depositStatus,
      },
    ]);
    setDepositAmount(0);
  }

  async function saveQuote() {
    if (isSaving) return;
    setSaveError('');

    if (!customerName.trim()) {
      setSaveError('Enter the customer name before saving the quote.');
      setActiveTab('customer');
      return;
    }
    if (landOption === 'EHS_PROPERTY' && selectedPropertyId && !(propertyPrice > 0)) {
      setSaveError('The selected EHS property does not have a verified sales price. Enter the actual land/package price before saving.');
      setActiveTab('site');
      return;
    }
    if (routeType === 'dealer_to_customer' && deliveryFreightPrice > 0 && !(deliveryMiles > 0)) {
      setSaveError('Enter the actual dealership-to-site mileage and recalculate freight before saving.');
      setActiveTab('site');
      return;
    }

    const consultant = VERIFIED_TEAM_USERS.find((member) => member.name === salesperson);
    const now = new Date().toISOString();
    const quote: SavedQuote = {
      id: quoteId,
      quoteNumber,
      quoteDate: now.slice(0, 10),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      customerAddress: customerAddress.trim(),
      salesperson,
      salespersonEmail,
      salespersonTitle: consultant?.title,
      salespersonPhone: consultant?.phone,
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
      homePrice,
      factoryCost,
      propertyAddress: propertyAddress.trim(),
      propertyPrice,
      deliveryRouteType: routeType,
      deliveryMiles,
      escortsCount,
      freightDelivery: deliveryFreightPrice,
      freightCost: deliveryFreightCost,
      siteWorkTotal: siteWorkPrice,
      siteWorkCost,
      lineItems,
      discounts,
      purchaseType,
      financingStatus,
      preApprovalAmount,
      targetBudget,
      ehsLoanOfficerUsed,
      activeLoanFee,
      deposits,
      subtotal: totals.subtotal,
      financedSubtotal: totals.financed_subtotal,
      nonFinancedSubtotal: totals.non_financed_subtotal,
      taxBasis: totals.tax_basis,
      salesTax: totals.sales_tax_total,
      totalTurnkeyPrice: totals.estimated_total,
      estimatedTotal: totals.estimated_total,
      financialTotals: totals,
      notes: notesCustomer.trim(),
      notesCustomer: notesCustomer.trim(),
      notesInternal: notesInternal.trim(),
      shareToken: quoteId,
      createdAt: now,
      updatedAt: now,
    };

    setIsSaving(true);
    try {
      const persisted = await saveQuoteToServer(quote);
      router.push(`/quotes/${encodeURIComponent(persisted.id)}/edit`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Permanent quote save failed.');
    } finally {
      setIsSaving(false);
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'customer', label: '1. Customer & Rep', icon: '👤' },
    { id: 'home', label: '2. Home Selection', icon: '🏡' },
    { id: 'site', label: '3. Land & Freight', icon: '🚚' },
    { id: 'pricing', label: '4. Line Items & Services', icon: '🛠️' },
    { id: 'financing', label: '5. Financing & Deposits', icon: '💳' },
    { id: 'notes', label: '6. Notes & Terms', icon: '📝' },
  ];

  return (
    <AuthGate>
      <div className="flex h-screen overflow-hidden bg-slate-100/70 font-sans text-slate-800 antialiased">
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

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/portal?view=library" className="text-xs font-bold text-[#1E6FA8] hover:underline">← Back to Quote Library</Link>
                <span className="text-slate-300">|</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-black text-[#0B1E38]">{quoteNumber}</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">MASTER QUOTE 5</span>
              </div>
              <h1 className="mt-0.5 text-xl font-black text-[#0B1E38]">New Master Quote Proposal Builder</h1>
            </div>
            <button type="button" disabled={isSaving} onClick={() => void saveQuote()} className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white shadow-xs hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? 'Saving to Quote Library…' : '✓ Create & Open in Full Editor'}
            </button>
          </header>

          <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-6">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-black ${activeTab === tab.id ? 'border-[#1E6FA8] bg-slate-50/80 text-[#0B1E38]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {saveError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{saveError}</div>}

              {activeTab === 'customer' && (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div><h2 className="text-lg font-black text-[#0B1E38]">Customer & Consultant</h2><p className="mt-1 text-xs text-slate-500">Real customer information only. No sample customer data is inserted.</p></div>
                  <div className="grid gap-4 text-xs sm:grid-cols-2">
                    <label className="font-bold text-slate-700">Customer Name *<input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer full name" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" /></label>
                    <label className="font-bold text-slate-700">Phone Number<input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Customer phone" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold" /></label>
                    <label className="font-bold text-slate-700">Email Address<input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Customer email" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold" /></label>
                    <label className="font-bold text-slate-700">Assigned Consultant<select value={salesperson} onChange={(e) => { const member = VERIFIED_TEAM_USERS.find((item) => item.name === e.target.value); setSalesperson(e.target.value); setSalespersonEmail(member?.email || ''); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold">{VERIFIED_TEAM_USERS.filter((member) => member.active).map((member) => <option key={member.id} value={member.name}>{member.name} ({member.role})</option>)}</select></label>
                    <label className="font-bold text-slate-700 sm:col-span-2">Customer Mailing Address<input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Optional mailing address" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold" /></label>
                  </div>
                </section>
              )}

              {activeTab === 'home' && (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-black text-[#0B1E38]">Home Selection</h2><p className="mt-1 text-xs text-slate-500">225 approved models. Factory cost and EHS price follow the Master Quote 5 surcharge/formula chain.</p></div><div className="text-right text-xs"><div className="font-black text-[#0B1E38]">{selectedHome.name}</div><div className="text-slate-500">Table EHS price: {money(Number(selectedHome.ehsPrice) || 0)}</div></div></div>
                  <div className="grid gap-3 sm:grid-cols-3"><input value={homeSearch} onChange={(e) => setHomeSearch(e.target.value)} placeholder="Search model, builder, beds, sqft…" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold sm:col-span-2" /><select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"><option value="ALL">All Manufacturers</option>{manufacturers.map((manufacturer) => <option key={manufacturer} value={manufacturer}>{manufacturer}</option>)}</select></div>
                  <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 text-xs">{filteredHomes.slice(0, 75).map((home) => <button key={home.slug || `${home.manufacturer}-${home.name}`} type="button" onClick={() => selectHome(home)} className={`flex w-full items-center justify-between gap-4 border-b border-slate-100 p-3 text-left last:border-b-0 hover:bg-slate-50 ${selectedHome.slug === home.slug ? 'border-l-4 border-l-[#1E6FA8] bg-sky-50' : ''}`}><div><div className="font-black text-[#0B1E38]">{home.name}</div><div className="mt-0.5 text-[11px] font-semibold text-slate-500">{home.manufacturer} · {home.series || 'Series N/A'} · {home.bedrooms || 0}b/{home.bathrooms || 0}ba · {(home.squareFeet || 0).toLocaleString()} sq ft · {home.dimensions}</div></div><div className="shrink-0 text-right"><div className="font-black text-[#0F2A47]">{money(Number(home.ehsPrice) || 0)}</div><div className="text-[10px] text-slate-400">Factory {money(Number(home.estFactoryCost) || 0)}</div></div></button>)}</div>
                  <div className="grid gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:grid-cols-2"><label className="block text-xs font-black text-[#0B1E38]">Customer Home Price<input type="number" min="0" step="0.01" value={homePrice} onChange={(e) => setHomePrice(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-base font-black" /></label><div><div className="text-[10px] font-black uppercase tracking-wider text-sky-700">Internal factory cost</div><div className="mt-1 text-lg font-black text-[#0B1E38]">{money(factoryCost)}</div><div className="mt-1 text-[10px] text-sky-900">Reselect the home to reset the customer price to the table value.</div></div></div>
                </section>
              )}

              {activeTab === 'site' && (
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div><h2 className="text-lg font-black text-[#0B1E38]">Land & Delivery Freight</h2><p className="mt-1 text-xs text-slate-500">Permanent Property Center records. Freight uses actual route inputs—no default 32-mile route.</p></div>
                  <div className="grid gap-3 text-xs font-bold sm:grid-cols-3">{[['OWNED','🏡 Customer Owns Land','$0 land price'],['EHS_PROPERTY','📍 EHS Property',`${properties.length} available records`],['CUSTOM','✍️ Custom / TBD','Enter actual value']].map(([id,title,subtitle]) => <button key={id} type="button" onClick={() => setLand(id as LandOption)} className={`rounded-xl border p-3.5 text-left ${landOption === id ? 'border-[#0B1E38] bg-[#0B1E38] text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}><div>{title}</div><div className="mt-0.5 text-[11px] font-normal opacity-80">{subtitle}</div></button>)}</div>
                  {propertyLoadError && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">{propertyLoadError}</div>}
                  {landOption === 'EHS_PROPERTY' && <label className="block text-xs font-bold text-slate-700">Available EHS Property<select value={selectedPropertyId} onChange={(e) => selectProperty(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold"><option value="">Select property…</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.address}, {property.city} ({property.county} County) — {property.price == null ? 'Price not verified' : money(property.price)}</option>)}</select></label>}
                  <div className="grid gap-4 text-xs sm:grid-cols-2"><label className="font-bold text-slate-700">Land / Parcel Price<input type="number" min="0" step="0.01" value={propertyPrice} onChange={(e) => setPropertyPrice(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-black text-[#0B1E38]" /></label><label className="font-bold text-slate-700">Delivery Homesite Address<input value={propertyAddress} onChange={(e) => { setPropertyAddress(e.target.value); invalidateDelivery('Address changed — confirm actual route mileage and recalculate freight.'); }} placeholder="Actual delivery address" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" /></label></div>
                  <div className="border-t border-slate-200 pt-5"><div className="mb-3"><h3 className="font-black text-[#0B1E38]">Delivery Calculation</h3><p className="text-[11px] text-slate-500">Enter actual route inputs, calculate the table freight, then override only the customer price if the real deal requires it.</p></div><div className="grid gap-4 text-xs sm:grid-cols-4"><label className="font-bold text-slate-700 sm:col-span-2">Route Type<select value={routeType} onChange={(e) => { setRouteType(e.target.value as RouteType); invalidateDelivery('Route type changed — recalculate freight.'); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold"><option value="dealer_to_customer">Dealership → Customer</option><option value="factory_to_customer">Factory → Customer</option><option value="factory_to_dealer">Factory → Dealership</option></select></label><label className="font-bold text-slate-700">Actual Route Miles<input type="number" min="0" step="0.1" value={deliveryMiles} disabled={routeType !== 'dealer_to_customer'} onChange={(e) => { setDeliveryMiles(Math.max(0, Number(e.target.value) || 0)); invalidateDelivery('Mileage changed — recalculate freight.'); }} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold disabled:bg-slate-100" /></label><label className="font-bold text-slate-700">Escorts / Section<input type="number" min="0" step="1" value={escortsCount} onChange={(e) => { setEscortsCount(Math.max(0, Math.round(Number(e.target.value) || 0))); invalidateDelivery('Escort count changed — recalculate freight.'); }} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" /></label></div><div className="mt-4 flex flex-wrap items-end gap-3"><button type="button" onClick={calculateFreight} className="rounded-xl bg-[#0F2A47] px-4 py-2.5 text-xs font-black text-white hover:bg-[#1E6FA8]">⚡ Calculate Freight</button><label className="min-w-[220px] flex-1 text-xs font-bold text-slate-700">Customer Delivery Price<input type="number" min="0" step="0.01" value={deliveryFreightPrice} onChange={(e) => setDeliveryFreightPrice(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base font-black text-[#0B1E38]" /></label><div className="min-w-[180px] rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Internal freight cost</div><div className="mt-1 text-base font-black">{money(deliveryFreightCost)}</div></div></div>{deliveryNote && <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3 text-[11px] font-semibold text-sky-900">{deliveryNote}</div>}</div>
                </section>
              )}

              {activeTab === 'pricing' && (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div><h2 className="text-lg font-black text-[#0B1E38]">Services & Line Items</h2><p className="mt-1 text-xs text-slate-500">Setup defaults are table-driven. HVAC, dirt, well, septic, electrical and other site items are selected for the actual deal—not assumed.</p></div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] font-semibold text-amber-900">Selected home recommendation: minimum septic sizing logic indicates <strong>{recommendedSeptic.toLocaleString()} gallons</strong>. Only the verified 900-gallon base carries a table price; larger systems require verified/custom pricing.</div>
                  <div className="flex flex-wrap gap-2"><select value={selectedServiceSku} onChange={(e) => setSelectedServiceSku(e.target.value)} className="min-w-[260px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">{SERVICE_CATALOG.map((service) => <option key={service.sku} value={service.sku}>{service.name} — {money(service.defaultPrice)}</option>)}</select><button type="button" onClick={addLineItem} className="rounded-xl bg-[#0F2A47] px-4 py-2 text-xs font-black text-white">+ Add Table Item</button><button type="button" onClick={addCustomLine} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">+ Custom Item</button></div>
                  <div className="overflow-hidden rounded-xl border border-slate-200">{lineItems.map((item) => <div key={item.id} className="border-b border-slate-100 p-4 last:border-b-0"><div className="grid items-end gap-3 md:grid-cols-[1fr_90px_150px_110px_auto]"><div><div className="font-black text-slate-800">{item.name}</div><div className="mt-0.5 text-[10.5px] text-slate-500">{item.description}</div>{item.category !== 'custom' && <button type="button" onClick={() => resetLine(item.id)} className="mt-1 text-[10px] font-black text-[#1E6FA8] hover:underline">Reset to Master Quote 5 table</button>}</div><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Qty<input type="number" min="1" step="1" value={item.quantity} onChange={(e) => updateLine(item.id, 'quantity', Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-black text-slate-900" /></label><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Customer Unit Price<input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateLine(item.id, 'unitPrice', Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-black text-slate-900" /></label><div className="text-right"><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Line Total</div><div className="mt-1 font-black text-[#0B1E38]">{money(item.totalPrice)}</div></div><button type="button" onClick={() => setLineItems((current) => current.filter((line) => line.id !== item.id))} className="rounded-lg px-2 py-2 font-black text-rose-600 hover:bg-rose-50">✕</button></div></div>)}</div>
                  <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"><div><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Site Work / Setup</div><div className="mt-1 text-lg font-black text-[#0B1E38]">{money(siteWorkPrice)}</div></div><div><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Add-Ons / Options</div><div className="mt-1 text-lg font-black text-[#0B1E38]">{money(addonsPrice)}</div></div><label className="text-xs font-bold text-slate-700">Quote Discount<input type="number" min="0" step="0.01" value={discounts} onChange={(e) => setDiscounts(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-black" /></label></div>
                </section>
              )}

              {activeTab === 'financing' && (
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 text-xs shadow-xs"><h2 className="text-lg font-black text-[#0B1E38]">Financing & Deposits</h2><div className="grid gap-4 sm:grid-cols-2"><label className="font-bold text-slate-700">Purchase Type<select value={purchaseType} onChange={(e) => setPurchaseType(e.target.value as 'cash' | 'financing')} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold"><option value="financing">Financing</option><option value="cash">Cash</option></select></label><label className="font-bold text-slate-700">Financing Status<select value={financingStatus} onChange={(e) => setFinancingStatus(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold"><option value="pending">Pending</option><option value="preapproved">Pre-Approved</option><option value="approved">Approved</option><option value="cash">Cash / N/A</option></select></label><label className="font-bold text-slate-700">Pre-Approval Amount<input type="number" min="0" value={preApprovalAmount} onChange={(e) => setPreApprovalAmount(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" /></label><label className="font-bold text-slate-700">Target Budget<input type="number" min="0" value={targetBudget} onChange={(e) => setTargetBudget(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" /></label></div><label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold"><span>EHS Loan Officer Used <span className="font-normal text-slate-500">($1,000 internal home-profit fee)</span></span><input type="checkbox" checked={ehsLoanOfficerUsed} onChange={(e) => setEhsLoanOfficerUsed(e.target.checked)} className="h-5 w-5 accent-emerald-600" /></label><div className="border-t border-slate-200 pt-4"><h3 className="mb-3 font-black text-[#0B1E38]">Deposits</h3><div className="grid gap-2 sm:grid-cols-5"><input value={depositName} onChange={(e) => setDepositName(e.target.value)} placeholder="Deposit name" className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2" /><input type="number" min="0" value={depositAmount} onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value) || 0))} placeholder="Amount" className="rounded-xl border border-slate-200 px-3 py-2" /><input type="date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2" /><button type="button" onClick={addDeposit} className="rounded-xl bg-[#0F2A47] px-3 py-2 font-black text-white">+ Add Deposit</button></div><div className="mt-2 flex items-center gap-2"><span className="font-bold text-slate-500">Status:</span><select value={depositStatus} onChange={(e) => setDepositStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-bold"><option value="planned">Planned</option><option value="received">Received</option><option value="refunded">Refunded</option></select></div>{deposits.length > 0 && <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">{deposits.map((deposit) => <div key={deposit.id} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 last:border-b-0"><div><span className="font-black">{deposit.name}</span><span className="ml-2 text-slate-500">{deposit.status}{deposit.date ? ` · ${deposit.date}` : ''}</span></div><div className="flex items-center gap-3"><span className="font-black">{money(deposit.amount)}</span><button type="button" onClick={() => setDeposits((current) => current.filter((item) => item.id !== deposit.id))} className="font-black text-rose-600">✕</button></div></div>)}</div>}</div></section>
              )}

              {activeTab === 'notes' && (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-xs shadow-xs"><h2 className="text-lg font-black text-[#0B1E38]">Proposal Notes & Terms</h2><label className="block font-bold text-slate-700">Customer-Facing Notes<textarea rows={5} value={notesCustomer} onChange={(e) => setNotesCustomer(e.target.value)} placeholder="Proposal notes visible to the customer" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label><label className="block font-bold text-slate-700">Internal Notes<textarea rows={4} value={notesInternal} onChange={(e) => setNotesInternal(e.target.value)} placeholder="Internal EHS notes — not customer-facing" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label></section>
              )}
            </div>

            <aside className="self-start rounded-2xl border border-slate-200 bg-white p-5 text-xs shadow-2xs lg:sticky lg:top-24"><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Customer-Facing</div><div className="mt-4 space-y-2 text-slate-700"><div className="flex justify-between gap-4"><span>Home</span><strong>{money(homePrice)}</strong></div>{propertyPrice > 0 && <div className="flex justify-between gap-4"><span>Land / Parcel</span><strong>{money(propertyPrice)}</strong></div>}<div className="flex justify-between gap-4"><span>Delivery</span><strong>{money(deliveryFreightPrice)}</strong></div><div className="flex justify-between gap-4"><span>Site Work</span><strong>{money(siteWorkPrice)}</strong></div>{addonsPrice > 0 && <div className="flex justify-between gap-4"><span>Add-Ons</span><strong>{money(addonsPrice)}</strong></div>}{discounts > 0 && <div className="flex justify-between gap-4 text-rose-700"><span>Discount</span><strong>-{money(discounts)}</strong></div>}<div className="my-2 border-t border-slate-100" /><div className="flex justify-between gap-4 text-sm font-black text-slate-800"><span>Subtotal</span><strong>{money(totals.subtotal)}</strong></div><div className="flex justify-between gap-4 font-black text-slate-700"><span>3% sales tax</span><strong className="text-[#1E6FA8]">{money(totals.sales_tax_total)}</strong></div><div className="mt-3 flex items-center justify-between rounded-xl bg-[#0F2A47] px-3.5 py-3 text-white shadow-md"><span className="text-[10px] font-extrabold uppercase tracking-wider">Estimated Total</span><span className="font-mono text-xl font-black">{money(totals.estimated_total)}</span></div></div><div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Calculation check</div><div className="mt-1 font-bold text-slate-700">Home + Land + Delivery + Site Work + Add-Ons − Discounts</div><div className="mt-1 font-black text-emerald-700">= {money(totals.subtotal)}</div></div><div className="mt-4 rounded-xl border border-slate-200 p-3"><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Internal deal check</div><div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]"><span>Home gross margin</span><strong className="text-right">{money(totals.house_gross_margin)}</strong><span>Admin fee (5%)</span><strong className="text-right">{money(totals.admin_fee)}</strong><span>Loan fee</span><strong className="text-right">{money(totals.loan_fee)}</strong><span>Sales commission</span><strong className="text-right">{money(totals.salesperson_commission)}</strong><span>Service profit</span><strong className="text-right">{money(totals.service_profit)}</strong><span className="border-t border-slate-100 pt-1 font-black">EHS net take-home</span><strong className={`border-t border-slate-100 pt-1 text-right ${totals.target_met ? 'text-emerald-700' : 'text-amber-700'}`}>{money(totals.net_take_home)}</strong></div></div><button type="button" disabled={isSaving} onClick={() => void saveQuote()} className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Saving to permanent library…' : '✓ Create & Save Master Quote'}</button></aside>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

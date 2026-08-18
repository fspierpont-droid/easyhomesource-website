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
  autoCalculateDelivery,
  calculateBlockTieDown,
  calculateSkirtingByDimensions,
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

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function homeClass(home: MasterCatalogHome): 'single' | 'double' | 'triple' {
  const width = Number(home.width) || 14;
  if (width <= 18) return 'single';
  if (width <= 36) return 'double';
  return 'triple';
}

function catalogLine(sku: string, id: string): SelectedQuoteLineItem | null {
  const item = SERVICE_CATALOG.find((entry) => entry.sku === sku);
  if (!item) return null;
  return {
    id,
    sku: item.sku,
    name: item.name,
    description: item.description,
    category: item.category,
    unitPrice: Number(item.defaultPrice) || 0,
    unitCost: Number(item.defaultCost) || 0,
    quantity: 1,
    totalPrice: Number(item.defaultPrice) || 0,
    totalCost: Number(item.defaultCost) || 0,
  };
}

function initialLines(home: MasterCatalogHome): SelectedQuoteLineItem[] {
  const block = calculateBlockTieDown(Number(home.length) || 60, homeClass(home));
  const skirting = calculateSkirtingByDimensions(
    Number(home.width) || 14,
    Number(home.length) || 60,
  );

  const blockLine: SelectedQuoteLineItem = {
    id: 'required-block-tiedown',
    sku: 'SITE-BLOCK-TIEDOWN',
    name: 'Block & Hurricane Tie-Down Installation',
    description: `V05 table price for ${block.matchedLength} ft ${homeClass(home)}-section setup.`,
    category: 'mandatory_services',
    unitPrice: block.price,
    unitCost: block.cost,
    quantity: 1,
    totalPrice: block.price,
    totalCost: block.cost,
  };

  const skirtingLine: SelectedQuoteLineItem = {
    id: 'required-skirting',
    sku: 'SITE-SKIRTING-VINYL',
    name: 'Vented Vinyl Perimeter Skirting',
    description: `${skirting.linearFeet} linear ft calculated from the selected home dimensions. Package quantity remains 1.`,
    category: 'mandatory_services',
    unitPrice: skirting.price,
    unitCost: skirting.cost,
    quantity: 1,
    totalPrice: skirting.price,
    totalCost: skirting.cost,
  };

  return [
    blockLine,
    catalogLine('HVAC-HP-3TON', 'required-hvac'),
    catalogLine('SITE-DIRTPAD', 'required-dirt-pad'),
    catalogLine('SITE-WELL-4INCH', 'required-well'),
    catalogLine('SITE-SEPTIC-1050', 'required-septic'),
    catalogLine('SITE-PERMIT-PLAN', 'required-permits'),
    skirtingLine,
  ].filter((item): item is SelectedQuoteLineItem => Boolean(item));
}

export default function ModernQuoteBuilder() {
  const router = useRouter();
  const { user } = useAuth();
  const fallbackConsultant = VERIFIED_TEAM_USERS.find((member) => member.active);
  const firstHome = FULL_MASTER_CATALOG_HOMES[0];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('customer');
  const [catalog, setCatalog] = useState<MasterCatalogHome[]>(FULL_MASTER_CATALOG_HOMES);
  const [selectedHome, setSelectedHome] = useState<MasterCatalogHome>(firstHome);
  const [homeSearch, setHomeSearch] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('ALL');
  const [homePrice, setHomePrice] = useState(Number(firstHome?.ehsPrice) || 0);
  const [factoryCost, setFactoryCost] = useState(Number(firstHome?.estFactoryCost) || 0);

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
  const [escortsCount, setEscortsCount] = useState(0);
  const [deliveryFreightPrice, setDeliveryFreightPrice] = useState(0);
  const [deliveryFreightCost, setDeliveryFreightCost] = useState(0);
  const [deliveryNote, setDeliveryNote] = useState('');

  const [lineItems, setLineItems] = useState<SelectedQuoteLineItem[]>(() => initialLines(firstHome));
  const [selectedServiceSku, setSelectedServiceSku] = useState(SERVICE_CATALOG[0]?.sku || '');
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
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok || !data.success || !Array.isArray(data.properties)) {
          throw new Error(data.error || 'Unable to load permanent property records.');
        }
        setProperties(
          data.properties.filter((property: Property) => property.status === 'AVAILABLE'),
        );
        setPropertyLoadError('');
      } catch (error) {
        if (!cancelled) {
          setPropertyLoadError(
            error instanceof Error ? error.message : 'Unable to load permanent property records.',
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
    ],
  );

  function selectHome(home: MasterCatalogHome) {
    setSelectedHome(home);
    setHomePrice(Number(home.ehsPrice) || 0);
    setFactoryCost(Number(home.estFactoryCost) || 0);

    const block = calculateBlockTieDown(Number(home.length) || 60, homeClass(home));
    const skirting = calculateSkirtingByDimensions(
      Number(home.width) || 14,
      Number(home.length) || 60,
    );

    setLineItems((current) =>
      current.map((item) => {
        if (item.sku === 'SITE-BLOCK-TIEDOWN') {
          return {
            ...item,
            unitPrice: block.price,
            unitCost: block.cost,
            quantity: 1,
            totalPrice: block.price,
            totalCost: block.cost,
            description: `V05 table price for ${block.matchedLength} ft ${homeClass(home)}-section setup.`,
          };
        }
        if (item.sku === 'SITE-SKIRTING-VINYL' || item.sku === 'SITE-SKIRTING-VALOR') {
          return {
            ...item,
            unitPrice: skirting.price,
            unitCost: skirting.cost,
            quantity: 1,
            totalPrice: skirting.price,
            totalCost: skirting.cost,
            description: `${skirting.linearFeet} linear ft calculated from the selected home dimensions. Package quantity remains 1.`,
          };
        }
        return item;
      }),
    );

    setDeliveryFreightPrice(0);
    setDeliveryFreightCost(0);
    setDeliveryMiles(0);
    setEscortsCount(0);
    setDeliveryNote('Home changed — recalculate delivery for the selected home.');
  }

  function setLand(next: LandOption) {
    setLandOption(next);
    setSelectedPropertyId('');
    if (next === 'OWNED') {
      setPropertyPrice(0);
    }
    if (next === 'EHS_PROPERTY' && properties[0]) {
      selectProperty(properties[0].id);
    }
  }

  function selectProperty(id: string) {
    setSelectedPropertyId(id);
    const property = properties.find((item) => item.id === id);
    if (!property) return;
    setPropertyAddress(
      [property.address, property.city, property.state, property.zip].filter(Boolean).join(', '),
    );
    setPropertyPrice(Number(property.price) || 0);
  }

  function calculateDeliveryFromTable() {
    const result = autoCalculateDelivery(
      propertyAddress,
      Number(selectedHome.width) || 14,
      routeType,
    );
    setDeliveryMiles(result.miles);
    setEscortsCount(result.escortCount);
    setDeliveryFreightCost(result.totalFreightCost);
    setDeliveryFreightPrice(result.totalFreightPrice);
    setDeliveryNote(
      `${result.originAddress} → ${result.destinationAddress} · ${result.miles} mi · ${result.transportSides} transport section${result.transportSides === 1 ? '' : 's'}${result.warning ? ` · ${result.warning}` : ''}`,
    );
  }

  function addLineItem() {
    const source = SERVICE_CATALOG.find((item) => item.sku === selectedServiceSku);
    if (!source) return;
    if (lineItems.some((item) => item.sku === source.sku)) return;

    let line = catalogLine(source.sku, `line-${Date.now()}`);
    if (!line) return;

    if (source.sku === 'SITE-BLOCK-TIEDOWN') {
      const block = calculateBlockTieDown(Number(selectedHome.length) || 60, homeClass(selectedHome));
      line = {
        ...line,
        unitPrice: block.price,
        unitCost: block.cost,
        totalPrice: block.price,
        totalCost: block.cost,
        description: `V05 table price for ${block.matchedLength} ft ${homeClass(selectedHome)}-section setup.`,
      };
    }
    if (source.sku === 'SITE-SKIRTING-VINYL' || source.sku === 'SITE-SKIRTING-VALOR') {
      const skirting = calculateSkirtingByDimensions(
        Number(selectedHome.width) || 14,
        Number(selectedHome.length) || 60,
      );
      line = {
        ...line,
        unitPrice: skirting.price,
        unitCost: skirting.cost,
        totalPrice: skirting.price,
        totalCost: skirting.cost,
        description: `${skirting.linearFeet} linear ft calculated from the selected home dimensions. Package quantity remains 1.`,
      };
    }

    setLineItems((current) => [...current, line]);
  }

  function updateLine(id: string, field: 'unitPrice' | 'quantity', value: number) {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const quantity =
          field === 'quantity' ? Math.max(1, Number(value) || 1) : item.quantity;
        const unitPrice =
          field === 'unitPrice' ? Math.max(0, Number(value) || 0) : item.unitPrice;
        return {
          ...item,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
          totalCost: item.unitCost * quantity,
        };
      }),
    );
  }

  function resetLineToTable(id: string) {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (item.sku === 'SITE-BLOCK-TIEDOWN') {
          const block = calculateBlockTieDown(Number(selectedHome.length) || 60, homeClass(selectedHome));
          return {
            ...item,
            unitPrice: block.price,
            unitCost: block.cost,
            quantity: 1,
            totalPrice: block.price,
            totalCost: block.cost,
            description: `V05 table price for ${block.matchedLength} ft ${homeClass(selectedHome)}-section setup.`,
          };
        }
        if (item.sku === 'SITE-SKIRTING-VINYL' || item.sku === 'SITE-SKIRTING-VALOR') {
          const skirting = calculateSkirtingByDimensions(
            Number(selectedHome.width) || 14,
            Number(selectedHome.length) || 60,
          );
          return {
            ...item,
            unitPrice: skirting.price,
            unitCost: skirting.cost,
            quantity: 1,
            totalPrice: skirting.price,
            totalCost: skirting.cost,
            description: `${skirting.linearFeet} linear ft calculated from the selected home dimensions. Package quantity remains 1.`,
          };
        }
        const source = SERVICE_CATALOG.find((entry) => entry.sku === item.sku);
        if (!source) return item;
        return {
          ...item,
          unitPrice: Number(source.defaultPrice) || 0,
          unitCost: Number(source.defaultCost) || 0,
          quantity: 1,
          totalPrice: Number(source.defaultPrice) || 0,
          totalCost: Number(source.defaultCost) || 0,
          description: source.description,
        };
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
                <Link href="/portal?view=library" className="flex items-center gap-1 text-xs font-bold text-[#1E6FA8] hover:underline">
                  ← Back to Quote Library
                </Link>
                <span className="text-slate-300">|</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-black text-[#0B1E38]">
                  {quoteNumber}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                  ERP V05 LIVE
                </span>
              </div>
              <h1 className="mt-0.5 text-xl font-black text-[#0B1E38]">New Master Quote Proposal Builder</h1>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void saveQuote()}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white shadow-xs hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving to Quote Library…' : '✓ Create & Open in Full Editor'}
            </button>
          </header>

          <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-black ${
                  activeTab === tab.id
                    ? 'border-[#1E6FA8] bg-slate-50/80 text-[#0B1E38]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {saveError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                  {saveError}
                </div>
              )}

              {activeTab === 'customer' && (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div>
                    <h2 className="text-lg font-black text-[#0B1E38]">Customer & Consultant</h2>
                    <p className="mt-1 text-xs text-slate-500">No sample customer data is inserted into saved quotes.</p>
                  </div>
                  <div className="grid gap-4 text-xs sm:grid-cols-2">
                    <label className="font-bold text-slate-700">
                      Customer Name *
                      <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Customer full name" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" />
                    </label>
                    <label className="font-bold text-slate-700">
                      Phone Number
                      <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Customer phone" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold" />
                    </label>
                    <label className="font-bold text-slate-700">
                      Email Address
                      <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="Customer email" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold" />
                    </label>
                    <label className="font-bold text-slate-700">
                      Assigned Consultant
                      <select
                        value={salesperson}
                        onChange={(event) => {
                          const member = VERIFIED_TEAM_USERS.find((item) => item.name === event.target.value);
                          setSalesperson(event.target.value);
                          setSalespersonEmail(member?.email || '');
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold"
                      >
                        {VERIFIED_TEAM_USERS.filter((member) => member.active).map((member) => (
                          <option key={member.id} value={member.name}>{member.name} ({member.role})</option>
                        ))}
                      </select>
                    </label>
                    <label className="font-bold text-slate-700 sm:col-span-2">
                      Customer Mailing Address
                      <input value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Optional mailing address" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold" />
                    </label>
                  </div>
                </section>
              )}

              {activeTab === 'home' && (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-[#0B1E38]">Home Selection</h2>
                      <p className="mt-1 text-xs text-slate-500">Catalog price loads automatically. Customer price remains adjustable and is audited when saved.</p>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-black text-[#0B1E38]">{selectedHome.name}</div>
                      <div className="text-slate-500">Catalog EHS price: {money(Number(selectedHome.ehsPrice) || 0)}</div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input value={homeSearch} onChange={(event) => setHomeSearch(event.target.value)} placeholder="Search model, builder, beds, sqft…" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold sm:col-span-2" />
                    <select value={manufacturerFilter} onChange={(event) => setManufacturerFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">
                      <option value="ALL">All Manufacturers</option>
                      {manufacturers.map((manufacturer) => <option key={manufacturer} value={manufacturer}>{manufacturer}</option>)}
                    </select>
                  </div>
                  <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                    {filteredHomes.slice(0, 60).map((home) => (
                      <button
                        key={home.slug || `${home.manufacturer}-${home.name}`}
                        type="button"
                        onClick={() => selectHome(home)}
                        className={`flex w-full items-center justify-between gap-4 border-b border-slate-100 p-3 text-left last:border-b-0 hover:bg-slate-50 ${selectedHome.slug === home.slug ? 'border-l-4 border-l-[#1E6FA8] bg-sky-50' : ''}`}
                      >
                        <div>
                          <div className="font-black text-[#0B1E38]">{home.name}</div>
                          <div className="mt-0.5 text-[11px] font-semibold text-slate-500">{home.manufacturer} · {home.series || 'Series N/A'} · {home.bedrooms || 0}b/{home.bathrooms || 0}ba · {(home.squareFeet || 0).toLocaleString()} sq ft · {home.dimensions}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-black text-[#0F2A47]">{money(Number(home.ehsPrice) || 0)}</div>
                          <div className="text-[10px] text-slate-400">Factory cost {money(Number(home.estFactoryCost) || 0)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <label className="block text-xs font-black text-[#0B1E38]">
                      Customer Home Price
                      <input type="number" min="0" step="0.01" value={homePrice} onChange={(event) => setHomePrice(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full max-w-xs rounded-xl border border-sky-200 bg-white px-3 py-2 text-base font-black" />
                    </label>
                    <p className="mt-2 text-[11px] text-sky-900">Reset to catalog by reselecting the home. The permanent quote API records home-price overrides.</p>
                  </div>
                </section>
              )}

              {activeTab === 'site' && (
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div>
                    <h2 className="text-lg font-black text-[#0B1E38]">Land & Delivery Freight</h2>
                    <p className="mt-1 text-xs text-slate-500">Permanent Property Center records and V05 delivery logic only.</p>
                  </div>
                  <div className="grid gap-3 text-xs font-bold sm:grid-cols-3">
                    {[
                      ['OWNED', '🏡 Customer Owns Land', '$0 land price'],
                      ['EHS_PROPERTY', '📍 EHS Property', `${properties.length} available records`],
                      ['CUSTOM', '✍️ Custom / TBD', 'Enter the actual value'],
                    ].map(([id, title, subtitle]) => (
                      <button key={id} type="button" onClick={() => setLand(id as LandOption)} className={`rounded-xl border p-3.5 text-left ${landOption === id ? 'border-[#0B1E38] bg-[#0B1E38] text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                        <div>{title}</div>
                        <div className="mt-0.5 text-[11px] font-normal opacity-80">{subtitle}</div>
                      </button>
                    ))}
                  </div>
                  {propertyLoadError && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">{propertyLoadError}</div>}
                  {landOption === 'EHS_PROPERTY' && (
                    <label className="block text-xs font-bold text-slate-700">
                      Available EHS Property
                      <select value={selectedPropertyId} onChange={(event) => selectProperty(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold">
                        <option value="">Select property…</option>
                        {properties.map((property) => (
                          <option key={property.id} value={property.id}>{property.address}, {property.city} ({property.county} County) — {property.price == null ? 'Price not verified' : money(property.price)}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="grid gap-4 text-xs sm:grid-cols-2">
                    <label className="font-bold text-slate-700">Land / Parcel Price
                      <input type="number" min="0" step="0.01" value={propertyPrice} onChange={(event) => setPropertyPrice(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-black text-[#0B1E38]" />
                    </label>
                    <label className="font-bold text-slate-700">Delivery Homesite Address
                      <input value={propertyAddress} onChange={(event) => setPropertyAddress(event.target.value)} placeholder="Actual delivery address" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" />
                    </label>
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black text-[#0B1E38]">Delivery Calculation</h3>
                        <p className="text-[11px] text-slate-500">Calculate from the current V05 freight rules, then adjust the customer price if required.</p>
                      </div>
                      <button type="button" onClick={calculateDeliveryFromTable} className="rounded-xl bg-[#0F2A47] px-4 py-2 text-xs font-black text-white hover:bg-[#1E6FA8]">⚡ Auto Calculate Delivery</button>
                    </div>
                    <div className="grid gap-4 text-xs sm:grid-cols-4">
                      <label className="font-bold text-slate-700 sm:col-span-2">Route Type
                        <select value={routeType} onChange={(event) => setRouteType(event.target.value as RouteType)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold">
                          <option value="dealer_to_customer">Dealership → Customer</option>
                          <option value="factory_to_customer">Factory → Customer</option>
                          <option value="factory_to_dealer">Factory → Dealership</option>
                        </select>
                      </label>
                      <label className="font-bold text-slate-700">Calculated Miles
                        <input type="number" min="0" value={deliveryMiles} onChange={(event) => setDeliveryMiles(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" />
                      </label>
                      <label className="font-bold text-slate-700">Escorts
                        <input type="number" min="0" value={escortsCount} onChange={(event) => setEscortsCount(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" />
                      </label>
                      <label className="font-bold text-slate-700 sm:col-span-2">Customer Delivery Price
                        <input type="number" min="0" step="0.01" value={deliveryFreightPrice} onChange={(event) => setDeliveryFreightPrice(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base font-black text-[#0B1E38]" />
                      </label>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Internal freight cost</div>
                        <div className="mt-1 text-base font-black text-slate-800">{money(deliveryFreightCost)}</div>
                      </div>
                    </div>
                    {deliveryNote && <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3 text-[11px] font-semibold text-sky-900">{deliveryNote}</div>}
                  </div>
                </section>
              )}

              {activeTab === 'pricing' && (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div>
                    <h2 className="text-lg font-black text-[#0B1E38]">Services & Line Items</h2>
                    <p className="mt-1 text-xs text-slate-500">V05 table prices load by default. Price and quantity are editable on every line.</p>
                  </div>
                  <div className="flex gap-2">
                    <select value={selectedServiceSku} onChange={(event) => setSelectedServiceSku(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">
                      {SERVICE_CATALOG.map((service) => <option key={service.sku} value={service.sku}>{service.name} — {money(service.defaultPrice)}</option>)}
                    </select>
                    <button type="button" onClick={addLineItem} className="rounded-xl bg-[#0F2A47] px-4 py-2 text-xs font-black text-white">+ Add</button>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    {lineItems.map((item) => (
                      <div key={item.id} className="border-b border-slate-100 p-4 last:border-b-0">
                        <div className="grid items-end gap-3 md:grid-cols-[1fr_90px_150px_110px_auto]">
                          <div>
                            <div className="font-black text-slate-800">{item.name}</div>
                            <div className="mt-0.5 text-[10.5px] text-slate-500">{item.description}</div>
                            <button type="button" onClick={() => resetLineToTable(item.id)} className="mt-1 text-[10px] font-black text-[#1E6FA8] hover:underline">Reset to V05 table</button>
                          </div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Qty
                            <input type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateLine(item.id, 'quantity', Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-black text-slate-900" />
                          </label>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Customer Unit Price
                            <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateLine(item.id, 'unitPrice', Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-black text-slate-900" />
                          </label>
                          <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Line Total</div>
                            <div className="mt-1 font-black text-[#0B1E38]">{money(item.totalPrice)}</div>
                          </div>
                          <button type="button" onClick={() => setLineItems((current) => current.filter((line) => line.id !== item.id))} className="rounded-lg px-2 py-2 font-black text-rose-600 hover:bg-rose-50" aria-label={`Remove ${item.name}`}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Table-driven services</div>
                      <div className="mt-1 text-lg font-black text-[#0B1E38]">{money(siteWorkPrice + addonsPrice)}</div>
                    </div>
                    <label className="text-xs font-bold text-slate-700">Quote Discount
                      <input type="number" min="0" step="0.01" value={discounts} onChange={(event) => setDiscounts(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-black" />
                    </label>
                  </div>
                </section>
              )}

              {activeTab === 'financing' && (
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 text-xs shadow-xs">
                  <h2 className="text-lg font-black text-[#0B1E38]">Financing & Deposits</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="font-bold text-slate-700">Purchase Type
                      <select value={purchaseType} onChange={(event) => setPurchaseType(event.target.value as 'cash' | 'financing')} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold"><option value="financing">Financing</option><option value="cash">Cash</option></select>
                    </label>
                    <label className="font-bold text-slate-700">Financing Status
                      <select value={financingStatus} onChange={(event) => setFinancingStatus(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold"><option value="pending">Pending</option><option value="preapproved">Pre-Approved</option><option value="approved">Approved</option><option value="cash">Cash / N/A</option></select>
                    </label>
                    <label className="font-bold text-slate-700">Pre-Approval Amount
                      <input type="number" min="0" value={preApprovalAmount} onChange={(event) => setPreApprovalAmount(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" />
                    </label>
                    <label className="font-bold text-slate-700">Target Budget
                      <input type="number" min="0" value={targetBudget} onChange={(event) => setTargetBudget(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold" />
                    </label>
                  </div>
                  <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold">
                    <span>EHS Loan Officer Used <span className="font-normal text-slate-500">($1,000 internal fee)</span></span>
                    <input type="checkbox" checked={ehsLoanOfficerUsed} onChange={(event) => setEhsLoanOfficerUsed(event.target.checked)} className="h-5 w-5 accent-emerald-600" />
                  </label>

                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="mb-3 font-black text-[#0B1E38]">Deposits</h3>
                    <div className="grid gap-2 sm:grid-cols-5">
                      <input value={depositName} onChange={(event) => setDepositName(event.target.value)} placeholder="Deposit name" className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2" />
                      <input type="number" min="0" value={depositAmount} onChange={(event) => setDepositAmount(Math.max(0, Number(event.target.value) || 0))} placeholder="Amount" className="rounded-xl border border-slate-200 px-3 py-2" />
                      <input type="date" value={depositDate} onChange={(event) => setDepositDate(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2" />
                      <button type="button" onClick={addDeposit} className="rounded-xl bg-[#0F2A47] px-3 py-2 font-black text-white">+ Add Deposit</button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold text-slate-500">Status:</span>
                      <select value={depositStatus} onChange={(event) => setDepositStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-bold"><option value="planned">Planned</option><option value="received">Received</option><option value="refunded">Refunded</option></select>
                    </div>
                    {deposits.length > 0 && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                        {deposits.map((deposit) => (
                          <div key={deposit.id} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 last:border-b-0"><div><span className="font-black">{deposit.name}</span><span className="ml-2 text-slate-500">{deposit.status}{deposit.date ? ` · ${deposit.date}` : ''}</span></div><div className="flex items-center gap-3"><span className="font-black">{money(deposit.amount)}</span><button type="button" onClick={() => setDeposits((current) => current.filter((item) => item.id !== deposit.id))} className="font-black text-rose-600">✕</button></div></div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'notes' && (
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-xs shadow-xs">
                  <h2 className="text-lg font-black text-[#0B1E38]">Proposal Notes & Terms</h2>
                  <label className="block font-bold text-slate-700">Customer-Facing Notes
                    <textarea rows={5} value={notesCustomer} onChange={(event) => setNotesCustomer(event.target.value)} placeholder="Proposal notes visible to the customer" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" />
                  </label>
                  <label className="block font-bold text-slate-700">Internal Notes
                    <textarea rows={4} value={notesInternal} onChange={(event) => setNotesInternal(event.target.value)} placeholder="Internal EHS notes — not customer-facing" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" />
                  </label>
                </section>
              )}
            </div>

            <aside className="self-start rounded-2xl border border-slate-200 bg-white p-5 text-xs shadow-2xs lg:sticky lg:top-24">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Customer-Facing</div>
              <div className="mt-4 space-y-2 text-slate-700">
                <div className="flex justify-between gap-4"><span>Home</span><strong>{money(homePrice)}</strong></div>
                {propertyPrice > 0 && <div className="flex justify-between gap-4"><span>Land / Parcel</span><strong>{money(propertyPrice)}</strong></div>}
                <div className="flex justify-between gap-4"><span>Delivery</span><strong>{money(deliveryFreightPrice)}</strong></div>
                <div className="flex justify-between gap-4"><span>Site Work</span><strong>{money(siteWorkPrice)}</strong></div>
                {addonsPrice > 0 && <div className="flex justify-between gap-4"><span>Add-Ons</span><strong>{money(addonsPrice)}</strong></div>}
                {discounts > 0 && <div className="flex justify-between gap-4 text-rose-700"><span>Discount</span><strong>-{money(discounts)}</strong></div>}
                <div className="my-2 border-t border-slate-100" />
                <div className="flex justify-between gap-4 text-sm font-black text-slate-800"><span>Subtotal</span><strong>{money(totals.subtotal)}</strong></div>
                <div className="flex justify-between gap-4 font-black text-slate-700"><span>3% sales tax</span><strong className="text-[#1E6FA8]">{money(totals.sales_tax_total)}</strong></div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#0F2A47] px-3.5 py-3 text-white shadow-md">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Estimated Total</span>
                  <span className="font-mono text-xl font-black">{money(totals.estimated_total)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Calculation check</div>
                <div className="mt-1 font-bold text-slate-700">Home + Land + Delivery + Site Work + Add-Ons − Discounts</div>
                <div className="mt-1 font-black text-emerald-700">= {money(totals.subtotal)}</div>
              </div>

              <button type="button" disabled={isSaving} onClick={() => void saveQuote()} className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? 'Saving to permanent library…' : '✓ Create & Save Master Quote'}
              </button>
            </aside>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

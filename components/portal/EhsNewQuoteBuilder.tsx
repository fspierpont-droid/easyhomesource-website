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
import { PROPERTY_TYPE_LABELS, type Property } from '@/types/property';

type Tab = 'customer' | 'home' | 'site' | 'services' | 'financing' | 'review';
type RouteType = 'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer';
type LandOption = 'CUSTOMER_OWNED' | 'EHS_PROPERTY' | 'TBD';

type DepositStatus = 'planned' | 'received' | 'refunded';

const SETUP_SKUS = new Set([
  'SITE-BLOCK-TIEDOWN',
  'SITE-TRIMOUT',
  'SITE-PERIMETER-STABILIZATION',
  'SITE-STEPS-2SET',
  'SITE-SKIRTING-VALOR',
]);

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);
}

function cleanVisibleText(value: string) {
  return String(value || '')
    .replace(/Master Quote 5\s*/gi, '')
    .replace(/Master Spreadsheet\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
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
    description: cleanVisibleText(description),
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
  const skirting = calculateSkirtingByDimensions(
    Number(home.width) || 14,
    Number(home.length) || 60,
  );

  return [
    makeLine(
      'setup-block',
      'SITE-BLOCK-TIEDOWN',
      'Block & Tie-Down & Vapor Barrier',
      `Calculated for a ${cls}-section home using the ${block.matchedLength}-ft setup bracket.`,
      'mandatory_services',
      block.cost,
      block.price,
      1,
    ),
    makeLine(
      'setup-trim',
      'SITE-TRIMOUT',
      `Trim Out - ${trim.label}`,
      'Final interior/exterior trim after set; priced by home section count.',
      'mandatory_services',
      trim.cost,
      trim.price,
      1,
    ),
    makeLine(
      'setup-stabilization',
      'SITE-PERIMETER-STABILIZATION',
      'Perimeter Stabilization',
      'Perimeter stabilization to prevent washouts and maintain level ground around the home.',
      'mandatory_services',
      1000,
      1100,
      1,
    ),
    makeLine(
      'setup-steps',
      'SITE-STEPS-2SET',
      'Wooden Steps',
      'Code-compliant wooden step sets. Quantity is the number of step sets.',
      'mandatory_services',
      500,
      1250,
      2,
    ),
    makeLine(
      'setup-skirting',
      'SITE-SKIRTING-VALOR',
      'Basic Valor Skirting',
      'Perimeter skirting including vents, corners and trim. Quantity is linear feet.',
      'mandatory_services',
      8,
      10,
      skirting.linearFeet,
    ),
  ];
}

function calculateDelivery(
  routeType: RouteType,
  miles: number,
  sections: number,
  escortsPerSection: number,
) {
  if (routeType === 'factory_to_customer' || routeType === 'factory_to_dealer') {
    const cost = 6000 * sections;
    return {
      cost,
      price: cost * 1.1,
      note: '$6,000 cost / $6,600 customer price per transported section.',
    };
  }

  if (!(miles > 0)) {
    return {
      cost: 0,
      price: 0,
      note: 'Enter the actual dealership-to-site mileage to calculate delivery.',
    };
  }

  const over50 = Math.max(0, miles - 50);
  const costPerSection =
    800 +
    (250 * escortsPerSection) +
    (8.5 * over50) +
    (2 * escortsPerSection * over50);
  const cost = costPerSection * sections;

  return {
    cost,
    price: Math.round(cost * 1.1 * 100) / 100,
    note: '$800 base per section + $250 per escort; mileage over 50 adds the current truck/escort mileage charges.',
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
    1,
  );
}

function quantityLabel(item: SelectedQuoteLineItem) {
  if (item.sku === 'SITE-SKIRTING-VALOR') return 'Linear Ft';
  if (item.sku === 'SITE-STEPS-2SET') return 'Sets';
  if (item.sku.startsWith('SITE-DIRTPAD-')) return 'Packages';
  return 'Qty';
}

function emailLooksValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function phoneLooksValid(phone: string) {
  return phone.replace(/\D/g, '').length >= 10;
}

export default function EhsNewQuoteBuilder() {
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

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [salespersonEmail, setSalespersonEmail] = useState(
    user?.email || fallbackConsultant?.email || '',
  );
  const [salesperson, setSalesperson] = useState(
    user?.name || fallbackConsultant?.name || '',
  );

  const [properties, setProperties] = useState<Property[]>([]);
  const [landOption, setLandOption] = useState<LandOption>('CUSTOMER_OWNED');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyPrice, setPropertyPrice] = useState(0);

  const [routeType, setRouteType] = useState<RouteType>('dealer_to_customer');
  const [deliveryMiles, setDeliveryMiles] = useState(0);
  const [escortsPerSection, setEscortsPerSection] = useState(Number(initialHome?.width) > 14 ? 1 : 0);
  const [deliveryPriceOverride, setDeliveryPriceOverride] = useState<number | null>(null);

  const [lineItems, setLineItems] = useState<SelectedQuoteLineItem[]>(
    () => buildRequiredSetup(initialHome),
  );
  const [selectedServiceSku, setSelectedServiceSku] = useState('');

  const [purchaseType, setPurchaseType] = useState<'cash' | 'financing'>('financing');
  const [financingStatus, setFinancingStatus] = useState('pending');
  const [targetBudget, setTargetBudget] = useState(0);
  const [preApprovalAmount, setPreApprovalAmount] = useState(0);
  const [ehsLoanOfficerUsed, setEhsLoanOfficerUsed] = useState(false);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [depositName, setDepositName] = useState('Initial Deposit');
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositDate, setDepositDate] = useState('');
  const [depositStatus, setDepositStatus] = useState<DepositStatus>('planned');

  const [notesCustomer, setNotesCustomer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        if (!cancelled && response.ok && data.success && Array.isArray(data.properties)) {
          setProperties(
            data.properties.filter((property: Property) => property.status === 'AVAILABLE'),
          );
        }
      } catch (error) {
        console.error('Failed to load permanent properties for quote builder:', error);
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
    () => calculateDelivery(routeType, deliveryMiles, sections, escortsPerSection),
    [routeType, deliveryMiles, sections, escortsPerSection],
  );
  const deliveryPrice = deliveryPriceOverride ?? deliveryCalculated.price;
  const deliveryCost = deliveryCalculated.cost;

  const siteWorkPrice = lineItems
    .filter(
      (item) =>
        item.category === 'mandatory_services' ||
        item.category === 'site_work' ||
        item.category === 'custom',
    )
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const siteWorkCost = lineItems
    .filter(
      (item) =>
        item.category === 'mandatory_services' ||
        item.category === 'site_work' ||
        item.category === 'custom',
    )
    .reduce((sum, item) => sum + item.totalCost, 0);
  const addonsPrice = lineItems
    .filter((item) => item.category === 'addons' || item.category === 'options')
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const addonsCost = lineItems
    .filter((item) => item.category === 'addons' || item.category === 'options')
    .reduce((sum, item) => sum + item.totalCost, 0);

  const totals = useMemo(
    () =>
      calculateNewQuoteTotals({
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
      }),
    [
      selectedHome,
      propertyPrice,
      deliveryPrice,
      siteWorkPrice,
      addonsPrice,
      deliveryCost,
      siteWorkCost,
      addonsCost,
    ],
  );

  const hasDirtPad = lineItems.some((item) => item.sku.startsWith('SITE-DIRTPAD-'));
  const serviceOptions = useMemo(
    () =>
      SERVICE_CATALOG.filter((service) => {
        if (lineItems.some((line) => line.sku === service.sku)) return false;
        if (hasDirtPad && service.sku.startsWith('SITE-DIRTPAD-')) return false;
        return true;
      }),
    [lineItems, hasDirtPad],
  );

  useEffect(() => {
    if (!serviceOptions.some((item) => item.sku === selectedServiceSku)) {
      setSelectedServiceSku(serviceOptions[0]?.sku || '');
    }
  }, [serviceOptions, selectedServiceSku]);

  const totalDeposits = deposits.reduce((sum, deposit) => sum + (Number(deposit.amount) || 0), 0);

  function selectHome(home: MasterCatalogHome) {
    setSelectedHome(home);
    setEscortsPerSection(Number(home.width) > 14 ? 1 : 0);
    setDeliveryPriceOverride(null);
    setLineItems((current) => [
      ...buildRequiredSetup(home),
      ...current.filter((item) => !SETUP_SKUS.has(item.sku)),
    ]);
  }

  function selectLandOption(option: LandOption) {
    setLandOption(option);
    if (option !== 'EHS_PROPERTY') {
      setSelectedPropertyId('');
      setPropertyPrice(0);
    }
    if (option === 'TBD') {
      setPropertyAddress('');
    }
  }

  function selectProperty(id: string) {
    setSelectedPropertyId(id);
    const property = properties.find((item) => item.id === id);
    if (!property) {
      setPropertyPrice(0);
      return;
    }
    setPropertyAddress(
      [property.address, property.city, property.state, property.zip].filter(Boolean).join(', '),
    );
    setPropertyPrice(Number(property.price) || 0);
  }

  function addService() {
    const service = SERVICE_CATALOG.find((item) => item.sku === selectedServiceSku);
    if (!service || lineItems.some((line) => line.sku === service.sku)) return;
    setLineItems((current) => [...current, lineFromCatalog(service, selectedHome)]);
  }

  function updateLine(id: string, field: 'unitPrice' | 'quantity', value: number) {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const quantity =
          field === 'quantity'
            ? Math.max(1, Math.round(Number(value) || 1))
            : item.quantity;
        const unitPrice =
          field === 'unitPrice'
            ? Math.max(0, Number(value) || 0)
            : item.unitPrice;
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

  function addDeposit() {
    if (!(depositAmount > 0)) return;
    setDeposits((current) => [
      ...current,
      {
        id: `deposit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: depositName.trim() || 'Deposit',
        amount: depositAmount,
        date: depositDate,
        status: depositStatus,
      },
    ]);
    setDepositName('Additional Deposit');
    setDepositAmount(0);
    setDepositDate('');
    setDepositStatus('planned');
  }

  async function saveAndOpen() {
    if (isSaving) return;
    setSaveError(null);

    if (!customerName.trim()) {
      setSaveError('Customer name is required before creating a quote.');
      setActiveTab('customer');
      return;
    }
    if (!phoneLooksValid(customerPhone)) {
      setSaveError('A valid customer phone number is required before creating a quote.');
      setActiveTab('customer');
      return;
    }
    if (!emailLooksValid(customerEmail)) {
      setSaveError('A valid customer email address is required before creating a quote.');
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
      escortsCount: escortsPerSection * sections,
      freightDelivery: deliveryPrice,
      freightCost: deliveryCost,
      siteWorkTotal: siteWorkPrice,
      siteWorkCost,
      lineItems: lineItems.map((item) => ({
        ...item,
        description: cleanVisibleText(item.description),
      })),
      discounts: 0,
      purchaseType,
      financingStatus,
      preApprovalAmount,
      targetBudget,
      ehsLoanOfficerUsed,
      activeLoanFee: ehsLoanOfficerUsed ? 1000 : 0,
      deposits,
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
    ['site', '3. Land & Delivery'],
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
                <Link href="/quotes" className="text-sm font-semibold text-sky-700">
                  ← Back to Quote Library
                </Link>
                <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                  New Master Quote Proposal Builder
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Current EHS pricing · {catalog.length} approved homes · saves directly to the Quote Library
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold lg:hidden"
              >
                Menu
              </button>
            </div>

            {saveError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700">
                {saveError}
              </div>
            )}

            <div className="mb-5 overflow-x-auto border-b border-slate-200 bg-white">
              <div className="flex min-w-max">
                {tabs.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`min-h-12 px-5 py-3 text-sm font-extrabold ${
                      activeTab === key
                        ? 'border-b-4 border-sky-600 text-slate-950'
                        : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                {activeTab === 'customer' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-black">Customer & Consultant</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Name, phone and email are required. Current address can be added later if the customer does not know the final site yet.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <span className="mb-2 block font-bold">Customer Name *</span>
                        <input
                          value={customerName}
                          onChange={(event) => setCustomerName(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                          placeholder="Customer full name"
                        />
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">Phone *</span>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(event) => setCustomerPhone(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                          placeholder="Customer phone number"
                        />
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">Email *</span>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(event) => setCustomerEmail(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                          placeholder="Customer email address"
                        />
                      </label>
                      <label className="sm:col-span-2">
                        <span className="mb-2 block font-bold">Current Address</span>
                        <input
                          value={customerAddress}
                          onChange={(event) => setCustomerAddress(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                          placeholder="Optional until known"
                        />
                      </label>
                      <label className="sm:col-span-2">
                        <span className="mb-2 block font-bold">Assigned Consultant</span>
                        <select
                          value={salespersonEmail}
                          onChange={(event) => {
                            const member = VERIFIED_TEAM_USERS.find(
                              (item) => item.email === event.target.value,
                            );
                            setSalespersonEmail(event.target.value);
                            setSalesperson(member?.name || event.target.value);
                          }}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        >
                          {VERIFIED_TEAM_USERS.filter((member) => member.active).map((member) => (
                            <option key={member.email} value={member.email}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'home' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-black">Home Selection</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Only approved manufacturers and current EHS prices are shown.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={homeSearch}
                        onChange={(event) => setHomeSearch(event.target.value)}
                        className="rounded-xl border border-slate-300 px-4 py-3"
                        placeholder="Search model / series / manufacturer"
                      />
                      <select
                        value={manufacturerFilter}
                        onChange={(event) => setManufacturerFilter(event.target.value)}
                        className="rounded-xl border border-slate-300 px-4 py-3"
                      >
                        <option value="ALL">All approved manufacturers</option>
                        {manufacturers.map((name) => (
                          <option key={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                      {filteredHomes.map((home) => (
                        <button
                          key={`${home.manufacturer}-${home.name}`}
                          type="button"
                          onClick={() => selectHome(home)}
                          className={`w-full rounded-2xl border p-4 text-left ${
                            selectedHome.manufacturer === home.manufacturer &&
                            selectedHome.name === home.name
                              ? 'border-sky-500 bg-sky-50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="font-black">{home.name}</div>
                              <div className="text-sm text-slate-500">
                                {home.manufacturer} · {home.series}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                {home.dimensions} · {home.bedrooms}/{home.bathrooms} ·{' '}
                                {home.squareFeet?.toLocaleString()} sq ft
                              </div>
                            </div>
                            <div className="text-lg font-black text-slate-900">
                              {money(home.ehsPrice)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'site' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-black">Land & Delivery</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Choose the customer’s land situation first, then calculate or enter delivery.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ['CUSTOMER_OWNED', 'Customer Owned Land', 'Customer already owns the site. Land price is $0.'],
                        ['EHS_PROPERTY', 'EHS Property / Package', 'Select an available EHS land, home, or land-home package record.'],
                        ['TBD', 'Land TBD', 'Use when the customer has not selected a homesite yet.'],
                      ].map(([value, title, description]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => selectLandOption(value as LandOption)}
                          className={`rounded-2xl border p-4 text-left ${
                            landOption === value
                              ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-100'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="font-black">{title}</div>
                          <div className="mt-1 text-xs text-slate-500">{description}</div>
                        </button>
                      ))}
                    </div>

                    {landOption === 'EHS_PROPERTY' && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label>
                          <span className="mb-2 block font-bold">Available EHS Property / Package</span>
                          <select
                            value={selectedPropertyId}
                            onChange={(event) => selectProperty(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                          >
                            <option value="">Select a property</option>
                            {properties.map((property) => (
                              <option key={property.id} value={property.id}>
                                {property.address}, {property.city} — {PROPERTY_TYPE_LABELS[property.propertyType]}
                                {property.price ? ` — ${money(property.price)}` : ''}
                              </option>
                            ))}
                          </select>
                        </label>
                        {properties.length === 0 && (
                          <div className="mt-2 text-sm text-amber-700">
                            There are currently no AVAILABLE property records in the permanent Property Center.
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <span className="mb-2 block font-bold">Delivery / Site Address</span>
                        <input
                          value={propertyAddress}
                          onChange={(event) => setPropertyAddress(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                          placeholder="Enter when known"
                        />
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">
                          {landOption === 'EHS_PROPERTY' ? 'Land / Package Price' : 'Land Price'}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={propertyPrice}
                          disabled={landOption !== 'EHS_PROPERTY'}
                          onChange={(event) => setPropertyPrice(Number(event.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                        />
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">Route Type</span>
                        <select
                          value={routeType}
                          onChange={(event) => {
                            setRouteType(event.target.value as RouteType);
                            setDeliveryPriceOverride(null);
                          }}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        >
                          <option value="dealer_to_customer">Dealership → Customer</option>
                          <option value="factory_to_customer">Factory → Customer</option>
                          <option value="factory_to_dealer">Factory → Dealership</option>
                        </select>
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">Actual Miles</span>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={deliveryMiles}
                          disabled={routeType !== 'dealer_to_customer'}
                          onChange={(event) => {
                            setDeliveryMiles(Number(event.target.value) || 0);
                            setDeliveryPriceOverride(null);
                          }}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                        />
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">Escorts Per Section</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={escortsPerSection}
                          onChange={(event) => {
                            setEscortsPerSection(Math.max(0, Number(event.target.value) || 0));
                            setDeliveryPriceOverride(null);
                          }}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        />
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">Delivery Price / Custom Price</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={deliveryPrice}
                          onChange={(event) =>
                            setDeliveryPriceOverride(Math.max(0, Number(event.target.value) || 0))
                          }
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
                        />
                      </label>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs font-bold uppercase text-slate-500">Calculated EHS Cost</div>
                        <div className="mt-1 text-xl font-black">{money(deliveryCost)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">
                      {deliveryCalculated.note} Sections: {sections}. Total escorts recorded:{' '}
                      {escortsPerSection * sections}.
                    </p>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-black">Paid Line Items</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Every service is charged when used. Unit prices and quantities can be adjusted when the job requires a custom amount.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                      <strong>Septic sizing:</strong> Current sizing rules indicate a minimum{' '}
                      {recommendedSepticTank.toLocaleString()}-gallon tank for this home based on{' '}
                      {selectedHome.bedrooms} bedrooms / {selectedHome.squareFeet?.toLocaleString()} sq ft.
                      The verified base price currently stored is for the 900-gallon package; larger systems require a verified/custom price before finalizing.
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        value={selectedServiceSku}
                        onChange={(event) => setSelectedServiceSku(event.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3"
                      >
                        {serviceOptions.map((item) => (
                          <option key={item.sku} value={item.sku}>
                            {item.name} - {money(item.defaultPrice)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addService}
                        disabled={!selectedServiceSku}
                        className="rounded-xl bg-slate-900 px-5 py-3 font-black text-white disabled:opacity-50"
                      >
                        + Add Item
                      </button>
                    </div>
                    <div className="space-y-3">
                      {lineItems.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-black">{item.name}</div>
                              <div className="mt-1 text-sm text-slate-500">
                                {cleanVisibleText(item.description)}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setLineItems((current) => current.filter((line) => line.id !== item.id))
                              }
                              className="min-h-11 min-w-11 rounded-xl border border-rose-200 text-xl text-rose-600"
                              aria-label={`Remove ${item.name}`}
                            >
                              ×
                            </button>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_180px]">
                            <label>
                              <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                                Unit Price / Custom Price
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(event) =>
                                  updateLine(item.id, 'unitPrice', Number(event.target.value))
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
                              />
                            </label>
                            <label>
                              <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                                {quantityLabel(item)}
                              </span>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(event) =>
                                  updateLine(item.id, 'quantity', Number(event.target.value))
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
                              />
                            </label>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <div className="text-xs font-black uppercase text-slate-500">Line Total</div>
                              <div className="mt-1 text-lg font-black">{money(item.totalPrice)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'financing' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-black">Payment & Financing</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Track how the customer plans to purchase, pre-approval information, and deposits received or expected.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label>
                        <span className="mb-2 block font-bold">Purchase Type</span>
                        <select
                          value={purchaseType}
                          onChange={(event) => {
                            const next = event.target.value as 'cash' | 'financing';
                            setPurchaseType(next);
                            if (next === 'cash') {
                              setFinancingStatus('not_applicable');
                              setEhsLoanOfficerUsed(false);
                            } else if (financingStatus === 'not_applicable') {
                              setFinancingStatus('pending');
                            }
                          }}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        >
                          <option value="financing">Lender Financing</option>
                          <option value="cash">Cash / Self-Pay</option>
                        </select>
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">Financing Status</span>
                        <select
                          value={financingStatus}
                          disabled={purchaseType === 'cash'}
                          onChange={(event) => setFinancingStatus(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                        >
                          <option value="not_applicable">Not Applicable</option>
                          <option value="pending">Pending Application</option>
                          <option value="pre_approved">Pre-Approved</option>
                          <option value="approved">Approved</option>
                          <option value="declined">Declined</option>
                        </select>
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">Customer Target Budget</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={targetBudget}
                          onChange={(event) => setTargetBudget(Number(event.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        />
                      </label>
                      <label>
                        <span className="mb-2 block font-bold">Pre-Approval Amount</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={preApprovalAmount}
                          disabled={purchaseType === 'cash'}
                          onChange={(event) => setPreApprovalAmount(Number(event.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                        />
                      </label>
                    </div>

                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                      <input
                        type="checkbox"
                        checked={ehsLoanOfficerUsed}
                        disabled={purchaseType === 'cash'}
                        onChange={(event) => setEhsLoanOfficerUsed(event.target.checked)}
                        className="mt-1 h-5 w-5"
                      />
                      <div>
                        <div className="font-black">EHS Loan Officer Used</div>
                        <div className="text-sm text-slate-500">
                          Applies the $1,000 internal loan fee when an EHS loan officer is used.
                        </div>
                      </div>
                    </label>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="font-black">Deposits</h3>
                          <p className="text-sm text-slate-500">
                            Deposits are tracked as payments; they do not reduce the quoted sale price.
                          </p>
                        </div>
                        <div className="font-black">Total: {money(totalDeposits)}</div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label>
                          <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Deposit Name</span>
                          <input
                            value={depositName}
                            onChange={(event) => setDepositName(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                          />
                        </label>
                        <label>
                          <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Amount</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={depositAmount}
                            onChange={(event) => setDepositAmount(Number(event.target.value) || 0)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                          />
                        </label>
                        <label>
                          <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Date</span>
                          <input
                            type="date"
                            value={depositDate}
                            onChange={(event) => setDepositDate(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                          />
                        </label>
                        <label>
                          <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Status</span>
                          <select
                            value={depositStatus}
                            onChange={(event) => setDepositStatus(event.target.value as DepositStatus)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                          >
                            <option value="planned">Planned / Due</option>
                            <option value="received">Received</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={addDeposit}
                        disabled={depositAmount <= 0}
                        className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 font-black text-white disabled:opacity-40"
                      >
                        + Add Deposit
                      </button>

                      {deposits.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {deposits.map((deposit) => (
                            <div
                              key={deposit.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                            >
                              <div>
                                <div className="font-bold">{deposit.name}</div>
                                <div className="text-xs text-slate-500">
                                  {deposit.status} {deposit.date ? `· ${deposit.date}` : ''}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <strong>{money(deposit.amount)}</strong>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeposits((current) => current.filter((item) => item.id !== deposit.id))
                                  }
                                  className="min-h-10 min-w-10 rounded-lg border border-rose-200 text-rose-600"
                                  aria-label={`Remove ${deposit.name}`}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <label>
                      <span className="mb-2 block font-bold">Customer-Facing Notes</span>
                      <textarea
                        value={notesCustomer}
                        onChange={(event) => setNotesCustomer(event.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        placeholder="Proposal notes"
                      />
                    </label>
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="space-y-5">
                    <h2 className="text-2xl font-black">Review & Save</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-black uppercase text-slate-500">Customer</div>
                        <div className="mt-1 font-black">{customerName || 'Customer name required'}</div>
                        <div className="text-sm text-slate-500">
                          {customerPhone || 'Phone required'} · {customerEmail || 'Email required'}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-black uppercase text-slate-500">Home</div>
                        <div className="mt-1 font-black">{selectedHome.name}</div>
                        <div className="text-sm text-slate-500">
                          {selectedHome.manufacturer} · {money(selectedHome.ehsPrice)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-black uppercase text-slate-500">Land</div>
                        <div className="mt-1 font-black">
                          {landOption === 'CUSTOMER_OWNED'
                            ? 'Customer Owned Land'
                            : landOption === 'TBD'
                              ? 'Land TBD'
                              : properties.find((property) => property.id === selectedPropertyId)?.address || 'EHS property not selected'}
                        </div>
                        <div className="text-sm text-slate-500">{money(propertyPrice)}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-black uppercase text-slate-500">Financing / Payments</div>
                        <div className="mt-1 font-black">
                          {purchaseType === 'cash' ? 'Cash / Self-Pay' : financingStatus.replaceAll('_', ' ')}
                        </div>
                        <div className="text-sm text-slate-500">Deposits tracked: {money(totalDeposits)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={saveAndOpen}
                      disabled={isSaving}
                      className="w-full rounded-2xl bg-emerald-600 px-5 py-4 text-lg font-black text-white shadow-sm disabled:opacity-60"
                    >
                      {isSaving ? 'Saving to Quote Library…' : '✓ Create & Open in Full Editor'}
                    </button>
                  </div>
                )}
              </section>

              <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-5">
                <div className="text-xs font-black uppercase tracking-wider text-sky-700">Customer-Facing</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><span>Home</span><strong>{money(selectedHome.ehsPrice)}</strong></div>
                  <div className="flex justify-between gap-4"><span>Land</span><strong>{money(propertyPrice)}</strong></div>
                  <div className="flex justify-between gap-4"><span>Delivery</span><strong>{money(deliveryPrice)}</strong></div>
                  <div className="flex justify-between gap-4"><span>Site Work</span><strong>{money(siteWorkPrice)}</strong></div>
                  <div className="flex justify-between gap-4"><span>Add-Ons</span><strong>{money(addonsPrice)}</strong></div>
                  <div className="mt-3 flex justify-between gap-4 border-t border-slate-200 pt-3 text-base"><strong>Subtotal</strong><strong>{money(totals.subtotal)}</strong></div>
                  <div className="flex justify-between gap-4"><span>3% Sales Tax</span><strong className="text-sky-700">{money(totals.sales_tax_total)}</strong></div>
                </div>
                <div className="mt-5 rounded-2xl bg-slate-900 p-5 text-white">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-300">Estimated Total</div>
                  <div className="mt-2 text-3xl font-black">{money(totals.estimated_total)}</div>
                </div>
                {totalDeposits > 0 && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                    <div className="font-bold text-emerald-900">Deposits Tracked</div>
                    <div className="text-lg font-black text-emerald-800">{money(totalDeposits)}</div>
                    <div className="text-xs text-emerald-700">Payment tracking only; quote total is unchanged.</div>
                  </div>
                )}
                <div className="mt-4 text-xs text-slate-500">
                  Quote #{quoteNumber}. Dirt, A/C, well, septic, utilities and bid work are charged only when selected or added.
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}

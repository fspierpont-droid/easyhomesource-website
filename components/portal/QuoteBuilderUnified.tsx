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
} from '@/data/pricingSpreadsheet';
import { VERIFIED_TEAM_USERS } from '@/data/teamMembers';
import {
  fetchQuoteFromServer,
  saveQuoteToServer,
  type DepositItem,
  type SavedQuote,
  type SelectedQuoteLineItem,
} from '@/data/quotesStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { calculateModernQuoteTotals } from '@/lib/quotes/modernQuoteTotals';
import {
  applySiteSystems,
  inferSiteSystems,
  recommendedAcTonnage,
  recommendedSepticSize,
  type AcEquipmentType,
  type AcSystemType,
  type SewerSource,
  type SiteSystemSelection,
  type WaterSource,
} from '@/lib/quotes/siteSystems';
import type { Property } from '@/types/property';

type Tab = 'customer' | 'home' | 'delivery' | 'systems' | 'financing' | 'review';
type LandOption = 'OWNED' | 'EHS_PROPERTY' | 'CUSTOM';
type RouteType = 'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer';

const DEALERSHIP_ADDRESS = '9011 McIntyre Rd, Brooksville, FL 34601';
const SETUP_SKUS = new Set([
  'SITE-BLOCK-TIEDOWN',
  'SITE-TRIMOUT',
  'SITE-PERIMETER-STABILIZATION',
  'SITE-STEPS-2SET',
  'SITE-SKIRTING-VALOR',
  'SITE-PERMIT-PLAN',
]);

const FACTORY_PROFILES: Array<{ match: string[]; address: string }> = [
  { match: ['cavco ocala'], address: '931 NW 37th Ave, Ocala, FL 34475' },
  { match: ['cavco plant city', 'palm harbor'], address: '605 S Frontage Road, Plant City, FL 33563' },
  { match: ['champion', 'lake city'], address: '1915 SE State Rd 100, Lake City, FL 32025' },
  { match: ['clayton addison'], address: '17921 Co Rd 41, Addison, AL 35540' },
  { match: ['clayton russellville'], address: '1037 Hwy 44, Russellville, AL 35654' },
  { match: ['clayton tru', 'tru homes'], address: '2746 County Road 59, Lynn, AL 35575' },
  { match: ['legacy'], address: '184 Industrial Blvd, Eatonton, GA 31024' },
  { match: ['skyline'], address: '1230 SW 10th St, Ocala, FL 34471' },
  { match: ['timber creek'], address: '674 Co Rd 65, Bear Creek, AL 35543' },
];

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
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

function sectionCount(home: MasterCatalogHome) {
  const explicit = Number(home.floors) || 0;
  if (explicit >= 1 && explicit <= 3) return explicit;
  const width = Number(home.width) || 14;
  if (width <= 18) return 1;
  if (width <= 36) return 2;
  return 3;
}

function sectionClass(home: MasterCatalogHome): 'single' | 'double' | 'triple' {
  const count = sectionCount(home);
  return count === 1 ? 'single' : count === 2 ? 'double' : 'triple';
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
  );
}

function requiredSetup(home: MasterCatalogHome): SelectedQuoteLineItem[] {
  const cls = sectionClass(home);
  const count = sectionCount(home);
  const block = calculateBlockTieDown(Number(home.length) || 60, cls);
  const trim = calculateTrimOut(count);
  const skirting = calculateSkirtingByDimensions(Number(home.width) || 14, Number(home.length) || 60);
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

function factoryAddressFor(manufacturer: string) {
  const text = String(manufacturer || '').toLowerCase();
  return FACTORY_PROFILES.find((profile) => profile.match.some((token) => text.includes(token)))?.address || '';
}

function syntheticHome(quote: SavedQuote): MasterCatalogHome {
  return {
    name: quote.homeModel || 'Saved Home',
    manufacturer: quote.manufacturer || '',
    series: quote.series || '',
    bedrooms: quote.beds || 0,
    bathrooms: quote.baths || 0,
    squareFeet: quote.sqft || 0,
    dimensions: quote.dimensions || '',
    width: quote.homeWidth || 14,
    length: quote.homeLength || 60,
    ehsPrice: quote.homePrice || 0,
    estFactoryCost: quote.factoryCost || 0,
  } as MasterCatalogHome;
}

interface DeliveryEstimate {
  miles: number;
  distance_text?: string;
  duration_text?: string;
  transport_sides: number;
  escort_count: number;
  delivery_cost: number;
  delivery_price: number;
  source: string;
  warning?: string;
}

export default function QuoteBuilderUnified({ quoteId }: { quoteId?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const initialHome = FULL_MASTER_CATALOG_HOMES[0];
  const fallbackConsultant = VERIFIED_TEAM_USERS.find((member) => member.active);
  const editing = Boolean(quoteId);

  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [loadedQuote, setLoadedQuote] = useState<SavedQuote | null>(null);
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
  const [status, setStatus] = useState<SavedQuote['status']>('DRAFT');

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
  const [deliveryNote, setDeliveryNote] = useState('Enter the delivery address, then calculate the driving route.');
  const [deliveryError, setDeliveryError] = useState('');
  const [deliveryPending, setDeliveryPending] = useState(false);

  const [lineItems, setLineItems] = useState<SelectedQuoteLineItem[]>(() => requiredSetup(initialHome));
  const [selectedServiceSku, setSelectedServiceSku] = useState(
    SERVICE_CATALOG.find((item) => !SETUP_SKUS.has(item.sku))?.sku || '',
  );
  const [discounts, setDiscounts] = useState(0);
  const [siteSystems, setSiteSystems] = useState<SiteSystemSelection>(() =>
    inferSiteSystems([], Number(initialHome?.squareFeet) || 0),
  );

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

  const newQuoteId = useMemo(() => `quote-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, []);
  const newQuoteNumber = useMemo(() => `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`, []);
  const effectiveQuoteId = loadedQuote?.id || newQuoteId;
  const effectiveQuoteNumber = loadedQuote?.quoteNumber || newQuoteNumber;

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
    if (!user || editing || loadedQuote) return;
    setSalesperson(user.name);
    setSalespersonEmail(user.email);
  }, [user, editing, loadedQuote]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch('/api/portal/properties', { cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok || !payload.success || !Array.isArray(payload.properties)) {
          throw new Error(payload.error || 'Unable to load Property Center.');
        }
        setProperties(payload.properties.filter((property: Property) => property.status === 'AVAILABLE'));
      } catch (error) {
        if (!cancelled) setPropertyLoadError(error instanceof Error ? error.message : 'Unable to load Property Center.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!quoteId) return;
    let cancelled = false;
    setLoading(true);
    void fetchQuoteFromServer(quoteId)
      .then((quote) => {
        if (cancelled) return;
        if (!quote) throw new Error('Quote not found.');
        if (quote.legacyReadOnly) throw new Error('Historical quotes are read-only and cannot be opened in the current editor.');
        setLoadedQuote(quote);
        setCustomerName(quote.customerName || '');
        setCustomerPhone(quote.customerPhone || '');
        setCustomerEmail(quote.customerEmail || '');
        setCustomerAddress(quote.customerAddress || '');
        setSalesperson(quote.salesperson || user?.name || '');
        setSalespersonEmail(quote.salespersonEmail || user?.email || '');
        setStatus(quote.status || 'DRAFT');

        const match = getEffectiveMasterCatalog().find((home) =>
          home.name === quote.homeModel && (!quote.manufacturer || home.manufacturer === quote.manufacturer),
        ) || getEffectiveMasterCatalog().find((home) => home.name === quote.homeModel);
        const home = match || syntheticHome(quote);
        setSelectedHome(home);
        setHomePrice(Number(quote.homePrice) || 0);
        setFactoryCost(Number(quote.factoryCost) || 0);

        setPropertyAddress(quote.propertyAddress || '');
        setPropertyPrice(Number(quote.propertyPrice) || 0);
        setLandOption(Number(quote.propertyPrice) > 0 ? 'CUSTOM' : 'OWNED');
        setRouteType((quote.deliveryRouteType as RouteType) || 'dealer_to_customer');
        setDeliveryMiles(Number(quote.deliveryMiles) || 0);
        setEscortsCount(Number(quote.escortsCount) || 0);
        setDeliveryFreightPrice(Number(quote.freightDelivery) || 0);
        setDeliveryFreightCost(Number(quote.freightCost) || 0);
        setDeliveryNote(Number(quote.deliveryMiles) > 0 ? `${quote.deliveryMiles} saved route miles. Recalculate if the route changed.` : 'No delivery route is currently recorded.');

        const savedLines = Array.isArray(quote.lineItems) ? quote.lineItems : [];
        setLineItems(savedLines);
        setSiteSystems(inferSiteSystems(savedLines, Number(quote.sqft) || 0));
        setDiscounts(Number(quote.discounts) || 0);
        setPurchaseType(quote.purchaseType || 'financing');
        setFinancingStatus(quote.financingStatus || 'pending');
        setPreApprovalAmount(Number(quote.preApprovalAmount) || 0);
        setTargetBudget(Number(quote.targetBudget) || 0);
        setEhsLoanOfficerUsed(Boolean(quote.ehsLoanOfficerUsed));
        setDeposits(Array.isArray(quote.deposits) ? quote.deposits : []);
        setNotesCustomer(quote.notesCustomer || quote.notes || '');
        setNotesInternal(quote.notesInternal || '');
        setLoadError('');
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Unable to load quote.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [quoteId, user?.email, user?.name]);

  const manufacturers = useMemo(() => Array.from(new Set(catalog.map((home) => home.manufacturer))).sort(), [catalog]);
  const filteredHomes = useMemo(() => {
    const query = homeSearch.trim().toLowerCase();
    return catalog.filter((home) => {
      if (manufacturerFilter !== 'ALL' && home.manufacturer !== manufacturerFilter) return false;
      if (!query) return true;
      return [home.name, home.manufacturer, home.series, home.bedrooms, home.bathrooms, home.squareFeet, home.dimensions]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [catalog, homeSearch, manufacturerFilter]);

  const siteWorkItems = lineItems.filter((item) => item.category === 'mandatory_services' || item.category === 'site_work' || item.category === 'custom');
  const addOnItems = lineItems.filter((item) => item.category === 'addons' || item.category === 'options');
  const siteWorkPrice = siteWorkItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const siteWorkCost = siteWorkItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const addonsPrice = addOnItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const addonsCost = addOnItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);

  const totals = useMemo(() => calculateModernQuoteTotals({
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
  }), [homePrice, propertyPrice, deliveryFreightPrice, siteWorkPrice, addonsPrice, discounts, factoryCost, deliveryFreightCost, siteWorkCost, addonsCost, ehsLoanOfficerUsed]);

  function setHome(home: MasterCatalogHome) {
    setSelectedHome(home);
    setHomePrice(Number(home.ehsPrice) || 0);
    setFactoryCost(Number(home.estFactoryCost) || 0);
    const nextSystems = {
      ...siteSystems,
      acTonnage: siteSystems.acEnabled ? recommendedAcTonnage(Number(home.squareFeet) || 0) : siteSystems.acTonnage,
    };
    setSiteSystems(nextSystems);
    setLineItems((current) => {
      const nonSetup = current.filter((line) => !SETUP_SKUS.has(line.sku));
      return applySiteSystems(
        [...requiredSetup(home), ...nonSetup],
        nextSystems,
        Number(home.bedrooms) || 0,
        Number(home.squareFeet) || 0,
      );
    });
    setDeliveryNote('Home changed. Recalculate delivery for the new section count and width.');
  }

  function updateSystems(patch: Partial<SiteSystemSelection>) {
    const next = { ...siteSystems, ...patch };
    setSiteSystems(next);
    setLineItems((current) => applySiteSystems(
      current,
      next,
      Number(selectedHome.bedrooms) || 0,
      Number(selectedHome.squareFeet) || 0,
    ));
  }

  function selectProperty(id: string) {
    setSelectedPropertyId(id);
    const property = properties.find((item) => item.id === id);
    if (!property) return;
    setPropertyAddress([property.address, property.city, property.state, property.zip].filter(Boolean).join(', '));
    setPropertyPrice(Number(property.price) || 0);
    setDeliveryNote('Property changed. Recalculate the driving route.');
  }

  function changeLandOption(next: LandOption) {
    setLandOption(next);
    setSelectedPropertyId('');
    if (next === 'OWNED') setPropertyPrice(0);
    if (next === 'EHS_PROPERTY' && properties[0]) selectProperty(properties[0].id);
  }

  async function calculateDelivery() {
    setDeliveryError('');
    if (routeType !== 'factory_to_dealer' && !propertyAddress.trim()) {
      setDeliveryError('Enter the delivery homesite address first.');
      return;
    }
    const factoryAddress = factoryAddressFor(selectedHome.manufacturer || '');
    if (routeType !== 'dealer_to_customer' && !factoryAddress) {
      setDeliveryError('No verified factory address is mapped for this manufacturer. Use Dealership → Customer or enter the route manually after confirming the origin.');
      return;
    }

    setDeliveryPending(true);
    try {
      const response = await fetch('/api/portal/delivery/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_address: propertyAddress.trim() || DEALERSHIP_ADDRESS,
          route_type: routeType,
          dealership_address: DEALERSHIP_ADDRESS,
          factory_address: factoryAddress || undefined,
          manual_miles: deliveryMiles > 0 ? deliveryMiles : undefined,
          home_width: Number(selectedHome.width) || 14,
          escort_count: escortsCount > 0 ? escortsCount : undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !payload.estimate) {
        throw new Error(payload.error || 'Unable to calculate the delivery route.');
      }
      const estimate = payload.estimate as DeliveryEstimate;
      setDeliveryMiles(Number(estimate.miles) || 0);
      setEscortsCount(Number(estimate.escort_count) || 0);
      setDeliveryFreightCost(Number(estimate.delivery_cost) || 0);
      setDeliveryFreightPrice(Number(estimate.delivery_price) || 0);
      const parts = [
        estimate.distance_text || `${estimate.miles} miles`,
        estimate.duration_text,
        `${estimate.transport_sides} transported section${estimate.transport_sides === 1 ? '' : 's'}`,
        `${estimate.escort_count} escort${estimate.escort_count === 1 ? '' : 's'} per section`,
        estimate.source === 'google_distance_matrix' ? 'Google driving route' : 'manual mileage fallback',
      ].filter(Boolean);
      setDeliveryNote(`${parts.join(' · ')}${estimate.warning ? ` · ${estimate.warning}` : ''}`);
    } catch (error) {
      setDeliveryError(error instanceof Error ? error.message : 'Unable to calculate delivery.');
    } finally {
      setDeliveryPending(false);
    }
  }

  function addTableLine() {
    if (!selectedServiceSku || lineItems.some((line) => line.sku === selectedServiceSku)) return;
    const line = catalogLine(selectedServiceSku, `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    if (line) setLineItems((current) => [...current, line]);
  }

  function addCustomLine() {
    const id = `custom-${Date.now()}`;
    setLineItems((current) => [...current, makeLine(id, id, 'Custom Site Work / Add-On', 'Enter the confirmed customer price for this deal-specific item.', 'custom', 0, 0)]);
  }

  function updateLine(id: string, field: 'unitPrice' | 'quantity', value: number) {
    setLineItems((current) => current.map((item) => {
      if (item.id !== id) return item;
      const quantity = field === 'quantity' ? Math.max(1, Number(value) || 1) : item.quantity;
      const unitPrice = field === 'unitPrice' ? Math.max(0, Number(value) || 0) : item.unitPrice;
      return { ...item, quantity, unitPrice, totalPrice: quantity * unitPrice, totalCost: quantity * item.unitCost };
    }));
  }

  function addDeposit() {
    if (!(depositAmount > 0)) return;
    setDeposits((current) => [...current, {
      id: `deposit-${Date.now()}`,
      name: depositName.trim() || 'Deposit',
      amount: depositAmount,
      date: depositDate,
      status: depositStatus,
    }]);
    setDepositAmount(0);
  }

  async function saveQuote() {
    if (isSaving) return;
    setSaveError('');
    if (!customerName.trim()) {
      setSaveError('Enter the customer name before saving.');
      setActiveTab('customer');
      return;
    }
    const zeroCustom = lineItems.find((line) => line.sku.startsWith('SITE-SEPTIC-CUSTOM-') && Number(line.totalPrice) <= 0);
    if (zeroCustom) {
      setSaveError('The selected larger septic system requires a confirmed customer price before this quote can be finalized. Enter its price in Site Systems & Services.');
      setActiveTab('systems');
      return;
    }

    const consultant = VERIFIED_TEAM_USERS.find((member) => member.name === salesperson);
    const now = new Date().toISOString();
    const quote: SavedQuote = {
      id: effectiveQuoteId,
      quoteNumber: effectiveQuoteNumber,
      quoteDate: loadedQuote?.quoteDate || now.slice(0, 10),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      customerAddress: customerAddress.trim(),
      salesperson,
      salespersonEmail,
      salespersonTitle: consultant?.title || loadedQuote?.salespersonTitle,
      salespersonPhone: consultant?.phone || loadedQuote?.salespersonPhone,
      status,
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
      notes: notesCustomer.trim(),
      notesCustomer: notesCustomer.trim(),
      notesInternal: notesInternal.trim(),
      shareToken: loadedQuote?.shareToken || effectiveQuoteId,
      createdAt: loadedQuote?.createdAt || now,
      updatedAt: now,
    };

    setIsSaving(true);
    try {
      const persisted = await saveQuoteToServer(quote);
      router.push(`/quotes/${encodeURIComponent(persisted.id)}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Permanent quote save failed.');
    } finally {
      setIsSaving(false);
    }
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'customer', label: '1. Customer & Rep' },
    { id: 'home', label: '2. Home' },
    { id: 'delivery', label: '3. Land & Delivery' },
    { id: 'systems', label: '4. Site Systems & Services' },
    { id: 'financing', label: '5. Financing & Notes' },
    { id: 'review', label: '6. Review & Save' },
  ];

  if (loading) return <AuthGate><div className="min-h-screen bg-slate-100 p-8 font-bold text-slate-600">Loading quote…</div></AuthGate>;
  if (loadError) return <AuthGate><div className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-6 font-bold text-rose-700">{loadError}</div></div></AuthGate>;

  const septicRecommendation = recommendedSepticSize(Number(selectedHome.bedrooms) || 0, Number(selectedHome.squareFeet) || 0);
  const factoryAddress = factoryAddressFor(selectedHome.manufacturer || '');

  return (
    <AuthGate>
      <div className="flex min-h-screen bg-slate-100/70 font-sans text-slate-800">
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

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 shadow-xs">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Link href="/portal?view=library" className="font-bold text-[#1E6FA8] hover:underline">← Quote Library</Link>
                <span className="text-slate-300">|</span>
                <span className="font-mono font-black text-[#0B1E38]">{effectiveQuoteNumber}</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">MASTER QUOTE 5</span>
              </div>
              <h1 className="mt-1 text-xl font-black text-[#0B1E38]">{editing ? 'Edit Master Quote' : 'New Master Quote'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold lg:hidden" onClick={() => setMobileOpen(true)}>Menu</button>
              <button type="button" onClick={() => void saveQuote()} disabled={isSaving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60">{isSaving ? 'Saving…' : editing ? '✓ Save Changes' : '✓ Create Quote'}</button>
            </div>
          </header>

          <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-4">
            {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-black ${activeTab === tab.id ? 'border-[#1E6FA8] bg-sky-50/50 text-[#0B1E38]' : 'border-transparent text-slate-500'}`}>{tab.label}</button>)}
          </div>

          <div className="mx-auto grid max-w-7xl gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <main className="space-y-5">
              {saveError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">{saveError}</div>}

              {activeTab === 'customer' && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="text-lg font-black text-[#0B1E38]">Customer & Consultant</h2>
                <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2">
                  <label className="font-bold">Customer Name *<input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                  <label className="font-bold">Phone<input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                  <label className="font-bold">Email<input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                  <label className="font-bold">Consultant<select value={salesperson} onChange={(e) => { const member = VERIFIED_TEAM_USERS.find((item) => item.name === e.target.value); setSalesperson(e.target.value); setSalespersonEmail(member?.email || ''); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">{VERIFIED_TEAM_USERS.filter((member) => member.active).map((member) => <option key={member.id} value={member.name}>{member.name}</option>)}</select></label>
                  <label className="font-bold sm:col-span-2">Customer Mailing Address<input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                </div>
              </section>}

              {activeTab === 'home' && <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-black text-[#0B1E38]">Home Selection</h2><p className="text-xs text-slate-500">Master Quote 5 catalog and EHS price chain.</p></div><div className="text-right text-xs"><strong>{selectedHome.name}</strong><div className="text-slate-500">{selectedHome.dimensions} · {(selectedHome.squareFeet || 0).toLocaleString()} sq ft</div></div></div>
                <div className="grid gap-2 sm:grid-cols-3"><input value={homeSearch} onChange={(e) => setHomeSearch(e.target.value)} placeholder="Search home…" className="rounded-xl border border-slate-200 px-3 py-2 text-xs sm:col-span-2" /><select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"><option value="ALL">All manufacturers</option>{manufacturers.map((manufacturer) => <option key={manufacturer} value={manufacturer}>{manufacturer}</option>)}</select></div>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">{filteredHomes.slice(0, 80).map((home) => <button key={home.slug || `${home.manufacturer}-${home.name}`} type="button" onClick={() => setHome(home)} className={`flex w-full justify-between gap-4 border-b border-slate-100 p-3 text-left text-xs hover:bg-slate-50 ${selectedHome.name === home.name && selectedHome.manufacturer === home.manufacturer ? 'bg-sky-50' : ''}`}><div><div className="font-black">{home.name}</div><div className="text-[11px] text-slate-500">{home.manufacturer} · {home.bedrooms || 0}b/{home.bathrooms || 0}ba · {home.dimensions}</div></div><strong>{money(Number(home.ehsPrice) || 0)}</strong></button>)}</div>
                <div className="grid gap-4 rounded-xl border border-sky-200 bg-sky-50 p-4 sm:grid-cols-2"><label className="text-xs font-black">Customer Home Price<input type="number" min="0" step="0.01" value={homePrice} onChange={(e) => setHomePrice(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-base font-black" /></label><div className="text-xs"><div className="text-slate-500">Internal factory cost</div><div className="mt-1 text-lg font-black">{money(factoryCost)}</div></div></div>
              </section>}

              {activeTab === 'delivery' && <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div><h2 className="text-lg font-black text-[#0B1E38]">Land & Delivery</h2><p className="text-xs text-slate-500">Automatic driving distance when Google Maps is configured; manual mileage remains available as a safe fallback.</p></div>
                <div className="grid gap-2 sm:grid-cols-3">{([['OWNED','Customer Owns Land'],['EHS_PROPERTY','EHS Property'],['CUSTOM','Custom / TBD']] as Array<[LandOption,string]>).map(([id,label]) => <button key={id} type="button" onClick={() => changeLandOption(id)} className={`rounded-xl border p-3 text-left text-xs font-black ${landOption === id ? 'border-[#0B1E38] bg-[#0B1E38] text-white' : 'border-slate-200 bg-slate-50'}`}>{label}</button>)}</div>
                {propertyLoadError && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">{propertyLoadError}</div>}
                {landOption === 'EHS_PROPERTY' && <label className="block text-xs font-bold">Available EHS Property<select value={selectedPropertyId} onChange={(e) => selectProperty(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"><option value="">Select property…</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.address}, {property.city} — {property.price == null ? 'Price TBD' : money(property.price)}</option>)}</select></label>}
                <div className="grid gap-4 text-xs sm:grid-cols-2"><label className="font-bold">Land / Parcel Price<input type="number" min="0" step="0.01" value={propertyPrice} onChange={(e) => setPropertyPrice(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label><label className="font-bold">Delivery Homesite Address<input value={propertyAddress} onChange={(e) => { setPropertyAddress(e.target.value); setDeliveryNote('Address changed. Recalculate the route.'); }} placeholder="Street, city, state ZIP" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-3 text-xs sm:grid-cols-4"><label className="font-bold sm:col-span-2">Route Type<select value={routeType} onChange={(e) => { setRouteType(e.target.value as RouteType); setDeliveryNote('Route type changed. Recalculate delivery.'); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"><option value="dealer_to_customer">Dealership → Customer</option><option value="factory_to_customer">Factory → Customer</option><option value="factory_to_dealer">Factory → Dealership</option></select></label><label className="font-bold">Manual / Saved Miles<input type="number" min="0" step="1" value={deliveryMiles} onChange={(e) => setDeliveryMiles(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" /></label><label className="font-bold">Escorts / Section<input type="number" min="0" step="1" value={escortsCount} onChange={(e) => setEscortsCount(Math.max(0, Math.round(Number(e.target.value) || 0)))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" /></label></div>
                  {routeType !== 'dealer_to_customer' && <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2 text-[11px] text-slate-600"><strong>Factory origin:</strong> {factoryAddress || 'No verified factory address mapped for this manufacturer.'}</div>}
                  <div className="mt-4 flex flex-wrap items-end gap-3"><button type="button" disabled={deliveryPending} onClick={() => void calculateDelivery()} className="rounded-xl bg-[#0F2A47] px-4 py-2.5 text-xs font-black text-white disabled:opacity-60">{deliveryPending ? 'Calculating route…' : '⚡ Calculate Driving Route & Freight'}</button><label className="min-w-[220px] flex-1 text-xs font-bold">Customer Delivery Price<input type="number" min="0" step="0.01" value={deliveryFreightPrice} onChange={(e) => setDeliveryFreightPrice(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-black" /></label><div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs"><div className="text-slate-400">Internal freight cost</div><strong>{money(deliveryFreightCost)}</strong></div></div>
                  {deliveryError && <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">{deliveryError}<div className="mt-1 font-normal">If automatic routing is unavailable, enter the confirmed route miles above and click Calculate again. The system will use those miles instead of silently returning $0.</div></div>}
                  {deliveryNote && <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50 p-3 text-[11px] font-semibold text-sky-900">{deliveryNote}</div>}
                </div>
              </section>}

              {activeTab === 'systems' && <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div><h2 className="text-lg font-black text-[#0B1E38]">Site Systems & Services</h2><p className="text-xs text-slate-500">Dedicated choices restored from the earlier quote workflow. Changing a choice updates the corresponding quote line; opening an existing quote does not automatically reprice it.</p></div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4 text-xs"><label className="flex items-center justify-between font-black"><span>A/C System</span><input type="checkbox" checked={siteSystems.acEnabled} onChange={(e) => updateSystems({ acEnabled: e.target.checked })} className="h-5 w-5 accent-emerald-600" /></label>{siteSystems.acEnabled && <div className="mt-3 grid gap-2 sm:grid-cols-3"><label className="font-bold">Tonnage<select value={siteSystems.acTonnage} onChange={(e) => updateSystems({ acTonnage: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2">{[2,2.5,3,3.5,4,5].map((ton) => <option key={ton} value={ton}>{ton} ton</option>)}</select></label><label className="font-bold">System<select value={siteSystems.acSystemType} onChange={(e) => updateSystems({ acSystemType: e.target.value as AcSystemType })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2"><option value="heat_pump">Heat Pump</option><option value="straight_cool">Straight Cool</option></select></label><label className="font-bold">Equipment<select value={siteSystems.acEquipmentType} onChange={(e) => updateSystems({ acEquipmentType: e.target.value as AcEquipmentType })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2"><option value="package">Package</option><option value="split">Split</option></select></label></div>}<div className="mt-2 text-[10px] text-slate-500">Home-size recommendation: {recommendedAcTonnage(Number(selectedHome.squareFeet) || 0)} ton.</div></div>
                  <div className="rounded-xl border border-slate-200 p-4 text-xs"><div className="font-black">Water Source</div><div className="mt-3 grid gap-2 sm:grid-cols-2"><select value={siteSystems.waterSource} onChange={(e) => updateSystems({ waterSource: e.target.value as WaterSource })} className="rounded-lg border border-slate-200 bg-white p-2 font-bold"><option value="none">Select / TBD</option><option value="well">New Well</option><option value="city_water">City Water Hookup</option><option value="existing">Existing Connection</option></select><div className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">Well uses the verified Master Quote 5 well package; city water uses the hookup package.</div></div></div>
                  <div className="rounded-xl border border-slate-200 p-4 text-xs"><div className="font-black">Sewer / Septic</div><div className="mt-3 grid gap-2 sm:grid-cols-2"><select value={siteSystems.sewerSource} onChange={(e) => updateSystems({ sewerSource: e.target.value as SewerSource })} className="rounded-lg border border-slate-200 bg-white p-2 font-bold"><option value="none">Select / TBD</option><option value="septic">New Septic</option><option value="city_sewer">City Sewer Hookup</option><option value="existing">Existing Connection</option></select><div className="rounded-lg bg-amber-50 p-2 text-[11px] text-amber-900">Recommended septic size: <strong>{septicRecommendation.toLocaleString()} gallons</strong>. Larger than the verified 900-gallon base requires a confirmed custom price.</div></div></div>
                  <div className="rounded-xl border border-slate-200 p-4 text-xs"><div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center justify-between rounded-lg bg-slate-50 p-3 font-black"><span>New Electric Post + Panel</span><input type="checkbox" checked={siteSystems.electricPanel} onChange={(e) => updateSystems({ electricPanel: e.target.checked })} className="h-5 w-5 accent-emerald-600" /></label><label className="font-black">Dirt Pad Loads<select value={siteSystems.dirtPadLoads} onChange={(e) => updateSystems({ dirtPadLoads: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2"><option value={0}>None / TBD</option>{Array.from({ length: 20 }, (_, index) => index + 1).map((loads) => <option key={loads} value={loads}>{loads} load{loads === 1 ? '' : 's'}</option>)}</select></label></div></div>
                </div>

                <div className="border-t border-slate-200 pt-4"><div className="mb-3 flex flex-wrap items-end gap-2"><label className="min-w-[260px] flex-1 text-xs font-bold">Additional Master Quote 5 Service<select value={selectedServiceSku} onChange={(e) => setSelectedServiceSku(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">{SERVICE_CATALOG.map((service) => <option key={service.sku} value={service.sku}>{service.name} — {service.requiresBid ? 'BID' : money(service.defaultPrice)}</option>)}</select></label><button type="button" onClick={addTableLine} className="rounded-xl bg-[#0F2A47] px-4 py-2.5 text-xs font-black text-white">+ Add Service</button><button type="button" onClick={addCustomLine} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black">+ Custom Item</button></div>
                <div className="overflow-hidden rounded-xl border border-slate-200">{lineItems.map((item) => <div key={item.id} className="border-b border-slate-100 p-3 last:border-0"><div className="grid items-end gap-3 md:grid-cols-[1fr_90px_150px_110px_auto]"><div><div className="font-black text-slate-800">{item.name}</div><div className="text-[10.5px] text-slate-500">{item.description}</div></div><label className="text-[10px] font-black uppercase text-slate-500">Qty<input type="number" min="1" step="1" value={item.quantity} onChange={(e) => updateLine(item.id, 'quantity', Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" /></label><label className="text-[10px] font-black uppercase text-slate-500">Customer Unit Price<input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateLine(item.id, 'unitPrice', Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" /></label><div className="text-right"><div className="text-[10px] text-slate-400">Line Total</div><strong>{money(item.totalPrice)}</strong></div><button type="button" onClick={() => setLineItems((current) => current.filter((line) => line.id !== item.id))} className="rounded-lg p-2 font-black text-rose-600 hover:bg-rose-50">✕</button></div></div>)}</div></div>
                <label className="block text-xs font-bold">Quote Discount<input type="number" min="0" step="0.01" value={discounts} onChange={(e) => setDiscounts(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2" /></label>
              </section>}

              {activeTab === 'financing' && <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 text-xs shadow-xs">
                <h2 className="text-lg font-black text-[#0B1E38]">Financing, Deposits & Notes</h2>
                <div className="grid gap-4 sm:grid-cols-2"><label className="font-bold">Purchase Type<select value={purchaseType} onChange={(e) => setPurchaseType(e.target.value as 'cash' | 'financing')} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2"><option value="financing">Financing</option><option value="cash">Cash</option></select></label><label className="font-bold">Financing Status<select value={financingStatus} onChange={(e) => setFinancingStatus(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2"><option value="pending">Pending</option><option value="preapproved">Pre-Approved</option><option value="approved">Approved</option><option value="cash">Cash / N/A</option></select></label><label className="font-bold">Pre-Approval Amount<input type="number" min="0" value={preApprovalAmount} onChange={(e) => setPreApprovalAmount(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 p-2" /></label><label className="font-bold">Target Budget<input type="number" min="0" value={targetBudget} onChange={(e) => setTargetBudget(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-xl border border-slate-200 p-2" /></label></div>
                <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold"><span>EHS Loan Officer Used <span className="font-normal text-slate-500">($1,000 internal home-profit fee)</span></span><input type="checkbox" checked={ehsLoanOfficerUsed} onChange={(e) => setEhsLoanOfficerUsed(e.target.checked)} className="h-5 w-5 accent-emerald-600" /></label>
                <div className="border-t border-slate-200 pt-4"><div className="grid gap-2 sm:grid-cols-5"><input value={depositName} onChange={(e) => setDepositName(e.target.value)} placeholder="Deposit name" className="rounded-xl border border-slate-200 p-2 sm:col-span-2" /><input type="number" min="0" value={depositAmount} onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value) || 0))} placeholder="Amount" className="rounded-xl border border-slate-200 p-2" /><input type="date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} className="rounded-xl border border-slate-200 p-2" /><button type="button" onClick={addDeposit} className="rounded-xl bg-[#0F2A47] p-2 font-black text-white">+ Deposit</button></div><select value={depositStatus} onChange={(e) => setDepositStatus(e.target.value)} className="mt-2 rounded-lg border border-slate-200 bg-white p-1"><option value="planned">Planned</option><option value="received">Received</option><option value="refunded">Refunded</option></select>{deposits.length > 0 && <div className="mt-3 rounded-xl border border-slate-200">{deposits.map((deposit) => <div key={deposit.id} className="flex justify-between border-b border-slate-100 p-2 last:border-0"><span><strong>{deposit.name}</strong> · {deposit.status}</span><span><strong>{money(deposit.amount)}</strong> <button type="button" onClick={() => setDeposits((current) => current.filter((item) => item.id !== deposit.id))} className="ml-2 text-rose-600">✕</button></span></div>)}</div>}</div>
                <label className="block font-bold">Customer-Facing Notes<textarea rows={4} value={notesCustomer} onChange={(e) => setNotesCustomer(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal" /></label><label className="block font-bold">Internal Notes<textarea rows={3} value={notesInternal} onChange={(e) => setNotesInternal(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal" /></label>
              </section>}

              {activeTab === 'review' && <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-black text-[#0B1E38]">Review & Save</h2><p className="text-xs text-slate-500">Confirm the route, utilities and customer-facing numbers before saving.</p></div><label className="text-xs font-bold">Quote Status<select value={status} onChange={(e) => setStatus(e.target.value as SavedQuote['status'])} className="mt-1 rounded-lg border border-slate-200 bg-white p-2"><option value="DRAFT">Draft</option><option value="SENT_TO_BUYER">Sent to Buyer</option><option value="LENDER_REVIEW">Lender Review</option><option value="APPROVED">Approved</option><option value="IN_CONTRACT">In Contract</option></select></label></div>
                <div className="grid gap-3 text-xs sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><div className="text-slate-400">Customer</div><strong>{customerName || 'Not entered'}</strong><div className="mt-2 text-slate-400">Home</div><strong>{selectedHome.name}</strong></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-slate-400">Delivery</div><strong>{deliveryMiles > 0 ? `${deliveryMiles} miles · ${money(deliveryFreightPrice)}` : 'No route recorded'}</strong><div className="mt-2 text-slate-400">Site systems</div><strong>{siteSystems.acEnabled ? `${siteSystems.acTonnage}T A/C` : 'A/C TBD'} · {siteSystems.waterSource.replace('_', ' ')} · {siteSystems.sewerSource.replace('_', ' ')}</strong></div></div>
                <button type="button" disabled={isSaving} onClick={() => void saveQuote()} className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60">{isSaving ? 'Saving to permanent quote library…' : editing ? '✓ Save Changes & View Quote' : '✓ Create Quote & View Proposal'}</button>
              </section>}
            </main>

            <aside className="self-start rounded-2xl border border-slate-200 bg-white p-5 text-xs shadow-sm lg:sticky lg:top-24">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live Quote Totals</div>
              <div className="mt-4 space-y-2"><div className="flex justify-between"><span>Home</span><strong>{money(homePrice)}</strong></div>{propertyPrice > 0 && <div className="flex justify-between"><span>Land</span><strong>{money(propertyPrice)}</strong></div>}<div className="flex justify-between"><span>Delivery</span><strong>{money(deliveryFreightPrice)}</strong></div><div className="flex justify-between"><span>Site Work</span><strong>{money(siteWorkPrice)}</strong></div>{addonsPrice > 0 && <div className="flex justify-between"><span>Add-Ons</span><strong>{money(addonsPrice)}</strong></div>}{discounts > 0 && <div className="flex justify-between text-rose-700"><span>Discount</span><strong>-{money(discounts)}</strong></div>}<div className="border-t border-slate-100 pt-2"><div className="flex justify-between font-black"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div><div className="mt-1 flex justify-between"><span>3% Sales Tax</span><strong className="text-[#1E6FA8]">{money(totals.sales_tax_total)}</strong></div></div><div className="mt-3 flex items-center justify-between rounded-xl bg-[#0F2A47] px-3 py-3 text-white"><span className="text-[10px] font-black uppercase">Estimated Total</span><span className="font-mono text-lg font-black">{money(totals.estimated_total)}</span></div></div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] font-black uppercase text-slate-400">Internal Deal Check</div><div className="mt-2 grid grid-cols-2 gap-1 text-[11px]"><span>Home margin</span><strong className="text-right">{money(totals.house_gross_margin)}</strong><span>Service profit</span><strong className="text-right">{money(totals.service_profit)}</strong><span>Commission</span><strong className="text-right">{money(totals.salesperson_commission)}</strong><span>EHS take-home</span><strong className={`text-right ${totals.target_met ? 'text-emerald-700' : 'text-amber-700'}`}>{money(totals.net_take_home)}</strong></div></div>
              <button type="button" onClick={() => setActiveTab('review')} className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-2 font-black text-[#0B1E38]">Review Before Save →</button>
            </aside>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

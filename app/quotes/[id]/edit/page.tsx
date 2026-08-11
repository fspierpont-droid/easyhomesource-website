'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { VERIFIED_TEAM_USERS, TeamUser } from '@/data/teamMembers';
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
  getSavedQuotes,
  getSavedQuoteById,
  saveQuoteToStore,
  deleteQuoteFromStore,
  type SavedQuote,
  type SelectedQuoteLineItem,
  type DepositItem
} from '@/data/quotesStore';

type EditTabKey = 'customer' | 'home' | 'site' | 'pricing' | 'financing' | 'notes' | 'review';

interface StepInfo {
  key: EditTabKey;
  stepNum: number;
  label: string;
  shortLabel: string;
  icon: string;
  desc: string;
}

const STEPS: StepInfo[] = [
  { key: 'customer', stepNum: 1, label: '1. Customer & Rep', shortLabel: 'Customer', icon: '👤', desc: 'Customer contact details & assigned consultant' },
  { key: 'home', stepNum: 2, label: '2. Home Selection', shortLabel: 'Home', icon: '🏡', desc: 'Select from 225 models or customize specs' },
  { key: 'site', stepNum: 3, label: '3. Land & Freight', shortLabel: 'Land & Freight', icon: '🚚', desc: 'Owned land ($0 default), parcels & freight delivery' },
  { key: 'pricing', stepNum: 4, label: '4. Line Items & Services', shortLabel: 'Line Items', icon: '🛠️', desc: 'Site work, tie-downs, A/C, well, septic, skirting & permits ($2,000)' },
  { key: 'financing', stepNum: 5, label: '5. Financing & Deposits', shortLabel: 'Financing', icon: '💳', desc: 'Loan officer ($1,000 fee toggle), milestones & deposits' },
  { key: 'notes', stepNum: 6, label: '6. Notes & Terms', shortLabel: 'Notes', icon: '📝', desc: 'Customer proposal notes & private consultant records' },
  { key: 'review', stepNum: 7, label: '7. Review & Summary', shortLabel: 'Review', icon: '📊', desc: 'Verify itemized totals, tax, margins & print PDF' }
];

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const rawId = (params?.id as string) || '2026_06_29_PIERPONT_NEW';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EditTabKey>('customer');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Step indices
  const currentStepIndex = STEPS.findIndex((s) => s.key === activeTab);
  const currentStep = STEPS[currentStepIndex] || STEPS[0];

  const goToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setActiveTab(STEPS[currentStepIndex + 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setActiveTab(STEPS[currentStepIndex - 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. Customer & Consultant Details
  const [quoteId, setQuoteId] = useState(rawId);
  const [quoteNumber, setQuoteNumber] = useState('2026_06_29_PIERPONT_NEW');
  const [quoteDate, setQuoteDate] = useState('2026-06-29');
  const [customerName, setCustomerName] = useState('Angie Floyd');
  const [customerPhone, setCustomerPhone] = useState('352-568-6946');
  const [customerEmail, setCustomerEmail] = useState('angielynn011477@gmail.com');
  const [customerAddress, setCustomerAddress] = useState('Homosassa, FL 34446');
  const [salesperson, setSalesperson] = useState('Scott Pierpont');
  const [salespersonEmail, setSalespersonEmail] = useState('scott@easyhomesource.com');
  const [status, setStatus] = useState<'DRAFT' | 'SENT_TO_BUYER' | 'LENDER_REVIEW' | 'APPROVED' | 'IN_CONTRACT'>('APPROVED');
  const [shareToken, setShareToken] = useState('2026_06_29_PIERPONT_NEW');

  // 2. Manufactured Home
  const [homeSearch, setHomeSearch] = useState('');
  const [builderFilter, setBuilderFilter] = useState('ALL');
  const [selectedHome, setSelectedHome] = useState<MasterCatalogHome | null>(FULL_MASTER_CATALOG_HOMES[0] || null);
  const [homeModel, setHomeModel] = useState('Sebastian 32644D');
  const [manufacturer, setManufacturer] = useState('Cavco Douglas');
  const [series, setSeries] = useState('Douglas Collection');
  const [beds, setBeds] = useState<number>(4);
  const [baths, setBaths] = useState<number>(2);
  const [sqft, setSqft] = useState<number>(1920);
  const [dimensions, setDimensions] = useState('32 x 64');
  const [homeWidth, setHomeWidth] = useState<number>(32);
  const [homeLength, setHomeLength] = useState<number>(64);
  const [basePrice, setBasePrice] = useState<number>(144776.71);
  const [factoryCost, setFactoryCost] = useState<number>(104239.23);
  const [homeDescription, setHomeDescription] = useState('The Sebastian 32644D built by Cavco Douglas is a spacious 4-bedroom, 2-bath ranch-style home offering 1,920 sq. ft. of well-designed living space across two sections.');

  // 3. Land / Site & Delivery Freight (Defaulted to Owned Land $0.00)
  const [landOption, setLandOption] = useState<'OWNED' | 'PARCEL' | 'CUSTOM'>('OWNED');
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('Homosassa, FL 34446');
  const [propertyPrice, setPropertyPrice] = useState<number>(0.00);
  const [deliveryRouteType, setDeliveryRouteType] = useState<'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer'>('factory_to_dealer');
  const [deliveryMiles, setDeliveryMiles] = useState<number>(50);
  const [escortsCount, setEscortsCount] = useState<number>(2);
  const [deliveryFreightPrice, setDeliveryFreightPrice] = useState<number>(2860);
  const [deliveryFreightCost, setDeliveryFreightCost] = useState<number>(2600);

  // 4. Line Items & Services (Permits $2,000 flat)
  const [lineItems, setLineItems] = useState<SelectedQuoteLineItem[]>([
    {
      id: 'sw-1',
      sku: 'SITE-STEPS-WOOD',
      name: 'Wooden Steps — Two Sets',
      category: 'mandatory_services',
      unitPrice: 2500.00,
      unitCost: 1800.00,
      quantity: 1,
      totalPrice: 2500.00,
      totalCost: 1800.00,
      description: 'Two sets of pressure-treated wooden code-compliant entrance stairs with handrails.'
    },
    {
      id: 'sw-2',
      sku: 'SITE-PERMIT-PLAN',
      name: 'County Building, Zoning & Health Dept Permits',
      category: 'mandatory_services',
      unitPrice: 2000.00,
      unitCost: 2000.00,
      quantity: 1,
      totalPrice: 2000.00,
      totalCost: 2000.00,
      description: 'Citrus county building permit processing, plan review, zoning, and health inspections ($2,000 flat standard).'
    },
    {
      id: 'sw-3',
      sku: 'SITE-BLOCK-TIEDOWN',
      name: "Block & Tie-Down (Double · 66' table)",
      category: 'mandatory_services',
      unitPrice: 11000.00,
      unitCost: 8800.00,
      quantity: 1,
      totalPrice: 11000.00,
      totalCost: 8800.00,
      description: 'Concrete pier pads, cinder blocks, leveling, and Florida wind zone ground anchors (Double wide 66ft table).'
    },
    {
      id: 'sw-4',
      sku: 'SITE-TRIMOUT',
      name: 'Trim Out',
      category: 'mandatory_services',
      unitPrice: 1500.00,
      unitCost: 1100.00,
      quantity: 1,
      totalPrice: 1500.00,
      totalCost: 1100.00,
      description: 'Interior and exterior marriage line trim out and final finishing.'
    },
    {
      id: 'sw-5',
      sku: 'SITE-ELEC-PANEL',
      name: 'Electric Pole & Panel',
      category: 'mandatory_services',
      unitPrice: 1850.00,
      unitCost: 1400.00,
      quantity: 1,
      totalPrice: 1850.00,
      totalCost: 1400.00,
      description: '200A utility disconnect pole, meter socket, and underground conduit riser.'
    },
    {
      id: 'sw-6',
      sku: 'SITE-ELEC-HOOKUP',
      name: 'Electric Hookups',
      category: 'mandatory_services',
      unitPrice: 2300.00,
      unitCost: 1700.00,
      quantity: 1,
      totalPrice: 2300.00,
      totalCost: 1700.00,
      description: 'Main panel feeder cable connection, grounding rods, and electrical inspection readiness.'
    },
    {
      id: 'sw-7',
      sku: 'HVAC-HP-4TON',
      name: 'AC Unit & Installation (4 ton · Package · Straight Cool)',
      category: 'mandatory_services',
      unitPrice: 5200.00,
      unitCost: 4700.00,
      quantity: 1,
      totalPrice: 5200.00,
      totalCost: 4700.00,
      description: '4.0-Ton high-efficiency package air conditioning unit with equipment pad and supply plenum tie-in.'
    },
    {
      id: 'sw-8',
      sku: 'SITE-WELL-SYSTEM',
      name: 'Well System',
      category: 'mandatory_services',
      unitPrice: 9400.00,
      unitCost: 7200.00,
      quantity: 1,
      totalPrice: 9400.00,
      totalCost: 7200.00,
      description: '4-inch deep potable water well drilling, submersible pump, pressure tank, and waterline hookup.'
    },
    {
      id: 'sw-9',
      sku: 'SITE-SEPTIC-SYSTEM',
      name: 'Septic System',
      category: 'mandatory_services',
      unitPrice: 8500.00,
      unitCost: 6500.00,
      quantity: 1,
      totalPrice: 8500.00,
      totalCost: 6500.00,
      description: '1,050-gallon concrete septic tank, header line, distribution box, and gravity drainfield.'
    },
    {
      id: 'sw-10',
      sku: 'SITE-SKIRTING-VALOR',
      name: 'Skirting Basic Valor (192 Linear Feet @ $8.00/ft)',
      category: 'mandatory_services',
      unitPrice: 1536.00,
      unitCost: 1050.00,
      quantity: 192,
      totalPrice: 1536.00,
      totalCost: 1050.00,
      description: 'Vented vinyl perimeter skirting around 192 linear ft (2 * (32 + 64)) with top trim and ground track.'
    }
  ]);
  const [selectedServiceSku, setSelectedServiceSku] = useState(SERVICE_CATALOG[0]?.sku || 'SITE-PERMIT-PLAN');
  const [customItemSku, setCustomItemSku] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState<number>(1000);
  const [customItemCost, setCustomItemCost] = useState<number>(750);
  const [customItemCategory, setCustomItemCategory] = useState<'mandatory_services' | 'site_work' | 'addons' | 'options'>('site_work');
  const [discounts, setDiscounts] = useState<number>(0);

  // 5. Financing Tab (Loan Officer, Deposits & Milestones)
  const [purchaseType, setPurchaseType] = useState<'cash' | 'financing'>('financing');
  const [financingStatus, setFinancingStatus] = useState('approved');
  const [preApprovalAmount, setPreApprovalAmount] = useState<number>(220000);
  const [targetBudget, setTargetBudget] = useState<number>(210000);
  const [ehsLoanOfficerUsed, setEhsLoanOfficerUsed] = useState<boolean>(false);
  const [deposits, setDeposits] = useState<DepositItem[]>([
    { id: 'dep-1', name: 'Initial Binder Deposit', amount: 2500, date: '2026-06-29', status: 'Received' }
  ]);
  const [loanApprovalDate, setLoanApprovalDate] = useState('2026-07-05');
  const [loanClosingDate, setLoanClosingDate] = useState('2026-07-20');
  const [permitApprovalDate, setPermitApprovalDate] = useState('2026-07-25');
  const [siteReadyDate, setSiteReadyDate] = useState('2026-08-01');
  const [deliveryDate, setDeliveryDate] = useState('2026-08-05');
  const [installationDate, setInstallationDate] = useState('2026-08-10');
  const [walkthroughDate, setWalkthroughDate] = useState('2026-08-15');
  const [moveInDate, setMoveInDate] = useState('2026-08-20');

  // 6. Notes
  const [notes, setNotes] = useState('Turnkey land and home package proposal for Homosassa homesite.');
  const [notesCustomer, setNotesCustomer] = useState('Complete turnkey setup including well, septic, 4-ton AC, permits, 200A electric, vinyl skirting, and wooden stairs.');
  const [notesInternal, setNotesInternal] = useState('FHA loan in underwriting. Ready for site visit verification.');

  // Load Existing Quote from Store on Mount
  useEffect(() => {
    if (!rawId) return;
    const existing = getSavedQuoteById(rawId);
    if (existing) {
      setQuoteId(existing.id || rawId);
      setQuoteNumber(existing.quoteNumber || existing.id || rawId);
      setQuoteDate(existing.quoteDate || '2026-06-29');
      setCustomerName(existing.customerName || '');
      setCustomerPhone(existing.customerPhone || '');
      setCustomerEmail(existing.customerEmail || '');
      setCustomerAddress(existing.customerAddress || existing.propertyAddress || '');
      setSalesperson(existing.salesperson || user?.name || 'Scott Pierpont');
      setSalespersonEmail(existing.salespersonEmail || 'scott@easyhomesource.com');
      setStatus(existing.status || 'APPROVED');
      setShareToken(existing.shareToken || existing.id || rawId);

      // Home
      const loadedModelName = existing.homeModel || '';
      setHomeModel(loadedModelName);
      setManufacturer(existing.manufacturer || 'Cavco Douglas');
      setSeries(existing.series || '');
      setBeds(existing.beds || 3);
      setBaths(existing.baths || 2);
      setSqft(existing.sqft || 1200);
      setDimensions(existing.dimensions || "24' x 50'");
      setHomeWidth(existing.homeWidth || 24);
      setHomeLength(existing.homeLength || 50);
      setBasePrice(Number(existing.homePrice) || 0);
      setFactoryCost(Number(existing.factoryCost) || Math.round((Number(existing.homePrice) || 0) * 0.72));
      setHomeDescription(existing.homeDescription || '');

      // Land & Delivery
      setPropertyAddress(existing.propertyAddress || '');
      setPropertyPrice(Number(existing.propertyPrice) || 0);
      setLandOption(Number(existing.propertyPrice) > 0 ? 'PARCEL' : 'OWNED');
      setDeliveryRouteType((existing.deliveryRouteType as any) || 'factory_to_dealer');
      setDeliveryMiles(existing.deliveryMiles || 50);
      setEscortsCount(existing.escortsCount || 2);
      setDeliveryFreightPrice(Number(existing.freightDelivery) || 2860);
      setDeliveryFreightCost(Number(existing.freightCost) || 2600);

      // Line items
      if (Array.isArray(existing.lineItems) && existing.lineItems.length > 0) {
        setLineItems(existing.lineItems);
      }
      setDiscounts(Number(existing.discounts) || 0);

      // Financing
      setPurchaseType(existing.purchaseType || 'financing');
      setFinancingStatus(existing.financingStatus || 'approved');
      setPreApprovalAmount(Number(existing.preApprovalAmount) || 220000);
      setTargetBudget(Number(existing.targetBudget) || 210000);
      setEhsLoanOfficerUsed(!!existing.ehsLoanOfficerUsed);
      if (Array.isArray(existing.deposits) && existing.deposits.length > 0) {
        setDeposits(existing.deposits);
      }
      setLoanApprovalDate(existing.loanApprovalDate || '');
      setLoanClosingDate(existing.loanClosingDate || '');
      setPermitApprovalDate(existing.permitApprovalDate || '');
      setSiteReadyDate(existing.siteReadyDate || '');
      setDeliveryDate(existing.deliveryDate || '');
      setInstallationDate(existing.installationDate || '');
      setWalkthroughDate(existing.walkthroughDate || '');
      setMoveInDate(existing.moveInDate || '');

      // Notes
      setNotes(existing.notes || '');
      setNotesCustomer(existing.notesCustomer || existing.notes || '');
      setNotesInternal(existing.notesInternal || '');

      // Match home in catalog if possible
      const matched = FULL_MASTER_CATALOG_HOMES.find(
        (h) => (h.name || '').toLowerCase() === loadedModelName.toLowerCase()
      );
      if (matched) setSelectedHome(matched);
    }
  }, [rawId, user]);

  // When Salesperson changes, update email
  const handleSalespersonChange = (name: string) => {
    setSalesperson(name);
    const member = VERIFIED_TEAM_USERS.find((u) => u.name === name);
    if (member) {
      setSalespersonEmail(member.email);
    }
  };

  // Home Selection from verified catalog
  const handleSelectCatalogHome = (h: MasterCatalogHome) => {
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

    // Auto-update Block & Tie-down based on length & single/double
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
            description: `Vented vinyl perimeter skirting (${skirting.linearFeet} linear ft = 2 x (${h.width}+${h.length})) with top rail and ground track.`
          };
        }
        return item;
      })
    );
  };

  // Land Selection
  const handleLandOptionChange = (opt: 'OWNED' | 'PARCEL' | 'CUSTOM') => {
    setLandOption(opt);
    if (opt === 'OWNED') {
      setPropertyPrice(0);
    } else if (opt === 'PARCEL') {
      const p = INITIAL_PROPERTIES[0];
      if (p) {
        setSelectedParcelId(p.id);
        setPropertyPrice(p.price || 49900);
        setPropertyAddress(`${p.address}, ${p.city}, FL ${p.zip}`);
      }
    }
  };

  const handleParcelSelect = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    const p = INITIAL_PROPERTIES.find((prop) => prop.id === parcelId);
    if (p) {
      setPropertyPrice(p.price || 0);
      setPropertyAddress(`${p.address}, ${p.city}, FL ${p.zip}`);
    }
  };

  // Line Items Operations
  const handleAddCatalogService = () => {
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

  const handleAddCustomLineItem = () => {
    if (!customItemName.trim()) return;

    const newItem: SelectedQuoteLineItem = {
      id: `li-${Date.now()}`,
      sku: customItemSku.trim() || `CUSTOM-${Date.now()}`,
      name: customItemName.trim(),
      description: customItemDesc.trim() || 'Custom site service or home upgrade.',
      category: customItemCategory,
      unitPrice: Number(customItemPrice) || 0,
      unitCost: Number(customItemCost) || 0,
      quantity: 1,
      totalPrice: Number(customItemPrice) || 0,
      totalCost: Number(customItemCost) || 0
    };

    setLineItems((prev) => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemDesc('');
    setCustomItemSku('');
    setCustomItemPrice(1000);
    setCustomItemCost(750);
  };

  const handleUpdateLineItem = (id: string, updates: Partial<SelectedQuoteLineItem>) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        const qty = Number(updated.quantity) || 1;
        const unitP = Number(updated.unitPrice) || 0;
        const unitC = Number(updated.unitCost) || 0;
        return {
          ...updated,
          quantity: qty,
          unitPrice: unitP,
          unitCost: unitC,
          totalPrice: unitP * qty,
          totalCost: unitC * qty
        };
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Deposit Operations
  const handleAddDeposit = () => {
    const newDep: DepositItem = {
      id: `dep-${Date.now()}`,
      name: `Deposit ${deposits.length + 1}`,
      amount: 1500,
      date: new Date().toISOString().slice(0, 10),
      status: 'Received'
    };
    setDeposits((prev) => [...prev, newDep]);
  };

  const handleUpdateDeposit = (id: string, updates: Partial<DepositItem>) => {
    setDeposits((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const handleRemoveDeposit = (id: string) => {
    setDeposits((prev) => prev.filter((d) => d.id !== id));
  };

  // Math Calculations (100% Exact Precision)
  const siteWorkItems = lineItems.filter((i) => i && (i.category === 'mandatory_services' || i.category === 'site_work'));
  const addOnItems = lineItems.filter((i) => i && (i.category === 'addons' || i.category === 'options' || i.category === 'custom'));

  const subtotalSiteWork = siteWorkItems.reduce((acc, item) => acc + (Number(item?.totalPrice || item?.unitPrice) || 0), 0);
  const subtotalAddOns = addOnItems.reduce((acc, item) => acc + (Number(item?.totalPrice || item?.unitPrice) || 0), 0);
  const costSiteWork = siteWorkItems.reduce((acc, item) => acc + (Number(item?.totalCost || item?.unitCost) || 0), 0);
  const costAddOns = addOnItems.reduce((acc, item) => acc + (Number(item?.totalCost || item?.unitCost) || 0), 0);

  const activeLoanFee = ehsLoanOfficerUsed ? 1000 : 0;

  const quoteTotals: QuoteFinancialTotals = useMemo(() => {
    return calculateComprehensiveQuoteTotals(
      basePrice,
      propertyPrice,
      deliveryFreightPrice,
      subtotalSiteWork,
      subtotalAddOns,
      discounts,
      factoryCost,
      deliveryFreightCost,
      costSiteWork + costAddOns,
      0,
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
    costAddOns
  ]);

  const netTakeHome = (quoteTotals.house_gross_margin || 0) + (quoteTotals.service_profit || 0) - (quoteTotals.admin_fee || 0) - activeLoanFee - (quoteTotals.salesperson_commission || 0);
  const targetMet = netTakeHome >= 20000;

  // Filter Catalog Homes for Home Selection Step
  const filteredCatalog = useMemo(() => {
    return FULL_MASTER_CATALOG_HOMES.filter((h) => {
      if (!h) return false;
      if (builderFilter !== 'ALL' && h.manufacturer !== builderFilter) return false;
      if (!homeSearch.trim()) return true;
      const text = `${h.name || ''} ${h.manufacturer || ''} ${h.series || ''} ${h.bedrooms || ''} bed ${h.bathrooms || ''} bath ${h.squareFeet || ''}`.toLowerCase();
      return text.includes(homeSearch.toLowerCase().trim());
    });
  }, [builderFilter, homeSearch]);

  // Save Full Quote Function
  const handleSaveQuote = (newStatus?: 'DRAFT' | 'SENT_TO_BUYER' | 'LENDER_REVIEW' | 'APPROVED' | 'IN_CONTRACT') => {
    const finalStatus = newStatus || status;
    const finalQuote: SavedQuote = {
      id: quoteId,
      quoteNumber,
      quoteDate,
      customerName: customerName.trim() || 'Valued Customer',
      customerPhone,
      customerEmail,
      customerAddress,
      salesperson,
      salespersonEmail,
      salespersonTitle: 'Authorized Housing Consultant',
      salespersonPhone: '(352) 558-8888',
      status: finalStatus,
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
      homeDescription,
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
      loanApprovalDate,
      loanClosingDate,
      permitApprovalDate,
      siteReadyDate,
      deliveryDate,
      installationDate,
      walkthroughDate,
      moveInDate,
      subtotal: quoteTotals.subtotal,
      financedSubtotal: quoteTotals.financed_subtotal,
      nonFinancedSubtotal: quoteTotals.non_financed_subtotal,
      taxBasis: quoteTotals.tax_basis,
      salesTax: quoteTotals.sales_tax_total,
      totalTurnkeyPrice: quoteTotals.estimated_total,
      estimatedTotal: quoteTotals.estimated_total,
      downPaymentPercent: 10,
      downPaymentAmount: Math.round(quoteTotals.estimated_total * 0.1),
      estimatedMonthlyPayment: Math.round(quoteTotals.estimated_total * 0.0059),
      financialTotals: quoteTotals,
      notes,
      notesCustomer,
      notesInternal,
      shareToken: shareToken || quoteId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveQuoteToStore(finalQuote);
    setStatus(finalStatus);
    setSavedSuccessMsg(`✓ Quote ${quoteNumber} for ${finalQuote.customerName} saved successfully!`);
    setTimeout(() => setSavedSuccessMsg(null), 5000);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to permanently delete proposal ${quoteNumber} for ${customerName}?`)) {
      deleteQuoteFromStore(quoteId);
      router.push('/portal?view=library');
    }
  };

  return (
    <AuthGate>
      <div className="flex h-screen bg-slate-100/70 font-sans text-slate-800 antialiased overflow-hidden">
        {/* Sidebar */}
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                ☰
              </button>
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
                    {quoteNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {status}
                  </span>
                </div>
                <h1 className="text-xl font-black text-[#0B1E38] mt-0.5">
                  Full Master Quote System — {customerName || 'Proposal Builder'}
                </h1>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/quotes/${quoteId}`}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0B1E38] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                title="View 2-Page Executive Proposal Layout"
              >
                <span>👁️</span>
                <span>Executive Sheet</span>
              </Link>

              <Link
                href={`/quote/${shareToken || quoteId}`}
                target="_blank"
                className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#1E6FA8] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-sky-200"
                title="Public Customer Share Link"
              >
                <span>🌐</span>
                <span>Share Link ↗</span>
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>📄</span>
                <span>Print PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveQuote()}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>✓</span>
                <span>Save Changes</span>
              </button>
            </div>
          </header>

          {/* Floating Save Confirmation Banner */}
          {savedSuccessMsg && (
            <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in sticky top-16 z-20">
              <div className="flex items-center gap-2">
                <span className="text-sm">✓</span>
                <span>{savedSuccessMsg}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/quotes/${quoteId}`}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-black transition-colors"
                >
                  View Executive Sheet ↗
                </Link>
                <Link
                  href="/portal?view=library"
                  className="px-3 py-1 bg-white text-emerald-900 rounded-lg text-[11px] font-black transition-colors"
                >
                  Go to Quote Library
                </Link>
                <button
                  onClick={() => setSavedSuccessMsg(null)}
                  className="text-white hover:text-emerald-200 font-bold cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Prominent Visual Step Wizard & Navigation Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-2.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              {STEPS.map((step) => {
                const isActive = activeTab === step.key;
                const isPast = step.stepNum < currentStep.stepNum;

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => setActiveTab(step.key)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#0B1E38] text-white shadow-sm ring-2 ring-[#0B1E38]/20'
                        : isPast
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/70'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                        isActive
                          ? 'bg-white text-[#0B1E38]'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isPast ? '✓' : step.stepNum}
                    </span>
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Body Grid: Form on Left, Sticky Real-Time Math on Right */}
          <div className="p-6 max-w-7xl w-full mx-auto grid lg:grid-cols-3 gap-6">
            {/* Form Panels (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* TAB 1: CUSTOMER & SALESPERSON */}
              {activeTab === 'customer' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                        STEP 1 OF 7
                      </span>
                      <h2 className="text-lg font-black text-[#0B1E38]">Customer &amp; Consultant Information</h2>
                      <p className="text-xs text-slate-500">
                        Configure proposal recipient, quote reference number, status, and housing consultant.
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#1E6FA8] focus:ring-1 focus:ring-[#1E6FA8]"
                        placeholder="e.g. Angie Floyd"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Customer Phone *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#1E6FA8]"
                        placeholder="e.g. 352-568-6946"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Customer Email *</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#1E6FA8]"
                        placeholder="e.g. angielynn011477@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Customer Mailing Address</label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#1E6FA8]"
                        placeholder="e.g. Homosassa, FL 34446"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Assigned Housing Consultant</label>
                      <select
                        value={salesperson}
                        onChange={(e) => handleSalespersonChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold bg-white focus:outline-none focus:border-[#1E6FA8]"
                      >
                        {VERIFIED_TEAM_USERS.map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                      <span className="text-[10.5px] text-slate-400 mt-1 block">
                        ✉️ {salespersonEmail}
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Quote Reference #</label>
                      <input
                        type="text"
                        value={quoteNumber}
                        onChange={(e) => setQuoteNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:border-[#1E6FA8]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Proposal Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold bg-white focus:outline-none focus:border-[#1E6FA8]"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SENT_TO_BUYER">Sent to Buyer</option>
                        <option value="LENDER_REVIEW">Lender Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="IN_CONTRACT">In Contract</option>
                      </select>
                    </div>
                  </div>

                  {/* Step 1 Bottom Navigation Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleSaveQuote()}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      💾 Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="px-6 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <span>Continue to Step 2: Home Selection</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MANUFACTURED HOME SELECTION & CUSTOMIZATION */}
              {activeTab === 'home' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                        STEP 2 OF 7
                      </span>
                      <h2 className="text-lg font-black text-[#0B1E38]">Manufactured Home Selection &amp; Pricing</h2>
                      <p className="text-xs text-slate-500">
                        Choose from all 225 verified models across Cavco, Clayton Addison, Clayton TRU, Legacy, and Timber Creek, or customize freely.
                      </p>
                    </div>
                  </div>

                  {/* Selected Model Highlight Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                        CURRENTLY SELECTED HOME MODEL
                      </span>
                      <span className="font-mono text-xs font-black text-[#0B1E38]">
                        Base Price: ${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Model Name *</label>
                        <input
                          type="text"
                          value={homeModel}
                          onChange={(e) => setHomeModel(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Manufacturer</label>
                        <input
                          type="text"
                          value={manufacturer}
                          onChange={(e) => setManufacturer(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Base EHS Price ($) *</label>
                        <input
                          type="number"
                          value={basePrice}
                          onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white text-[#0B1E38]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Factory Cost ($)</label>
                        <input
                          type="number"
                          value={factoryCost}
                          onChange={(e) => setFactoryCost(Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-3 text-xs pt-1">
                      <div>
                        <label className="block font-medium text-slate-500 mb-0.5">Bedrooms</label>
                        <input
                          type="number"
                          value={beds}
                          onChange={(e) => setBeds(Number(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-500 mb-0.5">Bathrooms</label>
                        <input
                          type="number"
                          step="0.5"
                          value={baths}
                          onChange={(e) => setBaths(Number(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-500 mb-0.5">Square Feet</label>
                        <input
                          type="number"
                          value={sqft}
                          onChange={(e) => setSqft(Number(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-500 mb-0.5">Dimensions (W x L)</label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Catalog Home Picker Search & Filter */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">
                        Choose From 225 Verified Catalog Models
                      </h3>
                      <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold">
                        {['ALL', 'CAVCO Plant City', 'CLAYTON Addison', 'CLAYTON TRU', 'LEGACY', 'Timber Creek'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setBuilderFilter(m)}
                            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                              builderFilter === m
                                ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {m === 'ALL' ? 'All (225)' : m.replace('Plant City', '').replace('Addison', '')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={homeSearch}
                      onChange={(e) => setHomeSearch(e.target.value)}
                      placeholder="Search 225 models by name (e.g. Atmos, Dogwood, Tulip, Boujee, Oak, Paxton)..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E6FA8]"
                    />

                    {/* Catalog Grid */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                      {filteredCatalog.map((h) => {
                        const homeDisplayName = h.name || 'Manufactured Home';
                        const bedCount = h.bedrooms ?? 3;
                        const bathCount = h.bathrooms ?? 2;
                        const sqftCount = h.squareFeet ?? 1200;
                        const dimText = h.dimensions || `${h.width || 24}' x ${h.length || 50}'`;

                        return (
                          <div
                            key={h.slug || h.name}
                            onClick={() => handleSelectCatalogHome(h)}
                            className={`p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors text-xs ${
                              (selectedHome?.name === h.name || homeModel === homeDisplayName) ? 'bg-sky-50/80 border-l-4 border-[#1E6FA8]' : ''
                            }`}
                          >
                            <div>
                              <div className="font-black text-[#0B1E38] text-sm">{homeDisplayName}</div>
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

                  {/* Step 2 Bottom Navigation Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      ← Back to Step 1: Customer
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveQuote()}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        💾 Save
                      </button>

                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="px-6 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Continue to Step 3: Land &amp; Freight</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LAND & DELIVERY FREIGHT */}
              {activeTab === 'site' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                      STEP 3 OF 7
                    </span>
                    <h2 className="text-lg font-black text-[#0B1E38]">Land Parcel &amp; Delivery Freight Engine</h2>
                    <p className="text-xs text-slate-500">
                      Defaulted to customer-owned land ($0.00). Or select a Central Florida parcel or custom delivery route.
                    </p>
                  </div>

                  {/* Land Selection Options */}
                  <div className="space-y-3">
                    <label className="block font-black text-xs text-slate-700 uppercase tracking-wider">
                      Land &amp; Homesite Option
                    </label>
                    <div className="grid sm:grid-cols-3 gap-3 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => handleLandOptionChange('OWNED')}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                          landOption === 'OWNED'
                            ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>🏡 Customer Owns Land</div>
                        <div className="text-[11px] font-normal opacity-80 mt-0.5">$0.00 Land Price (Default)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLandOptionChange('PARCEL')}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                          landOption === 'PARCEL'
                            ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>📍 Central FL Parcel</div>
                        <div className="text-[11px] font-normal opacity-80 mt-0.5">Choose from 17 Listings</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLandOptionChange('CUSTOM')}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                          landOption === 'CUSTOM'
                            ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>✍️ Custom Parcel Price</div>
                        <div className="text-[11px] font-normal opacity-80 mt-0.5">Enter Custom Land Value</div>
                      </button>
                    </div>

                    {landOption === 'PARCEL' && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <label className="block font-bold text-slate-700">Select Available Central FL Parcel</label>
                        <select
                          value={selectedParcelId}
                          onChange={(e) => handleParcelSelect(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                        >
                          {INITIAL_PROPERTIES.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.address} ({p.county} County) — ${(p.price || 0).toLocaleString()} ({p.lotSize || 'N/A'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Land / Parcel Price ($)</label>
                        <input
                          type="number"
                          value={propertyPrice}
                          onChange={(e) => setPropertyPrice(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#0B1E38]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Delivery Homesite Address</label>
                        <input
                          type="text"
                          value={propertyAddress}
                          onChange={(e) => setPropertyAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                          placeholder="e.g. 6645 W Erlen Ln, Homosassa, FL 34446"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Freight Engine */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <span className="font-black text-xs text-slate-700 uppercase tracking-wider block">
                      Freight Transport &amp; Delivery Engine
                    </span>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Route Type</label>
                        <select
                          value={deliveryRouteType}
                          onChange={(e) => setDeliveryRouteType(e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                        >
                          <option value="dealer_to_customer">Dealership to Customer Site</option>
                          <option value="factory_to_customer">Factory Direct to Customer</option>
                          <option value="factory_to_dealer">Factory to Dealership Hub</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Delivery Distance (Miles)</label>
                        <input
                          type="number"
                          value={deliveryMiles}
                          onChange={(e) => setDeliveryMiles(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Escort Vehicles Count</label>
                        <input
                          type="number"
                          value={escortsCount}
                          onChange={(e) => setEscortsCount(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Delivery Freight Retail Price ($)</label>
                        <input
                          type="number"
                          value={deliveryFreightPrice}
                          onChange={(e) => setDeliveryFreightPrice(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#0B1E38]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Delivery Freight Direct Cost ($)</label>
                        <input
                          type="number"
                          value={deliveryFreightCost}
                          onChange={(e) => setDeliveryFreightCost(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Bottom Navigation Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      ← Back to Step 2: Home Selection
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveQuote()}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        💾 Save
                      </button>

                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="px-6 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Continue to Step 4: Line Items &amp; Services</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LINE ITEMS & SERVICES (100% Comprehensive Editing) */}
              {activeTab === 'pricing' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                        STEP 4 OF 7
                      </span>
                      <h2 className="text-lg font-black text-[#0B1E38]">Line Items, Site Prep &amp; Add-ons</h2>
                      <p className="text-xs text-slate-500">
                        Add, edit, or delete any site work, utilities, tie-downs, A/C systems, permits ($2,000 flat), and skirting.
                      </p>
                    </div>
                  </div>

                  {/* Add from Catalog Dropdown */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Quick Add Service from EHS ERP V05 Catalog
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedServiceSku}
                        onChange={(e) => setSelectedServiceSku(e.target.value)}
                        className="flex-1 min-w-[240px] px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                      >
                        {SERVICE_CATALOG.map((s) => (
                          <option key={s.sku} value={s.sku}>
                            {s.name} — ${s.defaultPrice.toLocaleString()} (Cost: ${(s.defaultCost || 0).toLocaleString()})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCatalogService}
                        className="px-4 py-2 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                      >
                        + Add Catalog Service
                      </button>
                    </div>
                  </div>

                  {/* Add Custom Service / Item Form */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Or Add Custom Line Item / Upgrade
                    </span>
                    <div className="grid sm:grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Item Name</label>
                        <input
                          type="text"
                          value={customItemName}
                          onChange={(e) => setCustomItemName(e.target.value)}
                          placeholder="e.g. Porch Decking / Upgraded Skirting"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Customer Price ($)</label>
                        <input
                          type="number"
                          value={customItemPrice}
                          onChange={(e) => setCustomItemPrice(Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Dealer Cost ($)</label>
                        <input
                          type="number"
                          value={customItemCost}
                          onChange={(e) => setCustomItemCost(Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-semibold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={customItemDesc}
                        onChange={(e) => setCustomItemDesc(e.target.value)}
                        placeholder="Description of custom work..."
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomLineItem}
                        disabled={!customItemName.trim()}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs cursor-pointer"
                      >
                        + Add Custom Item
                      </button>
                    </div>
                  </div>

                  {/* Active Line Items Table (Fully Editable Row by Row) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">
                        Active Proposal Line Items ({lineItems.length} Items)
                      </span>
                      <span className="font-bold text-xs text-[#1E6FA8]">
                        Total Site Work: ${(subtotalSiteWork + subtotalAddOns).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                      {lineItems.map((item) => (
                        <div key={item.id} className="p-3 bg-white hover:bg-slate-50/70 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 font-bold text-[#0B1E38]">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateLineItem(item.id, { name: e.target.value })}
                                className="w-full px-2 py-1 border border-slate-200 rounded font-bold text-xs bg-slate-50 focus:bg-white"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              className="text-rose-600 hover:text-rose-800 p-1 font-bold cursor-pointer"
                              title="Delete Item"
                            >
                              🗑️
                            </button>
                          </div>

                          <div className="grid sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Qty:</span>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateLineItem(item.id, { quantity: Number(e.target.value) || 1 })}
                                className="w-full px-2 py-0.5 border border-slate-200 rounded font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Unit Price ($):</span>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateLineItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                                className="w-full px-2 py-0.5 border border-slate-200 rounded font-bold text-[#0B1E38]"
                              />
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Unit Cost ($):</span>
                              <input
                                type="number"
                                value={item.unitCost}
                                onChange={(e) => handleUpdateLineItem(item.id, { unitCost: Number(e.target.value) || 0 })}
                                className="w-full px-2 py-0.5 border border-slate-200 rounded"
                              />
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Total Amount:</span>
                              <div className="font-black text-slate-900 py-1 tabular">
                                ${(item.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(item.id, { description: e.target.value })}
                            className="w-full px-2 py-1 text-[11px] text-slate-500 border border-slate-100 rounded"
                            placeholder="Line item description..."
                          />
                        </div>
                      ))}
                    </div>

                    {/* Discounts Field */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block">Discounts &amp; Promotional Credits ($)</span>
                        <span className="text-[11px] text-slate-500">Deducted from subtotal prior to sales tax</span>
                      </div>
                      <input
                        type="number"
                        value={discounts}
                        onChange={(e) => setDiscounts(Number(e.target.value) || 0)}
                        className="w-32 px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-rose-600 bg-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Step 4 Bottom Navigation Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      ← Back to Step 3: Land &amp; Freight
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveQuote()}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        💾 Save
                      </button>

                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="px-6 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Continue to Step 5: Financing &amp; Deposits</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FINANCING, DEPOSITS & LOAN OFFICER */}
              {activeTab === 'financing' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                      STEP 5 OF 7
                    </span>
                    <h2 className="text-lg font-black text-[#0B1E38]">Financing, Deposits &amp; Loan Officer Tab</h2>
                    <p className="text-xs text-slate-500">
                      Optional financing details, customer binder deposits, milestone timeline, and $1,000 loan fee toggle.
                    </p>
                  </div>

                  {/* Cash vs Financing */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPurchaseType('financing')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                        purchaseType === 'financing'
                          ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div>🏦 Manufactured Home Loan / Financing</div>
                      <div className="text-[11px] font-normal opacity-80 mt-0.5">FHA, USDA, VA, or Conventional Mortgage</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurchaseType('cash')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                        purchaseType === 'cash'
                          ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div>💵 Cash / Self-Pay Purchase</div>
                      <div className="text-[11px] font-normal opacity-80 mt-0.5">Direct wire / bank draft payment</div>
                    </button>
                  </div>

                  {/* EHS Loan Officer Used Toggle */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-black text-xs text-[#0B1E38]">
                        EHS Dedicated Loan Officer Used?
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        When enabled, applies standard $1,000 loan fee to internal calculations.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ehsLoanOfficerUsed}
                        onChange={(e) => setEhsLoanOfficerUsed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Deposits Tracker */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">
                        Customer Binder &amp; Earnest Deposits ({deposits.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddDeposit}
                        className="px-3 py-1 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                      >
                        + Add Deposit
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                      {deposits.map((dep) => (
                        <div key={dep.id} className="p-3 bg-white flex flex-wrap items-center justify-between gap-2">
                          <input
                            type="text"
                            value={dep.name}
                            onChange={(e) => handleUpdateDeposit(dep.id, { name: e.target.value })}
                            className="font-bold text-slate-800 border border-slate-200 rounded px-2 py-1 flex-1 min-w-[140px]"
                          />
                          <input
                            type="number"
                            value={dep.amount}
                            onChange={(e) => handleUpdateDeposit(dep.id, { amount: Number(e.target.value) || 0 })}
                            className="font-black text-emerald-700 border border-slate-200 rounded px-2 py-1 w-28"
                          />
                          <input
                            type="date"
                            value={dep.date}
                            onChange={(e) => handleUpdateDeposit(dep.id, { date: e.target.value })}
                            className="text-slate-600 border border-slate-200 rounded px-2 py-1"
                          />
                          <select
                            value={dep.status}
                            onChange={(e) => handleUpdateDeposit(dep.id, { status: e.target.value })}
                            className="font-semibold border border-slate-200 rounded px-2 py-1 bg-white"
                          >
                            <option value="Received">Received</option>
                            <option value="Pending">Pending</option>
                            <option value="Cleared">Cleared</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeposit(dep.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestone Dates Timeline */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="font-black text-xs text-slate-700 uppercase tracking-wider block">
                      Milestone Timeline Dates
                    </span>
                    <div className="grid sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-0.5">Loan Approval</label>
                        <input
                          type="date"
                          value={loanApprovalDate}
                          onChange={(e) => setLoanApprovalDate(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">Loan Closing</label>
                        <input
                          type="date"
                          value={loanClosingDate}
                          onChange={(e) => setLoanClosingDate(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">Permit Approval</label>
                        <input
                          type="date"
                          value={permitApprovalDate}
                          onChange={(e) => setPermitApprovalDate(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">Site Ready</label>
                        <input
                          type="date"
                          value={siteReadyDate}
                          onChange={(e) => setSiteReadyDate(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 5 Bottom Navigation Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      ← Back to Step 4: Line Items
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveQuote()}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        💾 Save
                      </button>

                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="px-6 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Continue to Step 6: Notes &amp; Terms</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: NOTES & DOCUMENTATION */}
              {activeTab === 'notes' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                      STEP 6 OF 7
                    </span>
                    <h2 className="text-lg font-black text-[#0B1E38]">Proposal Notes &amp; Consultant Disclaimers</h2>
                    <p className="text-xs text-slate-500">
                      Add customer-facing proposal notes and private internal dealer notes.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Customer-Facing Proposal Notes (Visible on Executive Proposal Sheet &amp; PDF)
                      </label>
                      <textarea
                        rows={3}
                        value={notesCustomer}
                        onChange={(e) => setNotesCustomer(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl leading-relaxed"
                        placeholder="e.g. Complete turnkey land and home package proposal for Homosassa homesite..."
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Internal Deal &amp; Consultant Notes (Private to EHS Team)
                      </label>
                      <textarea
                        rows={2}
                        value={notesInternal}
                        onChange={(e) => setNotesInternal(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl leading-relaxed"
                        placeholder="e.g. FHA underwriting in progress. Site visit scheduled with county contractor..."
                      />
                    </div>
                  </div>

                  {/* Step 6 Bottom Navigation Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      ← Back to Step 5: Financing
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveQuote()}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        💾 Save
                      </button>

                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="px-6 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Continue to Step 7: Review &amp; Summary</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: REVIEW & SUMMARY */}
              {activeTab === 'review' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                      STEP 7 OF 7
                    </span>
                    <h2 className="text-lg font-black text-[#0B1E38]">Review &amp; Finalize Proposal</h2>
                    <p className="text-xs text-slate-500">
                      Verify all turnkey costs, sales tax, margins, and customer documents.
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Customer</span>
                        <div className="font-black text-sm text-[#0B1E38]">{customerName}</div>
                        <div className="text-slate-600">{customerPhone} • {customerEmail}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Selected Home</span>
                        <div className="font-black text-sm text-[#0B1E38]">{homeModel}</div>
                        <div className="text-slate-600">{manufacturer} • {beds}b/{baths}ba • {sqft} sq ft</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                      <span className="font-extrabold text-slate-800">Final Estimated Turnkey Total:</span>
                      <span className="font-mono font-black text-lg text-[#0F2A47]">
                        ${quoteTotals.estimated_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      ← Back to Step 6: Notes
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveQuote('SENT_TO_BUYER')}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer"
                    >
                      ✓ Save &amp; Mark as Sent to Buyer
                    </button>

                    <Link
                      href={`/quotes/${quoteId}`}
                      className="px-5 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl text-xs shadow-xs"
                    >
                      👁️ View Proposal Sheet
                    </Link>

                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors ml-auto cursor-pointer"
                    >
                      Delete Proposal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE MATHEMATICAL PRECISION TOTALS PANEL (Sticky Right Column) */}
            <div className="space-y-4 sticky top-20 self-start">
              {/* Step Navigation Quick Controller */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                    STEP {currentStep.stepNum} OF 7: {currentStep.shortLabel}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {Math.round((currentStep.stepNum / 7) * 100)}% Complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#1E6FA8] h-full transition-all duration-300"
                    style={{ width: `${(currentStep.stepNum / 7) * 100}%` }}
                  />
                </div>

                {/* Step Pill Buttons */}
                <div className="grid grid-cols-7 gap-1 pt-1">
                  {STEPS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setActiveTab(s.key)}
                      className={`py-1.5 rounded-lg text-center font-black text-xs transition-colors cursor-pointer ${
                        activeTab === s.key
                          ? 'bg-[#0B1E38] text-white'
                          : s.stepNum < currentStep.stepNum
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                      title={s.label}
                    >
                      {s.stepNum}
                    </button>
                  ))}
                </div>

                {/* Step Forward / Back Buttons in Sticky Panel */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    disabled={currentStepIndex === 0}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={currentStepIndex === STEPS.length - 1}
                    className="flex-1 py-2 bg-[#0F2A47] hover:bg-[#0B1E38] disabled:opacity-40 disabled:hover:bg-[#0F2A47] text-white font-black rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Next Step →
                  </button>
                </div>
              </div>

              {/* CUSTOMER-FACING Breakdown Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                    CUSTOMER-FACING
                  </div>
                  <div className="mt-2 space-y-1.5 text-slate-700">
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
                    {subtotalAddOns > 0 && (
                      <div className="flex justify-between">
                        <span>Add-ons</span>
                        <span className="font-semibold tabular">${subtotalAddOns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {discounts > 0 && (
                      <div className="flex justify-between text-rose-600 font-semibold">
                        <span>Discounts</span>
                        <span className="tabular">- ${discounts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

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

                    {/* Dark Navy ESTIMATED TOTAL Banner */}
                    <div className="flex items-center justify-between rounded-xl bg-[#0F2A47] text-white px-3.5 py-3 mt-2 shadow-md">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider">ESTIMATED TOTAL</span>
                      <span className="font-black text-xl tabular font-mono">
                        ${quoteTotals.estimated_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* INTERNAL ONLY Section */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                    INTERNAL ONLY (EHS Profit Matrix)
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
                      <span>Commissionable margin</span>
                      <span className={`tabular ${quoteTotals.commissionable_house_margin < 0 ? 'text-rose-600 font-bold' : ''}`}>
                        ${quoteTotals.commissionable_house_margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
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
                      <span>Salesperson comm (20%)</span>
                      <span className="tabular">${quoteTotals.salesperson_commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {/* Net Take Home Box */}
                    <div className={`p-2.5 rounded-xl border mt-2 flex items-center justify-between ${
                      targetMet
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <span className="font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1">
                        {targetMet ? '✓' : '⚠️'} NET TAKE HOME
                      </span>
                      <span className="font-black text-sm tabular font-mono">
                        ${netTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Floor: $20,000.00
                    </div>
                  </div>
                </div>

                {/* Primary Save Button in Sticky Sidebar */}
                <button
                  type="button"
                  onClick={() => handleSaveQuote()}
                  className="w-full py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
                >
                  <span>💾</span>
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

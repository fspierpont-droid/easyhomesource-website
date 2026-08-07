'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Property } from '@/types/property';
import { FULL_MASTER_CATALOG_HOMES, type MasterCatalogHome } from '@/data/fullMasterCatalog.generated';
import {
  SERVICE_CATALOG,
  autoCalculateDelivery,
  calculateBlockTieDown,
  calculateComprehensiveQuoteTotals,
  type ServiceCatalogItem,
  type DeliveryCalculationResult,
  type QuoteFinancialTotals
} from '@/data/pricingSpreadsheet';
import { VERIFIED_TEAM_USERS, type TeamUser } from '@/data/teamMembers';

export interface SelectedQuoteLineItem {
  id: string;
  sku: string;
  name: string;
  category: 'mandatory_services' | 'site_work' | 'addons' | 'options' | 'custom';
  unitPrice: number;
  unitCost: number;
  quantity: number;
  totalPrice: number;
  totalCost: number;
  description: string;
}

export interface SavedQuote {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  homeModel: string;
  manufacturer: string;
  homePrice: number;
  factoryCost: number;
  homeWidth: number;
  homeLength: number;
  propertyAddress: string;
  propertyPrice: number;
  siteWorkTotal: number;
  freightDelivery: number;
  deliveryMiles: number;
  deliveryRouteType: string;
  acSystem: number;
  permitsFees: number;
  skirtingSteps: number;
  subtotal: number;
  taxBasis: number;
  salesTax: number;
  totalTurnkeyPrice: number;
  estimatedTotal: number;
  salesperson: string;
  salespersonEmail?: string;
  status: 'DRAFT' | 'SENT_TO_BUYER' | 'LENDER_REVIEW' | 'APPROVED' | 'IN_CONTRACT';
  lineItems: SelectedQuoteLineItem[];
  discounts: number;
  notes: string;
  shareToken?: string;
  financialTotals?: QuoteFinancialTotals;
  createdAt: string;
  updatedAt: string;
}

interface ManualQuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuote: (quote: SavedQuote) => void;
  initialCustomerName?: string;
  initialHomeModel?: string;
  initialPropertyId?: string;
  availableProperties: Property[];
  existingQuote?: SavedQuote | null;
}

export function ManualQuoteBuilderModal({
  isOpen,
  onClose,
  onSaveQuote,
  initialCustomerName = '',
  initialHomeModel = '',
  initialPropertyId = '',
  availableProperties,
  existingQuote = null
}: ManualQuoteBuilderModalProps) {
  // Step state (1: Customer -> 2: Homes & Land -> 3: Auto Delivery -> 4: Dropdown Line Items -> 5: Summary & Totals)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Customer Details & Assigned Consultant from Verified Team
  const [customerName, setCustomerName] = useState(initialCustomerName || existingQuote?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(existingQuote?.customerPhone || '352-555-0199');
  const [customerEmail, setCustomerEmail] = useState(existingQuote?.customerEmail || '');
  const [salesperson, setSalesperson] = useState(existingQuote?.salesperson || 'Scott Pierpont');

  // Selected Home (from verified Master Catalog)
  const [homeSearch, setHomeSearch] = useState('');
  const [builderFilter, setBuilderFilter] = useState('ALL');
  const [selectedHomeSlug, setSelectedHomeSlug] = useState<string>(
    existingQuote?.homeModel ? 'custom' : FULL_MASTER_CATALOG_HOMES[0]?.slug || ''
  );

  const selectedHome: MasterCatalogHome | undefined = useMemo(() => {
    return FULL_MASTER_CATALOG_HOMES.find((h) => h.slug === selectedHomeSlug) || FULL_MASTER_CATALOG_HOMES[0];
  }, [selectedHomeSlug]);

  const [customHomeName, setCustomHomeName] = useState<string>(
    existingQuote?.homeModel || (selectedHome ? `${selectedHome.manufacturer} ${selectedHome.name}` : 'Manufactured Home')
  );
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>(
    existingQuote?.manufacturer || selectedHome?.manufacturer || 'CAVCO Plant City'
  );
  const [customHomePrice, setCustomHomePrice] = useState<number>(
    existingQuote?.homePrice ?? selectedHome?.ehsPrice ?? 39888
  );
  const [customFactoryCost, setCustomFactoryCost] = useState<number>(
    existingQuote?.factoryCost ?? selectedHome?.estFactoryCost ?? 28000
  );

  // Selected Property / Land
  const [landOption, setLandOption] = useState<'OWNED' | 'PORTAL_PROPERTY'>(
    existingQuote?.propertyPrice === 0 ? 'OWNED' : 'PORTAL_PROPERTY'
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    initialPropertyId || availableProperties[0]?.id || ''
  );
  const selectedProperty = availableProperties.find((p) => p.id === selectedPropertyId);
  const [customLandPrice, setCustomLandPrice] = useState<number>(
    existingQuote?.propertyPrice ?? selectedProperty?.price ?? 49900
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    existingQuote?.propertyAddress || selectedProperty?.address || 'Spring Hill, FL 34606'
  );

  // Delivery & Freight Calculation Engine
  const [deliveryRouteType, setDeliveryRouteType] = useState<'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer'>('dealer_to_customer');
  const [deliveryMiles, setDeliveryMiles] = useState<number>(existingQuote?.deliveryMiles || 25);
  const [deliveryCalculation, setDeliveryCalculation] = useState<DeliveryCalculationResult | null>(null);
  const [freightPrice, setFreightPrice] = useState<number>(existingQuote?.freightDelivery || 3850);
  const [freightCost, setFreightCost] = useState<number>(3500);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  // Initial Itemized Line Items from ERP Standard Services
  const initialBlockTie = useMemo(() => {
    const homeClass = (selectedHome?.width || 14) > 18 ? 'double' : 'single';
    return calculateBlockTieDown(selectedHome?.length || 60, homeClass);
  }, [selectedHome]);

  const [lineItems, setLineItems] = useState<SelectedQuoteLineItem[]>(
    existingQuote?.lineItems || [
      {
        id: 'item-1',
        sku: 'SITE-BLOCK-TIEDOWN',
        name: 'Block & Hurricane Tie-Down Installation',
        category: 'mandatory_services',
        unitPrice: initialBlockTie.price || 5835,
        unitCost: initialBlockTie.cost || 4668,
        quantity: 1,
        totalPrice: initialBlockTie.price || 5835,
        totalCost: initialBlockTie.cost || 4668,
        description: `Concrete pier pads, cinder blocks, leveling, and Florida wind zone hurricane ground anchors (${initialBlockTie.matchedLength}ft table).`
      },
      {
        id: 'item-2',
        sku: 'HVAC-HP-3TON',
        name: '3.0-Ton Central A/C Heat Pump System (14.3 SEER2)',
        category: 'mandatory_services',
        unitPrice: 5555,
        unitCost: 5050,
        quantity: 1,
        totalPrice: 5555,
        totalCost: 5050,
        description: 'High-efficiency heat pump with digital thermostat, pad, and plenum tie-in.'
      },
      {
        id: 'item-3',
        sku: 'SITE-DIRTPAD',
        name: 'Dirt Pad & Laser Site Grading (2 Loads)',
        category: 'mandatory_services',
        unitPrice: 2700,
        unitCost: 1800,
        quantity: 1,
        totalPrice: 2700,
        totalCost: 1800,
        description: 'Clearing, clean fill dirt import, compacting, and laser leveling for solid home foundation.'
      },
      {
        id: 'item-4',
        sku: 'SITE-SKIRTING-VINYL',
        name: 'Vented Vinyl Perimeter Skirting & Steps (2 Sets)',
        category: 'mandatory_services',
        unitPrice: 3200,
        unitCost: 2200,
        quantity: 1,
        totalPrice: 3200,
        totalCost: 2200,
        description: 'Full perimeter vinyl skirting and 2 sets of code-compliant entrance stairs.'
      },
      {
        id: 'item-5',
        sku: 'SITE-PERMIT-PLAN',
        name: 'County Building, Zoning & Health Dept Permits',
        category: 'mandatory_services',
        unitPrice: 2650,
        unitCost: 2650,
        quantity: 1,
        totalPrice: 2650,
        totalCost: 2650,
        description: 'Hernando/Citrus county building permit processing and inspection fees.'
      }
    ]
  );

  // Selected Catalog Item Dropdown Helper
  const [selectedCatalogSku, setSelectedCatalogSku] = useState(SERVICE_CATALOG[0].sku);
  const [discounts, setDiscounts] = useState<number>(existingQuote?.discounts || 0);
  const [notes, setNotes] = useState<string>(existingQuote?.notes || 'Standard turnkey package estimate for Central Florida with site prep, delivery, tie-downs, A/C, and permits.');

  useEffect(() => {
    if (selectedHome && selectedHomeSlug !== 'custom') {
      setCustomHomeName(`${selectedHome.manufacturer} ${selectedHome.name}`);
      setSelectedManufacturer(selectedHome.manufacturer);
      setCustomHomePrice(selectedHome.ehsPrice || selectedHome.msrp || 39888);
      setCustomFactoryCost(selectedHome.estFactoryCost || Math.round((selectedHome.ehsPrice || 39888) * 0.72));

      // Auto-update Block & Tie-down based on model dimensions
      const homeClass = (selectedHome.width || 14) > 18 ? 'double' : 'single';
      const bt = calculateBlockTieDown(selectedHome.length || 60, homeClass);
      setLineItems((prev) =>
        prev.map((item) =>
          item.sku === 'SITE-BLOCK-TIEDOWN'
            ? {
                ...item,
                unitPrice: bt.price,
                unitCost: bt.cost,
                totalPrice: bt.price * item.quantity,
                totalCost: bt.cost * item.quantity,
                description: `Concrete pier pads, cinder blocks, leveling, and Florida wind zone hurricane ground anchors (${bt.matchedLength}ft ${homeClass} table).`
              }
            : item
        )
      );
    }
  }, [selectedHomeSlug, selectedHome]);

  useEffect(() => {
    if (selectedProperty && landOption === 'PORTAL_PROPERTY') {
      setCustomLandPrice(selectedProperty.price || 49900);
      setDeliveryAddress(`${selectedProperty.address}, ${selectedProperty.city}, FL ${selectedProperty.zip}`);
    } else if (landOption === 'OWNED') {
      setCustomLandPrice(0);
    }
  }, [selectedPropertyId, landOption, selectedProperty]);

  if (!isOpen) return null;

  // Filter homes by search and builder
  const filteredHomeCatalog = FULL_MASTER_CATALOG_HOMES.filter((h) => {
    if (builderFilter !== 'ALL' && h.manufacturer !== builderFilter) return false;
    if (!homeSearch.trim()) return true;
    const text = [h.name, h.manufacturer, h.series, h.dimensions, h.squareFeet].filter(Boolean).join(' ').toLowerCase();
    return text.includes(homeSearch.toLowerCase().trim());
  });

  const distinctBuilders = ['ALL', ...new Set(FULL_MASTER_CATALOG_HOMES.map((h) => h.manufacturer))];

  // Calculate Turnkey Subtotals & Financial Metrics
  const subtotalHome = Number(customHomePrice) || 0;
  const subtotalLand = landOption === 'OWNED' ? 0 : Number(customLandPrice) || 0;
  const siteWorkItems = lineItems.filter((i) => i.category === 'mandatory_services' || i.category === 'site_work');
  const addOnItems = lineItems.filter((i) => i.category === 'addons' || i.category === 'options' || i.category === 'custom');

  const subtotalSiteWork = siteWorkItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  const subtotalAddOns = addOnItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  const costSiteWork = siteWorkItems.reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);
  const costAddOns = addOnItems.reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);
  const subtotalFreight = Number(freightPrice) || 0;

  const quoteTotals: QuoteFinancialTotals = calculateComprehensiveQuoteTotals(
    subtotalHome + subtotalLand,
    subtotalFreight,
    subtotalSiteWork,
    subtotalAddOns,
    discounts,
    customFactoryCost,
    freightCost,
    costSiteWork,
    costAddOns,
    0.03
  );

  // Trigger Auto Calculate Delivery Button
  const handleAutoCalculateDelivery = () => {
    setIsCalculatingDelivery(true);
    setTimeout(() => {
      const width = selectedHome?.width || 14;
      const res = autoCalculateDelivery(deliveryAddress, width, deliveryRouteType);
      setDeliveryCalculation(res);
      setDeliveryMiles(res.miles);
      setFreightPrice(res.totalFreightPrice);
      setFreightCost(res.totalFreightCost);
      setIsCalculatingDelivery(false);
    }, 300);
  };

  // Add line item from service catalog dropdown
  const handleAddCatalogLineItem = () => {
    const item = SERVICE_CATALOG.find((s) => s.sku === selectedCatalogSku);
    if (!item) return;

    const newItem: SelectedQuoteLineItem = {
      id: `item-${Date.now()}`,
      sku: item.sku,
      name: item.name,
      category: item.category,
      unitPrice: item.defaultPrice,
      unitCost: item.defaultCost || Math.round(item.defaultPrice * 0.75),
      quantity: 1,
      totalPrice: item.defaultPrice,
      totalCost: item.defaultCost || Math.round(item.defaultPrice * 0.75),
      description: item.description
    };

    setLineItems((prev) => [...prev, newItem]);
  };

  // Add custom line item
  const handleAddCustomLineItem = () => {
    const newItem: SelectedQuoteLineItem = {
      id: `item-${Date.now()}`,
      sku: `CUSTOM-${Date.now().toString().slice(-4)}`,
      name: 'Custom Project Work / Add-On',
      category: 'custom',
      unitPrice: 1500,
      unitCost: 1100,
      quantity: 1,
      totalPrice: 1500,
      totalCost: 1100,
      description: 'Custom client request specification.'
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const handleUpdateLineItem = (id: string, updates: Partial<SelectedQuoteLineItem>) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const qty = updates.quantity !== undefined ? updates.quantity : item.quantity;
        const price = updates.unitPrice !== undefined ? updates.unitPrice : item.unitPrice;
        const cost = updates.unitCost !== undefined ? updates.unitCost : item.unitCost;
        return {
          ...item,
          ...updates,
          quantity: qty,
          unitPrice: price,
          unitCost: cost,
          totalPrice: qty * price,
          totalCost: qty * cost
        };
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = (status: 'DRAFT' | 'SENT_TO_BUYER' | 'APPROVED' = 'SENT_TO_BUYER') => {
    if (!customerName.trim()) {
      alert('Please enter customer name.');
      return;
    }

    const assignedUser = VERIFIED_TEAM_USERS.find((u) => u.name === salesperson) || VERIFIED_TEAM_USERS[6];
    const quoteNumber = existingQuote?.quoteNumber || `Q-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newQuote: SavedQuote = {
      id: existingQuote?.id || `quote-${Date.now()}`,
      quoteNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      homeModel: customHomeName,
      manufacturer: selectedManufacturer,
      homePrice: subtotalHome,
      factoryCost: customFactoryCost,
      homeWidth: selectedHome?.width || 14,
      homeLength: selectedHome?.length || 60,
      propertyAddress:
        landOption === 'OWNED'
          ? deliveryAddress || 'Customer Owned Land'
          : selectedProperty
          ? `${selectedProperty.address}, ${selectedProperty.city}`
          : deliveryAddress,
      propertyPrice: subtotalLand,
      siteWorkTotal: subtotalSiteWork,
      freightDelivery: subtotalFreight,
      deliveryMiles,
      deliveryRouteType,
      acSystem: lineItems.find((i) => i.sku.includes('HVAC'))?.totalPrice || 5555,
      permitsFees: lineItems.find((i) => i.sku.includes('PERMIT'))?.totalPrice || 2650,
      skirtingSteps: lineItems.find((i) => i.sku.includes('SKIRTING'))?.totalPrice || 3200,
      subtotal: quoteTotals.subtotal,
      taxBasis: quoteTotals.tax_basis,
      salesTax: quoteTotals.sales_tax_total,
      totalTurnkeyPrice: quoteTotals.estimated_total,
      estimatedTotal: quoteTotals.estimated_total,
      salesperson: assignedUser.name,
      salespersonEmail: assignedUser.email,
      status,
      lineItems,
      discounts,
      notes,
      shareToken: existingQuote?.shareToken || `ehs-share-${Date.now().toString(36)}`,
      financialTotals: quoteTotals,
      createdAt: existingQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveQuote(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 text-xs">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-borderGray w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with Easy HomeSource Navy Palette */}
        <div className="p-5 sm:p-6 border-b border-[#0F2A47]/20 bg-gradient-to-r from-[#0B1E38] via-[#0F2A47] to-[#1E6FA8] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shadow-xs">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Master Turnkey Quote Tool (Spreadsheet Engine)
                </h3>
                <span className="bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-300/30">
                  {FULL_MASTER_CATALOG_HOMES.length} Models Loaded
                </span>
              </div>
              <p className="text-[11px] text-[#A8C8E6] font-medium">
                Live pricing from Master Spreadsheet: All {FULL_MASTER_CATALOG_HOMES.length} Models • Dropdown Line Items • Auto Delivery Calculation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 5-Step Navigation Ribbon */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 font-black text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { num: 1, label: '1. Customer Info' },
              { num: 2, label: `2. Homes & Land` },
              { num: 3, label: '3. Auto Calculate Delivery' },
              { num: 4, label: '4. Dropdown Line Items' },
              { num: 5, label: '5. Summary & Totals' }
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as any)}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  step === s.num
                    ? 'bg-[#0F2A47] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Turnkey Total</span>
            <span className="text-base font-black text-[#0F2A47]">
              ${quoteTotals.estimated_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Customer Details & Assigned Team User */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Step 1</span>
                <h4 className="text-lg font-black text-[#0B1E38]">Customer Contact &amp; Consultant Assignment</h4>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#1E6FA8] focus:ring-2 focus:ring-[#1E6FA8]/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 352-555-0199"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E6FA8]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. sarah.j@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E6FA8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Housing Consultant *</label>
                  <select
                    value={salesperson}
                    onChange={(e) => setSalesperson(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-[#1E6FA8]"
                  >
                    {VERIFIED_TEAM_USERS.map((user) => (
                      <option key={user.id} value={user.name}>
                        {user.name} ({user.role} • {user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Proposal &amp; Project Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes on customer land status, timeline, financing pre-approval, trade-ins..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Homes & Land Selection */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Home Selection */}
              <div className="p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                      Master Spreadsheet Catalog ({FULL_MASTER_CATALOG_HOMES.length} Models)
                    </span>
                    <h4 className="font-black text-sm text-[#0B1E38]">
                      1. Select Base Manufactured Home
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={builderFilter}
                      onChange={(e) => setBuilderFilter(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                    >
                      {distinctBuilders.map((b) => (
                        <option key={b} value={b}>
                          {b === 'ALL' ? 'All Builders' : b}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={homeSearch}
                      onChange={(e) => setHomeSearch(e.target.value)}
                      placeholder={`Search all ${FULL_MASTER_CATALOG_HOMES.length} models...`}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* All Homes Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {filteredHomeCatalog.map((h) => {
                    const isSelected = selectedHomeSlug === h.slug;
                    return (
                      <div
                        key={h.slug}
                        onClick={() => {
                          setSelectedHomeSlug(h.slug);
                          setCustomHomeName(`${h.manufacturer} ${h.name}`);
                          setSelectedManufacturer(h.manufacturer);
                          setCustomHomePrice(h.ehsPrice || h.msrp || 39888);
                          setCustomFactoryCost(h.estFactoryCost || Math.round((h.ehsPrice || 39888) * 0.72));
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#1E6FA8] bg-sky-50/50 ring-2 ring-[#1E6FA8]/20 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-black text-xs text-[#0B1E38] truncate">
                          {h.name}
                        </div>
                        <div className="text-[10.5px] text-slate-500 font-medium">
                          {h.manufacturer} • {h.dimensions}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-black text-xs text-[#1E6FA8]">
                            ${Math.round(h.ehsPrice || h.msrp || 50000).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {h.bedrooms ? `${h.bedrooms}b/${h.bathrooms}ba` : `${h.squareFeet}sf`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Home Summary & Override */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Selected Model</span>
                    <span className="font-extrabold text-xs text-slate-900">{customHomeName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Base Home Price ($)</span>
                    <input
                      type="number"
                      value={customHomePrice}
                      onChange={(e) => setCustomHomePrice(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-black text-xs text-[#1E6FA8]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Est. Factory Cost ($)</span>
                    <input
                      type="number"
                      value={customFactoryCost}
                      onChange={(e) => setCustomFactoryCost(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-xs text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Land / Homesite Selection */}
              <div className="p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                  2. Land / Homesite Selection
                </span>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setLandOption('OWNED')}
                    className={`p-3.5 rounded-xl border cursor-pointer ${
                      landOption === 'OWNED'
                        ? 'border-[#1E6FA8] bg-sky-50/50 ring-2 ring-[#1E6FA8]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-[#0B1E38]">Customer Owned Land</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Client already owns private Florida property / lot ($0 land cost in quote).
                    </p>
                  </div>

                  <div
                    onClick={() => setLandOption('PORTAL_PROPERTY')}
                    className={`p-3.5 rounded-xl border cursor-pointer ${
                      landOption === 'PORTAL_PROPERTY'
                        ? 'border-[#1E6FA8] bg-sky-50/50 ring-2 ring-[#1E6FA8]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-[#0B1E38]">Central Florida Land &amp; Home Package</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bundle an active parcel in Citrus, Hernando, Pasco, or Sumter into turnkey package.
                    </p>
                  </div>
                </div>

                {landOption === 'PORTAL_PROPERTY' && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Select Verified Parcel</label>
                      <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                      >
                        {availableProperties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.address} ({p.city}, FL) - ${p.price?.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Land Price ($)</label>
                      <input
                        type="number"
                        value={customLandPrice}
                        onChange={(e) => setCustomLandPrice(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Auto Calculate Delivery */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Step 3</span>
                <h4 className="text-lg font-black text-[#0B1E38]">Auto Freight &amp; Delivery Engine</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculates freight using Florida DOT multi-section transport brackets, mileage rates, and escort requirements.
                </p>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Delivery Destination Address *</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. 6645 W Erlen Ln, Homosassa, FL 34446"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Delivery Route Type</label>
                    <select
                      value={deliveryRouteType}
                      onChange={(e) => setDeliveryRouteType(e.target.value as any)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                    >
                      <option value="dealer_to_customer">Dealership to Customer Site (Brooksville Lot)</option>
                      <option value="factory_to_customer">Factory Direct to Customer Site</option>
                      <option value="factory_to_dealer">Factory to Dealership Lot</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAutoCalculateDelivery}
                    disabled={isCalculatingDelivery}
                    className="px-5 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <span>{isCalculatingDelivery ? 'Calculating...' : '⚡ Auto Calculate Delivery & Freight'}</span>
                  </button>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Origin: 9011 McIntyre Rd, Brooksville, FL 34601
                  </span>
                </div>

                {deliveryCalculation && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Distance:</span>
                      <span className="font-bold text-slate-900">{deliveryCalculation.miles} miles ({deliveryCalculation.durationText})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Transport Sides:</span>
                      <span className="font-bold text-slate-900">{deliveryCalculation.transportSides} {deliveryCalculation.transportSides > 1 ? 'Sides (Double Wide)' : 'Single Carrier'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Escort Vehicles:</span>
                      <span className="font-bold text-slate-900">{deliveryCalculation.escortCount} Escort(s)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Freight Price:</span>
                      <span className="font-black text-[#1E6FA8] text-sm">${deliveryCalculation.totalFreightPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Dropdown Line Items */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Step 4</span>
                  <h4 className="text-lg font-black text-[#0B1E38]">Service Catalog &amp; Dropdown Line Items</h4>
                  <p className="text-xs text-slate-500">
                    Add mandatory services, site work, A/C heat pump matrices, permits, well/septic, and custom line items.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCatalogSku}
                    onChange={(e) => setSelectedCatalogSku(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white max-w-xs"
                  >
                    {SERVICE_CATALOG.map((s) => (
                      <option key={s.sku} value={s.sku}>
                        {s.name} - ${s.defaultPrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCatalogLineItem}
                    className="px-3.5 py-1.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    + Add Item
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomLineItem}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer border border-slate-200"
                  >
                    + Custom
                  </button>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600">
                      <th className="py-2.5 px-3">Service / Line Item</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Unit Price ($)</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Total ($)</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateLineItem(item.id, { name: e.target.value })}
                            className="font-bold text-xs text-slate-900 w-full bg-transparent outline-none focus:underline"
                          />
                          <div className="text-[10px] text-slate-400 truncate max-w-sm">{item.description}</div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLineItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                            className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateLineItem(item.id, { quantity: Number(e.target.value) || 1 })}
                            className="w-14 px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </td>
                        <td className="py-2 px-3 font-black text-slate-900">
                          ${item.totalPrice.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="text-rose-500 hover:text-rose-700 font-bold p-1 cursor-pointer"
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

          {/* STEP 5: Summary & Totals (Customer Totals + 3% Florida Sales Tax + Internal Only Metrics) */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Step 5</span>
                <h4 className="text-lg font-black text-[#0B1E38]">Formal Proposal Summary &amp; Financial Totals</h4>
                <p className="text-xs text-slate-500">
                  Verified breakdown matching the Easy HomeSource ERP spreadsheet with 3% Florida sales tax and internal metrics.
                </p>
              </div>

              {/* Customer-Facing Summary Breakdown */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-[1.75rem] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Customer Facing</span>
                    <h5 className="font-extrabold text-sm text-slate-900">
                      {customHomeName} • {deliveryAddress}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Total</span>
                    <span className="text-xl font-black text-[#0F2A47]">
                      ${quoteTotals.estimated_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Breakdown Line Items */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Home:</span>
                    <span className="font-semibold">${subtotalHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Delivery:</span>
                    <span className="font-semibold">${subtotalFreight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Site Work:</span>
                    <span className="font-semibold">${subtotalSiteWork.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Add-ons:</span>
                    <span className="font-semibold">${subtotalAddOns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="my-2 border-t border-slate-200" />

                  <div className="flex justify-between text-slate-800 font-bold">
                    <span>Subtotal:</span>
                    <span>${quoteTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Financed subtotal:</span>
                    <span>${quoteTotals.financed_subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Non-financed subtotal:</span>
                    <span>${quoteTotals.non_financed_subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax basis:</span>
                    <span>${quoteTotals.tax_basis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-bold">
                    <span>3% sales tax (3.00%):</span>
                    <span className="text-[#1E6FA8]">${quoteTotals.sales_tax_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {/* Prominent Navy Estimated Total Banner matching screenshot */}
                  <div className="flex items-center justify-between rounded-xl bg-[#0F2A47] text-white px-4 py-3 mt-3 shadow-md">
                    <span className="text-xs uppercase tracking-wider font-extrabold">ESTIMATED TOTAL</span>
                    <span className="font-black text-2xl tracking-tight">
                      ${quoteTotals.estimated_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* INTERNAL ONLY Section matching screenshot */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  INTERNAL ONLY (Dealership &amp; Commission Breakdown)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Factory cost:</span>
                    <span className="font-bold text-slate-900">${quoteTotals.factory_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Calculated EHS price:</span>
                    <span className="font-bold text-slate-900">${quoteTotals.ehs_price_calculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">House gross margin:</span>
                    <span className="font-bold text-slate-900">${quoteTotals.house_gross_margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Commissionable margin:</span>
                    <span className={`font-bold ${quoteTotals.commissionable_house_margin < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      ${quoteTotals.commissionable_house_margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Service profit:</span>
                    <span className="font-bold text-emerald-700">${quoteTotals.service_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Admin fee (5%):</span>
                    <span className="font-bold text-slate-900">${quoteTotals.admin_fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Loan fee:</span>
                    <span className="font-bold text-slate-900">${quoteTotals.loan_fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Salesperson comm (20%):</span>
                    <span className="font-bold text-slate-900">${quoteTotals.salesperson_commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1))}
            disabled={step === 1}
            className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold rounded-xl border border-slate-200 cursor-pointer"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('DRAFT')}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs cursor-pointer"
            >
              Save as Draft
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => ((prev + 1) as any))}
                className="px-5 py-2 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Next Step →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave('SENT_TO_BUYER')}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                ✓ Finalize &amp; Save to Library
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { homes } from '@/data/homes';
import type { Property } from '@/types/property';
import { SERVICE_CATALOG, autoCalculateDelivery, type ServiceCatalogItem, type DeliveryCalculationResult } from '@/data/pricingSpreadsheet';

export interface SelectedQuoteLineItem {
  id: string;
  sku: string;
  name: string;
  category: 'mandatory_services' | 'site_work' | 'addons' | 'options' | 'custom';
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  description: string;
}

export interface SavedQuote {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  homeModel: string;
  homePrice: number;
  homeWidth: number;
  propertyAddress: string;
  propertyPrice: number;
  siteWorkTotal: number;
  freightDelivery: number;
  deliveryMiles: number;
  deliveryRouteType: string;
  acSystem: number;
  permitsFees: number;
  skirtingSteps: number;
  totalTurnkeyPrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  estimatedMonthlyPayment: number;
  salesperson: string;
  status: 'DRAFT' | 'SENT_TO_BUYER' | 'LENDER_REVIEW' | 'APPROVED' | 'IN_CONTRACT';
  lineItems: SelectedQuoteLineItem[];
  notes: string;
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
  initialHomeModel = 'tulip',
  initialPropertyId = '',
  availableProperties,
  existingQuote = null
}: ManualQuoteBuilderModalProps) {
  // Step state (1: Customer -> 2: Home & Land -> 3: Delivery -> 4: Line Items -> 5: Financing)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Customer
  const [customerName, setCustomerName] = useState(initialCustomerName || existingQuote?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(existingQuote?.customerPhone || '352-555-0199');
  const [customerEmail, setCustomerEmail] = useState(existingQuote?.customerEmail || '');
  const [salesperson, setSalesperson] = useState(existingQuote?.salesperson || 'Ken License');

  // Selected Home (from all 28+ homes)
  const [homeSearch, setHomeSearch] = useState('');
  const [selectedHomeSlug, setSelectedHomeSlug] = useState(existingQuote?.homeModel ? 'custom' : initialHomeModel || 'tulip');
  const selectedHome = homes.find((h) => h.slug === selectedHomeSlug) || homes[0];
  const [customHomeName, setCustomHomeName] = useState(existingQuote?.homeModel || selectedHome?.displayName || selectedHome?.name || 'Manufactured Home');
  const [customHomePrice, setCustomHomePrice] = useState<number>(existingQuote?.homePrice ?? selectedHome?.startingPrice ?? 39888);
  const [homePriceOverrideReason, setHomePriceOverrideReason] = useState<string>('');

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

  // Delivery & Freight Calculation
  const [deliveryRouteType, setDeliveryRouteType] = useState<'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer'>('dealer_to_customer');
  const [deliveryMiles, setDeliveryMiles] = useState<number>(existingQuote?.deliveryMiles || 25);
  const [deliveryCalculation, setDeliveryCalculation] = useState<DeliveryCalculationResult | null>(null);
  const [freightPrice, setFreightPrice] = useState<number>(existingQuote?.freightDelivery || 3850);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  // Itemized Line Items
  const [lineItems, setLineItems] = useState<SelectedQuoteLineItem[]>([
    {
      id: 'item-1',
      sku: 'SITE-BLOCK-TIEDOWN',
      name: 'Block & Hurricane Tie-Down Installation',
      category: 'mandatory_services',
      unitPrice: 4500,
      quantity: 1,
      totalPrice: 4500,
      description: 'Concrete pier pads, leveling, and Florida wind zone hurricane ground anchors.'
    },
    {
      id: 'item-2',
      sku: 'HVAC-HP-3TON',
      name: '3.0-Ton Central A/C Heat Pump System',
      category: 'mandatory_services',
      unitPrice: 5555,
      quantity: 1,
      totalPrice: 5555,
      description: 'High-efficiency heat pump with digital thermostat, pad, and plenum tie-in.'
    },
    {
      id: 'item-3',
      sku: 'SITE-SKIRTING-VINYL',
      name: 'Vented Vinyl Perimeter Skirting & Steps (2 Sets)',
      category: 'mandatory_services',
      unitPrice: 3200,
      quantity: 1,
      totalPrice: 3200,
      description: 'Full perimeter vinyl skirting and 2 sets of code-compliant entrance stairs.'
    },
    {
      id: 'item-4',
      sku: 'SITE-PERMIT-PLAN',
      name: 'County Building, Zoning & Health Dept Permits',
      category: 'mandatory_services',
      unitPrice: 2650,
      quantity: 1,
      totalPrice: 2650,
      description: 'Hernando/Citrus county building permit processing and inspection fees.'
    }
  ]);

  // Selected Catalog Item Dropdown Helper
  const [selectedCatalogSku, setSelectedCatalogSku] = useState(SERVICE_CATALOG[0].sku);

  // Financing
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(existingQuote?.downPaymentPercent || 10);
  const [interestRate, setInterestRate] = useState<number>(6.875);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [notes, setNotes] = useState<string>(existingQuote?.notes || 'Standard turnkey package estimate for Central Florida.');

  useEffect(() => {
    if (selectedHome && selectedHomeSlug !== 'custom') {
      setCustomHomeName(selectedHome.displayName ?? selectedHome.name);
      setCustomHomePrice(selectedHome.startingPrice || 39888);
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

  // Filter homes in selector
  const filteredHomeCatalog = homes.filter((h) => {
    if (!homeSearch.trim()) return true;
    const text = [h.name, h.displayName, h.manufacturer, h.modelNumber, h.size].filter(Boolean).join(' ').toLowerCase();
    return text.includes(homeSearch.toLowerCase().trim());
  });

  // Calculate Turnkey Totals
  const subtotalHome = Number(customHomePrice) || 0;
  const subtotalLand = landOption === 'OWNED' ? 0 : Number(customLandPrice) || 0;
  const subtotalLineItems = lineItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  const subtotalFreight = Number(freightPrice) || 0;

  const totalTurnkeyPrice = subtotalHome + subtotalLand + subtotalLineItems + subtotalFreight;
  const downPaymentAmount = Math.round((totalTurnkeyPrice * downPaymentPercent) / 100);
  const loanPrincipal = totalTurnkeyPrice - downPaymentAmount;

  // Monthly mortgage calculation (P&I)
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;
  const estimatedMonthlyPayment =
    monthlyRate > 0
      ? Math.round(
          (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
        )
      : 0;

  // Trigger Auto Calculate Delivery Button
  const handleAutoCalculateDelivery = () => {
    setIsCalculatingDelivery(true);
    setTimeout(() => {
      const width = selectedHome?.width || 14;
      const res = autoCalculateDelivery(deliveryAddress, width, deliveryRouteType);
      setDeliveryCalculation(res);
      setDeliveryMiles(res.miles);
      setFreightPrice(res.totalFreightPrice);
      setIsCalculatingDelivery(false);
    }, 350);
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
      quantity: 1,
      totalPrice: item.defaultPrice,
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
      quantity: 1,
      totalPrice: 1500,
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
        return {
          ...item,
          ...updates,
          quantity: qty,
          unitPrice: price,
          totalPrice: qty * price
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

    const quoteNumber = existingQuote?.quoteNumber || `Q-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newQuote: SavedQuote = {
      id: existingQuote?.id || `quote-${Date.now()}`,
      quoteNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      homeModel: customHomeName,
      homePrice: subtotalHome,
      homeWidth: selectedHome?.width || 14,
      propertyAddress:
        landOption === 'OWNED'
          ? deliveryAddress || 'Customer Owned Land'
          : selectedProperty
          ? `${selectedProperty.address}, ${selectedProperty.city}`
          : deliveryAddress,
      propertyPrice: subtotalLand,
      siteWorkTotal: subtotalLineItems,
      freightDelivery: subtotalFreight,
      deliveryMiles,
      deliveryRouteType,
      acSystem: lineItems.find((i) => i.sku.includes('HVAC'))?.totalPrice || 5400,
      permitsFees: lineItems.find((i) => i.sku.includes('PERMIT'))?.totalPrice || 2650,
      skirtingSteps: lineItems.find((i) => i.sku.includes('SKIRTING'))?.totalPrice || 3200,
      totalTurnkeyPrice,
      downPaymentPercent,
      downPaymentAmount,
      estimatedMonthlyPayment,
      salesperson,
      status,
      lineItems,
      notes,
      createdAt: existingQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveQuote(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 text-xs">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-borderGray w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-ehsBlue/10 bg-gradient-to-r from-ehsNavy via-ehsDeepBlue to-ehsBlue text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shadow-xs">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Master Turnkey Quote Tool (ERP V05)
                </h3>
                <span className="bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-300/30">
                  Spreadsheet Auto-Calculation
                </span>
              </div>
              <p className="text-[11px] text-ehsLightBlue font-medium">
                Live line-item quoting: All 28+ Homes • Auto Delivery Calculation • Dropdown Line Items • Financing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 5-Step Navigation Tabs */}
        <div className="px-6 py-2.5 bg-ehsSoftBlue/60 border-b border-ehsBlue/10 flex flex-wrap items-center justify-between gap-2 font-black text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { num: 1, label: '1. Customer Info' },
              { num: 2, label: '2. All Homes & Land' },
              { num: 3, label: '3. Auto Calculate Delivery' },
              { num: 4, label: '4. Dropdown Line Items' },
              { num: 5, label: '5. Summary & Financing' }
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as any)}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  step === s.num
                    ? 'bg-ehsDeepBlue text-white shadow-xs'
                    : 'text-ehsNavy/70 hover:bg-white hover:text-ehsNavy'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-ehsNavy/50 uppercase font-black block">Live Turnkey Total</span>
            <span className="text-base font-black text-ehsNavy">
              ${totalTurnkeyPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Customer Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">Step 1</span>
                <h4 className="text-lg font-black text-ehsNavy">Customer Contact &amp; Assignment</h4>
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
                    className="w-full px-3.5 py-2 border border-borderGray rounded-xl text-xs font-bold focus:outline-none focus:border-ehsBlue focus:ring-2 focus:ring-ehsLightBlue/40"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 352-555-0199"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
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
                    className="w-full px-3.5 py-2 border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Home Consultant</label>
                  <select
                    value={salesperson}
                    onChange={(e) => setSalesperson(e.target.value)}
                    className="w-full px-3.5 py-2 border border-borderGray rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-ehsBlue"
                  >
                    <option value="Ken License">Ken License (Senior Home Consultant)</option>
                    <option value="Kristen Overstreet">Kristen Overstreet (Sales Specialist)</option>
                    <option value="Kris Kinney">Kris Kinney (Land & Project Specialist)</option>
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
                  className="w-full px-3.5 py-2 border border-borderGray rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 2: All 28+ Homes & Land Selection */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Home Selection */}
              <div className="p-5 bg-white border border-ehsBlue/10 rounded-[1.5rem] shadow-sm shadow-ehsNavy/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-borderGray/60">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">
                      All Catalog Homes ({homes.length} Models)
                    </span>
                    <h4 className="font-black text-sm text-ehsNavy">
                      1. Select Base Manufactured Home
                    </h4>
                  </div>
                  <input
                    type="text"
                    value={homeSearch}
                    onChange={(e) => setHomeSearch(e.target.value)}
                    placeholder="Search all 28+ models..."
                    className="px-3 py-1.5 border border-borderGray rounded-full text-xs font-semibold"
                  />
                </div>

                {/* 28+ Homes Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {filteredHomeCatalog.map((h) => {
                    const isSelected = selectedHomeSlug === h.slug;
                    return (
                      <div
                        key={h.slug}
                        onClick={() => {
                          setSelectedHomeSlug(h.slug);
                          setCustomHomeName(h.displayName ?? h.name);
                          setCustomHomePrice(h.startingPrice || 39888);
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-ehsBlue bg-ehsSoftBlue ring-2 ring-ehsBlue/20 shadow-xs'
                            : 'border-borderGray hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-black text-xs text-ehsNavy truncate">
                          {h.displayName ?? h.name}
                        </div>
                        <div className="text-[10.5px] text-slate-500 font-medium">
                          {h.bedrooms ? `${h.bedrooms}b / ${h.bathrooms}ba` : 'Catalog'} • {h.squareFeet || ''} sq ft
                        </div>
                        <div className="font-black text-xs text-ehsBlue mt-0.5">
                          {h.startingPrice ? `$${Math.round(h.startingPrice).toLocaleString()}` : 'Call for MSRP'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Base Home Price Input & Override Reason */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-borderGray/60">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Base Home Sales Price ($ USD) *
                    </label>
                    <input
                      type="number"
                      value={customHomePrice}
                      onChange={(e) => setCustomHomePrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-borderGray rounded-xl text-xs font-black text-ehsNavy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Price Override Reason (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Factory promotion, display markdown"
                      value={homePriceOverrideReason}
                      onChange={(e) => setHomePriceOverrideReason(e.target.value)}
                      className="w-full px-3 py-1.5 border border-borderGray rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Land Selection */}
              <div className="p-5 bg-white border border-ehsBlue/10 rounded-[1.5rem] shadow-sm shadow-ehsNavy/5 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-borderGray/60">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">
                      Property Center Integration
                    </span>
                    <h4 className="font-black text-sm text-ehsNavy">
                      2. Land &amp; Homesite Option
                    </h4>
                  </div>
                  <span className="font-black text-xs text-ehsNavy">
                    Land Price: ${subtotalLand.toLocaleString()}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLandOption('PORTAL_PROPERTY')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      landOption === 'PORTAL_PROPERTY'
                        ? 'border-ehsBlue bg-ehsSoftBlue ring-2 ring-ehsBlue/20 shadow-xs'
                        : 'border-borderGray hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-black text-xs text-ehsNavy">
                      📍 Package with Property Center Parcel
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Select available parcel from Homosassa, Spring Hill, Brooksville, or New Port Richey.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLandOption('OWNED')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      landOption === 'OWNED'
                        ? 'border-ehsBlue bg-ehsSoftBlue ring-2 ring-ehsBlue/20 shadow-xs'
                        : 'border-borderGray hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-black text-xs text-ehsNavy">
                      🏡 Customer Owns Land (Home-Only Setup)
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Land purchase is $0. We configure site prep, well/septic &amp; freight directly on their lot.
                    </p>
                  </button>
                </div>

                {landOption === 'PORTAL_PROPERTY' && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Choose Available Homesite
                      </label>
                      <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-borderGray rounded-xl text-xs font-bold bg-white"
                      >
                        {availableProperties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.address} ({p.city}, {p.county} Co.) - {p.price ? `$${p.price.toLocaleString()}` : 'Custom'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Land Price ($ USD)
                      </label>
                      <input
                        type="number"
                        value={customLandPrice}
                        onChange={(e) => setCustomLandPrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-borderGray rounded-xl text-xs font-bold"
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
                <span className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">Step 3</span>
                <h4 className="text-lg font-black text-ehsNavy">
                  Freight &amp; Delivery Engine (Auto Calculation)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculate freight transport, transport sides, wide-load escorts, and route mileage from Brooksville HQ.
                </p>
              </div>

              <div className="p-5 bg-white border border-ehsBlue/10 rounded-[1.5rem] shadow-sm shadow-ehsNavy/5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Delivery Route Type
                    </label>
                    <select
                      value={deliveryRouteType}
                      onChange={(e) => setDeliveryRouteType(e.target.value as any)}
                      className="w-full px-3.5 py-2 border border-borderGray rounded-xl font-bold bg-white text-xs"
                    >
                      <option value="dealer_to_customer">Dealership (Brooksville) to Customer Site</option>
                      <option value="factory_to_customer">Factory Plant directly to Customer Site</option>
                      <option value="factory_to_dealer">Factory Plant to Dealership Display Lot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Destination Delivery Address
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. 6645 W Erlen Ln, Homosassa, FL 34446"
                      className="w-full px-3.5 py-2 border border-borderGray rounded-xl font-semibold text-xs"
                    />
                  </div>
                </div>

                {/* Auto Calculate Delivery Button */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAutoCalculateDelivery}
                    disabled={isCalculatingDelivery}
                    className="px-6 py-2.5 bg-ehsBlue hover:bg-ehsDeepBlue text-white font-black rounded-full shadow-md text-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <span>{isCalculatingDelivery ? '⚡ Calculating...' : '⚡ Auto Calculate Delivery'}</span>
                  </button>

                  <span className="text-xs font-bold text-slate-500">
                    Calculated Freight Price: <strong className="text-ehsNavy text-sm">${freightPrice.toLocaleString()}</strong>
                  </span>
                </div>

                {/* Auto Calculation Result Output */}
                {deliveryCalculation && (
                  <div className="p-4 bg-ehsSoftBlue/70 border border-ehsBlue/20 rounded-2xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between font-black text-ehsNavy">
                      <span>✓ Route Calculation Verified</span>
                      <span>{deliveryCalculation.miles} Miles ({deliveryCalculation.durationText})</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                      <div className="p-2 bg-white rounded-lg border border-ehsBlue/10">
                        <span className="text-slate-400 block">Transport Sides:</span>
                        <span className="font-black text-ehsNavy">{deliveryCalculation.transportSides} Side(s)</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-ehsBlue/10">
                        <span className="text-slate-400 block">Escort Vehicles:</span>
                        <span className="font-black text-ehsNavy">{deliveryCalculation.escortCount} Escort(s)</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-ehsBlue/10">
                        <span className="text-slate-400 block">Base Haul Rate:</span>
                        <span className="font-black text-ehsNavy">${deliveryCalculation.baseHaulCost.toLocaleString()}</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-ehsBlue/10">
                        <span className="text-slate-400 block">Total Freight Price:</span>
                        <span className="font-black text-emerald-700">${deliveryCalculation.totalFreightPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {deliveryCalculation.warning && (
                      <p className="text-[11px] text-amber-800 font-semibold pt-1">
                        ⚠️ {deliveryCalculation.warning}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Dropdown Line Items & Site Work */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">Step 4</span>
                  <h4 className="text-lg font-black text-ehsNavy">
                    Itemized Site Work, Utilities &amp; Add-Ons
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add standard services from catalog dropdown or insert custom line items.
                  </p>
                </div>
                <div className="font-black text-sm text-ehsNavy">
                  Site Work Total: <strong className="text-ehsBlue">${subtotalLineItems.toLocaleString()}</strong>
                </div>
              </div>

              {/* Line Item Dropdown Adder */}
              <div className="p-4 bg-ehsSoftBlue/50 border border-ehsBlue/15 rounded-2xl flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-[11px] font-bold text-ehsNavy mb-1">
                    Select Line Item from Service Catalog Dropdown
                  </label>
                  <select
                    value={selectedCatalogSku}
                    onChange={(e) => setSelectedCatalogSku(e.target.value)}
                    className="w-full px-3 py-2 border border-borderGray rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-ehsBlue"
                  >
                    {SERVICE_CATALOG.map((item) => (
                      <option key={item.sku} value={item.sku}>
                        [{item.categoryTitle}] {item.name} (${item.defaultPrice.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-2 pt-4 sm:pt-0">
                  <button
                    type="button"
                    onClick={handleAddCatalogLineItem}
                    className="px-4 py-2 bg-ehsBlue hover:bg-ehsDeepBlue text-white font-black rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    + Add Dropdown Item
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomLineItem}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-borderGray text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    + Custom Item
                  </button>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="bg-white border border-ehsBlue/10 rounded-2xl shadow-sm shadow-ehsNavy/5 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-borderGray bg-slate-50 text-[11px] font-black text-ehsNavy uppercase">
                      <th className="py-2.5 px-3">Service / Line Item</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 w-28">Unit Price ($)</th>
                      <th className="py-2.5 px-3 w-20">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total ($)</th>
                      <th className="py-2.5 px-3 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-ehsSoftBlue/20">
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateLineItem(item.id, { name: e.target.value })}
                            className="w-full font-bold text-slate-900 bg-transparent outline-none focus:bg-white px-1 rounded"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-semibold text-[10.5px]">
                          {item.category.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdateLineItem(item.id, { unitPrice: Number(e.target.value) })
                            }
                            className="w-24 px-2 py-1 border border-borderGray rounded-lg font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateLineItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })
                            }
                            className="w-16 px-2 py-1 border border-borderGray rounded-lg font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                          ${(item.totalPrice || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold text-sm cursor-pointer"
                            title="Remove Line Item"
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

          {/* STEP 5: Summary & Financing Calculator */}
          {step === 5 && (
            <div className="space-y-6">
              {/* Grand Turnkey Quote Summary Card */}
              <div className="p-6 bg-gradient-to-br from-ehsNavy via-ehsDeepBlue to-ehsBlue text-white rounded-[2rem] shadow-lg shadow-ehsNavy/15 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/15">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ehsLightBlue">
                      Formal Proposal Summary
                    </span>
                    <h3 className="text-2xl font-black text-white">{customerName}</h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      {customHomeName} • {deliveryAddress}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-white/70 uppercase font-bold block">
                      Total Turnkey Investment
                    </span>
                    <span className="text-3xl font-black text-emerald-300">
                      ${totalTurnkeyPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 4 Key Pillars Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                    <span className="text-[10px] text-white/70 block font-bold">1. Base Home</span>
                    <span className="text-base font-black text-white">${subtotalHome.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                    <span className="text-[10px] text-white/70 block font-bold">2. Land / Lot</span>
                    <span className="text-base font-black text-white">${subtotalLand.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                    <span className="text-[10px] text-white/70 block font-bold">3. Freight Delivery</span>
                    <span className="text-base font-black text-white">${subtotalFreight.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                    <span className="text-[10px] text-white/70 block font-bold">4. Site Prep &amp; Utilities</span>
                    <span className="text-base font-black text-white">${subtotalLineItems.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Financing Calculator */}
              <div className="p-5 bg-white border border-ehsBlue/10 rounded-[1.75rem] shadow-sm shadow-ehsNavy/5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-borderGray/60">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">
                      Florida Lender Calculator
                    </span>
                    <h4 className="font-black text-sm text-ehsNavy">
                      Combined Land-Home Monthly Mortgage (P&amp;I)
                    </h4>
                  </div>
                  <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Est. ${estimatedMonthlyPayment}/month
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Down Payment ({downPaymentPercent}%)
                    </label>
                    <input
                      type="number"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-borderGray rounded-xl text-xs font-bold"
                    />
                    <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                      Required Cash: ${downPaymentAmount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.125"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-borderGray rounded-xl text-xs font-bold"
                    />
                    <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                      Finance Principal: ${loanPrincipal.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Loan Term
                    </label>
                    <select
                      value={loanTermYears}
                      onChange={(e) => setLoanTermYears(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-borderGray rounded-xl text-xs font-bold bg-white"
                    >
                      <option value={30}>30 Years (360 Months)</option>
                      <option value={20}>20 Years (240 Months)</option>
                      <option value={15}>15 Years (180 Months)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-ehsBlue/10 bg-ehsSoftBlue/40 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-5 py-2.5 bg-white border border-borderGray text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-slate-500 font-bold hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-6 py-2.5 bg-ehsBlue hover:bg-ehsDeepBlue text-white font-black rounded-full transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
              >
                Next Step →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave('DRAFT')}
                  className="px-5 py-2.5 bg-white border border-borderGray text-slate-700 font-bold rounded-full hover:bg-slate-50 cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('SENT_TO_BUYER')}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-full shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  ✓ Finalize &amp; Save to Library
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

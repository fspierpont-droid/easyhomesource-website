'use client';

import React, { useState, useEffect } from 'react';
import { homes } from '@/data/homes';
import type { Property } from '@/types/property';

export interface SavedQuote {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  homeModel: string;
  homePrice: number;
  propertyAddress: string;
  propertyPrice: number;
  siteWorkTotal: number;
  freightDelivery: number;
  acSystem: number;
  permitsFees: number;
  skirtingSteps: number;
  totalTurnkeyPrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  estimatedMonthlyPayment: number;
  salesperson: string;
  status: 'DRAFT' | 'SENT_TO_BUYER' | 'LENDER_REVIEW' | 'APPROVED' | 'IN_CONTRACT';
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
}

export function ManualQuoteBuilderModal({
  isOpen,
  onClose,
  onSaveQuote,
  initialCustomerName = '',
  initialHomeModel = 'tulip',
  initialPropertyId = '',
  availableProperties
}: ManualQuoteBuilderModalProps) {
  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Customer
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState('352-555-0199');
  const [customerEmail, setCustomerEmail] = useState('');
  const [salesperson, setSalesperson] = useState('Ken License');

  // Selected Home
  const [selectedHomeSlug, setSelectedHomeSlug] = useState(initialHomeModel || 'tulip');
  const selectedHome = homes.find((h) => h.slug === selectedHomeSlug) || homes[0];
  const [customHomePrice, setCustomHomePrice] = useState<number>(
    selectedHome?.startingPrice || 39888
  );

  // Selected Property
  const [landOption, setLandOption] = useState<'OWNED' | 'PORTAL_PROPERTY'>('PORTAL_PROPERTY');
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    initialPropertyId || availableProperties[0]?.id || ''
  );
  const selectedProperty = availableProperties.find((p) => p.id === selectedPropertyId);
  const [customLandPrice, setCustomLandPrice] = useState<number>(
    selectedProperty?.price || 49900
  );

  // Site Work & Turnkey Line Items
  const [freightDelivery, setFreightDelivery] = useState<number>(3850);
  const [foundationSetup, setFoundationSetup] = useState<number>(4500);
  const [waterSystem, setWaterSystem] = useState<number>(7500); // Well
  const [sewerSystem, setSewerSystem] = useState<number>(6800); // Septic
  const [electricHookup, setElectricHookup] = useState<number>(2200);
  const [acHeatPump, setAcHeatPump] = useState<number>(5400);
  const [skirtingAndSteps, setSkirtingAndSteps] = useState<number>(3200);
  const [countyPermits, setCountyPermits] = useState<number>(2650);
  const [optionalUpgrades, setOptionalUpgrades] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Standard turnkey setup for Hernando County.');

  // Financing
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(10);
  const [interestRate, setInterestRate] = useState<number>(6.875);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  useEffect(() => {
    if (selectedHome) {
      setCustomHomePrice(selectedHome.startingPrice || 39888);
    }
  }, [selectedHomeSlug, selectedHome]);

  useEffect(() => {
    if (selectedProperty && landOption === 'PORTAL_PROPERTY') {
      setCustomLandPrice(selectedProperty.price || 49900);
    } else if (landOption === 'OWNED') {
      setCustomLandPrice(0);
    }
  }, [selectedPropertyId, landOption, selectedProperty]);

  if (!isOpen) return null;

  // Real-time Turnkey Math
  const subtotalHome = Number(customHomePrice) || 0;
  const subtotalLand = landOption === 'OWNED' ? 0 : Number(customLandPrice) || 0;
  const siteWorkTotal =
    Number(freightDelivery) +
    Number(foundationSetup) +
    Number(waterSystem) +
    Number(sewerSystem) +
    Number(electricHookup) +
    Number(acHeatPump) +
    Number(skirtingAndSteps) +
    Number(countyPermits) +
    Number(optionalUpgrades);

  const totalTurnkeyPrice = subtotalHome + subtotalLand + siteWorkTotal;
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

  const handleSave = (status: 'DRAFT' | 'SENT_TO_BUYER' | 'APPROVED' = 'SENT_TO_BUYER') => {
    if (!customerName.trim()) {
      alert('Please provide customer name.');
      return;
    }

    const quoteNumber = `Q-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newQuote: SavedQuote = {
      id: `quote-${Date.now()}`,
      quoteNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      homeModel: selectedHome?.displayName ?? selectedHome?.name ?? 'Manufactured Home',
      homePrice: subtotalHome,
      propertyAddress:
        landOption === 'OWNED'
          ? 'Buyer Owned Land (Florida)'
          : selectedProperty
          ? `${selectedProperty.address}, ${selectedProperty.city}`
          : 'Central Florida Homesite',
      propertyPrice: subtotalLand,
      siteWorkTotal,
      freightDelivery,
      acSystem: acHeatPump,
      permitsFees: countyPermits,
      skirtingSteps: skirtingAndSteps,
      totalTurnkeyPrice,
      downPaymentPercent,
      downPaymentAmount,
      estimatedMonthlyPayment,
      salesperson,
      status,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveQuote(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-[#0B1E38] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shadow-xs">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-white">
                  Master Turnkey Quote Builder
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-400/30">
                  QS Engine V05
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Generate itemized turnkey pricing: Home + Land + Freight + Site Prep + Permitting + Financing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: '1. Buyer Details' },
              { num: 2, label: '2. Home & Land' },
              { num: 3, label: '3. Site Work & Turnkey' },
              { num: 4, label: '4. Summary & Financing' }
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  step === s.num
                    ? 'bg-[#0B4F86] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Total</span>
            <span className="text-sm font-black text-slate-900">
              ${totalTurnkeyPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: Buyer Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900">
                Customer Contact & Consultant Assignment
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4F86]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 352-555-0199"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4F86]"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4F86]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Salesperson</label>
                  <select
                    value={salesperson}
                    onChange={(e) => setSalesperson(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0B4F86] bg-white"
                  >
                    <option value="Ken License">Ken License (Senior Home Consultant)</option>
                    <option value="Kristen Overstreet">Kristen Overstreet (Sales Specialist)</option>
                    <option value="Kris Kinney">Kris Kinney (Land & Project Specialist)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Summary Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes about buyer timing, land condition, trade-ins, or preferred lenders..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Home & Land */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Home Selection */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                    1. Select Manufactured Home Model
                  </h4>
                  <span className="text-xs font-bold text-[#0B4F86]">
                    MSRP: ${subtotalHome.toLocaleString()}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  {homes.slice(0, 6).map((h) => {
                    const isSelected = selectedHomeSlug === h.slug;
                    return (
                      <div
                        key={h.slug}
                        onClick={() => setSelectedHomeSlug(h.slug)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0B4F86] bg-white ring-2 ring-[#0B4F86]/20 shadow-xs'
                            : 'border-slate-200 bg-white/60 hover:bg-white'
                        }`}
                      >
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {h.displayName ?? h.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {h.bedrooms}b / {h.bathrooms}ba • {h.squareFeet} sq ft
                        </div>
                        <div className="font-black text-xs text-[#0B4F86] mt-1">
                          ${(h.startingPrice || 39888).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Base Home Price ($ USD)
                    </label>
                    <input
                      type="number"
                      value={customHomePrice}
                      onChange={(e) => setCustomHomePrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Selected Builder
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedHome?.manufacturer || 'Clayton TRU / Cavco'}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Land Selection */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                    2. Select Homesite / Land Option
                  </h4>
                  <span className="text-xs font-bold text-[#0B4F86]">
                    Land Price: ${subtotalLand.toLocaleString()}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLandOption('PORTAL_PROPERTY')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      landOption === 'PORTAL_PROPERTY'
                        ? 'border-[#0B4F86] bg-white ring-2 ring-[#0B4F86]/20'
                        : 'border-slate-200 bg-white/60'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">
                      📍 Pair with Property Center Parcel
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Select an available lot from the single source database.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLandOption('OWNED')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      landOption === 'OWNED'
                        ? 'border-[#0B4F86] bg-white ring-2 ring-[#0B4F86]/20'
                        : 'border-slate-200 bg-white/60'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">
                      🏡 Customer Already Owns Property
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Land purchase cost is $0 (Home-only setup on private land).
                    </p>
                  </button>
                </div>

                {landOption === 'PORTAL_PROPERTY' && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Choose Available Parcel
                      </label>
                      <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white"
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
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Site Work & Turnkey Items */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Itemized Turnkey Site Work & Logistics
                </h4>
                <span className="font-black text-xs text-[#0B4F86]">
                  Site Work Total: ${siteWorkTotal.toLocaleString()}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Factory Freight & Transport</span>
                    <span>${freightDelivery.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={freightDelivery}
                    onChange={(e) => setFreightDelivery(Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Transport from plant to Florida site.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Blocking, Tie-Downs & Setup</span>
                    <span>${foundationSetup.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={foundationSetup}
                    onChange={(e) => setFoundationSetup(Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Concrete pier pads & anchoring.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Water Connection / Well Drilling</span>
                    <span>${waterSystem.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={waterSystem}
                    onChange={(e) => setWaterSystem(Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold bg-white"
                  />
                  <p className="text-[10px] text-slate-400">4-inch deep well with pump & pressure tank.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Septic System Installation</span>
                    <span>${sewerSystem.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={sewerSystem}
                    onChange={(e) => setSewerSystem(Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Standard 900-1050 gal tank with drain field.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Central A/C & Heat Pump System</span>
                    <span>${acHeatPump.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={acHeatPump}
                    onChange={(e) => setAcHeatPump(Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold bg-white"
                  />
                  <p className="text-[10px] text-slate-400">High-efficiency Florida climate HVAC.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Vinyl Skirting & Steps</span>
                    <span>${skirtingAndSteps.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={skirtingAndSteps}
                    onChange={(e) => setSkirtingAndSteps(Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Front & rear fiberglass/wood stairs + skirting.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>County Permits & Impact Fees</span>
                    <span>${countyPermits.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={countyPermits}
                    onChange={(e) => setCountyPermits(Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Building, zoning, and health dept permits.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Electric Drop & Hookup</span>
                    <span>${electricHookup.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={electricHookup}
                    onChange={(e) => setElectricHookup(Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold bg-white"
                  />
                  <p className="text-[10px] text-slate-400">200 Amp service meter connection.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Summary & Financing */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Grand Summary Card */}
              <div className="p-5 bg-gradient-to-br from-[#0B1E38] to-[#0B4F86] text-white rounded-2xl shadow-md space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-white/20">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ehsLightBlue tracking-wider">
                      Turnkey Project Quote
                    </span>
                    <h3 className="text-xl font-black text-white">{customerName}</h3>
                    <p className="text-xs text-white/80">
                      {selectedHome?.displayName ?? selectedHome?.name} • {selectedProperty?.address || 'Private Homesite'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/70 block">Total Turnkey Investment</span>
                    <span className="text-2xl font-black text-emerald-300">
                      ${totalTurnkeyPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Line Item Breakdown */}
                <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <span className="text-[10px] text-white/70 block">Home Price</span>
                    <span className="font-bold text-white">${subtotalHome.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <span className="text-[10px] text-white/70 block">Land / Homesite</span>
                    <span className="font-bold text-white">${subtotalLand.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <span className="text-[10px] text-white/70 block">Site Work & Freight</span>
                    <span className="font-bold text-white">${siteWorkTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Financing Estimator */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Combined Monthly Mortgage Estimate (FHA / VA / Chattel)
                </h4>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Down Payment ({downPaymentPercent}%)
                    </label>
                    <input
                      type="number"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                      Amount: ${downPaymentAmount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.125"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white"
                    />
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Est. Monthly P&I
                    </span>
                    <span className="text-xl font-black text-emerald-700">
                      ${estimatedMonthlyPayment.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 block">/month ({loanTermYears} yrs)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-500 font-bold hover:text-slate-900"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-5 py-2 bg-[#0B4F86] hover:bg-[#083860] text-white font-bold rounded-xl transition-all shadow-xs"
              >
                Next Step →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave('DRAFT')}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('SENT_TO_BUYER')}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-all"
                >
                  ✓ Finalize &amp; Save Quote
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import type { SavedQuote } from '@/components/portal/ManualQuoteBuilderModal';
import { calculateComprehensiveQuoteTotals, type QuoteFinancialTotals } from '@/data/pricingSpreadsheet';

interface EditQuoteModalProps {
  quote: SavedQuote | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveQuote: (updatedQuote: SavedQuote) => void;
  onDeleteQuote: (id: string) => void;
}

export function EditQuoteModal({
  quote,
  isOpen,
  onClose,
  onSaveQuote,
  onDeleteQuote
}: EditQuoteModalProps) {
  const [formData, setFormData] = useState<SavedQuote | null>(null);

  useEffect(() => {
    if (quote) {
      setFormData({ ...quote });
    }
  }, [quote]);

  if (!isOpen || !formData) return null;

  const handleInputChange = (field: keyof SavedQuote, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleNumberChange = (field: keyof SavedQuote, value: string) => {
    const num = Number(value.replace(/[^0-9.]/g, '')) || 0;
    setFormData((prev) => {
      if (!prev) return null;
      const updated = { ...prev, [field]: num };

      const subtotalHome = Number(field === 'homePrice' ? num : updated.homePrice) || 0;
      const subtotalLand = Number(field === 'propertyPrice' ? num : updated.propertyPrice) || 0;
      const subtotalFreight = Number(field === 'freightDelivery' ? num : updated.freightDelivery) || 0;
      const subtotalSiteWork = Number(field === 'siteWorkTotal' ? num : updated.siteWorkTotal) || 0;
      const discounts = Number(field === 'discounts' ? num : updated.discounts) || 0;

      const totals: QuoteFinancialTotals = calculateComprehensiveQuoteTotals(
        subtotalHome,
        subtotalLand,
        subtotalFreight,
        subtotalSiteWork,
        0,
        discounts,
        updated.factoryCost || Math.round(subtotalHome * 0.72),
        Math.round(subtotalFreight / 1.1),
        Math.round(subtotalSiteWork * 0.75),
        0,
        0.03
      );

      return {
        ...updated,
        subtotal: totals.subtotal,
        taxBasis: totals.tax_basis,
        salesTax: totals.sales_tax_total,
        totalTurnkeyPrice: totals.estimated_total,
        estimatedTotal: totals.estimated_total,
        financialTotals: totals,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSaveQuote(formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to permanently delete proposal ${formData.quoteNumber} for ${formData.customerName}?`)) {
      onDeleteQuote(formData.id);
      onClose();
    }
  };

  const totals: QuoteFinancialTotals = formData.financialTotals || calculateComprehensiveQuoteTotals(
    formData.homePrice || 0,
    formData.propertyPrice || 0,
    formData.freightDelivery || 0,
    formData.siteWorkTotal || 0,
    0,
    formData.discounts || 0,
    formData.factoryCost || 0,
    0,
    0,
    0,
    0.03
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 text-xs">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#0F2A47]/20 bg-gradient-to-r from-[#0B1E38] via-[#0F2A47] to-[#1E6FA8] text-white flex items-center justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#A8C8E6] font-bold tracking-wider">
                {formData.quoteNumber}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-400/30">
                {formData.status}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-1">
              Edit Proposal: {formData.customerName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Customer & Consultant */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#1E6FA8]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#1E6FA8]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Consultant</label>
              <input
                type="text"
                value={formData.salesperson}
                onChange={(e) => handleInputChange('salesperson', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#1E6FA8]"
              />
            </div>
          </div>

          {/* Model & Site Address */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Selected Home Model</label>
              <input
                type="text"
                value={formData.homeModel}
                onChange={(e) => handleInputChange('homeModel', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#1E6FA8]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Homesite / Delivery Address</label>
              <input
                type="text"
                value={formData.propertyAddress}
                onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#1E6FA8]"
              />
            </div>
          </div>

          {/* Customer Facing Totals Panel */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Customer Facing Breakdown
              </span>
              <span className="text-xs font-bold text-[#0F2A47]">
                Florida Wind Zone II / Central FL
              </span>
            </div>

            <div className="grid sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Home Price ($)</label>
                <input
                  type="number"
                  value={formData.homePrice}
                  onChange={(e) => handleNumberChange('homePrice', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Land / Parcel ($)</label>
                <input
                  type="number"
                  value={formData.propertyPrice}
                  onChange={(e) => handleNumberChange('propertyPrice', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Delivery / Freight ($)</label>
                <input
                  type="number"
                  value={formData.freightDelivery}
                  onChange={(e) => handleNumberChange('freightDelivery', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Site Work &amp; Setup ($)</label>
                <input
                  type="number"
                  value={formData.siteWorkTotal}
                  onChange={(e) => handleNumberChange('siteWorkTotal', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                />
              </div>
            </div>

            {/* Subtotal, Tax, and Estimated Total Banner */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Home:</span>
                <span>${(formData.homePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {formData.propertyPrice > 0 && (
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>Land / Lot:</span>
                  <span>${formData.propertyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Delivery:</span>
                <span>${(formData.freightDelivery || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Site Work:</span>
                <span>${(formData.siteWorkTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="my-1.5 border-t border-slate-200" />

              <div className="flex justify-between text-slate-800 font-bold">
                <span>Subtotal:</span>
                <span>${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Financed subtotal:</span>
                <span>${totals.financed_subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Non-financed subtotal:</span>
                <span>${totals.non_financed_subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax basis:</span>
                <span>${totals.tax_basis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-bold">
                <span>3% sales tax (3.00%):</span>
                <span className="text-[#1E6FA8]">${totals.sales_tax_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Dark Navy ESTIMATED TOTAL banner */}
              <div className="flex items-center justify-between rounded-xl bg-[#0F2A47] text-white px-4 py-3 mt-2 shadow-md">
                <span className="text-xs uppercase tracking-wider font-extrabold">ESTIMATED TOTAL</span>
                <span className="font-black text-2xl tracking-tight">
                  ${totals.estimated_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* INTERNAL ONLY Section */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              INTERNAL ONLY (Margin, Service Profit, Admin &amp; Loan Fees)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Factory cost:</span>
                <span className="font-bold text-slate-900">${totals.factory_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Calculated EHS price:</span>
                <span className="font-bold text-slate-900">${totals.ehs_price_calculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">House gross margin:</span>
                <span className="font-bold text-slate-900">${totals.house_gross_margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Commissionable margin:</span>
                <span className={`font-bold ${totals.commissionable_house_margin < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  ${totals.commissionable_house_margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Service profit:</span>
                <span className="font-bold text-emerald-700">${totals.service_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Admin fee (5%):</span>
                <span className="font-bold text-slate-900">${totals.admin_fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Loan fee:</span>
                <span className="font-bold text-slate-900">${totals.loan_fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Salesperson comm (20%):</span>
                <span className="font-bold text-slate-900">${totals.salesperson_commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Proposal &amp; Project Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Delete Proposal
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0F2A47] hover:bg-[#081628] text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

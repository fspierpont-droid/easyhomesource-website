'use client';

import React, { useState, useEffect } from 'react';
import type { SavedQuote } from '@/components/portal/ManualQuoteBuilderModal';

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
      // Recalculate totals
      const total =
        (Number(updated.homePrice) || 0) +
        (Number(updated.propertyPrice) || 0) +
        (Number(updated.siteWorkTotal) || 0);

      const downPayment = Math.round((total * (Number(updated.downPaymentPercent) || 10)) / 100);
      const principal = total - downPayment;
      const monthlyRate = 6.875 / 100 / 12;
      const numPayments = 360;
      const monthly =
        monthlyRate > 0
          ? Math.round(
              (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                (Math.pow(1 + monthlyRate, numPayments) - 1)
            )
          : 0;

      return {
        ...updated,
        totalTurnkeyPrice: total,
        downPaymentAmount: downPayment,
        estimatedMonthlyPayment: monthly,
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 text-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-[#0B1E38] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-ehsLightBlue font-bold">
                {formData.quoteNumber}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                {formData.status}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              Edit Proposal: {formData.customerName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#0B4F86]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#0B4F86]"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#0B4F86]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Proposal Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white focus:outline-none focus:border-[#0B4F86]"
              >
                <option value="DRAFT">Draft</option>
                <option value="SENT_TO_BUYER">Sent to Buyer</option>
                <option value="LENDER_REVIEW">Lender Review</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_CONTRACT">In Contract</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Selected Home Model</label>
              <input
                type="text"
                value={formData.homeModel}
                onChange={(e) => handleInputChange('homeModel', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#0B4F86]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Homesite / Property Address</label>
              <input
                type="text"
                value={formData.propertyAddress}
                onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#0B4F86]"
              />
            </div>
          </div>

          {/* Pricing Line Items */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase">
              Financial Breakdown Line Items
            </h4>
            <div className="grid sm:grid-cols-3 gap-3">
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
                <label className="block font-medium text-slate-600 mb-0.5">Land Price ($)</label>
                <input
                  type="number"
                  value={formData.propertyPrice}
                  onChange={(e) => handleNumberChange('propertyPrice', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Site Work Total ($)</label>
                <input
                  type="number"
                  value={formData.siteWorkTotal}
                  onChange={(e) => handleNumberChange('siteWorkTotal', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900 font-black">
              <span>Total Turnkey Price:</span>
              <span className="text-base text-emerald-700">
                ${formData.totalTurnkeyPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
              <span>Est. Monthly Payment (P&I):</span>
              <span className="font-bold text-slate-800">
                ${formData.estimatedMonthlyPayment}/month
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Proposal & Lender Notes</label>
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
              className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"
            >
              Delete Proposal
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0B4F86] hover:bg-[#083860] text-white font-bold rounded-xl shadow-xs"
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

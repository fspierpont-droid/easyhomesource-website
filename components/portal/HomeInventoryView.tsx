'use client';

import React, { useState } from 'react';
import type { DisplayHomeRecord, DisplayStatus } from '@/types/displayInventory';
import { INITIAL_DISPLAY_INVENTORY } from '@/types/displayInventory';

export function HomeInventoryView() {
  const [displayHomes, setDisplayHomes] = useState<DisplayHomeRecord[]>(INITIAL_DISPLAY_INVENTORY);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingHome, setEditingHome] = useState<DisplayHomeRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Auto-calculated Floorplan Metrics
  const totalFloorplanFinanced = displayHomes.reduce((acc, h) => acc + (h.financeAmount || 0), 0);
  const totalTransportCost = displayHomes.reduce((acc, h) => acc + (h.transportCost || 0), 0);
  const totalSetupCost = displayHomes.reduce((acc, h) => acc + (h.lotSetupCost || 0), 0);
  const onLotCount = displayHomes.filter((h) => h.displayStatus === 'ON_LOT_DISPLAY').length;

  const filteredList = displayHomes.filter((h) => {
    if (statusFilter !== 'ALL' && h.displayStatus !== statusFilter) return false;
    if (!search.trim()) return true;
    const text = [
      h.stockNumber,
      h.modelName,
      h.manufacturer,
      h.serialNumber,
      h.bankUsed,
      h.padLocation,
      h.keyBoxCode,
      h.notes
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return text.includes(search.toLowerCase().trim());
  });

  const getStatusBadge = (status: DisplayStatus) => {
    switch (status) {
      case 'ON_LOT_DISPLAY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SETUP_IN_PROGRESS':
        return 'bg-blue-50 text-[#0B4F86] border-blue-200';
      case 'IN_TRANSIT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ORDERED_AT_FACTORY':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const handleSaveHome = (updated: DisplayHomeRecord) => {
    setDisplayHomes((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    setEditingHome(null);
  };

  const handleDeleteHome = (id: string) => {
    if (confirm('Are you sure you want to decommission this display unit record?')) {
      setDisplayHomes((prev) => prev.filter((h) => h.id !== id));
      setEditingHome(null);
    }
  };

  const handleCreateDisplayHome = (newRecord: Partial<DisplayHomeRecord>) => {
    const nextNum = displayHomes.length + 1;
    const record: DisplayHomeRecord = {
      id: `disp-${Date.now()}`,
      stockNumber: `DISP-2026-${String(nextNum).padStart(2, '0')}`,
      modelName: newRecord.modelName || 'New Display Model',
      manufacturer: newRecord.manufacturer || 'Clayton TRU',
      serialNumber: newRecord.serialNumber || `FL-${Date.now()}`,
      dimensions: newRecord.dimensions || "14' x 60'",
      beds: newRecord.beds || 2,
      baths: newRecord.baths || 2,
      squareFeet: newRecord.squareFeet || 790,
      displayStatus: newRecord.displayStatus || 'ON_LOT_DISPLAY',
      padLocation: newRecord.padLocation || 'Pad # - Highway Display',
      orderDate: newRecord.orderDate || new Date().toISOString().split('T')[0],
      deliveryDate: newRecord.deliveryDate || new Date().toISOString().split('T')[0],
      bankUsed: newRecord.bankUsed || '21st Mortgage Floorplan',
      financeAmount: newRecord.financeAmount || 45000,
      wholesaleInvoice: newRecord.wholesaleInvoice || 43500,
      transportCost: newRecord.transportCost || 3500,
      lotSetupCost: newRecord.lotSetupCost || 4000,
      interestRateFloorplan: newRecord.interestRateFloorplan || 7.25,
      optionsIncluded: newRecord.optionsIncluded || ['Standard Display Options Package'],
      notes: newRecord.notes || 'Display home on Brooksville lot.',
      keyBoxCode: newRecord.keyBoxCode || '4920',
      updatedAt: new Date().toISOString()
    };

    setDisplayHomes((prev) => [record, ...prev]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0284c7]">
            DEALERSHIP FLOORPLAN &amp; DISPLAY ALLOCATIONS
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5">
            Home Inventory &amp; Display Tracker ({displayHomes.length} Ordered Units)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Internal inventory: Track wholesale orders, serial/VIN numbers, floorplan lenders, financed balances, transport freight, and display staging in Brooksville (Not for sale).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Add Display Order</span>
        </button>
      </div>

      {/* 4 Financial & Operational Floorplan Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500">Floorplan Drawn Balance</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              🏦
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 tracking-tight">
            ${totalFloorplanFinanced.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Active credit line balance</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500">On-Lot Display Models</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0B4F86] flex items-center justify-center text-xs">
              🏡
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {onLotCount} Displays
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">9011 McIntyre Rd, Brooksville</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500">Total Transport Invested</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              🚚
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            ${totalTransportCost.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Factory-to-lot freight total</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500">Lot Setup &amp; Staging</span>
            <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
              🪜
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            ${totalSetupCost.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Pads, stairs, skirting &amp; A/C</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stock #, model, serial/VIN, lender, pad location..."
          className="w-full max-w-sm px-3.5 py-1.5 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#0B4F86]"
        />

        <div className="flex flex-wrap items-center gap-1.5 font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#0B4F86] text-white border-[#0B4F86]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Units ({displayHomes.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ON_LOT_DISPLAY')}
            className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'ON_LOT_DISPLAY'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
            }`}
          >
            On Lot ({onLotCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('IN_TRANSIT')}
            className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'IN_TRANSIT'
                ? 'bg-amber-700 text-white border-amber-700'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50'
            }`}
          >
            In Transit
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ORDERED_AT_FACTORY')}
            className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'ORDERED_AT_FACTORY'
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/50'
            }`}
          >
            Factory Queue
          </button>
        </div>
      </div>

      {/* Display Home Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Stock #</th>
                <th className="py-3 px-3">Model &amp; Builder</th>
                <th className="py-3 px-3">Serial / VIN #</th>
                <th className="py-3 px-3">Status &amp; Pad</th>
                <th className="py-3 px-3">Floorplan Lender</th>
                <th className="py-3 px-3">Financed Balance</th>
                <th className="py-3 px-3">Freight &amp; Setup</th>
                <th className="py-3 px-3">Keybox</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.map((home) => (
                <tr key={home.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3 px-3 font-mono font-bold text-[#0B4F86]">
                    {home.stockNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{home.modelName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {home.manufacturer} • {home.dimensions}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 font-bold text-[11px]">
                    {home.serialNumber}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full border text-[10px] inline-block ${getStatusBadge(
                        home.displayStatus
                      )}`}
                    >
                      {home.displayStatus.replace(/_/g, ' ')}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                      {home.padLocation}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{home.bankUsed}</div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Rate: {home.interestRateFloorplan}%
                    </div>
                  </td>
                  <td className="py-3 px-3 font-black text-slate-900">
                    ${home.financeAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">
                      Freight: ${home.transportCost.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Setup: ${home.lotSetupCost.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-700 bg-amber-50/50 rounded text-center">
                    🔑 {home.keyBoxCode}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditingHome(home)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Display Home Drawer */}
      {editingHome && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-slate-100 bg-[#0B1E38] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-ehsLightBlue font-bold">
                  {editingHome.stockNumber}
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  Edit Display: {editingHome.modelName}
                </h3>
              </div>
              <button
                onClick={() => setEditingHome(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveHome(editingHome);
              }}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model Name *</label>
                  <input
                    type="text"
                    required
                    value={editingHome.modelName}
                    onChange={(e) => setEditingHome({ ...editingHome, modelName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={editingHome.manufacturer}
                    onChange={(e) => setEditingHome({ ...editingHome, manufacturer: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Serial Number / VIN *</label>
                  <input
                    type="text"
                    required
                    value={editingHome.serialNumber}
                    onChange={(e) => setEditingHome({ ...editingHome, serialNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Status</label>
                  <select
                    value={editingHome.displayStatus}
                    onChange={(e) =>
                      setEditingHome({ ...editingHome, displayStatus: e.target.value as DisplayStatus })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="ON_LOT_DISPLAY">On Lot Display</option>
                    <option value="SETUP_IN_PROGRESS">Setup in Progress</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="ORDERED_AT_FACTORY">Ordered at Factory</option>
                    <option value="DECOMMISSIONED">Decommissioned</option>
                  </select>
                </div>
              </div>

              {/* Floorplan & Bank Financing Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase">
                  Floorplan Financing &amp; Wholesale Invoicing
                </h4>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Floorplan Bank / Lender</label>
                    <input
                      type="text"
                      value={editingHome.bankUsed}
                      onChange={(e) => setEditingHome({ ...editingHome, bankUsed: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Financed Credit Draw ($)</label>
                    <input
                      type="number"
                      value={editingHome.financeAmount}
                      onChange={(e) =>
                        setEditingHome({ ...editingHome, financeAmount: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white text-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Transport Freight ($)</label>
                    <input
                      type="number"
                      value={editingHome.transportCost}
                      onChange={(e) =>
                        setEditingHome({ ...editingHome, transportCost: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-0.5">Lot Setup &amp; A/C ($)</label>
                    <input
                      type="number"
                      value={editingHome.lotSetupCost}
                      onChange={(e) =>
                        setEditingHome({ ...editingHome, lotSetupCost: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Pad Location</label>
                  <input
                    type="text"
                    value={editingHome.padLocation}
                    onChange={(e) => setEditingHome({ ...editingHome, padLocation: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keybox Lock Code</label>
                  <input
                    type="text"
                    value={editingHome.keyBoxCode}
                    onChange={(e) => setEditingHome({ ...editingHome, keyBoxCode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Display Notes</label>
                <textarea
                  rows={3}
                  value={editingHome.notes}
                  onChange={(e) => setEditingHome({ ...editingHome, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteHome(editingHome.id)}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold"
                >
                  Decommission Unit
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingHome(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B4F86] hover:bg-[#083860] text-white font-bold rounded-xl shadow-xs"
                  >
                    Save Unit Record
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Display Unit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Add Ordered Display Unit</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                handleCreateDisplayHome({
                  modelName: fd.get('modelName') as string,
                  manufacturer: fd.get('manufacturer') as string,
                  serialNumber: fd.get('serialNumber') as string,
                  bankUsed: fd.get('bankUsed') as string,
                  financeAmount: Number(fd.get('financeAmount')),
                  transportCost: Number(fd.get('transportCost')),
                  padLocation: fd.get('padLocation') as string,
                  keyBoxCode: fd.get('keyBoxCode') as string
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Model Name *</label>
                <input
                  type="text"
                  name="modelName"
                  required
                  placeholder="e.g. The White Oak CS-3221"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Manufacturer *</label>
                  <input
                    type="text"
                    name="manufacturer"
                    required
                    placeholder="e.g. Timber Creek"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Serial / VIN *</label>
                  <input
                    type="text"
                    name="serialNumber"
                    required
                    placeholder="e.g. TC-CS-2026-991"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Floorplan Bank</label>
                  <input
                    type="text"
                    name="bankUsed"
                    defaultValue="21st Mortgage Floorplan"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Financed Draw ($)</label>
                  <input
                    type="number"
                    name="financeAmount"
                    defaultValue={55000}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Transport Freight ($)</label>
                  <input
                    type="number"
                    name="transportCost"
                    defaultValue={3850}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Keybox Code</label>
                  <input
                    type="text"
                    name="keyBoxCode"
                    defaultValue="4920"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B1E38] text-white rounded-xl font-bold shadow-xs"
                >
                  Add Display Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import type { Property, PropertyStatus, PropertyType } from '@/types/property';
import { PROPERTY_STATUS_CONFIG, PROPERTY_TYPE_LABELS } from '@/types/property';

interface PropertyTableProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onUpdateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  onDeleteProperty: (id: string) => Promise<void>;
  onViewOnMap: (property: Property) => void;
}

export function PropertyTable({
  properties,
  onSelectProperty,
  onUpdateProperty,
  onDeleteProperty,
  onViewOnMap
}: PropertyTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<keyof Property>('updatedAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const handleSort = (field: keyof Property) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedProperties = [...properties].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'price') {
      aVal = a.price ?? -1;
      bVal = b.price ?? -1;
    }

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (sortAsc) {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Paginated items
  const totalPages = Math.ceil(sortedProperties.length / pageSize) || 1;
  const paginatedList = sortedProperties.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedList.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleInlineStatusChange = async (
    id: string,
    newStatus: PropertyStatus
  ) => {
    setSavingId(id);
    try {
      await onUpdateProperty(id, { status: newStatus });
    } finally {
      setSavingId(null);
    }
  };

  const handleInlineTypeChange = async (
    id: string,
    newType: PropertyType
  ) => {
    setSavingId(id);
    try {
      await onUpdateProperty(id, { propertyType: newType });
    } finally {
      setSavingId(null);
    }
  };

  const handleInlineVisibilityToggle = async (
    id: string,
    currentVal: boolean
  ) => {
    setSavingId(id);
    try {
      await onUpdateProperty(id, { publicVisible: !currentVal });
    } finally {
      setSavingId(null);
    }
  };

  const startEditPrice = (property: Property) => {
    setEditingPriceId(property.id);
    setTempPrice(property.price != null ? String(property.price) : '');
  };

  const saveInlinePrice = async (id: string) => {
    const numeric = tempPrice.trim() ? Number(tempPrice.replace(/\D/g, '')) : null;
    setSavingId(id);
    setEditingPriceId(null);
    try {
      await onUpdateProperty(id, { price: numeric });
    } finally {
      setSavingId(null);
    }
  };

  const formatCurrency = (val?: number | null) => {
    if (val == null || !Number.isFinite(val) || val <= 0) return 'Unpriced';
    return `$${val.toLocaleString()}`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
      {/* Table Action Bar */}
      <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">
            {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
          </span>
          {selectedIds.length > 0 && (
            <span className="bg-ehsSoftBlue text-ehsDeepBlue px-2 py-0.5 rounded-md font-bold text-[11px] border border-ehsBlue/20">
              {selectedIds.length} Selected
            </span>
          )}
        </div>

        {/* Batch Actions & Page Size */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  selectedIds.forEach((id) =>
                    onUpdateProperty(id, { publicVisible: true })
                  );
                }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Set Public (True)
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) =>
                    onUpdateProperty(id, { status: 'AVAILABLE' })
                  );
                }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Set Available
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none text-xs font-semibold"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Airtable Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={
                    paginatedList.length > 0 &&
                    paginatedList.every((p) => selectedIds.includes(p.id))
                  }
                  onChange={handleSelectAll}
                  className="rounded text-ehsDeepBlue focus:ring-0"
                />
              </th>
              <th
                onClick={() => handleSort('address')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Address & Community</span>
                  {sortField === 'address' && (
                    <span>{sortAsc ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  {sortField === 'status' && <span>{sortAsc ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th
                onClick={() => handleSort('propertyType')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Type</span>
                  {sortField === 'propertyType' && (
                    <span>{sortAsc ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('county')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>County / City</span>
                  {sortField === 'county' && <span>{sortAsc ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Price</span>
                  {sortField === 'price' && <span>{sortAsc ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="py-3 px-3">Specs / Builder</th>
              <th
                onClick={() => handleSort('publicVisible')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Public</span>
                  {sortField === 'publicVisible' && (
                    <span>{sortAsc ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('updatedAt')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Updated</span>
                  {sortField === 'updatedAt' && (
                    <span>{sortAsc ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No properties found.</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                </td>
              </tr>
            ) : (
              paginatedList.map((property) => {
                const statusCfg =
                  PROPERTY_STATUS_CONFIG[property.status] ||
                  PROPERTY_STATUS_CONFIG.STATUS_TO_CONFIRM;
                const isSelected = selectedIds.includes(property.id);
                const isSaving = savingId === property.id;

                return (
                  <tr
                    key={property.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      isSelected ? 'bg-slate-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(property.id)}
                        className="rounded text-ehsDeepBlue focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Address & Community */}
                    <td className="py-2.5 px-3">
                      <div
                        onClick={() => onSelectProperty(property)}
                        className="cursor-pointer group-hover:text-ehsDeepBlue"
                      >
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{property.address}</span>
                          {property.featured && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              ⭐
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{property.community || 'Private Site'}</span>
                          {property.parcelNumber && (
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                              #{property.parcelNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Dropdown (Inline Edit) */}
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={property.status}
                        disabled={isSaving}
                        onChange={(e) =>
                          handleInlineStatusChange(
                            property.id,
                            e.target.value as PropertyStatus
                          )
                        }
                        className={`text-[11px] font-bold px-2 py-1 rounded-full border outline-none cursor-pointer ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="COMING_SOON">Coming Soon</option>
                        <option value="UNDER_CONTRACT">Under Contract</option>
                        <option value="SOLD">Sold</option>
                        <option value="STATUS_TO_CONFIRM">Status To Confirm</option>
                      </select>
                    </td>

                    {/* Property Type Dropdown (Inline Edit) */}
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={property.propertyType}
                        disabled={isSaving}
                        onChange={(e) =>
                          handleInlineTypeChange(
                            property.id,
                            e.target.value as PropertyType
                          )
                        }
                        className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-slate-300"
                      >
                        <option value="LAND">Vacant Land</option>
                        <option value="HOME">Finished Home</option>
                        <option value="LAND_HOME_PACKAGE">Land & Home Package</option>
                        <option value="SPEC_HOME">Spec Home in Progress</option>
                        <option value="MODEL">Display Model</option>
                      </select>
                    </td>

                    {/* County / City */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800 text-xs">
                        {property.county ? `${property.county} Co.` : 'Citrus/Hernando'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {property.city}, {property.zip}
                      </div>
                    </td>

                    {/* Price (Inline Currency Editor) */}
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      {editingPriceId === property.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveInlinePrice(property.id);
                              if (e.key === 'Escape') setEditingPriceId(null);
                            }}
                            autoFocus
                            placeholder="$"
                            className="w-24 px-2 py-0.5 border border-ehsBlue rounded text-xs font-bold"
                          />
                          <button
                            onClick={() => saveInlinePrice(property.id)}
                            className="text-xs text-emerald-600 font-bold hover:underline"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEditPrice(property)}
                          className="font-extrabold text-slate-900 cursor-pointer hover:text-ehsBlue hover:underline flex items-center gap-1 group/price"
                          title="Click to edit price"
                        >
                          <span>{formatCurrency(property.price)}</span>
                          <span className="opacity-0 group-hover/price:opacity-100 text-[10px] text-slate-400">
                            ✎
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Specs / Builder */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-700">
                        {property.bedrooms ? `${property.bedrooms}b / ${property.bathrooms}ba` : property.lotSize || 'Homesite'}
                      </div>
                      <div className="text-[10.5px] text-slate-400 truncate max-w-[120px]">
                        {property.builder || 'Unassigned'}
                      </div>
                    </td>

                    {/* Public Visible Toggle */}
                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() =>
                          handleInlineVisibilityToggle(
                            property.id,
                            property.publicVisible
                          )
                        }
                        className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 inline-flex items-center ${
                          property.publicVisible ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={property.publicVisible ? 'Visible on Public Marketing Feed' : 'Internal Only'}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            property.publicVisible ? 'translate-x-3.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Updated Date */}
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDate(property.updatedAt)}
                    </td>

                    {/* Row Actions */}
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewOnMap(property)}
                          className="p-1 text-slate-400 hover:text-ehsDeepBlue rounded hover:bg-slate-100"
                          title="View on Map"
                        >
                          🗺️
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectProperty(property)}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 font-bold"
                          title="Open Detailed Editor"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-bold text-slate-800">
            {sortedProperties.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-bold text-slate-800">
            {Math.min(currentPage * pageSize, sortedProperties.length)}
          </span>{' '}
          of <span className="font-bold text-slate-800">{sortedProperties.length}</span> properties
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="px-2 text-xs font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

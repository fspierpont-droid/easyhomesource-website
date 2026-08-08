'use client';

import React from 'react';
import type { Property, PropertyStatus } from '@/types/property';
import { PROPERTY_STATUS_CONFIG } from '@/types/property';

interface PropertyKanbanProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onUpdateStatus: (id: string, newStatus: PropertyStatus) => Promise<void>;
}

export function PropertyKanban({
  properties,
  onSelectProperty,
  onUpdateStatus
}: PropertyKanbanProps) {
  const columns: PropertyStatus[] = [
    'AVAILABLE',
    'COMING_SOON',
    'UNDER_CONTRACT',
    'STATUS_TO_CONFIRM',
    'SOLD'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
      {columns.map((status) => {
        const config = PROPERTY_STATUS_CONFIG[status];
        const columnProperties = properties.filter((p) => p.status === status);

        return (
          <div
            key={status}
            className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                <span className="font-extrabold text-xs text-slate-800 tracking-tight">
                  {config.label}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {columnProperties.length}
              </span>
            </div>

            {/* Property Cards */}
            <div className="space-y-2.5 flex-1">
              {columnProperties.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  No properties in this status
                </div>
              ) : (
                columnProperties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => onSelectProperty(property)}
                    className="p-3.5 bg-white border border-slate-200/80 hover:border-ehsBlue rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-ehsDeepBlue leading-snug">
                        {property.address}
                      </h4>
                      {property.featured && (
                        <span className="text-[10px] text-amber-500" title="Featured">
                          ⭐
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 flex justify-between items-center">
                      <span>{property.city}, {property.county}</span>
                      <span className="font-mono text-[10px] text-slate-400">{property.id}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="font-black text-xs text-slate-900">
                        {property.price ? `$${property.price.toLocaleString()}` : 'Unpriced'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {property.bedrooms ? `${property.bedrooms}b/${property.bathrooms}ba` : property.lotSize || 'Lot'}
                      </span>
                    </div>

                    {/* Quick Move Selector */}
                    <div
                      className="pt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[9.5px] text-slate-400 font-medium">Move:</span>
                      <select
                        value={property.status}
                        onChange={(e) =>
                          onUpdateStatus(property.id, e.target.value as PropertyStatus)
                        }
                        className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 outline-none text-slate-700"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="COMING_SOON">Coming Soon</option>
                        <option value="UNDER_CONTRACT">Under Contract</option>
                        <option value="SOLD">Sold</option>
                        <option value="STATUS_TO_CONFIRM">Confirm</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

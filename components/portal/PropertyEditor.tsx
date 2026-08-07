'use client';

import React, { useState, useEffect } from 'react';
import type {
  Property,
  PropertyStatus,
  PropertyType
} from '@/types/property';
import { PROPERTY_STATUS_CONFIG, PROPERTY_TYPE_LABELS } from '@/types/property';

interface PropertyEditorProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Property>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type TabType =
  | 'general'
  | 'pricing'
  | 'photos'
  | 'location'
  | 'notes'
  | 'history'
  | 'internal';

export function PropertyEditor({
  property,
  isOpen,
  onClose,
  onSave,
  onDelete
}: PropertyEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [formData, setFormData] = useState<Partial<Property>>({});
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData({
        ...property,
        utilities: property.utilities || {
          water: 'WELL',
          sewer: 'SEPTIC',
          electric: 'WITHLACOOCHEE'
        }
      });
      setSaveSuccess(false);
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleInputChange = (field: keyof Property, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    setSaveSuccess(false);
  };

  const handleUtilityChange = (field: 'water' | 'sewer' | 'electric', value: any) => {
    setFormData((prev) => ({
      ...prev,
      utilities: {
        ...(prev.utilities || { water: 'WELL', sewer: 'SEPTIC', electric: 'WITHLACOOCHEE' }),
        [field]: value
      }
    }));
    setSaveSuccess(false);
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const currentPhotos = formData.photos ? [...formData.photos] : [];
    currentPhotos.push(newPhotoUrl.trim());
    handleInputChange('photos', currentPhotos);
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    const currentPhotos = formData.photos ? [...formData.photos] : [];
    currentPhotos.splice(index, 1);
    handleInputChange('photos', currentPhotos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(property.id, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to remove ${property.address} from the Property Center?`)) {
      await onDelete(property.id);
      onClose();
    }
  };

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'general', label: 'General', icon: '📋' },
    { id: 'pricing', label: 'Pricing & Specs', icon: '💰' },
    { id: 'photos', label: 'Photos', icon: '🖼️' },
    { id: 'location', label: 'Location & Map', icon: '📍' },
    { id: 'notes', label: 'Notes & Copy', icon: '📝' },
    { id: 'history', label: 'Audit History', icon: '⏱️' },
    { id: 'internal', label: 'Internal Ops', icon: '🔒' }
  ];

  const statusConfig =
    PROPERTY_STATUS_CONFIG[formData.status || 'AVAILABLE'] ||
    PROPERTY_STATUS_CONFIG.STATUS_TO_CONFIRM;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      {/* Editor Panel Drawer */}
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-ehsDeepBlue text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
              {property.id}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 truncate">
                {formData.address || property.address}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {formData.city}, {formData.county} County, {formData.zip}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
            >
              {statusConfig.label}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 border-b border-slate-200 bg-white flex gap-1 overflow-x-auto scrollbar-none text-xs font-bold">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeTab === tab.id
                  ? 'border-ehsDeepBlue text-ehsDeepBlue'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* TAB 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue focus:ring-1 focus:ring-ehsBlue"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue focus:ring-1 focus:ring-ehsBlue"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">County *</label>
                  <select
                    value={formData.county || 'Hernando'}
                    onChange={(e) => handleInputChange('county', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue bg-white"
                  >
                    <option value="Hernando">Hernando County</option>
                    <option value="Citrus">Citrus County</option>
                    <option value="Pasco">Pasco County</option>
                    <option value="Sumter">Sumter County</option>
                    <option value="Hillsborough">Hillsborough County</option>
                    <option value="Marion">Marion County</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state || 'FL'}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zip || ''}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Property Status</label>
                  <select
                    value={formData.status || 'AVAILABLE'}
                    onChange={(e) => handleInputChange('status', e.target.value as PropertyStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-ehsBlue bg-white"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="UNDER_CONTRACT">Under Contract</option>
                    <option value="SOLD">Sold</option>
                    <option value="STATUS_TO_CONFIRM">Status To Confirm</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={formData.propertyType || 'HOME'}
                    onChange={(e) => handleInputChange('propertyType', e.target.value as PropertyType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue bg-white"
                  >
                    <option value="LAND">Vacant Land / Lot</option>
                    <option value="HOME">Finished Home</option>
                    <option value="LAND_HOME_PACKAGE">Land & Home Package</option>
                    <option value="SPEC_HOME">Spec Home in Progress</option>
                    <option value="MODEL">Display Model</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Builder / Manufacturer</label>
                  <input
                    type="text"
                    value={formData.builder || ''}
                    placeholder="e.g. Clayton TRU, Cavco, Legacy"
                    onChange={(e) => handleInputChange('builder', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Community / Subdivision</label>
                  <input
                    type="text"
                    value={formData.community || ''}
                    placeholder="e.g. Denmarsh Woods, Erlen Groves"
                    onChange={(e) => handleInputChange('community', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parcel Number (PIN / Folio)</label>
                  <input
                    type="text"
                    value={formData.parcelNumber || ''}
                    placeholder="e.g. R04-222-19-1940-0000-0180"
                    onChange={(e) => handleInputChange('parcelNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Salesperson</label>
                  <input
                    type="text"
                    value={formData.salesperson || 'Unassigned'}
                    onChange={(e) => handleInputChange('salesperson', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Public Marketing Visibility</span>
                    <span className="text-[11px] text-slate-500">
                      When enabled, this property is published to the public API feed.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.publicVisible ?? true}
                    onChange={(e) => handleInputChange('publicVisible', e.target.checked)}
                    className="w-4 h-4 rounded text-ehsDeepBlue focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-900 block">Featured Listing</span>
                    <span className="text-[11px] text-slate-500">
                      Pinstar priority on dashboards and public search.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 rounded text-ehsDeepBlue focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Pricing & Specs */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="p-4 bg-ehsSoftBlue/50 border border-ehsBlue/20 rounded-2xl">
                <label className="block font-black text-ehsNavy mb-1 text-sm">
                  Turnkey Package / Offering Price ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={formData.price ?? ''}
                    placeholder="e.g. 189900"
                    onChange={(e) =>
                      handleInputChange('price', e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 focus:outline-none focus:border-ehsBlue focus:ring-2 focus:ring-ehsLightBlue/40 bg-white"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms ?? ''}
                    placeholder="e.g. 3"
                    onChange={(e) =>
                      handleInputChange('bedrooms', e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.bathrooms ?? ''}
                    placeholder="e.g. 2"
                    onChange={(e) =>
                      handleInputChange('bathrooms', e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Square Feet</label>
                  <input
                    type="number"
                    value={formData.squareFeet ?? ''}
                    placeholder="e.g. 1140"
                    onChange={(e) =>
                      handleInputChange('squareFeet', e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lot Size / Dimensions</label>
                  <input
                    type="text"
                    value={formData.lotSize || ''}
                    placeholder="e.g. 0.50 acres"
                    onChange={(e) => handleInputChange('lotSize', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zoning Code</label>
                  <input
                    type="text"
                    value={formData.zoning || ''}
                    placeholder="e.g. R-1M Mobile Permitted"
                    onChange={(e) => handleInputChange('zoning', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">FEMA Flood Zone</label>
                  <input
                    type="text"
                    value={formData.floodZone || ''}
                    placeholder="e.g. Zone X (No flood req)"
                    onChange={(e) => handleInputChange('floodZone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
                  />
                </div>
              </div>

              {/* Utilities */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900">Site Utility Connections</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Water System</label>
                    <select
                      value={formData.utilities?.water || 'WELL'}
                      onChange={(e) => handleUtilityChange('water', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                    >
                      <option value="WELL">Existing Well</option>
                      <option value="MUNICIPAL">Municipal City Water</option>
                      <option value="NEEDS_WELL">Needs Well Drilled</option>
                      <option value="UNKNOWN">To Confirm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Sewer System</label>
                    <select
                      value={formData.utilities?.sewer || 'SEPTIC'}
                      onChange={(e) => handleUtilityChange('sewer', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                    >
                      <option value="SEPTIC">Existing Septic System</option>
                      <option value="MUNICIPAL">Municipal Sewer</option>
                      <option value="NEEDS_SEPTIC">Needs Septic Installed</option>
                      <option value="UNKNOWN">To Confirm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Electric Provider</label>
                    <select
                      value={formData.utilities?.electric || 'WITHLACOOCHEE'}
                      onChange={(e) => handleUtilityChange('electric', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                    >
                      <option value="WITHLACOOCHEE">Withlacoochee River Electric</option>
                      <option value="DUKE">Duke Energy</option>
                      <option value="CONNECTED">Connected & Active</option>
                      <option value="AT_ROAD">At Road (Needs Drop)</option>
                      <option value="UNKNOWN">To Confirm</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Photos */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/property-photo.jpg"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-ehsBlue"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-4 py-2 bg-ehsDeepBlue hover:bg-ehsNavy text-white font-bold rounded-xl"
                >
                  Add Photo
                </button>
              </div>

              {formData.photos && formData.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] group bg-slate-100"
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="px-2 py-1 bg-rose-600 text-white rounded font-bold text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-ehsDeepBlue text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <p className="text-sm font-bold">No photos uploaded yet</p>
                  <p className="text-xs mt-1">Paste an image URL above to attach property media.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Location & Map */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude ?? 28.5553}
                    onChange={(e) => handleInputChange('latitude', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude ?? -82.3879}
                    onChange={(e) => handleInputChange('longitude', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Map Quick Access</h4>
                <p className="text-xs text-slate-500">
                  View property coordinates in external GIS / mapping tools.
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${formData.address || property.address}, ${formData.city || property.city}, FL`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-ehsBlue font-bold hover:underline"
                >
                  <span>Open Google Maps Pin</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 5: Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Public Description & Marketing Copy
                </label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  placeholder="Customer-facing description of the home, site conditions, neighborhood amenities..."
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:border-ehsBlue"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sales Representative Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  placeholder="Key summary points for home consultants and CRM buyers..."
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:border-ehsBlue"
                />
              </div>
            </div>
          )}

          {/* TAB 6: Audit History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Single Source Audit Log</h4>
              {formData.history && formData.history.length > 0 ? (
                <div className="space-y-2">
                  {formData.history.map((log, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex justify-between items-start"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{log.action}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {log.oldValue !== undefined && log.newValue !== undefined
                            ? `Changed from "${log.oldValue}" to "${log.newValue}"`
                            : log.newValue || 'Updated in Property Center'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-600 block">{log.user}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">No previous revision entries recorded.</p>
              )}
            </div>
          )}

          {/* TAB 7: Internal Ops */}
          {activeTab === 'internal' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Internal Ops & Legal Verification Notes
                </label>
                <textarea
                  rows={4}
                  value={formData.internalNotes || ''}
                  placeholder="Title commitments, probate checks, contractor access codes, contractor quotes..."
                  onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs leading-relaxed bg-amber-50/40 border-amber-200/80 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">System Record ID:</span>
                  <span className="font-mono font-bold text-slate-800">{property.id}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Created Timestamp:</span>
                  <span className="font-medium text-slate-700">{property.createdAt}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Last Database Sync:</span>
                  <span className="font-medium text-slate-700">{property.updatedAt}</span>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors text-xs"
          >
            Delete Property
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-emerald-700 font-bold text-xs animate-in fade-in">
                ✓ Saved to DB
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSubmit}
              className="px-5 py-2 bg-ehsDeepBlue hover:bg-ehsNavy text-white font-bold rounded-xl shadow-xs transition-all text-xs disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

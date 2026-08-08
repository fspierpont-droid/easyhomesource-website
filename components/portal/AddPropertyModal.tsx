'use client';

import React, { useState } from 'react';
import type { Property, PropertyStatus, PropertyType } from '@/types/property';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (propertyData: Partial<Property>) => Promise<void>;
}

export function AddPropertyModal({
  isOpen,
  onClose,
  onAddProperty
}: AddPropertyModalProps) {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Brooksville');
  const [county, setCounty] = useState('Hernando');
  const [zip, setZip] = useState('34601');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<PropertyStatus>('AVAILABLE');
  const [propertyType, setPropertyType] = useState<PropertyType>('HOME');
  const [builder, setBuilder] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [squareFeet, setSquareFeet] = useState('');
  const [lotSize, setLotSize] = useState('0.5 acres');
  const [parcelNumber, setParcelNumber] = useState('');
  const [publicVisible, setPublicVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !city.trim()) {
      alert('Address and City are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddProperty({
        address: address.trim(),
        city: city.trim(),
        county: county.trim(),
        state: 'FL',
        zip: zip.trim(),
        price: price.trim() ? Number(price.replace(/\D/g, '')) : null,
        status,
        propertyType,
        builder: builder.trim() || null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        squareFeet: squareFeet ? Number(squareFeet) : null,
        lotSize: lotSize.trim() || null,
        parcelNumber: parcelNumber.trim() || null,
        publicVisible,
        featured: false,
        photos: [],
        description: `New ${propertyType} property added to Easy Home Source Property Center in ${city}, FL.`
      });
      onClose();
      // Reset form
      setAddress('');
      setPrice('');
      setBuilder('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Add New Property to Database
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Single source of truth record. Will be stored in Property Center.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 10425 Broad St"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-ehsBlue"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">County *</label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="Hernando">Hernando</option>
                <option value="Citrus">Citrus</option>
                <option value="Pasco">Pasco</option>
                <option value="Sumter">Sumter</option>
                <option value="Hillsborough">Hillsborough</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ZIP Code</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
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
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="HOME">Finished Home</option>
                <option value="LAND">Vacant Land</option>
                <option value="LAND_HOME_PACKAGE">Land & Home Package</option>
                <option value="SPEC_HOME">Spec Home in Progress</option>
                <option value="MODEL">Display Model</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Price ($ USD)</label>
              <input
                type="number"
                placeholder="e.g. 189900"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Builder / Model</label>
              <input
                type="text"
                placeholder="e.g. Clayton, Cavco, Legacy"
                value={builder}
                onChange={(e) => setBuilder(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Beds</label>
              <input
                type="number"
                placeholder="3"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Baths</label>
              <input
                type="number"
                step="0.5"
                placeholder="2"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sq. Ft.</label>
              <input
                type="number"
                placeholder="1140"
                value={squareFeet}
                onChange={(e) => setSquareFeet(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={publicVisible}
              onChange={(e) => setPublicVisible(e.target.checked)}
              className="w-4 h-4 rounded text-ehsDeepBlue"
            />
            <span className="font-bold text-slate-800 text-xs">
              Make publicly visible to website API feed immediately
            </span>
          </label>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-ehsDeepBlue hover:bg-ehsNavy text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

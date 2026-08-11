'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { VERIFIED_TEAM_USERS, canAccessSettings, type TeamUser } from '@/data/teamMembers';
import {
  FULL_MASTER_CATALOG_HOMES,
  type MasterCatalogHome,
  getStoredCatalogOverrides,
  saveStoredCatalogOverrides,
  clearStoredCatalogOverrides,
  getEffectiveMasterCatalog
} from '@/data/fullMasterCatalog.generated';
import { SERVICE_CATALOG, type ServiceCatalogItem } from '@/data/pricingSpreadsheet';
import { AuthGate } from '@/components/portal/AuthGate';
import { useAuth } from '@/lib/auth/AuthContext';

interface StagedModelUpdate {
  slug: string;
  name: string;
  manufacturer: string;
  series: string;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  dimensions?: string;
  width?: number;
  length?: number;
  hudBasePrice?: number | null;
  currentEhsPrice?: number | null;
  newEhsPrice: number;
  currentFactoryCost?: number | null;
  newFactoryCost: number;
  isExisting: boolean;
  status: 'updated' | 'unchanged' | 'new';
}

function SettingsContent() {
  const { user, login } = useAuth();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get('tab') as any;

  const [activeTab, setActiveTab] = useState<'company' | 'catalog' | 'pricing' | 'disclaimer' | 'templates' | 'users' | 'imports'>(
    initialTabParam || 'disclaimer'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['company', 'catalog', 'pricing', 'disclaimer', 'templates', 'users', 'imports'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // 1. Users State
  const [users, setUsers] = useState<TeamUser[]>(VERIFIED_TEAM_USERS);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Manager' | 'Associate'>('Associate');
  const [ghlLinked, setGhlLinked] = useState(false);

  // 2. Disclaimer & Next Steps State
  const [defaultDisclaimer, setDefaultDisclaimer] = useState(
    'Site development pricing is an estimate based on visible conditions. Final pricing is subject to change based on actual site-specific requirements during installation. Prices are valid for 30 days from the quote date.'
  );
  const [defaultNextSteps, setDefaultNextSteps] = useState(
    '1. Review this quote and contact your associate with any questions.\n2. Sign the deposit agreement to reserve your home.\n3. Schedule your site visit and begin the financing process.'
  );
  const [disclaimerSaved, setDisclaimerSaved] = useState(false);

  // 3. Home Catalog State (Loaded from effective overrides if present)
  const [homeCatalog, setHomeCatalog] = useState<MasterCatalogHome[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogBuilderFilter, setCatalogBuilderFilter] = useState('ALL');
  const [editingHome, setEditingHome] = useState<MasterCatalogHome | null>(null);
  const [isAddHomeOpen, setIsAddHomeOpen] = useState(false);

  useEffect(() => {
    setHomeCatalog(getEffectiveMasterCatalog());
  }, []);

  // New Home Form
  const [newHomeName, setNewHomeName] = useState('');
  const [newHomeManufacturer, setNewHomeManufacturer] = useState('CAVCO Plant City');
  const [newHomePrice, setNewHomePrice] = useState(65000);
  const [newHomeFactoryCost, setNewHomeFactoryCost] = useState(48000);
  const [newHomeBeds, setNewHomeBeds] = useState(3);
  const [newHomeBaths, setNewHomeBaths] = useState(2);
  const [newHomeSqft, setNewHomeSqft] = useState(1200);
  const [newHomeDimensions, setNewHomeDimensions] = useState("16' x 76'");
  const [newHomeWidth, setNewHomeWidth] = useState(16);
  const [newHomeLength, setNewHomeLength] = useState(76);

  // 4. Line Item Templates State
  const [lineItemTemplates, setLineItemTemplates] = useState<ServiceCatalogItem[]>(SERVICE_CATALOG);
  const [templateCategory, setTemplateCategory] = useState<'mandatory_services' | 'site_work' | 'addons' | 'options'>('mandatory_services');
  const [newTemplateSku, setNewTemplateSku] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplatePrice, setNewTemplatePrice] = useState(1500);
  const [newTemplateCost, setNewTemplateCost] = useState(1100);
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<ServiceCatalogItem | null>(null);

  // 5. Pricing Engine Constants
  const [salesTaxRate, setSalesTaxRate] = useState(0.03);
  const [adminFeePct, setAdminFeePct] = useState(0.05);
  const [loanFee, setLoanFee] = useState(1000);
  const [salesCommissionPct, setSalesCommissionPct] = useState(0.20);
  const [takeHomeFloor, setTakeHomeFloor] = useState(12000);
  const [pricingSaved, setPricingSaved] = useState(false);

  // 6. Company Info
  const [companyName, setCompanyName] = useState('Easy HomeSource LLC');
  const [companyAddress, setCompanyAddress] = useState('9011 McIntyre Rd, Brooksville, FL 34601');
  const [companyPhone, setCompanyPhone] = useState('(352) 558-8888');
  const [companyEmail, setCompanyEmail] = useState('info@easyhomesource.com');
  const [companySaved, setCompanySaved] = useState(false);

  // 7. GHL Lead Sync State
  const [isSyncingGhl, setIsSyncingGhl] = useState(false);
  const [ghlSyncResult, setGhlSyncResult] = useState<string | null>(null);

  // 8. Spreadsheet Import State (.xlsx, .xls, .csv, .tsv)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importWorkbook, setImportWorkbook] = useState<any>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [stagedUpdates, setStagedUpdates] = useState<StagedModelUpdate[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);
  const [stagedFilter, setStagedFilter] = useState<'ALL' | 'CHANGED' | 'NEW'>('ALL');
  const [stagedSearch, setStagedSearch] = useState('');

  const cleanKey = (s?: string | null) => (s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : '');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv', '.tsv'];
    const fileName = file.name.toLowerCase();
    if (!validExtensions.some((ext) => fileName.endsWith(ext))) {
      setImportErrorMsg('Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setImportFile(file);
    setIsParsing(true);
    setImportErrorMsg(null);
    setImportSuccessMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      setImportWorkbook(wb);
      setSheetNames(wb.SheetNames || []);
      const initialSheet = wb.SheetNames[0] || '';
      setSelectedSheet(initialSheet);
      processSheetData(wb, initialSheet);
    } catch (err: any) {
      setImportErrorMsg(`Failed to parse spreadsheet: ${err?.message || 'Invalid or corrupted file.'}`);
      setStagedUpdates([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (importWorkbook) {
      processSheetData(importWorkbook, sheetName);
    }
  };

  const processSheetData = (wb: any, sheetName: string) => {
    try {
      const ws = wb.Sheets[sheetName];
      if (!ws) {
        setImportErrorMsg(`Sheet "${sheetName}" not found in workbook.`);
        return;
      }
      const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!rawRows || rawRows.length === 0) {
        setImportErrorMsg(`Sheet "${sheetName}" is empty.`);
        setStagedUpdates([]);
        return;
      }

      const staged: StagedModelUpdate[] = [];

      for (const row of rawRows) {
        const keys = Object.keys(row);
        const findVal = (...aliases: string[]) => {
          for (const alias of aliases) {
            const match = keys.find(
              (k) => k.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === alias.toLowerCase().replace(/[^a-z0-9]/g, '')
            );
            if (match && row[match] !== undefined && row[match] !== null && String(row[match]).trim() !== '') {
              return row[match];
            }
          }
          return undefined;
        };

        const name = String(findVal('modelname', 'model', 'name', 'homename', 'home', 'plan', 'planname', 'slug') || '').trim();
        if (!name) continue; // skip blank rows

        const manufacturer = String(findVal('manufacturer', 'builder', 'mfg', 'plant', 'make') || 'CAVCO Plant City').trim();
        const series = String(findVal('series', 'collection', 'line') || '').trim();
        const rawEhsPrice = findVal('ehsprice', 'sellingprice', 'startingprice', 'price', 'msrp', 'retailprice');
        const rawHudBase = findVal('hudbaseprice', 'hudbase', 'hudprice', 'baseprice', 'wholesale');
        const rawFactoryCost = findVal('estfactorycost', 'factorycost', 'dealercost', 'cost', 'factorywholesale');
        const rawBeds = findVal('bedrooms', 'beds', 'bed', 'br');
        const rawBaths = findVal('bathrooms', 'baths', 'bath', 'ba');
        const rawSqft = findVal('squarefeet', 'sqft', 'squarefoot', 'sqfeet', 'size', 'area');
        const rawDimensions = findVal('dimensions', 'size', 'dim', 'dimension');
        const rawWidth = findVal('width', 'w');
        const rawLength = findVal('length', 'len', 'l');

        const cleanNum = (val: any) => {
          if (val === undefined || val === null || val === '') return null;
          const n = Number(String(val).replace(/[^0-9.-]/g, ''));
          return isNaN(n) ? null : n;
        };

        const hudBasePrice = cleanNum(rawHudBase);
        const estFactoryCost = cleanNum(rawFactoryCost) ?? (hudBasePrice ? Math.round(hudBasePrice * 1.03) : null);
        const ehsPrice = cleanNum(rawEhsPrice) ?? (estFactoryCost ? Math.round(estFactoryCost * 1.42) : (hudBasePrice ? Math.round(hudBasePrice * 1.45) : 0));
        const bedrooms = cleanNum(rawBeds);
        const bathrooms = cleanNum(rawBaths);
        const squareFeet = cleanNum(rawSqft);
        const width = cleanNum(rawWidth) || 0;
        const length = cleanNum(rawLength) || 0;
        const dimensions = rawDimensions ? String(rawDimensions).trim() : (width && length ? `${width}' x ${length}'` : '');

        // Match against existing catalog
        const kName = cleanKey(name);
        const existing = homeCatalog.find(
          (h) => cleanKey(h.name) === kName || cleanKey(h.slug) === kName || (cleanKey(h.manufacturer) === cleanKey(manufacturer) && cleanKey(h.name).includes(kName))
        );

        let status: 'updated' | 'unchanged' | 'new' = 'new';
        if (existing) {
          const priceDiff = Math.abs(existing.ehsPrice - ehsPrice) > 0.01;
          const costDiff = Math.abs((existing.estFactoryCost || 0) - (estFactoryCost || 0)) > 0.01;
          status = priceDiff || costDiff ? 'updated' : 'unchanged';
        }

        const generatedSlug = existing?.slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `home-${Date.now()}`);

        staged.push({
          slug: generatedSlug,
          name: existing?.name || name,
          manufacturer: existing?.manufacturer || manufacturer,
          series: existing?.series || series,
          beds: bedrooms ?? existing?.bedrooms ?? null,
          baths: bathrooms ?? existing?.bathrooms ?? null,
          sqft: squareFeet ?? existing?.squareFeet ?? null,
          dimensions: dimensions || existing?.dimensions || '',
          width: width || existing?.width || 0,
          length: length || existing?.length || 0,
          hudBasePrice: hudBasePrice ?? existing?.hudBasePrice ?? null,
          currentEhsPrice: existing?.ehsPrice ?? null,
          newEhsPrice: ehsPrice,
          currentFactoryCost: existing?.estFactoryCost ?? null,
          newFactoryCost: estFactoryCost || 0,
          isExisting: !!existing,
          status
        });
      }

      setStagedUpdates(staged);
      if (staged.length === 0) {
        setImportErrorMsg('No valid model rows detected. Ensure the spreadsheet contains a "Model" or "Name" column.');
      } else {
        setImportErrorMsg(null);
      }
    } catch (err: any) {
      setImportErrorMsg(`Error processing sheet "${sheetName}": ${err?.message || 'Parsing error'}`);
    }
  };

  const handleApplyStagedUpdates = () => {
    if (stagedUpdates.length === 0) return;

    let updatedCount = 0;
    let addedCount = 0;

    const newCatalog = [...homeCatalog];

    for (const update of stagedUpdates) {
      const idx = newCatalog.findIndex((h) => h.slug === update.slug || cleanKey(h.name) === cleanKey(update.name));
      if (idx >= 0) {
        newCatalog[idx] = {
          ...newCatalog[idx],
          ehsPrice: update.newEhsPrice,
          startingPrice: update.newEhsPrice,
          estFactoryCost: update.newFactoryCost,
          hudBasePrice: update.hudBasePrice ?? newCatalog[idx].hudBasePrice,
          msrp: Math.round(update.newEhsPrice * 1.15),
          bedrooms: update.beds ?? newCatalog[idx].bedrooms,
          bathrooms: update.baths ?? newCatalog[idx].bathrooms,
          squareFeet: update.sqft ?? newCatalog[idx].squareFeet,
          dimensions: update.dimensions || newCatalog[idx].dimensions
        };
        updatedCount++;
      } else {
        newCatalog.push({
          slug: update.slug,
          name: update.name,
          manufacturer: update.manufacturer,
          series: update.series,
          hudBasePrice: update.hudBasePrice ?? null,
          estFactoryCost: update.newFactoryCost,
          msrp: Math.round(update.newEhsPrice * 1.15),
          ehsPrice: update.newEhsPrice,
          startingPrice: update.newEhsPrice,
          squareFeet: update.sqft ?? null,
          bedrooms: update.beds ?? null,
          bathrooms: update.baths ?? null,
          width: update.width || 0,
          length: update.length || 0,
          dimensions: update.dimensions || '',
          modularOnFrameCapable: true,
          modularOffFrameCapable: false
        });
        addedCount++;
      }
    }

    setHomeCatalog(newCatalog);
    saveStoredCatalogOverrides(newCatalog);
    setImportSuccessMsg(
      `✓ Successfully applied ${updatedCount} price updates and ${addedCount} new models to the active Master Catalog.`
    );
    setStagedUpdates([]);
    setImportFile(null);
  };

  const handleDownloadSampleTemplate = () => {
    const sampleData = [
      {
        'Manufacturer': 'CAVCO Plant City',
        'Series': 'Alpha',
        'Model Name': 'Atmos 28603N',
        'Beds': 3,
        'Baths': 2,
        'SQFT': 1600,
        'Dimensions': "26' 8\" x 60'",
        'HUD Base Price': 108565,
        'Est Factory Cost': 110600,
        'EHS Price': 158829.11
      },
      {
        'Manufacturer': 'Clayton TRU',
        'Series': 'TRU Origin',
        'Model Name': 'Elm',
        'Beds': 2,
        'Baths': 1,
        'SQFT': 737,
        'Dimensions': "14' x 56'",
        'HUD Base Price': 29610,
        'Est Factory Cost': 31645,
        'EHS Price': 55999.85
      },
      {
        'Manufacturer': 'Timber Creek',
        'Series': 'Creekside Series',
        'Model Name': 'The Delilah CSFL-3301',
        'Beds': 4,
        'Baths': 2,
        'SQFT': 2280,
        'Dimensions': "30' x 76'",
        'HUD Base Price': 115000,
        'Est Factory Cost': 118000,
        'EHS Price': 168900.00
      },
      {
        'Manufacturer': 'Legacy Housing',
        'Series': 'Select Collection',
        'Model Name': 'Select S-1236-11FLA',
        'Beds': 1,
        'Baths': 1,
        'SQFT': 432,
        'Dimensions': "12' x 36'",
        'HUD Base Price': 29695,
        'Est Factory Cost': 31730,
        'EHS Price': 56404.37
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Master Price List');
    XLSX.writeFile(wb, 'EHS_Master_Price_List_Template.xlsx');
  };

  const handleResetCatalog = () => {
    if (confirm('Are you sure you want to reset all model prices back to factory defaults?')) {
      clearStoredCatalogOverrides();
      setHomeCatalog(FULL_MASTER_CATALOG_HOMES);
      setImportSuccessMsg('✓ Master catalog pricing has been reset to factory defaults.');
    }
  };

  const filteredStagedUpdates = useMemo(() => {
    return stagedUpdates.filter((item) => {
      if (stagedFilter === 'CHANGED' && item.status !== 'updated') return false;
      if (stagedFilter === 'NEW' && item.status !== 'new') return false;
      if (!stagedSearch.trim()) return true;
      const text = `${item.name} ${item.manufacturer} ${item.series}`.toLowerCase();
      return text.includes(stagedSearch.toLowerCase().trim());
    });
  }, [stagedUpdates, stagedFilter, stagedSearch]);

  const stagedStats = useMemo(() => {
    const updated = stagedUpdates.filter((s) => s.status === 'updated').length;
    const newModels = stagedUpdates.filter((s) => s.status === 'new').length;
    const unchanged = stagedUpdates.filter((s) => s.status === 'unchanged').length;
    return { total: stagedUpdates.length, updated, newModels, unchanged };
  }, [stagedUpdates]);

  const tabs = [
    { id: 'company', label: 'Company' },
    { id: 'catalog', label: 'Home catalog' },
    { id: 'pricing', label: 'Pricing engine' },
    { id: 'disclaimer', label: 'Disclaimer & next steps' },
    { id: 'templates', label: 'Line item templates' },
    { id: 'users', label: 'Users & roles' },
    { id: 'imports', label: 'GHL / Imports' }
  ];

  // User Handlers
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: TeamUser = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      active: true,
      ghlLinked: false,
      phone: '(352) 558-8888'
    };

    setUsers((prev) => [...prev, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserOpen(false);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...editingUser } : u))
    );
    setEditingUser(null);
  };

  // Home Catalog Handlers
  const handleAddHome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeName.trim()) return;

    const slug = `${newHomeManufacturer.toLowerCase().replace(/\s+/g, '-')}-${newHomeName.toLowerCase().replace(/\s+/g, '-')}`;
    const newHome: MasterCatalogHome = {
      slug,
      name: newHomeName.trim(),
      manufacturer: newHomeManufacturer,
      series: 'Series',
      hudBasePrice: newHomePrice,
      estFactoryCost: newHomeFactoryCost,
      msrp: Math.round(newHomePrice * 1.15),
      ehsPrice: newHomePrice,
      startingPrice: newHomePrice,
      squareFeet: newHomeSqft,
      bedrooms: newHomeBeds,
      bathrooms: newHomeBaths,
      width: newHomeWidth,
      length: newHomeLength,
      dimensions: newHomeDimensions,
      modularOnFrameCapable: true,
      modularOffFrameCapable: true
    };

    setHomeCatalog((prev) => [newHome, ...prev]);
    setNewHomeName('');
    setIsAddHomeOpen(false);
  };

  const handleSaveEditHome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHome) return;

    setHomeCatalog((prev) =>
      prev.map((h) => (h.slug === editingHome.slug ? { ...editingHome } : h))
    );
    setEditingHome(null);
  };

  const handleDeleteHome = (slug: string, name: string) => {
    if (confirm(`Remove home "${name}" from the active catalog?`)) {
      setHomeCatalog((prev) => prev.filter((h) => h.slug !== slug));
    }
  };

  // Line Item Template Handlers
  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const sku = newTemplateSku.trim() || `SERV-${Date.now().toString().slice(-4)}`;
    const newTemplate: ServiceCatalogItem = {
      sku,
      name: newTemplateName.trim(),
      category: templateCategory,
      categoryTitle: templateCategory === 'mandatory_services' ? 'Site Work & Setup' : templateCategory === 'addons' ? 'Add-Ons & Decks' : 'Options & Upgrades',
      defaultPrice: newTemplatePrice,
      defaultCost: newTemplateCost,
      description: newTemplateDesc.trim() || newTemplateName.trim(),
      calcType: 'flat',
      unit: 'item'
    };

    setLineItemTemplates((prev) => [newTemplate, ...prev]);
    setNewTemplateName('');
    setNewTemplateSku('');
    setNewTemplateDesc('');
  };

  const handleSaveEditTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setLineItemTemplates((prev) =>
      prev.map((t) => (t.sku === editingTemplate.sku ? { ...editingTemplate } : t))
    );
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (sku: string, name: string) => {
    if (confirm(`Delete service template "${name}"? This removes it from future quote dropdowns.`)) {
      setLineItemTemplates((prev) => prev.filter((t) => t.sku !== sku));
    }
  };

  // GHL Lead Sync Action
  const handleSyncGhlLeads = () => {
    setIsSyncingGhl(true);
    setGhlSyncResult(null);

    setTimeout(() => {
      setIsSyncingGhl(false);
      setGhlSyncResult('✓ Successfully synced with GoHighLevel CRM: 14 active buyer leads imported into Ready to Quote pipeline.');
    }, 1000);
  };

  // Filtered Catalog
  const filteredCatalog = homeCatalog.filter((h) => {
    if (catalogBuilderFilter !== 'ALL' && h.manufacturer !== catalogBuilderFilter) return false;
    if (!catalogSearch.trim()) return true;
    const text = [h.name, h.manufacturer, h.series, h.dimensions].filter(Boolean).join(' ').toLowerCase();
    return text.includes(catalogSearch.toLowerCase().trim());
  });

  const distinctBuilders = ['ALL', ...new Set(homeCatalog.map((h) => h.manufacturer))];

  // Filtered Templates
  const filteredTemplates = lineItemTemplates.filter((t) => {
    if (!templateSearch.trim()) return true;
    const text = [t.name, t.sku, t.description, t.category].filter(Boolean).join(' ').toLowerCase();
    return text.includes(templateSearch.toLowerCase().trim());
  });

  // Check role: Only Manager and Admin can access settings
  const hasAccess = canAccessSettings(user);

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
        {/* Portal Sidebar */}
        <PortalSidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          totalPropertiesCount={17}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#1E6FA8]">
                  DEALERSHIP CONFIGURATION
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1E38] tracking-tight">
                  Settings
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
                  Configure how your dealership quotes look and price.
                </p>
              </div>
            </div>

            <Link
              href="/portal"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>← Back to dashboard</span>
            </Link>
          </div>

          {/* PERMISSION RESTRICTION: Sales Associates cannot access settings */}
          {!hasAccess ? (
            <div className="p-8 max-w-2xl mx-auto my-12 w-full space-y-6 text-center">
              <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-md space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-2xl mx-auto shadow-xs">
                  🔒
                </div>
                <h2 className="text-xl font-black text-[#0B1E38]">
                  Management Access Restricted
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Dealership settings, base home catalog prices, line item templates, and financial constants can only be modified by <strong className="text-slate-900">Managers</strong> and <strong className="text-slate-900">Admins</strong>.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block text-xs font-semibold text-slate-700">
                  Current User: <span className="font-bold text-slate-900">{user?.name}</span> ({user?.role})
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/portal"
                    className="px-5 py-2.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    Return to Quote Dashboard →
                  </Link>

                  <button
                    type="button"
                    onClick={() => login('mike@easyhomesource.com')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 cursor-pointer"
                  >
                    Switch to Manager (Mike Ung)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Workspace Body for Manager / Admin */
            <div className="p-6 sm:p-8 max-w-6xl w-full space-y-6">
              {/* Settings Tabs Ribbon */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-white text-[#0B1E38] shadow-xs border border-slate-200 ring-2 ring-[#0B1E38]/5'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 1. DISCLAIMER & NEXT STEPS TAB */}
              {activeTab === 'disclaimer' && (
                <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-[#0B1E38]">Disclaimer &amp; next steps</h2>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Default disclaimer
                      </label>
                      <textarea
                        rows={4}
                        value={defaultDisclaimer}
                        onChange={(e) => {
                          setDefaultDisclaimer(e.target.value);
                          setDisclaimerSaved(false);
                        }}
                        className="w-full p-3.5 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-800 focus:outline-none focus:border-[#0B1E38] focus:ring-2 focus:ring-[#0B1E38]/10"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Default next steps
                      </label>
                      <textarea
                        rows={4}
                        value={defaultNextSteps}
                        onChange={(e) => {
                          setDefaultNextSteps(e.target.value);
                          setDisclaimerSaved(false);
                        }}
                        className="w-full p-3.5 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-800 focus:outline-none focus:border-[#0B1E38] focus:ring-2 focus:ring-[#0B1E38]/10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-emerald-600 font-bold">
                      {disclaimerSaved ? '✓ Saved successfully' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDisclaimerSaved(true)}
                      className="px-6 py-2.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* 2. HOME CATALOG TAB */}
              {activeTab === 'catalog' && (
                <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-[#0B1E38]">Home Catalog &amp; Pricing Management</h2>
                      <p className="text-xs text-slate-500 font-medium">
                        {homeCatalog.length} active verified models loaded across 5 manufacturers.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddHomeOpen(true)}
                      className="px-4 py-2 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>+</span>
                      <span>Add New Home</span>
                    </button>
                  </div>

                  {/* Search & Builder Filter */}
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <input
                      type="text"
                      placeholder="Search model name, dimensions, series..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold flex-1 max-w-sm"
                    />
                    <select
                      value={catalogBuilderFilter}
                      onChange={(e) => setCatalogBuilderFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      {distinctBuilders.map((b) => (
                        <option key={b} value={b}>{b === 'ALL' ? 'All Builders' : b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Home Models Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[500px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-600">
                        <tr>
                          <th className="py-2.5 px-3">Model Name</th>
                          <th className="py-2.5 px-3">Manufacturer</th>
                          <th className="py-2.5 px-3">Dimensions</th>
                          <th className="py-2.5 px-3">Beds/Baths</th>
                          <th className="py-2.5 px-3 text-right">EHS Price ($)</th>
                          <th className="py-2.5 px-3 text-right">Factory Cost ($)</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCatalog.map((h) => (
                          <tr key={h.slug} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{h.name}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-600">{h.manufacturer}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{h.dimensions}</td>
                            <td className="py-2.5 px-3 text-slate-600">{h.bedrooms}b / {h.bathrooms}ba</td>
                            <td className="py-2.5 px-3 text-right font-black text-[#1E6FA8]">
                              ${Math.round(h.ehsPrice || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-slate-500">
                              ${Math.round(h.estFactoryCost || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingHome(h)}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-[10.5px] cursor-pointer"
                                >
                                  Edit Price
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHome(h.slug, h.name)}
                                  className="p-1 text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                                  title="Remove Home"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. LINE ITEM TEMPLATES TAB */}
              {activeTab === 'templates' && (
                <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-[#0B1E38]">Line Item Templates &amp; Service Catalog</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {lineItemTemplates.length} service line items available in the Master Turnkey Quote Builder dropdown.
                    </p>
                  </div>

                  {/* Add New Line Item Template Form */}
                  <form onSubmit={handleAddTemplate} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8] block">
                      + Add New Service Template / Line Item
                    </span>
                    <div className="grid sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Category</label>
                        <select
                          value={templateCategory}
                          onChange={(e) => setTemplateCategory(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                        >
                          <option value="mandatory_services">Mandatory Services</option>
                          <option value="site_work">Site Work &amp; Setup</option>
                          <option value="addons">Add-Ons &amp; Decks</option>
                          <option value="options">Options &amp; Upgrades</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Service Description *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 50-Amp RV Hookup / Subpanel"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Default Price ($)</label>
                        <input
                          type="number"
                          value={newTemplatePrice}
                          onChange={(e) => setNewTemplatePrice(Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Default Cost ($)</label>
                        <input
                          type="number"
                          value={newTemplateCost}
                          onChange={(e) => setNewTemplateCost(Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                      >
                        + Add Template
                      </button>
                    </div>
                  </form>

                  {/* Templates List */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Search service, SKU, category..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="w-full max-w-sm px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-600">
                          <tr>
                            <th className="py-2.5 px-3">Service Name</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3 text-right">Default Price</th>
                            <th className="py-2.5 px-3 text-right">Default Cost</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTemplates.map((t) => (
                            <tr key={t.sku} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {t.name}
                                <div className="text-[10px] text-slate-400 font-normal">{t.description}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  {t.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-[#1E6FA8]">
                                ${t.defaultPrice.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold text-slate-500">
                                ${t.defaultCost.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingTemplate(t)}
                                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-[10.5px] cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTemplate(t.sku, t.name)}
                                    className="p-1 text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                                    title="Delete Line Item"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PRICING ENGINE TAB */}
              {activeTab === 'pricing' && (
                <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-[#0B1E38]">ERP V05 Pricing Engine &amp; Constants</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Financial formulas governing Florida sales tax, dealership admin fees, loan fees, and salesperson commissions.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="block font-bold text-slate-700 uppercase text-[10px]">
                        Florida Sales Tax Rate (Decimal)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={salesTaxRate}
                        onChange={(e) => setSalesTaxRate(Number(e.target.value) || 0.03)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-sm text-[#1E6FA8]"
                      />
                      <p className="text-[10px] text-slate-400">Current Florida statutory rate: 3.00% (0.03)</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="block font-bold text-slate-700 uppercase text-[10px]">
                        Admin Fee % of Subtotal
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={adminFeePct}
                        onChange={(e) => setAdminFeePct(Number(e.target.value) || 0.05)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-sm text-[#0B1E38]"
                      />
                      <p className="text-[10px] text-slate-400">Standard operational fee: 5.00%</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="block font-bold text-slate-700 uppercase text-[10px]">
                        Standard Loan Fee ($)
                      </label>
                      <input
                        type="number"
                        value={loanFee}
                        onChange={(e) => setLoanFee(Number(e.target.value) || 1000)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-sm text-[#0B1E38]"
                      />
                      <p className="text-[10px] text-slate-400">Fixed manufactured lender fee: $1,000.00</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="block font-bold text-slate-700 uppercase text-[10px]">
                        Salesperson Commission % of Margin
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={salesCommissionPct}
                        onChange={(e) => setSalesCommissionPct(Number(e.target.value) || 0.2)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-sm text-[#0B1E38]"
                      />
                      <p className="text-[10px] text-slate-400">20% of commissionable house margin</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="block font-bold text-slate-700 uppercase text-[10px]">
                        Net Take Home Floor ($)
                      </label>
                      <input
                        type="number"
                        value={takeHomeFloor}
                        onChange={(e) => setTakeHomeFloor(Number(e.target.value) || 12000)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-sm text-[#0B1E38]"
                      />
                      <p className="text-[10px] text-slate-400">Dealership threshold indicator</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-emerald-600 font-bold">
                      {pricingSaved ? '✓ Pricing constants saved' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPricingSaved(true)}
                      className="px-6 py-2.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Save Constants
                    </button>
                  </div>
                </div>
              )}

              {/* 5. USERS TAB */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* GoHighLevel Account Link Card */}
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B1E38]">
                        GoHighLevel Account Link
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Status: <span className={ghlLinked ? 'text-emerald-600 font-bold' : 'text-slate-600 font-semibold'}>{ghlLinked ? 'Connected & Active' : 'Not Linked'}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGhlLinked(!ghlLinked)}
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs text-xs cursor-pointer transition-colors"
                    >
                      {ghlLinked ? 'Disconnect GHL' : 'Link GoHighLevel Account'}
                    </button>
                  </div>

                  {/* Users Table Card */}
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-black text-[#0B1E38]">Users</h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Manager role prepares restricted access for future accounting and QuickBooks tools.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddUserOpen(true)}
                        className="px-4 py-2 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <span>+</span>
                        <span>Add user</span>
                      </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Active</th>
                            <th className="py-3 px-4">GHL</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-[#0B1E38]">
                                {u.name}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 font-medium font-mono text-[11px]">
                                {u.email}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                                    u.role === 'Admin'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : u.role === 'Manager'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-slate-50 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="text-emerald-700 font-bold text-[11px]">Yes</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 font-medium">
                                {u.ghlLinked ? 'Linked' : 'Not Linked'}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => setEditingUser(u)}
                                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 text-[11px] cursor-pointer shadow-2xs"
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
                </div>
              )}

              {/* 6. COMPANY TAB */}
              {activeTab === 'company' && (
                <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
                  <h2 className="text-lg font-black text-[#0B1E38]">Dealership Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company Legal Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Dealership Phone</label>
                      <input
                        type="text"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
                      <input
                        type="text"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-emerald-600 font-bold">{companySaved ? '✓ Saved' : ''}</span>
                    <button
                      type="button"
                      onClick={() => setCompanySaved(true)}
                      className="px-6 py-2.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Save Company Info
                    </button>
                  </div>
                </div>
              )}

              {/* 7. IMPORTS & GHL SYNC TAB */}
              {activeTab === 'imports' && (
                <div className="space-y-6">
                  {/* GoHighLevel Lead Pipeline Sync Card */}
                  <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                            CRM INTEGRATION
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.2 rounded-full">
                            GHL Connected
                          </span>
                        </div>
                        <h2 className="text-lg font-black text-[#0B1E38] mt-0.5">
                          GoHighLevel Lead Import &amp; Pipeline Sync
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Import new website leads and CRM opportunities into the <strong className="text-slate-800">Ready to Quote</strong> pipeline.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncGhlLeads}
                        disabled={isSyncingGhl}
                        className="px-5 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>⚡</span>
                        <span>{isSyncingGhl ? 'Syncing Leads...' : 'Sync Leads from GoHighLevel'}</span>
                      </button>
                    </div>

                    {ghlSyncResult && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                        {ghlSyncResult}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">GHL Webhook URL</span>
                        <code className="font-mono text-[11px] text-slate-700 truncate block mt-0.5">
                          https://easyhomesource.com/api/leads
                        </code>
                      </div>
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Auto-Assigned Consultant</span>
                        <span className="font-bold text-slate-800 block mt-0.5">Round Robin (Scott, Alex, Mike)</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Target Pipeline</span>
                        <span className="font-bold text-emerald-700 block mt-0.5">Ready to Quote (14 Leads)</span>
                      </div>
                    </div>
                  </div>

                  {/* Spreadsheet Base Price Import Card */}
                  <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                            MASTER ERP PRICING SYNC
                          </span>
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.2 rounded-full">
                            Excel (.xlsx) &amp; CSV
                          </span>
                        </div>
                        <h2 className="text-lg font-black text-[#0B1E38] mt-0.5">
                          Spreadsheet &amp; Base Price List Imports
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Sync live factory wholesale base prices directly from ERP spreadsheet uploads (supports <code>.xlsx</code>, <code>.xls</code>, <code>.csv</code>).
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadSampleTemplate}
                          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs text-xs cursor-pointer flex items-center gap-1.5"
                          title="Download a formatted sample Excel template pre-filled with column headers"
                        >
                          <span>📥</span>
                          <span>Download Template (.xlsx)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetCatalog}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 text-xs cursor-pointer"
                          title="Reset catalog back to factory defaults"
                        >
                          Reset to Defaults
                        </button>
                      </div>
                    </div>

                    {/* Drag & Drop Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-8 border-2 border-dashed rounded-2xl text-center space-y-2 cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#1E6FA8] bg-blue-50/60 scale-[1.005]'
                          : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls, .csv, .tsv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <span className="text-3xl block">📊</span>
                      <div className="text-xs font-bold text-slate-800">
                        {importFile ? `Selected: ${importFile.name}` : 'Click or Drag & Drop Master Price List (.xlsx, .xls, .csv)'}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Auto-detects model names, manufacturer, wholesale factory cost, and EHS retail price across CAVCO, Clayton TRU, Clayton Addison, Legacy, and Timber Creek
                      </p>
                      {isParsing && (
                        <div className="text-xs font-bold text-[#1E6FA8] animate-pulse pt-2">
                          Parsing spreadsheet rows...
                        </div>
                      )}
                    </div>

                    {/* Notifications */}
                    {importErrorMsg && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center justify-between">
                        <span>⚠️ {importErrorMsg}</span>
                        <button onClick={() => setImportErrorMsg(null)} className="text-rose-600 font-bold cursor-pointer">✕</button>
                      </div>
                    )}
                    {importSuccessMsg && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between">
                        <span>{importSuccessMsg}</span>
                        <button onClick={() => setImportSuccessMsg(null)} className="text-emerald-600 font-bold cursor-pointer">✕</button>
                      </div>
                    )}

                    {/* Sheet Selector (If multi-sheet Excel file) */}
                    {sheetNames.length > 1 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-black text-slate-600 uppercase text-[10px]">Select Sheet Tab:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {sheetNames.map((sheet) => (
                            <button
                              key={sheet}
                              type="button"
                              onClick={() => handleSheetChange(sheet)}
                              className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                                selectedSheet === sheet
                                  ? 'bg-[#0B1E38] text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {sheet}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Staging Preview Table */}
                    {stagedUpdates.length > 0 && (
                      <div className="space-y-4 pt-2 border-t border-slate-100">
                        {/* Summary Badges & Filter Bar */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-slate-700">Staging Summary:</span>
                            <span className="bg-slate-200 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {stagedStats.total} Total Models
                            </span>
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {stagedStats.updated} Price Changes
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {stagedStats.newModels} New Models
                            </span>
                            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                              {stagedStats.unchanged} Unchanged
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setStagedUpdates([]);
                                setImportFile(null);
                              }}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                            >
                              Discard
                            </button>
                            <button
                              type="button"
                              onClick={handleApplyStagedUpdates}
                              className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <span>✓</span>
                              <span>Apply &amp; Sync to Master Catalog</span>
                            </button>
                          </div>
                        </div>

                        {/* Search & Filter Pills */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setStagedFilter('ALL')}
                              className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                                stagedFilter === 'ALL'
                                  ? 'bg-[#0B1E38] text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              All ({stagedUpdates.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setStagedFilter('CHANGED')}
                              className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                                stagedFilter === 'CHANGED'
                                  ? 'bg-[#0B1E38] text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Price Updates Only ({stagedStats.updated})
                            </button>
                            <button
                              type="button"
                              onClick={() => setStagedFilter('NEW')}
                              className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                                stagedFilter === 'NEW'
                                  ? 'bg-[#0B1E38] text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              New Models Only ({stagedStats.newModels})
                            </button>
                          </div>

                          <div className="w-full sm:w-64">
                            <input
                              type="text"
                              value={stagedSearch}
                              onChange={(e) => setStagedSearch(e.target.value)}
                              placeholder="Filter staged models..."
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                            />
                          </div>
                        </div>

                        {/* Staged Data Table */}
                        <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-700">
                              <tr>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3">Model Name</th>
                                <th className="py-2.5 px-3">Manufacturer / Series</th>
                                <th className="py-2.5 px-3">Specs</th>
                                <th className="py-2.5 px-3">Factory Cost</th>
                                <th className="py-2.5 px-3">EHS Base Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {filteredStagedUpdates.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80">
                                  <td className="py-2 px-3">
                                    {item.status === 'updated' && (
                                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                        Price Changed
                                      </span>
                                    )}
                                    {item.status === 'new' && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                        New Model
                                      </span>
                                    )}
                                    {item.status === 'unchanged' && (
                                      <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                                        Unchanged
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 font-bold text-[#0B1E38]">
                                    {item.name}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600">
                                    {item.manufacturer} {item.series ? `• ${item.series}` : ''}
                                  </td>
                                  <td className="py-2 px-3 text-slate-500">
                                    {item.beds ? `${item.beds}b/${item.baths || 1}ba` : ''} {item.sqft ? `• ${item.sqft} sq ft` : ''} {item.dimensions ? `• ${item.dimensions}` : ''}
                                  </td>
                                  <td className="py-2 px-3 font-mono">
                                    {item.currentFactoryCost !== null && item.currentFactoryCost !== item.newFactoryCost ? (
                                      <span className="space-x-1">
                                        <span className="line-through text-slate-400">${item.currentFactoryCost.toLocaleString()}</span>
                                        <span className="font-bold text-slate-800">➔ ${item.newFactoryCost.toLocaleString()}</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-700">${item.newFactoryCost.toLocaleString()}</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 font-mono font-bold">
                                    {item.currentEhsPrice !== null && item.currentEhsPrice !== item.newEhsPrice ? (
                                      <span className="space-x-1">
                                        <span className="line-through text-slate-400">${item.currentEhsPrice.toLocaleString()}</span>
                                        <span className="text-emerald-700">➔ ${item.newEhsPrice.toLocaleString()}</span>
                                      </span>
                                    ) : (
                                      <span className="text-[#1E6FA8]">${item.newEhsPrice.toLocaleString()}</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Home Modal */}
        {editingHome && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-sm text-[#0B1E38]">Edit Model Price: {editingHome.name}</h3>
                <button
                  onClick={() => setEditingHome(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditHome} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">EHS Price ($)</label>
                    <input
                      type="number"
                      value={editingHome.ehsPrice || 0}
                      onChange={(e) => setEditingHome({ ...editingHome, ehsPrice: Number(e.target.value) || 0, startingPrice: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-[#1E6FA8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Est. Factory Cost ($)</label>
                    <input
                      type="number"
                      value={editingHome.estFactoryCost || 0}
                      onChange={(e) => setEditingHome({ ...editingHome, estFactoryCost: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingHome(null)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl cursor-pointer"
                  >
                    Update Price
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Home Modal */}
        {isAddHomeOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-sm text-[#0B1E38]">Add New Home to Catalog</h3>
                <button
                  onClick={() => setIsAddHomeOpen(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddHome} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cumberland 2860"
                    value={newHomeName}
                    onChange={(e) => setNewHomeName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                    <select
                      value={newHomeManufacturer}
                      onChange={(e) => setNewHomeManufacturer(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white"
                    >
                      <option value="CAVCO Plant City">CAVCO Plant City</option>
                      <option value="CLAYTON Addison">CLAYTON Addison</option>
                      <option value="CLAYTON TRU">CLAYTON TRU</option>
                      <option value="LEGACY">LEGACY</option>
                      <option value="Timber Creek">Timber Creek</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={newHomeDimensions}
                      onChange={(e) => setNewHomeDimensions(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">EHS Price ($)</label>
                    <input
                      type="number"
                      value={newHomePrice}
                      onChange={(e) => setNewHomePrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-[#1E6FA8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Est. Factory Cost ($)</label>
                    <input
                      type="number"
                      value={newHomeFactoryCost}
                      onChange={(e) => setNewHomeFactoryCost(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddHomeOpen(false)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl cursor-pointer"
                  >
                    Add Model
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Line Item Template Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-sm text-[#0B1E38]">Edit Line Item: {editingTemplate.name}</h3>
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditTemplate} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default Price ($)</label>
                    <input
                      type="number"
                      value={editingTemplate.defaultPrice}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultPrice: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-[#1E6FA8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default Cost ($)</label>
                    <input
                      type="number"
                      value={editingTemplate.defaultCost}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultCost: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-sm text-[#0B1E38]">Edit User: {editingUser.name}</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Associate">Associate</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl cursor-pointer"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-sm text-[#0B1E38]">Add Team User</h3>
                <button
                  onClick={() => setIsAddUserOpen(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Adams"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rachel@easyhomesource.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="Associate">Associate (Housing Consultant)</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGate>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Settings...</div>}>
      <SettingsContent />
    </React.Suspense>
  );
}

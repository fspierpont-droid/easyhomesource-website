import {
  AC_HEATING_MATRIX,
  DIRT_PAD_LOADS_TABLE,
  SERVICE_CATALOG,
  getRecommendedSepticTankSize,
} from '@/data/pricingSpreadsheet';
import type { SelectedQuoteLineItem } from '@/data/quotesStore';

export type WaterSource = 'well' | 'city_water' | 'existing' | 'none';
export type SewerSource = 'septic' | 'city_sewer' | 'existing' | 'none';
export type AcSystemType = 'straight_cool' | 'heat_pump';
export type AcEquipmentType = 'package' | 'split';

export interface SiteSystemSelection {
  acEnabled: boolean;
  acTonnage: number;
  acSystemType: AcSystemType;
  acEquipmentType: AcEquipmentType;
  waterSource: WaterSource;
  sewerSource: SewerSource;
  electricPanel: boolean;
  dirtPadLoads: number;
}

const HVAC_PREFIX = 'HVAC-';
const WELL_PREFIXES = ['SITE-WELL-'];
const WATER_HOOKUP_PREFIXES = ['SITE-WATER-HOOKUP'];
const WATER_EXISTING_SKU = 'SITE-WATER-EXISTING';
const SEPTIC_PREFIXES = ['SITE-SEPTIC-'];
const SEWER_HOOKUP_PREFIXES = ['SITE-SEWER-HOOKUP'];
const SEWER_EXISTING_SKU = 'SITE-SEWER-EXISTING';
const ELECTRIC_PREFIXES = ['ELEC-PANEL-NEW-POST', 'SITE-ELEC-PANEL'];
const DIRT_PREFIXES = ['SITE-DIRTPAD'];

function startsWithAny(sku: string, prefixes: string[]) {
  return prefixes.some((prefix) => sku.startsWith(prefix));
}

function lineFromCatalog(sku: string, id = `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`): SelectedQuoteLineItem | null {
  const source = SERVICE_CATALOG.find((item) => item.sku === sku);
  if (!source) return null;
  return {
    id,
    sku: source.sku,
    name: source.name,
    description: source.description,
    category: source.category,
    unitPrice: Number(source.defaultPrice) || 0,
    unitCost: Number(source.defaultCost) || 0,
    quantity: 1,
    totalPrice: Number(source.defaultPrice) || 0,
    totalCost: Number(source.defaultCost) || 0,
  };
}

function existingConnectionLine(kind: 'water' | 'sewer'): SelectedQuoteLineItem {
  const water = kind === 'water';
  return {
    id: `site-existing-${kind}-${Date.now()}`,
    sku: water ? WATER_EXISTING_SKU : SEWER_EXISTING_SKU,
    name: water ? 'Existing Water Connection' : 'Existing Sewer / Septic Connection',
    description: water
      ? 'Customer/site has an existing water source or connection; no new EHS well or city-water hookup is included in this quote.'
      : 'Customer/site has an existing sewer or septic connection; no new EHS sewer hookup or septic system is included in this quote.',
    category: 'addons',
    unitPrice: 0,
    unitCost: 0,
    quantity: 1,
    totalPrice: 0,
    totalCost: 0,
  };
}

export function recommendedAcTonnage(squareFeet: number) {
  const sqft = Number(squareFeet) || 0;
  if (sqft <= 0) return 2;
  const needed = Math.round((sqft / 500) * 2) / 2;
  return Math.min(5, Math.max(2, needed));
}

function parseAcLine(line?: SelectedQuoteLineItem) {
  if (!line) return null;
  const sku = String(line.sku || '').toUpperCase();
  const name = String(line.name || '').toLowerCase();
  const tonMatch = `${sku} ${name}`.match(/(2\.5|3\.5|2|3|4|5)[\s._-]*(?:ton)?/i);
  const tonnage = tonMatch ? Number(tonMatch[1]) : 3;
  const acSystemType: AcSystemType = sku.includes('-HP-') || name.includes('heat pump') ? 'heat_pump' : 'straight_cool';
  const acEquipmentType: AcEquipmentType = sku.includes('SPLIT') || name.includes('split') ? 'split' : 'package';
  return { tonnage, acSystemType, acEquipmentType };
}

export function inferSiteSystems(lines: SelectedQuoteLineItem[], squareFeet: number): SiteSystemSelection {
  const hvac = lines.find((line) => String(line.sku || '').startsWith(HVAC_PREFIX));
  const ac = parseAcLine(hvac);
  const well = lines.some((line) => startsWithAny(String(line.sku || ''), WELL_PREFIXES));
  const waterHookup = lines.some((line) => startsWithAny(String(line.sku || ''), WATER_HOOKUP_PREFIXES));
  const waterExisting = lines.some((line) => String(line.sku || '') === WATER_EXISTING_SKU);
  const septic = lines.some((line) => startsWithAny(String(line.sku || ''), SEPTIC_PREFIXES));
  const sewerHookup = lines.some((line) => startsWithAny(String(line.sku || ''), SEWER_HOOKUP_PREFIXES));
  const sewerExisting = lines.some((line) => String(line.sku || '') === SEWER_EXISTING_SKU);
  const electricPanel = lines.some((line) => startsWithAny(String(line.sku || ''), ELECTRIC_PREFIXES));
  const dirt = lines.find((line) => startsWithAny(String(line.sku || ''), DIRT_PREFIXES));
  const dirtMatch = `${dirt?.sku || ''} ${dirt?.name || ''}`.match(/(\d+)\s*[- ]?load/i);

  return {
    acEnabled: Boolean(hvac),
    acTonnage: ac?.tonnage || recommendedAcTonnage(squareFeet),
    acSystemType: ac?.acSystemType || 'heat_pump',
    acEquipmentType: ac?.acEquipmentType || 'package',
    waterSource: well ? 'well' : waterHookup ? 'city_water' : waterExisting ? 'existing' : 'none',
    sewerSource: septic ? 'septic' : sewerHookup ? 'city_sewer' : sewerExisting ? 'existing' : 'none',
    electricPanel,
    dirtPadLoads: dirtMatch ? Number(dirtMatch[1]) : dirt ? 2 : 0,
  };
}

export function buildAcLine(selection: SiteSystemSelection): SelectedQuoteLineItem {
  const tonnage = Math.min(5, Math.max(2, Math.round((Number(selection.acTonnage) || 2) * 2) / 2));
  const row = AC_HEATING_MATRIX[`${tonnage}|${selection.acSystemType}`] || AC_HEATING_MATRIX[`3|heat_pump`];
  const split = selection.acEquipmentType === 'split';
  const unitCost = split ? row.splitCost : row.packageCost;
  const unitPrice = split ? row.splitPrice : row.packagePrice;
  const tonsToken = String(tonnage).replace('.', '_');
  const modeToken = selection.acSystemType === 'heat_pump' ? 'HP' : 'SC';
  const equipmentToken = split ? 'SPLIT' : 'PKG';
  const modeLabel = selection.acSystemType === 'heat_pump' ? 'Heat Pump' : 'Straight Cool';
  const equipmentLabel = split ? 'Split' : 'Package';

  return {
    id: `site-hvac-${Date.now()}`,
    sku: `HVAC-${equipmentToken}-${modeToken}-${tonsToken}TON`,
    name: `${tonnage}-Ton ${equipmentLabel} ${modeLabel}`,
    description: `Master Quote 5 HVAC matrix: ${tonnage} ton, ${equipmentLabel.toLowerCase()}, ${modeLabel.toLowerCase()}.`,
    category: 'mandatory_services',
    unitPrice,
    unitCost,
    quantity: 1,
    totalPrice: unitPrice,
    totalCost: unitCost,
  };
}

function buildCustomSepticLine(size: number): SelectedQuoteLineItem {
  return {
    id: `site-septic-${Date.now()}`,
    sku: `SITE-SEPTIC-CUSTOM-${size}`,
    name: `${size.toLocaleString()}-Gallon Septic System - Verified Price Required`,
    description: 'Master Quote 5 only carries a verified table price for the 900-gallon base system. Enter the confirmed site-specific price for this larger system.',
    category: 'addons',
    unitPrice: 0,
    unitCost: 0,
    quantity: 1,
    totalPrice: 0,
    totalCost: 0,
  };
}

function replaceFamily(
  lines: SelectedQuoteLineItem[],
  predicate: (line: SelectedQuoteLineItem) => boolean,
  replacement: SelectedQuoteLineItem | null,
  preserveExistingWhen?: (line: SelectedQuoteLineItem) => boolean,
) {
  const existing = lines.find(predicate);
  if (existing && preserveExistingWhen?.(existing)) return lines;
  const retained = lines.filter((line) => !predicate(line));
  return replacement ? [...retained, replacement] : retained;
}

export function applySiteSystems(
  inputLines: SelectedQuoteLineItem[],
  selection: SiteSystemSelection,
  bedrooms: number,
  squareFeet: number,
): SelectedQuoteLineItem[] {
  let lines = [...inputLines];

  const hvacPredicate = (line: SelectedQuoteLineItem) => String(line.sku || '').startsWith(HVAC_PREFIX);
  if (selection.acEnabled) {
    const desired = buildAcLine(selection);
    lines = replaceFamily(lines, hvacPredicate, desired, (existing) => {
      const parsed = parseAcLine(existing);
      return Boolean(
        parsed &&
        parsed.tonnage === selection.acTonnage &&
        parsed.acSystemType === selection.acSystemType &&
        parsed.acEquipmentType === selection.acEquipmentType
      );
    });
  } else {
    lines = lines.filter((line) => !hvacPredicate(line));
  }

  const waterPredicate = (line: SelectedQuoteLineItem) => {
    const sku = String(line.sku || '');
    return startsWithAny(sku, [...WELL_PREFIXES, ...WATER_HOOKUP_PREFIXES]) || sku === WATER_EXISTING_SKU;
  };
  if (selection.waterSource === 'well') {
    const well = lineFromCatalog('SITE-WELL-4INCH');
    lines = replaceFamily(lines, waterPredicate, well, (existing) => startsWithAny(String(existing.sku || ''), WELL_PREFIXES));
  } else if (selection.waterSource === 'city_water') {
    const water = lineFromCatalog('SITE-WATER-HOOKUP');
    lines = replaceFamily(lines, waterPredicate, water, (existing) => startsWithAny(String(existing.sku || ''), WATER_HOOKUP_PREFIXES));
  } else if (selection.waterSource === 'existing') {
    lines = replaceFamily(lines, waterPredicate, existingConnectionLine('water'), (existing) => String(existing.sku || '') === WATER_EXISTING_SKU);
  } else {
    lines = lines.filter((line) => !waterPredicate(line));
  }

  const sewerPredicate = (line: SelectedQuoteLineItem) => {
    const sku = String(line.sku || '');
    return startsWithAny(sku, [...SEPTIC_PREFIXES, ...SEWER_HOOKUP_PREFIXES]) || sku === SEWER_EXISTING_SKU;
  };
  if (selection.sewerSource === 'septic') {
    const size = getRecommendedSepticTankSize(bedrooms, squareFeet);
    const septic = size <= 900 ? lineFromCatalog('SITE-SEPTIC-900') : buildCustomSepticLine(size);
    lines = replaceFamily(lines, sewerPredicate, septic, (existing) => {
      const sku = String(existing.sku || '');
      return size <= 900 ? sku === 'SITE-SEPTIC-900' : sku === `SITE-SEPTIC-CUSTOM-${size}`;
    });
  } else if (selection.sewerSource === 'city_sewer') {
    const sewerLine = lineFromCatalog('SITE-SEWER-HOOKUP-50');
    lines = replaceFamily(lines, sewerPredicate, sewerLine, (existing) => startsWithAny(String(existing.sku || ''), SEWER_HOOKUP_PREFIXES));
  } else if (selection.sewerSource === 'existing') {
    lines = replaceFamily(lines, sewerPredicate, existingConnectionLine('sewer'), (existing) => String(existing.sku || '') === SEWER_EXISTING_SKU);
  } else {
    lines = lines.filter((line) => !sewerPredicate(line));
  }

  const electricPredicate = (line: SelectedQuoteLineItem) => startsWithAny(String(line.sku || ''), ELECTRIC_PREFIXES);
  if (selection.electricPanel) {
    const electric = lineFromCatalog('ELEC-PANEL-NEW-POST');
    lines = replaceFamily(lines, electricPredicate, electric, () => true);
  } else {
    lines = lines.filter((line) => !electricPredicate(line));
  }

  const dirtPredicate = (line: SelectedQuoteLineItem) => startsWithAny(String(line.sku || ''), DIRT_PREFIXES);
  if (selection.dirtPadLoads > 0) {
    const loads = Math.min(20, Math.max(1, Math.round(selection.dirtPadLoads)));
    const row = DIRT_PAD_LOADS_TABLE.find((item) => item.loads === loads) || DIRT_PAD_LOADS_TABLE[0];
    const dirt: SelectedQuoteLineItem = {
      id: `site-dirt-${Date.now()}`,
      sku: `SITE-DIRTPAD-${loads}-LOAD${loads === 1 ? '' : 'S'}`,
      name: `Dirt Pad & Laser Site Grading (${loads} Load${loads === 1 ? '' : 's'})`,
      description: `Master Quote 5 paid ${loads}-load dirt-pad package. No dirt loads are included for free.`,
      category: 'site_work',
      unitPrice: row.price,
      unitCost: row.cost,
      quantity: 1,
      totalPrice: row.price,
      totalCost: row.cost,
    };
    lines = replaceFamily(lines, dirtPredicate, dirt, (existing) => String(existing.sku || '') === dirt.sku);
  } else {
    lines = lines.filter((line) => !dirtPredicate(line));
  }

  return lines;
}

export function recommendedSepticSize(bedrooms: number, squareFeet: number) {
  return getRecommendedSepticTankSize(bedrooms, squareFeet);
}

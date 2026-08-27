import type { SavedQuote, SelectedQuoteLineItem, DepositItem } from '@/data/quotesStore';
import type { QuoteFinancialTotals } from '@/data/pricingSpreadsheet';

type BackendQuote = Record<string, any>;

const number = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function normalizeStatus(value: unknown): SavedQuote['status'] {
  const normalized = String(value || 'DRAFT')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (['APPROVED', 'ACCEPTED'].includes(normalized)) return 'APPROVED';
  if (['IN_CONTRACT', 'CONTRACT', 'UNDER_CONTRACT'].includes(normalized)) return 'IN_CONTRACT';
  if (['LENDER_REVIEW', 'LENDER', 'FINANCING_REVIEW'].includes(normalized)) return 'LENDER_REVIEW';
  if (['SENT', 'SENT_TO_BUYER', 'SENT_TO_CUSTOMER', 'DELIVERED'].includes(normalized)) return 'SENT_TO_BUYER';
  return 'DRAFT';
}

function fromBackendLine(item: Record<string, any>, category: SelectedQuoteLineItem['category']): SelectedQuoteLineItem {
  const qty = number(item.qty, 1);
  const unitPrice = number(item.unit_price);
  const unitCost = number(item.cost);
  return {
    id: String(item.id || item.portal_id || item.service_id || item.sku || crypto.randomUUID()),
    sku: String(item.sku || item.service_id || ''),
    name: String(item.name || item.portal_name || item.description || 'Line Item'),
    category: (item.portal_category || category) as SelectedQuoteLineItem['category'],
    unitPrice,
    unitCost,
    quantity: qty,
    totalPrice: number(item.totalPrice, qty * unitPrice),
    totalCost: number(item.totalCost, qty * unitCost),
    description: String(item.portal_description || item.description || ''),
  };
}

function toBackendLine(item: SelectedQuoteLineItem) {
  return {
    id: item.id,
    portal_id: item.id,
    sku: item.sku,
    service_id: item.sku || undefined,
    name: item.name,
    portal_name: item.name,
    portal_category: item.category,
    description: item.description || item.name,
    portal_description: item.description || '',
    qty: item.quantity,
    unit_price: item.unitPrice,
    cost: item.unitCost,
    included_in_financing: true,
  };
}

function fromBackendDeposit(item: Record<string, any>): DepositItem {
  return {
    id: String(item.portal_id || item.id || crypto.randomUUID()),
    name: String(item.portal_name || item.label || 'Deposit'),
    amount: number(item.portal_amount ?? item.amount_required ?? item.amount_paid),
    date: String(item.portal_date || item.received_at || ''),
    status: String(item.portal_status || item.status || 'Pending'),
  };
}

function toBackendDeposit(item: DepositItem) {
  const received = item.status.toLowerCase() === 'received';
  return {
    label: item.name,
    amount_required: item.amount,
    amount_paid: received ? item.amount : 0,
    status: item.status,
    received_at: received ? item.date || null : null,
    portal_id: item.id,
    portal_name: item.name,
    portal_amount: item.amount,
    portal_date: item.date,
    portal_status: item.status,
  };
}

function financialTotals(totals: Record<string, any>): QuoteFinancialTotals {
  return {
    home_subtotal: number(totals.home_subtotal ?? totals.home_total),
    land_subtotal: number(totals.land_subtotal),
    delivery_total: number(totals.delivery_total),
    site_work_total: number(totals.site_work_total ?? totals.site_work_subtotal),
    addons_total: number(totals.addons_total ?? totals.addons_subtotal),
    discounts_total: number(totals.discounts_total),
    subtotal: number(totals.subtotal),
    financed_subtotal: number(totals.financed_subtotal ?? totals.subtotal),
    non_financed_subtotal: number(totals.non_financed_subtotal),
    tax_basis: number(totals.tax_basis),
    sales_tax_rate: number(totals.sales_tax_rate, 0.03),
    sales_tax_total: number(totals.sales_tax_total ?? totals.sales_tax),
    estimated_total: number(totals.estimated_total ?? totals.grand_total),
    factory_cost: number(totals.factory_cost),
    ehs_price_calculated: number(totals.ehs_price_calculated),
    house_gross_margin: number(totals.house_gross_margin ?? totals.gross_margin),
    commissionable_house_margin: number(totals.commissionable_house_margin),
    service_profit: number(totals.service_profit),
    admin_fee: number(totals.admin_fee),
    loan_fee: number(totals.loan_fee),
    salesperson_commission: number(totals.salesperson_commission ?? totals.agent_commission),
    net_take_home: number(totals.net_take_home),
    take_home_floor: number(totals.take_home_floor, 20000),
    target_met: Boolean(totals.target_met),
  };
}

export function fromBackendQuote(document: BackendQuote): SavedQuote {
  const home = document.home || {};
  const site = document.site || {};
  const customer = document.customer_snapshot || {};
  const financing = document.financing || {};
  const timeline = document.timeline || {};
  const totals = document.totals || {};
  const legacyReadOnly = Boolean(document.legacy_read_only);

  const lineItems: SelectedQuoteLineItem[] = [
    ...(document.mandatory_services || []).map((item: any) => fromBackendLine(item, 'mandatory_services')),
    ...(document.site_work || []).map((item: any) => fromBackendLine(item, 'site_work')),
    ...(document.addons || []).map((item: any) => fromBackendLine(item, 'addons')),
    ...(document.options || []).map((item: any) => fromBackendLine(item, 'options')),
  ];

  const siteWorkItems = lineItems.filter((item) => item.category === 'mandatory_services' || item.category === 'site_work');
  const siteWorkCost = siteWorkItems.reduce((sum, item) => sum + item.totalCost, 0);
  const siteWorkPrice = siteWorkItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    id: String(document.id || ''),
    quoteNumber: String(document.quote_number || document.id || ''),
    quoteDate: document.quote_date || undefined,
    customerName: String(customer.name || customer.full_name || [customer.first_name, customer.last_name].filter(Boolean).join(' ') || ''),
    customerPhone: String(customer.phone || ''),
    customerEmail: String(customer.email || ''),
    customerAddress: String(customer.address || customer.full_address || customer.current_address || site.delivery_address || ''),
    salesperson: String(document.associate_name || ''),
    salespersonEmail: document.associate_email || undefined,
    salespersonPhone: document.associate_phone || undefined,
    status: normalizeStatus(document.status),
    homeModel: String(home.model_name || ''),
    manufacturer: home.manufacturer || undefined,
    series: home.series || undefined,
    beds: home.beds ?? undefined,
    baths: home.baths ?? undefined,
    sqft: home.sqft ?? undefined,
    dimensions: home.dimensions || undefined,
    homeWidth: home.width ?? undefined,
    homeLength: home.length ?? undefined,
    homePrice: number(document.base_price),
    msrpPrice: home.msrp_price == null ? undefined : number(home.msrp_price),
    ehsPrice: home.ehs_price == null ? undefined : number(home.ehs_price),
    vipPrice: home.vip_price == null ? undefined : number(home.vip_price),
    factoryCost: number(document.factory_cost),
    homeDescription: home.description || undefined,
    propertyAddress: String(site.delivery_address || site.property_address || ''),
    propertyPrice: number(document.land_price ?? site.land_price ?? site.land_budget),
    deliveryRouteType: site.delivery_route_type || undefined,
    deliveryMiles: site.delivery_miles == null ? undefined : number(site.delivery_miles),
    escortsCount: site.escorts_count == null ? undefined : number(site.escorts_count),
    freightDelivery: number(document.delivery_price ?? site.delivery_price ?? totals.delivery_total),
    freightCost: number(document.delivery_cost ?? site.delivery_cost),
    siteWorkTotal: number(totals.site_work_total ?? totals.site_work_subtotal, siteWorkPrice),
    siteWorkCost,
    lineItems,
    discounts: number(totals.discounts_total ?? (document.discounts || []).reduce((sum: number, item: any) => sum + number(item.amount), 0)),
    purchaseType: financing.purchase_type || undefined,
    financingStatus: financing.financing_status || undefined,
    preApprovalAmount: financing.pre_approval_amount == null ? undefined : number(financing.pre_approval_amount),
    targetBudget: financing.target_budget == null ? undefined : number(financing.target_budget),
    ehsLoanOfficerUsed: Boolean(document.ehs_loan_used ?? financing.ehs_loan_used),
    activeLoanFee: financing.active_loan_fee == null ? undefined : number(financing.active_loan_fee),
    deposits: (document.deposits || []).map(fromBackendDeposit),
    loanApprovalDate: timeline.loan_approval || undefined,
    loanClosingDate: timeline.loan_closing || undefined,
    permitApprovalDate: timeline.permit_approval || undefined,
    siteReadyDate: timeline.site_ready || undefined,
    deliveryDate: timeline.delivery || undefined,
    installationDate: timeline.installation || undefined,
    walkthroughDate: timeline.walkthrough || undefined,
    moveInDate: timeline.move_in || undefined,
    subtotal: number(totals.subtotal),
    financedSubtotal: number(totals.financed_subtotal ?? totals.subtotal),
    nonFinancedSubtotal: number(totals.non_financed_subtotal),
    taxBasis: number(totals.tax_basis ?? totals.subtotal),
    salesTax: number(totals.sales_tax_total ?? totals.sales_tax),
    totalTurnkeyPrice: number(totals.estimated_total ?? totals.grand_total),
    estimatedTotal: number(totals.estimated_total ?? totals.grand_total),
    financialTotals: financialTotals(totals),
    notes: String(document.notes_customer || document.notes_internal || ''),
    notesCustomer: document.notes_customer || undefined,
    notesInternal: document.notes_internal || undefined,
    shareToken: legacyReadOnly ? undefined : document.share_token || undefined,
    createdAt: String(document.created_at || document.quote_date || ''),
    updatedAt: String(document.updated_at || document.created_at || document.quote_date || ''),
    legacyReadOnly,
    legacySourceId: document.legacy_source_id || undefined,
    legacySourceDb: document.legacy_source_db || undefined,
  };
}

export function toBackendQuote(quote: SavedQuote) {
  if (quote.legacyReadOnly) {
    throw new Error('Historical quotes are read-only and cannot be sent through the current quote engine.');
  }

  const mandatory = quote.lineItems.filter((item) => item.category === 'mandatory_services').map(toBackendLine);
  const siteWork = quote.lineItems.filter((item) => item.category === 'site_work' || item.category === 'custom').map(toBackendLine);
  const addons = quote.lineItems.filter((item) => item.category === 'addons').map(toBackendLine);
  const options = quote.lineItems.filter((item) => item.category === 'options').map(toBackendLine);

  return {
    id: quote.id,
    quote_number: quote.quoteNumber,
    quote_date: quote.quoteDate,
    pricing_mode: 'portal_v05',
    status: quote.status,
    customer_snapshot: {
      name: quote.customerName,
      phone: quote.customerPhone,
      email: quote.customerEmail,
      address: quote.customerAddress || quote.propertyAddress,
    },
    home: {
      model_name: quote.homeModel,
      manufacturer: quote.manufacturer,
      series: quote.series,
      beds: quote.beds,
      baths: quote.baths,
      sqft: quote.sqft,
      dimensions: quote.dimensions,
      width: quote.homeWidth,
      length: quote.homeLength,
      description: quote.homeDescription,
      msrp_price: quote.msrpPrice,
      ehs_price: quote.ehsPrice,
      vip_price: quote.vipPrice,
    },
    site: {
      delivery_address: quote.propertyAddress,
      property_address: quote.propertyAddress,
      land_price: quote.propertyPrice,
      delivery_price: quote.freightDelivery,
      delivery_cost: quote.freightCost || 0,
      delivery_miles: quote.deliveryMiles,
      delivery_route_type: quote.deliveryRouteType,
      escorts_count: quote.escortsCount,
    },
    base_price: quote.homePrice,
    factory_cost: quote.factoryCost,
    land_price: quote.propertyPrice,
    delivery_price: quote.freightDelivery,
    delivery_cost: quote.freightCost || 0,
    mandatory_services: mandatory,
    site_work: siteWork,
    addons,
    options,
    discounts: quote.discounts ? [{ description: 'Quote Discount', amount: quote.discounts }] : [],
    deposits: (quote.deposits || []).map(toBackendDeposit),
    sales_tax_rate: quote.financialTotals?.sales_tax_rate ?? 0.03,
    ehs_loan_used: Boolean(quote.ehsLoanOfficerUsed),
    financing: {
      purchase_type: quote.purchaseType || 'financing',
      financing_status: quote.financingStatus,
      pre_approval_amount: quote.preApprovalAmount,
      target_budget: quote.targetBudget,
      ehs_loan_used: Boolean(quote.ehsLoanOfficerUsed),
      active_loan_fee: quote.activeLoanFee || 0,
    },
    timeline: {
      loan_approval: quote.loanApprovalDate,
      loan_closing: quote.loanClosingDate,
      permit_approval: quote.permitApprovalDate,
      site_ready: quote.siteReadyDate,
      delivery: quote.deliveryDate,
      installation: quote.installationDate,
      walkthrough: quote.walkthroughDate,
      move_in: quote.moveInDate,
    },
    notes_customer: quote.notesCustomer || quote.notes,
    notes_internal: quote.notesInternal,
  };
}

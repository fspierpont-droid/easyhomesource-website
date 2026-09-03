export type PermitPortalCoverageStatus =
  | 'audited'
  | 'credentials_required'
  | 'security_blocked'
  | 'verification_blocked'
  | 'portal_error'
  | 'manual_only';

export interface PermitPortalCoverage {
  id: string;
  vendor: string;
  jurisdictions: string[];
  status: PermitPortalCoverageStatus;
  label: string;
  detail: string;
  connectorPlan: string;
}

// Operational snapshot from the September 2026 permit-portal audit. This is
// intentionally a capability/readiness registry, not a claim that automated
// monitoring is active. Connector implementations must update this registry
// when production connectivity is actually verified.
export const PERMIT_PORTAL_COVERAGE: PermitPortalCoverage[] = [
  {
    id: 'tyler-portico',
    vendor: 'Tyler Portico / Civic Access',
    jurisdictions: ['Hernando'],
    status: 'audited',
    label: 'Connected & audited',
    detail: 'AMHI credentials authenticated in Hernando and the active workload was audited successfully.',
    connectorPlan: 'Build Tyler connector first and use it as the baseline for twice-daily permit monitoring.',
  },
  {
    id: 'civics',
    vendor: 'CIVICS',
    jurisdictions: ['Citrus'],
    status: 'credentials_required',
    label: 'Separate credentials required',
    detail: 'The Hernando credential combination was rejected by Citrus CIVICS.',
    connectorPlan: 'Confirm the Citrus account identity, then build a CIVICS connector.',
  },
  {
    id: 'citizenserve',
    vendor: 'Citizenserve',
    jurisdictions: ['Sumter'],
    status: 'credentials_required',
    label: 'Separate credentials required',
    detail: 'The Hernando credential combination was rejected by Sumter Citizenserve.',
    connectorPlan: 'Confirm the Sumter account identity, then build a Citizenserve connector.',
  },
  {
    id: 'accela',
    vendor: 'Accela',
    jurisdictions: ['Polk', 'Hillsborough', 'Pasco', 'Pinellas'],
    status: 'security_blocked',
    label: 'Browser/security blocked',
    detail: 'The cloud-browser audit was blocked by the shared Accela security layer.',
    connectorPlan: 'Use an authenticated Accela-specific connector/API path rather than browser scraping.',
  },
  {
    id: 'lake-oprs',
    vendor: 'Lake County OPRS',
    jurisdictions: ['Lake'],
    status: 'verification_blocked',
    label: 'Verification blocked',
    detail: 'The portal opened, but embedded verification prevented account access during the audit.',
    connectorPlan: 'Determine supported authenticated access before automating checks.',
  },
  {
    id: 'other-portals',
    vendor: 'Other county portals',
    jurisdictions: ['Marion', 'Orange', 'Volusia'],
    status: 'portal_error',
    label: 'Manual review required',
    detail: 'Marion and Orange returned gateway failures; Volusia opened as a blank/nonfunctional page during the audit.',
    connectorPlan: 'Keep these jurisdictions manual until stable access can be verified.',
  },
];

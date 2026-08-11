export type ProjectStage =
  | 'LEAD_QUALIFIED'
  | 'PERMITTING'
  | 'SITE_PREP'
  | 'FACTORY_BUILD'
  | 'TRANSPORT_SET'
  | 'UTILITIES_HOOKUP'
  | 'FINAL_INSPECTION'
  | 'COMPLETED';

export interface ProjectMilestone {
  name: string;
  targetDate: string;
  completedDate?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  notes?: string;
}

export interface GhlProject {
  id: string;
  ghlOpportunityId?: string;
  jobId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  jobAddress: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  stage: ProjectStage;
  stageLabel: string;
  progressPct: number;
  dealValue: number;
  depositAmount: number;
  depositStatus: 'PAID' | 'PARTIAL' | 'PENDING' | 'ESCROW';
  assignedRep: string;
  assignedRepEmail: string;
  lender?: string;
  loanStatus?: 'PRE_APPROVED' | 'IN_UNDERWRITING' | 'APPROVED' | 'CLOSED' | 'CASH';
  homeModel: string;
  manufacturer: string;
  series?: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  dimensions: string;
  parcelNumber?: string;
  lotSize?: string;
  zoning?: string;
  powerProvider?: string;
  waterType?: 'WELL' | 'MUNICIPAL';
  sewerType?: 'SEPTIC' | 'MUNICIPAL';
  quoteId?: string;
  quoteNumber?: string;
  milestones: ProjectMilestone[];
  ghlTags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_STAGE_CONFIG: Record<
  ProjectStage,
  { label: string; color: string; bg: string; border: string; icon: string; stepOrder: number }
> = {
  LEAD_QUALIFIED: {
    label: 'Lead Qualified',
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    icon: '⚡',
    stepOrder: 1
  },
  PERMITTING: {
    label: 'Permitting & Zoning',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: '📋',
    stepOrder: 2
  },
  SITE_PREP: {
    label: 'Site Prep & Dirt Pad',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: '🚜',
    stepOrder: 3
  },
  FACTORY_BUILD: {
    label: 'Factory Build',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    icon: '🏭',
    stepOrder: 4
  },
  TRANSPORT_SET: {
    label: 'Transport & Set',
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#FFEDD5',
    icon: '🚚',
    stepOrder: 5
  },
  UTILITIES_HOOKUP: {
    label: 'Utilities & Tie-Down',
    color: '#0891B2',
    bg: '#ECFEFF',
    border: '#A5F3FC',
    icon: '🛠️',
    stepOrder: 6
  },
  FINAL_INSPECTION: {
    label: 'Final Inspection & CO',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    icon: '🔍',
    stepOrder: 7
  },
  COMPLETED: {
    label: 'Completed / Move-In',
    color: '#10B981',
    bg: '#D1FAE5',
    border: '#6EE7B7',
    icon: '🏆',
    stepOrder: 8
  }
};

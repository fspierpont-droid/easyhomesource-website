export type DashboardSourceState = 'ok' | 'error';

export interface DashboardSourceHealth {
  quotes: DashboardSourceState;
  ghlReady: DashboardSourceState;
  ghlProjects: DashboardSourceState;
  inventory: DashboardSourceState;
  properties: DashboardSourceState;
  permitting: DashboardSourceState;
}

export interface DashboardStageValue {
  key: string;
  label: string;
  count: number;
  value?: number;
  progressPct?: number;
}

export interface DashboardTrendPoint {
  key: string;
  label: string;
  count: number;
  value: number;
}

export interface DashboardRepPerformance {
  name: string;
  quoteCount: number;
  quoteValue: number;
  contractCount: number;
  contractValue: number;
}

export interface DashboardAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  label: string;
  value: number;
  destination: string;
}

export interface ManagementOverview {
  generatedAt: string;
  sources: DashboardSourceHealth;
  sales: {
    readyToQuote: number | null;
    activeQuoteCount: number | null;
    activeQuoteValue: number | null;
    inContractCount: number | null;
    inContractValue: number | null;
    avgActiveQuote: number | null;
    marginHealthPct: number | null;
    marginHealthSample: number;
    stages: DashboardStageValue[];
    trend: DashboardTrendPoint[];
    reps: DashboardRepPerformance[];
  };
  projects: {
    total: number | null;
    active: number | null;
    completed: number | null;
    dealValue: number | null;
    averageProgressPct: number | null;
    unmappedStageCount: number | null;
    stages: DashboardStageValue[];
  };
  inventory: {
    count: number | null;
    retailValue: number | null;
    invoiceValue: number | null;
    floorplanBalance: number | null;
    statusToConfirm: number | null;
    statuses: DashboardStageValue[];
  };
  properties: {
    count: number | null;
    available: number | null;
    publiclyVisible: number | null;
    needsConfirmation: number | null;
    availableValue: number | null;
    statuses: DashboardStageValue[];
  };
  permitting: {
    total: number | null;
    active: number | null;
    stale14Days: number | null;
    oldestActiveDays: number | null;
    statuses: DashboardStageValue[];
  };
  alerts: DashboardAlert[];
}

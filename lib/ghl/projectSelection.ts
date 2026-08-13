import type { GhlProject } from '@/types/project';

/** Resolves selected state from the newest canonical GHL reconciliation. */
export function resolveSelectedProject(projects: GhlProject[], ghlOpportunityId: string | null) {
  if (!ghlOpportunityId) return null;
  return projects.find((project) => project.ghlOpportunityId === ghlOpportunityId) || null;
}

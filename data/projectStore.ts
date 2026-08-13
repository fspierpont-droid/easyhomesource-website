import type { GhlProject } from '@/types/project';

const PROJECT_CACHE_KEY = 'ehs_ghl_projects';

/**
 * A cache of the last successful GHL response, never a source of truth.  An
 * empty cache remains empty; production must not invent projects when GHL is
 * unavailable or returns no matching opportunities.
 */
export function getStoredProjects(): GhlProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(PROJECT_CACHE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((project) => project?.ghlOpportunityId) : [];
  } catch {
    return [];
  }
}

export function saveProjectsToStore(projects: GhlProject[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    PROJECT_CACHE_KEY,
    JSON.stringify(projects.filter((project) => project.ghlOpportunityId))
  );
}

export function clearStoredProjects() {
  if (typeof window !== 'undefined') localStorage.removeItem(PROJECT_CACHE_KEY);
}

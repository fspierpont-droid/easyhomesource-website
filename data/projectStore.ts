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
    const parsed = JSON.parse(window.localStorage.getItem(PROJECT_CACHE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((project) => project?.ghlOpportunityId) : [];
  } catch (error) {
    console.warn('Unable to read the optional GHL project cache:', error);
    return [];
  }
}

export function saveProjectsToStore(projects: GhlProject[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(
      PROJECT_CACHE_KEY,
      JSON.stringify(projects.filter((project) => project.ghlOpportunityId))
    );
    return true;
  } catch (error) {
    console.warn('Unable to write the optional GHL project cache:', error);
    return false;
  }
}

export function clearStoredProjects(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(PROJECT_CACHE_KEY);
    return true;
  } catch (error) {
    console.warn('Unable to clear the optional GHL project cache:', error);
    return false;
  }
}

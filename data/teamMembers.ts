export type UserRole = 'Owner' | 'Admin' | 'Manager' | 'Associate';

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  ghlLinked: boolean;
  phone?: string;
  title?: string;
  businessRole?: string;
  permissions?: string[];
  amhiAccess?: boolean;
}

export const VERIFIED_TEAM_USERS: TeamUser[] = [
  {
    id: 'user-1',
    name: 'Alex Vorasane',
    email: 'alex@easyhomesource.com',
    role: 'Admin',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Executive Admin & Operations',
    businessRole: 'Admin',
    permissions: ['portal:*', 'settings:read', 'settings:write', 'catalog:manage', 'seo:read'],
    amhiAccess: false,
  },
  {
    id: 'user-2',
    name: 'CJ Cornett',
    email: 'cj@easyhomesource.com',
    role: 'Associate',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Housing Consultant'
  },
  {
    id: 'user-3',
    name: 'Jessica Chinchilla',
    email: 'jessica@easyhomesource.com',
    role: 'Associate',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Housing Consultant'
  },
  {
    id: 'user-4',
    name: 'Kevin Malone',
    email: 'kevin@easyhomesource.com',
    role: 'Owner',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Owner',
    businessRole: 'Owner',
    permissions: ['portal:*'],
    amhiAccess: true,
  },
  {
    id: 'user-5',
    name: 'Mike Ung',
    email: 'mike@easyhomesource.com',
    role: 'Manager',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'General Sales Manager',
    businessRole: 'Manager',
    permissions: ['portal:*', 'settings:read', 'settings:write', 'users:read', 'users:write', 'system-health:read', 'catalog:manage', 'seo:manage'],
    amhiAccess: false,
  },
  {
    id: 'user-6',
    name: 'Sandy Trinidad',
    email: 'sandy@easyhomesource.com',
    role: 'Associate',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Housing Consultant'
  },
  {
    id: 'user-7',
    name: 'Scott Pierpont',
    email: 'scott@easyhomesource.com',
    role: 'Owner',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Platform Owner & Operations Admin',
    businessRole: 'Platform Owner',
    permissions: ['*'],
    amhiAccess: true,
  },
  {
    id: 'user-8',
    name: 'Shawn Tran',
    email: 'shawn@easyhomesource.com',
    role: 'Associate',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Housing Consultant'
  },
  {
    id: 'user-9',
    name: 'Test Sales',
    email: 'test@easyhomesource.com',
    role: 'Associate',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Sales Associate'
  }
];

export const CURRENT_LOGGED_IN_USER: TeamUser = VERIFIED_TEAM_USERS[6];

function explicitPermission(user: TeamUser | null | undefined, permission: string): boolean | null {
  if (!user?.permissions) return null;
  if (user.permissions.includes('*') || user.permissions.includes(permission)) return true;
  const [namespace] = permission.split(':');
  if (namespace && user.permissions.includes(`${namespace}:*`)) return true;
  return false;
}

export function hasPermission(user: TeamUser | null | undefined, permission: string): boolean {
  if (!user) return false;
  const explicit = explicitPermission(user, permission);
  if (explicit !== null) return explicit;

  if (user.role === 'Owner') return true;
  if (permission === 'settings:read' || permission === 'catalog:manage') {
    return user.role === 'Admin' || user.role === 'Manager';
  }
  if (permission === 'users:read' || permission === 'users:write' || permission === 'system-health:read') {
    return user.role === 'Admin';
  }
  return false;
}

export function canAccessSettings(user?: TeamUser | null): boolean {
  return hasPermission(user, 'settings:read');
}

export function canManageUsers(user?: TeamUser | null): boolean {
  return hasPermission(user, 'users:write');
}

export function canAssignOwner(user?: TeamUser | null): boolean {
  return hasPermission(user, 'users:assign-owner');
}

export function canAccessSystemHealth(user?: TeamUser | null): boolean {
  return hasPermission(user, 'system-health:read');
}

export function canManageCatalog(user?: TeamUser | null): boolean {
  return hasPermission(user, 'catalog:manage');
}

export function canAccessAmhi(user?: TeamUser | null): boolean {
  if (!user) return false;
  if (user.amhiAccess) return true;
  return hasPermission(user, 'amhi:access');
}

export function canEditBasePrices(user?: TeamUser | null): boolean {
  return hasPermission(user, 'catalog:manage');
}

export function isSalesAssociate(user?: TeamUser | null): boolean {
  if (!user) return true;
  return user.role === 'Associate';
}

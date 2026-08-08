export type UserRole = 'Admin' | 'Manager' | 'Associate';

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  ghlLinked: boolean;
  phone?: string;
  title?: string;
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
    title: 'Executive Admin & Operations'
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
    role: 'Associate',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Housing Consultant'
  },
  {
    id: 'user-5',
    name: 'Mike Ung',
    email: 'mike@easyhomesource.com',
    role: 'Manager',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'General Sales Manager'
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
    role: 'Admin',
    active: true,
    ghlLinked: false,
    phone: '(352) 558-8888',
    title: 'Principal & Operations Admin'
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

export const CURRENT_LOGGED_IN_USER: TeamUser = VERIFIED_TEAM_USERS[6]; // Scott Pierpont (Admin)

// Permission & Role Check Helpers
export function canAccessSettings(user?: TeamUser | null): boolean {
  if (!user) return false;
  return user.role === 'Admin' || user.role === 'Manager';
}

export function canEditBasePrices(user?: TeamUser | null): boolean {
  if (!user) return false;
  return user.role === 'Admin' || user.role === 'Manager';
}

export function isSalesAssociate(user?: TeamUser | null): boolean {
  if (!user) return true;
  return user.role === 'Associate';
}

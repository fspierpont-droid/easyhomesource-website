export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Associate';
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
    name: 'Mike',
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

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { VERIFIED_TEAM_USERS, type TeamUser } from '@/data/teamMembers';

interface AuthContextType {
  user: TeamUser | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<TeamUser>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => VERIFIED_TEAM_USERS[6],
  logout: () => {},
  isAuthenticated: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TeamUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage for active session
    try {
      const storedToken = localStorage.getItem('ehs_token');
      const storedUser = localStorage.getItem('ehs_user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Fallback default for existing development session
        const defaultAdmin = VERIFIED_TEAM_USERS[6]; // Scott Pierpont
        localStorage.setItem('ehs_token', 'ehs-auth-session-token');
        localStorage.setItem('ehs_user', JSON.stringify(defaultAdmin));
        setUser(defaultAdmin);
      }
    } catch (e) {
      console.warn('Auth storage error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<TeamUser> => {
    const cleanEmail = email.trim().toLowerCase();
    const matched = VERIFIED_TEAM_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.name.toLowerCase().includes(cleanEmail)
    ) || VERIFIED_TEAM_USERS[6]; // Default to Scott Pierpont

    localStorage.setItem('ehs_token', `ehs-token-${Date.now()}`);
    localStorage.setItem('ehs_user', JSON.stringify(matched));
    setUser(matched);
    return matched;
  };

  const logout = () => {
    localStorage.removeItem('ehs_token');
    localStorage.removeItem('ehs_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

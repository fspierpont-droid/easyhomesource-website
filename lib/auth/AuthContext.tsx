'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    fetch('/api/portal/auth/session', { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password?: string): Promise<TeamUser> => {
    const response = await fetch('/api/portal/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.user) throw new Error(data.error || 'Sign in failed.');

    try {
      localStorage.setItem('ehs_user', JSON.stringify(data.user));
    } catch (error) {
      console.warn('Auth presentation storage unavailable:', error);
    }

    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    try {
      localStorage.removeItem('ehs_token');
      localStorage.removeItem('ehs_user');
    } catch (error) {
      console.warn('Auth presentation storage unavailable:', error);
    }

    void fetch('/api/portal/auth/logout', { method: 'POST' }).finally(() => {
      setUser(null);
      router.push('/login');
    });
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

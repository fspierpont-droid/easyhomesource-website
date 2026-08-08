'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VERIFIED_TEAM_USERS, type TeamUser } from '@/data/teamMembers';

export default function LoginPage() {
  const [email, setEmail] = useState('scott@easyhomesource.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const matched = VERIFIED_TEAM_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail || u.name.toLowerCase().includes(cleanEmail)
      ) || VERIFIED_TEAM_USERS[6];

      if (typeof window !== 'undefined') {
        localStorage.setItem('ehs_token', `ehs-token-${Date.now()}`);
        localStorage.setItem('ehs_user', JSON.stringify(matched));
      }

      router.push('/portal');
    } catch (err) {
      setError('Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: TeamUser) => {
    setEmail(user.email);
    setPassword('easyhomesource2026');
    if (typeof window !== 'undefined') {
      localStorage.setItem('ehs_token', `ehs-token-${Date.now()}`);
      localStorage.setItem('ehs_user', JSON.stringify(user));
    }
    router.push('/portal');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2A47] text-white font-black text-xl flex items-center justify-center shadow-md">
            EHS
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-[#0B1E38] tracking-tight">
              Easy HomeSource
            </h1>
            <p className="text-xs font-bold text-[#1E6FA8] uppercase tracking-wider">
              QUOTE PORTAL &amp; OPERATIONS
            </p>
          </div>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 sm:rounded-3xl sm:px-10 space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#0B1E38] tracking-tight">
              Employee sign in
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Use your authorized Easy HomeSource credentials to continue.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@easyhomesource.com"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#1E6FA8] focus:ring-2 focus:ring-[#1E6FA8]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold pr-12 focus:outline-none focus:border-[#1E6FA8] focus:ring-2 focus:ring-[#1E6FA8]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black py-3 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In →'}</span>
            </button>
          </form>

          {/* Quick Login Roster for Authorized Dealership Staff */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center">
              Authorized Team Sign In (One-Click Demo Access)
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {VERIFIED_TEAM_USERS.slice(0, 6).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-slate-900 truncate">{u.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{u.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 font-medium">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}

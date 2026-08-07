'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { VERIFIED_TEAM_USERS, type TeamUser } from '@/data/teamMembers';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'catalog' | 'pricing' | 'disclaimer' | 'templates' | 'users' | 'imports'>('users');
  const [users, setUsers] = useState<TeamUser[]>(VERIFIED_TEAM_USERS);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Manager' | 'Associate'>('Associate');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ghlLinked, setGhlLinked] = useState(false);

  const tabs = [
    { id: 'company', label: 'Company' },
    { id: 'catalog', label: 'Home catalog' },
    { id: 'pricing', label: 'Pricing engine' },
    { id: 'disclaimer', label: 'Disclaimer & next steps' },
    { id: 'templates', label: 'Line item templates' },
    { id: 'users', label: 'Users' },
    { id: 'imports', label: 'Imports' }
  ];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: TeamUser = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      active: true,
      ghlLinked: false
    };

    setUsers((prev) => [...prev, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserOpen(false);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...editingUser } : u))
    );
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
      {/* Portal Sidebar with Scott Pierpont */}
      <PortalSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        totalPropertiesCount={17}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-[#1E6FA8]">
              DEALERSHIP CONFIGURATION
            </div>
            <h1 className="text-2xl font-black text-[#0B1E38] tracking-tight">
              Settings &amp; User Management
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure how your dealership quotes look and price.
            </p>
          </div>

          <Link
            href="/portal"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>← Back to Portal</span>
          </Link>
        </div>

        {/* Workspace Body */}
        <div className="p-6 sm:p-8 max-w-6xl w-full space-y-6">
          {/* Settings Tabs Ribbon */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-[#0B1E38] shadow-xs border border-slate-200 ring-2 ring-[#0B1E38]/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* USERS TAB CONTENT (Exact match to screenshot) */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* GoHighLevel Account Link Card */}
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B1E38]">
                    GoHighLevel Account Link
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Status: <span className={ghlLinked ? 'text-emerald-600 font-bold' : 'text-slate-600 font-semibold'}>{ghlLinked ? 'Connected & Active' : 'Not Linked'}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setGhlLinked(!ghlLinked)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs text-xs cursor-pointer transition-colors"
                >
                  {ghlLinked ? 'Disconnect GHL' : 'Link GoHighLevel Account'}
                </button>
              </div>

              {/* Users Table Card */}
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-[#0B1E38]">Users</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Manager role prepares restricted access for future accounting and QuickBooks tools.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(true)}
                    className="px-4 py-2 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>+</span>
                    <span>Add user</span>
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Active</th>
                        <th className="py-3 px-4">GHL</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#0B1E38]">
                            {user.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium font-mono text-[11px]">
                            {user.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                                user.role === 'Admin'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : user.role === 'Manager'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-emerald-700 font-bold text-[11px]">Yes</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {user.ghlLinked ? 'Linked' : 'Not Linked'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setEditingUser(user)}
                              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 text-[11px] cursor-pointer shadow-2xs"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COMPANY TAB */}
          {activeTab === 'company' && (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
              <h2 className="text-lg font-black text-[#0B1E38]">Dealership Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    defaultValue="Easy HomeSource LLC"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dealership Phone</label>
                  <input
                    type="text"
                    defaultValue="(352) 558-8888"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Dealership Physical Address</label>
                  <input
                    type="text"
                    defaultValue="9011 McIntyre Rd, Brooksville, FL 34601"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PRICING ENGINE TAB */}
          {activeTab === 'pricing' && (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
              <h2 className="text-lg font-black text-[#0B1E38]">ERP V05 Pricing Engine &amp; Matrices</h2>
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Florida Sales Tax</span>
                  <span className="text-xl font-black text-[#0F2A47]">3.00%</span>
                  <p className="text-[10.5px] text-slate-500 mt-1">Calculated automatically on tax basis</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Block &amp; Tie Matrix</span>
                  <span className="text-xl font-black text-[#0F2A47]">ERP V05 Table</span>
                  <p className="text-[10.5px] text-slate-500 mt-1">30ft to 80ft length brackets</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Standard Admin Fee</span>
                  <span className="text-xl font-black text-[#0F2A47]">5.00%</span>
                  <p className="text-[10.5px] text-slate-500 mt-1">Internal operations allocation</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#0B1E38]">Add Team User</h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rachel@easyhomesource.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white"
                >
                  <option value="Associate">Associate (Housing Consultant)</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#0B1E38]">Edit User: {editingUser.name}</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Associate">Associate</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthGate } from '@/components/portal/AuthGate';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { canAccessSettings } from '@/data/teamMembers';
import { useAuth } from '@/lib/auth/AuthContext';

type SettingsSection = 'overview' | 'users' | 'integrations' | 'pricing' | 'security';
type EditableRole = 'admin' | 'manager' | 'associate';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  active: boolean;
  ghl_linked?: boolean;
};

type UserFormState = {
  name: string;
  email: string;
  phone: string;
  role: EditableRole;
  active: boolean;
  password: string;
};

type AiStatus = {
  configured: boolean;
  provider: string;
  model: string;
  paidFallbackEnabled: boolean;
};

const EMPTY_USER_FORM: UserFormState = {
  name: '',
  email: '',
  phone: '',
  role: 'associate',
  active: true,
  password: '',
};

const USER_PAGE_SIZE = 8;

function roleLabel(role: string) {
  const normalized = role.toLowerCase();
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'manager') return 'Manager';
  return 'Associate';
}

function editableRole(role: string): EditableRole {
  const normalized = role.toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'manager') return 'manager';
  return 'associate';
}

function sectionFromQuery(value: string | null): SettingsSection {
  if (value === 'users') return 'users';
  if (value === 'imports' || value === 'integrations') return 'integrations';
  if (value === 'pricing') return 'pricing';
  if (value === 'security') return 'security';
  return 'overview';
}

export function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [section, setSection] = useState<SettingsSection>(() => sectionFromQuery(searchParams.get('tab')));

  const isAdmin = user?.role === 'Admin';
  const hasAccess = canAccessSettings(user);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [userPage, setUserPage] = useState(1);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [savingUser, setSavingUser] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const [ghlChecking, setGhlChecking] = useState(false);
  const [ghlStatus, setGhlStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [integrationError, setIntegrationError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setSection(sectionFromQuery(searchParams.get('tab')));
  }, [searchParams]);

  async function loadUsers() {
    if (!isAdmin) return;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await fetch('/api/portal/admin/users', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !Array.isArray(data.users)) {
        throw new Error(data.error || 'Unable to load employees.');
      }
      setUsers(data.users);
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Unable to load employees.');
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadAiStatus() {
    setIntegrationError(null);
    try {
      const response = await fetch('/api/portal/admin/ai-status', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to read AI status.');
      setAiStatus({
        configured: Boolean(data.configured),
        provider: String(data.provider || 'Cloudflare Workers AI'),
        model: String(data.model || '@cf/qwen/qwen3-30b-a3b-fp8'),
        paidFallbackEnabled: Boolean(data.paidFallbackEnabled),
      });
    } catch (error) {
      setIntegrationError(error instanceof Error ? error.message : 'Unable to read AI status.');
    }
  }

  useEffect(() => {
    if (!hasAccess) return;
    void loadAiStatus();
    if (isAdmin) void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess, isAdmin]);

  const filteredUsers = useMemo(() => {
    const needle = userSearch.trim().toLowerCase();
    return users.filter((employee) => {
      if (activeFilter === 'active' && !employee.active) return false;
      if (activeFilter === 'inactive' && employee.active) return false;
      if (!needle) return true;
      return [employee.name, employee.email, employee.phone || '', roleLabel(employee.role)]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [users, userSearch, activeFilter]);

  const userPageCount = Math.max(1, Math.ceil(filteredUsers.length / USER_PAGE_SIZE));
  const visibleUsers = filteredUsers.slice((userPage - 1) * USER_PAGE_SIZE, userPage * USER_PAGE_SIZE);

  useEffect(() => {
    if (userPage > userPageCount) setUserPage(userPageCount);
  }, [userPage, userPageCount]);

  function openCreateUser() {
    setEditingUser(null);
    setUserForm(EMPTY_USER_FORM);
    setUserMessage(null);
    setShowCreateUser(true);
  }

  function openEditUser(employee: AdminUser) {
    setShowCreateUser(false);
    setEditingUser(employee);
    setUserForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      role: editableRole(employee.role),
      active: employee.active,
      password: '',
    });
    setUserMessage(null);
  }

  function closeUserEditor() {
    setShowCreateUser(false);
    setEditingUser(null);
    setUserForm(EMPTY_USER_FORM);
    setUserMessage(null);
  }

  async function submitUser(event: FormEvent) {
    event.preventDefault();
    if (!isAdmin) return;
    if (!userForm.name.trim() || !userForm.email.trim()) {
      setUserMessage('Name and email are required.');
      return;
    }
    if (showCreateUser && userForm.password.length < 10) {
      setUserMessage('A temporary password of at least 10 characters is required for a new employee.');
      return;
    }

    setSavingUser(true);
    setUserMessage(null);
    try {
      const payload: Record<string, unknown> = {
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
        phone: userForm.phone.trim() || null,
        role: userForm.role,
        active: userForm.active,
      };
      if (userForm.password.trim()) payload.password = userForm.password;

      const response = await fetch(
        showCreateUser ? '/api/portal/admin/users' : `/api/portal/admin/users/${encodeURIComponent(editingUser?.id || '')}`,
        {
          method: showCreateUser ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to save employee.');

      await loadUsers();
      closeUserEditor();
      setUserMessage(showCreateUser ? 'Employee created.' : 'Employee updated.');
    } catch (error) {
      setUserMessage(error instanceof Error ? error.message : 'Unable to save employee.');
    } finally {
      setSavingUser(false);
    }
  }

  async function runGhlCheck() {
    setGhlChecking(true);
    setGhlStatus(null);
    try {
      const response = await fetch('/api/portal/ready-to-quote/ghl-sync', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !Array.isArray(data.readyBuyers)) {
        throw new Error(data.error || 'GoHighLevel request failed.');
      }
      const count = Number.isFinite(Number(data.count)) ? Number(data.count) : data.readyBuyers.length;
      setGhlStatus({ ok: true, message: `Live connection succeeded. ${count} Ready-to-Quote opportunit${count === 1 ? 'y' : 'ies'} returned.` });
    } catch (error) {
      setGhlStatus({ ok: false, message: error instanceof Error ? error.message : 'GoHighLevel request failed.' });
    } finally {
      setGhlChecking(false);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage({ ok: false, text: 'New password and confirmation do not match.' });
      return;
    }
    if (passwordForm.next.length < 10) {
      setPasswordMessage({ ok: false, text: 'New password must be at least 10 characters.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch('/api/portal/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current,
          new_password: passwordForm.next,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to change password.');
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordMessage({ ok: true, text: 'Password changed successfully.' });
    } catch (error) {
      setPasswordMessage({ ok: false, text: error instanceof Error ? error.message : 'Unable to change password.' });
    } finally {
      setPasswordSaving(false);
    }
  }

  const navigation: Array<{ id: SettingsSection; label: string; description: string }> = [
    { id: 'overview', label: 'Overview', description: 'Administration at a glance' },
    { id: 'users', label: 'Users & Permissions', description: 'Permanent employee access' },
    { id: 'integrations', label: 'Integrations', description: 'GHL and website AI only' },
    { id: 'pricing', label: 'Pricing Rules', description: 'Authoritative ERP baseline' },
    { id: 'security', label: 'Security', description: 'Your account password' },
  ];

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">Checking dealership authorization…</div>;
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
        <PortalSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button type="button" onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-slate-100" aria-label="Open navigation">☰</button>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1E6FA8]">Administration</div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1E38] truncate">Settings</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Permanent controls only — no browser-local configuration.</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin && <Link href="/portal/system-health" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">System Health</Link>}
              <Link href="/portal" className="px-3.5 py-2 rounded-xl bg-[#0B1E38] text-white text-xs font-bold">Dashboard</Link>
            </div>
          </header>

          {!hasAccess ? (
            <main className="p-6 sm:p-10 max-w-2xl w-full mx-auto">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-black text-[#0B1E38]">Management Access Required</h2>
                <p className="mt-2 text-sm text-slate-600">Settings are restricted to Managers and Admins.</p>
              </div>
            </main>
          ) : (
            <main className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
                <aside className="lg:sticky lg:top-6 lg:self-start">
                  <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                    {navigation.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSection(item.id)}
                        className={`text-left rounded-2xl border px-4 py-3 transition ${section === item.id ? 'border-[#1E6FA8] bg-[#1E6FA8]/5 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <div className="text-xs font-black text-[#0B1E38]">{item.label}</div>
                        <div className="mt-1 text-[10px] leading-4 text-slate-500 hidden sm:block">{item.description}</div>
                      </button>
                    ))}
                  </nav>
                </aside>

                <div className="min-w-0">
                  {section === 'overview' && (
                    <div className="space-y-5">
                      <section className="rounded-3xl bg-[#0B1E38] p-6 sm:p-8 text-white overflow-hidden relative">
                        <div className="relative z-10 max-w-2xl">
                          <div className="text-[10px] uppercase tracking-[0.18em] font-black text-sky-300">Permanent Administration</div>
                          <h2 className="mt-2 text-2xl sm:text-3xl font-black">Settings that actually control the EHS platform.</h2>
                          <p className="mt-3 text-sm leading-6 text-slate-300">Employee changes are written to the permanent EHS database. Integration checks query the live systems. Pricing remains protected until its settings are wired directly into the quote engine.</p>
                        </div>
                      </section>

                      <section className="grid sm:grid-cols-2 gap-4">
                        <ActionCard title="Users & Permissions" text={isAdmin ? 'Add employees, edit roles, deactivate accounts, and set temporary passwords.' : 'Employee administration is restricted to Admins.'} action="Manage users" onClick={() => setSection('users')} />
                        <ActionCard title="Integrations" text="Verify the real GoHighLevel connection and Cloudflare/Qwen website AI configuration." action="Check integrations" onClick={() => setSection('integrations')} />
                        <ActionCard title="Pricing & Quote Rules" text="Review the active ERP V05 calculation authority without creating a second source of truth." action="Review pricing" onClick={() => setSection('pricing')} />
                        <ActionCard title="Account Security" text="Change your permanent EHS employee password securely." action="Security" onClick={() => setSection('security')} />
                      </section>

                      {isAdmin && (
                        <Link href="/portal/system-health" className="block rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 hover:border-[#1E6FA8]/50 transition">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Diagnostics</div>
                              <h3 className="mt-1 text-lg font-black text-[#0B1E38]">System Health & Activity</h3>
                              <p className="mt-1 text-xs leading-5 text-slate-500">Database counts, service health and newest-first audit activity with server-side pagination.</p>
                            </div>
                            <span className="text-xl">→</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}

                  {section === 'users' && (
                    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Permanent Access</div>
                          <h2 className="mt-1 text-xl font-black text-[#0B1E38]">Users & Permissions</h2>
                          <p className="mt-1 text-xs text-slate-500">No static user list and no browser-only edits.</p>
                        </div>
                        {isAdmin && <button type="button" onClick={openCreateUser} className="px-4 py-2.5 rounded-xl bg-[#0B1E38] text-white text-xs font-black">+ Add Employee</button>}
                      </div>

                      {!isAdmin ? (
                        <div className="p-8 text-center text-sm text-slate-600">Only Admins can create or modify employee accounts.</div>
                      ) : (
                        <div className="p-5 sm:p-6 space-y-5">
                          {(showCreateUser || editingUser) && (
                            <UserEditor
                              mode={showCreateUser ? 'create' : 'edit'}
                              form={userForm}
                              setForm={setUserForm}
                              saving={savingUser}
                              message={userMessage}
                              onSubmit={submitUser}
                              onCancel={closeUserEditor}
                              currentUserId={user?.id || ''}
                              editingUserId={editingUser?.id || ''}
                            />
                          )}

                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              value={userSearch}
                              onChange={(event) => { setUserSearch(event.target.value); setUserPage(1); }}
                              placeholder="Search name, email, phone or role"
                              className="min-h-11 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-[#1E6FA8]"
                            />
                            <select value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value as typeof activeFilter); setUserPage(1); }} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm bg-white">
                              <option value="all">All accounts</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>

                          {usersLoading ? <div className="py-10 text-center text-xs font-bold text-slate-400">Loading permanent employee records…</div> : usersError ? <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800">{usersError}</div> : (
                            <>
                              <div className="space-y-2">
                                {visibleUsers.map((employee) => (
                                  <div key={employee.id} className="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-black text-sm text-[#0B1E38]">{employee.name}</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${employee.active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>{employee.active ? 'Active' : 'Inactive'}</span>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700">{roleLabel(employee.role)}</span>
                                      </div>
                                      <div className="mt-1 text-xs text-slate-500 truncate">{employee.email}{employee.phone ? ` · ${employee.phone}` : ''}</div>
                                    </div>
                                    <button type="button" onClick={() => openEditUser(employee)} className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold">Edit</button>
                                  </div>
                                ))}
                                {!visibleUsers.length && <div className="py-10 text-center text-sm text-slate-500">No employees match these filters.</div>}
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-4">
                                <div className="text-xs text-slate-500">Showing {filteredUsers.length ? (userPage - 1) * USER_PAGE_SIZE + 1 : 0}–{Math.min(userPage * USER_PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}</div>
                                <div className="flex items-center gap-2">
                                  <button type="button" disabled={userPage <= 1} onClick={() => setUserPage((value) => Math.max(1, value - 1))} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40">Previous</button>
                                  <span className="text-xs font-bold text-slate-600">Page {userPage} of {userPageCount}</span>
                                  <button type="button" disabled={userPage >= userPageCount} onClick={() => setUserPage((value) => Math.min(userPageCount, value + 1))} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40">Next</button>
                                </div>
                              </div>
                            </>
                          )}
                          {userMessage && !showCreateUser && !editingUser && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">{userMessage}</div>}
                        </div>
                      )}
                    </section>
                  )}

                  {section === 'integrations' && (
                    <div className="space-y-4">
                      <IntegrationCard title="GoHighLevel" description="CRM authority for contacts, leads and opportunities." status={ghlStatus ? (ghlStatus.ok ? 'healthy' : 'error') : 'unknown'} statusText={ghlStatus?.message || 'Not checked this session.'} actionLabel={ghlChecking ? 'Checking…' : 'Run Live Check'} onAction={runGhlCheck} disabled={ghlChecking} />
                      <IntegrationCard title="Website AI Assistant" description={`${aiStatus?.provider || 'Cloudflare Workers AI'} · ${aiStatus?.model || '@cf/qwen/qwen3-30b-a3b-fp8'}`} status={aiStatus?.configured ? 'healthy' : 'warning'} statusText={aiStatus ? (aiStatus.configured ? 'Cloudflare credentials are configured. Paid fallback is disabled.' : 'Cloudflare credentials are not configured yet. Chat fails safely offline until they are added.') : 'Checking configuration…'} actionLabel="Refresh" onAction={() => void loadAiStatus()} />
                      {integrationError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">{integrationError}</div>}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong>Integration scope:</strong> this portal intentionally does not include QuickBooks, Trove or Twilio integrations.</div>
                    </div>
                  )}

                  {section === 'pricing' && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Protected Authority</div>
                      <h2 className="mt-1 text-xl font-black text-[#0B1E38]">ERP V05 Pricing Rules</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">These values are intentionally read-only here. Editing them before the quote engine consumes database-backed settings would create two conflicting pricing authorities.</p>
                      <div className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
                        <PricingRow label="Florida sales tax" value="3.00%" />
                        <PricingRow label="Internal admin fee" value="5.00%" />
                        <PricingRow label="Sales commission" value="20% of commissionable house margin" />
                        <PricingRow label="Net take-home indicator" value="$20,000" />
                      </div>
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">The next pricing-settings phase will move approved global variables behind one permanent configuration API and then make the quote engine read from that authority. Until then, this screen cannot silently diverge from quote math.</div>
                    </section>
                  )}

                  {section === 'security' && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm max-w-2xl">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Your Account</div>
                      <h2 className="mt-1 text-xl font-black text-[#0B1E38]">Change Password</h2>
                      <p className="mt-1 text-xs text-slate-500">Updates the permanent employee credential used for portal login.</p>
                      <form onSubmit={changePassword} className="mt-5 space-y-4">
                        <PasswordField label="Current password" value={passwordForm.current} onChange={(value) => setPasswordForm((state) => ({ ...state, current: value }))} />
                        <PasswordField label="New password" value={passwordForm.next} onChange={(value) => setPasswordForm((state) => ({ ...state, next: value }))} />
                        <PasswordField label="Confirm new password" value={passwordForm.confirm} onChange={(value) => setPasswordForm((state) => ({ ...state, confirm: value }))} />
                        {passwordMessage && <div className={`rounded-xl border p-3 text-xs font-bold ${passwordMessage.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{passwordMessage.text}</div>}
                        <button type="submit" disabled={passwordSaving} className="px-5 py-2.5 rounded-xl bg-[#0B1E38] text-white text-xs font-black disabled:opacity-50">{passwordSaving ? 'Updating…' : 'Update Password'}</button>
                      </form>
                    </section>
                  )}
                </div>
              </div>
            </main>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

function ActionCard({ title, text, action, onClick }: { title: string; text: string; action: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-left rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 hover:border-[#1E6FA8]/50 hover:shadow-sm transition">
      <h3 className="font-black text-[#0B1E38]">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
      <div className="mt-4 text-xs font-black text-[#1E6FA8]">{action} →</div>
    </button>
  );
}

function UserEditor({ mode, form, setForm, saving, message, onSubmit, onCancel, currentUserId, editingUserId }: {
  mode: 'create' | 'edit';
  form: UserFormState;
  setForm: React.Dispatch<React.SetStateAction<UserFormState>>;
  saving: boolean;
  message: string | null;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  currentUserId: string;
  editingUserId: string;
}) {
  const editingSelf = mode === 'edit' && currentUserId === editingUserId;
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[#1E6FA8]/30 bg-sky-50/40 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black text-[#0B1E38]">{mode === 'create' ? 'Add Employee' : 'Edit Employee'}</div>
          <div className="text-[11px] text-slate-500">Changes save to the permanent EHS employee database.</div>
        </div>
        <button type="button" onClick={onCancel} className="text-xs font-bold text-slate-500">Close</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <TextField label="Name" value={form.name} onChange={(value) => setForm((state) => ({ ...state, name: value }))} />
        <TextField label="Email" type="email" value={form.email} onChange={(value) => setForm((state) => ({ ...state, email: value }))} />
        <TextField label="Phone" value={form.phone} onChange={(value) => setForm((state) => ({ ...state, phone: value }))} />
        <label className="text-xs font-bold text-slate-600">Role
          <select value={form.role} disabled={editingSelf} onChange={(event) => setForm((state) => ({ ...state, role: event.target.value as EditableRole }))} className="mt-1 w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-100">
            <option value="associate">Associate</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <TextField label={mode === 'create' ? 'Temporary password' : 'New password (optional)'} type="password" value={form.password} onChange={(value) => setForm((state) => ({ ...state, password: value }))} />
        <label className="flex items-center gap-3 mt-5 text-xs font-bold text-slate-700">
          <input type="checkbox" checked={form.active} disabled={editingSelf} onChange={(event) => setForm((state) => ({ ...state, active: event.target.checked }))} className="h-4 w-4" />
          Active employee account
        </label>
      </div>
      {editingSelf && <div className="text-[11px] text-slate-500">Your own Admin role and active status are protected from accidental removal.</div>}
      {message && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">{message}</div>}
      <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-[#0B1E38] text-white text-xs font-black disabled:opacity-50">{saving ? 'Saving…' : mode === 'create' ? 'Create Employee' : 'Save Changes'}</button>
    </form>
  );
}

function IntegrationCard({ title, description, status, statusText, actionLabel, onAction, disabled = false }: {
  title: string;
  description: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  statusText: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) {
  const style = status === 'healthy' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : status === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : status === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600';
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-[#0B1E38]">{title}</h2>
          <p className="mt-1 text-xs text-slate-500 break-words">{description}</p>
          <div className={`mt-4 inline-flex max-w-full rounded-xl border px-3 py-2 text-xs font-bold ${style}`}>{statusText}</div>
        </div>
        <button type="button" onClick={onAction} disabled={disabled} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-black disabled:opacity-50">{actionLabel}</button>
      </div>
    </section>
  );
}

function PricingRow({ label, value }: { label: string; value: string }) {
  return <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm"><span className="text-slate-600">{label}</span><strong className="text-[#0B1E38]">{value}</strong></div>;
}

function TextField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="text-xs font-bold text-slate-600">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#1E6FA8]" /></label>;
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-bold text-slate-600">{label}<input type="password" autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full min-h-11 rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-[#1E6FA8]" /></label>;
}

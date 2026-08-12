'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ProjectMap } from './ProjectMap';
import type { GhlProject, ProjectStage } from '@/types/project';
import { PROJECT_STAGE_CONFIG } from '@/types/project';
import { getStoredProjects, saveProjectsToStore, updateProjectStage, INITIAL_GHL_PROJECTS } from '@/data/projectStore';

interface ProjectBoardViewProps {
  onOpenQuote?: (quoteId?: string) => void;
}

export function ProjectBoardView({ onOpenQuote }: ProjectBoardViewProps) {
  const [projects, setProjects] = useState<GhlProject[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'kanban' | 'table' | 'analytics'>('map');
  const [isSyncingGhl, setIsSyncingGhl] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<GhlProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [repFilter, setRepFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');

  const fetchLiveGhlProjects = async (silent = false) => {
    if (!silent) setIsSyncingGhl(true);
    try {
      const res = await fetch('/api/portal/projects/ghl-sync', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
        setProjects(data.projects);
        saveProjectsToStore(data.projects);
        if (!silent) {
          setSyncSuccessMsg(`✓ Successfully synced ${data.projects.length} live opportunities from GoHighLevel.`);
        }
      } else {
        const local = getStoredProjects();
        setProjects(local);
      }
    } catch (err: any) {
      console.warn('GHL live fetch fallback:', err);
      const local = getStoredProjects();
      setProjects(local);
    } finally {
      if (!silent) setIsSyncingGhl(false);
    }
  };

  useEffect(() => {
    // 1. Initial load from store
    setProjects(getStoredProjects());

    // 2. Fetch fresh live GHL opportunities
    fetchLiveGhlProjects(true);

    const handleProjectsUpdated = () => {
      setProjects(getStoredProjects());
    };

    window.addEventListener('storage', handleProjectsUpdated);
    window.addEventListener('ehs_projects_updated', handleProjectsUpdated);

    return () => {
      window.removeEventListener('storage', handleProjectsUpdated);
      window.removeEventListener('ehs_projects_updated', handleProjectsUpdated);
    };
  }, []);

  const handleSyncGhl = async () => {
    setSyncSuccessMsg(null);
    await fetchLiveGhlProjects(false);
  };

  const handleStageChange = (projectId: string, newStage: ProjectStage) => {
    updateProjectStage(projectId, newStage);
    setProjects(getStoredProjects());
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (repFilter !== 'ALL' && p.assignedRep !== repFilter) return false;
      if (stageFilter !== 'ALL' && p.stage !== stageFilter) return false;
      if (!searchQuery.trim()) return true;
      const text = `${p.customerName} ${p.jobAddress} ${p.city} ${p.county} ${p.homeModel} ${p.assignedRep} ${p.jobId}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase().trim());
    });
  }, [projects, repFilter, stageFilter, searchQuery]);

  // Key KPI Stats
  const totalValue = useMemo(() => projects.reduce((acc, p) => acc + (p.dealValue || 0), 0), [projects]);
  const activeWipCount = useMemo(() => projects.filter((p) => p.stage !== 'COMPLETED').length, [projects]);
  const permittingCount = useMemo(() => projects.filter((p) => p.stage === 'PERMITTING').length, [projects]);
  const sitePrepCount = useMemo(() => projects.filter((p) => p.stage === 'SITE_PREP' || p.stage === 'TRANSPORT_SET' || p.stage === 'UTILITIES_HOOKUP').length, [projects]);
  const completedCount = useMemo(() => projects.filter((p) => p.stage === 'COMPLETED').length, [projects]);

  const STAGES: ProjectStage[] = [
    'LEAD_QUALIFIED',
    'PERMITTING',
    'SITE_PREP',
    'FACTORY_BUILD',
    'TRANSPORT_SET',
    'UTILITIES_HOOKUP',
    'FINAL_INSPECTION',
    'COMPLETED'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0284c7]">
              GHL PROJECT OPERATIONS &amp; JOB PIPELINE
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              GHL Pipeline Live
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Board &amp; Job Site Map
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Live Central Florida project map and milestone tracking for active jobs pulled directly from GoHighLevel opportunity pipelines.
          </p>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSyncGhl}
            disabled={isSyncingGhl}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl shadow-xs text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span className={isSyncingGhl ? 'animate-spin' : ''}>⚡</span>
            <span>{isSyncingGhl ? 'Syncing GHL...' : 'Sync Opportunities from GHL'}</span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>{syncSuccessMsg}</span>
          <button onClick={() => setSyncSuccessMsg(null)} className="text-emerald-600 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Active Jobs</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              📍
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {projects.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">GHL opportunities</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Pipeline Value</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
              $
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">
            ${(totalValue / 1000000).toFixed(2)}M
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Turnkey contract WIP</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">In Permitting</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              📋
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">
            {permittingCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">County plan &amp; health reviews</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Site Work &amp; Utilities</span>
            <div className="w-7 h-7 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-xs">
              🚜
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-cyan-600">
            {sitePrepCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Pad, set, and hookups</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">Completed &amp; CO</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              🏆
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {completedCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Move-in keys turned</p>
        </div>
      </div>

      {/* View Switcher Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'map'
                ? 'bg-[#0B1E38] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📍</span>
            <span>Central Florida Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'kanban'
                ? 'bg-[#0B1E38] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📋</span>
            <span>Pipeline Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'table'
                ? 'bg-[#0B1E38] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📊</span>
            <span>Job Table View</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white text-slate-700"
          >
            <option value="ALL">All Consultants</option>
            <option value="Scott Pierpont">Scott Pierpont</option>
            <option value="Alexander Vorasane">Alex Vorasane</option>
            <option value="Mike Ung">Mike Ung</option>
            <option value="CJ Cornett">CJ Cornett</option>
            <option value="Kevin Malone">Kevin Malone</option>
          </select>
        </div>
      </div>

      {/* 1. MAP VIEW */}
      {activeTab === 'map' && (
        <ProjectMap
          projects={filteredProjects}
          onSelectProject={(p) => setSelectedProject(p)}
          selectedProject={selectedProject}
        />
      )}

      {/* 2. PIPELINE KANBAN VIEW */}
      {activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1300px]">
            {STAGES.map((stageKey) => {
              const stageConfig = PROJECT_STAGE_CONFIG[stageKey];
              const stageProjects = filteredProjects.filter((p) => p.stage === stageKey);

              return (
                <div
                  key={stageKey}
                  className="w-80 shrink-0 bg-slate-100/70 border border-slate-200 rounded-2xl p-3.5 flex flex-col space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span>{stageConfig.icon}</span>
                      <span className="font-black text-xs text-slate-800">{stageConfig.label}</span>
                    </div>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600">
                      {stageProjects.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                    {stageProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProject(p);
                          setActiveTab('map');
                        }}
                        className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-[#1E6FA8] hover:shadow-xs transition-all cursor-pointer space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400">{p.jobId}</span>
                            <div className="font-black text-slate-900 text-sm leading-tight">{p.customerName}</div>
                          </div>
                          <span className="font-mono font-bold text-emerald-700 text-xs">
                            ${(p.dealValue || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600">
                          📍 {p.jobAddress}, {p.city} ({p.county})
                        </div>

                        <div className="text-[11px] font-semibold text-[#0B1E38]">
                          🏡 {p.homeModel}
                        </div>

                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Rep: {p.assignedRep.split(' ')[0]}</span>
                          <span className="font-bold text-[#1E6FA8]">{p.progressPct}% done</span>
                        </div>
                      </div>
                    ))}

                    {stageProjects.length === 0 && (
                      <div className="p-6 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
                        No active jobs in this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TABLE VIEW */}
      {activeTab === 'table' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Job ID / GHL</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Home Model</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Contract Value</th>
                  <th className="py-3 px-4">Rep</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-[#1E6FA8]">
                      {p.jobId}
                      <span className="block text-[10px] text-slate-400 font-normal">{p.ghlOpportunityId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.customerName}</div>
                      <div className="text-[11px] text-slate-500">{p.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{p.jobAddress}</div>
                      <div className="text-[11px] text-slate-400">{p.city}, FL ({p.county} Co.)</div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">
                      {p.homeModel}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-black border inline-flex items-center gap-1"
                        style={{
                          backgroundColor: PROJECT_STAGE_CONFIG[p.stage]?.bg || '#F0F9FF',
                          color: PROJECT_STAGE_CONFIG[p.stage]?.color || '#0284C7',
                          borderColor: PROJECT_STAGE_CONFIG[p.stage]?.border || '#BAE6FD'
                        }}
                      >
                        {PROJECT_STAGE_CONFIG[p.stage]?.icon} {PROJECT_STAGE_CONFIG[p.stage]?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ${(p.dealValue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {p.assignedRep}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProject(p);
                          setActiveTab('map');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                      >
                        View on Map 📍
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

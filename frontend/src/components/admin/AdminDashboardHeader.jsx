import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const AdminDashboardHeader = ({
  lastSynced = null,
  onRefresh = () => {},
  isRefreshing = false,
}) => {
  const syncTime = lastSynced
    ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 md:p-8 shadow-xs border border-slate-800 relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
            <span>Institutional Administration Hub</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            System Administration &amp; Governance
          </h1>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            Institutional overview of active user roles, curriculum master data, hiring partner companies, and campus events.
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational • All Microservices Active</span>
            <span>•</span>
            <span>Synced: {syncTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminDashboardHeader;

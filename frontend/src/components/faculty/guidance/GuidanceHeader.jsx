import React from 'react';
import { RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const GuidanceHeader = ({
  totalCount = 0,
  pendingCount = 0,
  inReviewCount = 0,
  completedCount = 0,
  isRefreshing = false,
  onRefresh,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card" data-testid="guidance-header">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 font-heading tracking-tight">
              Guidance Inbox
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200/80">
              Remedial & Guidance Queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review student remedial submissions and verify task completion.
          </p>
        </div>

        {/* Triage summary stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Pending ({pendingCount})</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>In Review ({inReviewCount})</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Completed ({completedCount})</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            title="Refresh Inbox"
            aria-label="Refresh Inbox"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidanceHeader;

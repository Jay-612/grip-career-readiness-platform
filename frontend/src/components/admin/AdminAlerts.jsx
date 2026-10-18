import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminAlerts = ({
  pendingUsersCount = 0,
  eventsCount = 0,
  companiesCount = 0,
}) => {
  return (
    <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Admin Action Center</h2>
            <p className="text-[11px] text-slate-500">System notices and pending institutional reviews</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">All Operations Normal</span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-slate-800 block truncate">
                Role-Based Access Control Active
              </span>
              <span className="text-[11px] text-slate-500">
                All accounts protected under strict institutional JWT permissions
              </span>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
          >
            Review Roles →
          </Link>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-slate-800 block truncate">
                Placement Readiness Engine Synced
              </span>
              <span className="text-[11px] text-slate-500">
                Formula 30% Goals + 40% Mock Interviews + 30% Recruiter Feedback is live
              </span>
            </div>
          </div>
          <Link
            to="/admin/analytics"
            className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
          >
            View Trends →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AdminAlerts;

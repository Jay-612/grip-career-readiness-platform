import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';

export const DashboardHeader = ({
  studentName = 'Student',
  semester = 1,
  targetTrack = '',
  profileCompletion = 0,
  lastSynced = null,
  isRefreshing = false,
  onRefresh = () => {},
}) => {
  return (
    <header className="space-y-3">
      {/* Top subtle meta-bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-700">Daily Action Center</span>
          <span className="text-slate-300">•</span>
          <span>
            {lastSynced
              ? `Synced ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Live'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-blue-600 transition"
          >
            <span>Profile {profileCompletion}% Complete</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs transition disabled:opacity-60 cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3 h-3 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Main clean greeting card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              <GraduationCap className="w-3 h-3" />
              <span>Semester {semester} of 8</span>
            </span>
            {targetTrack ? (
              <span className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                • {targetTrack}
              </span>
            ) : (
              <Link
                to="/student/career-compass?takeQuiz=true"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hover:bg-amber-100 transition"
              >
                <Sparkles className="w-3 h-3" />
                <span>Select Career Track</span>
              </Link>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {studentName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Here are your highest-priority items and readiness focus for today.
          </p>
        </div>

        {/* Small contextual CTA if no track selected */}
        {!targetTrack && (
          <Link
            to="/student/career-compass?takeQuiz=true"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition shadow-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Take 2-min Career Quiz</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;

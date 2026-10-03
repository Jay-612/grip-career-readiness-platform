import React from 'react';
import { Target, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import ProgressBar from '../../common/ProgressBar';

export const GoalSummary = ({
  activeCount = 0,
  dueThisWeekCount = 0,
  completedCount = 0,
  completionRate = 0,
  totalCount = 0,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Active Goals */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Goals
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {activeCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">In Progress</span>
        </div>
      </div>

      {/* 2. Due This Week */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Due This Week
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              dueThisWeekCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {dueThisWeekCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {dueThisWeekCount === 1 ? 'Deadline pending' : 'Deadlines pending'}
          </span>
        </div>
      </div>

      {/* 3. Completed Goals */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Completed
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {completedCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            of {totalCount} total
          </span>
        </div>
      </div>

      {/* 4. Overall Progress */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Progress
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {completionRate}%
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Completion</span>
          </div>
          <ProgressBar
            value={completionRate}
            max={100}
            variant={completionRate >= 80 ? 'success' : 'primary'}
            size="xs"
          />
        </div>
      </div>
    </div>
  );
};

export default GoalSummary;

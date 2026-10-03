import React from 'react';
import { User, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Badge from '../../common/Badge';

export const ActivePlanSummary = ({
  plan,
  completedCount = 0,
  totalCount = 0,
  nextDeadline = null,
}) => {
  if (!plan) return null;

  const facultyName = plan.evaluatorId?.name
    ? (plan.evaluatorId.name.startsWith('Dr.') || plan.evaluatorId.name.startsWith('Prof.')
        ? plan.evaluatorId.name
        : `Prof. ${plan.evaluatorId.name}`)
    : 'Faculty Evaluator';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Pending Schedule';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Pending';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Pending';
    }
  };

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isFullyCompleted = totalCount > 0 && completedCount >= totalCount;

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col gap-4"
      data-testid="active-plan-summary"
    >
      {/* Top row: Title and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Active Remedial Plan
            </span>
            {isFullyCompleted ? (
              <Badge variant="success" size="sm" dot>
                All Tasks Completed
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" dot>
                Action Required
              </Badge>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {plan.weakSkill
              ? `${plan.weakSkill} Remedial Program`
              : 'Placement Evaluation Remedial Plan'}
          </h2>
        </div>

        {/* Compact Progress Indicator */}
        <div className="flex items-baseline sm:flex-col sm:items-end gap-1.5 shrink-0">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {completedCount}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              / {totalCount} completed
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {progressPercent}% target clearance
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isFullyCompleted ? 'bg-emerald-500' : 'bg-blue-600'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      {/* Metadata Row: Faculty, Created Date, Next Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <User className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned By</span>
            <span className="font-semibold text-slate-800 truncate">{facultyName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Created</span>
            <span className="font-medium text-slate-700">{formatDate(plan.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Next Deadline</span>
            <span className="font-semibold text-slate-800">
              {nextDeadline ? formatDate(nextDeadline) : 'No pending deadlines'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePlanSummary;

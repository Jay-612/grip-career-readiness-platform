import React from 'react';
import {
  Check,
  Calendar,
  AlertTriangle,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  Sliders,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import ProgressBar from '../../common/ProgressBar';

export const GoalItem = ({
  goal,
  onToggleStatus = () => {},
  onUpdateProgress = () => {},
  onViewDetails = () => {},
  onEdit = () => {},
  onDelete = () => {},
  isUpdating = false,
}) => {
  const isDone = goal.status === 'completed';
  const isOverdue = goal.deadlineInfo?.isOverdue && !isDone;
  const isDueSoon = goal.deadlineInfo?.isDueSoon && !isDone;

  const priorityColor =
    goal.priority === 'High'
      ? 'bg-rose-100 text-rose-800 border-rose-200'
      : goal.priority === 'Medium'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <article
      className={`
        p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-150 flex flex-col gap-3.5 shadow-card hover:shadow-card-hover
        ${isOverdue ? 'border-rose-300 bg-rose-50/15' : isDone ? 'border-slate-200/70 bg-slate-50/50' : 'border-slate-200/90'}
      `}
      aria-label={`Goal: ${goal.cleanTitle}`}
    >
      {/* Top Row: Checkbox, Title, Category, Priority, and Quick Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Checkbox Toggle */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onToggleStatus(goal.id, isDone ? 'in-progress' : 'completed')}
            title={isDone ? 'Mark as In Progress' : 'Mark Complete'}
            className={`
              w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 mt-0.5
              ${
                isDone
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'border-2 border-slate-300 hover:border-blue-600 bg-white'
              }
              ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
            `}
          >
            {isDone && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* Goal Information */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                onClick={() => onViewDetails(goal)}
                className={`
                  text-sm sm:text-base font-bold tracking-tight cursor-pointer hover:text-blue-600 transition-colors
                  ${isDone ? 'text-slate-400 line-through' : 'text-slate-900'}
                `}
              >
                {goal.cleanTitle}
              </span>

              {/* Priority badge - High priority strongly stands out */}
              {goal.priority === 'High' ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                  High Priority
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  {goal.priority}
                </span>
              )}

              {/* Category tag */}
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                {goal.category}
              </span>

              {goal.isRemedial && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  🎯 Faculty Action Plan
                </span>
              )}
            </div>

            {/* Deadline and Milestones Meta */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Due: {goal.deadlineInfo?.text}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500 font-medium">
                {goal.completedMilestonesCount} / {goal.totalMilestonesCount} milestones completed
              </span>
              {goal.assignedBy?.name && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Mentor: {goal.assignedBy.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Right: Status Badge & Edit/Details */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={
              isDone
                ? 'success'
                : isOverdue
                ? 'danger'
                : goal.status === 'in-progress'
                ? 'info'
                : 'warning'
            }
            size="xs"
            dot
          >
            {isDone
              ? 'Completed'
              : isOverdue
              ? 'Overdue'
              : goal.status === 'in-progress'
              ? 'In Progress'
              : 'Pending'}
          </Badge>

          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Edit Goal"
            aria-label="Edit Goal"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Row: Progress Bar & Next Milestone */}
      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Next Milestone Action */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-slate-700 shrink-0 text-[11px] uppercase tracking-wider">
            Next:
          </span>
          <span className="text-slate-600 font-medium truncate text-xs">
            {goal.nextAction}
          </span>
        </div>

        {/* Progress % and visual indicator */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center w-full sm:w-56">
          <span className="text-[11px] font-bold font-mono text-slate-700 w-10 text-right">
            {goal.progress}%
          </span>
          <div className="flex-1">
            <ProgressBar
              value={goal.progress}
              max={100}
              variant={isDone ? 'success' : goal.progress >= 50 ? 'primary' : 'warning'}
              size="xs"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        <button
          type="button"
          onClick={() => onViewDetails(goal)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
        >
          <span>View Details &amp; History</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => onUpdateProgress(goal)}
            leftIcon={<Sliders className="w-3 h-3 text-blue-600" />}
            className="text-xs font-semibold"
          >
            Update Progress
          </Button>

          {!isDone && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onToggleStatus(goal.id, 'completed')}
              disabled={isUpdating}
              className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
            >
              Mark Done
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default GoalItem;

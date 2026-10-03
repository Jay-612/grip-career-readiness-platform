import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Check, Clock, AlertTriangle, Calendar, Plus, ArrowRight } from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

export const PriorityTaskList = ({
  tasks = [],
  onCompleteTask = () => {},
  completingTaskId = null,
}) => {
  // Take at most 2 highest priority active goals
  const displayTasks = (tasks || []).slice(0, 2);

  // Helper for deadline status
  const getDeadlineInfo = (dueDate) => {
    if (!dueDate) return { label: 'Flexible', variant: 'neutral' };
    try {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDay = new Date(due);
      dueDay.setHours(0, 0, 0, 0);

      const diffDays = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return { label: `Overdue (${Math.abs(diffDays)}d)`, variant: 'danger' };
      }
      if (diffDays === 0) {
        return { label: 'Due Today', variant: 'warning' };
      }
      if (diffDays === 1) {
        return { label: 'Due Tomorrow', variant: 'warning' };
      }
      if (diffDays <= 7) {
        return { label: `${diffDays}d left`, variant: 'info' };
      }
      return {
        label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        variant: 'neutral',
      };
    } catch {
      return { label: 'Scheduled', variant: 'neutral' };
    }
  };

  return (
    <article
      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between"
      aria-label="High Priority Tasks"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Priority Tasks
              </h2>
              <span className="text-[11px] text-slate-400">
                Top 2 Active Milestones
              </span>
            </div>
          </div>

          <Badge variant="neutral" size="xs">
            {displayTasks.length} Pending
          </Badge>
        </div>

        {displayTasks.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-xs font-bold text-slate-800">
              All Caught Up!
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              No active commitments pending. Set your next sprint goal to keep building momentum.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 mt-2">
            {displayTasks.map((task) => {
              const deadline = getDeadlineInfo(task.dueDate);
              const isCompleting = completingTaskId === task.id;
              const isRemedial =
                Boolean(task.isRemedial) ||
                task.source === 'action_plan' ||
                task.category === 'remedial' ||
                (task.title && task.title.toLowerCase().includes('remedial'));

              // Clean title from machine prefixes
              const cleanTitle = (task.title || 'Untitled Task').replace(
                /^\[Action Plan: Mock Remedial\]\s*/i,
                ''
              );

              return (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={deadline.variant} size="xs">
                        {deadline.label}
                      </Badge>
                      {isRemedial && (
                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                          Remedial Plan
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {cleanTitle}
                    </h3>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    disabled={isCompleting}
                    isLoading={isCompleting}
                    onClick={() => onCompleteTask(task.id)}
                    className="shrink-0 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                    leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                    aria-label={`Mark task ${cleanTitle} as complete`}
                  >
                    Done
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <Link
          to="/student/goals"
          className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          <span>View all goals →</span>
        </Link>
        <Link
          to="/student/goals"
          className="text-slate-400 hover:text-slate-600 text-xs inline-flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>Add Goal</span>
        </Link>
      </div>
    </article>
  );
};

export default PriorityTaskList;

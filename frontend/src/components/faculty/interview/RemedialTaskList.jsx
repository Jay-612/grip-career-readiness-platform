import React from 'react';
import { Calendar, Link2, Edit3, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Badge from '../../common/Badge';

export const RemedialTaskList = ({
  tasks = [],
  onEditTask = () => {},
  onRemoveTask = () => {},
  isReadOnly = false,
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const getCategoryBadgeVariant = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'technical':
        return 'primary';
      case 'communication':
        return 'info';
      case 'confidence':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
        <p className="text-xs text-slate-500">
          No remedial tasks currently queued for this student.
        </p>
        <p className="text-[11px] text-slate-400">
          Click <strong>"+ Add Task"</strong> to assign targeted practice items.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          {/* Left: Task Title, Category, Due date, Resource */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {task.title}
              </span>
              <Badge variant={getCategoryBadgeVariant(task.category)} size="xs">
                {task.category || 'Remedial'}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <Calendar className="w-3 h-3 text-slate-400" />
                Due: {formatDate(task.targetDate)}
              </span>

              {task.estimatedHours && (
                <span>• {task.estimatedHours} hrs</span>
              )}

              {task.resourceLink && (
                <span className="flex items-center gap-1 text-blue-600 truncate max-w-xs">
                  <Link2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{task.resourceLink}</span>
                </span>
              )}
            </div>

            {task.description && (
              <p className="text-[11px] text-slate-500 line-clamp-1 pt-0.5">
                {task.description}
              </p>
            )}
          </div>

          {/* Right: Compact Edit / Remove Actions */}
          {!isReadOnly && (
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => onEditTask(task)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition"
                title="Edit task"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onRemoveTask(task.id)}
                className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition"
                title="Remove task"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RemedialTaskList;

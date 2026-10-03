import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Sliders,
  Edit2,
  Trash2,
  ListTodo,
  FileText
} from 'lucide-react';
import Modal from '../../common/Modal';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import ProgressBar from '../../common/ProgressBar';

export const GoalDetailsModal = ({
  isOpen = false,
  onClose = () => {},
  goal = null,
  onEdit = () => {},
  onDelete = () => {},
  onUpdateProgress = () => {},
  onToggleStatus = () => {},
  isUpdating = false,
}) => {
  if (!goal) return null;

  const isDone = goal.status === 'completed';
  const isOverdue = goal.deadlineInfo?.isOverdue && !isDone;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Goal Details &amp; Milestones"
      description="Inspect milestones, timeline, and mentor attribution"
      size="md"
    >
      <div className="space-y-4 pt-2">
        {/* Title & Badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
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
              size="sm"
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

            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {goal.category}
            </span>

            {goal.priority === 'High' ? (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                High Priority
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {goal.priority} Priority
              </span>
            )}

            {goal.isRemedial && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                🎯 Faculty Action Plan
              </span>
            )}
          </div>

          <h3 className={`text-base font-bold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
            {goal.cleanTitle}
          </h3>
        </div>

        {/* Progress Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Progress Breakdown</span>
            <span className="font-mono font-bold text-blue-600">{goal.progress}%</span>
          </div>
          <ProgressBar
            value={goal.progress}
            max={100}
            variant={isDone ? 'success' : goal.progress >= 50 ? 'primary' : 'warning'}
            size="sm"
          />
        </div>

        {/* Timeline & Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-slate-400 font-medium">Target Deadline</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(goal.dueDate)}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              ({goal.deadlineInfo?.text})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-slate-400 font-medium">Attribution</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">
                {goal.assignedBy?.name || (goal.isRemedial ? 'Faculty Evaluator' : 'Self Assigned')}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Source: {goal.source || 'Student Goal'}
            </span>
          </div>
        </div>

        {/* Description / Notes if present */}
        {goal.description && (
          <div className="space-y-1 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes &amp; Context</span>
            </span>
            <p className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 leading-relaxed">
              {goal.description}
            </p>
          </div>
        )}

        {/* Milestone History */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-blue-600" />
              <span>Milestone History</span>
            </span>
            <span className="text-slate-400 font-medium">
              {goal.completedMilestonesCount} / {goal.totalMilestonesCount} completed
            </span>
          </div>

          <div className="space-y-1.5">
            {goal.milestones?.map((m, idx) => (
              <div
                key={m.id || idx}
                className={`
                  flex items-center justify-between p-2.5 rounded-xl border
                  ${
                    m.completed
                      ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]
                      ${m.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'}
                    `}
                  >
                    {m.completed && <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />}
                  </div>
                  <span className={m.completed ? 'line-through text-slate-400 font-normal' : 'font-medium'}>
                    {m.title}
                  </span>
                </div>
                <Badge variant={m.completed ? 'success' : 'neutral'} size="xs">
                  {m.completed ? 'Finished' : 'Upcoming'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onDelete(goal);
            }}
            className="text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs self-start"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Goal
          </Button>

          <div className="flex items-center gap-2 self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(goal);
              }}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onUpdateProgress(goal);
              }}
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
            >
              Update Progress
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GoalDetailsModal;

import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  FileCheck,
  Send,
  Eye,
  BookOpen
} from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const RemedialTaskItem = ({
  task,
  onViewDetails,
  onSubmitWork,
  onUpdateSubmission,
}) => {
  const {
    title,
    description,
    dueDate,
    status, // 'pending' | 'in-progress' | 'completed'
    priorityCategory, // 'overdue' | 'rework' | 'due-soon' | 'in-progress' | 'completed'
    submission, // { status: 'submitted'|'approved'|'rework'|'none', submittedAt, feedback, submissionText }
    resources = [],
  } = task;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'TBD';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'TBD';
    }
  };

  const isCompleted = status === 'completed' || submission?.status === 'approved';
  const isRework = submission?.status === 'rework';
  const isSubmitted = submission?.status === 'submitted';
  const isOverdue = priorityCategory === 'overdue';
  const isDueSoon = priorityCategory === 'due-soon';

  return (
    <div
      className={`
        p-4 sm:p-5 rounded-2xl border transition-all duration-150 flex flex-col gap-3.5
        ${
          isRework
            ? 'bg-amber-50/40 border-amber-300 shadow-sm ring-1 ring-amber-400/30'
            : isOverdue
            ? 'bg-rose-50/20 border-rose-300 shadow-xs'
            : isCompleted
            ? 'bg-slate-50/70 border-slate-200/70 opacity-80'
            : 'bg-white border-slate-200/90 shadow-card hover:border-slate-300'
        }
      `}
      data-testid="remedial-task-item"
    >
      {/* Header Row: Category Badge + Status Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {isOverdue && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Overdue
            </span>
          )}
          {isRework && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
              <RotateCcw className="w-3 h-3 text-amber-700" />
              Rework Requested
            </span>
          )}
          {isDueSoon && !isOverdue && !isRework && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              <Clock className="w-3 h-3 text-amber-600" />
              Due Soon
            </span>
          )}
          {isSubmitted && !isRework && !isCompleted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
              <FileCheck className="w-3 h-3 text-blue-600" />
              Submitted for Review
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Completed & Approved
            </span>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Due: <strong>{formatDate(dueDate)}</strong></span>
          </div>
        </div>

        {/* Status Pill */}
        <div className="text-xs">
          {isCompleted ? (
            <Badge variant="success" size="xs">
              Approved
            </Badge>
          ) : isSubmitted ? (
            <Badge variant="info" size="xs">
              Under Review
            </Badge>
          ) : isRework ? (
            <Badge variant="warning" size="xs">
              Revision Needed
            </Badge>
          ) : (
            <Badge variant="neutral" size="xs">
              In Progress
            </Badge>
          )}
        </div>
      </div>

      {/* Task Title & Short Description */}
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Prominent Faculty Feedback Banner if Rework Requested */}
      {isRework && submission?.feedback && (
        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <RotateCcw className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Faculty Feedback:</span>
          </div>
          <p className="pl-5 leading-relaxed font-medium whitespace-pre-wrap text-amber-900">
            "{submission.feedback}"
          </p>
        </div>
      )}

      {/* Submitted info banner if under review */}
      {isSubmitted && !isRework && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Submitted on <strong>{formatDate(submission.submittedAt)}</strong>. Faculty review is in progress.
            </span>
          </div>
        </div>
      )}

      {/* Resource links attached to this task */}
      {resources.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            Resources:
          </span>
          {resources.map((res, i) => (
            <a
              key={i}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200/60 transition truncate max-w-xs"
            >
              <span className="truncate">{res.title || 'Resource Guide'}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2.5">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onViewDetails(task)}
          className="text-slate-600 hover:text-slate-900 text-xs font-semibold pl-0"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
          View Details
        </Button>

        <div className="flex items-center gap-2">
          {/* Action button based on state */}
          {isRework ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onUpdateSubmission(task)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs shadow-xs"
            >
              Update Submission
            </Button>
          ) : isSubmitted ? (
            <span className="text-xs font-semibold text-slate-400 italic">
              Review Pending
            </span>
          ) : isCompleted ? (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Done
            </span>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSubmitWork(task)}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="text-xs shadow-xs"
            >
              Submit Work
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemedialTaskItem;

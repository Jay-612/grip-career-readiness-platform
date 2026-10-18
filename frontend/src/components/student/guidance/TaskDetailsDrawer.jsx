import React from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  User,
  ExternalLink,
  MessageSquare,
  FileText,
  RotateCcw,
  Target
} from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const TaskDetailsDrawer = ({
  isOpen = false,
  onClose,
  task,
  onSubmitWork,
  onUpdateSubmission,
}) => {
  if (!isOpen || !task) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'TBD';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'TBD';
    }
  };

  const isRework = task.submission?.status === 'rework';
  const isSubmitted = task.submission?.status === 'submitted';
  const isCompleted = task.status === 'completed' || task.submission?.status === 'approved';

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end"
      data-testid="task-details-drawer"
    >
      {/* Drawer Panel */}
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Task Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 sm:p-6 space-y-5 flex-1">
          {/* Status and Due Date */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Due: <strong>{formatDate(task.dueDate)}</strong>
              </span>
            </div>
            <div>
              {isCompleted ? (
                <Badge variant="success" size="sm" dot>
                  Verified Complete
                </Badge>
              ) : isSubmitted ? (
                <Badge variant="info" size="sm" dot>
                  Submitted for Review
                </Badge>
              ) : isRework ? (
                <Badge variant="warning" size="sm" dot>
                  Rework Requested
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  In Progress
                </Badge>
              )}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {task.title}
            </h3>
            {task.category && (
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded mt-2 inline-block">
                {task.category} Competency
              </span>
            )}
          </div>

          {/* Detailed Instructions */}
          <div className="space-y-1.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Complete Instructions</span>
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
              {task.description || task.title}
            </p>
          </div>

          {/* Expected Deliverable */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Expected Deliverable
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit proof of completion such as a GitHub repository link, technical documentation, or code implementation verifying your understanding.
            </p>
          </div>

          {/* Attached Resources */}
          {task.resources && task.resources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Attached Resources</span>
              </h4>
              <div className="space-y-1.5">
                {task.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-xs font-semibold text-slate-800 transition group"
                  >
                    <span className="truncate">{res.title || res.url}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Faculty Notes & Actionable Feedback */}
          {task.submission?.feedback && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Faculty Review Feedback</span>
              </h4>
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${
                  isRework
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-medium'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                }`}
              >
                {task.submission.feedback}
              </div>
            </div>
          )}

          {/* Submission Preview if exists */}
          {task.submission?.submissionText && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Your Submitted Deliverable
              </h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 break-all whitespace-pre-wrap max-h-48 overflow-y-auto">
                {task.submission.submissionText}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>

          {isRework ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onUpdateSubmission(task);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
            >
              Update Submission
            </Button>
          ) : isCompleted ? (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Verified Done
            </span>
          ) : isSubmitted ? (
            <span className="text-xs font-semibold text-slate-400">
              Awaiting Faculty Review
            </span>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onSubmitWork(task);
              }}
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

export default TaskDetailsDrawer;

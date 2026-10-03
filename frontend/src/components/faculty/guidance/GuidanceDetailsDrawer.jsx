import React from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  User,
  MessageSquare,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import Avatar from '../../common/Avatar';
import Button from '../../common/Button';
import SubmissionEvidence from './SubmissionEvidence';
import GuidanceReviewActions from './GuidanceReviewActions';
import { parseRequestMetadata } from './GuidanceRequestItem';

export const GuidanceDetailsDrawer = ({
  detail,
  isLoading = false,
  error = null,
  isUnauthorized = false,
  studentReadiness = null,
  onCloseMobile,
  onApprove,
  onRequestRework,
  onAddComment,
  isApproving = false,
  isCommenting = false,
}) => {
  // 1. Error / Unauthorized States
  if (isUnauthorized) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-4 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            You do not have access to this request or it belongs to another faculty advisor.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCloseMobile}
          className="mx-auto"
        >
          Return to Guidance Inbox
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-4 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Unable to load submission</h3>
          <p className="text-xs text-rose-600 max-w-sm mx-auto">
            {error.includes('403') || error.toLowerCase().includes('denied')
              ? 'You do not have access to this request.'
              : 'This guidance request is no longer available.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCloseMobile}
          className="mx-auto"
        >
          Return to Guidance Inbox
        </Button>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-card animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-1/4" />
          </div>
        </div>
        <div className="h-24 bg-slate-100 rounded-xl" />
        <div className="h-36 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  // 3. No request selected empty state
  if (!detail) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Submission Selected</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Choose a student remedial submission from the inbox to review their proof evidence, check code, and verify completion.
        </p>
      </div>
    );
  }

  // 4. Render Selected Submission Detail
  const { taskTitle } = parseRequestMetadata(detail);
  const isCompleted = detail.status === 'replied' || (detail.replies && detail.replies.length > 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-5" data-testid="guidance-detail-panel">
      {/* Mobile Back Header */}
      <div className="lg:hidden pb-1 flex items-center justify-between border-b border-slate-100">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={onCloseMobile}
        >
          Back to Inbox
        </Button>
        <span className="text-[11px] text-slate-400 font-mono">
          ID: #{detail.id?.slice(-6).toUpperCase()}
        </span>
      </div>

      {/* ================= A. STUDENT DOSSIER ================= */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar
            name={detail.studentName || 'Student'}
            size="md"
            className="ring-2 ring-blue-100 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                {detail.studentName || 'Student Candidate'}
              </h2>
              {studentReadiness?.readinessScore !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  {studentReadiness.readinessScore}% Placement Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {detail.studentEmail || 'student@campus.edu'}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="shrink-0">
          {isCompleted ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completed
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending Review
            </span>
          )}
        </div>
      </div>

      {/* ================= B. TASK / PLAN CONTEXT ================= */}
      <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700 uppercase tracking-wider">
            Assigned Remedial Task
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="w-3 h-3 text-slate-400" />
            Submitted: {formatDate(detail.date || detail.createdAt)}
          </span>
        </div>
        <h3 className="text-xs font-bold text-slate-900">
          {taskTitle}
        </h3>
      </div>

      {/* ================= C. STUDENT EVIDENCE & SUBMISSION ================= */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Student Submission & Proof Evidence</span>
        </h4>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <SubmissionEvidence text={detail.question} />
        </div>
      </div>

      {/* ================= D. PREVIOUS FACULTY COMMENTS ================= */}
      {detail.replies && detail.replies.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Faculty Feedback History ({detail.replies.length})</span>
          </h4>

          <div className="space-y-2.5">
            {detail.replies.map((reply, idx) => {
              const isRework = reply.answerText?.includes('Rework Requested');
              const isApproved = reply.answerText?.includes('Approved');
              return (
                <div
                  key={reply.id || idx}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 relative ${
                    isApproved
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : isRework
                      ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Avatar name={reply.mentorName || 'Faculty'} size="xs" />
                      {reply.mentorName || 'Faculty Mentor'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {formatDate(reply.date || reply.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed pl-1">
                    {reply.answerText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= E. REVIEW ACTIONS ================= */}
      <GuidanceReviewActions
        status={detail.status}
        onApprove={onApprove}
        onRequestRework={onRequestRework}
        onAddComment={onAddComment}
        isApproving={isApproving}
        isCommenting={isCommenting}
      />
    </div>
  );
};

export default GuidanceDetailsDrawer;

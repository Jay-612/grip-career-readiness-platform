import React from 'react';
import { Clock, Calendar, Check, X, Eye } from 'lucide-react';
import Button from '../common/Button';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const MentorshipRequestItem = ({
  request,
  onAccept,
  onDecline,
  onView,
  showActions = true,
  actionLoading = false,
}) => {
  const reqId = request.id || request._id;
  const studentName = request.studentName || 'Student Candidate';
  const formattedDate = formatDate(request.date || request.createdAt);

  return (
    <div
      className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
      data-testid="mentorship-request-item"
    >
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-sm text-slate-900 truncate">
            {studentName}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-300" />
            {formattedDate}
          </span>
          {request.status === 'replied' ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              Active Mentorship
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
              Pending Action
            </span>
          )}
        </div>

        {/* Short request message */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          "{request.question}"
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onView(request)}
            leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
            className="text-xs text-slate-600 hover:text-slate-900"
            data-testid="view-request-btn"
          >
            View Details
          </Button>

          {onDecline && request.status !== 'replied' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDecline(request)}
              disabled={actionLoading}
              className="text-xs text-slate-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50"
              data-testid="decline-request-btn"
            >
              Decline
            </Button>
          )}

          {onAccept && request.status !== 'replied' && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onAccept(request)}
              disabled={actionLoading}
              leftIcon={<Check className="w-3.5 h-3.5" />}
              className="text-xs shadow-xs"
              data-testid="accept-request-btn"
            >
              Accept
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorshipRequestItem;

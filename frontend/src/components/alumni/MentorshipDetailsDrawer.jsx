import React from 'react';
import { X, Calendar, User, MessageSquare, Check, Send } from 'lucide-react';
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

export const MentorshipDetailsDrawer = ({
  isOpen = false,
  onClose,
  request,
  onAccept,
  onDecline,
  onReply,
  isAccepting = false,
}) => {
  if (!isOpen || !request) return null;

  const studentName = request.studentName || 'Student Candidate';
  const studentEmail = request.studentEmail || '';
  const formattedDate = formatDate(request.date || request.createdAt);
  const replies = Array.isArray(request.replies) ? request.replies : [];
  const isReplied = request.status === 'replied' || replies.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end"
      data-testid="mentorship-details-drawer"
    >
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 font-heading">
              Mentorship Inquiry Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
            aria-label="Close details"
            data-testid="close-details-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 sm:p-6 space-y-5 flex-1">
          {/* Student Profile Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-slate-900 block truncate">
                {studentName}
              </span>
              {studentEmail && (
                <span className="text-xs text-slate-500 block truncate">
                  {studentEmail}
                </span>
              )}
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-300" />
                Submitted on {formattedDate}
              </span>
            </div>
          </div>

          {/* Request Message */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student Request
            </h3>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans shadow-2xs">
              {request.question}
            </div>
          </div>

          {/* Existing Replies Thread if any */}
          {replies.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Conversation Responses ({replies.length})
              </h3>
              <div className="space-y-2.5">
                {replies.map((rep, idx) => (
                  <div
                    key={rep.id || rep._id || idx}
                    className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-950">
                        {rep.mentorName || 'Alumni Mentor'}
                      </span>
                      <span className="text-blue-700/70">
                        {formatDate(rep.date || rep.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {rep.answerText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-600"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            {!isReplied && onDecline && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onDecline(request);
                  onClose();
                }}
                className="text-xs text-slate-600 hover:text-red-700 hover:border-red-200"
                data-testid="drawer-decline-btn"
              >
                Decline
              </Button>
            )}

            {!isReplied && onAccept && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onAccept(request)}
                isLoading={isAccepting}
                leftIcon={<Check className="w-3.5 h-3.5" />}
                className="text-xs shadow-xs"
                data-testid="drawer-accept-btn"
              >
                Accept Request
              </Button>
            )}

            {isReplied && onReply && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onReply(request)}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="text-xs shadow-xs"
                data-testid="drawer-reply-btn"
              >
                Respond
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipDetailsDrawer;

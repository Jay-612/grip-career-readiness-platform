import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Check, X, Calendar, MessageSquare, Video, User, Send, ExternalLink } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';

export const RequestDetailsModal = ({
  isOpen,
  onClose,
  request,
  onAccept,
  onDecline,
  onReplyGuidance,
  isAccepting = false,
  isSubmittingReply = false,
}) => {
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReplyText('');
    }
  }, [isOpen, request?.id]);

  if (!isOpen || !request) return null;

  const studentName = request.studentName || request.student?.name || 'Student Candidate';
  const studentEmail = request.studentEmail || request.student?.email || '';
  const isInterview = request.type !== 'guidance';
  const requestType = isInterview ? 'Mock Interview Request' : 'Guidance & Mentorship Inquiry';
  const dateText = request.date || request.dateTime || 'Scheduled Slot';
  const contextText = request.context || request.question || request.targetRole || 'No additional notes provided.';

  const handleSendGuidance = () => {
    if (!replyText.trim()) return;
    if (onReplyGuidance) {
      onReplyGuidance(request, replyText.trim());
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>{isInterview ? 'Interview Request Details' : 'Student Guidance Inquiry'}</span>
        </div>
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pt-2">
        {/* Student Profile Info */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3">
          <Avatar name={studentName} size="md" />
          <div className="min-w-0">
            <div className="font-bold text-slate-900 text-xs truncate">{studentName}</div>
            <div className="text-[11px] text-slate-500 truncate">{studentEmail}</div>
            <div className="mt-1">
              <Badge variant={isInterview ? 'primary' : 'warning'} size="sm">
                {requestType}
              </Badge>
            </div>
          </div>
        </div>

        {/* Schedule / Time Info */}
        <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1 text-xs">
          <div className="text-slate-400 font-medium">Requested Schedule</div>
          <div className="font-bold text-slate-800 font-mono flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{dateText}</span>
          </div>
        </div>

        {/* Request Message / Context */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-700">
            {isInterview ? 'Request Objective' : "Student's Guidance Question"}
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-normal">
            "{contextText}"
          </div>
        </div>

        {/* Guidance Response Input (if guidance inquiry) */}
        {!isInterview && (
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Your Guidance Response</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/faculty/guidance/${request.id}`);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer font-normal"
              >
                <span>Open Full Thread</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </label>
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your guidance advice, roadmap, or answer for this student..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none bg-white text-slate-900"
            />
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>

          {onDecline && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onDecline(request);
                onClose();
              }}
              className="text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
            >
              {isInterview ? 'Decline' : 'Dismiss'}
            </Button>
          )}

          {isInterview && onAccept && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isAccepting}
              onClick={() => {
                onAccept(request);
                onClose();
              }}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              {isAccepting ? 'Accepting...' : 'Accept & Confirm'}
            </Button>
          )}

          {!isInterview && onReplyGuidance && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSubmittingReply || !replyText.trim()}
              onClick={handleSendGuidance}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {isSubmittingReply ? 'Sending...' : 'Send Guidance Response'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RequestDetailsModal;

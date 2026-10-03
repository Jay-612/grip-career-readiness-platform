import React from 'react';
import { Clock, Check, X, Calendar, MessageSquare, Video, User } from 'lucide-react';
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
  isAccepting = false,
}) => {
  if (!isOpen || !request) return null;

  const studentName = request.studentName || request.student?.name || 'Student Candidate';
  const studentEmail = request.studentEmail || request.student?.email || '';
  const isInterview = request.type !== 'guidance';
  const requestType = isInterview ? 'Mock Interview Request' : 'Guidance & Mentorship Inquiry';
  const dateText = request.date || request.dateTime || 'Scheduled Slot';
  const contextText = request.context || request.question || request.targetRole || 'No additional notes provided.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Request Details</span>
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
          <div className="text-xs font-semibold text-slate-700">Request Message / Objective</div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
            "{contextText}"
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
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
              className="text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-200"
            >
              Decline
            </Button>
          )}

          {onAccept && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isAccepting}
              onClick={() => {
                onAccept(request);
                onClose();
              }}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isAccepting ? 'Accepting...' : 'Accept & Confirm'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RequestDetailsModal;

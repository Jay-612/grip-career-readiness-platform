import React, { useState } from 'react';
import { AlertCircle, Calendar, Clock, User, X } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const CancelInterviewModal = ({
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
  interview = null,
  isCancelling = false,
  isStudent = true,
}) => {
  const [reason, setReason] = useState('');

  if (!interview) return null;

  const isPending = interview.status === 'pending';
  const partnerLabel = isStudent ? 'Faculty Member' : 'Student Candidate';
  const partnerName = isStudent
    ? interview.interviewerName || interview.faculty?.name || 'Faculty Mentor'
    : interview.studentName || interview.student?.name || 'Student Candidate';

  const dateStr = interview.dateTime || interview.date;
  let formattedDate = 'Date TBA';
  let formattedTime = interview.time || '';

  try {
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        if (!formattedTime) {
          formattedTime = d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      }
    }
  } catch {
    // fallback
  }

  const handleConfirm = () => {
    onConfirm(interview.interviewId || interview.id || interview._id, reason.trim());
  };

  const actionTitle = isPending && isStudent ? 'Withdraw Request' : 'Cancel Interview';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={actionTitle}
      description={
        isPending && isStudent
          ? 'Are you sure you want to withdraw your pending mock interview request?'
          : 'Please confirm session cancellation. The time slot will be released and the other participant will be notified.'
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4 py-2 text-xs">
        {/* Session details card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
            <User className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {partnerLabel}: <strong className="text-slate-900">{partnerName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            {formattedTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formattedTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reason field */}
        <div className="space-y-1.5">
          <label
            htmlFor="cancel-reason"
            className="block font-semibold text-slate-700 text-xs"
          >
            Reason for cancellation <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="cancel-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Scheduling conflict, exam clash, need more prep time..."
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition"
          />
        </div>

        {/* Informational note */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {isPending && isStudent
              ? 'Withdrawing removes the request from the faculty queue.'
              : 'Cancelling releases the faculty time slot so another student can book it. This appointment will remain in your history as cancelled.'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={isCancelling}
          >
            Keep Interview
          </Button>
          <Button
            variant="danger"
            size="sm"
            type="button"
            onClick={handleConfirm}
            isLoading={isCancelling}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
          >
            {actionTitle}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelInterviewModal;

import React from 'react';
import { Calendar, PlusCircle, X, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const ScheduleEventModal = ({
  isOpen,
  onClose,
  targetSkill = '',
  eventTitle = '',
  setEventTitle,
  eventDate = '',
  setEventDate,
  eventDescription = '',
  setEventDescription,
  onSubmit,
  isSubmitting = false,
  successMessage = null,
  errorMessage = null,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Schedule Remediation Workshop</span>
        </div>
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        {targetSkill && (
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
            Target Competency Domain: <strong className="text-blue-950 font-semibold">{targetSkill}</strong>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Workshop / Event Title *</label>
          <input
            type="text"
            required
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="e.g., Intensive Workshop: System Architecture Fundamentals"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Scheduled Date & Time *</label>
          <input
            type="datetime-local"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Intervention Objective & Notes</label>
          <textarea
            rows={3}
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Describe the learning objectives, targeted faculty mentors, and student preparation requirements..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Status messages */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="text-xs bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Scheduling...' : 'Confirm & Announce'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleEventModal;

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
  eventTime = '11:00 AM',
  setEventTime,
  eventVenue = 'Seminar Hall',
  setEventVenue,
  eventDescription = '',
  setEventDescription,
  audienceType = 'all_students',
  setAudienceType,
  targetDepartment = 'Computer Science & Engineering',
  setTargetDepartment,
  targetSemester = 5,
  setTargetSemester,
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

        {/* Date, Time & Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700">Scheduled Date *</label>
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700">Time</label>
            <input
              type="text"
              value={eventTime || '11:00 AM'}
              onChange={(e) => setEventTime && setEventTime(e.target.value)}
              placeholder="e.g. 11:00 AM"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700">Venue</label>
            <input
              type="text"
              value={eventVenue || 'Seminar Hall'}
              onChange={(e) => setEventVenue && setEventVenue(e.target.value)}
              placeholder="e.g. Seminar Hall / Lab 3"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ─── Progressive Disclosure Audience Targeting ───────────── */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Target Audience *</label>
            <span className="text-[10px] text-slate-400">Relevant students receive alerts</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'all_students', label: 'All Students' },
              { id: 'department', label: 'Department' },
              { id: 'semester', label: 'Semester' },
              { id: 'department_semester', label: 'Dept + Sem' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAudienceType && setAudienceType(opt.id)}
                className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition ${
                  (audienceType || 'all_students') === opt.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Progressive Disclosure Selectors */}
          {((audienceType === 'department') || (audienceType === 'department_semester')) && (
            <div className="space-y-1 pt-1 animate-fadeIn">
              <label className="text-[11px] font-semibold text-slate-700">Choose Department</label>
              <select
                value={targetDepartment || 'Computer Science & Engineering'}
                onChange={(e) => setTargetDepartment && setTargetDepartment(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
              </select>
            </div>
          )}

          {((audienceType === 'semester') || (audienceType === 'department_semester')) && (
            <div className="space-y-1 pt-1 animate-fadeIn">
              <label className="text-[11px] font-semibold text-slate-700">Choose Semester</label>
              <select
                value={targetSemester || 5}
                onChange={(e) => setTargetSemester && setTargetSemester(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Intervention Objective & Notes</label>
          <textarea
            rows={2}
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

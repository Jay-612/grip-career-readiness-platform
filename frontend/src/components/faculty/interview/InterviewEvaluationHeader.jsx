import React, { useState } from 'react';
import {
  Video,
  ExternalLink,
  User,
  Calendar,
  Clock,
  ChevronDown,
  CheckCircle2,
  FileCheck,
  Building,
  GraduationCap
} from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const InterviewEvaluationHeader = ({
  currentInterview = {},
  allAppointments = [],
  onSelectInterview = () => {},
  onOpenStudentDetails = () => {},
  onAcceptAppointment = () => {},
  isAccepting = false,
}) => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const student = currentInterview.student || {};
  const studentName = student.name || 'Candidate Student';
  const targetRole = currentInterview.targetRole || student.targetCareer || 'Full Stack & Software Engineering';
  const interviewType = currentInterview.type || 'Mock Technical Screen (System Design & DSA)';
  const status = currentInterview.status || 'scheduled';
  const meetLink = currentInterview.meetLink || '';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBA';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  return (
    <header className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Compact Student & Interview Identity */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
              {studentName}
            </h1>
            <Badge
              variant={
                status === 'completed'
                  ? 'success'
                  : status === 'scheduled'
                  ? 'primary'
                  : status === 'pending'
                  ? 'warning'
                  : 'neutral'
              }
              size="sm"
            >
              {status.toUpperCase()}
            </Badge>

            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
              {targetRole}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              {interviewType}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(currentInterview.dateTime || currentInterview.date)}
              {currentInterview.time && ` at ${formatTime(currentInterview.time)}`}
            </span>
          </div>
        </div>

        {/* Right Actions: Meet, Student Details, and Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
          {/* Switch Appointment dropdown */}
          {allAppointments.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <span>Switch ({allAppointments.length})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isSwitcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSwitcherOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Assigned Interview
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {allAppointments.map((apt) => (
                        <button
                          key={apt.id || apt._id}
                          type="button"
                          onClick={() => {
                            setIsSwitcherOpen(false);
                            onSelectInterview(apt.id || apt._id);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-2 transition ${
                            (apt.id || apt._id) === (currentInterview.id || currentInterview._id)
                              ? 'bg-blue-50/70 font-semibold text-blue-700'
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <p className="font-medium truncate">
                              {apt.student?.name || 'Student Candidate'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {apt.date} {apt.time || ''}
                            </p>
                          </div>
                          <Badge
                            variant={
                              apt.status === 'completed'
                                ? 'success'
                                : apt.status === 'scheduled'
                                ? 'info'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {apt.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* View Student Details action */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenStudentDetails}
            leftIcon={<User className="w-3.5 h-3.5 text-slate-500" />}
            className="text-xs font-semibold"
          >
            View Student Details
          </Button>

          {/* Join Google Meet button (or Accept if pending) */}
          {status === 'pending' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onAcceptAppointment}
              isLoading={isAccepting}
              loadingText="Accepting..."
              leftIcon={<Video className="w-3.5 h-3.5" />}
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700"
            >
              Accept Request
            </Button>
          ) : meetLink ? (
            <a
              href={meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Video className="w-3.5 h-3.5" />}
                rightIcon={<ExternalLink className="w-3 h-3" />}
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
              >
                Join Google Meet
              </Button>
            </a>
          ) : (
            <span className="text-xs text-slate-400 italic px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
              No Video Link
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default InterviewEvaluationHeader;

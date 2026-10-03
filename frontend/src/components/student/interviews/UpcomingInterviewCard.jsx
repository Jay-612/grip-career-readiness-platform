import React from 'react';
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  User,
  Lock,
  Copy,
  Trash2,
  Plus,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Button from '../../common/Button';
import InterviewStatusBadge from './InterviewStatusBadge';

export const UpcomingInterviewCard = ({
  interview = null,
  joinWindow = { canJoin: false, message: '', countdownStr: '', opensAtStr: '' },
  onJoin = () => {},
  onCancel = () => {},
  onOpenBooking = () => {},
  isJoining = false,
  formatDate = (d) => d,
  formatTime = (d) => d,
  onCopyLink = () => {},
}) => {
  // If no upcoming session exists, show compact empty state
  if (!interview) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">
              No upcoming mock interview.
            </span>
            <span className="text-xs text-slate-500">
              Schedule a session with a faculty evaluator to practice and diagnose your readiness.
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenBooking()}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Book Mock Interview
        </Button>
      </div>
    );
  }

  const isPending = interview.status === 'pending';
  const isScheduled = interview.status === 'scheduled';
  const canJoin = joinWindow.canJoin && isScheduled;

  const interviewId = interview.interviewId || interview.id;
  const isGoogleMeet =
    interview.meetingProvider === 'google_meet' ||
    (interview.meetLink && interview.meetLink.includes('meet.google.com'));

  return (
    <article
      className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
      aria-label="Upcoming Interview Session"
    >
      {/* Background ambient subtle glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left Column: Interview Details */}
      <div className="space-y-3 max-w-xl z-10">
        {/* Status Pill & Time Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {isPending ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Pending Faculty Review
            </span>
          ) : canJoin ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Session Active Now
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-blue-300" />
              Confirmed • Unlocks in {joinWindow.countdownStr || 'upcoming'}
            </span>
          )}

          <span className="text-xs text-slate-300 font-medium">
            {formatDate(interview.dateTime)} at {formatTime(interview.dateTime)}
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
            {interview.interviewType || (isPending ? 'Requested Mock Technical Screen' : 'Confirmed Technical Mock Screen')}
          </h2>
          {interview.focusArea && (
            <p className="text-xs text-indigo-200/90 font-medium mt-0.5">
              Focus Area: {interview.focusArea}
            </p>
          )}
        </div>

        {/* Evaluator & Duration */}
        <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-blue-300" />
            <span>Evaluator: <strong className="text-white">{interview.interviewerName || 'Faculty Mentor'}</strong></span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-300" />
            <span>{interview.duration || 45} Minutes Standard Rubric</span>
          </span>
        </div>

        {/* Pending explanation banner if awaiting acceptance */}
        {isPending && (
          <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-400/20 rounded-xl px-3 py-1.5">
            Your booking request has been sent to Professor {interview.interviewerName}. The meeting link will activate once accepted.
          </p>
        )}
      </div>

      {/* Right Column: Actions */}
      <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0 z-10">
        {isPending ? (
          <div className="flex flex-col items-start md:items-end gap-2 w-full sm:w-auto">
            <Button
              disabled
              variant="secondary"
              size="md"
              leftIcon={<Clock className="w-4 h-4 text-amber-300" />}
              className="bg-white/10 text-amber-200 border-white/20 cursor-not-allowed font-medium text-xs sm:text-sm w-full sm:w-auto"
            >
              Awaiting Faculty Acceptance
            </Button>
            <button
              type="button"
              onClick={() => onCancel(interviewId)}
              className="text-xs text-rose-300 hover:text-rose-200 transition underline underline-offset-2"
            >
              Cancel Request
            </button>
          </div>
        ) : canJoin ? (
          <div className="flex flex-col items-start md:items-end gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Button
                variant="success"
                size="md"
                onClick={() => onJoin(interviewId, interview.meetLink)}
                isLoading={isJoining}
                leftIcon={<Video className="w-4 h-4" />}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                className="shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-tight animate-bounce-subtle"
              >
                {isGoogleMeet ? 'Join Google Meet' : 'Join Video Room'}
              </Button>

              {interview.calendarHtmlLink && (
                <a
                  href={interview.calendarHtmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                  title="Add to Google Calendar"
                >
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={<Calendar className="w-4 h-4 text-blue-200" />}
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  >
                    Calendar
                  </Button>
                </a>
              )}
            </div>

            {/* Sub-actions */}
            <div className="flex items-center gap-3 text-[11px] text-blue-200 pt-1">
              {interview.meetLink && (
                <>
                  <button
                    type="button"
                    onClick={() => onCopyLink(interview.meetLink)}
                    className="hover:text-white flex items-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Link</span>
                  </button>
                  <span>•</span>
                </>
              )}
              <button
                type="button"
                onClick={() => onCancel(interviewId)}
                className="text-rose-300 hover:text-rose-200 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Cancel Session</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start md:items-end gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Button
                disabled
                variant="secondary"
                size="md"
                leftIcon={<Lock className="w-4 h-4 text-slate-300" />}
                className="bg-white/10 text-slate-200 border-white/20 cursor-not-allowed font-medium text-xs sm:text-sm w-full sm:w-auto"
                title={`Room unlocks 5 minutes before scheduled start (at ${joinWindow.opensAtStr})`}
              >
                Opens at {joinWindow.opensAtStr}
              </Button>

              {interview.calendarHtmlLink && (
                <a
                  href={interview.calendarHtmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                  title="Add to Google Calendar"
                >
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={<Calendar className="w-4 h-4 text-blue-200" />}
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  >
                    Calendar
                  </Button>
                </a>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 font-medium">
              <Clock className="w-3 h-3" />
              <span>Unlocks 5 minutes before session</span>
            </div>

            <button
              type="button"
              onClick={() => onCancel(interviewId)}
              className="text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1 transition pt-0.5"
            >
              <Trash2 className="w-3 h-3" />
              <span>Cancel Session</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default UpcomingInterviewCard;

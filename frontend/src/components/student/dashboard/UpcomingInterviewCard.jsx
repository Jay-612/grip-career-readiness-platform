import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  User,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

export const UpcomingInterviewCard = ({ interview = null }) => {
  // Helper to format date
  const formatSessionDate = (dateVal) => {
    if (!dateVal) return 'Date TBD';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  if (!interview) {
    return (
      <article
        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between"
        aria-label="Upcoming Interview Status"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Upcoming Mock Interview
              </h2>
              <span className="text-[11px] text-slate-400">
                Faculty Evaluation Slot
              </span>
            </div>
          </div>

          <div className="py-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Calendar className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              No Mock Interview Scheduled
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Schedule a 1-on-1 session with department faculty to benchmark your technical and behavioral readiness.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mt-2">
          <Link to="/student/interviews" className="block">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center text-xs font-semibold text-blue-700 hover:bg-blue-50 border-blue-200"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Book Mock Interview
            </Button>
          </Link>
        </div>
      </article>
    );
  }

  // An upcoming interview exists — give it high visual polish & priority
  const facultyName =
    interview.interviewer?.name ||
    interview.facultyName ||
    interview.facultyId?.name ||
    'Faculty Evaluator';
  const roleOrTrack =
    interview.focusArea ||
    interview.targetRole ||
    interview.type ||
    'Technical & System Design Mock';
  const dateFormatted = formatSessionDate(interview.date || interview.dateTime);
  const timeFormatted = interview.time || interview.timeSlot || 'Scheduled Time';
  const isConfirmed = interview.status === 'scheduled';
  const isPending = interview.status === 'pending';
  const meetLink = interview.meetLink;

  return (
    <article
      className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white shadow-card flex flex-col justify-between relative overflow-hidden"
      aria-label="Active Upcoming Interview"
    >
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Top badge row */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-blue-200 border border-white/15 backdrop-blur-xs">
            <Video className="w-3 h-3 text-blue-300" />
            <span>Next Scheduled Session</span>
          </span>

          <Badge
            variant={isConfirmed ? 'success' : isPending ? 'warning' : 'neutral'}
            size="xs"
            className="capitalize"
          >
            {isConfirmed ? 'Confirmed' : isPending ? 'Awaiting Acceptance' : interview.status}
          </Badge>
        </div>

        {/* Title & Faculty */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            {roleOrTrack}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-blue-200 mt-1">
            <User className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span className="truncate">Evaluator: <strong className="text-white">{facultyName}</strong></span>
          </div>
        </div>

        {/* Date and Time pill grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-semibold text-slate-100 truncate">{dateFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-100 truncate">{timeFormatted}</span>
          </div>
        </div>
      </div>

      {/* Action CTA: Strongest Visual Priority */}
      <div className="relative z-10 pt-4 mt-3 border-t border-white/10 flex items-center gap-2">
        {meetLink ? (
          <a
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-md cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Join Google Meet</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        ) : (
          <Link
            to="/student/interviews"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md"
          >
            <span>View Session Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        <Link
          to="/student/interviews"
          className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition border border-white/10 shrink-0"
          title="All interview appointments"
        >
          Calendar
        </Link>
      </div>
    </article>
  );
};

export default UpcomingInterviewCard;

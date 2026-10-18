import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  GraduationCap,
  ArrowLeft,
  Share2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Tag,
  Building2,
} from 'lucide-react';
import eventService from '../../services/eventService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';

export const StudentEventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchEventData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (eventId) {
          const res = await eventService.getEventById(eventId);
          if (isMounted && res?.event) {
            setEvent(res.event);
          }
        } else {
          // If viewing /student/events without ID, load all relevant events
          const res = await eventService.getEvents({ upcomingOnly: false });
          if (isMounted) {
            setAllEvents(res?.events || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load event details:', err);
          setError(err.response?.data?.message || 'Event not found or has been cancelled.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchEventData();
    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4 animate-fadeIn">
        <Skeleton variant="text" width="200px" height="24px" />
        <SkeletonCard />
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  if (error || (!event && eventId)) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title="Event Not Available"
          message={error || 'This event could not be found or has concluded.'}
          onRetry={() => navigate('/student/events')}
          retryText="View All Events"
        />
      </div>
    );
  }

  // ─── If listing all events (/student/events) ───────────────────────────────
  if (!eventId) {
    return (
      <main className="max-w-5xl mx-auto space-y-6 pb-12 antialiased" aria-label="Campus Events Directory">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
              Campus Placement & Department Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Official faculty workshops, placement screenings, and technical training sessions.
            </p>
          </div>
          <Link to="/student/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {allEvents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-card">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No events scheduled right now</h3>
            <p className="text-xs text-slate-500 mt-1">Check back soon for upcoming department workshops.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allEvents.map((ev) => {
              const evDate = new Date(ev.date);
              const isPast = evDate < new Date();
              return (
                <div
                  key={ev._id || ev.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={isPast ? 'neutral' : 'primary'} size="xs">
                        {ev.eventType || 'Workshop'}
                      </Badge>
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {evDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{ev.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {ev.description || ev.targetSkill || 'Campus skill readiness workshop.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ev.venue || 'Seminar Hall'}</span>
                    </div>
                    <Link to={`/student/events/${ev._id || ev.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    );
  }

  // ─── Single Event Detail Screen ───────────────────────────────────────────
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate >= new Date();
  const organizerName =
    typeof event.hodId === 'object' && event.hodId !== null
      ? event.hodId.name || event.hodId.email
      : 'Department HOD';

  const audienceLabel =
    event.audienceType === 'all_students'
      ? 'All Enrolled Students'
      : event.audienceType === 'department'
      ? `${event.targetDepartment || 'Department'} Students`
      : event.audienceType === 'semester'
      ? `Semester ${event.targetSemester || 'All'}`
      : event.audienceType === 'department_semester'
      ? `${event.targetDepartment || 'CSE'} — Semester ${event.targetSemester || '5'}`
      : 'Relevant Students';

  return (
    <main className="max-w-4xl mx-auto space-y-6 pb-16 antialiased" aria-label="Event Details">
      {/* Toast */}
      {copiedToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Event link copied to clipboard</span>
        </div>
      )}

      {/* Navigation & Header Actions */}
      <div className="flex items-center justify-between gap-3 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Share
          </Button>
          <Link to="/student/dashboard">
            <Button variant="ghost" size="sm" className="text-xs">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Event Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        {/* Banner strip */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs border border-white/20">
              {event.eventType || 'Workshop'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              {isUpcoming ? 'Upcoming Event' : 'Concluded'}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight max-w-2xl">
            {event.title}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-2 max-w-xl">
            Organized by {organizerName}
          </p>
        </div>

        {/* Event Key Meta Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Date</div>
              <div className="text-xs font-bold text-slate-800">
                {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Time</div>
              <div className="text-xs font-bold text-slate-800">{event.time || '11:00 AM'}</div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Venue</div>
              <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                {event.venue || 'Seminar Hall'}
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Audience</div>
              <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                {audienceLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Target Skill Competency */}
          {event.targetSkill && (
            <div className="flex items-center gap-2 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900">
              <Tag className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Target Competency / Domain: <strong className="font-semibold">{event.targetSkill}</strong>
              </span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 font-heading">About This Session</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description ||
                'This session is organized by department leadership to prepare students for upcoming placement drives, mock technical interviews, and industry evaluation rounds.'}
            </p>
          </div>

          {/* Attendance Guidance */}
          <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Student Attendance & Preparation Guidelines</span>
            </div>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li>Arrive 10 minutes before the scheduled time with your student ID card.</li>
              <li>Bring a notebook or laptop for hands-on evaluation exercises.</li>
              <li>Reminders will be automatically delivered to your notification bell 24 hours prior.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentEventDetailPage;

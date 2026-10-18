import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import Badge from '../../common/Badge';

export const UpcomingEventsSection = ({ events = [] }) => {
  if (!events || events.length === 0) return null;

  // Maximum 2 upcoming relevant events to strictly prevent dashboard overload
  const displayedEvents = events.slice(0, 2);

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-4"
      aria-label="Upcoming Important Events"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-heading">
              Upcoming Events
            </h2>
            <p className="text-[11px] text-slate-500">
              Department workshops and campus placement briefings
            </p>
          </div>
        </div>

        {events.length > 2 && (
          <Link
            to="/student/events"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
          >
            <span>View All ({events.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {displayedEvents.map((ev) => {
          const evDate = new Date(ev.date);
          const dateStr = isNaN(evDate.getTime())
            ? 'Upcoming'
            : evDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

          return (
            <div
              key={ev._id || ev.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="primary" size="xs">
                    {ev.eventType || 'Workshop'}
                  </Badge>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/60">
                    {dateStr}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {ev.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{ev.time || '11:00 AM'}</span>
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[110px]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{ev.venue || 'Seminar Hall'}</span>
                  </span>
                </div>

                <Link
                  to={`/student/events/${ev._id || ev.id}`}
                  className="font-semibold text-blue-600 hover:text-blue-800 shrink-0"
                >
                  View Details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingEventsSection;

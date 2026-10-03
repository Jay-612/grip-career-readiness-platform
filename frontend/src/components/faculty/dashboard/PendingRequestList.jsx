import React from 'react';
import { Clock, Check, X, Eye, MessageSquare, Calendar } from 'lucide-react';
import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';

export const PendingRequestList = ({
  requests = [],
  onAccept,
  onDecline,
  onViewDetails,
  acceptingId = null,
}) => {
  return (
    <section
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between"
      data-purpose="pending-requests-section"
    >
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Pending Requests
                </h2>
                {requests.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 font-mono border border-amber-200">
                    {requests.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Inquiries and mock interview bookings awaiting your review
              </p>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <EmptyState
            compact
            title="No pending requests."
            description="All student interview bookings and guidance requests are up to date."
            className="py-8"
          />
        ) : (
          <div className="divide-y divide-slate-100 mt-1">
            {requests.slice(0, 4).map((req) => {
              const studentName = req.studentName || req.student?.name || 'Student Candidate';
              const requestType = req.type === 'guidance' ? 'Guidance Inquiry' : 'Mock Interview';
              const isInterview = req.type !== 'guidance';
              const dateText = req.date || req.dateTime || 'Upcoming Slot';
              const isAccepting = acceptingId === (req.id || req._id);

              return (
                <div
                  key={req.id || req._id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 rounded-xl px-2 -mx-2 transition-colors"
                  data-purpose="pending-request-item"
                >
                  {/* Left: Avatar & Request details */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <Avatar name={studentName} size="sm" className="mt-0.5" />
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {studentName}
                        </span>
                        <Badge
                          variant={isInterview ? 'primary' : 'warning'}
                          size="sm"
                          className="text-[10px]"
                        >
                          {requestType}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {dateText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                        {req.context || req.question || req.targetRole || 'Request for mock assessment and skill coaching.'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails && onViewDetails(req)}
                      leftIcon={<Eye className="w-3 h-3 text-slate-500" />}
                      className="text-xs py-1 px-2.5 h-auto cursor-pointer"
                    >
                      Details
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onAccept && onAccept(req)}
                      disabled={isAccepting}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      className="text-xs py-1 px-2.5 h-auto bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                      {isAccepting ? 'Accepting...' : 'Accept'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDecline && onDecline(req)}
                      leftIcon={<X className="w-3.5 h-3.5 text-rose-500" />}
                      className="text-xs py-1 px-2 h-auto text-rose-600 hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
                      title="Decline Request"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {requests.length > 4 && (
        <div className="pt-2 text-center text-[11px] text-slate-400">
          Showing 4 of {requests.length} pending requests.
        </div>
      )}
    </section>
  );
};

export default PendingRequestList;

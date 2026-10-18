import React from 'react';
import MentorshipRequestItem from './MentorshipRequestItem';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MentorshipRequestList = ({
  requests = [],
  onAccept,
  onDecline,
  onView,
  maxDisplay = 3,
  actionLoading = false,
}) => {
  const pendingRequests = requests.filter(
    (r) => r.status === 'pending' || !r.replyCount
  );
  const displayed = pendingRequests.slice(0, maxDisplay);

  return (
    <section
      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
      data-testid="pending-requests-section"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-heading">
              Pending Mentorship Requests
            </h2>
            <p className="text-[11px] text-slate-500">
              Students seeking placement guidance, code reviews, and career advice.
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
          {pendingRequests.length} Pending
        </span>
      </div>

      {pendingRequests.length === 0 ? (
        <div
          className="p-6 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200"
          data-testid="no-pending-requests"
        >
          No pending mentorship requests waiting for review.
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayed.map((req) => (
            <MentorshipRequestItem
              key={req.id || req._id}
              request={req}
              onAccept={onAccept}
              onDecline={onDecline}
              onView={onView}
              actionLoading={actionLoading}
            />
          ))}

          {pendingRequests.length > maxDisplay && (
            <div className="pt-1 text-center">
              <Link
                to="/alumni/mentorship"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                View all {pendingRequests.length} pending requests in Mentorship Inbox →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default MentorshipRequestList;

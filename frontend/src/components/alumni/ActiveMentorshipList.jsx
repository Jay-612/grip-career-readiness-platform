import React from 'react';
import { Users, ArrowRight, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const ActiveMentorshipList = ({
  mentorships = [],
  onOpenMentorship,
  maxDisplay = 3,
}) => {
  const activeList = mentorships.filter(
    (m) => m.status === 'replied' || (m.replyCount && m.replyCount > 0)
  );
  const displayed = activeList.slice(0, maxDisplay);

  return (
    <section
      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
      data-testid="active-mentorships-section"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-heading">
              Active Mentorships
            </h2>
            <p className="text-[11px] text-slate-500">
              Ongoing student mentorship threads with mutual discussions.
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          {activeList.length} Active
        </span>
      </div>

      {activeList.length === 0 ? (
        <div
          className="p-6 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200"
          data-testid="no-active-mentorships"
        >
          No active mentorships currently ongoing. Accepted requests will appear here.
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayed.map((m) => {
            const mId = m.id || m._id;
            const studentName = m.studentName || 'Student Mentee';
            const latestReplyText = m.latestReply?.answerText || '';
            const formattedDate = formatDate(m.date || m.createdAt);

            return (
              <div
                key={mId}
                className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                data-testid="active-mentorship-item"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900">
                      {studentName}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      {formattedDate}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {m.replyCount || 1} reply
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    <strong className="text-slate-700">Topic:</strong> {m.question}
                  </p>

                  {latestReplyText && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      Latest: "{latestReplyText}"
                    </p>
                  )}
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenMentorship(m)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="text-xs font-semibold"
                    data-testid="open-mentorship-btn"
                  >
                    Open Mentorship
                  </Button>
                </div>
              </div>
            );
          })}

          {activeList.length > maxDisplay && (
            <div className="pt-1 text-center">
              <Link
                to="/alumni/mentorship?tab=active"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                View all {activeList.length} active mentorships →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ActiveMentorshipList;

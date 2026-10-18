import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Video, ArrowRight, Clock, MapPin, ChevronRight, FileCheck } from 'lucide-react';
import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';

export const TodayInterviewList = ({ interviews = [] }) => {
  // Sort priority: In Progress -> Starting Soon / Scheduled -> Completed
  const sortedInterviews = [...interviews].sort((a, b) => {
    const statusOrder = { 'in-progress': 1, 'scheduled': 2, 'pending': 3, 'completed': 4, 'cancelled': 5 };
    const orderA = statusOrder[a.status] || 99;
    const orderB = statusOrder[b.status] || 99;
    if (orderA !== orderB) return orderA - orderB;

    const timeA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
    const timeB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
    return timeA - timeB;
  });

  const formatTime = (timeOrDate) => {
    if (!timeOrDate) return 'Today';
    try {
      const d = new Date(timeOrDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      return timeOrDate;
    } catch {
      return timeOrDate;
    }
  };

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4"
      data-purpose="today-interviews-section"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Today's Interviews
              </h2>
              {interviews.length > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 font-mono border border-blue-200">
                  {interviews.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Scheduled mock evaluations and technical assessments
            </p>
          </div>
        </div>

        <Link
          to="/faculty/interviews"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All Interviews</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List or Empty State */}
      {sortedInterviews.length === 0 ? (
        <EmptyState
          compact
          title="No interviews scheduled for today."
          description="Your schedule is clear for today. View upcoming slots or review pending evaluation rubrics."
          className="py-6"
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {sortedInterviews.slice(0, 4).map((interview) => {
            const studentName = interview.student?.name || 'Student Candidate';
            const studentEmail = interview.student?.email || '';
            const targetRole = interview.targetRole || interview.type || 'Mock Technical Screen';
            const scheduledTime = formatTime(interview.dateTime || interview.time);
            const isCompleted = interview.status === 'completed';
            const isInProgress = interview.status === 'in-progress';
            const hasMeet = Boolean(interview.meetLink);

            return (
              <div
                key={interview.id || interview._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 rounded-xl px-2.5 -mx-2.5 transition-colors"
                data-purpose="today-interview-item"
              >
                {/* Left: Avatar, Student Info, Target Role, Time */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Avatar name={studentName} size="md" className="shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {studentName}
                      </span>
                      {studentEmail && (
                        <span className="text-[11px] text-slate-400 truncate hidden md:inline">
                          • {studentEmail}
                        </span>
                      )}
                      <Badge
                        variant={
                          isInProgress
                            ? 'warning'
                            : isCompleted
                            ? 'neutral'
                            : 'primary'
                        }
                        size="sm"
                        className="font-mono text-[10px]"
                      >
                        {isInProgress ? 'In Progress' : isCompleted ? 'Completed' : 'Scheduled'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="font-medium text-slate-800">{targetRole}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.2 rounded text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        {scheduledTime}
                      </span>
                      {hasMeet && (
                        <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                          <Video className="w-3 h-3 text-emerald-600" />
                          Meet Ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Contextual Primary Action */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  {hasMeet && !isCompleted && (
                    <a
                      href={interview.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
                      title="Open Google Meet Space"
                    >
                      <Video className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Open Meet</span>
                    </a>
                  )}

                  <Link
                    to={
                      interview.id
                        ? `/faculty/interviews/${interview.id}`
                        : '/faculty/interviews'
                    }
                  >
                    <Button
                      variant={isCompleted ? 'outline' : 'primary'}
                      size="sm"
                      leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                      className="text-xs py-1.5 cursor-pointer"
                    >
                      {isCompleted ? 'Review Score' : 'Start Evaluation'}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default TodayInterviewList;

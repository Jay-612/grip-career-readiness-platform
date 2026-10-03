import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Award, FileCheck, ArrowRight } from 'lucide-react';
import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';

export const AttentionStudentList = ({ students = [] }) => {
  return (
    <section
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between"
      data-purpose="attention-students-section"
    >
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Students Needing Attention
                </h2>
                {students.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 font-mono border border-rose-200">
                    {students.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Candidates with low readiness scores or pending action items
              </p>
            </div>
          </div>
        </div>

        {/* Attention Students List */}
        {students.length === 0 ? (
          <EmptyState
            compact
            title="All mentees in good standing."
            description="No assigned students are currently flagged for low readiness or overdue tasks."
            className="py-8"
          />
        ) : (
          <div className="divide-y divide-slate-100 mt-1">
            {students.slice(0, 4).map((student) => {
              const studentName = student.studentName || student.name || 'Candidate';
              const reason = student.reason || student.title || 'Placement Readiness Below Benchmark';
              const badgeVariant = student.severity === 'danger' ? 'danger' : 'warning';
              const badgeText = student.badge || 'Needs Review';
              const link = student.actionLink || '/faculty/interviews';

              return (
                <div
                  key={student.id || student.studentId}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 rounded-xl px-2 -mx-2 transition-colors"
                  data-purpose="attention-student-item"
                >
                  {/* Left: Avatar & Details */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <Avatar name={studentName} size="sm" className="mt-0.5" />
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {studentName}
                        </span>
                        <Badge variant={badgeVariant} size="sm" className="text-[10px]">
                          {badgeText}
                        </Badge>
                        {student.studentEmail && (
                          <span className="text-[11px] text-slate-400 truncate hidden md:inline">
                            • {student.studentEmail}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                        {reason}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Action [Review] */}
                  <div className="shrink-0 self-start sm:self-center">
                    <Link to={link}>
                      <Button
                        variant="outline"
                        size="sm"
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        className="text-xs py-1 px-3 h-auto group-hover:border-blue-300 group-hover:text-blue-600 cursor-pointer"
                      >
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {students.length > 4 && (
        <div className="pt-2 text-center text-[11px] text-slate-400">
          Showing top 4 students requiring mentor intervention.
        </div>
      )}
    </section>
  );
};

export default AttentionStudentList;

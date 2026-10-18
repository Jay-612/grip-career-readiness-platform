import React from 'react';
import { Users, BookOpen, Clock } from 'lucide-react';

export const AlumniActivitySummary = ({
  studentsMentored = 0,
  experiencesPublished = 0,
  pendingInquiries = 0,
}) => {
  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      data-testid="alumni-activity-summary"
    >
      {/* 1. Students Mentored */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Students Mentored
          </span>
          <span className="text-xl font-bold text-slate-900 font-mono">
            {studentsMentored}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Experiences Published */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Experiences Published
          </span>
          <span className="text-xl font-bold text-slate-900 font-mono">
            {experiencesPublished}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Pending Action */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Pending Action
          </span>
          <span className="text-xl font-bold text-slate-900 font-mono">
            {pendingInquiries}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      </div>
    </section>
  );
};

export default AlumniActivitySummary;

import React, { useState } from 'react';
import { Archive, ChevronDown, ChevronUp, Calendar, CheckCircle2, User } from 'lucide-react';
import Badge from '../../common/Badge';

export const CompletedPlansAccordion = ({ plans = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!plans || plans.length === 0) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Past Semester';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Past Semester';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Past Semester';
    }
  };

  return (
    <div
      className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs"
      data-testid="completed-plans-accordion"
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Archive className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Archived Remedial Plans
              </span>
              <span className="px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                {plans.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Completed plans and past interview remediation cycles
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <span>{isExpanded ? 'Hide History' : 'View History'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/40">
          {plans.map((p, idx) => {
            const facultyName = p.evaluatorId?.name
              ? (p.evaluatorId.name.startsWith('Dr.') || p.evaluatorId.name.startsWith('Prof.')
                  ? p.evaluatorId.name
                  : `Prof. ${p.evaluatorId.name}`)
              : 'Faculty Evaluator';

            const tasksCount = p.tasks?.length || (p.recommendedTask ? 1 : 0);

            return (
              <div
                key={p._id || idx}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="xs" dot>
                      Completed & Cleared
                    </Badge>
                    <span className="text-xs font-bold text-slate-900">
                      {p.weakSkill || 'Competency Development Plan'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(p.createdAt)}
                  </span>
                </div>

                {p.facultyFeedback && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                    "{p.facultyFeedback}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium">
                    <User className="w-3 h-3 text-slate-400" />
                    Assigned by: <strong>{facultyName}</strong>
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {tasksCount} {tasksCount === 1 ? 'task' : 'tasks'} resolved
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompletedPlansAccordion;

import React from 'react';
import {
  TrendingDown,
  Calendar,
  Clock,
  ArrowUpRight,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';

const formatDate = (dateStr) => {
  if (!dateStr) return 'TBD';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const SkillGapsTab = ({
  skillGapsData = [],
  totalStudentsWithActionPlans = 0,
  departmentEvents = [],
  onOpenScheduleModal,
}) => {
  return (
    <div className="space-y-6" data-purpose="skill-gaps-tab">
      {/* ─── HEADER WITH PRIMARY ACTION ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-600" />
            Department Competency Gaps & Action Plans
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated from {totalStudentsWithActionPlans} verified student action plans and faculty evaluations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenScheduleModal()}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="text-xs self-start sm:self-auto cursor-pointer"
        >
          + Schedule Event
        </Button>
      </div>

      {skillGapsData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ─── LEFT: RANKED GAP BARS & STRUCTURED TABLE (8 cols) ────────── */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Ranked Bar Visualization */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Top Missing Competencies
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  Ranked by cohort frequency
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {skillGapsData.slice(0, 5).map((gap, index) => {
                  const severityColor =
                    index === 0 ? 'bg-rose-500' : index < 3 ? 'bg-amber-500' : 'bg-blue-500';

                  return (
                    <div key={gap.skill} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {gap.skill}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-semibold text-slate-700">
                            {gap.count} <span className="text-[10px] font-normal text-slate-400">plans</span>
                          </span>
                          <Badge variant={index === 0 ? 'danger' : 'neutral'} size="sm" className="font-mono">
                            {gap.percentage}%
                          </Badge>
                          <button
                            type="button"
                            onClick={() => onOpenScheduleModal(gap.skill)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                            title="Schedule workshop targeting this skill"
                          >
                            <span>Target</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${severityColor}`}
                          style={{ width: `${Math.max(gap.percentage, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 2. Structured Skill Gap Table */}
            <Card className="overflow-hidden p-0">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Skill Gap Audit Table
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {skillGapsData.length} Total Competency Gaps
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Rank</th>
                      <th className="py-2.5 px-4">Skill Domain</th>
                      <th className="py-2.5 px-4 text-center">Action Plans</th>
                      <th className="py-2.5 px-4 text-center">Cohort %</th>
                      <th className="py-2.5 px-4 text-right">Intervention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {skillGapsData.map((gap, index) => (
                      <tr key={gap.skill} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-500">
                          #{index + 1}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {gap.skill}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-center text-slate-700">
                          {gap.count}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            index === 0
                              ? 'bg-rose-100 text-rose-800'
                              : index < 3
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {gap.percentage}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenScheduleModal(gap.skill)}
                            className="text-[11px] py-1 px-2.5 h-auto cursor-pointer"
                          >
                            Target Workshop
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* ─── RIGHT: SCHEDULED REMEDIATION WORKSHOPS (4 cols) ─────────── */}
          <div className="lg:col-span-4">
            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Scheduled Remediation
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {departmentEvents.length} Events
                  </span>
                </div>

                <div className="space-y-3 custom-scrollbar max-h-[460px] overflow-y-auto pr-1">
                  {departmentEvents.length > 0 ? (
                    departmentEvents.map((evt) => (
                      <div
                        key={evt._id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 line-clamp-1">
                            {evt.title}
                          </span>
                          {evt.targetSkill && (
                            <Badge variant="primary" size="sm" className="shrink-0 text-[10px]">
                              {evt.targetSkill}
                            </Badge>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(evt.date)}</span>
                        </div>

                        {evt.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs text-slate-400 space-y-3">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>No intervention workshops scheduled yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenScheduleModal(skillGapsData[0]?.skill || '')}
                        className="text-[11px] mx-auto cursor-pointer"
                      >
                        Schedule First Workshop
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Workshops directly address verified cohort skill deficits.
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState
          compact
          title="No Skill Gaps Registered"
          description="As faculty submit mock interview evaluations with action plans, recurring department skill gaps will automatically aggregate here."
        />
      )}
    </div>
  );
};

export default SkillGapsTab;

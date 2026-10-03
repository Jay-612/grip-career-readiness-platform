import React from 'react';
import { Target, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const CareerSummaryMetrics = ({
  careerMatch = 0,
  verifiedSkillsCount = 0,
  totalRequiredSkills = 0,
  missingSkillsCount = 0,
  roadmapProgress = 0,
  semester = 1,
}) => {
  const metrics = [
    {
      label: 'Career Match',
      value: `${careerMatch}%`,
      subtitle: careerMatch >= 75 ? 'Strong Fit' : 'In Progress',
      icon: Target,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Verified Skills',
      value: `${verifiedSkillsCount} / ${totalRequiredSkills}`,
      subtitle: `${Math.round((verifiedSkillsCount / (totalRequiredSkills || 1)) * 100)}% verified`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Skills Missing',
      value: missingSkillsCount,
      subtitle: missingSkillsCount > 0 ? 'Action items' : 'All clear',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Roadmap Progress',
      value: `${roadmapProgress}%`,
      subtitle: `Semester ${semester} of 8`,
      icon: Layers,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
  ];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
      aria-label="Career Readiness Metrics"
    >
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5"
          >
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${item.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                {item.label}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 leading-none">
                  {item.value}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium truncate block mt-0.5">
                {item.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CareerSummaryMetrics;

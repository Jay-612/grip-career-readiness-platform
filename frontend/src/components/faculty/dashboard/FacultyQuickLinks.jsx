import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MessageSquare, BarChart2 } from 'lucide-react';

export const FacultyQuickLinks = () => {
  const links = [
    {
      to: '/faculty/interviews',
      label: 'Interviews & Evaluations',
      icon: Calendar,
      description: 'Review schedule & submit rubrics',
    },
    {
      to: '/faculty/guidance',
      label: 'Guidance Inbox',
      icon: MessageSquare,
      description: 'Mentorship queries & discussions',
    },
    {
      to: '/faculty/analytics',
      label: 'Department Analytics',
      icon: BarChart2,
      description: 'Cohort readiness benchmarks (HOD)',
    },
  ];

  return (
    <section
      className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5"
      data-purpose="faculty-quick-links"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 mb-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Quick Workspaces
        </span>
        <span className="text-[11px] text-slate-400">
          Navigate deeper into operational modules
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs group transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {link.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {link.description}
                  </div>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default FacultyQuickLinks;

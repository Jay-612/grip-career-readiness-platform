import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Target, Calendar, BookOpen, ChevronRight } from 'lucide-react';

export const QuickNav = () => {
  const links = [
    {
      to: '/student/career-compass',
      label: 'Career Compass',
      hint: 'Curriculum roadmap & skill gaps',
      icon: Compass,
    },
    {
      to: '/student/goals',
      label: 'Goals & Milestones',
      hint: 'Sprint task manager',
      icon: Target,
    },
    {
      to: '/student/interviews',
      label: 'Interview Center',
      hint: 'Mock interviews & scorecards',
      icon: Calendar,
    },
    {
      to: '/student/alumni-posts',
      label: 'Alumni Insights',
      hint: 'Interview experiences & stories',
      icon: BookOpen,
    },
  ];

  return (
    <nav
      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80"
      aria-label="Quick Hub Navigation"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="p-2.5 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700 flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 block truncate">
                    {item.label}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default QuickNav;

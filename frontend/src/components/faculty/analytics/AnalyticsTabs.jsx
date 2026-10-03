import React from 'react';
import { BarChart3, TrendingDown, Users } from 'lucide-react';

export const AnalyticsTabs = ({
  activeTab,
  onTabChange,
  atRiskCount = 0,
  skillGapCount = 0,
  totalStudents = 0,
}) => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'skillGaps',
      label: 'Skill Gaps',
      icon: TrendingDown,
      badge: skillGapCount > 0 ? `${skillGapCount} Gaps` : null,
      badgeVariant: 'warning',
    },
    {
      id: 'roster',
      label: 'Student Roster',
      icon: Users,
      badge: atRiskCount > 0 ? `${atRiskCount} At Risk` : totalStudents ? `${totalStudents}` : null,
      badgeVariant: atRiskCount > 0 ? 'danger' : 'neutral',
    },
  ];

  return (
    <div className="border-b border-slate-200">
      <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar" aria-label="Department Analytics Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`group inline-flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono transition-colors ${
                    isActive
                      ? tab.badgeVariant === 'danger'
                        ? 'bg-rose-100 text-rose-700'
                        : tab.badgeVariant === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AnalyticsTabs;

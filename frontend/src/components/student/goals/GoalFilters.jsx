import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

export const GoalFilters = ({
  activeTab = 'active', // 'active' | 'completed' | 'all' | 'overdue'
  onTabChange = () => {},
  counts = { active: 0, completed: 0, all: 0, overdue: 0 },
  searchQuery = '',
  onSearchChange = () => {},
  sortBy = 'default', // 'default' | 'dueDateAsc' | 'priority' | 'progress' | 'title'
  onSortChange = () => {},
}) => {
  const tabs = [
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'all', label: 'All', count: counts.all },
  ];

  if (counts.overdue > 0) {
    tabs.splice(1, 0, { id: 'overdue', label: 'Overdue', count: counts.overdue, isAlert: true });
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                ${
                  isActive
                    ? tab.isAlert
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                }
              `}
            >
              <span>{tab.label}</span>
              <span
                className={`
                  px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold
                  ${
                    isActive
                      ? 'bg-black/20 text-white'
                      : tab.isAlert
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-600'
                  }
                `}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
          />
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="pl-2.5 pr-7 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer"
            aria-label="Sort goals"
          >
            <option value="default">Default Order</option>
            <option value="dueDateAsc">Due Date (Earliest)</option>
            <option value="priority">Priority (High first)</option>
            <option value="progress">Progress (Highest)</option>
            <option value="title">Title (A-Z)</option>
          </select>
          <ArrowUpDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default GoalFilters;

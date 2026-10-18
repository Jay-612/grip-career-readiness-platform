import React from 'react';
import { Search, X } from 'lucide-react';

export const GuidanceFilters = ({
  activeTab = 'pending',
  onTabChange,
  searchQuery = '',
  onSearchChange,
  counts = { pending: 0, inReview: 0, completed: 0, all: 0 },
}) => {
  const tabs = [
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'inReview', label: 'In Review', count: counts.inReview },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'all', label: 'All', count: counts.all },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full md:w-64">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter student or task..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default GuidanceFilters;

import React from 'react';
import { Search, Building2, Tag, X } from 'lucide-react';

export const AlumniSearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  selectedCompany,
  onCompanySelect,
  availableCompanies = [],
  availableCategories = [],
  onClearFilters,
  totalResults = 0,
}) => {
  const hasActiveFilters = Boolean(searchQuery || selectedCategory || selectedCompany);

  return (
    <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      {/* Top Row: Search & Company Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, role, topic, or alumni name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
            data-testid="alumni-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Company Dropdown Filter */}
        {availableCompanies.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedCompany}
                onChange={(e) => onCompanySelect(e.target.value)}
                aria-label="Filter by Company"
                className="pl-8 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 hover:border-slate-300 transition-colors"
                data-testid="alumni-company-select"
              >
                <option value="">All Companies</option>
                {availableCompanies.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row: Category Chips / Topic Pills */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs w-full scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Tag className="w-3 h-3" /> Topic:
          </span>

          <button
            type="button"
            onClick={() => onCategorySelect('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              !selectedCategory
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
            data-testid="topic-all"
          >
            All
          </button>

          {availableCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategorySelect(isSelected ? '' : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                data-testid={`topic-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Clear Filters CTA if any filter is active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap px-2 py-1 shrink-0"
            data-testid="clear-filters-link"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default AlumniSearchFilters;

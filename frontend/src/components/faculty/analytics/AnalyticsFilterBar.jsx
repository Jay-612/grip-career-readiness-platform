import React from 'react';
import { Filter, RefreshCw, Download, Layers } from 'lucide-react';
import Button from '../../common/Button';

export const AnalyticsFilterBar = ({
  selectedSemester,
  onSemesterChange,
  selectedCareer,
  onCareerChange,
  careerOptions = [],
  filteredCount = 0,
  totalCount = 0,
  onSyncTelemetry,
  isRefreshing = false,
  onExportCSV,
}) => {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
      data-purpose="analytics-filter-bar"
    >
      {/* Left side: Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filters:</span>
        </div>

        {/* Semester Filter */}
        <div className="relative">
          <label htmlFor="filter-semester" className="sr-only">Filter by Semester</label>
          <select
            id="filter-semester"
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors"
          >
            <option value="ALL">All Semesters</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        </div>

        {/* Career Track Filter */}
        {careerOptions.length > 0 && (
          <div className="relative">
            <label htmlFor="filter-career" className="sr-only">Filter by Career Track</label>
            <select
              id="filter-career"
              value={selectedCareer}
              onChange={(e) => onCareerChange(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer max-w-[200px] truncate transition-colors"
            >
              <option value="ALL">All Career Tracks</option>
              {careerOptions.map((career) => (
                <option key={career} value={career}>
                  {career}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Active cohort count indicator */}
        <span className="text-[11px] text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
          Filtered: <strong className="text-slate-900">{filteredCount}</strong> of {totalCount} students
        </span>
      </div>

      {/* Right side: Secondary utility actions */}
      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
        {onExportCSV && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5 text-slate-600" />}
            className="text-xs text-slate-700 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50"
            title="Export filtered student roster as CSV"
          >
            Export CSV
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onSyncTelemetry}
          disabled={isRefreshing}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />}
          className="text-xs text-slate-700 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50"
        >
          {isRefreshing ? 'Syncing...' : 'Sync'}
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsFilterBar;

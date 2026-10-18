import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export const CandidateFilters = ({
  searchQuery = '',
  onSearchChange = () => {},
  selectedDepartment = 'all',
  onDepartmentChange = () => {},
  selectedSemester = 'all',
  onSemesterChange = () => {},
  selectedReadiness = 'all',
  onReadinessChange = () => {},
  selectedCareer = 'all',
  onCareerChange = () => {},
  careerOptions = [],
  totalCount = 0,
  filteredCount = 0,
  onResetFilters = () => {},
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDepartment !== 'all' ||
    selectedSemester !== 'all' ||
    selectedReadiness !== 'all' ||
    selectedCareer !== 'all';

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidates by name, email, or verified skill..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 font-mono">{filteredCount}</strong> of{' '}
            <strong className="text-slate-800 font-mono">{totalCount}</strong> candidates
          </span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Information Technology">IT</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Semester
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Semesters</option>
            <option value="7">Semester 7</option>
            <option value="6">Semester 6</option>
            <option value="5">Semester 5</option>
            <option value="4">Semester 4</option>
            <option value="3">Semester 3</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Readiness Score
          </label>
          <select
            value={selectedReadiness}
            onChange={(e) => onReadinessChange(e.target.value)}
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Scores</option>
            <option value="75">75%+ (Drive Ready)</option>
            <option value="50">50%+ (Eligible)</option>
            <option value="below50">&lt; 50% (Remedial)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Target Career
          </label>
          <select
            value={selectedCareer}
            onChange={(e) => onCareerChange(e.target.value)}
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500 truncate"
          >
            <option value="all">All Career Tracks</option>
            {careerOptions.map((career) => (
              <option key={career} value={career}>
                {career}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CandidateFilters;

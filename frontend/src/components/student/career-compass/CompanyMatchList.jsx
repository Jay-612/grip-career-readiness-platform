import React, { useState, useMemo } from 'react';
import { Building2, Search, ArrowRight, ExternalLink, CheckCircle2, ChevronRight } from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import CompanyDetailModal from './CompanyDetailModal';

export const CompanyMatchList = ({
  companies = [],
  targetTrack = '',
}) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'high' | 'eligible' | 'gap'
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Filtered companies
  const filtered = useMemo(() => {
    return (companies || []).filter((comp) => {
      const name = comp.companyName || '';
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'high') return (comp.matchPercentage || 0) >= 75;
      if (filter === 'eligible') return Boolean(comp.isEligible);
      if (filter === 'gap') return (comp.matchPercentage || 0) < 75;
      return true;
    });
  }, [companies, filter, search]);

  const pagedCompanies = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  return (
    <div className="space-y-4" aria-label="Campus Recruiter Matches">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => { setFilter('all'); setVisibleCount(6); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Partners ({companies.length})
          </button>
          <button
            type="button"
            onClick={() => { setFilter('high'); setVisibleCount(6); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'high'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            High Match (≥75%)
          </button>
          <button
            type="button"
            onClick={() => { setFilter('eligible'); setVisibleCount(6); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'eligible'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Eligible
          </button>
          <button
            type="button"
            onClick={() => { setFilter('gap'); setVisibleCount(6); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'gap'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Skill Gap
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(6); }}
            placeholder="Search hiring partners..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Compact List of Cards (Max 6 at once) */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center text-xs text-slate-500 shadow-card">
          No campus hiring partners matched the active filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {pagedCompanies.map((comp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {comp.companyName}
                    </h4>
                    {comp.isEligible && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Eligible
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {comp.role || targetTrack || 'Software Engineer'} • {comp.location || 'Bangalore / Hybrid'}
                  </p>
                  {/* Top Required Skills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {(comp.requiredSkills || []).slice(0, 3).map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                      >
                        {sk}
                      </span>
                    ))}
                    {(comp.requiredSkills || []).length > 3 && (
                      <span className="text-[10px] text-slate-400">
                        +{(comp.requiredSkills.length - 3)} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match % and Detail Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-base sm:text-lg font-mono font-bold text-blue-700">
                    {comp.matchPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">Criteria Match</span>
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setSelectedCompany(comp)}
                  className="text-xs font-semibold text-slate-700 hover:text-blue-700"
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  View Criteria
                </Button>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {filtered.length > visibleCount && (
            <div className="pt-2 text-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="text-xs font-semibold"
              >
                Load More Companies ({filtered.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal for Company Details */}
      <CompanyDetailModal
        company={selectedCompany}
        isOpen={Boolean(selectedCompany)}
        onClose={() => setSelectedCompany(null)}
      />
    </div>
  );
};

export default CompanyMatchList;

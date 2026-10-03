import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Building2, ArrowRight } from 'lucide-react';
import Badge from '../../common/Badge';

export const PlacementPulse = ({
  companyMatches = [],
  targetTrack = '',
}) => {
  // Show at most 2 items
  const displayItems = (companyMatches || []).slice(0, 2);

  return (
    <section
      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between"
      aria-label="Placement Pulse"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Placement Pulse
              </h2>
              <span className="text-[11px] text-slate-400">
                Active Hiring Criteria
              </span>
            </div>
          </div>

          <Badge variant="neutral" size="xs">
            {displayItems.length > 0 ? 'Live Matches' : 'General'}
          </Badge>
        </div>

        {displayItems.length === 0 ? (
          <div className="py-4 text-center space-y-1">
            <p className="text-xs text-slate-600 font-medium">
              Spring 2026 Campus Recruitment Active
            </p>
            <p className="text-xs text-slate-400">
              Select your career track to see live partner matches and eligibility criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {displayItems.map((comp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {comp.companyName}
                    </h3>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {comp.role || targetTrack || 'Engineering Role'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-xs text-blue-700 block">
                    {comp.matchPercentage ? `${comp.matchPercentage}%` : 'Eligible'}
                  </span>
                  {comp.isEligible && (
                    <Badge variant="success" size="xs">
                      Matched
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">Target role benchmarks</span>
        <Link
          to="/student/career-compass"
          className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          <span>Explore Career Compass →</span>
        </Link>
      </div>
    </section>
  );
};

export default PlacementPulse;

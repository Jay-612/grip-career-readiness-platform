import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowUpRight, TrendingUp } from 'lucide-react';
import Badge from '../../common/Badge';
import ProgressBar from '../../common/ProgressBar';
import RadialGauge from '../../common/RadialGauge';

export const ReadinessSummary = ({
  score = 0,
  tier = 'General',
  delta = '+5% this cycle',
  percentile = null,
  statusMessage = '',
}) => {
  const isHighTier = score >= 80;
  const isMidTier = score >= 60;

  const defaultStatus = isHighTier
    ? 'Eligible for Super Dream & Tier-1 campus placement drives.'
    : isMidTier
    ? 'On track for Tier-2 engineering roles. Next milestone: 80%.'
    : 'Building initial foundational skills. Complete goals to unlock tiers.';

  return (
    <article
      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between"
      aria-label="Placement Readiness Summary"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Placement Readiness
              </h2>
              <span className="text-[11px] text-slate-400">
                Composite Benchmark
              </span>
            </div>
          </div>
          <Badge variant={isHighTier ? 'tier1' : isMidTier ? 'tier2' : 'neutral'} size="sm">
            {tier}
          </Badge>
        </div>

        {/* Score & Gauge */}
        <div className="flex items-center justify-between gap-4 my-2">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                {score}%
              </span>
              {percentile && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {percentile}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {delta ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>{delta}</span>
                </span>
              ) : (
                'Placement Benchmark Score'
              )}
            </p>
          </div>

          <RadialGauge
            value={score}
            max={100}
            size={68}
            strokeWidth={7}
            variant={isHighTier ? 'tier1' : 'primary'}
            className="shrink-0"
          />
        </div>

        {/* Progress line */}
        <div className="mt-3">
          <ProgressBar
            value={score}
            max={100}
            variant={isHighTier ? 'success' : 'primary'}
            size="xs"
          />
        </div>

        {/* Single clear status message (NO mathematical formula) */}
        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          {statusMessage || defaultStatus}
        </p>
      </div>

      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">Evaluated from verified milestones</span>
        <Link
          to="/student/profile"
          className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
};

export default ReadinessSummary;

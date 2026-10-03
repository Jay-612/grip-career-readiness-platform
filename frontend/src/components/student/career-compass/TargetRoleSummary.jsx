import React from 'react';
import { Target, Award, AlertCircle, RefreshCw, ChevronRight, Sparkles } from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

export const TargetRoleSummary = ({
  selectedTrack = '',
  trackDetails = null,
  readinessScore = 0,
  topMissingSkills = [],
  onChangeRole = () => {},
  isUpdating = false,
}) => {
  if (!selectedTrack) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-4 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Target className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-slate-900">
            Choose Your Target Career
          </h2>
          <p className="text-xs text-slate-500">
            Select an engineering trajectory to align your semester roadmap, analyze skill gaps, and unlock hiring partner matches.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onChangeRole}
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Select Career Trajectory
        </Button>
      </div>
    );
  }

  const roleTitle = trackDetails?.title || selectedTrack;
  const hiringTier = trackDetails?.hiringTier || 'Tier-1 & High Growth Tech';
  const ctcRange = trackDetails?.ctcRange || '₹14 – 24 LPA';

  return (
    <section
      className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d223c] to-blue-950 text-white shadow-card relative overflow-hidden"
      aria-label="Target Career Trajectory"
    >
      <div className="absolute right-0 top-0 w-64 h-full bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Column: Role Details */}
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-blue-200 border border-white/15 backdrop-blur-xs">
              <Target className="w-3 h-3 text-blue-300" />
              <span>Target Role</span>
            </span>
            <span className="text-xs text-slate-300 font-medium">
              • {hiringTier}
            </span>
            <span className="text-xs text-amber-300 font-medium">
              • {ctcRange}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {roleTitle}
          </h2>

          {/* Missing Skills Preview */}
          {topMissingSkills.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Primary Gap:</span>
              </span>
              {topMissingSkills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-400/20 text-amber-200 border border-amber-400/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-300 font-medium">
              ✓ Core prerequisite skills verified for this trajectory.
            </p>
          )}
        </div>

        {/* Right Column: Readiness Score & Action */}
        <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t border-white/10 lg:border-t-0">
          <div className="text-left lg:text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Placement Readiness
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {readinessScore}%
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-400/30">
                {readinessScore >= 80 ? 'Tier 1' : readinessScore >= 60 ? 'Tier 2' : 'Foundational'}
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onChangeRole}
            disabled={isUpdating}
            className="bg-white/15 hover:bg-white/25 text-white border-white/20 text-xs shadow-xs"
            leftIcon={isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          >
            Change Role
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TargetRoleSummary;

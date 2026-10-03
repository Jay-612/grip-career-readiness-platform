import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Calendar,
} from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

export const CareerOverviewTab = ({
  targetTrack = '',
  trackDetails = null,
  readinessScore = 0,
  topStrengths = [],
  topMissingSkills = [],
  nextRecommendedAction = '',
  onSwitchToSkills = () => {},
  onSwitchToRoadmap = () => {},
}) => {
  const roleTitle = trackDetails?.title || targetTrack;
  const pillars = trackDetails?.corePillars || [
    'System Architecture',
    'High-Concurrency APIs',
    'Cloud Orchestration',
    'Database Optimization',
  ];

  const defaultNextAction =
    topMissingSkills.length > 0
      ? `Focus on mastering ${topMissingSkills[0]} to close your primary competency gap.`
      : 'Schedule a faculty mock interview to benchmark your system design readiness.';

  return (
    <div className="space-y-6" aria-label="Career Readiness Overview">
      {/* Top Actionable Recommendation Card */}
      <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
              Next Recommended Action
            </span>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {nextRecommendedAction || defaultNextAction}
            </h3>
            <p className="text-xs text-slate-600">
              Completing this action item directly increases your placement eligibility for {roleTitle}.
            </p>
          </div>
        </div>

        <Link to="/student/goals" className="shrink-0">
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto shadow-xs text-xs font-semibold"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Take Action in Goals
          </Button>
        </Link>
      </div>

      {/* 2-Column Core Analysis: Strengths vs Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Verified Strengths */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Top Verified Strengths
              </h3>
            </div>
            <Badge variant="success" size="xs">
              {topStrengths.length} Verified
            </Badge>
          </div>

          {topStrengths.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
              No verified competencies logged yet. Complete interview evaluations to verify your skills.
            </div>
          ) : (
            <div className="space-y-2">
              {topStrengths.slice(0, 4).map((skill, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800">{skill}</span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 text-xs">
            <span className="text-slate-400 block mb-2 font-medium">Core Syllabus Pillars:</span>
            <div className="flex flex-wrap gap-1.5">
              {pillars.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Key Missing Competencies */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Top Missing Competencies
              </h3>
            </div>
            <Badge variant="warning" size="xs">
              {topMissingSkills.length} Action Items
            </Badge>
          </div>

          {topMissingSkills.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center text-xs text-emerald-800 font-medium">
              ✓ All primary skills aligned with active hiring criteria!
            </div>
          ) : (
            <div className="space-y-2">
              {topMissingSkills.slice(0, 4).map((skill, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800">{skill}</span>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                    Needs Practice
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
            <span className="text-slate-500">Detailed rubric comparison</span>
            <button
              type="button"
              onClick={onSwitchToSkills}
              className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Skill Gaps Tab →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerOverviewTab;

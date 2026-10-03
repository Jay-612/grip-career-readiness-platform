import React from 'react';
import {
  Award,
  AlertTriangle,
  FileCheck,
  Briefcase,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Card from '../../common/Card';
import StatCard from '../../common/StatCard';
import Skeleton from '../../common/Skeleton';
import EmptyState from '../../common/EmptyState';
import Button from '../../common/Button';

export const OverviewTab = ({
  analyticsOverview,
  placementStats,
  careerDistribution = [],
  atRiskCount = 0,
  isLoading = false,
  onViewAtRisk,
  selectedSemester,
}) => {
  const avgReadiness =
    placementStats?.averageReadinessScore ||
    analyticsOverview?.students?.averageReadinessScore ||
    0;

  const totalStudents =
    placementStats?.totalStudents ||
    analyticsOverview?.students?.totalStudents ||
    0;

  const mappedStudents = placementStats?.studentsWithCareer || 0;
  const careerMappingRate =
    totalStudents > 0 ? Math.round((mappedStudents / totalStudents) * 100) : 0;

  const completedInterviews =
    analyticsOverview?.interviews?.completedInterviews || 0;
  const totalInterviews = analyticsOverview?.interviews?.totalInterviews || 0;

  return (
    <div className="space-y-6" data-purpose="overview-tab">
      {/* ─── 1. TOP 4 KEY METRICS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Average Readiness */}
        <StatCard
          title="Average Readiness"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : `${avgReadiness}%`}
          subtitle={
            isLoading ? (
              <Skeleton className="h-3 w-32" />
            ) : avgReadiness >= 75 ? (
              'Strong department cohort'
            ) : (
              'Target benchmark: 75%'
            )
          }
          badgeText={selectedSemester === 'ALL' ? 'Department' : `Sem ${selectedSemester}`}
          badgeVariant={avgReadiness >= 70 ? 'success' : 'warning'}
          icon={Award}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
        />

        {/* Metric 2: At-Risk Students */}
        <StatCard
          title="At-Risk Students"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : atRiskCount}
          subtitle={
            isLoading ? (
              <Skeleton className="h-3 w-32" />
            ) : (
              `< 60% readiness score`
            )
          }
          badgeText={atRiskCount > 0 ? 'Requires Action' : 'All Clear'}
          badgeVariant={atRiskCount > 0 ? 'danger' : 'success'}
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50 border-rose-100"
        />

        {/* Metric 3: Interview Completion */}
        <StatCard
          title="Interview Completion"
          value={
            isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              `${completedInterviews} / ${totalInterviews}`
            )
          }
          subtitle={
            isLoading ? (
              <Skeleton className="h-3 w-36" />
            ) : (
              `Rubric avg: ${analyticsOverview?.interviews?.averageScores?.overall || 0}/10`
            )
          }
          badgeText="Evaluations"
          badgeVariant="primary"
          icon={FileCheck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50 border-indigo-100"
        />

        {/* Metric 4: Career Track Mapping */}
        <StatCard
          title="Career Track Mapped"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : `${careerMappingRate}%`}
          subtitle={
            isLoading ? (
              <Skeleton className="h-3 w-36" />
            ) : (
              `${mappedStudents} of ${totalStudents} students`
            )
          }
          badgeText={careerMappingRate >= 80 ? 'Optimal' : 'In Progress'}
          badgeVariant="neutral"
          icon={Briefcase}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
        />
      </div>

      {/* ─── 2. COMPACT AT-RISK SUMMARY ALERT ────────────────────────────── */}
      {atRiskCount > 0 && (
        <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                At-Risk Alert
              </div>
              <p className="text-xs text-rose-800 font-medium">
                <strong>{atRiskCount} students</strong> have readiness scores below 60% and require immediate academic remediation.
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={onViewAtRisk}
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            className="text-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            View At-Risk Students
          </Button>
        </div>
      )}

      {/* ─── 3. OVERVIEW CHARTS (2 FOCUSED CHARTS) ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Cohort Distribution by Performance Tier (8 cols) */}
        <Card className="lg:col-span-8 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Readiness Score Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Department breakdown across performance tiers
              </p>
            </div>
            {placementStats && (
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Total Evaluated: <strong>{totalStudents}</strong>
              </span>
            )}
          </div>

          {placementStats?.scoreDistribution ? (
            <>
              {/* Segmented Distribution Bar */}
              <div className="w-full h-4 rounded-full overflow-hidden bg-slate-100 flex p-0.5 border border-slate-200">
                <div
                  style={{ width: `${Math.max(placementStats.scoreDistribution.excellent.percentage, 2)}%` }}
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                  title={`Placement Ready: ${placementStats.scoreDistribution.excellent.count} (${placementStats.scoreDistribution.excellent.percentage}%)`}
                />
                <div
                  style={{ width: `${Math.max(placementStats.scoreDistribution.good.percentage, 2)}%` }}
                  className="bg-blue-600 h-full transition-all duration-500"
                  title={`Nearly Ready: ${placementStats.scoreDistribution.good.count} (${placementStats.scoreDistribution.good.percentage}%)`}
                />
                <div
                  style={{ width: `${Math.max(placementStats.scoreDistribution.average.percentage, 2)}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Developing: ${placementStats.scoreDistribution.average.count} (${placementStats.scoreDistribution.average.percentage}%)`}
                />
                <div
                  style={{ width: `${Math.max(placementStats.scoreDistribution.needsImprovement.percentage, 2)}%` }}
                  className="bg-rose-500 h-full rounded-r-full transition-all duration-500"
                  title={`Needs Attention: ${placementStats.scoreDistribution.needsImprovement.count} (${placementStats.scoreDistribution.needsImprovement.percentage}%)`}
                />
              </div>

              {/* 4 Compact Tier Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                    <span>Placement Ready</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-1.5 text-lg font-bold font-mono text-emerald-900">
                    {placementStats.scoreDistribution.excellent.count}
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    {placementStats.scoreDistribution.excellent.percentage}% (≥80%)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-800">
                    <span>Nearly Ready</span>
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <div className="mt-1.5 text-lg font-bold font-mono text-blue-900">
                    {placementStats.scoreDistribution.good.count}
                  </div>
                  <div className="text-[10px] text-blue-700">
                    {placementStats.scoreDistribution.good.percentage}% (60–79%)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                    <span>Developing</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="mt-1.5 text-lg font-bold font-mono text-amber-900">
                    {placementStats.scoreDistribution.average.count}
                  </div>
                  <div className="text-[10px] text-amber-700">
                    {placementStats.scoreDistribution.average.percentage}% (40–59%)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-rose-800">
                    <span>Needs Attention</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <div className="mt-1.5 text-lg font-bold font-mono text-rose-900">
                    {placementStats.scoreDistribution.needsImprovement.count}
                  </div>
                  <div className="text-[10px] text-rose-700">
                    {placementStats.scoreDistribution.needsImprovement.percentage}% (&lt;40%)
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              compact
              title="Distribution Data Unavailable"
              description="Score distribution data will populate as mock interviews and milestones are recorded."
            />
          )}
        </Card>

        {/* Chart 2: Career Track Distribution (4 cols) */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Career Track Pathways
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {mappedStudents} Assigned
              </span>
            </div>

            <div className="space-y-3 custom-scrollbar max-h-56 overflow-y-auto pr-1">
              {careerDistribution.length > 0 ? (
                careerDistribution.map((item) => (
                  <div key={item.career} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]" title={item.career}>
                        {item.career}
                      </span>
                      <span className="font-mono text-slate-600 font-semibold text-[11px]">
                        {item.count} std ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Avg Readiness:</span>
                      <span className="font-mono font-medium text-slate-700">{item.avgReadinessScore}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No career track distribution recorded.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Unassigned Students:</span>
            <span className="font-mono font-semibold text-slate-800">
              {totalStudents - mappedStudents}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;

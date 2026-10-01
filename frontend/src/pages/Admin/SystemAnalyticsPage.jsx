import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  Layers,
  PieChart,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';

export const SystemAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load system analytics:', err);
      setError(err.response?.data?.message || 'Failed to load institutional analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 antialiased pb-12">
        <Skeleton variant="card" className="h-44" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Analytics Telemetry Error"
        message={error}
        onRetry={fetchAnalytics}
        retryText="Retry Analytics"
      />
    );
  }

  const careerDist = analytics?.careerDistribution || [];
  const skillGaps = analytics?.skillGaps || [];
  const recruiterSentiment = analytics?.recruiterSentiment || { totalFeedbackLogged: 0, recommendations: {} };

  const totalDistributedStudents = careerDist.reduce((acc, c) => acc + c.studentCount, 0);

  return (
    <main className="space-y-6 pb-12 antialiased" aria-label="Institutional System Analytics">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Career & Skill Gap Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department-level cohort monitoring, career interest distribution, and placement skill gap diagnostics (SRS R.6).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            NBA / NAAC Criterion 5 Metric
          </Badge>
        </div>
      </div>

      {/* ─── 1. Career Interest Distribution (SRS R.6.1) ─────────── */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Career Interest Distribution (SRS R.6.1)
              </h2>
              <p className="text-xs text-slate-500">
                Number of students grouped by confirmed engineering trajectory & average readiness
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {totalDistributedStudents} Total Students Mapped
          </span>
        </div>

        {careerDist.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No students have selected or taken diagnostic quiz roadmaps yet.
          </p>
        ) : (
          <div className="space-y-4">
            {careerDist.map((item, idx) => {
              const pct = totalDistributedStudents > 0
                ? Math.round((item.studentCount / totalDistributedStudents) * 100)
                : 0;

              return (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200 font-mono font-bold text-slate-700 flex items-center justify-center text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <strong className="text-slate-900 truncate">{item.career}</strong>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-500 font-medium">
                        {item.studentCount} Students ({pct}%)
                      </span>
                      <Badge variant={item.avgReadinessScore >= 70 ? 'success' : 'neutral'} size="xs">
                        Avg Score: {item.avgReadinessScore}%
                      </Badge>
                    </div>
                  </div>
                  <ProgressBar value={pct} variant="primary" size="xs" />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 2-Column Section: Skill Gaps (R.6.2) & Recruiter Sentiment (R.5.3) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Placement Skill Gaps */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Placement Skill Gap Diagnostics (SRS R.6.2)
                </h2>
                <p className="text-xs text-slate-500">
                  Identified weak competencies aggregated from faculty mock evaluation rubrics
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {skillGaps.map((sg, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-bold text-slate-900">{sg.skillDomain}</h3>
                  <Badge variant={sg.gapPercentage > 30 ? 'danger' : 'warning'} size="xs">
                    {sg.gapPercentage}% Gap Rate
                  </Badge>
                </div>
                <ProgressBar
                  value={sg.gapPercentage}
                  variant={sg.gapPercentage > 30 ? 'danger' : 'warning'}
                  size="xs"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{sg.studentsNeedingImprovement} students below acceptable threshold (&lt; 3/5 stars)</span>
                  <span>{sg.totalAssessed} total mock evaluations</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 leading-relaxed">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Automated Intervention:</strong> Use the <strong>Department Events</strong> tool to schedule focused bootcamps on the high-gap domains above to systematically lift cohort readiness scores.
            </p>
          </div>
        </section>

        {/* Right Column (5 cols): Recruiter Sentiment */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Recruiter Feedback Sentiment (SRS R.5.3)
                </h2>
                <p className="text-xs text-slate-500">Industry partner hiring recommendations</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">Recommend for Hire</span>
                <span className="text-[11px] text-emerald-700">Strong technical & behavioral fit</span>
              </div>
              <span className="text-2xl font-black text-emerald-900 font-mono">
                {recruiterSentiment.recommendations?.hire || 0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block">Consider for Further Rounds</span>
                <span className="text-[11px] text-amber-700">Borderline / needs project polishing</span>
              </div>
              <span className="text-2xl font-black text-amber-900 font-mono">
                {recruiterSentiment.recommendations?.consider || 0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-900 block">Not Recommended</span>
                <span className="text-[11px] text-rose-700">High skill mismatch</span>
              </div>
              <span className="text-2xl font-black text-rose-900 font-mono">
                {recruiterSentiment.recommendations?.reject || 0}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 text-center">
            Total Recruiter Submissions Logged: <strong>{recruiterSentiment.totalFeedbackLogged}</strong>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SystemAnalyticsPage;

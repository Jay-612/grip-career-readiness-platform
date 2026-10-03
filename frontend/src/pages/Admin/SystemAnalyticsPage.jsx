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
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
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
  const [showAuditLogs, setShowAuditLogs] = useState(false);

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
      <div className="space-y-6 antialiased pb-12 max-w-7xl mx-auto">
        <Skeleton variant="card" className="h-28" />
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
  const totalAssessedEvals = skillGaps.reduce((acc, s) => acc + (s.totalAssessed || 0), 0);
  const avgReadinessAcrossCohort = careerDist.length > 0
    ? Math.round(careerDist.reduce((acc, c) => acc + c.avgReadinessScore, 0) / careerDist.length)
    : 0;

  const handleExportSummary = () => {
    const summaryData = {
      exportTimestamp: new Date().toISOString(),
      institutionalMetrics: {
        totalStudentsMapped: totalDistributedStudents,
        averageReadinessScore: avgReadinessAcrossCohort,
        evaluationsCompleted: totalAssessedEvals,
        recruiterFeedbackSubmissions: recruiterSentiment.totalFeedbackLogged,
      },
      careerDistribution: careerDist,
      skillGaps,
      recruiterSentiment,
    };

    const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grip-institutional-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-6 pb-12 antialiased max-w-7xl mx-auto" aria-label="Institutional System Analytics">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department cohort monitoring, curriculum career distribution, and placement skill gap diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSummary}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* ─── 4 Focused KPI Metrics (Institutional Level) ─────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Mapped Students</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalDistributedStudents}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across active tracks</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Avg Readiness Score</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{avgReadinessAcrossCohort}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Campus benchmark</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Mock Evaluations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalAssessedEvals}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Faculty assessments</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Recruiter Feedbacks</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{recruiterSentiment.totalFeedbackLogged}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Hiring reviews</div>
        </div>
      </div>

      {/* ─── 1. Career Interest Distribution (SRS R.6.1) ─────────── */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Career Interest Distribution
              </h2>
              <p className="text-[11px] text-slate-500">
                Students grouped by confirmed engineering trajectory & average readiness score
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {totalDistributedStudents} Total Enrolled
          </span>
        </div>

        {careerDist.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No students have selected or taken diagnostic quiz roadmaps yet.
          </p>
        ) : (
          <div className="space-y-3">
            {careerDist.map((item, idx) => {
              const pct = totalDistributedStudents > 0
                ? Math.round((item.studentCount / totalDistributedStudents) * 100)
                : 0;

              return (
                <div key={idx} className="space-y-1.5 p-3 rounded-lg bg-slate-50/70 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-white border border-slate-200 font-mono font-bold text-slate-700 flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <strong className="text-slate-900 truncate">{item.career}</strong>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-500 font-medium text-[11px]">
                        {item.studentCount} Students ({pct}%)
                      </span>
                      <Badge variant={item.avgReadinessScore >= 70 ? 'success' : 'neutral'} size="xs">
                        Avg: {item.avgReadinessScore}%
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

      {/* ─── 2-Column Section: Skill Gaps & Recruiter Sentiment ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Placement Skill Gaps */}
        <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Placement Skill Gap Diagnostics
                </h2>
                <p className="text-[11px] text-slate-500">
                  Identified weak competencies aggregated from faculty mock evaluations
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {skillGaps.map((sg, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-2">
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
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>{sg.studentsNeedingImprovement} students below acceptable threshold</span>
                  <span>{sg.totalAssessed} assessed</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column (5 cols): Recruiter Sentiment */}
        <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recruiter Feedback Sentiment
                </h2>
                <p className="text-[11px] text-slate-500">Industry partner hiring recommendations</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">Recommend for Hire</span>
                <span className="text-[10px] text-emerald-700">Strong technical & behavioral fit</span>
              </div>
              <span className="text-xl font-black text-emerald-900 font-mono">
                {recruiterSentiment.recommendations?.hire || 0}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block">Consider for Further Rounds</span>
                <span className="text-[10px] text-amber-700">Borderline / needs project polish</span>
              </div>
              <span className="text-xl font-black text-amber-900 font-mono">
                {recruiterSentiment.recommendations?.consider || 0}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-200/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-900 block">Not Recommended</span>
                <span className="text-[10px] text-rose-700">High skill mismatch</span>
              </div>
              <span className="text-xl font-black text-rose-900 font-mono">
                {recruiterSentiment.recommendations?.reject || 0}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Total Recruiter Submissions: <strong>{recruiterSentiment.totalFeedbackLogged}</strong>
          </div>
        </section>
      </div>

      {/* ─── Progressive Disclosure: Collapsible Audit / Raw Telemetry Logs ─── */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
        <button
          onClick={() => setShowAuditLogs(!showAuditLogs)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Institutional Telemetry & Audit Log Payload</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>{showAuditLogs ? 'Hide Raw Audit Data' : 'View Audit Logs'}</span>
            {showAuditLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAuditLogs && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] text-slate-500">
              Raw JSON telemetry snapshot returned from <code className="font-mono text-slate-700">/api/admin/analytics</code> for compliance auditing and NAAC criteria exports.
            </p>
            <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60">
              {JSON.stringify(analytics, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </main>
  );
};

export default SystemAnalyticsPage;

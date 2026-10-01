import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Compass,
  Calendar,
  Award,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowRight,
  GraduationCap,
  Briefcase,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import RadialGauge from '../../components/common/RadialGauge';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';

export const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  const fetchOverview = async () => {
    try {
      setError(null);
      const data = await adminService.getOverview();
      setOverview(data);
      setLastSynced(new Date());
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load executive overview telemetry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOverview();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 antialiased pb-12">
        <Skeleton variant="card" className="h-44" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Admin Telemetry Unavailable"
        message={error}
        onRetry={fetchOverview}
        retryText="Retry Loading Console"
      />
    );
  }

  const kpis = overview?.kpis || {};
  const tiers = kpis?.readiness?.tiers || { superDream: 0, tier1: 0, tier2: 0, general: 0 };
  const tierPcts = kpis?.readiness?.tierPercentages || { superDream: 0, tier1: 0, tier2: 0, general: 0 };
  const activity = overview?.activityFeed || {};

  return (
    <main className="space-y-6 pb-12 antialiased" aria-label="Institutional Admin Console">
      {/* ─── Top Telemetry Status Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">Campus Administration Hub</span>
          <span className="text-slate-300">•</span>
          <span>
            Last synced: {lastSynced ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Live Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ─── 1. Executive Hero Banner ────────────────────────────── */}
      <section
        className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 shadow-card overflow-hidden"
        data-purpose="admin-hero"
      >
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-sm text-indigo-200 border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Institutional Governance Portal</span>
              </span>
              <span className="text-xs text-slate-300">• Full RBAC Authorization</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Institutional Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              Direct oversight of student placement readiness, curriculum roadmaps, company hiring pipelines, and campus-wide technical interventions.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 shrink-0">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-indigo-200 font-bold">
                Student Cohort Average
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-white font-mono">
                  {kpis?.readiness?.average || 0}%
                </span>
                <Badge variant={kpis?.readiness?.average >= 70 ? 'success' : 'warning'} size="xs">
                  {kpis?.readiness?.average >= 70 ? 'On Target' : 'Needs Ramp-up'}
                </Badge>
              </div>
            </div>
            <Link to="/admin/analytics">
              <Button variant="secondary" size="xs" className="bg-white text-slate-900 hover:bg-slate-100 font-bold">
                Analytics Deep Dive →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 2. Top-Level Metric Cards (6 Grid) ──────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="kpi-cards">
        {/* Card 1: Users & RBAC */}
        <article className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">{kpis.totalUsers || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-700">{kpis.students || 0}</strong> Students • <strong className="text-slate-700">{kpis.faculty || 0}</strong> Faculty
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{kpis.alumni || 0} Alumni • {kpis.recruiters || 0} Recruiters</span>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 font-semibold">
              Manage →
            </Link>
          </div>
        </article>

        {/* Card 2: Hiring Partners */}
        <article className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Partners</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">{kpis.companies || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Visiting tech hiring organizations</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Campus Placement Drives</span>
            <Link to="/admin/companies" className="text-blue-600 hover:text-blue-700 font-semibold">
              Directory →
            </Link>
          </div>
        </article>

        {/* Card 3: Curriculum Tracks */}
        <article className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Career Roadmaps</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">{kpis.careerRoadmaps || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Accredited engineering specializations</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Semester Milestone Plans</span>
            <Link to="/admin/curriculum" className="text-blue-600 hover:text-blue-700 font-semibold">
              Curriculum →
            </Link>
          </div>
        </article>

        {/* Card 4: Mock Interviews Conducted */}
        <article className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mock Evaluations</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">{kpis.mockInterviews?.total || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              <strong className="text-emerald-600">{kpis.mockInterviews?.completed || 0}</strong> Completed ({kpis.mockInterviews?.completionRate || 0}%)
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{kpis.departmentEvents || 0} Department Events</span>
            <Link to="/admin/events" className="text-blue-600 hover:text-blue-700 font-semibold">
              Events →
            </Link>
          </div>
        </article>
      </section>

      {/* ─── 3. Main Workspace: Placement Tiers + Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Tier Distribution & Live Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Placement Readiness Tiers Breakdown */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Placement Readiness Cohort Distribution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Segmented by institutional hiring tiers based on current 30-40-30 readiness formula
                </p>
              </div>
              <Badge variant="primary" size="xs">
                {kpis.students || 0} Evaluated Students
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Super Dream */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Super Dream</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    ≥ 80%
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-900 font-mono">{tiers.superDream}</div>
                <ProgressBar value={tierPcts.superDream} variant="success" size="xs" />
                <span className="text-[11px] text-emerald-700 block font-medium">
                  {tierPcts.superDream}% of student body
                </span>
              </div>

              {/* Tier 1 */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800">Tier 1 Target</span>
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                    70 - 79%
                  </span>
                </div>
                <div className="text-2xl font-black text-blue-900 font-mono">{tiers.tier1}</div>
                <ProgressBar value={tierPcts.tier1} variant="primary" size="xs" />
                <span className="text-[11px] text-blue-700 block font-medium">
                  {tierPcts.tier1}% of student body
                </span>
              </div>

              {/* Tier 2 */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">Tier 2 Target</span>
                  <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    60 - 69%
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-900 font-mono">{tiers.tier2}</div>
                <ProgressBar value={tierPcts.tier2} variant="warning" size="xs" />
                <span className="text-[11px] text-amber-700 block font-medium">
                  {tierPcts.tier2}% of student body
                </span>
              </div>

              {/* General */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">General Candidate</span>
                  <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                    &lt; 60%
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-800 font-mono">{tiers.general}</div>
                <ProgressBar value={tierPcts.general} variant="neutral" size="xs" />
                <span className="text-[11px] text-slate-500 block font-medium">
                  {tierPcts.general}% needs intervention
                </span>
              </div>
            </div>
          </section>

          {/* Section: Recent System Activity Feed */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Live Administrative Activity Feed
              </h2>
              <span className="text-xs text-slate-400">Real-time audit log</span>
            </div>

            <div className="divide-y divide-slate-100">
              {(activity.recentUsers || []).map((u) => (
                <div key={u._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-900">{u.name}</span>
                      <span className="text-slate-400"> ({u.email}) joined platform</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Badge variant="neutral" size="xs">
                      {u.role}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Quick Operations & Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Admin Actions */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Administrative Quick Actions
            </h3>

            <div className="space-y-2.5">
              <Link to="/admin/users" className="block">
                <div className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 transition flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 block">
                        Add New User
                      </span>
                      <span className="text-[11px] text-slate-400">Student, Faculty, Alumni, Recruiter</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </div>
              </Link>

              <Link to="/admin/curriculum" className="block">
                <div className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 transition flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block">
                        Manage Curriculum Tracks
                      </span>
                      <span className="text-[11px] text-slate-400">Roadmaps, Skills, Semester Plans</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </div>
              </Link>

              <Link to="/admin/companies" className="block">
                <div className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 transition flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 block">
                        Register Company Partner
                      </span>
                      <span className="text-[11px] text-slate-400">Hiring criteria & skills</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                </div>
              </Link>

              <Link to="/admin/events" className="block">
                <div className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-200 transition flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600 block">
                        Schedule Skill Event
                      </span>
                      <span className="text-[11px] text-slate-400">Workshops & Mock Drives (R.6.3)</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                </div>
              </Link>
            </div>
          </section>

          {/* Institutional Compliance Card */}
          <section className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-xs font-bold tracking-tight uppercase text-indigo-200">
                Institutional Quality Assurance
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Continuous monitoring ensures student evaluations and roadmap subjects align with industry recruiting benchmarks.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Accreditation: NBA / NAAC Ready</span>
              <span className="font-mono text-emerald-400 font-bold">Active</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import ErrorState from '../../components/common/ErrorState';

const Dashboard = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live state from backend
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    progress: null,
    readiness: null,
    companyMatches: [],
    goals: [],
    appointments: [],
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch user & student profile
      const profileRes = await studentService.getProfile();
      const studentId = profileRes?.user?.id || user?.id;

      // 2. Fetch concurrent data with graceful settlements
      const [progressRes, readinessRes, companyRes, goalsRes, appointmentsRes] =
        await Promise.allSettled([
          studentId ? studentService.getProgressDashboard(studentId) : null,
          studentId ? studentService.getPlacementReadiness(studentId) : null,
          studentId ? studentService.getCompanyMatch(studentId) : null,
          studentId ? studentService.getGoals(studentId) : null,
          studentService.getAppointments(),
        ]);

      setDashboardData({
        profile: profileRes?.profile || null,
        progress: progressRes.status === 'fulfilled' ? progressRes.value : null,
        readiness: readinessRes.status === 'fulfilled' ? readinessRes.value : null,
        companyMatches:
          companyRes.status === 'fulfilled' && companyRes.value?.matches
            ? companyRes.value.matches
            : [],
        goals:
          goalsRes.status === 'fulfilled' && goalsRes.value?.goals
            ? goalsRes.value.goals
            : [],
        appointments:
          appointmentsRes.status === 'fulfilled' &&
          (Array.isArray(appointmentsRes.value)
            ? appointmentsRes.value
            : appointmentsRes.value?.appointments || []) || [],
      });
    } catch (err) {
      console.error('Error loading student dashboard data:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load dashboard data. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Derived dynamic or fallback values
  const studentName = user?.name || 'Tapu';
  const readinessScore =
    dashboardData.readiness?.readinessScore ||
    dashboardData.progress?.profile?.readinessScore ||
    85;

  const activeGoalsCount =
    dashboardData.progress?.goals?.inProgress ||
    dashboardData.progress?.goals?.pending ||
    4;

  const targetTrack =
    dashboardData.profile?.selectedCareer ||
    'Distributed Systems & Cloud Backend Engineer';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Hero Banner Skeleton */}
        <div className="h-44 rounded-2xl bg-slate-200/80" />

        {/* 3 Top Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-36 rounded-xl bg-slate-200/80" />
          <div className="h-36 rounded-xl bg-slate-200/80" />
          <div className="h-36 rounded-xl bg-slate-200/80" />
        </div>

        {/* Main 2-Column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-80 rounded-2xl bg-slate-200/80" />
            <div className="h-64 rounded-2xl bg-slate-200/80" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-80 rounded-2xl bg-slate-200/80" />
            <div className="h-96 rounded-2xl bg-slate-200/80" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Student Dashboard Unavailable"
        message={error}
        onRetry={fetchData}
        retryText="Reload Dashboard"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* BEGIN: CompactHeroBanner */}
      <section
        className="relative rounded-2xl bg-gradient-to-r from-blue-700 via-grip-blue to-indigo-700 text-white p-6 shadow-md overflow-hidden"
        data-purpose="welcome-hero"
      >
        {/* Subtle Background Glows */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Text Details */}
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm text-blue-100 border border-white/20">
              <span>🎓</span>
              <span>Institutional Accreditation: Computer Science & Engineering</span>
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Good Morning, {studentName}! Keep progressing.
            </h1>
            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed font-normal">
              Target Track: <strong className="font-semibold text-white">{targetTrack}</strong> • Tier-1 Placement Cycle 2026 • Semester 5 of 8
            </p>
          </div>

          {/* Right Compact Highlight & CTA */}
          <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shrink-0">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-blue-200 font-bold">
                Placement Ranking
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white">Top 4%</span>
                <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  ✨ Super Dream Eligible
                </span>
              </div>
            </div>
            <Link to="/student/goals">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold bg-white text-grip-blue rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
              >
                Resume Active Sprint →
              </button>
            </Link>
          </div>
        </div>
      </section>
      {/* END: CompactHeroBanner */}

      {/* BEGIN: KeyMetricsCards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5" data-purpose="summary-metrics">
        {/* Card 1: Overall Readiness */}
        <article className="bg-white rounded-xl border border-grip-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-medium text-grip-muted mb-2">
            <span>Overall Readiness Score</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-grip-blue">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-grip-dark tracking-tight">{readinessScore}%</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +12% this sem
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-3">
            <div className="bg-grip-blue h-2 rounded-full" style={{ width: `${readinessScore}%` }} />
          </div>
          <p className="text-xs text-grip-muted flex items-center justify-between">
            <span>Tier-1 Benchmark: <strong>78%</strong></span>
            <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">7/8 Rubrics Met</span>
          </p>
        </article>

        {/* Card 2: Active Goals & Sprint */}
        <article className="bg-white rounded-xl border border-grip-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-medium text-grip-muted mb-2">
            <span>Active Semester Goals</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-grip-dark tracking-tight">{activeGoalsCount} Goals</span>
            <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              3 Due Soon
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-3">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '68%' }} />
          </div>
          <p className="text-xs text-grip-muted flex items-center justify-between">
            <span>Sprint: <strong className="text-grip-dark font-medium">Distributed Caching</strong></span>
            <span className="font-mono text-grip-dark font-semibold">68%</span>
          </p>
        </article>

        {/* Card 3: Next Scheduled Session */}
        <article className="bg-white rounded-xl border border-grip-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-medium text-grip-muted mb-2">
            <span>Mentorship &amp; Mock Interview</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl lg:text-3xl font-extrabold text-grip-dark tracking-tight">Tomorrow</span>
            <span className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              4:00 PM
            </span>
          </div>
          <div className="my-3 py-1">
            <p className="text-xs text-grip-slate truncate">
              Topic: <strong>Technical Interview Prep</strong> w/ Prof. Neha Sharma
            </p>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-grip-border text-xs">
            <span className="text-grip-muted">Dept. Seminar Lab 3</span>
            <Link to="/student/guidance" className="font-semibold text-grip-blue hover:underline inline-flex items-center gap-1">
              View Prep Sheet →
            </Link>
          </div>
        </article>
      </section>
      {/* END: KeyMetricsCards */}

      {/* BEGIN: TwoColumnDashboardGrid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN: 70% (8 COLS) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section A: Today's Priorities */}
          <section className="bg-white rounded-2xl border border-grip-border p-6 shadow-sm" data-purpose="todays-priorities">
            <div className="flex items-center justify-between pb-4 border-b border-grip-border">
              <div>
                <h2 className="text-base font-bold text-grip-dark tracking-tight">Today's Focus &amp; Sprints</h2>
                <p className="text-xs text-grip-muted mt-0.5">3 priority tasks requiring milestone submissions or assessments</p>
              </div>
              <Link to="/student/goals" className="text-xs font-semibold text-grip-blue hover:underline inline-flex items-center gap-1">
                View All Goals ({dashboardData.goals?.length || 8}) →
              </Link>
            </div>

            {/* Priority List Items */}
            <div className="divide-y divide-grip-border">
              {/* Item 1: High Priority Capstone Draft */}
              <article className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-grip-blue rounded">
                      URGENT / CAPSTONE
                    </span>
                    <span className="text-xs font-medium text-slate-400">• Due Oct 02</span>
                  </div>
                  <h3 className="text-sm font-semibold text-grip-dark group-hover:text-grip-blue transition-colors">
                    Submit Microservices Capstone Architecture Document
                  </h3>
                  <p className="text-xs text-grip-muted leading-relaxed">
                    Detailed gRPC API contracts, event bus schema, and multi-region replication strategy.
                  </p>
                  {/* Progress Bar & Status */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-36 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-grip-blue h-1.5 rounded-full" style={{ width: '50%' }} />
                    </div>
                    <span className="text-[11px] font-mono text-grip-slate font-medium">50% Complete</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-white bg-grip-blue hover:bg-grip-blue-hover rounded-lg transition-colors shadow-sm"
                  >
                    Continue Draft
                  </button>
                </div>
              </article>

              {/* Item 2: Coding Practice Sprint */}
              <article className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded">
                      CODING SPRINT
                    </span>
                    <span className="text-xs font-medium text-slate-400">• Due Tomorrow</span>
                  </div>
                  <h3 className="text-sm font-semibold text-grip-dark group-hover:text-grip-blue transition-colors">
                    Solve Dynamic Programming Problem Set
                  </h3>
                  <p className="text-xs text-grip-muted leading-relaxed">
                    Focusing on multi-dimensional DP &amp; Knapsack variations for Day-1 Online Assessments.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-36 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '71%' }} />
                    </div>
                    <span className="text-[11px] font-mono text-grip-slate font-medium">32 / 45 Solved (71%)</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-grip-dark bg-slate-100 hover:bg-slate-200 border border-grip-border rounded-lg transition-colors"
                  >
                    Practice Set
                  </button>
                </div>
              </article>

              {/* Item 3: Completed Mock Interview */}
              <article className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                      COMPLETED
                    </span>
                    <span className="text-xs font-medium text-slate-400">• Reviewed Friday</span>
                  </div>
                  <h3 className="text-sm font-semibold text-grip-dark">
                    Complete Mock Behavioral &amp; Situational Interview
                  </h3>
                  <p className="text-xs text-grip-muted leading-relaxed">
                    STAR Method practice with Faculty Advisor Prof. Neha Sharma. Evaluated with 8.5/10 Rubric score.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-36 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold">100% • Score 8.5/10</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg cursor-default"
                  >
                    Verified ✓
                  </button>
                </div>
              </article>
            </div>
          </section>

          {/* Section B: Academic & Career Roadmap */}
          <section className="bg-white rounded-2xl border border-grip-border p-6 shadow-sm" data-purpose="track-roadmap">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-grip-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-grip-blue bg-blue-50 px-2 py-0.5 rounded">
                    Semester 5 of 8
                  </span>
                  <span className="text-xs text-grip-muted">Academic Year 2024-25</span>
                </div>
                <h2 className="text-base font-bold text-grip-dark mt-1">
                  Distributed Systems &amp; Cloud Backend Engineering Track
                </h2>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-grip-blue">60%</span>
                <p className="text-[11px] text-grip-muted uppercase font-semibold">Track Progress</p>
              </div>
            </div>

            {/* Horizontal Milestone Stepper Line */}
            <div className="pt-6 pb-2 overflow-x-auto custom-scrollbar">
              <div className="min-w-[560px] relative flex items-center justify-between">
                {/* Background Connection Track Line */}
                <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                {/* Active Progress Indicator Fill Line (up to 50%) */}
                <div className="absolute left-6 top-4 -translate-y-1/2 h-1 bg-grip-blue z-0" style={{ width: '50%' }} />

                {/* Step 1: Completed Sem 3 */}
                <div className="relative z-10 flex flex-col items-center text-center w-24">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-grip-dark mt-2">Sem 3</span>
                  <span className="text-[10px] text-grip-muted leading-tight">DSA &amp; Algos</span>
                </div>

                {/* Step 2: Completed Sem 4 */}
                <div className="relative z-10 flex flex-col items-center text-center w-24">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-grip-dark mt-2">Sem 4</span>
                  <span className="text-[10px] text-grip-muted leading-tight">Database &amp; OS</span>
                </div>

                {/* Step 3: Current Sem 5 (Active) */}
                <div className="relative z-10 flex flex-col items-center text-center w-28">
                  <div className="w-8 h-8 rounded-full bg-grip-blue text-white flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-blue-100 animate-pulse">
                    5
                  </div>
                  <span className="text-xs font-bold text-grip-blue mt-2">Sem 5 (Current)</span>
                  <span className="text-[10px] text-grip-dark font-medium leading-tight">Full-Stack Microservices</span>
                </div>

                {/* Step 4: Upcoming Sem 6 */}
                <div className="relative z-10 flex flex-col items-center text-center w-24">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-semibold text-xs ring-4 ring-white">
                    6
                  </div>
                  <span className="text-xs font-medium text-slate-500 mt-2">Sem 6</span>
                  <span className="text-[10px] text-grip-muted leading-tight">Scalability Capstone</span>
                </div>

                {/* Step 5: Target Sem 7 Placements */}
                <div className="relative z-10 flex flex-col items-center text-center w-24">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-semibold text-xs ring-4 ring-white">
                    7
                  </div>
                  <span className="text-xs font-medium text-slate-500 mt-2">Sem 7</span>
                  <span className="text-[10px] text-grip-muted leading-tight">Tier-1 Placements</span>
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* ================= END LEFT COLUMN ================= */}

        {/* ================= RIGHT COLUMN: 30% (4 COLS) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Scheduled Sessions */}
          <section className="bg-white rounded-2xl border border-grip-border p-5 shadow-sm" data-purpose="scheduled-sessions">
            <div className="flex items-center justify-between pb-3.5 border-b border-grip-border">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-grip-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <h3 className="text-sm font-bold text-grip-dark">Scheduled Sessions</h3>
              </div>
              <Link to="/student/guidance" className="text-xs text-grip-muted hover:text-grip-blue font-medium">
                Calendar →
              </Link>
            </div>

            {/* Session Items List */}
            <div className="space-y-4 mt-4">
              {/* Session 1: Tomorrow's Session */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">Scheduled</span>
                  <span className="text-[11px] font-medium text-grip-muted">Tue, 19 Sep • 4:00 PM</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-grip-dark">Prof. Neha Sharma</h4>
                  <p className="text-[11px] text-grip-slate">Dept. Seminar Lab 3</p>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-tight">
                    Topic: Technical Interview Prep &amp; Distributed Systems Architecture
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full py-1.5 text-xs font-semibold text-grip-blue bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Prep Sheet
                </button>
              </div>

              {/* Session 2: Upcoming Industry Mentor */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-grip-blue rounded">Confirmed</span>
                  <span className="text-[11px] font-medium text-grip-muted">Fri, 22 Sep • 2:30 PM</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-grip-dark">Amit Verma</h4>
                  <p className="text-[11px] text-grip-slate">Staff SWE @ TechCorp • Alumni '19</p>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-tight">
                    Topic: Live SDE Coding &amp; Problem-Solving Screen
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full py-1.5 text-xs font-semibold text-white bg-grip-blue hover:bg-grip-blue-hover rounded-lg transition-colors shadow-sm"
                >
                  Join Room
                </button>
              </div>
            </div>
          </section>

          {/* Card 2: Placement Readiness & Recruiter Pulse */}
          <section className="bg-white rounded-2xl border border-grip-border p-5 shadow-sm" data-purpose="placement-pulse">
            <div className="flex items-center justify-between pb-3.5 border-b border-grip-border">
              <h3 className="text-sm font-bold text-grip-dark">Placement Pulse</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-800 rounded">
                Tier-1 Ready
              </span>
            </div>

            {/* Compact Donut Radial Meter */}
            <div className="py-4 flex items-center justify-center gap-5">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle cx="50" cy="50" fill="transparent" r="42" stroke="#f1f5f9" strokeWidth="8" />
                  {/* Filled Percentage Circle */}
                  <circle
                    className="donut-circle"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="42"
                    stroke="#1D61E7"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-extrabold text-grip-dark leading-none">{readinessScore}%</span>
                  <span className="text-[9px] uppercase font-bold text-grip-muted tracking-tight">Tier-1 Fit</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-grip-dark">3 Visiting Recruiters</p>
                <p className="text-[11px] text-grip-muted leading-relaxed">
                  TechCorp Global, FinTech Apex, and CloudSys evaluated your public repo.
                </p>
                <span className="inline-block text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Eligible for Day 1 Drive
                </span>
              </div>
            </div>

            {/* Verified Competencies Pills */}
            <div className="pt-3 border-t border-grip-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-grip-muted block mb-2">
                Verified Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-1 text-[11px] font-medium bg-slate-100 text-grip-dark rounded-md">
                  React (Verified)
                </span>
                <span className="px-2 py-1 text-[11px] font-medium bg-slate-100 text-grip-dark rounded-md">
                  Node.js (v18)
                </span>
                <span className="px-2 py-1 text-[11px] font-medium bg-slate-100 text-grip-dark rounded-md">
                  System Design
                </span>
                <span className="px-2 py-1 text-[11px] font-medium bg-slate-100 text-grip-dark rounded-md">
                  Docker/K8s
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-grip-border text-center">
              <Link to="/student/career-compass" className="text-xs font-semibold text-grip-blue hover:underline">
                Explore Placement Matches →
              </Link>
            </div>
          </section>
        </div>
        {/* ================= END RIGHT COLUMN ================= */}
      </div>
      {/* END: TwoColumnDashboardGrid */}

      {/* BEGIN: RecentActivityFeed (Full Width) */}
      <section className="bg-white rounded-2xl border border-grip-border p-6 shadow-sm" data-purpose="recent-feedback">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-grip-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-grip-dark">Recent Feedback &amp; Institutional Activity</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-50 text-grip-blue rounded">
                Live Institutional Feed
              </span>
            </div>
            <p className="text-xs text-grip-muted mt-0.5">
              Real-time updates from faculty evaluations and alumni mock reviews
            </p>
          </div>
          <Link to="/student/guidance" className="text-xs font-semibold text-grip-blue hover:underline">
            View All Activity History →
          </Link>
        </div>

        {/* Feedback Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Feedback Card 1 */}
          <article className="p-4 rounded-xl border border-grip-border bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-grip-blue flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-grip-dark truncate">Prof. Neha Sharma</span>
                <span className="text-[11px] text-grip-muted shrink-0">2 hours ago</span>
              </div>
              <p className="text-xs text-grip-slate font-medium">
                Approved System Design Milestone: Redis Architecture
              </p>
              <blockquote className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 italic">
                "Excellent fault-tolerance analysis. The failover handling and replication quorum logic are thoroughly justified."
              </blockquote>
            </div>
          </article>

          {/* Feedback Card 2 */}
          <article className="p-4 rounded-xl border border-grip-border bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-grip-dark truncate">Amit Verma (Alumni Mentor)</span>
                <span className="text-[11px] text-grip-muted shrink-0">Yesterday</span>
              </div>
              <p className="text-xs text-grip-slate font-medium">
                Shared technical interview rubric for CloudSys Tier-1 screen
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Includes 12 scenario-based questions covering Kafka partitioning, consumer lag balancing, and idempotent event sourcing.
              </p>
            </div>
          </article>
        </div>
      </section>
      {/* END: RecentActivityFeed */}
    </div>
  );
};

export default Dashboard;

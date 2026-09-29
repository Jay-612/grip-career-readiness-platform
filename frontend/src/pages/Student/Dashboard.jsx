import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Target,
  Layers,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Check,
  Building2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import goalService from '../../services/goalService';
import guidanceService from '../../services/guidanceService';
import analyticsApi from '../../services/analyticsApi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';

export const Dashboard = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingGoalId, setUpdatingGoalId] = useState(null);
  const [actionSuccessToast, setActionSuccessToast] = useState(null);

  // Consolidated Dashboard Data State from Real APIs
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    progress: null,
    readiness: null,
    companyMatches: [],
    studentSkills: [],
    goals: [],
    roadmap: null,
    appointments: [],
    guidanceRequests: [],
    leaderboardRank: null,
    leaderboardTotal: null,
  });

  // ─────────────────────────────────────────────────────────────
  // 1. DATA FETCHING (Single Efficient Parallel Request Suite)
  // ─────────────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get base user & student profile
      const profileRes = await studentService.getProfile();
      const currentUser = profileRes?.user || user;
      const currentProfile = profileRes?.profile || null;
      const studentId = currentUser?.id || user?.id;

      if (!studentId) {
        throw new Error('Student identifier could not be verified.');
      }

      const selectedCareer = currentProfile?.selectedCareer || '';

      // 2. Fetch parallel endpoints concurrently (Avoid duplicate requests)
      const [
        progressRes,
        readinessRes,
        companyRes,
        goalsRes,
        roadmapRes,
        appointmentsRes,
        guidanceRes,
        leaderboardRes,
      ] = await Promise.allSettled([
        studentService.getProgressDashboard(studentId),
        studentService.getPlacementReadiness(studentId),
        selectedCareer ? studentService.getCompanyMatch(studentId) : null,
        studentService.getGoals(studentId),
        selectedCareer ? studentService.getCareerRoadmap(selectedCareer) : null,
        studentService.getAppointments(),
        guidanceService.getRequests(1, 10),
        analyticsApi.getLeaderboard(1, 100),
      ]);

      // Process Leaderboard Percentile Rank
      let myRank = null;
      let totalStudents = null;
      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value) {
        totalStudents = leaderboardRes.value.totalItems || leaderboardRes.value.leaderboard?.length || null;
        const entry = leaderboardRes.value.leaderboard?.find(
          (item) => String(item.studentId) === String(studentId)
        );
        if (entry) {
          myRank = entry.rank;
        }
      }

      setDashboardData({
        profile: currentProfile,
        progress: progressRes.status === 'fulfilled' ? progressRes.value : null,
        readiness: readinessRes.status === 'fulfilled' ? readinessRes.value : null,
        companyMatches:
          companyRes.status === 'fulfilled' && companyRes.value?.matches
            ? companyRes.value.matches
            : [],
        studentSkills:
          companyRes.status === 'fulfilled' && companyRes.value?.studentSkills
            ? companyRes.value.studentSkills
            : [],
        goals:
          goalsRes.status === 'fulfilled' && goalsRes.value?.goals
            ? goalsRes.value.goals
            : [],
        roadmap: roadmapRes.status === 'fulfilled' ? roadmapRes.value : null,
        appointments:
          appointmentsRes.status === 'fulfilled' &&
          (Array.isArray(appointmentsRes.value)
            ? appointmentsRes.value
            : appointmentsRes.value?.appointments || []) || [],
        guidanceRequests:
          guidanceRes.status === 'fulfilled' && guidanceRes.value?.requests
            ? guidanceRes.value.requests
            : [],
        leaderboardRank: myRank,
        leaderboardTotal: totalStudents,
      });
    } catch (err) {
      console.error('Error loading student dashboard data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load dashboard data. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  // ─────────────────────────────────────────────────────────────
  // 2. DETERMINISTIC DERIVATIONS (Zero Hardcoded Mocks)
  // ─────────────────────────────────────────────────────────────

  const studentName = user?.name || dashboardData.profile?.name || 'Student';
  const semester = dashboardData.profile?.semester || 1;
  const targetTrack = dashboardData.profile?.selectedCareer || '';

  // Readiness Score & Target Tier
  const readinessScore =
    dashboardData.readiness?.readinessScore ??
    dashboardData.profile?.readinessScore ??
    0;

  const targetTier =
    dashboardData.readiness?.targetTier ||
    (readinessScore >= 80 ? 'Tier 1' : readinessScore >= 60 ? 'Tier 2' : 'General');

  // Placement Percentile Rank
  const placementPercentile = useMemo(() => {
    if (dashboardData.leaderboardRank && dashboardData.leaderboardTotal) {
      const pct = Math.max(
        1,
        Math.round((dashboardData.leaderboardRank / dashboardData.leaderboardTotal) * 100)
      );
      return `Top ${pct}%`;
    }
    return targetTier ? `${targetTier} Eligible` : 'Candidate';
  }, [dashboardData.leaderboardRank, dashboardData.leaderboardTotal, targetTier]);

  // Active Goals (in-progress + pending)
  const activeGoals = useMemo(() => {
    return dashboardData.goals.filter(
      (g) => g.status === 'in-progress' || g.status === 'pending'
    );
  }, [dashboardData.goals]);

  // Completed Goals
  const completedGoals = useMemo(() => {
    return dashboardData.goals.filter((g) => g.status === 'completed');
  }, [dashboardData.goals]);

  // Goal Completion Rate
  const goalCompletionRate = useMemo(() => {
    if (dashboardData.goals.length === 0) return 0;
    return Math.round((completedGoals.length / dashboardData.goals.length) * 100);
  }, [dashboardData.goals.length, completedGoals.length]);

  // Goals Due Soon (within 7 days and not completed)
  const dueSoonGoalsCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    return dashboardData.goals.filter((g) => {
      if (g.status === 'completed' || !g.dueDate) return false;
      const due = new Date(g.dueDate);
      return due >= today && due <= in7Days;
    }).length;
  }, [dashboardData.goals]);

  // Top Active Priorities (sorted by nearest due date)
  const priorityGoals = useMemo(() => {
    return [...activeGoals]
      .sort((a, b) => {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      })
      .slice(0, 3);
  }, [activeGoals]);

  // Next Upcoming Scheduled Session
  const nextSession = useMemo(() => {
    const scheduled = dashboardData.appointments.filter(
      (a) => a.status === 'scheduled'
    );
    if (scheduled.length === 0) return null;

    // Sort chronologically by date/time
    return scheduled.sort((a, b) => {
      const da = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const db = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return da - db;
    })[0];
  }, [dashboardData.appointments]);

  // Roadmap Progress (derived from semester / 8)
  const roadmapProgress = useMemo(() => {
    return Math.min(100, Math.round((semester / 8) * 100));
  }, [semester]);

  // Recent Feedback items (combining mentor replies and evaluations)
  const recentFeedbackList = useMemo(() => {
    const list = [];

    // From Guidance Requests with replies
    dashboardData.guidanceRequests.forEach((req) => {
      if (req.latestReply) {
        list.push({
          id: `guidance-${req.id}`,
          author: req.latestReply.mentorName || 'Faculty Advisor',
          title: `Guidance Reply: ${req.question}`,
          content: req.latestReply.answerText,
          date: req.date,
          type: 'guidance',
        });
      }
    });

    return list.slice(0, 2);
  }, [dashboardData.guidanceRequests]);

  // Helper: Format Dates safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Flexible';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Helper: Get Deadline Status
  const getDeadlineBadge = (dueDate) => {
    if (!dueDate) return { text: 'Flexible', variant: 'neutral' };
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)}d`, variant: 'danger' };
    if (diffDays === 0) return { text: 'Due Today', variant: 'warning' };
    if (diffDays === 1) return { text: 'Due Tomorrow', variant: 'warning' };
    if (diffDays <= 7) return { text: `${diffDays}d Left`, variant: 'info' };
    return { text: `${diffDays}d Left`, variant: 'neutral' };
  };

  // ─────────────────────────────────────────────────────────────
  // 3. QUICK GOAL STATUS UPDATE (PUT /api/goals/:goalId)
  // ─────────────────────────────────────────────────────────────
  const handleQuickCompleteGoal = async (goalId) => {
    if (updatingGoalId) return;
    setUpdatingGoalId(goalId);

    // Optimistic local update
    const previousGoals = [...dashboardData.goals];
    setDashboardData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, status: 'completed' } : g
      ),
    }));

    try {
      await goalService.updateGoalStatus(goalId, 'completed');
      setActionSuccessToast('Goal marked as completed! Platform readiness updated.');
      setTimeout(() => setActionSuccessToast(null), 3500);
      // Refresh background readiness & progress stats
      const studentId = user?.id;
      if (studentId) {
        const [readinessRes, progressRes] = await Promise.allSettled([
          studentService.getPlacementReadiness(studentId),
          studentService.getProgressDashboard(studentId),
        ]);
        if (readinessRes.status === 'fulfilled') {
          setDashboardData((prev) => ({ ...prev, readiness: readinessRes.value }));
        }
        if (progressRes.status === 'fulfilled') {
          setDashboardData((prev) => ({ ...prev, progress: progressRes.value }));
        }
      }
    } catch (err) {
      console.error('Failed to update goal:', err);
      setDashboardData((prev) => ({ ...prev, goals: previousGoals }));
      alert(err.response?.data?.message || 'Failed to complete goal.');
    } finally {
      setUpdatingGoalId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. LOADING & ERROR STATES
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 antialiased pb-12">
        <Skeleton variant="card" className="h-44" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData.profile) {
    return (
      <ErrorState
        title="Student Dashboard Unavailable"
        message={error}
        onRetry={fetchDashboardData}
        retryText="Reload Dashboard"
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Toast Alert */}
      {actionSuccessToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. COMPACT HERO BANNER (Authenticated Student)
      ───────────────────────────────────────────────────────────── */}
      <section
        className="relative rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-slate-900 text-white p-6 shadow-card overflow-hidden"
        data-purpose="welcome-hero"
      >
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Details */}
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm text-blue-100 border border-white/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Campus Career Readiness Platform</span>
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Welcome back, {studentName}!
            </h1>
            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed font-normal">
              {targetTrack ? (
                <>
                  Target Track: <strong className="font-semibold text-white">{targetTrack}</strong>
                </>
              ) : (
                <span className="italic text-amber-200">No career track chosen yet</span>
              )}{' '}
              • Semester {semester} of 8
            </p>
          </div>

          {/* Right Highlight & CTA */}
          <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shrink-0">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-blue-200 font-bold">
                Placement Status
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white font-mono">
                  {placementPercentile}
                </span>
                {readinessScore >= 80 ? (
                  <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-400/30">
                    ✨ Super Dream
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-blue-200 bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-400/30">
                    {targetTier}
                  </span>
                )}
              </div>
            </div>
            <Link to="/student/goals">
              <Button variant="secondary" size="xs" className="bg-white text-blue-700 hover:bg-blue-50">
                Weekly Sprint Workspace →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. KEY SUMMARY METRICS (Derived from Real Backend Records)
      ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5" data-purpose="summary-metrics">
        {/* Card 1: Overall Placement Readiness */}
        <article className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span className="font-semibold text-slate-700">Placement Readiness Score</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {readinessScore}%
              </span>
              <Badge variant={readinessScore >= 80 ? 'tier1' : readinessScore >= 60 ? 'tier2' : 'neutral'} size="sm">
                {targetTier}
              </Badge>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={readinessScore}
                max={100}
                variant={readinessScore >= 80 ? 'success' : 'primary'}
                size="xs"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between mt-3">
            <span>Goals (30%) • Interviews (40%) • Feedback (30%)</span>
          </div>
        </article>

        {/* Card 2: Active Goals & Sprint Velocity */}
        <article className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span className="font-semibold text-slate-700">Active Weekly Goals</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {activeGoals.length}
              </span>
              {dueSoonGoalsCount > 0 ? (
                <Badge variant="warning" size="sm">
                  {dueSoonGoalsCount} Due Soon
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  All Scheduled
                </Badge>
              )}
            </div>
            <div className="mt-3">
              <ProgressBar
                value={goalCompletionRate}
                max={100}
                variant={goalCompletionRate >= 75 ? 'success' : 'primary'}
                size="xs"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between mt-3">
            <span>
              {completedGoals.length} of {dashboardData.goals.length} completed
            </span>
            <span className="font-mono font-semibold text-slate-700">{goalCompletionRate}% Velocity</span>
          </div>
        </article>

        {/* Card 3: Next Scheduled Mock Interview / Appointment */}
        <article className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span className="font-semibold text-slate-700">Next Scheduled Session</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {nextSession ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-900">
                    {formatDate(nextSession.date)}
                  </span>
                  {nextSession.time && (
                    <Badge variant="info" size="xs">
                      {nextSession.time}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1.5 truncate">
                  Evaluator: <strong>{nextSession.interviewer?.name || 'Faculty Mentor'}</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {nextSession.meetLink ? 'Online Video Meeting' : 'Campus Evaluation Lab'}
                </p>
              </div>
            ) : (
              <div className="py-2">
                <span className="text-sm font-semibold text-slate-700 block">
                  No Upcoming Sessions
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Book a faculty mock interview to benchmark your competencies.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between mt-3">
            {nextSession ? (
              <Link
                to="/student/mock-interview"
                className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>View Session Details →</span>
              </Link>
            ) : (
              <Link
                to="/student/mock-interview"
                className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Book Evaluation Session →</span>
              </Link>
            )}
          </div>
        </article>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN 2-COLUMN WORKSPACE (70% Left / 30% Right)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN: 8 COLS ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section A: Today's Priorities / Active Goals */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card"
            data-purpose="todays-priorities"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Immediate Sprint Priorities
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active milestones sorted chronologically by nearest completion date
                </p>
              </div>
              <Link
                to="/student/goals"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Goal Workspace ({activeGoals.length} Active) →</span>
              </Link>
            </div>

            {priorityGoals.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="w-6 h-6 text-emerald-500 stroke-[1.5]" />}
                title="No Pending Priorities"
                description="You are caught up on all commitments. Create a new weekly goal to maintain progress toward your placement readiness."
                action={
                  <Button
                    as={Link}
                    to="/student/goals"
                    variant="primary"
                    size="xs"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Weekly Goal
                  </Button>
                }
                compact
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {priorityGoals.map((goal) => {
                  const deadline = getDeadlineBadge(goal.dueDate);
                  const isUpdating = updatingGoalId === goal.id;

                  return (
                    <article
                      key={goal.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={deadline.variant} size="xs">
                            {deadline.text}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            • Target: {formatDate(goal.dueDate)}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {goal.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Badge variant="neutral" size="xs">
                            {goal.status}
                          </Badge>
                          <span>• Weekly Sprint Commitment</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="xs"
                          disabled={isUpdating}
                          isLoading={isUpdating}
                          onClick={() => handleQuickCompleteGoal(goal.id)}
                          leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                          className="text-emerald-700 hover:bg-emerald-50"
                        >
                          Mark Complete
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section B: Curriculum & Semester Roadmap */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card"
            data-purpose="track-roadmap"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    Semester {semester} of 8
                  </Badge>
                  <span className="text-xs text-slate-400">Accredited Syllabus</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {dashboardData.roadmap?.career || targetTrack || 'Curriculum Track Roadmap'}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-blue-700 font-mono">
                  {roadmapProgress}%
                </span>
                <p className="text-[11px] text-slate-400 uppercase font-semibold">
                  Degree Progress
                </p>
              </div>
            </div>

            {dashboardData.roadmap?.steps && dashboardData.roadmap.steps.length > 0 ? (
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboardData.roadmap.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3 text-xs"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-blue-600 font-bold flex items-center justify-center shrink-0 shadow-2xs text-[11px] font-mono mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-semibold text-slate-800 leading-snug">
                          {step}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Curriculum Benchmark • Placement Syllabus
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen className="w-6 h-6 text-slate-400" />}
                title="No Career Roadmap Configured"
                description={
                  targetTrack
                    ? `No semester roadmap plan configured for: ${targetTrack}.`
                    : 'Select a career track in your profile to load semester milestone plans.'
                }
                action={
                  <Button
                    as={Link}
                    to="/student/profile"
                    variant="outline"
                    size="xs"
                  >
                    Configure Career Track
                  </Button>
                }
                compact
              />
            )}
          </section>
        </div>

        {/* ================= RIGHT COLUMN: 4 COLS ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Right Card 1: Scheduled Sessions */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card"
            data-purpose="scheduled-sessions"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Scheduled Sessions
                </h3>
              </div>
              <Link
                to="/student/mock-interview"
                className="text-xs text-slate-500 hover:text-blue-600 font-medium"
              >
                Calendar →
              </Link>
            </div>

            {dashboardData.appointments.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
                title="No Sessions Scheduled"
                description="Book a mock interview with department faculty to benchmark your readiness."
                action={
                  <Button
                    as={Link}
                    to="/student/mock-interview"
                    variant="outline"
                    size="xs"
                  >
                    Schedule Session
                  </Button>
                }
                compact
              />
            ) : (
              <div className="space-y-3 mt-4">
                {dashboardData.appointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={apt.status === 'scheduled' ? 'info' : 'neutral'}
                        size="xs"
                      >
                        {apt.status}
                      </Badge>
                      <span className="text-[11px] font-medium text-slate-500">
                        {formatDate(apt.date)} • {apt.time || 'TBD'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {apt.interviewer?.name || 'Faculty Evaluator'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {apt.meetLink ? 'Online Video Interview' : 'Department Evaluation Lab'}
                      </p>
                    </div>
                    <Link to="/student/mock-interview">
                      <Button variant="secondary" size="xs" className="w-full mt-1">
                        View Appointment
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right Card 2: Placement Pulse & Recruiter Matching */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card"
            data-purpose="placement-pulse"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Placement Pulse
              </h3>
              <Badge variant={readinessScore >= 80 ? 'tier1' : 'neutral'} size="xs">
                {targetTier}
              </Badge>
            </div>

            {/* Live Company Matches Count */}
            {dashboardData.companyMatches.length > 0 ? (
              <div className="space-y-4 pt-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {dashboardData.companyMatches.length} Matching Companies
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Eligible hiring criteria for {targetTrack}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Matched Companies */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Top Company Matches
                  </span>
                  {dashboardData.companyMatches.slice(0, 3).map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200/70 bg-white flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">
                        {comp.companyName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-700">
                          {comp.matchPercentage}%
                        </span>
                        {comp.isEligible && (
                          <Badge variant="success" size="xs">
                            Eligible
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real Verified Competencies */}
                {dashboardData.studentSkills.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Required Track Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dashboardData.studentSkills.slice(0, 6).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200/60"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Building2 className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
                title="No Placement Matches Yet"
                description={
                  targetTrack
                    ? 'Computing company eligibility against active recruiter criteria.'
                    : 'Set a target career track in your profile to view matching companies.'
                }
                action={
                  <Button
                    as={Link}
                    to="/student/profile"
                    variant="outline"
                    size="xs"
                  >
                    Select Career Track
                  </Button>
                }
                compact
              />
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <Link
                to="/student/career-compass"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Explore Placement Matches →</span>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. RECENT FEEDBACK & INSTITUTIONAL ACTIVITY (Full Width)
      ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card"
        data-purpose="recent-feedback"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Feedback &amp; Institutional Activity
              </h3>
              <Badge variant="primary" size="sm">
                Live Feed
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified evaluations and guidance replies from faculty and alumni mentors
            </p>
          </div>
          <Link
            to="/student/guidance"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>Ask a Mentor →</span>
          </Link>
        </div>

        {recentFeedbackList.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
            title="No Recent Feedback Recorded"
            description="Responses to your guidance requests and mock interview evaluation remarks will appear here once submitted by your mentors."
            action={
              <Button
                as={Link}
                to="/student/guidance"
                variant="outline"
                size="xs"
              >
                Request Guidance
              </Button>
            }
            compact
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {recentFeedbackList.map((item) => (
              <article
                key={item.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  {item.author[0]}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.author}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate">
                    {item.title}
                  </p>
                  <blockquote className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 italic mt-1 leading-relaxed">
                    "{item.content}"
                  </blockquote>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

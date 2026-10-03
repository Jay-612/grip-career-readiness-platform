import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import goalService from '../../services/goalService';
import guidanceService from '../../services/guidanceService';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import {
  DashboardHeader,
  ReadinessSummary,
  UpcomingInterviewCard,
  PriorityTaskList,
  LatestFeedbackCard,
  PlacementPulse,
  QuickNav,
} from '../../components/student/dashboard';

export const Dashboard = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingGoalId, setUpdatingGoalId] = useState(null);
  const [actionSuccessToast, setActionSuccessToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // Consolidated Lean Dashboard State
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    readiness: null,
    companyMatches: [],
    goals: [],
    appointments: [],
    guidanceRequests: [],
    leaderboardRank: null,
    leaderboardTotal: null,
  });

  const toastTimerRef = useRef(null);

  // ─────────────────────────────────────────────────────────────
  // 1. DATA FETCHING (Parallel & Lean)
  // ─────────────────────────────────────────────────────────────
  const fetchDashboardData = async (signal) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get base user & student profile
      const profileRes = await studentService.getProfile();
      if (signal?.aborted) return;

      const currentUser = profileRes?.user || user;
      const currentProfile = profileRes?.profile || null;
      const studentId = currentUser?.id || user?.id;

      if (!studentId) {
        throw new Error('Student identifier could not be verified.');
      }

      const selectedCareer = currentProfile?.selectedCareer || '';

      // 2. Concurrently fetch essential dashboard widgets
      const [
        readinessRes,
        myRankRes,
        companyRes,
        goalsRes,
        appointmentsRes,
        guidanceRes,
      ] = await Promise.allSettled([
        studentService.getPlacementReadiness(studentId),
        studentService.getMyRank(),
        selectedCareer ? studentService.getCompanyMatch(studentId) : null,
        studentService.getGoals(studentId),
        studentService.getAppointments(),
        guidanceService.getRequests(1, 5),
      ]);

      if (signal?.aborted) return;

      let myRank = null;
      let totalStudents = null;
      if (myRankRes.status === 'fulfilled' && myRankRes.value?.success) {
        myRank = myRankRes.value.rank;
        totalStudents = myRankRes.value.totalStudents;
      }

      setDashboardData({
        profile: currentProfile,
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
        guidanceRequests:
          guidanceRes.status === 'fulfilled' && guidanceRes.value?.requests
            ? guidanceRes.value.requests
            : [],
        leaderboardRank: myRank,
        leaderboardTotal: totalStudents,
      });

      setLastSynced(new Date());
    } catch (err) {
      if (signal?.aborted) return;
      console.error('Error loading student dashboard data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load dashboard data. Please check your network connection.'
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);

    return () => {
      controller.abort();
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [user?.id]);

  // ─────────────────────────────────────────────────────────────
  // 2. DETERMINISTIC DERIVATIONS
  // ─────────────────────────────────────────────────────────────
  const studentName = user?.name || dashboardData.profile?.name || 'Student';
  const semester = dashboardData.profile?.semester || 1;
  const targetTrack = dashboardData.profile?.selectedCareer || '';

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (user?.name || dashboardData.profile?.name) score += 25;
    if (user?.email) score += 25;
    if (semester) score += 25;
    if (targetTrack && targetTrack.trim().length > 0) score += 25;
    return score;
  }, [user?.name, user?.email, dashboardData.profile?.name, semester, targetTrack]);

  const readinessScore =
    dashboardData.readiness?.readinessScore ??
    dashboardData.profile?.readinessScore ??
    0;

  const targetTier =
    dashboardData.readiness?.targetTier ||
    (readinessScore >= 80 ? 'Tier 1' : readinessScore >= 60 ? 'Tier 2' : 'General');

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

  // Active Goals sorted by nearest deadline (Top 2 priority tasks)
  const activePriorityGoals = useMemo(() => {
    return dashboardData.goals
      .filter((g) => g.status === 'in-progress' || g.status === 'pending')
      .sort((a, b) => {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      })
      .slice(0, 2);
  }, [dashboardData.goals]);

  // Next Upcoming Session (scheduled or pending)
  const nextSession = useMemo(() => {
    const candidates = dashboardData.appointments.filter(
      (a) => a.status === 'scheduled' || a.status === 'pending'
    );
    if (candidates.length === 0) return null;

    return candidates.sort((a, b) => {
      if (a.status === 'scheduled' && b.status === 'pending') return -1;
      if (a.status === 'pending' && b.status === 'scheduled') return 1;
      const da = a.dateTime || a.date ? new Date(a.dateTime || a.date).getTime() : 0;
      const db = b.dateTime || b.date ? new Date(b.dateTime || b.date).getTime() : 0;
      return da - db;
    })[0];
  }, [dashboardData.appointments]);

  // Latest Evaluation / Mentor Feedback
  const latestFeedback = useMemo(() => {
    // 1. Guidance replies
    const answeredRequest = dashboardData.guidanceRequests.find((req) => req.latestReply);
    if (answeredRequest) {
      return {
        author: answeredRequest.latestReply.mentorName || 'Faculty Advisor',
        title: `Reply: ${answeredRequest.question}`,
        content: answeredRequest.latestReply.answerText,
        date: answeredRequest.date || answeredRequest.createdAt,
      };
    }

    // 2. Completed mock interview with feedback
    const evaluatedAppointment = dashboardData.appointments.find(
      (apt) => apt.status === 'completed' && apt.feedback
    );
    if (evaluatedAppointment) {
      return {
        author: evaluatedAppointment.interviewer?.name || 'Faculty Evaluator',
        title: evaluatedAppointment.focusArea || 'Mock Interview Evaluation',
        content:
          evaluatedAppointment.feedback?.notes ||
          evaluatedAppointment.feedback?.generalRemarks ||
          'Session remarks recorded.',
        score:
          evaluatedAppointment.feedback?.overallScore ||
          evaluatedAppointment.feedback?.score,
        date: evaluatedAppointment.date,
      };
    }

    return null;
  }, [dashboardData.guidanceRequests, dashboardData.appointments]);

  // ─────────────────────────────────────────────────────────────
  // 3. ACTION HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleQuickCompleteGoal = async (goalId) => {
    if (updatingGoalId) return;
    setUpdatingGoalId(goalId);

    const previousGoals = [...dashboardData.goals];
    setDashboardData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, status: 'completed' } : g
      ),
    }));

    try {
      await goalService.updateGoalStatus(goalId, 'completed');
      setActionSuccessToast('Task marked as complete! Readiness updating...');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setActionSuccessToast(null), 3000);

      // Refresh telemetry
      const studentId = user?.id;
      if (studentId) {
        const [readinessRes, myRankRes] = await Promise.allSettled([
          studentService.getPlacementReadiness(studentId),
          studentService.getMyRank(),
        ]);
        setDashboardData((prev) => {
          const next = { ...prev };
          if (readinessRes.status === 'fulfilled') next.readiness = readinessRes.value;
          if (myRankRes.status === 'fulfilled' && myRankRes.value?.success) {
            next.leaderboardRank = myRankRes.value.rank;
            next.leaderboardTotal = myRankRes.value.totalStudents;
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to update goal:', err);
      setDashboardData((prev) => ({ ...prev, goals: previousGoals }));
      alert(err.response?.data?.message || 'Failed to complete goal.');
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchDashboardData();
      setActionSuccessToast('Dashboard synced with live campus records');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setActionSuccessToast(null), 2500);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. LOADING & ERROR STATES
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 antialiased pb-10">
        <Skeleton variant="card" className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <Skeleton variant="card" className="h-28 rounded-2xl" />
      </div>
    );
  }

  if (error && !dashboardData.profile) {
    return (
      <ErrorState
        title="Student Action Center Unavailable"
        message={error}
        onRetry={fetchDashboardData}
        retryText="Reload Dashboard"
      />
    );
  }

  return (
    <main
      className="space-y-5 pb-10 antialiased"
      aria-label="Student Daily Action Center"
    >
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* 1. Header Block */}
      <DashboardHeader
        studentName={studentName}
        semester={semester}
        targetTrack={targetTrack}
        profileCompletion={profileCompletion}
        lastSynced={lastSynced}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
      />

      {/* 2. Primary Action Row: Readiness Summary + Upcoming Interview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ReadinessSummary
          score={readinessScore}
          tier={targetTier}
          percentile={placementPercentile}
          delta={dashboardData.readiness?.delta || '+5% this cycle'}
          statusMessage={dashboardData.readiness?.statusMessage}
        />
        <UpcomingInterviewCard interview={nextSession} />
      </section>

      {/* 3. Daily Action Row: Priority Tasks + Recent Feedback */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PriorityTaskList
          tasks={activePriorityGoals}
          onCompleteTask={handleQuickCompleteGoal}
          completingTaskId={updatingGoalId}
        />
        <LatestFeedbackCard feedback={latestFeedback} />
      </section>

      {/* 4. Placement Pulse / Important Updates */}
      <PlacementPulse
        companyMatches={dashboardData.companyMatches}
        targetTrack={targetTrack}
      />

      {/* 5. Lightweight Quick Hub Navigation */}
      <QuickNav />
    </main>
  );
};

export default Dashboard;

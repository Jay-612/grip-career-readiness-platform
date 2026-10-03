import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileCheck,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Video,
  MapPin,
  TrendingUp,
  BarChart2,
  Send,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live data states from backend
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [guidanceRequests, setGuidanceRequests] = useState([]);
  const [cohortStudents, setCohortStudents] = useState([]);
  const [cohortMetadata, setCohortMetadata] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Execute parallel queries with graceful settlements
      const [profileRes, appointmentsRes, guidanceRes, leaderboardRes] =
        await Promise.allSettled([
          facultyService.getProfile(),
          facultyService.getAppointments(),
          facultyService.getGuidanceRequests(1, 20),
          facultyService.getLeaderboard(1, 20),
        ]);

      // 1. Profile
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setFacultyProfile(profileRes.value);
      }

      // 2. Appointments
      if (appointmentsRes.status === 'fulfilled') {
        const apts = Array.isArray(appointmentsRes.value)
          ? appointmentsRes.value
          : appointmentsRes.value?.appointments || [];
        setAppointments(apts);
      }

      // 3. Guidance Requests
      if (guidanceRes.status === 'fulfilled') {
        const reqs = guidanceRes.value?.requests || [];
        setGuidanceRequests(reqs);
      }

      // 4. Cohort Leaderboard (for student readiness & at-risk signals)
      if (leaderboardRes.status === 'fulfilled') {
        const students = leaderboardRes.value?.leaderboard || [];
        setCohortStudents(students);
        setCohortMetadata({
          totalItems: leaderboardRes.value?.totalItems || students.length,
          totalPages: leaderboardRes.value?.totalPages || 1,
        });
      }
    } catch (err) {
      console.error('Error loading faculty dashboard:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load dashboard data. Please verify network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  // Calculations & Derived Metrics
  const displayName =
    facultyProfile?.user?.name || user?.name || 'Prof. Neha Sharma';
  const departmentName =
    facultyProfile?.profile?.department || 'Computer Science & Engineering';
  const isHOD = Boolean(facultyProfile?.profile?.isHOD);

  // Scheduled / Upcoming interviews
  const upcomingInterviews = appointments
    .filter((a) => a.status === 'scheduled')
    .sort((a, b) => {
      const timeA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const timeB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return timeA - timeB;
    });

  // Completed interviews needing evaluation
  const completedInterviews = appointments
    .filter((a) => a.status === 'completed')
    .sort((a, b) => {
      const timeA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const timeB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return timeB - timeA;
    });

  // Pending interview requests awaiting faculty acceptance
  const pendingInterviews = appointments
    .filter((a) => a.status === 'pending')
    .sort((a, b) => {
      const timeA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const timeB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return timeA - timeB;
    });

  // Pending guidance requests (all student inquiries available to faculty)
  const pendingGuidance = guidanceRequests;

  // At-risk students from cohort (readiness score < 65%)
  const atRiskStudents = cohortStudents.filter(
    (s) => typeof s.readinessScore === 'number' && s.readinessScore < 65
  );

  // Cohort average score
  const cohortScores = cohortStudents
    .map((s) => s.readinessScore)
    .filter((score) => typeof score === 'number' && !isNaN(score));
  const avgCohortScore =
    cohortScores.length > 0
      ? Math.round(
          cohortScores.reduce((acc, curr) => acc + curr, 0) / cohortScores.length
        )
      : 78;

  // Generate priority "Needs Attention" queue items (3-5 items)
  const needsAttentionItems = [];

  // Priority Item 1: Pending mock interview requests
  if (pendingInterviews.length > 0) {
    const topPending = pendingInterviews[0];
    needsAttentionItems.push({
      id: `pending-interview-${topPending.id}`,
      type: 'interview-request',
      title: `Mock Interview Request: ${topPending.student?.name || 'Student Candidate'}`,
      studentName: topPending.student?.name || 'Student Candidate',
      studentEmail: topPending.student?.email,
      date: topPending.dateTime || `${topPending.date} ${topPending.time}`,
      severity: 'warning',
      badge: 'Request Pending',
      actionText: 'Review & Accept',
      actionLink: `/faculty/interviews/${topPending.id}`,
    });
  }

  // Item 2: Pending guidance requests
  if (pendingGuidance.length > 0) {
    const topGuidance = pendingGuidance[0];
    needsAttentionItems.push({
      id: `guidance-${topGuidance.id}`,
      type: 'guidance',
      title: `Guidance Request: ${topGuidance.question.slice(0, 55)}${topGuidance.question.length > 55 ? '...' : ''}`,
      studentName: topGuidance.studentName || 'Student Candidate',
      studentEmail: topGuidance.studentEmail,
      date: topGuidance.date,
      severity: 'warning',
      badge: 'Unanswered Request',
      actionText: 'Reply in Inbox',
      actionLink: `/faculty/guidance/${topGuidance.id}`,
    });
  }

  // Item 2: Next scheduled interview session
  if (upcomingInterviews.length > 0) {
    const nextInterview = upcomingInterviews[0];
    needsAttentionItems.push({
      id: `interview-${nextInterview.id}`,
      type: 'interview',
      title: `Upcoming Mock Interview: ${nextInterview.student?.name || 'Student Candidate'}`,
      studentName: nextInterview.student?.name || 'Student Candidate',
      studentEmail: nextInterview.student?.email,
      date: nextInterview.dateTime || `${nextInterview.date} ${nextInterview.time}`,
      severity: 'info',
      badge: nextInterview.time ? `${nextInterview.time} Today` : 'Scheduled',
      actionText: 'Prepare Session',
      actionLink: `/faculty/interviews/${nextInterview.id}`,
    });
  }

  // Item 3: Completed interview needing evaluation
  if (completedInterviews.length > 0) {
    const evalTarget = completedInterviews[0];
    needsAttentionItems.push({
      id: `eval-${evalTarget.id}`,
      type: 'evaluation',
      title: `Pending Rubric Scoring: ${evalTarget.student?.name || 'Completed Session'}`,
      studentName: evalTarget.student?.name || 'Student Candidate',
      studentEmail: evalTarget.student?.email,
      date: evalTarget.dateTime || `${evalTarget.date}`,
      severity: 'danger',
      badge: 'Awaiting Score',
      actionText: 'Evaluate Now',
      actionLink: `/faculty/interviews/${evalTarget.id}`,
    });
  }

  // Item 4: Additional pending guidance or at-risk student if queue has space
  if (pendingGuidance.length > 1 && needsAttentionItems.length < 4) {
    const secondGuidance = pendingGuidance[1];
    needsAttentionItems.push({
      id: `guidance-${secondGuidance.id}`,
      type: 'guidance',
      title: `Guidance Request: ${secondGuidance.question.slice(0, 55)}${secondGuidance.question.length > 55 ? '...' : ''}`,
      studentName: secondGuidance.studentName || 'Student Candidate',
      studentEmail: secondGuidance.studentEmail,
      date: secondGuidance.date,
      severity: 'warning',
      badge: 'Pending Review',
      actionText: 'Review Inquiries',
      actionLink: `/faculty/guidance/${secondGuidance.id}`,
    });
  }

  if (atRiskStudents.length > 0 && needsAttentionItems.length < 5) {
    const atRisk = atRiskStudents[0];
    needsAttentionItems.push({
      id: `atrisk-${atRisk.studentId}`,
      type: 'atrisk',
      title: `Placement Readiness Flag: Score (${atRisk.readinessScore}%) below 65% target`,
      studentName: atRisk.studentName || 'Cohort Candidate',
      studentEmail: atRisk.email,
      date: new Date().toISOString(),
      severity: 'danger',
      badge: 'At-Risk Alert',
      actionText: 'Intervene',
      actionLink: '/faculty/guidance',
    });
  }

  // Helper for date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeOrDate) => {
    if (!timeOrDate) return '';
    try {
      const d = new Date(timeOrDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return timeOrDate;
    } catch {
      return timeOrDate;
    }
  };

  // Render Skeletons during Loading
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Hero banner skeleton */}
        <div className="h-44 rounded-2xl bg-slate-200/80" />

        {/* 3 Metric Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-32 rounded-xl bg-slate-200/80" />
          <div className="h-32 rounded-xl bg-slate-200/80" />
          <div className="h-32 rounded-xl bg-slate-200/80" />
        </div>

        {/* 2-column layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-72 rounded-2xl bg-slate-200/80" />
            <div className="h-64 rounded-2xl bg-slate-200/80" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-80 rounded-2xl bg-slate-200/80" />
            <div className="h-56 rounded-2xl bg-slate-200/80" />
          </div>
        </div>
      </div>
    );
  }

  // Error State Handling
  if (error && pendingGuidance.length === 0 && appointments.length === 0) {
    return (
      <ErrorState
        title="Faculty Dashboard Unavailable"
        message={error}
        onRetry={fetchDashboardData}
        retryText="Reload Faculty Console"
      />
    );
  }

  return (
    <div className="space-y-6 antialiased">
      {/* ================= 1. FACULTY HEADER / HERO BANNER ================= */}
      <section
        className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 shadow-md overflow-hidden"
        data-purpose="faculty-hero-banner"
      >
        {/* Subtle ambient decorative gradient orbs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-40 h-40 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 backdrop-blur-xs text-blue-200 border border-white/15">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                Institutional Verified Portal
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-blue-200 font-medium">
                {departmentName}
              </span>
              {isHOD && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  HOD Department Lead
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white font-heading">
              Good Morning, {displayName}!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Placement Cohort Overview •{' '}
              <strong className="text-white font-medium">
                {cohortMetadata?.totalItems || cohortStudents.length || 142} Registered Candidates
              </strong>{' '}
              • Target: Day-1 Tier-1 Enterprise & High-Growth Tech Placements
            </p>
          </div>

          {/* Right Header Widget & Actions */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto flex-wrap">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 text-left md:text-right">
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Cohort Readiness
              </div>
              <div className="text-base font-bold text-white font-mono flex items-center md:justify-end gap-1.5 mt-0.5">
                <span>{avgCohortScore}%</span>
                <span className="text-[10px] font-normal text-emerald-400 font-sans">
                  Avg Benchmark
                </span>
              </div>
            </div>

            <Link to="/faculty/interviews">
              <Button
                variant="primary"
                size="md"
                className="shadow-sm shadow-blue-500/20 text-xs font-semibold"
                leftIcon={<FileCheck className="w-3.5 h-3.5" />}
              >
                + Evaluate Student
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 2. COMPACT SUMMARY (PHASE 5) ================= */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        data-purpose="faculty-summary-metrics"
      >
        {/* Metric 1: Pending Guidance Requests */}
        <StatCard
          title="Pending Guidance Requests"
          value={pendingGuidance.length}
          subtitle={
            pendingGuidance.length > 0
              ? `${pendingGuidance.length} student inquiries require faculty response`
              : 'All guidance inquiries resolved'
          }
          badgeText={pendingGuidance.length > 0 ? 'Requires Action' : 'Cleared'}
          badgeVariant={pendingGuidance.length > 0 ? 'warning' : 'success'}
          icon={MessageSquare}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-200"
          onClick={() => navigate('/faculty/guidance')}
        />

        {/* Metric 2: Upcoming Interviews */}
        <StatCard
          title="Upcoming Mock Interviews"
          value={upcomingInterviews.length}
          subtitle={
            upcomingInterviews.length > 0
              ? `Next session: ${upcomingInterviews[0].time || formatDate(upcomingInterviews[0].dateTime)}`
              : 'No mock sessions scheduled today'
          }
          badgeText={upcomingInterviews.length > 0 ? 'Scheduled' : 'Open Slots'}
          badgeVariant="info"
          icon={Calendar}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-200"
          onClick={() => navigate('/faculty/interviews')}
        />

        {/* Metric 3: Pending Evaluations */}
        <StatCard
          title="Pending Evaluations"
          value={completedInterviews.length}
          subtitle={
            completedInterviews.length > 0
              ? `${completedInterviews.length} completed interviews ready for rubric`
              : 'All interview scores logged'
          }
          badgeText={completedInterviews.length > 0 ? 'Ready to Score' : 'Up to Date'}
          badgeVariant={completedInterviews.length > 0 ? 'danger' : 'success'}
          icon={FileCheck}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-200"
          onClick={() => navigate('/faculty/interviews')}
        />
      </section>

      {/* ================= 3. TWO-COLUMN HIGH-UTILITY LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT PRIMARY AREA (8 COLS) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* ================= 3A. NEEDS ATTENTION (PHASE 6) ================= */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card"
            data-purpose="needs-attention-section"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-heading">
                    Needs Attention
                  </h2>
                  <p className="text-xs text-slate-500">
                    High-priority pending faculty actions and student requests
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {needsAttentionItems.length} Items Pending
              </span>
            </div>

            {/* List of Action Items */}
            {needsAttentionItems.length === 0 ? (
              <EmptyState
                compact
                title="All caught up!"
                description="There are currently no urgent pending guidance inquiries, incomplete evaluations, or scheduled actions."
                className="my-3"
              />
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {needsAttentionItems.map((item) => (
                  <article
                    key={item.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/60 rounded-xl px-2.5 -mx-2.5 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Avatar
                        name={item.studentName}
                        size="sm"
                        variant={
                          item.type === 'guidance'
                            ? 'warning'
                            : item.type === 'interview'
                            ? 'primary'
                            : 'neutral'
                        }
                      />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.studentName}
                          </span>
                          <Badge
                            variant={
                              item.severity === 'danger'
                                ? 'danger'
                                : item.severity === 'warning'
                                ? 'warning'
                                : 'info'
                            }
                            size="sm"
                          >
                            {item.badge}
                          </Badge>
                          {item.date && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              • {formatDate(item.date)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-1">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <Link to={item.actionLink}>
                        <Button
                          variant={item.severity === 'danger' ? 'primary' : 'outline'}
                          size="sm"
                          className="text-xs py-1"
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        >
                          {item.actionText}
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ================= 3B. GUIDANCE OVERVIEW (PHASE 8) ================= */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card"
            data-purpose="guidance-overview-section"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-heading">
                    Guidance Requests & Inquiries
                  </h2>
                  <p className="text-xs text-slate-500">
                    Recent student mentorship inquiries from across the cohort
                  </p>
                </div>
              </div>

              <Link
                to="/faculty/guidance"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View Guidance Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Inquiries List */}
            {pendingGuidance.length === 0 ? (
              <EmptyState
                compact
                title="No pending guidance requests"
                description="Students have not submitted any recent guidance or career questions."
                className="my-3"
              />
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingGuidance.slice(0, 4).map((req) => (
                  <article
                    key={req.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/60 rounded-xl px-2.5 -mx-2.5 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {req.studentName || 'Student Candidate'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {req.studentEmail}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {formatDate(req.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        "{req.question}"
                      </p>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <Link to="/faculty/guidance">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1"
                          leftIcon={<Send className="w-3 h-3 text-blue-600" />}
                        >
                          Respond
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ================= 3C. RECENT ACTIVITY (PHASE 9) ================= */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card"
            data-purpose="recent-activity-section"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-heading">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-slate-500">
                    Latest interview schedules, evaluations, and student events
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-medium text-slate-400">
                Live Institutional Telemetry
              </span>
            </div>

            {/* Activity Stream */}
            <div className="mt-3 space-y-3">
              {appointments.length === 0 && pendingGuidance.length === 0 ? (
                <EmptyState
                  compact
                  title="No recent activity logged"
                  description="Activity will populate as interviews are completed and guidance questions answered."
                />
              ) : (
                <>
                  {/* Event 1: Recent appointment activity */}
                  {appointments.slice(0, 3).map((apt, idx) => (
                    <div
                      key={apt.id || idx}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          apt.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {apt.status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Calendar className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">
                            Mock Interview {apt.status === 'completed' ? 'Completed' : 'Scheduled'}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(apt.dateTime || apt.date)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Candidate:{' '}
                          <span className="font-medium text-slate-900">
                            {apt.student?.name || 'Assigned Student'}
                          </span>{' '}
                          {apt.time ? `at ${apt.time}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Event 2: Recent guidance inquiry */}
                  {pendingGuidance.slice(0, 2).map((guidance, idx) => (
                    <Link
                      key={`activity-g-${guidance.id || idx}`}
                      to={`/faculty/guidance/${guidance.id}`}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3 hover:bg-amber-50/50 hover:border-amber-200 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-200 transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                            Student Guidance Request Logged
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(guidance.date)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          Inquiry from <span className="font-medium text-slate-900">{guidance.studentName}</span>: "{guidance.question}"
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </section>
        </div>

        {/* ================= RIGHT RAIL AREA (4 COLS) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* ================= 4A. UPCOMING INTERVIEWS (PHASE 7) ================= */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3.5"
            data-purpose="upcoming-interviews-agenda"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Upcoming Interviews
                </h3>
              </div>
              <Link
                to="/faculty/interviews"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                All ({upcomingInterviews.length}) →
              </Link>
            </div>

            {/* Pending Requests Notice */}
            {pendingInterviews.length > 0 && (
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending Requests ({pendingInterviews.length})</span>
                  </span>
                  <Badge variant="warning" size="xs">
                    Action Needed
                  </Badge>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  <strong>{pendingInterviews[0].student?.name || 'Student Candidate'}</strong> requested mock screen for {formatDate(pendingInterviews[0].dateTime || pendingInterviews[0].date)} at {pendingInterviews[0].time}.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <Link
                    to={`/faculty/interviews/${pendingInterviews[0].id}`}
                    className="flex-1 text-center py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Review & Accept Request
                  </Link>
                </div>
              </div>
            )}

            {upcomingInterviews.length === 0 ? (
              <EmptyState
                compact
                title="No upcoming interviews"
                description="You have no mock interview sessions scheduled right now."
              />
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.slice(0, 3).map((interview) => (
                  <div
                    key={interview.id}
                    className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-900 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        {interview.time || 'Scheduled Slot'}
                      </span>
                      <Badge variant="info" size="sm">
                        {interview.status || 'Confirmed'}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Mock Technical Screen
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Candidate:{' '}
                        <strong className="text-slate-800 font-semibold">
                          {interview.student?.name || 'Student Candidate'}
                        </strong>
                      </p>
                      {interview.student?.email && (
                        <p className="text-[10px] text-slate-400 truncate">
                          {interview.student.email}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                      {interview.meetLink ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">Virtual Meet Integration</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Department Seminar Lab 3</span>
                        </>
                      )}
                    </div>

                    <div className="pt-2 border-t border-blue-100 flex items-center gap-2">
                      <Link
                        to={interview.id ? `/faculty/interviews/${interview.id}` : "/faculty/interviews"}
                        className="flex-1 text-center py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        Start / Evaluate
                      </Link>
                      {interview.meetLink ? (
                        <a
                          href={interview.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 shrink-0"
                          title="Join Google Meet"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Meet</span>
                        </a>
                      ) : (
                        <Link
                          to={interview.id ? `/faculty/interviews/${interview.id}` : "/faculty/interviews"}
                          className="flex-1 text-center py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ================= 4B. QUICK ACTIONS (PHASE 10) ================= */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3.5"
            data-purpose="quick-actions-card"
          >
            <div className="border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Quick Actions
              </h3>
              <p className="text-[11px] text-slate-400">
                Frequently used faculty shortcuts
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/faculty/guidance"
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      Review Guidance Requests
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {pendingGuidance.length} unread student inquiries
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                to="/faculty/interviews"
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      View Upcoming Interviews
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {upcomingInterviews.length} scheduled mock sessions
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                to="/faculty/interviews"
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      Evaluate Student
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Submit 10-point skill rubrics
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                to="/faculty/analytics"
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                      <span>Open Analytics</span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">
                        HOD
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Department placement telemetry
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            </div>
          </section>

          {/* ================= 4C. COHORT PLACEMENT BENCHMARK CARD ================= */}
          <section
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3"
            data-purpose="cohort-benchmark-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Department Cohort Index
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Class of 2026
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {avgCohortScore}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Readiness Score
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgCohortScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
              <span>{cohortStudents.length} Active Mentees Analyzed</span>
              <span className="text-blue-700 font-semibold">Tier-1 Day 1</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

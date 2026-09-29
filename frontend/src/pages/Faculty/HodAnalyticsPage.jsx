import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Award,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileCheck,
  Target,
  Send,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Info,
  X,
  PlusCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import analyticsApi from '../../services/analyticsApi';
import facultyService from '../../services/facultyService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import RadialGauge from '../../components/common/RadialGauge';

// ─── Classification Helper ──────────────────────────────────────────
const getReadinessTier = (score) => {
  if (typeof score !== 'number' || isNaN(score)) return { label: 'Unranked', variant: 'neutral', color: 'slate' };
  if (score >= 80) return { label: 'Placement Ready', variant: 'success', color: 'emerald' };
  if (score >= 60) return { label: 'Nearly Ready', variant: 'primary', color: 'blue' };
  if (score >= 40) return { label: 'Developing', variant: 'warning', color: 'amber' };
  return { label: 'Needs Attention', variant: 'danger', color: 'rose' };
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'TBD';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const HodAnalyticsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── Profile & Authorization State ────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [isHOD, setIsHOD] = useState(false);

  // ─── Analytics Datasets ────────────────────────────────────────────
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [skillGapsData, setSkillGapsData] = useState([]);
  const [totalStudentsWithActionPlans, setTotalStudentsWithActionPlans] = useState(0);
  const [placementStats, setPlacementStats] = useState(null);
  const [careerDistribution, setCareerDistribution] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardMeta, setLeaderboardMeta] = useState({ totalItems: 0, page: 1, totalPages: 1 });
  const [departmentEvents, setDepartmentEvents] = useState([]);

  // ─── Loading & Error States ───────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [sectionErrors, setSectionErrors] = useState({});

  // ─── Filter States ────────────────────────────────────────────────
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedCareer, setSelectedCareer] = useState('ALL');
  const [studentSearch, setStudentSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Modal States ─────────────────────────────────────────────────
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [studentProgressData, setStudentProgressData] = useState(null);
  const [studentReadinessData, setStudentReadinessData] = useState(null);

  // Schedule Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTargetSkill, setEventTargetSkill] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [eventSuccessMessage, setEventSuccessMessage] = useState(null);
  const [eventErrorMessage, setEventErrorMessage] = useState(null);

  // ─── 1. Access Check & Profile Fetching ───────────────────────────
  const verifyAccessAndLoadData = useCallback(async (isSilentRefresh = false) => {
    if (isSilentRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      setGlobalError(null);
    }

    try {
      // Step A: Load faculty profile to verify HOD permission
      const profRes = await facultyService.getProfile();
      setFacultyProfile(profRes);

      const hasHODPrivilege =
        user?.role === 'admin' ||
        Boolean(profRes?.profile?.isHOD);

      setIsHOD(hasHODPrivilege);
      setProfileLoading(false);

      if (!hasHODPrivilege) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Step B: Load all Department Analytics endpoints in parallel using Promise.allSettled
      const [
        analyticsSettled,
        skillGapsSettled,
        placementSettled,
        careerSettled,
        leaderboardSettled,
        eventsSettled,
      ] = await Promise.allSettled([
        analyticsApi.getDepartmentAnalytics(),
        analyticsApi.getSkillGaps(),
        analyticsApi.getPlacementStats(),
        analyticsApi.getCareerDistribution(),
        analyticsApi.getLeaderboard(currentPage, 50),
        analyticsApi.getEvents(),
      ]);

      const errors = {};

      // 1. Department Overview Analytics
      if (analyticsSettled.status === 'fulfilled' && analyticsSettled.value?.success) {
        setAnalyticsOverview(analyticsSettled.value.analytics);
      } else {
        errors.overview = analyticsSettled.reason?.response?.data?.message || 'Department overview unavailable';
      }

      // 2. Skill Gaps
      if (skillGapsSettled.status === 'fulfilled' && skillGapsSettled.value?.success) {
        setSkillGapsData(skillGapsSettled.value.skillGaps || []);
        setTotalStudentsWithActionPlans(skillGapsSettled.value.totalStudentsWithActionPlans || 0);
      } else {
        errors.skillGaps = skillGapsSettled.reason?.response?.data?.message || 'Skill gap analytics unavailable';
      }

      // 3. Placement Stats & Score Distribution
      if (placementSettled.status === 'fulfilled' && placementSettled.value?.success) {
        setPlacementStats(placementSettled.value.stats);
      } else {
        errors.placement = placementSettled.reason?.response?.data?.message || 'Placement stats unavailable';
      }

      // 4. Career Distribution
      if (careerSettled.status === 'fulfilled' && careerSettled.value?.success) {
        setCareerDistribution(careerSettled.value.distribution || []);
      } else {
        errors.career = careerSettled.reason?.response?.data?.message || 'Career distribution unavailable';
      }

      // 5. Cohort Leaderboard / Roster
      if (leaderboardSettled.status === 'fulfilled' && leaderboardSettled.value?.success) {
        setLeaderboard(leaderboardSettled.value.leaderboard || []);
        setLeaderboardMeta({
          totalItems: leaderboardSettled.value.totalItems || 0,
          page: leaderboardSettled.value.page || 1,
          totalPages: leaderboardSettled.value.totalPages || 1,
        });
      } else {
        errors.leaderboard = leaderboardSettled.reason?.response?.data?.message || 'Student cohort roster unavailable';
      }

      // 6. Department Events
      if (eventsSettled.status === 'fulfilled' && eventsSettled.value?.success) {
        setDepartmentEvents(eventsSettled.value.events || []);
      } else {
        errors.events = eventsSettled.reason?.response?.data?.message || 'Department events unavailable';
      }

      setSectionErrors(errors);
    } catch (err) {
      console.error('Failed to initialize HOD Analytics:', err);
      setGlobalError(err?.response?.data?.message || err?.message || 'Unable to connect to Department Analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.role, currentPage]);

  useEffect(() => {
    verifyAccessAndLoadData();
  }, [verifyAccessAndLoadData]);

  // ─── 2. Fetch Individual Student Details for Modal ─────────────────
  const handleOpenStudentDetail = async (student) => {
    setSelectedStudent(student);
    setStudentDetailLoading(true);
    setStudentProgressData(null);
    setStudentReadinessData(null);

    try {
      const [progRes, readRes] = await Promise.allSettled([
        analyticsApi.getStudentProgress(student.studentId),
        analyticsApi.getStudentReadiness(student.studentId),
      ]);

      if (progRes.status === 'fulfilled' && progRes.value?.success) {
        setStudentProgressData(progRes.value.dashboard);
      }
      if (readRes.status === 'fulfilled' && readRes.value?.success) {
        setStudentReadinessData(readRes.value.data);
      }
    } catch (err) {
      console.warn('Error loading student deep-dive details:', err);
    } finally {
      setStudentDetailLoading(false);
    }
  };

  // ─── 3. Schedule Department Event Handler ──────────────────────────
  const handleOpenScheduleModal = (targetSkill = '') => {
    setEventTargetSkill(targetSkill);
    setEventTitle(targetSkill ? `Department Workshop: Mastering ${targetSkill}` : 'Department Skill Remediation Workshop');
    setEventDate('');
    setEventDescription(targetSkill ? `Intensive technical session addressing validated cohort skill gaps in ${targetSkill}.` : '');
    setEventErrorMessage(null);
    setEventSuccessMessage(null);
    setIsEventModalOpen(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!facultyProfile?.user?.id && !user?.id) {
      setEventErrorMessage('Unable to determine HOD faculty identity.');
      return;
    }

    setIsSubmittingEvent(true);
    setEventErrorMessage(null);
    setEventSuccessMessage(null);

    try {
      const hodUserId = facultyProfile?.user?.id || user?.id;
      const res = await analyticsApi.createEvent({
        hodId: hodUserId,
        title: eventTitle,
        targetSkill: eventTargetSkill,
        date: eventDate,
        description: eventDescription,
      });

      if (res?.success) {
        setEventSuccessMessage('Department improvement event successfully scheduled and announced.');
        // Refresh events list
        const refreshedEvents = await analyticsApi.getEvents();
        if (refreshedEvents?.success) {
          setDepartmentEvents(refreshedEvents.events || []);
        }
        setTimeout(() => {
          setIsEventModalOpen(false);
        }, 1500);
      } else {
        setEventErrorMessage(res?.message || 'Failed to schedule event');
      }
    } catch (err) {
      setEventErrorMessage(err?.response?.data?.message || err?.message || 'Server error while scheduling event');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // ─── 4. Filtered Cohort Computations ──────────────────────────────
  const filteredStudents = useMemo(() => {
    return leaderboard.filter((student) => {
      // Semester filter
      if (selectedSemester !== 'ALL' && String(student.semester) !== String(selectedSemester)) {
        return false;
      }
      // Career track filter
      if (selectedCareer !== 'ALL' && student.selectedCareer !== selectedCareer) {
        return false;
      }
      // Tier filter
      if (tierFilter !== 'ALL') {
        const score = student.readinessScore || 0;
        if (tierFilter === 'READY' && score < 80) return false;
        if (tierFilter === 'NEARLY' && (score < 60 || score >= 80)) return false;
        if (tierFilter === 'ATTENTION' && score >= 60) return false;
      }
      // Search filter
      if (studentSearch.trim()) {
        const query = studentSearch.toLowerCase();
        const nameMatch = student.studentName?.toLowerCase().includes(query);
        const emailMatch = student.email?.toLowerCase().includes(query);
        const careerMatch = student.selectedCareer?.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !careerMatch) return false;
      }
      return true;
    });
  }, [leaderboard, selectedSemester, selectedCareer, tierFilter, studentSearch]);

  // Students requiring attention (Score < 60%) from real backend data
  const attentionStudents = useMemo(() => {
    return leaderboard
      .filter((s) => typeof s.readinessScore === 'number' && s.readinessScore < 60)
      .filter((s) => selectedSemester === 'ALL' || String(s.semester) === String(selectedSemester))
      .sort((a, b) => (a.readinessScore || 0) - (b.readinessScore || 0));
  }, [leaderboard, selectedSemester]);

  // Extract distinct career tracks for filter
  const careerOptions = useMemo(() => {
    const fromDistribution = careerDistribution.map((c) => c.career).filter(Boolean);
    const fromLeaderboard = leaderboard.map((s) => s.selectedCareer).filter(Boolean);
    return Array.from(new Set([...fromDistribution, ...fromLeaderboard]));
  }, [careerDistribution, leaderboard]);

  // ─── 5. Department Metadata & Header ───────────────────────────────
  const departmentName = facultyProfile?.profile?.department || 'Computer Science & Engineering';
  const facultyName = facultyProfile?.user?.name || user?.name || 'Prof. Neha Sharma';

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: NON-HOD RESTRICTED STATE (Phase 2 & 19)
  // ═══════════════════════════════════════════════════════════════════
  if (!profileLoading && !isHOD && user?.role !== 'admin') {
    return (
      <div className="space-y-6 antialiased max-w-5xl mx-auto py-8">
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-card p-8 sm:p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-800 border border-amber-200 mb-3 font-mono">
            <span>HTTP 403 • HOD AUTHORIZATION REQUIRED</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
            Department Analytics Center Restricted
          </h2>

          <p className="text-sm text-slate-600 max-w-lg mt-3 leading-relaxed">
            Access to institutional department metrics, skill gap analytics, and cross-cohort placement telemetry is reserved for <strong className="text-slate-900 font-medium">Department Heads (isHOD: true)</strong> and authorized Academic Administrators.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 w-full max-w-md">
            <div className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">
              Active User Credentials
            </div>
            <div className="text-slate-900 font-semibold">{facultyName}</div>
            <div className="text-slate-500">{user?.email} • {departmentName}</div>
            <div className="pt-2 text-slate-400 text-[11px]">
              If you have recently been assigned Head of Department responsibilities, please ask your platform administrator to enable <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800">isHOD: true</code> in your Faculty Profile.
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <Button
              variant="primary"
              onClick={() => navigate('/faculty/dashboard')}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Return to Faculty Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => verifyAccessAndLoadData()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Recheck Authorization
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: GLOBAL ERROR STATE (Phase 16)
  // ═══════════════════════════════════════════════════════════════════
  if (globalError) {
    return (
      <div className="space-y-6 antialiased max-w-7xl mx-auto py-6">
        <ErrorState
          title="Failed to Load Department Analytics"
          message={globalError}
          onRetry={() => verifyAccessAndLoadData()}
          retryText="Reconnect to Analytics API"
        />
      </div>
    );
  }

  return (
    <div className="space-y-7 antialiased pb-12">
      {/* ================= 1. ANALYTICS HEADER / HERO BANNER (Phase 4) ================= */}
      <section
        className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-7 shadow-lg overflow-hidden border border-slate-800"
        data-purpose="hod-analytics-header"
      >
        {/* Ambient Blur Accents */}
        <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-52 h-52 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/10 backdrop-blur-md text-blue-200 border border-white/20 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                Verified Department Telemetry
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-blue-200 font-semibold">{departmentName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                HOD Console
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-heading">
              HOD Department Analytics Center
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Department-wide placement readiness, empirical skill gap telemetry from student action plans, interview scoring benchmarks, and targeted academic interventions.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => verifyAccessAndLoadData(true)}
              disabled={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30 text-xs backdrop-blur-xs"
            >
              {isRefreshing ? 'Updating...' : 'Sync Telemetry'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenScheduleModal()}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs"
            >
              + Schedule Skill Event
            </Button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-400" /> Filter Department Cohort:
            </span>

            {/* Semester Filter */}
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                <option value="ALL" className="text-slate-900 bg-white">All Semesters</option>
                <option value="3" className="text-slate-900 bg-white">Semester 3</option>
                <option value="4" className="text-slate-900 bg-white">Semester 4</option>
                <option value="5" className="text-slate-900 bg-white">Semester 5</option>
                <option value="6" className="text-slate-900 bg-white">Semester 6</option>
                <option value="7" className="text-slate-900 bg-white">Semester 7</option>
                <option value="8" className="text-slate-900 bg-white">Semester 8</option>
              </select>
            </div>

            {/* Career Track Filter */}
            {careerOptions.length > 0 && (
              <div className="relative">
                <select
                  value={selectedCareer}
                  onChange={(e) => setSelectedCareer(e.target.value)}
                  className="bg-white/10 text-white border border-white/20 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer max-w-xs truncate"
                >
                  <option value="ALL" className="text-slate-900 bg-white">All Career Paths</option>
                  {careerOptions.map((career) => (
                    <option key={career} value={career} className="text-slate-900 bg-white">
                      {career}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-300 font-mono">
            Reporting: <span className="text-white font-semibold">{filteredStudents.length}</span> students active in current filter
          </div>
        </div>
      </section>

      {/* ================= 2. TOP SUMMARY METRICS (Phase 5) ================= */}
      <section data-purpose="department-top-metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Students */}
          <StatCard
            title="Total Department Students"
            value={isLoading ? <Skeleton className="h-8 w-16" /> : (placementStats?.totalStudents || analyticsOverview?.students?.totalStudents || leaderboard.length || 0)}
            subtitle={
              isLoading ? (
                <Skeleton className="h-3 w-32" />
              ) : (
                `${placementStats?.studentsWithCareer || 0} mapped to career tracks`
              )
            }
            badgeText={selectedSemester === 'ALL' ? 'All Batches' : `Sem ${selectedSemester}`}
            badgeVariant="neutral"
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50 border-blue-100"
          />

          {/* Card 2: Average Readiness Score */}
          <StatCard
            title="Avg Placement Readiness"
            value={
              isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${placementStats?.averageReadinessScore || analyticsOverview?.students?.averageReadinessScore || 0}%`
              )
            }
            subtitle={
              isLoading ? (
                <Skeleton className="h-3 w-36" />
              ) : (
                getReadinessTier(placementStats?.averageReadinessScore || analyticsOverview?.students?.averageReadinessScore).label
              )
            }
            badgeText={
              (placementStats?.averageReadinessScore || analyticsOverview?.students?.averageReadinessScore || 0) >= 70
                ? 'On Track'
                : 'Attention Needed'
            }
            badgeVariant={
              (placementStats?.averageReadinessScore || analyticsOverview?.students?.averageReadinessScore || 0) >= 70
                ? 'success'
                : 'warning'
            }
            icon={Award}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50 border-emerald-100"
          />

          {/* Card 3: Department Skill Gaps */}
          <StatCard
            title="Identified Skill Gaps"
            value={isLoading ? <Skeleton className="h-8 w-16" /> : skillGapsData.length}
            subtitle={
              isLoading ? (
                <Skeleton className="h-3 w-36" />
              ) : (
                `From ${totalStudentsWithActionPlans} verified action plans`
              )
            }
            badgeText={skillGapsData.length > 0 ? `${skillGapsData[0]?.skill || 'Top Gap'}` : 'None'}
            badgeVariant="danger"
            icon={TrendingDown}
            iconColor="text-rose-600"
            iconBg="bg-rose-50 border-rose-100"
          />

          {/* Card 4: Mock Interviews & Evaluations */}
          <StatCard
            title="Interview Evaluations"
            value={
              isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${analyticsOverview?.interviews?.completedInterviews || 0} / ${analyticsOverview?.interviews?.totalInterviews || 0}`
              )
            }
            subtitle={
              isLoading ? (
                <Skeleton className="h-3 w-36" />
              ) : (
                `Avg Rubric: ${analyticsOverview?.interviews?.averageScores?.overall || 0} / 10 Scale`
              )
            }
            badgeText="0–10 Scale"
            badgeVariant="primary"
            icon={FileCheck}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50 border-indigo-100"
          />
        </div>
      </section>

      {/* ================= 3. READINESS OVERVIEW & SCORE DISTRIBUTION (Phase 6) ================= */}
      <section data-purpose="department-readiness-overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Department Placement Readiness Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical readiness score distribution based on verified goals (30%), mock evaluations (40%), and feedback (30%).
            </p>
          </div>
          {placementStats && (
            <div className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Total Evaluated: <span className="font-bold text-slate-800">{placementStats.totalStudents}</span>
            </div>
          )}
        </div>

        {placementStats?.scoreDistribution ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Segmented Distribution Bar & Tiers (8 cols) */}
            <Card className="lg:col-span-8 p-5 space-y-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Cohort Distribution by Performance Tier</span>
                <span className="font-mono text-slate-500">Benchmark Scale (0–100%)</span>
              </div>

              {/* Horizontal Multi-Segment Bar */}
              <div className="w-full h-5 rounded-full overflow-hidden bg-slate-100 flex p-0.5 border border-slate-200">
                {/* Excellent */}
                <div
                  style={{ width: `${Math.max(placementStats.scoreDistribution.excellent.percentage, 2)}%` }}
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-500 relative group cursor-pointer"
                  title={`Excellent (80-100%): ${placementStats.scoreDistribution.excellent.count} students (${placementStats.scoreDistribution.excellent.percentage}%)`}
                />
                {/* Good */}
                <div
                  style={{ width: `${Math.max(placementStats.scoreDistribution.good.percentage, 2)}%` }}
                  className="bg-blue-600 h-full transition-all duration-500 relative group cursor-pointer"
                  title={`Good (60-79%): ${placementStats.scoreDistribution.good.count} students (${placementStats.scoreDistribution.good.percentage}%)`}
                />
                {/* Average */}
                <div
                  style={{ width: `${Math.max(placementStats.scoreDistribution.average.percentage, 2)}%` }}
                  className="bg-amber-500 h-full transition-all duration-500 relative group cursor-pointer"
                  title={`Average (40-59%): ${placementStats.scoreDistribution.average.count} students (${placementStats.scoreDistribution.average.percentage}%)`}
                />
                {/* Needs Improvement */}
                <div
                  style={{ width: `${Math.max(placementStats.scoreDistribution.needsImprovement.percentage, 2)}%` }}
                  className="bg-rose-500 h-full rounded-r-full transition-all duration-500 relative group cursor-pointer"
                  title={`Needs Improvement (0-39%): ${placementStats.scoreDistribution.needsImprovement.count} students (${placementStats.scoreDistribution.needsImprovement.percentage}%)`}
                />
              </div>

              {/* 4 Tier Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {/* Excellent */}
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800">Placement Ready</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-bold font-mono text-emerald-900">
                      {placementStats.scoreDistribution.excellent.count}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      {placementStats.scoreDistribution.excellent.percentage}% of cohort • 80-100%
                    </div>
                  </div>
                </div>

                {/* Good */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-800">Nearly Ready</span>
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-bold font-mono text-blue-900">
                      {placementStats.scoreDistribution.good.count}
                    </div>
                    <div className="text-[10px] text-blue-700 font-medium">
                      {placementStats.scoreDistribution.good.percentage}% of cohort • 60-79%
                    </div>
                  </div>
                </div>

                {/* Average */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-800">Developing</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-bold font-mono text-amber-900">
                      {placementStats.scoreDistribution.average.count}
                    </div>
                    <div className="text-[10px] text-amber-700 font-medium">
                      {placementStats.scoreDistribution.average.percentage}% of cohort • 40-59%
                    </div>
                  </div>
                </div>

                {/* Needs Improvement */}
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-800">Needs Attention</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-bold font-mono text-rose-900">
                      {placementStats.scoreDistribution.needsImprovement.count}
                    </div>
                    <div className="text-[10px] text-rose-700 font-medium">
                      {placementStats.scoreDistribution.needsImprovement.percentage}% of cohort • 0-39%
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Career Track Distribution (4 cols) */}
            <Card className="lg:col-span-4 p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Career Tracks Active
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {placementStats.studentsWithCareer} Students
                  </span>
                </div>

                <div className="space-y-3 custom-scrollbar max-h-48 overflow-y-auto pr-1">
                  {careerDistribution.length > 0 ? (
                    careerDistribution.map((item) => (
                      <div key={item.career} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={item.career}>
                            {item.career}
                          </span>
                          <span className="font-mono text-slate-600 font-semibold text-[11px]">
                            {item.count} std ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-grip-blue h-full rounded-full"
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
                    <div className="text-xs text-slate-400 py-4 text-center">
                      No career track distribution recorded.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Unassigned Students:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {placementStats.totalStudents - placementStats.studentsWithCareer}
                </span>
              </div>
            </Card>
          </div>
        ) : (
          <EmptyState
            compact
            title="Readiness Distribution Data Pending"
            description="Placement statistics will populate as students complete goals and mock interview evaluations."
          />
        )}
      </section>

      {/* ================= 4. SKILL GAP ANALYSIS & INTERVENTIONS (Phase 7) ================= */}
      <section data-purpose="department-skill-gaps" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              Department Skill Gap Analysis & Interventions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical weak skills ranked from {totalStudentsWithActionPlans} validated student action plans across the department.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenScheduleModal()}
            leftIcon={<Calendar className="w-3.5 h-3.5 text-blue-600" />}
            className="text-xs self-start sm:self-auto"
          >
            Schedule Remediation Workshop
          </Button>
        </div>

        {skillGapsData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Horizontal Ranked Gap Bars (8 cols) */}
            <Card className="lg:col-span-8 p-5 space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Top Missing Competencies (Cohort Action Plans)</span>
                <span className="text-slate-400 font-normal">Ranked by frequency</span>
              </div>

              <div className="space-y-3.5 pt-1">
                {skillGapsData.slice(0, 7).map((gap, index) => {
                  const severityColor =
                    index === 0 ? 'bg-rose-500' : index < 3 ? 'bg-amber-500' : 'bg-blue-500';

                  return (
                    <div key={gap.skill} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {gap.skill}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {gap.count} <span className="text-[10px] font-normal text-slate-400">plans</span>
                          </span>
                          <Badge variant={index === 0 ? 'danger' : 'neutral'} size="sm" className="font-mono">
                            {gap.percentage}%
                          </Badge>
                          <button
                            type="button"
                            onClick={() => handleOpenScheduleModal(gap.skill)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Target</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${severityColor}`}
                          style={{ width: `${Math.max(gap.percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Capability Notice Note */}
              <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-blue-800">
                  <strong>Department Telemetry Grounding:</strong> Skill gaps are aggregated directly from active <code className="bg-blue-100/70 px-1 py-0.5 rounded text-blue-900 font-mono text-[10px]">Action_Plans</code> generated during interview evaluations and roadmap milestones.
                </p>
              </div>
            </Card>

            {/* Scheduled Department Events / Remediation Actions (4 cols) */}
            <Card className="lg:col-span-4 p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Scheduled Remediation
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {departmentEvents.length} Events
                  </span>
                </div>

                <div className="space-y-3 custom-scrollbar max-h-72 overflow-y-auto pr-1">
                  {departmentEvents.length > 0 ? (
                    departmentEvents.map((evt) => (
                      <div
                        key={evt._id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-900 line-clamp-1">
                            {evt.title}
                          </span>
                          {evt.targetSkill && (
                            <Badge variant="primary" size="sm" className="shrink-0 text-[10px]">
                              {evt.targetSkill}
                            </Badge>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(evt.date)}</span>
                        </div>

                        {evt.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                      <p>No intervention workshops scheduled yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenScheduleModal(skillGapsData[0]?.skill || '')}
                        className="text-[11px] mx-auto"
                      >
                        Schedule First Workshop
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Interventions target department gaps identified in faculty evaluations.
              </div>
            </Card>
          </div>
        ) : (
          <EmptyState
            compact
            title="No Skill Gaps Registered"
            description="As faculty submit mock interview evaluations with action plans, recurring department skill gaps will automatically aggregate here."
          />
        )}
      </section>

      {/* ================= 5. STUDENTS REQUIRING ATTENTION (Phase 8) ================= */}
      <section data-purpose="department-attention-students" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Students Requiring Academic Attention
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified candidates with readiness scores below 60% or critical gaps requiring faculty mentor intervention.
            </p>
          </div>

          <div className="text-xs font-mono font-medium text-slate-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl self-start sm:self-auto">
            Flagged Count: <strong className="text-amber-900">{attentionStudents.length}</strong>
          </div>
        </div>

        {attentionStudents.length > 0 ? (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Career Track</th>
                    <th className="py-3 px-4 text-center">Readiness</th>
                    <th className="py-3 px-4">Diagnostic Status</th>
                    <th className="py-3 px-4 text-right">Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attentionStudents.slice(0, 6).map((student) => {
                    const tier = getReadinessTier(student.readinessScore);
                    return (
                      <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={student.studentName} size="sm" />
                            <div>
                              <div className="font-bold text-slate-900">{student.studentName}</div>
                              <div className="text-[11px] text-slate-400">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">
                          {student.semester ? `Semester ${student.semester}` : 'Unassigned'}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {student.selectedCareer || <span className="text-slate-400 italic">None selected</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-sm text-rose-600">
                            {student.readinessScore || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={tier.variant} size="sm">
                            {tier.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenStudentDetail(student)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            className="text-xs"
                          >
                            View Analysis
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {attentionStudents.length > 6 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
                Showing top 6 of {attentionStudents.length} students requiring intervention. See full department roster below.
              </div>
            )}
          </Card>
        ) : (
          <EmptyState
            compact
            title="All Cohort Candidates In Good Standing"
            description="Zero students currently hold readiness scores under 60% in the selected filter."
          />
        )}
      </section>

      {/* ================= 6. INTERVIEW PERFORMANCE & EVALUATIONS (Phase 9) ================= */}
      <section data-purpose="department-interview-analytics" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            Interview Rubric & Evaluation Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical rubric scores aggregated across all mock interview evaluations (scored on standardized 0–10 scale).
          </p>
        </div>

        {analyticsOverview?.interviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Technical Score */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">Technical Proficiency</span>
                <span className="font-mono font-semibold text-indigo-600">
                  {analyticsOverview.interviews.averageScores?.technical || 0} / 10
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((analyticsOverview.interviews.averageScores?.technical || 0) / 10) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Algorithmic problem solving, data structures, and architectural correctness.
              </p>
            </Card>

            {/* Communication Score */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">Communication & STAR</span>
                <span className="font-mono font-semibold text-blue-600">
                  {analyticsOverview.interviews.averageScores?.communication || 0} / 10
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((analyticsOverview.interviews.averageScores?.communication || 0) / 10) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Clarity of expression, structured thinking, and STAR answer presentation.
              </p>
            </Card>

            {/* Confidence Score */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">Executive Confidence</span>
                <span className="font-mono font-semibold text-purple-600">
                  {analyticsOverview.interviews.averageScores?.confidence || 0} / 10
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((analyticsOverview.interviews.averageScores?.confidence || 0) / 10) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Poise under stress, handle of unknown questions, and interview demeanor.
              </p>
            </Card>

            {/* Overall Aggregate Score */}
            <Card className="p-5 space-y-3 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border-indigo-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 uppercase tracking-wider">Overall Rubric Avg</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">
                  {analyticsOverview.interviews.averageScores?.overall || 0} / 10
                </span>
              </div>
              <div className="w-full bg-indigo-200/50 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((analyticsOverview.interviews.averageScores?.overall || 0) / 10) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-indigo-700 font-medium">
                <span>Completed: {analyticsOverview.interviews.completedInterviews}</span>
                <span>Total: {analyticsOverview.interviews.totalInterviews} sessions</span>
              </div>
            </Card>
          </div>
        ) : (
          <EmptyState
            compact
            title="Interview Analytics Not Available"
            description="Interview evaluation data will aggregate as faculty submit rubric evaluations."
          />
        )}
      </section>

      {/* ================= 7. GOAL PROGRESS & GUIDANCE ACTIVITY (Phase 10 & 11) ================= */}
      <section data-purpose="department-goals-and-guidance" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Goal Progress (Phase 10) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Department Goal Completion Telemetry
            </h3>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {analyticsOverview?.goals?.completionRate || 0}% Completion
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Aggregate student execution of weekly academic and technical goals across all active cohorts.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Completed Weekly Goals vs Total Logged</span>
                <span className="font-mono">
                  {analyticsOverview?.goals?.completedGoals || 0} / {analyticsOverview?.goals?.totalGoals || 0}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(analyticsOverview?.goals?.completionRate || 0, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Logged Goals
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                  {analyticsOverview?.goals?.totalGoals || 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Successfully Completed
                </div>
                <div className="text-lg font-bold font-mono text-emerald-600 mt-1">
                  {analyticsOverview?.goals?.completedGoals || 0}
                </div>
              </div>
            </div>

            {/* Missing capability documentation alert */}
            <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                <strong>Note on Backend Capability:</strong> Historical semester-by-semester goal trend breakdowns are aggregated at the department level by the current database schema.
              </span>
            </div>
          </div>
        </Card>

        {/* Mentorship & Guidance Analytics (Phase 11) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              Guidance & Mentorship Telemetry
            </h3>
            <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {analyticsOverview?.guidance?.responseRate || 0}% Response Rate
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Faculty and alumni engagement responsiveness across student technical and career guidance requests.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Inquiries Answered with At Least 1 Reply</span>
                <span className="font-mono">{analyticsOverview?.guidance?.responseRate || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(analyticsOverview?.guidance?.responseRate || 0, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Inquiries Logged
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                  {analyticsOverview?.guidance?.totalRequests || 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Faculty / Mentor Replies
                </div>
                <div className="text-lg font-bold font-mono text-blue-600 mt-1">
                  {analyticsOverview?.guidance?.totalReplies || 0}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 flex items-center justify-between">
              <span>Need to review active inquiries?</span>
              <Link to="/faculty/guidance" className="font-semibold underline flex items-center gap-1">
                Open Guidance Inbox <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* ================= 8. DETAILED STUDENT COHORT DIRECTORY (Phase 4 & 8) ================= */}
      <section data-purpose="department-student-directory" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Department Student Cohort Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified placement readiness ranking and individual diagnostic profiles across the entire department.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search candidate name, email, career..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 sm:w-64"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Readiness Tiers</option>
              <option value="READY">Placement Ready (≥80%)</option>
              <option value="NEARLY">Nearly Ready (60–79%)</option>
              <option value="ATTENTION">Needs Attention (&lt;60%)</option>
            </select>
          </div>
        </div>

        <Card className="overflow-hidden p-0 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Selected Career Track</th>
                  <th className="py-3 px-4 text-center">Readiness Score</th>
                  <th className="py-3 px-4 text-center">Classification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const tier = getReadinessTier(student.readinessScore);
                    return (
                      <tr key={student.studentId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                          #{student.rank}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={student.studentName} size="sm" />
                            <div>
                              <div className="font-bold text-slate-900">{student.studentName}</div>
                              <div className="text-[11px] text-slate-400">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">
                          {student.semester ? `Semester ${student.semester}` : 'Unassigned'}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {student.selectedCareer || <span className="text-slate-400 italic">None selected</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-mono font-bold text-sm ${student.readinessScore >= 80 ? 'text-emerald-600' : student.readinessScore >= 60 ? 'text-blue-600' : 'text-rose-600'}`}>
                            {student.readinessScore || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={tier.variant} size="sm">
                            {tier.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenStudentDetail(student)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            className="text-xs"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                      No candidates match your current search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Directory Footer with Pagination */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{filteredStudents.length}</span> of <span className="font-semibold text-slate-800">{leaderboardMeta.totalItems || leaderboard.length}</span> department candidates
            </div>

            {leaderboardMeta.totalPages > 1 && (
              <div className="flex items-center gap-2 self-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="font-mono text-xs">
                  Page {currentPage} of {leaderboardMeta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= leaderboardMeta.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2 py-1 text-xs"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* ================= 9. STUDENT DETAIL INSPECTION MODAL ================= */}
      {selectedStudent && (
        <Modal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title={`Academic Diagnostic Profile: ${selectedStudent.studentName}`}
          description={`${selectedStudent.email} • Semester ${selectedStudent.semester || 'N/A'} • ${selectedStudent.selectedCareer || 'No Career Track Selected'}`}
          size="lg"
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedStudent(null)}>
              Close Diagnostic
            </Button>
          }
        >
          {studentDetailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="space-y-5 text-xs text-slate-700">
              {/* Readiness Formula Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Placement Readiness Score</span>
                  <Badge variant={getReadinessTier(selectedStudent.readinessScore).variant} size="md" className="font-mono">
                    {selectedStudent.readinessScore || 0}% Overall
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-500">
                  Readiness Score Formula: <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800 font-mono">Goal Score (30%) + Mock Interview (40%) + Recruiter Feedback (30%)</code>
                </div>

                {studentReadinessData?.breakdown ? (
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Goal Score (30%)</div>
                      <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                        {studentReadinessData.breakdown.goalScore ?? 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Interview Score (40%)</div>
                      <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                        {studentReadinessData.breakdown.interviewScore ?? 'N/A'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Feedback Score (30%)</div>
                      <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                        {studentReadinessData.breakdown.feedbackScore ?? 'N/A'}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Progress Summary if Available */}
              {studentProgressData && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Recent Goal Completion & Sprints
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Total Goals Logged</div>
                      <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                        {studentProgressData.goals?.totalGoals || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Completed Goals</div>
                      <div className="text-lg font-bold font-mono text-emerald-600 mt-0.5">
                        {studentProgressData.goals?.completedGoals || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  HOD Direct Mentorship Link:
                </span>
                <Link
                  to={`/faculty/guidance?studentId=${selectedStudent.studentId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Initiate Guidance Note
                </Link>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ================= 10. SCHEDULE IMPROVEMENT EVENT MODAL ================= */}
      {isEventModalOpen && (
        <Modal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          title="Schedule Department Skill Remediation Workshop"
          description="Create a targeted intervention session for students struggling with verified department skill gaps."
          size="md"
        >
          <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
            {eventSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{eventSuccessMessage}</span>
              </div>
            )}

            {eventErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{eventErrorMessage}</span>
              </div>
            )}

            {/* Target Skill Input */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Target Skill / Competency <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={eventTargetSkill}
                onChange={(e) => setEventTargetSkill(e.target.value)}
                placeholder="e.g. System Design, Docker, Kafka, Data Structures"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">
                Prefilled from department action plan gaps.
              </span>
            </div>

            {/* Title Input */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Workshop Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Masterclass: Scalable Distributed Systems"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Input */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Scheduled Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Description & Agenda
              </label>
              <textarea
                rows="3"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Session objectives, prerequisite reading, and target student cohort..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEventModalOpen(false)}
                disabled={isSubmittingEvent}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmittingEvent}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                {isSubmittingEvent ? 'Publishing...' : 'Publish Department Event'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default HodAnalyticsPage;

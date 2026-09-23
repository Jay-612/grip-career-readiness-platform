import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  User,
  Plus,
  RefreshCw,
  Sparkles,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  Filter,
  BarChart3,
  Building2,
  GraduationCap,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import interviewService from '../../services/interviewService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';

export const InterviewCenterPage = () => {
  const { user } = useAuth();

  // Primary Data States
  const [interviews, setInterviews] = useState([]);
  const [interviewSummary, setInterviewSummary] = useState({
    total: 0,
    completed: 0,
    scheduled: 0,
    cancelled: 0,
    averageScores: {
      technical: 0,
      communication: 0,
      confidence: 0,
      overall: 0,
    },
  });
  const [readinessData, setReadinessData] = useState(null);
  const [facultyMentors, setFacultyMentors] = useState([]);

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filter & Search
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'completed' | 'scheduled' | 'evaluated'

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    facultyId: '',
    date: '',
    time: '14:00',
  });
  const [bookingErrors, setBookingErrors] = useState({});

  // Evaluation Details Modal State
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Helper: Format Time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Initial Data Fetching
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get student profile & resolved studentId
      const profileRes = await interviewService.getProfile();
      const resolvedStudentId = profileRes?.user?.id || user?.id;

      if (!resolvedStudentId) {
        throw new Error('Student identifier could not be verified.');
      }

      // 2. Fetch parallel endpoints: interviews, readiness, and mentors
      const [interviewsRes, readinessRes, mentorsRes] = await Promise.allSettled([
        interviewService.getInterviewAnalysis(resolvedStudentId),
        interviewService.getPlacementReadiness(resolvedStudentId),
        interviewService.getRecommendedMentors(),
      ]);

      if (interviewsRes.status === 'fulfilled' && interviewsRes.value?.interviews) {
        setInterviews(interviewsRes.value.interviews);
        if (interviewsRes.value.summary) {
          setInterviewSummary(interviewsRes.value.summary);
        }
      }

      if (readinessRes.status === 'fulfilled' && readinessRes.value) {
        setReadinessData(readinessRes.value);
      }

      if (mentorsRes.status === 'fulfilled' && Array.isArray(mentorsRes.value)) {
        // Filter mentors who are faculty members
        const faculties = mentorsRes.value.filter(
          (m) => m.role?.toLowerCase() === 'faculty'
        );
        setFacultyMentors(faculties);
      }
    } catch (err) {
      console.error('Failed to load interview center data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load interview records. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user?.id]);

  // Derived: Next Interview (nearest upcoming with status 'scheduled')
  const nextInterview = useMemo(() => {
    const scheduled = interviews.filter((i) => i.status === 'scheduled');
    if (scheduled.length === 0) return null;

    return [...scheduled].sort((a, b) => {
      const timeA = a.dateTime ? new Date(a.dateTime).getTime() : Infinity;
      const timeB = b.dateTime ? new Date(b.dateTime).getTime() : Infinity;
      return timeA - timeB;
    })[0];
  }, [interviews]);

  // Derived: Filtered Interview History
  const filteredHistory = useMemo(() => {
    let list = [...interviews];

    if (historyFilter === 'completed') {
      list = list.filter((i) => i.status === 'completed');
    } else if (historyFilter === 'scheduled') {
      list = list.filter((i) => i.status === 'scheduled');
    } else if (historyFilter === 'evaluated') {
      list = list.filter(
        (i) =>
          i.status === 'completed' &&
          i.scores &&
          i.scores.technical !== null &&
          i.scores.technical !== undefined
      );
    }

    return list.sort((a, b) => {
      const timeA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const timeB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [interviews, historyFilter]);

  // Open Booking Modal with optional preselected faculty
  const handleOpenBooking = (preselectedFacultyId = '') => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    // Pick first faculty mentor if none selected
    const initialFacultyId =
      preselectedFacultyId ||
      (facultyMentors.length > 0 && facultyMentors[0].id ? facultyMentors[0].id : '');

    setBookingFormData({
      facultyId: initialFacultyId,
      date: dateStr,
      time: '14:00',
    });
    setBookingErrors({});
    setIsBookingModalOpen(true);
  };

  // Validate Booking Form
  const validateBookingForm = () => {
    const errors = {};
    if (!bookingFormData.facultyId) {
      errors.facultyId = 'Please select a faculty interviewer.';
    }
    if (!bookingFormData.date) {
      errors.date = 'Interview date is required.';
    } else {
      const selected = new Date(bookingFormData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.date = 'Interview date must be today or in the future.';
      }
    }
    if (!bookingFormData.time) {
      errors.time = 'Preferred time slot is required.';
    }

    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Booking (Dispatches POST /api/appointments)
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!validateBookingForm()) return;

    setIsSubmittingBooking(true);
    setBookingErrors({});

    try {
      await interviewService.scheduleAppointment({
        date: bookingFormData.date,
        time: bookingFormData.time,
        facultyId: bookingFormData.facultyId,
      });

      setSuccessToast('Mock interview appointment confirmed successfully!');
      setTimeout(() => setSuccessToast(null), 4000);

      setIsBookingModalOpen(false);
      await fetchAllData();
    } catch (err) {
      console.error('Failed to book mock interview:', err);
      setBookingErrors({
        submit:
          err.response?.data?.message ||
          'Failed to schedule appointment. Please check availability and try again.',
      });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Open Evaluation Details Modal
  const handleOpenEvaluation = (interview) => {
    setSelectedEvaluation(interview);
    setIsEvaluationModalOpen(true);
  };

  // Render Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <Badge variant="success" size="sm" dot>
            Completed
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="info" size="sm" pulseDot>
            Confirmed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="danger" size="sm">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            {status || 'Unknown'}
          </Badge>
        );
    }
  };

  // Loading State View
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton variant="text" width="260px" height="28px" />
            <Skeleton variant="text" width="420px" height="16px" />
          </div>
          <Skeleton variant="rectangular" width="160px" height="40px" />
        </div>

        {/* Readiness Overview Skeleton */}
        <SkeletonCard />

        {/* Next Interview Skeleton */}
        <SkeletonCard />

        {/* History Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Error State View
  if (error && interviews.length === 0) {
    return (
      <ErrorState
        title="Unable to Load Interview Center"
        message={error}
        onRetry={fetchAllData}
        retryText="Retry Connection"
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Interview & Readiness Center
            </h1>
            <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
              Placement Diagnostics
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Book mock interviews, review feedback, and understand how your preparation is improving.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            title="Refresh interviews"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenBooking()}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm"
          >
            Book Mock Interview
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CONCISE READINESS OVERVIEW (Real Backend Formula)
      ───────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Placement Readiness Model</span>
                {readinessData?.targetTier && (
                  <Badge variant="tier1" size="xs">
                    {readinessData.targetTier}
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Algorithmic Rubric: Goal Velocity (30%) + Mock Interviews (40%) + Recruiter Reviews (30%)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium">Platform Readiness:</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
              {readinessData?.readinessScore !== undefined ? readinessData.readinessScore : 0}%
            </span>
          </div>
        </div>

        {/* 30-40-30 Metric Breakdown Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Goal Completion (30% weight) */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Goal Completion (30%)</span>
              <span className="font-bold text-slate-900 font-mono">
                {readinessData?.breakdown?.goalScore || 0}%
              </span>
            </div>
            <ProgressBar
              value={readinessData?.breakdown?.goalScore || 0}
              max={100}
              variant="primary"
              size="xs"
            />
            <span className="text-[11px] text-slate-400 block">
              {readinessData?.details?.completedGoals || 0} of{' '}
              {readinessData?.details?.totalGoals || 0} weekly goals fulfilled
            </span>
          </div>

          {/* Mock Interviews (40% weight - Highest Impact) */}
          <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-950 flex items-center gap-1">
                <span>Mock Interview Rubric (40%)</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                  Core
                </span>
              </span>
              <span className="font-bold text-blue-700 font-mono">
                {readinessData?.breakdown?.interviewScore || 0}%
              </span>
            </div>
            <ProgressBar
              value={readinessData?.breakdown?.interviewScore || 0}
              max={100}
              variant="success"
              size="xs"
            />
            <span className="text-[11px] text-blue-700 block">
              Avg Score: {readinessData?.details?.avgInterviewScore || 0} / 10 •{' '}
              {readinessData?.details?.completedInterviews || 0} completed
            </span>
          </div>

          {/* Recruiter Feedback (30% weight) */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Recruiter Reviews (30%)</span>
              <span className="font-bold text-slate-900 font-mono">
                {readinessData?.breakdown?.feedbackScore || 0}%
              </span>
            </div>
            <ProgressBar
              value={readinessData?.breakdown?.feedbackScore || 0}
              max={100}
              variant="warning"
              size="xs"
            />
            <span className="text-[11px] text-slate-400 block">
              {readinessData?.details?.recruiterFeedbackCount || 0} verified corporate evaluations
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-[11px] text-slate-400">
            Scores automatically refresh upon faculty evaluation submission.
          </span>
          <Link
            to="/student/profile"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View Complete Competency Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. NEXT INTERVIEW (Nearest Confirmed Scheduled Session)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Next Confirmed Interview
          </h2>
        </div>

        {nextInterview ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold tracking-wide uppercase">
                  Upcoming Session
                </span>
                <span className="text-xs text-slate-300">
                  {formatDate(nextInterview.dateTime)} at {formatTime(nextInterview.dateTime)}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                Faculty Technical Mock Screen
              </h3>

              <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-300" />
                  <span>Interviewer: <strong>{nextInterview.interviewerName}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-300" />
                  <span>45 Minutes Standard Rubric</span>
                </span>
              </div>
            </div>

            {/* Action Area */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
              {nextInterview.meetLink ? (
                <a
                  href={nextInterview.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="success"
                    size="md"
                    leftIcon={<Video className="w-4 h-4" />}
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    className="shadow-md"
                  >
                    Join Interview Room
                  </Button>
                </a>
              ) : (
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[11px] text-slate-200">
                  Meeting room link will appear prior to the slot.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">No Mock Interviews Scheduled</span>
                <span className="text-xs text-slate-500">
                  Book a session with a faculty evaluator to practice and increase your readiness score.
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenBooking()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Book Mock Interview
            </Button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. AVAILABLE FACULTY EVALUATORS & BOOKING SLOTS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Verified Department Evaluators
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            ({facultyMentors.length} evaluators available)
          </span>
        </div>

        {facultyMentors.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No faculty evaluators currently listed for bookings.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyMentors.map((faculty, idx) => (
              <div
                key={faculty.id || idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-150 flex flex-col justify-between gap-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {faculty.name ? faculty.name.charAt(0).toUpperCase() : 'F'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                        {faculty.name}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{faculty.careerTag || 'Computer Science & Engineering'}</span>
                      </span>
                    </div>
                  </div>

                  <Badge variant="info" size="xs">
                    Faculty Evaluator
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Accepting Mocks</span>
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenBooking(faculty.id)}
                    leftIcon={<Calendar className="w-3 h-3 text-blue-600" />}
                    className="text-[11px]"
                  >
                    Schedule Slot
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7 & 8. INTERVIEW HISTORY & EVALUATION RESULTS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Interview History & Scorecards
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              ({filteredHistory.length} total)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All', count: interviews.length },
              {
                id: 'completed',
                label: 'Completed',
                count: interviewSummary.completed,
              },
              {
                id: 'scheduled',
                label: 'Scheduled',
                count: interviewSummary.scheduled,
              },
              {
                id: 'evaluated',
                label: 'Score Available',
                count: interviews.filter((i) => i.scores?.technical !== null && i.status === 'completed').length,
              },
            ].map((tab) => {
              const isActive = historyFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHistoryFilter(tab.id)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                    }
                  `}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`
                      px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold
                      ${isActive ? 'bg-blue-700/60 text-white' : 'bg-slate-100 text-slate-600'}
                    `}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <EmptyState
            icon={<Award className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
            title="No Interviews Found"
            description="You have no interview records under this filter. Schedule a session to begin your diagnostic mock evaluations."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenBooking()}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Book Mock Interview
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const hasEvaluation =
                item.scores &&
                item.scores.technical !== null &&
                item.status === 'completed';

              return (
                <div
                  key={item.interviewId}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 sm:mt-0">
                      <Award className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">
                          Mock Screen w/ {item.interviewerName}
                        </span>
                        {renderStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span>{formatDate(item.dateTime)}</span>
                        <span>•</span>
                        <span>{formatTime(item.dateTime) || 'Time scheduled'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Action */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {hasEvaluation ? (
                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            Overall Score
                          </span>
                          <span className="text-sm font-black text-emerald-600 font-mono">
                            {item.scores.average} / 10
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleOpenEvaluation(item)}
                          className="text-[11px] font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          View Scorecard
                        </Button>
                      </div>
                    ) : item.status === 'completed' ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting Faculty Scorecard</span>
                      </div>
                    ) : item.meetLink ? (
                      <a
                        href={item.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="xs"
                          leftIcon={<Video className="w-3.5 h-3.5 text-blue-600" />}
                          rightIcon={<ExternalLink className="w-3 h-3" />}
                          className="text-[11px]"
                        >
                          Join
                        </Button>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Scheduled</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          9. READINESS RECOMMENDATIONS & REMEDIATION
      ───────────────────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold tracking-tight text-white">
            Interview Rubric Diagnostics & Next Actions
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Mock interview performance carries a 40% weighting in the placement readiness formula.
          Faculty evaluators grade against standardized technical problem-solving, architectural clarity,
          and communication rubrics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-semibold text-emerald-300">DSA & Problem Solving</span>
            <p className="text-[11px] text-slate-300 leading-normal">
              Focus on clarifying constraints, stating time/space complexity, and dry-running test cases.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-semibold text-blue-300">System Design Depth</span>
            <p className="text-[11px] text-slate-300 leading-normal">
              Articulate trade-offs in distributed caching (Redis), data sharding, and consensus protocols.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-semibold text-amber-300">STAR Communication</span>
            <p className="text-[11px] text-slate-300 leading-normal">
              Structure behavioral responses clearly: Situation, Task, Action, and measurable Result.
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BOOKING MODAL (Dispatches POST /api/appointments)
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => !isSubmittingBooking && setIsBookingModalOpen(false)}
        title="Schedule Mock Interview Appointment"
        description="Book a 45-minute standardized mock screen with a verified faculty evaluator."
        size="md"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
          {bookingErrors.submit && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{bookingErrors.submit}</span>
            </div>
          )}

          {/* Select Faculty Member */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Faculty Evaluator</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={bookingFormData.facultyId}
              onChange={(e) =>
                setBookingFormData((prev) => ({ ...prev, facultyId: e.target.value }))
              }
              className="w-full bg-white text-slate-900 text-xs sm:text-sm rounded-lg border border-slate-200 px-3 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
            >
              <option value="">-- Select Faculty Evaluator --</option>
              {facultyMentors.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.careerTag || 'Computer Science & Engineering'})
                </option>
              ))}
            </select>
            {bookingErrors.facultyId && (
              <p className="text-xs text-rose-600 font-medium">{bookingErrors.facultyId}</p>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Interview Date</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={bookingFormData.date}
              onChange={(e) =>
                setBookingFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full bg-white text-slate-900 text-xs sm:text-sm rounded-lg border border-slate-200 px-3 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
            />
            {bookingErrors.date && (
              <p className="text-xs text-rose-600 font-medium">{bookingErrors.date}</p>
            )}
          </div>

          {/* Time Slot Picker */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Preferred Time Slot</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={bookingFormData.time}
              onChange={(e) =>
                setBookingFormData((prev) => ({ ...prev, time: e.target.value }))
              }
              className="w-full bg-white text-slate-900 text-xs sm:text-sm rounded-lg border border-slate-200 px-3 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
            >
              <option value="10:00">10:00 AM (Morning Slot)</option>
              <option value="11:30">11:30 AM (Morning Slot)</option>
              <option value="14:00">02:00 PM (Afternoon Slot)</option>
              <option value="15:30">03:30 PM (Afternoon Slot)</option>
              <option value="17:00">05:00 PM (Evening Slot)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              Appointment confirmations sync automatically to your student dashboard and faculty calendar.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmittingBooking}
              onClick={() => setIsBookingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingBooking}
              loadingText="Confirming..."
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
            >
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          8. EVALUATION SCORECARD DETAILS MODAL (Read-Only)
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        title="Mock Interview Evaluation Scorecard"
        description="Official faculty grading rubrics and performance breakdown."
        size="md"
      >
        {selectedEvaluation && (
          <div className="space-y-4 pt-1">
            {/* Meta info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">
                  Evaluator: {selectedEvaluation.interviewerName}
                </span>
                <span className="text-slate-500">
                  {formatDate(selectedEvaluation.dateTime)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Overall Grade
                </span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  {selectedEvaluation.scores?.average || 0} / 10
                </span>
              </div>
            </div>

            {/* Rubrics breakdown */}
            <div className="space-y-3 pt-2">
              {/* Technical Score */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Technical Knowledge & DSA Architecture
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedEvaluation.scores?.technical || 0} / 10
                  </span>
                </div>
                <ProgressBar
                  value={(selectedEvaluation.scores?.technical || 0) * 10}
                  max={100}
                  variant="primary"
                  size="sm"
                />
              </div>

              {/* Communication Score */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Problem-Solving & Communication (STAR)
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedEvaluation.scores?.communication || 0} / 10
                  </span>
                </div>
                <ProgressBar
                  value={(selectedEvaluation.scores?.communication || 0) * 10}
                  max={100}
                  variant="success"
                  size="sm"
                />
              </div>

              {/* Confidence Score */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Professional Demeanor & Confidence
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedEvaluation.scores?.confidence || 0} / 10
                  </span>
                </div>
                <ProgressBar
                  value={(selectedEvaluation.scores?.confidence || 0) * 10}
                  max={100}
                  variant="tier1"
                  size="sm"
                />
              </div>
            </div>

            {/* Institutional Seal Notice */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">
                Scores have been verified by the Department Faculty Evaluation Panel and contributed
                directly to your 40% interview readiness weighting.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEvaluationModalOpen(false)}
              >
                Close Scorecard
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InterviewCenterPage;

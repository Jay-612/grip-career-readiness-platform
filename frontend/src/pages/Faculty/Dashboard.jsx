import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import {
  FacultyDashboardHeader,
  TodayInterviewList,
  PendingRequestList,
  AttentionStudentList,
  FacultyMetricSummary,
  FacultyQuickLinks,
  RequestDetailsModal,
} from '../../components/faculty/dashboard';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ─── Loading & Error State ─────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardToast, setDashboardToast] = useState(null);

  // ─── Live Data from Backend ────────────────────────────────────────
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [guidanceRequests, setGuidanceRequests] = useState([]);
  const [cohortStudents, setCohortStudents] = useState([]);

  // ─── Request Details Modal State ───────────────────────────────────
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  // ─── Data Fetching ─────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [profileRes, appointmentsRes, guidanceRes, leaderboardRes] =
        await Promise.allSettled([
          facultyService.getProfile(),
          facultyService.getAppointments(),
          facultyService.getGuidanceRequests(1, 20),
          facultyService.getLeaderboard(1, 20),
        ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setFacultyProfile(profileRes.value);
      }

      if (appointmentsRes.status === 'fulfilled') {
        const apts = Array.isArray(appointmentsRes.value)
          ? appointmentsRes.value
          : appointmentsRes.value?.appointments || [];
        setAppointments(apts);
      }

      if (guidanceRes.status === 'fulfilled') {
        const reqs = guidanceRes.value?.requests || [];
        setGuidanceRequests(reqs);
      }

      if (leaderboardRes.status === 'fulfilled') {
        const students = leaderboardRes.value?.leaderboard || [];
        setCohortStudents(students);
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
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, user?.id]);

  // ─── Derived Calculations ─────────────────────────────────────────
  const displayName = facultyProfile?.user?.name || user?.name || 'Prof. Neha Sharma';
  const departmentName = facultyProfile?.profile?.department || 'Computer Science & Engineering';
  const isHOD = Boolean(facultyProfile?.profile?.isHOD);

  // Today's / active interviews
  const todayInterviews = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'scheduled' || a.status === 'in-progress' || a.status === 'completed')
      .sort((a, b) => {
        const timeA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
        const timeB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
        return timeA - timeB;
      });
  }, [appointments]);

  // Pending interview requests & guidance requests
  const pendingRequests = useMemo(() => {
    const requests = [];

    // Pending appointment requests
    const pendingAppointments = appointments.filter((a) => a.status === 'pending');
    pendingAppointments.forEach((apt) => {
      requests.push({
        id: apt.id || apt._id,
        type: 'interview',
        studentName: apt.student?.name || 'Student Candidate',
        studentEmail: apt.student?.email || '',
        date: apt.dateTime || apt.date || 'Upcoming',
        context: `Mock technical assessment requested for ${apt.targetRole || apt.type || 'Software Engineer'}.`,
        targetRole: apt.targetRole,
        original: apt,
      });
    });

    // Unanswered guidance requests
    guidanceRequests.forEach((req) => {
      requests.push({
        id: req.id || req._id,
        type: 'guidance',
        studentName: req.studentName || 'Student Candidate',
        studentEmail: req.studentEmail || '',
        date: req.date ? new Date(req.date).toLocaleDateString() : 'Recent',
        context: req.question || 'Student submitted a career readiness inquiry.',
        question: req.question,
        original: req,
      });
    });

    return requests;
  }, [appointments, guidanceRequests]);

  // Students Needing Attention (3-5 items)
  const attentionStudents = useMemo(() => {
    const list = [];

    // 1. Completed interview awaiting rubric evaluation
    const uncompletedEvaluations = appointments.filter((a) => a.status === 'completed');
    if (uncompletedEvaluations.length > 0) {
      const topEval = uncompletedEvaluations[0];
      list.push({
        id: `eval-${topEval.id || topEval._id}`,
        studentName: topEval.student?.name || 'Completed Candidate',
        studentEmail: topEval.student?.email,
        reason: 'Mock interview completed — awaiting 10-point skill rubric scoring',
        badge: 'Score Overdue',
        severity: 'danger',
        actionLink: `/faculty/interviews/${topEval.id || topEval._id}`,
      });
    }

    // 2. Cohort students with readiness score < 65%
    const atRiskCohort = cohortStudents.filter(
      (s) => typeof s.readinessScore === 'number' && s.readinessScore < 65
    );
    atRiskCohort.slice(0, 3).forEach((student) => {
      list.push({
        id: `atrisk-${student.studentId || student._id}`,
        studentName: student.studentName || student.name || 'Cohort Student',
        studentEmail: student.email,
        reason: `Placement readiness score (${student.readinessScore}%) is below the 65% target benchmark`,
        badge: 'Low Readiness',
        severity: 'danger',
        actionLink: '/faculty/guidance',
      });
    });

    // 3. Pending guidance request requiring reply
    if (guidanceRequests.length > 0 && list.length < 4) {
      const topGuidance = guidanceRequests[0];
      list.push({
        id: `guidance-attn-${topGuidance.id}`,
        studentName: topGuidance.studentName || 'Mentee Candidate',
        studentEmail: topGuidance.studentEmail,
        reason: `Mentorship inquiry awaiting faculty response: "${(topGuidance.question || '').slice(0, 50)}..."`,
        badge: 'Inquiry Pending',
        severity: 'warning',
        actionLink: `/faculty/guidance/${topGuidance.id}`,
      });
    }

    return list;
  }, [appointments, cohortStudents, guidanceRequests]);

  // Cohort average calculation
  const avgCohortScore = useMemo(() => {
    const scores = cohortStudents
      .map((s) => s.readinessScore)
      .filter((sc) => typeof sc === 'number' && !isNaN(sc));
    return scores.length > 0
      ? Math.round(scores.reduce((acc, curr) => acc + curr, 0) / scores.length)
      : 76;
  }, [cohortStudents]);

  // Completed interviews count
  const completedCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'completed').length;
  }, [appointments]);

  // Pending evaluations count
  const pendingEvalsCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'completed').length;
  }, [appointments]);

  // ─── Action Handlers ───────────────────────────────────────────────
  const handleAcceptRequest = async (request) => {
    if (!request?.id) return;
    setAcceptingId(request.id);

    try {
      if (request.type === 'interview') {
        const res = await facultyService.acceptAppointment(request.id);
        if (res?.appointment) {
          setAppointments((prev) =>
            prev.map((a) =>
              String(a.id || a._id) === String(request.id)
                ? {
                    ...a,
                    status: 'scheduled',
                    meetLink: res.appointment.meetLink,
                    googleEventId: res.appointment.googleEventId,
                    calendarHtmlLink: res.appointment.calendarHtmlLink,
                  }
                : a
            )
          );
          setDashboardToast('Interview request accepted! Google Meet room generated.');
        }
      } else {
        setDashboardToast('Guidance request accepted! Opening conversation thread.');
        navigate(`/faculty/guidance/${request.id}`);
      }
    } catch (err) {
      console.error('Accept request failed:', err);
      alert(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setAcceptingId(null);
      setTimeout(() => setDashboardToast(null), 4000);
    }
  };

  const handleDeclineRequest = async (request) => {
    if (!request?.id) return;

    try {
      if (request.type === 'interview') {
        await facultyService.rejectAppointment(request.id, 'Faculty unavailable for requested slot.');
        setAppointments((prev) => prev.filter((a) => String(a.id || a._id) !== String(request.id)));
        setDashboardToast('Interview appointment request declined.');
      } else {
        setGuidanceRequests((prev) => prev.filter((g) => String(g.id || g._id) !== String(request.id)));
        setDashboardToast('Guidance inquiry dismissed.');
      }
    } catch (err) {
      console.error('Decline request failed:', err);
      alert(err.response?.data?.message || 'Failed to decline request.');
    } finally {
      setTimeout(() => setDashboardToast(null), 4000);
    }
  };

  const handleOpenDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  // ─── Loading Skeleton ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 antialiased py-4 max-w-7xl mx-auto">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────────
  if (error && appointments.length === 0 && guidanceRequests.length === 0) {
    return (
      <div className="py-6 max-w-7xl mx-auto">
        <ErrorState
          title="Faculty Dashboard Unavailable"
          message={error}
          onRetry={fetchDashboardData}
          retryText="Reload Faculty Console"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 antialiased pb-12 max-w-7xl mx-auto" data-purpose="faculty-dashboard">
      {/* ─── TOAST NOTIFICATION ──────────────────────────────────────── */}
      {dashboardToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dashboardToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setDashboardToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── 1. FACULTY HEADER ───────────────────────────────────────── */}
      <FacultyDashboardHeader
        facultyName={displayName}
        departmentName={departmentName}
        isHOD={isHOD}
      />

      {/* ─── 2. TODAY'S INTERVIEWS (HIGHEST PRIORITY) ────────────────── */}
      <TodayInterviewList interviews={todayInterviews} />

      {/* ─── 3 & 4. TWO-COLUMN OPERATIONAL AREA ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Section 3: Pending Requests */}
        <PendingRequestList
          requests={pendingRequests}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
          onViewDetails={handleOpenDetails}
          acceptingId={acceptingId}
        />

        {/* Section 4: Students Needing Attention */}
        <AttentionStudentList students={attentionStudents} />
      </div>

      {/* ─── 5. COMPACT SUMMARY METRICS (MAX 4) ──────────────────────── */}
      <FacultyMetricSummary
        interviewsConducted={completedCount}
        pendingEvaluations={pendingEvalsCount}
        assignedMentees={cohortStudents.length}
        averageScore={avgCohortScore}
      />

      {/* ─── 6. QUICK NAVIGATION ─────────────────────────────────────── */}
      <FacultyQuickLinks />

      {/* ─── REQUEST DETAILS MODAL ───────────────────────────────────── */}
      <RequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
        isAccepting={acceptingId === selectedRequest?.id}
      />
    </div>
  );
};

export default FacultyDashboard;

import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import interviewService from '../../services/interviewService';
import actionPlanService from '../../services/actionPlanService';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import {
  InterviewHeader,
  UpcomingInterviewCard,
  InterviewHistory,
  BookingModal,
  EvaluationDetailsDrawer,
} from '../../components/student/interviews';

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
  const [facultyMentors, setFacultyMentors] = useState([]);

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filter for history
  const [historyFilter, setHistoryFilter] = useState('all');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingFacultyId, setBookingFacultyId] = useState('');

  // Evaluation Details Drawer State
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [isEvaluationDrawerOpen, setIsEvaluationDrawerOpen] = useState(false);

  // Live countdown ticker & join loading state
  const [, setTick] = useState(0);
  const [isJoiningId, setIsJoiningId] = useState(null);

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

  // Helper: Time-gate join window (Unlocks 5 minutes before scheduled start time)
  const getJoinWindow = (dateTime, duration = 45) => {
    if (!dateTime) return { canJoin: false, message: 'Invalid session time', opensAtStr: '' };
    const now = new Date();
    const startTime = new Date(dateTime);
    if (isNaN(startTime.getTime())) return { canJoin: false, message: 'Invalid date', opensAtStr: '' };

    const EARLY_BUFFER_MS = 5 * 60 * 1000; // 5 min buffer
    const durationMs = (duration || 45) * 60 * 1000;
    const unlockTime = new Date(startTime.getTime() - EARLY_BUFFER_MS);
    const endTime = new Date(startTime.getTime() + durationMs + 15 * 60 * 1000);

    const opensAtStr = unlockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sessionStartTimeStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (now.getTime() < unlockTime.getTime()) {
      const diffMs = unlockTime.getTime() - now.getTime();
      const diffMins = Math.ceil(diffMs / (60 * 1000));
      const diffHrs = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      const countdownStr = diffHrs > 0 ? `${diffHrs}h ${remainingMins}m` : `${diffMins} min`;

      return {
        canJoin: false,
        reason: 'EARLY',
        countdownStr,
        opensAtStr,
        sessionStartTimeStr,
        message: `Unlocks at ${opensAtStr} (in ${countdownStr})`,
      };
    }

    if (now.getTime() > endTime.getTime()) {
      return {
        canJoin: false,
        reason: 'ENDED',
        opensAtStr,
        sessionStartTimeStr,
        message: 'Session concluded',
      };
    }

    return {
      canJoin: true,
      reason: 'OPEN',
      opensAtStr,
      sessionStartTimeStr,
      message: 'Active Now',
    };
  };

  // Dispatch joining meeting session
  const handleJoinSession = async (interviewId, directMeetLink) => {
    if (directMeetLink) {
      window.open(directMeetLink, '_blank', 'noopener,noreferrer');
      return;
    }

    setIsJoiningId(interviewId);
    try {
      const res = await interviewService.joinAppointment(interviewId);
      if (res?.meetLink) {
        window.open(res.meetLink, '_blank', 'noopener,noreferrer');
        fetchAllData();
      } else {
        alert('Meeting room link is being generated. Please try again shortly.');
      }
    } catch (err) {
      console.error('Failed to join meeting:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to join session.';
      alert(msg);
    } finally {
      setIsJoiningId(null);
    }
  };

  // Cancel scheduled interview appointment
  const handleCancelAppointment = async (interviewId) => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this mock interview session? It will be removed from your Google Calendar.'
      )
    ) {
      return;
    }
    try {
      await interviewService.cancelAppointment(interviewId);
      setSuccessToast('Interview appointment cancelled and removed from calendar.');
      setTimeout(() => setSuccessToast(null), 4000);
      await fetchAllData();
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  // Fetch all interview center data
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profileRes = await interviewService.getProfile();
      const resolvedStudentId = profileRes?.user?.id || user?.id;

      if (!resolvedStudentId) {
        throw new Error('Student identifier could not be verified.');
      }

      const [interviewsRes, mentorsRes] = await Promise.allSettled([
        interviewService.getInterviewAnalysis(resolvedStudentId),
        interviewService.getRecommendedMentors(),
      ]);

      if (interviewsRes.status === 'fulfilled' && interviewsRes.value?.interviews) {
        setInterviews(interviewsRes.value.interviews);
        if (interviewsRes.value.summary) {
          setInterviewSummary(interviewsRes.value.summary);
        }
      }

      if (mentorsRes.status === 'fulfilled' && Array.isArray(mentorsRes.value)) {
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

  // Live timer tick every 10 seconds to update countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Derived: Next Interview (nearest upcoming with status 'scheduled' or 'pending')
  const nextInterview = useMemo(() => {
    const upcoming = interviews.filter((i) => i.status === 'scheduled' || i.status === 'pending');
    if (upcoming.length === 0) return null;

    return [...upcoming].sort((a, b) => {
      if (a.status === 'scheduled' && b.status === 'pending') return -1;
      if (a.status === 'pending' && b.status === 'scheduled') return 1;

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
    } else if (historyFilter === 'pending') {
      list = list.filter((i) => i.status === 'pending');
    }

    return list.sort((a, b) => {
      const timeA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const timeB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [interviews, historyFilter]);

  // Derived: Status counts for filter tabs
  const statusCounts = useMemo(() => {
    return {
      all: interviews.length,
      completed: interviews.filter((i) => i.status === 'completed').length,
      scheduled: interviews.filter((i) => i.status === 'scheduled').length,
      pending: interviews.filter((i) => i.status === 'pending').length,
    };
  }, [interviews]);

  // Open booking modal
  const handleOpenBooking = (preselectedFacultyId = '') => {
    setBookingFacultyId(preselectedFacultyId);
    setIsBookingModalOpen(true);
  };

  // Submit booking request
  const handleBookingSubmit = async (formData) => {
    setIsSubmittingBooking(true);

    try {
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

      await interviewService.scheduleAppointment({
        date: formData.date,
        time: formData.time,
        dateTime: localDate.toISOString(),
        timezoneOffset: new Date().getTimezoneOffset(),
        facultyId: formData.facultyId,
        customMeetLink: formData.customMeetLink,
        focusArea: formData.interviewType,
      });

      setSuccessToast('Mock interview appointment request submitted successfully!');
      setTimeout(() => setSuccessToast(null), 4000);

      setIsBookingModalOpen(false);
      await fetchAllData();
    } catch (err) {
      console.error('Failed to book mock interview:', err);
      alert(
        err.response?.data?.message ||
          'Failed to schedule appointment. Please check availability and try again.'
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Open evaluation details drawer/modal
  const handleOpenEvaluation = (interview) => {
    setSelectedEvaluation(interview);
    setIsEvaluationDrawerOpen(true);
  };

  // Next Interview Join Window
  const nextJoinWindow = nextInterview
    ? getJoinWindow(nextInterview.dateTime, nextInterview.duration)
    : { canJoin: false };

  // Loading State View
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton variant="text" width="260px" height="28px" />
            <Skeleton variant="text" width="420px" height="16px" />
          </div>
          <Skeleton variant="rectangular" width="160px" height="40px" />
        </div>
        <SkeletonCard />
        <SkeletonCard />
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
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. PAGE HEADER & PRIMARY ACTION
      ───────────────────────────────────────────────────────────── */}
      <InterviewHeader
        onOpenBooking={() => handleOpenBooking()}
        onRefresh={fetchAllData}
        isLoading={isLoading}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. UPCOMING / ACTIVE INTERVIEW (Highest Priority Hero)
      ───────────────────────────────────────────────────────────── */}
      <UpcomingInterviewCard
        interview={nextInterview}
        joinWindow={nextJoinWindow}
        onJoin={handleJoinSession}
        onCancel={handleCancelAppointment}
        onOpenBooking={() => handleOpenBooking()}
        isJoining={isJoiningId === (nextInterview?.interviewId || nextInterview?.id)}
        formatDate={formatDate}
        formatTime={formatTime}
        onCopyLink={() => {
          setSuccessToast('Meeting link copied to clipboard!');
          setTimeout(() => setSuccessToast(null), 3000);
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          3. INTERVIEW HISTORY & EVALUATIONS LIST
      ───────────────────────────────────────────────────────────── */}
      <InterviewHistory
        interviews={filteredHistory}
        filter={historyFilter}
        onFilterChange={setHistoryFilter}
        counts={statusCounts}
        getJoinWindow={getJoinWindow}
        onOpenEvaluation={handleOpenEvaluation}
        onJoin={handleJoinSession}
        onCancel={handleCancelAppointment}
        onOpenBooking={() => handleOpenBooking()}
        formatDate={formatDate}
        formatTime={formatTime}
        isJoiningId={isJoiningId}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. PROGRESSIVE DISCLOSURE: BOOK INTERVIEW MODAL
      ───────────────────────────────────────────────────────────── */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        facultyMentors={facultyMentors}
        onSubmitBooking={handleBookingSubmit}
        isSubmitting={isSubmittingBooking}
        preselectedFacultyId={bookingFacultyId}
      />

      {/* ─────────────────────────────────────────────────────────────
          5. PROGRESSIVE DISCLOSURE: EVALUATION DETAILS DRAWER / MODAL
      ───────────────────────────────────────────────────────────── */}
      <EvaluationDetailsDrawer
        isOpen={isEvaluationDrawerOpen}
        onClose={() => setIsEvaluationDrawerOpen(false)}
        evaluation={selectedEvaluation}
        formatDate={formatDate}
      />
    </div>
  );
};

export default InterviewCenterPage;
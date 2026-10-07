import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import guidanceService from '../../services/guidanceService';
import {
  GuidanceHeader,
  AskGuidanceModal,
  StudentInquiriesSection,
} from '../../components/student/guidance';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import { CheckCircle2 } from 'lucide-react';

export const GuidancePage = () => {
  const { user } = useAuth();
  const studentId = user?.id || user?._id;

  // Master Data States
  const [guidanceRequests, setGuidanceRequests] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [alumniList, setAlumniList] = useState([]);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Ask Guidance Modal & Thread States
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isSubmittingGuidance, setIsSubmittingGuidance] = useState(false);
  const [isReplyingInquiry, setIsReplyingInquiry] = useState(false);
  const [isResolvingInquiry, setIsResolvingInquiry] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // 1. DATA LOADING: Guidance Inquiries & Mentors
  // ─────────────────────────────────────────────────────────────
  const loadGuidanceData = useCallback(async (isRefresh = false) => {
    if (!studentId) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Concurrently query guidance requests, faculty mentors, and alumni mentors
      const [guidanceRes, facultyRes, alumniRes] = await Promise.allSettled([
        guidanceService.getRequests(1, 50),
        guidanceService.getFacultyMentors(),
        guidanceService.getAlumniMentors(),
      ]);

      // 1. Guidance submissions & replies
      if (guidanceRes.status === 'fulfilled' && guidanceRes.value) {
        const requests = Array.isArray(guidanceRes.value)
          ? guidanceRes.value
          : guidanceRes.value.requests || [];
        setGuidanceRequests(requests);
      }

      // 2. Dynamic Faculty List
      if (facultyRes.status === 'fulfilled' && Array.isArray(facultyRes.value)) {
        setFacultyList(facultyRes.value);
      }

      // 3. Dynamic Alumni List
      if (alumniRes.status === 'fulfilled' && Array.isArray(alumniRes.value)) {
        setAlumniList(alumniRes.value);
      }
    } catch (err) {
      console.error('Failed to load guidance data:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load guidance data. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadGuidanceData();
  }, [loadGuidanceData]);

  // ─────────────────────────────────────────────────────────────
  // 2. ACTIONS: ASK GUIDANCE & THREAD INTERACTIONS
  // ─────────────────────────────────────────────────────────────
  const handleOpenAskModal = () => setIsAskModalOpen(true);
  const handleCloseAskModal = () => setIsAskModalOpen(false);

  const handleCreateGuidanceInquiry = async (formData) => {
    setIsSubmittingGuidance(true);
    try {
      await guidanceService.createRequest(formData);
      setIsAskModalOpen(false);
      const recipientType = formData.mentorType === 'alumni' ? 'alumni mentor' : 'faculty advisor';
      setSuccessToast(`Guidance inquiry submitted to your ${recipientType}!`);
      setTimeout(() => setSuccessToast(null), 3500);
      await loadGuidanceData(true);
    } catch (err) {
      console.error('Failed to submit guidance question:', err);
      alert(err.response?.data?.message || 'Failed to submit guidance request.');
    } finally {
      setIsSubmittingGuidance(false);
    }
  };

  const handleFollowUpReply = async (requestId, answerText) => {
    setIsReplyingInquiry(true);
    try {
      await guidanceService.replyRequest(requestId, answerText);
      setSuccessToast('Your reply was posted!');
      setTimeout(() => setSuccessToast(null), 3000);
      await loadGuidanceData(true);
    } catch (err) {
      console.error('Failed to post reply:', err);
      alert(err.response?.data?.message || 'Failed to submit reply.');
    } finally {
      setIsReplyingInquiry(false);
    }
  };

  const handleResolveInquiry = async (requestId) => {
    setIsResolvingInquiry(true);
    try {
      await guidanceService.resolveRequest(requestId);
      setSuccessToast('Guidance inquiry marked as resolved! 🎉');
      setTimeout(() => setSuccessToast(null), 3000);
      await loadGuidanceData(true);
    } catch (err) {
      console.error('Failed to resolve guidance request:', err);
      alert(err.response?.data?.message || 'Failed to resolve inquiry.');
    } finally {
      setIsResolvingInquiry(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. RENDERING: LOADING & ERROR STATES
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
        <div className="space-y-2">
          <Skeleton variant="text" width="220px" height="28px" />
          <Skeleton variant="text" width="400px" height="16px" />
        </div>
        <SkeletonCard />
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && guidanceRequests.length === 0) {
    return (
      <div className="max-w-5xl mx-auto pt-6">
        <ErrorState
          title="Unable to Load Guidance"
          message={error}
          onRetry={() => loadGuidanceData(false)}
          retryText="Retry Loading"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 antialiased max-w-5xl mx-auto" data-testid="student-guidance-page">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <GuidanceHeader
        onRefresh={() => loadGuidanceData(true)}
        isRefreshing={isRefreshing}
        onAskGuidance={handleOpenAskModal}
      />

      {/* 2. GUIDANCE INQUIRIES & CONVERSATIONS */}
      <div className="space-y-4 animate-fadeIn">
        <StudentInquiriesSection
          inquiries={guidanceRequests}
          onReply={handleFollowUpReply}
          onResolve={handleResolveInquiry}
          onAskGuidance={handleOpenAskModal}
          isReplying={isReplyingInquiry}
          isResolving={isResolvingInquiry}
        />
      </div>

      {/* 3. ASK FOR GUIDANCE MODAL (Faculty & Alumni Mentors) */}
      <AskGuidanceModal
        isOpen={isAskModalOpen}
        onClose={handleCloseAskModal}
        onSubmit={handleCreateGuidanceInquiry}
        isSubmitting={isSubmittingGuidance}
        facultyList={facultyList}
        alumniList={alumniList}
      />
    </div>
  );
};

export default GuidancePage;

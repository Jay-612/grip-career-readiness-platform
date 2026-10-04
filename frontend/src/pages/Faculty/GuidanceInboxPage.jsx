import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import {
  GuidanceHeader,
  GuidanceFilters,
  GuidanceRequestList,
  GuidanceDetailsDrawer,
  ReworkModal,
} from '../../components/faculty/guidance';

const GuidanceInboxPage = () => {
  const { requestId: routeRequestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Master Inquiries List
  const [requests, setRequests] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search
  const [mainSection, setMainSection] = useState('student_questions'); // 'student_questions' | 'remedial_reviews'
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'inReview' | 'completed' | 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Detail State
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [isUnauthorizedRoute, setIsUnauthorizedRoute] = useState(false);

  // Student Enrichment Context
  const [studentReadiness, setStudentReadiness] = useState(null);

  // Action states
  const [isApproving, setIsApproving] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [isSubmittingRework, setIsSubmittingRework] = useState(false);

  // Responsive mobile drawer state
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // ─── 1. Fetch Selected Request Detail (Guarded) ────────────────
  const fetchSelectedDetail = useCallback(async (reqId) => {
    if (!reqId) {
      setSelectedDetail(null);
      return;
    }

    setIsLoadingDetail(true);
    setDetailError(null);
    setIsUnauthorizedRoute(false);

    try {
      const detailRes = await facultyService.getGuidanceRequestById(reqId);
      const requestData = detailRes?.request || detailRes;
      const repliesData = detailRes?.replies || [];

      setSelectedDetail({
        ...requestData,
        replies: repliesData,
      });

      // Enrich student readiness context if studentId is available
      const studentId = requestData?.studentId;
      if (studentId) {
        try {
          const readinessRes = await facultyService.getStudentReadiness(studentId);
          setStudentReadiness(readinessRes);
        } catch {
          setStudentReadiness(null);
        }
      }
    } catch (err) {
      console.error(`Error loading guidance detail for ${reqId}:`, err);
      const status = err.response?.status;
      if (status === 403) {
        setIsUnauthorizedRoute(true);
        setDetailError('You do not have access to this request.');
      } else {
        setDetailError(
          err.response?.data?.message || 'This guidance request is no longer available.'
        );
      }
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // ─── 2. Fetch Accessible Guidance Requests ──────────────────────
  const fetchRequests = useCallback(
    async (preserveSelectedId = null) => {
      setIsLoadingList(true);
      setListError(null);
      setIsUnauthorizedRoute(false);

      try {
        const res = await facultyService.getGuidanceRequests(1, 50);
        const list = Array.isArray(res) ? res : res?.requests || [];
        setRequests(list);

        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

        // Check if route has an explicit request ID
        if (routeRequestId) {
          const matched = list.find((r) => r.id === routeRequestId);
          if (matched) {
            setSelectedRequestId(matched.id);
            fetchSelectedDetail(matched.id);
            setShowMobileDetail(true);
          } else {
            // The route request ID is not present in accessible list!
            // Do NOT auto-fetch to avoid 403
            setSelectedRequestId(null);
            setSelectedDetail(null);
            setIsUnauthorizedRoute(true);
            setShowMobileDetail(true);
          }
        } else if (preserveSelectedId) {
          const matched = list.find((r) => r.id === preserveSelectedId);
          if (matched) {
            setSelectedRequestId(matched.id);
            fetchSelectedDetail(matched.id);
          } else if (isDesktop && list.length > 0) {
            const firstPending = list.find((r) => r.status === 'pending') || list[0];
            setSelectedRequestId(firstPending.id);
            fetchSelectedDetail(firstPending.id);
          }
        } else if (isDesktop && list.length > 0) {
          // On Desktop: auto-select first pending item if none selected
          const firstPending = list.find((r) => r.status === 'pending') || list[0];
          setSelectedRequestId(firstPending.id);
          fetchSelectedDetail(firstPending.id);
        } else {
          setSelectedRequestId(null);
          setSelectedDetail(null);
        }
      } catch (err) {
        console.error('Failed to load guidance requests:', err);
        setListError(
          err.response?.data?.message ||
            'Failed to load guidance inbox inquiries. Please check your network connection.'
        );
      } finally {
        setIsLoadingList(false);
      }
    },
    [routeRequestId, fetchSelectedDetail]
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle manual refresh button
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRequests(selectedRequestId);
    setIsRefreshing(false);
  };

  // ─── 3. Filter & Sort Logic ────────────────────────────────────
  const isRemedialSubmission = (r) => {
    const q = (r.question || '').toLowerCase();
    const t = (r.topic || '').toLowerCase();
    return (
      q.includes('remedial') ||
      q.includes('action plan') ||
      t.includes('remedial') ||
      t.includes('action plan') ||
      q.includes('submission:')
    );
  };

  const { filteredRequests, counts } = useMemo(() => {
    // 1. Separate based on mainSection
    const sectionRequests = requests.filter((r) => {
      const isRemedial = isRemedialSubmission(r);
      return mainSection === 'remedial_reviews' ? isRemedial : !isRemedial;
    });

    let pendingCount = 0;
    let inReviewCount = 0;
    let completedCount = 0;

    sectionRequests.forEach((r) => {
      const isPending = r.status === 'pending' || !r.replyCount;
      const isApproved =
        r.latestReply?.answerText?.includes('Approved') ||
        (r.replies && r.replies.some((rep) => rep.answerText?.includes('Approved')));

      if (isPending) {
        pendingCount++;
      } else if (isApproved || r.status === 'replied') {
        completedCount++;
      } else {
        inReviewCount++;
      }
    });

    const filtered = sectionRequests.filter((item) => {
      const isPending = item.status === 'pending' || !item.replyCount;
      const isApproved =
        item.latestReply?.answerText?.includes('Approved') ||
        (item.replies && item.replies.some((rep) => rep.answerText?.includes('Approved')));

      // Tab filtering
      if (activeTab === 'pending' && !isPending) return false;
      if (activeTab === 'inReview' && (isPending || isApproved)) return false;
      if (activeTab === 'completed' && !isApproved && item.status !== 'replied') return false;

      // Search query filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const studentName = (item.studentName || '').toLowerCase();
        const studentEmail = (item.studentEmail || '').toLowerCase();
        const questionText = (item.question || '').toLowerCase();
        return (
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          questionText.includes(query)
        );
      }

      return true;
    });

    // Default Sorting:
    // 1. Pending review first
    // 2. Oldest waiting (date ascending)
    // 3. Recently submitted
    const sorted = [...filtered].sort((a, b) => {
      const aPending = a.status === 'pending' || !a.replyCount;
      const bPending = b.status === 'pending' || !b.replyCount;
      if (aPending && !bPending) return -1;
      if (!aPending && bPending) return 1;

      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();

      if (aPending && bPending) {
        // Oldest waiting first
        return dateA - dateB;
      }
      // Most recently updated first
      return dateB - dateA;
    });

    return {
      filteredRequests: sorted,
      counts: {
        pending: pendingCount,
        inReview: inReviewCount,
        completed: completedCount,
        all: requests.length,
      },
    };
  }, [requests, activeTab, searchQuery]);

  // ─── 4. Handlers: Selection, Review Actions ────────────────────
  const handleSelectRequest = (id) => {
    setSelectedRequestId(id);
    setIsUnauthorizedRoute(false);
    fetchSelectedDetail(id);
    setShowMobileDetail(true);
    navigate(`/faculty/guidance/${id}`, { replace: true });
  };

  const handleCloseMobile = () => {
    setShowMobileDetail(false);
    setSelectedRequestId(null);
    setSelectedDetail(null);
    setIsUnauthorizedRoute(false);
    navigate('/faculty/guidance', { replace: true });
  };

  // Approve Flow
  const handleApproveCompletion = async () => {
    if (!selectedRequestId) return;
    setIsApproving(true);
    try {
      const approvalMessage =
        '✓ Task Completion Approved: Student evidence and remedial solution verified. Full readiness credit granted.';
      await facultyService.replyGuidanceRequest(selectedRequestId, approvalMessage);

      // Optimistically update selectedDetail
      setSelectedDetail((prev) => {
        if (!prev) return prev;
        const newReply = {
          id: `local-${Date.now()}`,
          mentorId: user?.id,
          mentorName: user?.name || 'Faculty Advisor',
          answerText: approvalMessage,
          date: new Date().toISOString(),
        };
        return {
          ...prev,
          status: 'replied',
          replies: [...(prev.replies || []), newReply],
        };
      });

      // Update item in requests list
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequestId
            ? {
                ...r,
                status: 'replied',
                replyCount: (r.replyCount || 0) + 1,
                latestReply: {
                  mentorName: user?.name || 'Faculty Advisor',
                  answerText: approvalMessage,
                },
              }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to approve completion:', err);
      alert(
        err.response?.data?.message ||
          'Failed to approve task completion. Please try again.'
      );
    } finally {
      setIsApproving(false);
    }
  };

  // Request Rework Flow
  const handleOpenReworkModal = () => {
    setIsReworkModalOpen(true);
  };

  const handleSubmitRework = async (reason) => {
    if (!selectedRequestId || !reason.trim()) return;
    setIsSubmittingRework(true);
    try {
      const reworkMessage = `⚠️ Rework Requested: ${reason.trim()}`;
      await facultyService.replyGuidanceRequest(selectedRequestId, reworkMessage);

      // Optimistically append reply
      setSelectedDetail((prev) => {
        if (!prev) return prev;
        const newReply = {
          id: `local-${Date.now()}`,
          mentorId: user?.id,
          mentorName: user?.name || 'Faculty Advisor',
          answerText: reworkMessage,
          date: new Date().toISOString(),
        };
        return {
          ...prev,
          status: 'in-review',
          replies: [...(prev.replies || []), newReply],
        };
      });

      // Update requests list
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequestId
            ? {
                ...r,
                status: 'in-review',
                replyCount: (r.replyCount || 0) + 1,
                latestReply: {
                  mentorName: user?.name || 'Faculty Advisor',
                  answerText: reworkMessage,
                },
              }
            : r
        )
      );

      setIsReworkModalOpen(false);
    } catch (err) {
      console.error('Failed to request rework:', err);
      alert(
        err.response?.data?.message ||
          'Failed to submit rework request. Please try again.'
      );
    } finally {
      setIsSubmittingRework(false);
    }
  };

  // Add Comment Flow
  const handleAddComment = async (commentText) => {
    if (!selectedRequestId || !commentText.trim()) return;
    setIsCommenting(true);
    try {
      await facultyService.replyGuidanceRequest(selectedRequestId, commentText.trim());

      setSelectedDetail((prev) => {
        if (!prev) return prev;
        const newReply = {
          id: `local-${Date.now()}`,
          mentorId: user?.id,
          mentorName: user?.name || 'Faculty Advisor',
          answerText: commentText.trim(),
          date: new Date().toISOString(),
        };
        return {
          ...prev,
          replies: [...(prev.replies || []), newReply],
        };
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequestId
            ? {
                ...r,
                replyCount: (r.replyCount || 0) + 1,
                latestReply: {
                  mentorName: user?.name || 'Faculty Advisor',
                  answerText: commentText.trim(),
                },
              }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert(
        err.response?.data?.message || 'Failed to post note. Please try again.'
      );
    } finally {
      setIsCommenting(false);
    }
  };

  // Resolve Flow
  const [isResolving, setIsResolving] = useState(false);
  const handleResolveRequest = async () => {
    if (!selectedRequestId) return;
    setIsResolving(true);
    try {
      await facultyService.resolveGuidanceRequest(selectedRequestId);

      setSelectedDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'resolved',
        };
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequestId
            ? {
                ...r,
                status: 'resolved',
              }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to resolve guidance request:', err);
      alert(err.response?.data?.message || 'Failed to mark inquiry as resolved.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-4 antialiased" data-purpose="faculty-guidance-inbox">
      {/* 1. PAGE HEADER */}
      <GuidanceHeader
        totalCount={counts.all}
        pendingCount={counts.pending}
        inReviewCount={counts.inReview}
        completedCount={counts.completed}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* TOP-LEVEL TABS: [Student Questions] [Remedial Reviews] */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMainSection('student_questions');
            setSelectedRequestId(null);
            setSelectedDetail(null);
          }}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            mainSection === 'student_questions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Student Questions</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainSection('remedial_reviews');
            setSelectedRequestId(null);
            setSelectedDetail(null);
          }}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            mainSection === 'remedial_reviews'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Remedial Reviews</span>
        </button>
      </div>

      {/* 2. STATUS FILTERS */}
      <GuidanceFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {/* 3. INBOX SPLIT VIEW / DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* REQUEST INBOX LIST (5 Cols Desktop) */}
        <div
          className={`lg:col-span-5 space-y-3 ${
            showMobileDetail ? 'hidden lg:block' : 'block'
          }`}
          data-testid="guidance-inbox-column"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span className="font-semibold text-slate-700">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'Submission' : 'Submissions'}
            </span>
            <span className="text-[11px] text-slate-400">
              Sorted by: Priority & Time
            </span>
          </div>

          <GuidanceRequestList
            requests={filteredRequests}
            selectedRequestId={selectedRequestId}
            onSelectRequest={handleSelectRequest}
            isLoading={isLoadingList}
            error={listError}
            onRetry={handleRefresh}
          />
        </div>

        {/* REQUEST DETAILS PANEL / DRAWER (7 Cols Desktop) */}
        <div
          className={`lg:col-span-7 ${
            !showMobileDetail ? 'hidden lg:block' : 'block'
          }`}
          data-testid="guidance-details-column"
        >
          <GuidanceDetailsDrawer
            detail={selectedDetail}
            isLoading={isLoadingDetail}
            error={detailError}
            isUnauthorized={isUnauthorizedRoute}
            studentReadiness={studentReadiness}
            onCloseMobile={handleCloseMobile}
            onApprove={handleApproveCompletion}
            onRequestRework={handleOpenReworkModal}
            onAddComment={handleAddComment}
            onResolve={handleResolveRequest}
            isApproving={isApproving}
            isCommenting={isCommenting}
            isResolving={isResolving}
          />
        </div>
      </div>

      {/* REWORK MODAL */}
      <ReworkModal
        isOpen={isReworkModalOpen}
        onClose={() => setIsReworkModalOpen(false)}
        onSubmit={handleSubmitRework}
        isSubmitting={isSubmittingRework}
        studentName={selectedDetail?.studentName || 'Student'}
        taskTitle={selectedDetail?.question?.slice(0, 40) || 'Task'}
      />
    </div>
  );
};

export default GuidanceInboxPage;

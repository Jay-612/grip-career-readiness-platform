import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import {
  GuidanceHeader,
  GuidanceFilters,
  GuidanceRequestList,
  GuidanceDetailsDrawer,
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
  const [toastMessage, setToastMessage] = useState(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

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

        const targetId = preserveSelectedId || routeRequestId;
        if (targetId) {
          const exists = list.some((r) => String(r.id || r._id) === String(targetId));
          if (exists) {
            setSelectedRequestId(targetId);
            fetchSelectedDetail(targetId);
            setShowMobileDetail(true);
          } else {
            setSelectedRequestId(targetId);
            fetchSelectedDetail(targetId);
          }
        } else if (list.length > 0 && window.innerWidth >= 1024) {
          const firstId = list[0].id || list[0]._id;
          setSelectedRequestId(firstId);
          fetchSelectedDetail(firstId);
        }
      } catch (err) {
        console.error('Error fetching guidance requests:', err);
        setListError(
          err.response?.data?.message ||
            'Unable to load student guidance requests. Please verify your connection.'
        );
      } finally {
        setIsLoadingList(false);
        setIsRefreshing(false);
      }
    },
    [routeRequestId, fetchSelectedDetail]
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRequests(selectedRequestId);
  };

  // ─── 3. Filtering & Sorting ────────────────────────────────────
  const { filteredRequests, counts } = useMemo(() => {
    let pendingCount = 0;
    let inReviewCount = 0;
    let completedCount = 0;

    requests.forEach((r) => {
      const isPending = r.status === 'pending' || !r.replyCount;
      const isCompleted = r.status === 'resolved' || r.status === 'replied';

      if (isPending) {
        pendingCount++;
      } else if (isCompleted) {
        completedCount++;
      } else {
        inReviewCount++;
      }
    });

    const filtered = requests.filter((item) => {
      const isPending = item.status === 'pending' || !item.replyCount;
      const isCompleted = item.status === 'resolved' || item.status === 'replied';

      // Tab filtering
      if (activeTab === 'pending' && !isPending) return false;
      if (activeTab === 'inReview' && (isPending || isCompleted)) return false;
      if (activeTab === 'completed' && !isCompleted) return false;

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
        return dateA - dateB;
      }
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

  // ─── 4. Handlers: Selection & Replies ──────────────────────────
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

  // Add Comment Flow (Reply / Advice to student question)
  const handleAddComment = async (commentText) => {
    if (!selectedRequestId || !commentText.trim()) return;
    setIsCommenting(true);
    try {
      const res = await facultyService.replyGuidanceRequest(selectedRequestId, commentText.trim());
      const replyData = res?.reply || {
        id: `local-${Date.now()}`,
        mentorId: user?.id,
        mentorName: user?.name || 'Faculty Advisor',
        answerText: commentText.trim(),
        date: new Date().toISOString(),
      };

      setSelectedDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'replied',
          replies: [...(prev.replies || []), replyData],
        };
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequestId
            ? {
                ...r,
                status: 'replied',
                replyCount: (r.replyCount || 0) + 1,
                latestReply: replyData,
              }
            : r
        )
      );

      setToastMessage('Guidance advice posted successfully and delivered to student!');
      setTimeout(() => setToastMessage(null), 4000);
      fetchSelectedDetail(selectedRequestId);
    } catch (err) {
      console.error('Failed to post advice:', err);
      alert(
        err.response?.data?.message || 'Failed to post guidance response. Please try again.'
      );
    } finally {
      setIsCommenting(false);
    }
  };

  // Resolve Flow
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
      setToastMessage('Guidance thread resolved!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to resolve guidance request:', err);
      alert(err.response?.data?.message || 'Failed to mark inquiry as resolved.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-4 antialiased" data-purpose="faculty-guidance-inbox">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <GuidanceHeader
        totalCount={counts.all}
        pendingCount={counts.pending}
        inReviewCount={counts.inReview}
        completedCount={counts.completed}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

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
              {filteredRequests.length} {filteredRequests.length === 1 ? 'Inquiry' : 'Inquiries'}
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
            onAddComment={handleAddComment}
            onResolve={handleResolveRequest}
            isCommenting={isCommenting}
            isResolving={isResolving}
          />
        </div>
      </div>
    </div>
  );
};

export default GuidanceInboxPage;

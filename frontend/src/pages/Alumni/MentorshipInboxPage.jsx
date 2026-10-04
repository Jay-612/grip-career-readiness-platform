import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import alumniService from '../../services/alumniService';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import MentorshipRequestItem from '../../components/alumni/MentorshipRequestItem';
import MentorshipDetailsDrawer from '../../components/alumni/MentorshipDetailsDrawer';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Search, CheckCircle2, X, Send, Inbox, Check } from 'lucide-react';

export const MentorshipInboxPage = () => {
  const { requestId: routeRequestId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Requests state
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Tabs: 'pending' | 'active' | 'completed'
  const tabFromQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    ['pending', 'active', 'completed'].includes(tabFromQuery) ? tabFromQuery : 'pending'
  );

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Detail Drawer
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Accept / Reply Modal
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [targetRequestForReply, setTargetRequestForReply] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Decline Modal
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [targetRequestForDecline, setTargetRequestForDecline] = useState(null);

  // Local declined and completed IDs
  const [declinedIds, setDeclinedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('grip_declined_requests');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('grip_completed_mentorships');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await alumniService.getGuidanceRequests({ page: 1, limit: 50 });
      const list = res?.requests || (Array.isArray(res) ? res : []);
      setRequests(list);

      // Handle route request ID param
      if (routeRequestId) {
        const found = list.find((r) => (r.id || r._id) === routeRequestId);
        if (found) {
          setSelectedRequest(found);
          setIsDetailsOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to load mentorship inquiries:', err);
      setError(
        err?.response?.data?.message || 'Unable to connect to campus mentorship inbox.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  // Sync tab with URL if changed
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams(newTab === 'pending' ? {} : { tab: newTab });
  };

  // Filter requests according to tab & search query
  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return requests.filter((r) => {
      const rId = r.id || r._id;
      if (declinedIds.has(rId)) return false;

      const isCompleted = completedIds.has(rId);
      const isReplied = r.status === 'replied' || (r.replyCount && r.replyCount > 0);
      const isPending = !isReplied && !isCompleted;

      // Tab matching
      if (activeTab === 'pending' && !isPending) return false;
      if (activeTab === 'active' && (!isReplied || isCompleted)) return false;
      if (activeTab === 'completed' && !isCompleted) return false;

      // Search matching
      if (q) {
        const student = String(r.studentName || '').toLowerCase();
        const text = String(r.question || '').toLowerCase();
        return student.includes(q) || text.includes(q);
      }

      return true;
    });
  }, [requests, activeTab, searchQuery, declinedIds, completedIds]);

  // Tab counters
  const counts = useMemo(() => {
    let pending = 0;
    let active = 0;
    let completed = 0;

    requests.forEach((r) => {
      const rId = r.id || r._id;
      if (declinedIds.has(rId)) return;

      if (completedIds.has(rId)) {
        completed += 1;
      } else if (r.status === 'replied' || (r.replyCount && r.replyCount > 0)) {
        active += 1;
      } else {
        pending += 1;
      }
    });

    return { pending, active, completed };
  }, [requests, declinedIds, completedIds]);

  // ─── Actions: View, Accept/Reply, Decline, Mark Complete ────────
  const handleViewRequest = async (req) => {
    try {
      const reqId = req.id || req._id;
      const detail = await alumniService.getGuidanceRequestById(reqId);
      setSelectedRequest({
        ...req,
        replies: detail.replies || [],
      });
    } catch {
      setSelectedRequest(req);
    }
    setIsDetailsOpen(true);
  };

  const handleStartAcceptOrReply = (req) => {
    setTargetRequestForReply(req);
    setReplyText(
      req.status === 'replied'
        ? ''
        : `Hello ${req.studentName || 'Student'}, here is my advice on your question: `
    );
    setReplyModalOpen(true);
  };

  const handleConfirmReply = async (e) => {
    if (e) e.preventDefault();
    if (!targetRequestForReply || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const reqId = targetRequestForReply.id || targetRequestForReply._id;
      await alumniService.replyGuidanceRequest(reqId, replyText.trim());

      setToastMessage(
        `Response delivered to ${targetRequestForReply.studentName || 'the student'}. Moved to Active Mentorships.`
      );
      setReplyModalOpen(false);
      setIsDetailsOpen(false);
      setTargetRequestForReply(null);
      setReplyText('');

      // Refresh list
      const updated = await alumniService.getGuidanceRequests({ page: 1, limit: 50 });
      setRequests(updated?.requests || []);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to post reply:', err);
      alert(err?.response?.data?.message || 'Failed to post reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleStartDecline = (req) => {
    setTargetRequestForDecline(req);
    setDeclineModalOpen(true);
  };

  const handleConfirmDecline = () => {
    if (!targetRequestForDecline) return;
    const reqId = targetRequestForDecline.id || targetRequestForDecline._id;

    setDeclinedIds((prev) => {
      const next = new Set(prev);
      next.add(reqId);
      try {
        localStorage.setItem(
          'grip_declined_requests',
          JSON.stringify(Array.from(next))
        );
      } catch {
        // Ignore write error
      }
      return next;
    });

    setToastMessage('Mentorship inquiry declined.');
    setDeclineModalOpen(false);
    setIsDetailsOpen(false);
    setTargetRequestForDecline(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkCompleted = (req) => {
    const reqId = req.id || req._id;
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(reqId);
      try {
        localStorage.setItem(
          'grip_completed_mentorships',
          JSON.stringify(Array.from(next))
        );
      } catch {
        // Ignore write error
      }
      return next;
    });

    setToastMessage('Mentorship marked as concluded and moved to Completed.');
    setIsDetailsOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Mentorship Inbox
          </h1>
          <p className="text-xs text-slate-500">
            Review student guidance inquiries, share career advice, and mentor campus talent.
          </p>
        </div>

        {/* 2. Inbox Navigation Tabs & Search */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => handleTabChange('pending')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                data-testid="tab-pending"
              >
                <span>Guidance Requests</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'pending'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {counts.pending}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('active')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'active'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                data-testid="tab-active"
              >
                <span>Mentorship Requests</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'active'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {counts.active}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('completed')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'completed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                data-testid="tab-completed"
              >
                <span>Completed</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'completed'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {counts.completed}
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="w-full pl-8 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                data-testid="search-inbox-input"
              />
            </div>
          </div>
        </div>

        {/* 3. Requests List */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load mentorship inquiries"
            message={error}
            onRetry={loadRequests}
          />
        ) : filteredRequests.length === 0 ? (
          <div
            className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2 max-w-md mx-auto"
            data-testid="no-inbox-requests"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Inbox className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 font-heading">
              No {activeTab} inquiries
            </h3>
            <p className="text-slate-500">
              {activeTab === 'pending'
                ? 'All student requests have been answered or reviewed.'
                : activeTab === 'active'
                ? 'No active mentorship threads in progress.'
                : 'No historical mentorships recorded in archive.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5" data-testid="inbox-request-list">
            {filteredRequests.map((req) => (
              <MentorshipRequestItem
                key={req.id || req._id}
                request={req}
                onView={handleViewRequest}
                onAccept={handleStartAcceptOrReply}
                onDecline={handleStartDecline}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* ── Modal 1: Respond / Accept Modal ──────────────────────── */}
        {replyModalOpen && targetRequestForReply && (
          <Modal
            isOpen={replyModalOpen}
            onClose={() => setReplyModalOpen(false)}
            title={
              targetRequestForReply.status === 'replied'
                ? 'Reply to Mentee'
                : 'Accept & Provide Guidance'
            }
            size="md"
          >
            <form onSubmit={handleConfirmReply} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs space-y-1">
                <span className="font-bold text-blue-950">
                  Student: {targetRequestForReply.studentName || 'Student Candidate'}
                </span>
                <p className="text-blue-900/80 line-clamp-2">
                  "{targetRequestForReply.question}"
                </p>
              </div>

              <div>
                <label
                  htmlFor="inbox-reply-text"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Your Mentorship Advice
                </label>
                <textarea
                  id="inbox-reply-text"
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Share recommendations, interview preparation advice, or answers..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 leading-relaxed font-sans"
                  disabled={isSubmittingReply}
                  data-testid="inbox-reply-textarea"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyModalOpen(false)}
                  disabled={isSubmittingReply}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingReply}
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="text-xs shadow-xs"
                  data-testid="inbox-submit-reply-btn"
                >
                  Deliver Advice
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* ── Modal 2: Decline Modal ───────────────────────────────── */}
        {declineModalOpen && targetRequestForDecline && (
          <Modal
            isOpen={declineModalOpen}
            onClose={() => setDeclineModalOpen(false)}
            title="Decline Inquiry"
            size="sm"
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Decline inquiry from{' '}
                <strong>{targetRequestForDecline.studentName || 'the student'}</strong>?
                This will remove the question from your pending inbox.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeclineModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmDecline}
                  className="text-xs"
                  data-testid="inbox-confirm-decline-btn"
                >
                  Decline
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* ── Drawer: Mentorship Details ───────────────────────────── */}
        {selectedRequest && (
          <MentorshipDetailsDrawer
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onAccept={handleStartAcceptOrReply}
            onDecline={handleStartDecline}
            onReply={handleStartAcceptOrReply}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MentorshipInboxPage;

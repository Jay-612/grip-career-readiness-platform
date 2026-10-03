import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import alumniService from '../../services/alumniService';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import AlumniDashboardHeader from '../../components/alumni/AlumniDashboardHeader';
import MentorshipRequestList from '../../components/alumni/MentorshipRequestList';
import ActiveMentorshipList from '../../components/alumni/ActiveMentorshipList';
import RecentExperienceCard from '../../components/alumni/RecentExperienceCard';
import AlumniActivitySummary from '../../components/alumni/AlumniActivitySummary';
import MentorshipDetailsDrawer from '../../components/alumni/MentorshipDetailsDrawer';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';

export const AlumniDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [profileData, setProfileData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Progressive Disclosure: Drawer for Request Details
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Accept / Quick Response Modal
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [targetRequestForAccept, setTargetRequestForAccept] = useState(null);
  const [acceptResponseText, setAcceptResponseText] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  // Decline Confirmation State
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [targetRequestForDecline, setTargetRequestForDecline] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  // Local dismissed/declined request IDs
  const [declinedIds, setDeclinedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('grip_declined_requests');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const currentAlumniId = (user?.id || user?._id || '').toString();

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, requestsRes, postsRes] = await Promise.allSettled([
        alumniService.getProfile(),
        alumniService.getGuidanceRequests({ page: 1, limit: 30 }),
        alumniService.getPosts({ page: 1, limit: 20 }),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfileData(profileRes.value);
      }

      if (requestsRes.status === 'fulfilled' && requestsRes.value) {
        const reqList =
          requestsRes.value.requests ||
          (Array.isArray(requestsRes.value) ? requestsRes.value : []);
        setRequests(reqList);
      }

      if (postsRes.status === 'fulfilled' && postsRes.value) {
        const postList =
          postsRes.value.posts ||
          (Array.isArray(postsRes.value) ? postsRes.value : []);
        setPosts(postList);
      }
    } catch (err) {
      console.error('Failed to load alumni dashboard:', err);
      setError(
        err?.response?.data?.message || 'Unable to connect to alumni advisory services.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Filter out locally declined requests
  const visibleRequests = useMemo(() => {
    return requests.filter((r) => !declinedIds.has(r.id || r._id));
  }, [requests, declinedIds]);

  // Posts authored by this alumni
  const myPosts = useMemo(() => {
    return posts.filter((p) => {
      const aId = (p.alumniId?._id || p.alumniId?.id || p.alumniId || '').toString();
      return aId && aId === currentAlumniId;
    });
  }, [posts, currentAlumniId]);

  const latestPost = myPosts[0] || null;

  // Profile details
  const alumniProfile = profileData?.profile || {};
  const alumniName = user?.name || profileData?.user?.name || 'Alumni Mentor';
  const company = alumniProfile.currentCompany || '';
  const jobRole = alumniProfile.jobRole || '';
  const gradYear = alumniProfile.graduationYear ? String(alumniProfile.graduationYear) : '';

  // ─── Actions: Accept / Decline / View ─────────────────────────────
  const handleViewRequest = (req) => {
    setSelectedRequest(req);
    setIsDetailsOpen(true);
  };

  const handleStartAccept = (req) => {
    setTargetRequestForAccept(req);
    setAcceptResponseText(
      `Hello ${req.studentName || 'Student'}, I would be happy to guide you on this! `
    );
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = async (e) => {
    if (e) e.preventDefault();
    if (!targetRequestForAccept || !acceptResponseText.trim()) return;

    setIsAccepting(true);
    try {
      const reqId = targetRequestForAccept.id || targetRequestForAccept._id;
      await alumniService.replyGuidanceRequest(reqId, acceptResponseText.trim());

      setToastMessage(
        `Mentorship request accepted! Advice delivered to ${targetRequestForAccept.studentName || 'the student'}.`
      );
      setAcceptModalOpen(false);
      setIsDetailsOpen(false);
      setTargetRequestForAccept(null);
      setAcceptResponseText('');

      // Refresh requests immediately
      const updated = await alumniService.getGuidanceRequests({ page: 1, limit: 30 });
      setRequests(updated?.requests || []);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to accept mentorship request:', err);
      alert(err?.response?.data?.message || 'Failed to accept mentorship request.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleStartDecline = (req) => {
    setTargetRequestForDecline(req);
    setDeclineReason('');
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
        // Ignore storage write issues
      }
      return next;
    });

    setToastMessage('Mentorship request dismissed.');
    setDeclineModalOpen(false);
    setIsDetailsOpen(false);
    setTargetRequestForDecline(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenMentorship = (req) => {
    const reqId = req.id || req._id;
    navigate(`/alumni/mentorship/${reqId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <Skeleton className="h-16 w-3/4 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-2xl mx-auto">
        <ErrorState
          title="Alumni Dashboard Error"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const pendingCount = visibleRequests.filter(
    (r) => r.status === 'pending' || !r.replyCount
  ).length;
  const activeCount = visibleRequests.filter(
    (r) => r.status === 'replied' || (r.replyCount && r.replyCount > 0)
  ).length;

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Toast Notification */}
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
        <AlumniDashboardHeader
          alumniName={alumniName}
          currentCompany={company}
          jobRole={jobRole}
          graduationYear={gradYear}
        />

        {/* 2. Pending Mentorship Requests (Highest Priority) */}
        <MentorshipRequestList
          requests={visibleRequests}
          onAccept={handleStartAccept}
          onDecline={handleStartDecline}
          onView={handleViewRequest}
          maxDisplay={3}
        />

        {/* 3. Active Mentorships */}
        <ActiveMentorshipList
          mentorships={visibleRequests}
          onOpenMentorship={handleOpenMentorship}
          maxDisplay={3}
        />

        {/* 4. Recent Published Experience */}
        <RecentExperienceCard
          post={latestPost}
          onView={() => navigate('/alumni/experience')}
          onEdit={() => navigate('/alumni/experience?action=edit')}
        />

        {/* 5. Compact Engagement Summary */}
        <AlumniActivitySummary
          studentsMentored={activeCount}
          experiencesPublished={myPosts.length}
          pendingInquiries={pendingCount}
        />

        {/* 6. Quick Links Navigation */}
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
          <Link
            to="/alumni/mentorship"
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            data-testid="link-mentorship-inbox"
          >
            <span>Mentorship Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/alumni/experience?action=new"
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            data-testid="link-publish-experience"
          >
            <span>Publish Experience</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/alumni/experience"
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            data-testid="link-my-experiences"
          >
            <span>My Experiences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Modal 1: Accept Mentorship Request ───────────────────── */}
        {acceptModalOpen && targetRequestForAccept && (
          <Modal
            isOpen={acceptModalOpen}
            onClose={() => setAcceptModalOpen(false)}
            title="Accept Mentorship Request"
            size="md"
          >
            <form onSubmit={handleConfirmAccept} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs space-y-1">
                <span className="font-bold text-blue-950">
                  Student: {targetRequestForAccept.studentName || 'Student Candidate'}
                </span>
                <p className="text-blue-900/80 line-clamp-2">
                  "{targetRequestForAccept.question}"
                </p>
              </div>

              <div>
                <label
                  htmlFor="accept-response"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Your Initial Advice / Guidance
                </label>
                <textarea
                  id="accept-response"
                  rows={4}
                  value={acceptResponseText}
                  onChange={(e) => setAcceptResponseText(e.target.value)}
                  placeholder="Share recommendations, interview preparation advice, or answer the student's question..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 leading-relaxed"
                  disabled={isAccepting}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAcceptModalOpen(false)}
                  disabled={isAccepting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isAccepting}
                  disabled={isAccepting || !acceptResponseText.trim()}
                  className="text-xs shadow-xs"
                >
                  Accept &amp; Send Advice
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* ── Modal 2: Decline Confirmation ───────────────────────── */}
        {declineModalOpen && targetRequestForDecline && (
          <Modal
            isOpen={declineModalOpen}
            onClose={() => setDeclineModalOpen(false)}
            title="Decline Mentorship Request"
            size="sm"
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Are you sure you want to decline this request from{' '}
                <strong>{targetRequestForDecline.studentName || 'the student'}</strong>?
                The request will be removed from your active queue.
              </p>

              <div>
                <label
                  htmlFor="decline-reason"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  Optional Note (Internal)
                </label>
                <input
                  id="decline-reason"
                  type="text"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g., Outside my technical domain / No capacity"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeclineModalOpen(false)}
                  className="text-xs"
                >
                  Keep Request
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmDecline}
                  className="text-xs"
                  data-testid="confirm-decline-btn"
                >
                  Decline Request
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
            onAccept={handleStartAccept}
            onDecline={handleStartDecline}
            onReply={handleOpenMentorship}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AlumniDashboard;

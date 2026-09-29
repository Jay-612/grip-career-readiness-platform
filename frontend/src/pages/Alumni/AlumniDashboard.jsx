import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import alumniService from '../../services/alumniService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import {
  GraduationCap,
  Sparkles,
  Send,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  Building2,
  Briefcase,
  Calendar,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Edit3,
  ShieldCheck,
  Check,
  X,
  FileText
} from 'lucide-react';

export const AlumniDashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // State management
  const [profileData, setProfileData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [posts, setPosts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Edit Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    currentCompany: '',
    jobRole: '',
    graduationYear: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Load all dashboard data in parallel from real backend endpoints
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, requestsRes, postsRes, appointmentsRes] = await Promise.allSettled([
        alumniService.getProfile(),
        alumniService.getGuidanceRequests({ page: 1, limit: 30 }),
        alumniService.getPosts({ page: 1, limit: 20 }),
        alumniService.getAppointments(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfileData(profileRes.value);
        const p = profileRes.value.profile || {};
        const u = profileRes.value.user || user || {};
        setProfileForm({
          name: u.name || '',
          currentCompany: p.currentCompany || '',
          jobRole: p.jobRole || '',
          graduationYear: p.graduationYear ? String(p.graduationYear) : '',
        });
      }

      if (requestsRes.status === 'fulfilled' && requestsRes.value) {
        const reqList = requestsRes.value.requests || (Array.isArray(requestsRes.value) ? requestsRes.value : []);
        setRequests(reqList);
      }

      if (postsRes.status === 'fulfilled' && postsRes.value) {
        const postList = postsRes.value.posts || (Array.isArray(postsRes.value) ? postsRes.value : []);
        setPosts(postList);
      }

      if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value) {
        setAppointments(Array.isArray(appointmentsRes.value) ? appointmentsRes.value : []);
      }
    } catch (err) {
      console.error('Failed to load alumni dashboard data:', err);
      setError(err?.response?.data?.message || 'Unable to connect to alumni advisory services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Derived real data
  const currentAlumniId = (user?.id || user?._id || '').toString();

  // Pending guidance requests waiting for answer
  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'pending');
  }, [requests]);

  // Active / replied conversations
  const activeConversations = useMemo(() => {
    return requests.filter((r) => r.status === 'replied' || (r.replyCount && r.replyCount > 0));
  }, [requests]);

  // Posts authored by this authenticated alumni
  const myPosts = useMemo(() => {
    return posts.filter((p) => {
      const authorId = (p.alumniId?._id || p.alumniId?.id || p.alumniId || '').toString();
      return authorId && authorId === currentAlumniId;
    });
  }, [posts, currentAlumniId]);

  // Profile details
  const alumniProfile = profileData?.profile || {};
  const alumniName = user?.name || profileData?.user?.name || 'Alumni Mentor';
  const company = alumniProfile.currentCompany || 'Industry Partner';
  const jobRole = alumniProfile.jobRole || 'Alumni Advisor';
  const gradYear = alumniProfile.graduationYear || '';

  // Trigger Quick Reply Modal
  const openReplyModal = (reqItem) => {
    setActiveRequest(reqItem);
    setReplyText('');
    setReplyModalOpen(true);
  };

  // Submit Mentorship Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeRequest || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      await alumniService.replyGuidanceRequest(activeRequest.id, replyText.trim());
      setToastMessage(`Response successfully delivered to ${activeRequest.studentName || 'the student'}.`);
      setReplyModalOpen(false);
      setActiveRequest(null);
      setReplyText('');

      // Refresh requests to update state immediately
      const updated = await alumniService.getGuidanceRequests({ page: 1, limit: 30 });
      setRequests(updated?.requests || []);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to post mentorship reply:', err);
      alert(err?.response?.data?.message || 'Failed to submit mentorship reply. Please try again.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Submit Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const payload = {
        name: profileForm.name.trim(),
        currentCompany: profileForm.currentCompany.trim(),
        jobRole: profileForm.jobRole.trim(),
      };
      if (profileForm.graduationYear) {
        payload.graduationYear = parseInt(profileForm.graduationYear, 10);
      }

      const res = await alumniService.updateProfile(payload);
      if (updateUser) {
        updateUser({ name: payload.name });
      }
      setProfileData((prev) => ({
        ...prev,
        user: { ...prev?.user, name: payload.name },
        profile: { ...prev?.profile, ...payload },
      }));

      setToastMessage('Professional profile updated successfully.');
      setProfileModalOpen(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update alumni profile:', err);
      setProfileError(err?.response?.data?.message || 'Failed to update profile. Please verify your inputs.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto py-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-96 rounded-2xl" />
          <Skeleton className="lg:col-span-4 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-2xl mx-auto">
        <ErrorState
          title="Alumni Dashboard Synchronization Error"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-[1400px] mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-900 text-white shadow-lg border border-emerald-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TIER 1: ALUMNI HEADER (Banner)                                            */}
      {/* ========================================================================= */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-[#0d223c] to-[#08182b] text-white p-6 md:p-8 card-shadow relative overflow-hidden">
        {/* Watermark Icon */}
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs backdrop-blur-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Institutional Alumni Advisor Network • Verified Academic Credential</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {alumniName}!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {jobRole} {company ? `at ${company}` : ''}
              {gradYear ? ` • Class of ${gradYear}` : ''}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/alumni/mentorship"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mentorship Inbox</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                  {pendingRequests.length} pending
                </span>
              )}
            </Link>

            <Link
              to="/alumni/experience"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              <span>Share Experience</span>
            </Link>

            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-300" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TIER 2: COMPACT SUMMARY (3 Real Metrics)                                  */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Pending Mentorship Inquiries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Pending Inquiries
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {pendingRequests.length}
              </span>
              <span className="text-xs text-amber-700 font-medium">
                {pendingRequests.length === 1 ? 'student awaiting guidance' : 'students awaiting guidance'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Unanswered requests in Mentorship Inbox
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 stroke-[1.5]" />
          </div>
        </div>

        {/* Metric 2: Active Mentorship Discussions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active Discussions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {activeConversations.length}
              </span>
              <span className="text-xs text-emerald-700 font-medium">
                replied &amp; ongoing
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Guidance threads with active mentor replies
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 stroke-[1.5]" />
          </div>
        </div>

        {/* Metric 3: Published Experiences */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Published Experiences
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {myPosts.length}
              </span>
              <span className="text-xs text-blue-700 font-medium">
                authored articles
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Shared career transitions &amp; industry guides
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 stroke-[1.5]" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TIER 3: TWO-COLUMN ACTION-ORIENTED LAYOUT (8 Cols Left / 4 Cols Right)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols): Needs Attention + Mentorship Overview */}
        <div className="lg:col-span-8 space-y-6">
          {/* ===================================================================== */}
          {/* SECTION: NEEDS ATTENTION                                              */}
          {/* ===================================================================== */}
          <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500 text-white">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Needs Attention</h2>
                  <p className="text-xs text-slate-500">
                    Unanswered student mentorship questions awaiting advisor review.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                {pendingRequests.length} Pending
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <EmptyState
                compact
                icon={<CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[1.5]" />}
                title="All Caught Up!"
                description="There are currently no unanswered student guidance requests waiting for review. New student inquiries will appear here automatically."
              />
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map((reqItem) => {
                  const reqDate = reqItem.date ? new Date(reqItem.date).toLocaleDateString() : 'Recent';

                  return (
                    <div
                      key={reqItem.id}
                      className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/70 hover:border-amber-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <h4 className="text-xs font-bold text-slate-900">
                            {reqItem.studentName || 'Student Candidate'}
                          </h4>
                          <span className="text-[11px] text-slate-400">• {reqDate}</span>
                          <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Unanswered
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                          "{reqItem.question}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <Link
                          to={`/alumni/mentorship/${reqItem.id}`}
                          className="h-8 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Open Thread</span>
                        </Link>
                        <button
                          onClick={() => openReplyModal(reqItem)}
                          className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Quick Reply</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {pendingRequests.length > 3 && (
                  <div className="pt-2 text-center">
                    <Link
                      to="/alumni/mentorship"
                      className="text-xs text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>View all {pendingRequests.length} pending questions in Mentorship Inbox</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ===================================================================== */}
          {/* SECTION: MENTORSHIP ACTIVITY                                          */}
          {/* ===================================================================== */}
          <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-600 text-white">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Mentorship Activity</h2>
                  <p className="text-xs text-slate-500">
                    Recent campus student inquiries and ongoing guidance threads.
                  </p>
                </div>
              </div>
              <Link
                to="/alumni/mentorship"
                className="text-xs text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>View Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {requests.length === 0 ? (
              <EmptyState
                compact
                icon={<MessageSquare className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
                title="No Guidance Requests Logged"
                description="When students submit career or technical guidance questions, they will be listed here for alumni advice."
              />
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((reqItem) => {
                  const reqDate = reqItem.date ? new Date(reqItem.date).toLocaleDateString() : 'Recent';
                  const isReplied = reqItem.status === 'replied' || (reqItem.replyCount && reqItem.replyCount > 0);

                  return (
                    <div
                      key={reqItem.id}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {(reqItem.studentName || 'S').charAt(0).toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {reqItem.studentName || 'Student Candidate'}
                          </span>
                          <span className="text-[11px] text-slate-400 hidden sm:inline">• {reqDate}</span>
                        </div>
                        <Badge variant={isReplied ? 'success' : 'warning'} size="xs">
                          {isReplied ? 'Replied' : 'Pending'}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        "{reqItem.question}"
                      </p>

                      {reqItem.latestReply && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-slate-800">
                              {reqItem.latestReply.mentorName || 'Mentor'}:{' '}
                            </span>
                            <span className="text-slate-600 line-clamp-1">
                              {reqItem.latestReply.answerText}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                        <span>
                          {reqItem.replyCount || (reqItem.latestReply ? 1 : 0)}{' '}
                          {reqItem.replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/alumni/mentorship/${reqItem.id}`}
                            className="font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-0.5"
                          >
                            <span>Open Thread</span>
                          </Link>
                          <button
                            onClick={() => openReplyModal(reqItem)}
                            className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <span>{isReplied ? 'Add Follow-Up' : 'Post Reply'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (4 Cols): Experience Overview + Profile Impact */}
        <div className="lg:col-span-4 space-y-6">
          {/* ===================================================================== */}
          {/* SECTION: EXPERIENCE OVERVIEW                                          */}
          {/* ===================================================================== */}
          <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-600 text-white">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Published Experiences</h3>
                  <p className="text-[11px] text-slate-500">Industry insights &amp; guides</p>
                </div>
              </div>
              <Link
                to="/alumni/experience"
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <span>All Posts</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {myPosts.length === 0 ? (
              <EmptyState
                compact
                icon={<BookOpen className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
                title="No Experiences Published Yet"
                description="Share your transition into tech, interview preparation tips, and corporate insights with aspiring juniors."
                action={
                  <Link to="/alumni/experience">
                    <Button variant="outline" size="xs" leftIcon={<Plus className="w-3 h-3" />}>
                      Publish First Guide
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {myPosts.slice(0, 3).map((post) => {
                  const pDate = post.date ? new Date(post.date).toLocaleDateString() : 'Recent';

                  return (
                    <div
                      key={post._id || post.id}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="text-slate-400">{pDate}</span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                          Published
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {post.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {post.tags.slice(0, 3).map((t, tidx) => (
                            <span
                              key={tidx}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[10px]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-2 text-center border-t border-slate-100">
                  <Link
                    to="/alumni/experience"
                    className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Manage All {myPosts.length} Published Articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* ===================================================================== */}
          {/* SECTION: ALUMNI PROFESSIONAL PROFILE CARD                             */}
          {/* ===================================================================== */}
          <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-600 text-white">
                  <Briefcase className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Advisor Credentials</h3>
                  <p className="text-[11px] text-slate-500">Verified institutional profile</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Current Organization</span>
                <span className="font-semibold text-slate-900">{company}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Designation / Role</span>
                <span className="font-semibold text-slate-900">{jobRole}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Graduation Year</span>
                <span className="font-semibold text-slate-900">
                  {gradYear ? `Class of ${gradYear}` : 'Not Specified'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Advisory Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Active Mentor
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
              Your professional milestones are displayed to students in the Campus Career Compass to guide their curriculum electives and placement interview preparation.
            </div>
          </section>

          {/* ===================================================================== */}
          {/* SECTION: QUICK ACTIONS                                                */}
          {/* ===================================================================== */}
          <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/alumni/mentorship"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>Respond to Mentorship Requests</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/alumni/experience"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Publish Industry Experience</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Update Advisory Profile</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: QUICK REPLY TO STUDENT MENTORSHIP REQUEST                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={replyModalOpen}
        onClose={() => !isSubmittingReply && setReplyModalOpen(false)}
        title="Post Mentorship Reply"
        description="Share your practical industry perspective and guidance with the student."
        size="md"
      >
        {activeRequest && (
          <form onSubmit={handleSendReply} className="space-y-4 pt-1">
            {/* Student Inquiry Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-800">
                  {activeRequest.studentName || 'Student Candidate'}
                </span>
                <span>{activeRequest.date ? new Date(activeRequest.date).toLocaleDateString() : ''}</span>
              </div>
              <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
                "{activeRequest.question}"
              </p>
            </div>

            {/* Answer Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Your Advice / Response</span>
                <span className="text-slate-400 font-normal">Markdown supported</span>
              </label>
              <textarea
                required
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your recommendation, interview tips, or technical guidance..."
                className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-3 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isSubmittingReply}
                onClick={() => setReplyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmittingReply}
                loadingText="Delivering Response..."
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Guidance Response
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: EDIT ALUMNI ADVISORY PROFILE                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => !isSavingProfile && setProfileModalOpen(false)}
        title="Update Alumni Advisory Profile"
        description="Keep your current company and job title accurate so students can reach out for relevant guidance."
        size="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
          {profileError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Current Company */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Current Company / Organization</label>
            <input
              type="text"
              required
              value={profileForm.currentCompany}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, currentCompany: e.target.value }))}
              placeholder="e.g. TechCorp, CloudSys, ScaleScale"
              className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Job Role */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Job Role / Designation</label>
            <input
              type="text"
              required
              value={profileForm.jobRole}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, jobRole: e.target.value }))}
              placeholder="e.g. Staff SWE, Backend Architect, DevOps Engineer"
              className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Graduation Year */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Graduation Year</label>
            <input
              type="number"
              min={1970}
              max={new Date().getFullYear()}
              value={profileForm.graduationYear}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, graduationYear: e.target.value }))}
              placeholder="e.g. 2021"
              className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSavingProfile}
              onClick={() => setProfileModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingProfile}
              loadingText="Saving..."
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const SafeAlumniDashboard = (props) => (
  <ErrorBoundary fallbackTitle="Alumni Dashboard Error">
    <AlumniDashboard {...props} />
  </ErrorBoundary>
);

export default SafeAlumniDashboard;


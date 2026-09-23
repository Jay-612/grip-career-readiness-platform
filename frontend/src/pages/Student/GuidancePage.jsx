import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Send,
  Building2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import guidanceService from '../../services/guidanceService';
import mentorService from '../../services/mentorService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';

export const GuidancePage = () => {
  const { user } = useAuth();

  // Data States
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [recommendedMentors, setRecommendedMentors] = useState([]);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'awaiting' | 'answered'
  const [searchQuery, setSearchQuery] = useState('');

  // Ask Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formCategory, setFormCategory] = useState('General Career');
  const [questionText, setQuestionText] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Mobile view toggle (show thread vs show list)
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'thread'

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  // Helper: Extract Topic/Category from question text if formatted as [Category] ...
  const parseQuestion = (rawText) => {
    if (!rawText) return { topic: 'Career Guidance', body: '' };
    const match = rawText.match(/^\[(.*?)\]\s*([\s\S]*)$/);
    if (match) {
      return {
        topic: match[1].trim(),
        body: match[2].trim(),
      };
    }
    return {
      topic: 'Career Guidance',
      body: rawText,
    };
  };

  // Fetch all guidance requests and recommended mentors
  const fetchGuidanceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Concurrently fetch questions list and recommended mentors
      const [requestsRes, mentorsRes] = await Promise.allSettled([
        guidanceService.getRequests(1, 50),
        mentorService.getRecommendedMentors(),
      ]);

      let loadedQuestions = [];

      if (requestsRes.status === 'fulfilled' && requestsRes.value?.requests) {
        const rawList = requestsRes.value.requests;

        // 2. Fetch full details/replies for each request in parallel to compute accurate status
        const detailsResults = await Promise.allSettled(
          rawList.map((req) => guidanceService.getRequestById(req.id))
        );

        loadedQuestions = rawList.map((req, idx) => {
          const detailRes = detailsResults[idx];
          const replies =
            detailRes.status === 'fulfilled' && detailRes.value?.replies
              ? detailRes.value.replies
              : [];
          return {
            ...req,
            replies,
            status: replies.length > 0 ? 'answered' : 'awaiting',
          };
        });

        setQuestions(loadedQuestions);

        // Select the first question by default if none selected or previous selection no longer exists
        if (loadedQuestions.length > 0) {
          const defaultSelected =
            loadedQuestions.find((q) => q.id === selectedQuestionId) || loadedQuestions[0];
          setSelectedQuestionId(defaultSelected.id);
          setActiveThread(defaultSelected);
        } else {
          setSelectedQuestionId(null);
          setActiveThread(null);
        }
      }

      if (mentorsRes.status === 'fulfilled' && Array.isArray(mentorsRes.value)) {
        setRecommendedMentors(mentorsRes.value);
      }
    } catch (err) {
      console.error('Failed to load mentorship & guidance data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load guidance threads. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidanceData();
  }, [user?.id]);

  // When selected question ID changes, update active thread
  const handleSelectQuestion = async (questionId) => {
    setSelectedQuestionId(questionId);
    setMobileView('thread');

    // Find locally cached question
    const cached = questions.find((q) => q.id === questionId);
    if (cached) {
      setActiveThread(cached);
    }

    // Refresh thread from backend to ensure freshest replies
    setIsLoadingThread(true);
    try {
      const res = await guidanceService.getRequestById(questionId);
      if (res?.request) {
        const updated = {
          ...res.request,
          replies: res.replies || [],
          status: (res.replies || []).length > 0 ? 'answered' : 'awaiting',
        };
        setActiveThread(updated);
        // Also update the question item in the list
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? updated : q))
        );
      }
    } catch (err) {
      console.error('Failed to refresh thread:', err);
    } finally {
      setIsLoadingThread(false);
    }
  };

  // Guidance Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = questions.length;
    const answered = questions.filter((q) => q.status === 'answered').length;
    const awaiting = questions.filter((q) => q.status === 'awaiting').length;

    // Latest update
    let latestDate = null;
    if (total > 0) {
      const timestamps = questions
        .map((q) => (q.date ? new Date(q.date).getTime() : 0))
        .filter((t) => t > 0);
      if (timestamps.length > 0) {
        latestDate = formatDate(new Date(Math.max(...timestamps)));
      }
    }

    return {
      total,
      answered,
      awaiting,
      latestDate: latestDate || 'No recent activity',
    };
  }, [questions]);

  // Filtered Questions List
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Status filter
    if (statusFilter === 'awaiting') {
      result = result.filter((q) => q.status === 'awaiting');
    } else if (statusFilter === 'answered') {
      result = result.filter((q) => q.status === 'answered');
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => item.question.toLowerCase().includes(q));
    }

    return result;
  }, [questions, statusFilter, searchQuery]);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!questionText.trim()) {
      errors.question = 'Please provide details for your question or guidance request.';
    } else if (questionText.trim().length < 15) {
      errors.question = 'Question must be at least 15 characters to provide sufficient context for mentors.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Question Handler
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Format payload with topic prefix for clean organization
      const formattedQuestion = `[${formCategory}] ${questionText.trim()}`;

      const res = await guidanceService.createRequest(formattedQuestion);

      setSuccessToast('Your guidance question has been submitted to faculty and alumni mentors!');
      setTimeout(() => setSuccessToast(null), 4000);

      // Reset form and close modal
      setQuestionText('');
      setFormCategory('General Career');
      setIsModalOpen(false);

      // Refresh list and select the newly created question
      await fetchGuidanceData();

      if (res?.request?.id) {
        handleSelectQuestion(res.request.id);
      }
    } catch (err) {
      console.error('Failed to submit guidance request:', err);
      setFormErrors({
        submit:
          err.response?.data?.message ||
          'Failed to submit guidance question. Please check your network and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Role Badge for Responders
  const renderRoleBadge = (role) => {
    const normRole = (role || '').toLowerCase();
    if (normRole === 'faculty') {
      return (
        <Badge variant="info" size="xs" icon={<GraduationCap className="w-3 h-3" />}>
          Faculty Mentor
        </Badge>
      );
    }
    if (normRole === 'alumni') {
      return (
        <Badge variant="tier1" size="xs" icon={<Briefcase className="w-3 h-3" />}>
          Alumni Mentor
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="xs">
        {role || 'Verified Advisor'}
      </Badge>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton variant="text" width="240px" height="28px" />
            <Skeleton variant="text" width="420px" height="16px" />
          </div>
          <Skeleton variant="rectangular" width="140px" height="38px" />
        </div>

        {/* Summary Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Main Workspace Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="lg:col-span-7">
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && questions.length === 0) {
    return (
      <ErrorState
        title="Unable to Load Mentorship & Q&A Hub"
        message={error}
        onRetry={fetchGuidanceData}
        retryText="Retry Loading"
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
              Mentorship & Q&A
            </h1>
            <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
              Advisory Hub
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Ask career questions, receive guidance, and connect with faculty and alumni mentors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGuidanceData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            title="Refresh threads"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm"
          >
            Ask a Question
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. COMPACT GUIDANCE SUMMARY (Real API Data Only)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions Submitted */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                Total Inquiries
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {summaryMetrics.total}
                </span>
                <span className="text-xs text-slate-400 font-medium">Submitted</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Dispatched to departmental advisory board
          </span>
        </div>

        {/* Awaiting Reply */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                Awaiting Reply
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight font-mono">
                  {summaryMetrics.awaiting}
                </span>
                <Badge variant="warning" size="sm" dot>
                  In Review
                </Badge>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Queued for mentor guidance review
          </span>
        </div>

        {/* Answered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                Answered Threads
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight font-mono">
                  {summaryMetrics.answered}
                </span>
                <Badge variant="success" size="sm" dot>
                  Resolved
                </Badge>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-2">
            Verified guidance from verified mentors
          </span>
        </div>

        {/* Recently Updated */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                Latest Activity
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  {summaryMetrics.latestDate}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Chronological thread synchronization
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3 & 4. MAIN WORKSPACE: QUESTIONS LIST & THREAD VIEW
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: My Questions List (lg:col-span-5) */}
        <div
          className={`
            lg:col-span-5 space-y-3.5
            ${mobileView === 'thread' ? 'hidden lg:block' : 'block'}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                My Inquiries
              </h2>
              <span className="text-xs text-slate-400 font-normal">
                ({filteredQuestions.length})
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search your questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
            />
          </div>

          {/* Filter Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All', count: questions.length },
              { id: 'awaiting', label: 'Awaiting Reply', count: summaryMetrics.awaiting },
              { id: 'answered', label: 'Answered', count: summaryMetrics.answered },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
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

          {/* Question Cards Feed */}
          {filteredQuestions.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
              title={
                searchQuery
                  ? `No questions matching "${searchQuery}"`
                  : statusFilter !== 'all'
                  ? `No questions with status "${statusFilter}"`
                  : 'No Guidance Requests Yet'
              }
              description={
                searchQuery
                  ? 'Try searching with different keywords or clear the filter.'
                  : 'Reach out to faculty and alumni mentors for guidance on roadmaps, interview prep, or career transitions.'
              }
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Ask a Question
                </Button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {filteredQuestions.map((q) => {
                const isSelected = selectedQuestionId === q.id;
                const parsed = parseQuestion(q.question);
                const replyCount = (q.replies || []).length;
                const isAnswered = replyCount > 0;

                return (
                  <div
                    key={q.id}
                    onClick={() => handleSelectQuestion(q.id)}
                    className={`
                      p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col gap-2.5 text-left
                      ${
                        isSelected
                          ? 'bg-blue-50/40 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-card shadow-xs'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {parsed.topic}
                      </span>
                      {isAnswered ? (
                        <Badge variant="success" size="xs" dot>
                          {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="xs" dot>
                          Awaiting Reply
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight leading-snug line-clamp-2">
                      {parsed.body}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(q.date)}</span>
                      </div>
                      <span className="text-blue-600 font-semibold text-[11px] flex items-center gap-0.5">
                        <span>View thread</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Complete Thread View (lg:col-span-7) */}
        <div
          className={`
            lg:col-span-7 space-y-4
            ${mobileView === 'list' ? 'hidden lg:block' : 'block'}
          `}
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setMobileView('list')}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Questions List
            </Button>
          </div>

          {activeThread ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 sm:p-6 space-y-6">
              {/* Question Header */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    {parseQuestion(activeThread.question).topic}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeThread.status === 'answered' ? (
                      <Badge variant="success" size="sm" dot>
                        Answered
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" dot>
                        Awaiting Reply
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{activeThread.studentName || user?.name || 'You'}</span>
                    </span>
                    <span>{formatDate(activeThread.date)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-wrap font-normal">
                    {parseQuestion(activeThread.question).body}
                  </p>
                </div>
              </div>

              {/* Thread Replies Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Mentor Responses ({(activeThread.replies || []).length})</span>
                  </h3>
                  {isLoadingThread && (
                    <span className="text-[11px] text-slate-400 animate-pulse">
                      Syncing thread...
                    </span>
                  )}
                </div>

                {(activeThread.replies || []).length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 text-amber-500 stroke-[1.5]" />
                    <h4 className="text-xs font-semibold text-slate-800">
                      No Mentor Responses Yet
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                      Your query has been routed to verified Department Faculty and Alumni Mentors.
                      You will receive guidance here once a mentor replies.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeThread.replies.map((reply, idx) => (
                      <div
                        key={reply.id || idx}
                        className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/40 via-white to-slate-50/30 border border-emerald-200/80 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                              {reply.mentorName ? reply.mentorName.charAt(0).toUpperCase() : 'M'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900 leading-tight">
                                {reply.mentorName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Verified Institutional Responder
                              </span>
                            </div>
                          </div>

                          <div>{renderRoleBadge(reply.mentorRole)}</div>
                        </div>

                        {/* Answer Text */}
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap pl-1">
                          {reply.answerText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Restricted Student Reply Notice */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-start gap-2.5 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Institutional Advisory Thread:</strong> Responses on this forum are
                    exclusively provided by verified Faculty Advisors and registered Alumni Mentors
                    to preserve pedagogical and technical accuracy.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-10 text-center flex flex-col items-center gap-3">
              <MessageSquare className="w-10 h-10 text-slate-300 stroke-[1.5]" />
              <h3 className="text-sm font-semibold text-slate-800">No Question Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select an inquiry from the list on the left to review the discussion and read mentor
                replies.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Ask a Question
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6 & 7. RECOMMENDED MENTORS DIRECTORY
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Recommended Faculty & Alumni Mentors
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            ({recommendedMentors.length} active mentors)
          </span>
        </div>

        {recommendedMentors.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center gap-2">
            <User className="w-8 h-8 text-slate-300" />
            <span className="text-xs font-medium text-slate-600">
              No recommended mentors currently listed
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedMentors.map((mentor, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-150 flex flex-col justify-between gap-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                        {mentor.name}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{mentor.careerTag || 'Campus Advisor'}</span>
                      </span>
                    </div>
                  </div>

                  <div>{renderRoleBadge(mentor.role)}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Available for Q&A
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setFormCategory(
                        mentor.role === 'Faculty' ? 'Academic & Research' : 'Industry Transition'
                      );
                      setQuestionText(`@${mentor.name}: `);
                      setIsModalOpen(true);
                    }}
                    leftIcon={<Send className="w-3 h-3 text-blue-600" />}
                    className="text-[11px]"
                  >
                    Direct Inquiry
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. ASK A QUESTION MODAL (Dispatches POST /api/guidance/request)
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Submit a Guidance Question"
        description="Your question will be routed to departmental faculty advisors and verified alumni mentors."
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          {formErrors.submit && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formErrors.submit}</span>
            </div>
          )}

          {/* Topic / Category Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Guidance Category
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
            >
              <option value="System Design & Architecture">System Design & Architecture</option>
              <option value="DSA & Competitive Coding">DSA & Competitive Coding</option>
              <option value="Placement Drive Preparation">Placement Drive Preparation</option>
              <option value="Capstone & Academic Research">Capstone & Academic Research</option>
              <option value="Resume & Portfolio Review">Resume & Portfolio Review</option>
              <option value="General Career Guidance">General Career Guidance</option>
            </select>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Question Details</span>
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              placeholder="Clearly state your question or technical blocker. For example: How should I structure my preparation for Tier-1 distributed systems interviews while balancing Semester 5 coursework?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className={`
                w-full bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-lg border p-3 transition-colors focus:outline-none resize-none
                ${
                  formErrors.question
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                }
              `}
            />
            {formErrors.question && (
              <p className="text-xs text-rose-600 font-medium">{formErrors.question}</p>
            )}
            <p className="text-[11px] text-slate-400">
              Questions are shared with institutional mentors. Keep inquiries constructive and professional.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              loadingText="Submitting..."
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post Question
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GuidancePage;

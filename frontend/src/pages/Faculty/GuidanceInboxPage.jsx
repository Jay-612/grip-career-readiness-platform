import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Send,
  User,
  ShieldCheck,
  Code2,
  FileText,
  CornerDownRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Video,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const QUICK_PRESETS = [
  '+ Suggest Single-Flight Pattern',
  '+ Recommend Monotonic Fencing Tokens',
  '+ Suggest CDC via Debezium',
  '+ Recommend Cache-Aside with Delayed Invalidation',
  '+ Pre-Approve Solution Architecture',
];

const GuidanceInboxPage = () => {
  const { requestId: routeRequestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Master List State
  const [requests, setRequests] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'replied'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Detail State
  const [selectedRequestId, setSelectedRequestId] = useState(routeRequestId || null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Student Dossier Context
  const [studentReadiness, setStudentReadiness] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);

  // Reply Composer State
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);
  const [endorseArchitecture, setEndorseArchitecture] = useState(true);
  const [ticketOutcome, setTicketOutcome] = useState('resolved'); // 'resolved' | 'review' | 'meet'

  // Mobile navigation state
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Textarea ref for macro insertion and keyboard shortcut
  const textareaRef = useRef(null);
  const conversationBottomRef = useRef(null);

  // ─── 1. Fetch All Guidance Requests ─────────────────────────────
  const fetchRequests = async (preserveSelected = true) => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const res = await facultyService.getGuidanceRequests(1, 50);
      const list = Array.isArray(res) ? res : res?.requests || [];
      setRequests(list);

      // Select initial request if none selected or if route changed
      if (list.length > 0) {
        if (routeRequestId) {
          const match = list.find((r) => r.id === routeRequestId);
          if (match) {
            setSelectedRequestId(match.id);
            setShowMobileDetail(true);
          } else {
            setSelectedRequestId(list[0].id);
          }
        } else if (!preserveSelected || !selectedRequestId) {
          // Default to first pending request or first item
          const firstPending = list.find((r) => r.status === 'pending');
          setSelectedRequestId(firstPending ? firstPending.id : list[0].id);
        }
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
  };

  useEffect(() => {
    fetchRequests(false);
  }, []);

  // Sync route param changes
  useEffect(() => {
    if (routeRequestId && routeRequestId !== selectedRequestId) {
      setSelectedRequestId(routeRequestId);
      setShowMobileDetail(true);
    }
  }, [routeRequestId]);

  // ─── 2. Fetch Selected Request Detail & Student Context ─────────
  const fetchSelectedDetail = async (reqId) => {
    if (!reqId) {
      setSelectedDetail(null);
      return;
    }

    setIsLoadingDetail(true);
    setDetailError(null);
    setReplyError(null);
    setReplySuccess(false);

    try {
      const detailRes = await facultyService.getGuidanceRequestById(reqId);
      const requestData = detailRes?.request || detailRes;
      const repliesData = detailRes?.replies || [];

      setSelectedDetail({
        ...requestData,
        replies: repliesData,
      });

      // Fetch student enrichment context if studentId is present
      const studentId = requestData?.studentId;
      if (studentId) {
        const [readinessRes, progressRes] = await Promise.allSettled([
          facultyService.getStudentReadiness(studentId),
          facultyService.getStudentProgress(studentId),
        ]);

        if (readinessRes.status === 'fulfilled') {
          setStudentReadiness(readinessRes.value);
        } else {
          setStudentReadiness(null);
        }

        if (progressRes.status === 'fulfilled') {
          setStudentProgress(progressRes.value);
        } else {
          setStudentProgress(null);
        }
      }
    } catch (err) {
      console.error(`Failed to load guidance request ${reqId}:`, err);
      setDetailError(
        err.response?.data?.message ||
          'Failed to load conversation thread for this guidance inquiry.'
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedRequestId) {
      fetchSelectedDetail(selectedRequestId);
    }
  }, [selectedRequestId]);

  // ─── 3. Filter & Prioritization Logic ───────────────────────────
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      // Tab filter
      if (activeTab === 'pending' && item.status !== 'pending' && (item.replyCount || 0) > 0) {
        return false;
      }
      if (activeTab === 'replied' && item.status !== 'replied' && (item.replyCount || 0) === 0) {
        return false;
      }

      // Search query
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
  }, [requests, activeTab, searchQuery]);

  // Summary counts
  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending' || !r.replyCount).length,
    [requests]
  );
  const repliedCount = useMemo(
    () => requests.filter((r) => r.status === 'replied' || (r.replyCount || 0) > 0).length,
    [requests]
  );

  // ─── 4. Handlers: Selection, Presets & Reply Submission ─────────
  const handleSelectRequest = (id) => {
    setSelectedRequestId(id);
    setShowMobileDetail(true);
    setReplyError(null);
    setReplySuccess(false);
    navigate(`/faculty/guidance/${id}`, { replace: true });
  };

  const handleApplyPreset = (presetText) => {
    const textToInsert = presetText.replace(/^\+\s*/, '');
    setReplyText((prev) => {
      if (!prev.trim()) return `• ${textToInsert}\n\n`;
      return `${prev.trim()}\n\n• ${textToInsert}\n`;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitReply();
    }
  };

  const handleSubmitReply = async (e) => {
    if (e) e.preventDefault();
    setReplyError(null);
    setReplySuccess(false);

    if (!selectedRequestId) {
      setReplyError('No guidance request is currently selected.');
      return;
    }

    const trimmed = replyText.trim();
    if (!trimmed) {
      setReplyError('Please enter a response before sending guidance.');
      return;
    }

    if (trimmed.length < 5) {
      setReplyError('Guidance advice should be at least 5 characters long.');
      return;
    }

    setIsSubmittingReply(true);

    try {
      await facultyService.replyGuidanceRequest(selectedRequestId, trimmed);

      // Optimistically append reply to local detail view
      const newReply = {
        id: `local-${Date.now()}`,
        mentorId: user?.id,
        mentorName: user?.name || 'Prof. Faculty Mentor',
        mentorEmail: user?.email,
        mentorRole: 'Faculty',
        answerText: trimmed,
        date: new Date().toISOString(),
      };

      setSelectedDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          replies: [...(prev.replies || []), newReply],
        };
      });

      // Update item in master list
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequestId
            ? {
                ...r,
                replyCount: (r.replyCount || 0) + 1,
                status: 'replied',
                latestReply: {
                  id: newReply.id,
                  mentorName: newReply.mentorName,
                  answerText: trimmed,
                },
              }
            : r
        )
      );

      setReplyText('');
      setReplySuccess(true);

      // Scroll to bottom of conversation
      setTimeout(() => {
        conversationBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to submit guidance reply:', err);
      setReplyError(
        err.response?.data?.message ||
          'Failed to send reply. Please verify your connection and try again.'
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Split question into main narrative and code block if student provided one
  const renderQuestionBody = (questionText = '') => {
    // Check if question contains markdown triple backticks
    if (questionText.includes('```')) {
      const parts = questionText.split('```');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          // Code block
          const lines = part.split('\n');
          const lang = lines[0].trim() || 'code';
          const code = lines.slice(1).join('\n') || part;
          return (
            <div
              key={index}
              className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] text-slate-100 font-mono text-xs shadow-inner"
            >
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#1E293B] border-b border-slate-700 text-slate-300">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-white">{lang}</span>
                </div>
                <span className="text-[11px] text-slate-400">Student Submission Code</span>
              </div>
              <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed custom-scrollbar">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return (
          <p key={index} className="whitespace-pre-line text-slate-700 leading-relaxed my-1">
            {part}
          </p>
        );
      });
    }

    return (
      <p className="whitespace-pre-line text-slate-800 leading-relaxed font-body-md text-sm">
        {questionText}
      </p>
    );
  };

  return (
    <div className="space-y-5 antialiased" data-purpose="faculty-guidance-inbox">
      {/* ================= 1. HEADER & TRIAGE STATS (LEVEL 1 PANEL) ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 font-heading">
                Guidance Inbox & Student Advising Queue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-semibold text-xs border border-blue-200">
                Active Advising Cycle
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct student technical inquiries, architecture reviews, and 1:1 mentorship requests.
            </p>
          </div>

          {/* Metric Summary Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Unresolved ({pendingCount})</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Total Inquiries: <strong className="font-bold text-slate-900">{requests.length}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Replied ({repliedCount})</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              All Inquiries ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Pending Reply ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('replied')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'replied'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Replied / Complete ({repliedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student or inquiry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => fetchRequests(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. SPLIT-PANE WORKSPACE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT PANE: INQUIRY QUEUE LIST (4 COLS) ================= */}
        <div
          className={`lg:col-span-4 xl:col-span-4 space-y-3 ${
            showMobileDetail ? 'hidden lg:block' : 'block'
          }`}
          data-purpose="guidance-request-queue"
        >
          <div className="bg-slate-100/70 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="font-semibold text-slate-700">
              Showing {filteredRequests.length} of {requests.length} Requests
            </span>
            <span className="text-[11px] text-slate-400">Sorted by Date</span>
          </div>

          {/* List States */}
          {isLoadingList && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5">
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {listError && !isLoadingList && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Error loading guidance inbox</span>
              </div>
              <p>{listError}</p>
              <Button size="sm" variant="outline" onClick={() => fetchRequests(false)}>
                Retry
              </Button>
            </div>
          )}

          {!isLoadingList && !listError && filteredRequests.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">No Guidance Requests Found</p>
              <p className="text-[11px] text-slate-500">
                {searchQuery
                  ? 'No inquiries match your current search criteria.'
                  : activeTab === 'pending'
                  ? 'Great job! All pending guidance inquiries have received responses.'
                  : 'No student requests have been registered in this queue.'}
              </p>
              {searchQuery && (
                <Button size="sm" variant="ghost" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </div>
          )}

          {/* Scrollable Request Items */}
          {!isLoadingList && (
            <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-0.5 custom-scrollbar">
              {filteredRequests.map((item) => {
                const isSelected = item.id === selectedRequestId;
                const isPending = item.status === 'pending' || !item.replyCount;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectRequest(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-blue-50/60 border-2 border-blue-600 shadow-sm'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-card'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-blue-600 rounded-r" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={item.studentName || 'Student'}
                          size="sm"
                          className={isSelected ? 'ring-2 ring-blue-500' : ''}
                        />
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">
                            {item.studentName || 'Student Candidate'}
                          </h3>
                          <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {item.studentEmail || 'student@campus.edu'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatRelativeTime(item.date)}
                      </span>
                    </div>

                    {/* Status Tags */}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending Review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Replied ({item.replyCount})
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                        Advising
                      </span>
                    </div>

                    {/* Inquiry Excerpt */}
                    <p className="text-xs text-slate-700 mt-2 line-clamp-2 leading-relaxed">
                      {item.question}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 font-mono text-[10px]">
                        ID: #{item.id?.slice(-5).toUpperCase()}
                      </span>
                      <span className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5">
                        Open Thread <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= RIGHT PANE: DETAIL CONVERSATION & COMPOSER (8 COLS) ================= */}
        <div
          className={`lg:col-span-8 xl:col-span-8 space-y-4 ${
            !showMobileDetail ? 'hidden lg:block' : 'block'
          }`}
          data-purpose="guidance-conversation-thread"
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden pb-1">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => setShowMobileDetail(false)}
            >
              Back to Request List
            </Button>
          </div>

          {!selectedRequestId && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Request Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Choose a student inquiry from the left panel to examine their question, inspect code, and provide mentorship guidance.
              </p>
            </div>
          )}

          {isLoadingDetail && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-card animate-pulse">
              <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
              <div className="h-28 bg-slate-100 rounded-xl" />
              <div className="h-40 bg-slate-100 rounded-xl" />
            </div>
          )}

          {detailError && !isLoadingDetail && (
            <ErrorState
              title="Unable to Load Guidance Thread"
              message={detailError}
              onRetry={() => fetchSelectedDetail(selectedRequestId)}
              retryText="Retry Loading Thread"
            />
          )}

          {selectedDetail && !isLoadingDetail && (
            <>
              {/* ================= A. STUDENT DOSSIER HEADER ================= */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <Avatar
                      name={selectedDetail.studentName || 'Student'}
                      size="lg"
                      className="ring-2 ring-blue-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-slate-900 font-heading">
                          {selectedDetail.studentName || 'Student Candidate'}
                        </h2>
                        {studentReadiness?.readinessScore !== undefined && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {studentReadiness.readinessScore}% Placement Ready
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                          {selectedDetail.replies?.length > 0 ? 'Replied' : 'Pending Response'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Email: <strong className="text-slate-700 font-medium">{selectedDetail.studentEmail}</strong>
                        {studentProgress?.profile?.semester && (
                          <span> • Semester {studentProgress.profile.semester}</span>
                        )}
                      </p>

                      <p className="text-xs text-blue-700 font-medium mt-0.5">
                        Track: {studentProgress?.profile?.selectedCareer || 'Computer Science & Software Systems'}
                      </p>
                    </div>
                  </div>

                  {/* Context Links */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to="/faculty/interviews">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        leftIcon={<Award className="w-3.5 h-3.5 text-blue-600" />}
                      >
                        Interview Rubrics
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* ================= B. ORIGINAL STUDENT INQUIRY ================= */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                      Q
                    </div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Student Inquiry
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Logged {formatDate(selectedDetail.date)}
                  </span>
                </div>

                <div className="text-sm">
                  {renderQuestionBody(selectedDetail.question)}
                </div>
              </div>

              {/* ================= C. CONVERSATION THREAD (FACULTY REPLIES) ================= */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Faculty Guidance History ({selectedDetail.replies?.length || 0})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Chronological Mentorship Thread
                  </span>
                </div>

                {(!selectedDetail.replies || selectedDetail.replies.length === 0) ? (
                  <div className="p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/40 text-center space-y-1">
                    <p className="text-xs font-semibold text-amber-800">
                      No replies logged yet
                    </p>
                    <p className="text-[11px] text-amber-600">
                      This student is waiting for your expert guidance. Use the response composer below to formulate architectural recommendations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDetail.replies.map((reply, index) => (
                      <div
                        key={reply.id || index}
                        className="bg-white rounded-2xl border border-blue-100 p-4 shadow-card space-y-2 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600" />
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <Avatar name={reply.mentorName || 'Faculty'} size="xs" />
                            <span className="text-xs font-bold text-slate-900">
                              {reply.mentorName || 'Faculty Mentor'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {reply.mentorRole || 'Faculty'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(reply.date)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed pl-1">
                          {reply.answerText}
                        </p>
                      </div>
                    ))}
                    <div ref={conversationBottomRef} />
                  </div>
                )}
              </div>

              {/* ================= D. INTERACTIVE GUIDANCE COMPOSER ================= */}
              <div
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-4"
                data-purpose="guidance-reply-composer"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 font-heading">
                      Compose Guidance & Technical Recommendations
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-700">Ctrl + Enter</kbd> to Send
                  </span>
                </div>

                {/* Quick Recommendation Presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-slate-400" />
                    <span>Quick Architectural Presets:</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {QUICK_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 transition shadow-2xs"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea Composer */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700">
                      Guidance Notes & Mentorship Advice <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {replyText.length} characters
                    </span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={5}
                    value={replyText}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Provide actionable architectural feedback, recommend reading, or outline concrete next steps..."
                    className="w-full p-3.5 text-xs text-slate-900 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 transition leading-relaxed resize-y"
                  />

                  {replyError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{replyError}</span>
                    </div>
                  )}

                  {replySuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Guidance reply posted successfully to student's thread.</span>
                    </div>
                  )}
                </div>

                {/* Placement Endorsement Checkbox */}
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                  <input
                    id="endorse_checkbox"
                    type="checkbox"
                    checked={endorseArchitecture}
                    onChange={(e) => setEndorseArchitecture(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <label
                      htmlFor="endorse_checkbox"
                      className="text-xs font-bold text-blue-900 cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verify Student Solution Guidance & Readiness</span>
                    </label>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      Attaches faculty recommendation credit to student's career preparation record.
                    </p>
                  </div>
                </div>

                {/* Outcome & Submission Toolbar */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Ticket Outcome:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      Direct Guidance Logged
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleSubmitReply}
                      isLoading={isSubmittingReply}
                      disabled={isSubmittingReply || !replyText.trim()}
                      className="w-full sm:w-auto px-5 shadow-xs"
                      rightIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Send Guidance Reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidanceInboxPage;

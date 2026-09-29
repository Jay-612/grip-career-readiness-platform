import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Send,
  User,
  Users,
  ShieldCheck,
  FileText,
  ExternalLink,
  Sparkles,
  Check,
  RefreshCw,
  X,
  Edit3,
  CornerDownRight,
  BookOpen,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import alumniService from '../../services/alumniService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const ALUMNI_QUICK_PRESETS = [
  '+ Technical Placement & Coding Strategy',
  '+ System Design & Distributed Patterns Focus',
  '+ Resume Highlight & Project Impact Metrics',
  '+ STAR Framework for Behavioral & HR Rounds',
  '+ Campus Drive Interview Stage Navigation',
];

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const MentorshipInboxPage = () => {
  const { requestId: routeRequestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Master List State
  const [requests, setRequests] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  // Filters & Search
  // 'all' | 'pending' | 'replied' | 'mine'
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Detail State
  const [selectedRequestId, setSelectedRequestId] = useState(routeRequestId || null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Reply Composer State
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);

  // Inline Reply Editing State
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  // Mobile navigation state
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Textarea ref for macro insertion and keyboard shortcut
  const textareaRef = useRef(null);
  const threadBottomRef = useRef(null);

  const currentUserId = (user?.id || user?._id || '').toString();

  // ─── 1. Load All Guidance Requests ─────────────────────────────
  const loadRequests = async (preserveSelected = true) => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const res = await alumniService.getGuidanceRequests({ page: 1, limit: 50 });
      const list = Array.isArray(res) ? res : res?.requests || [];
      setRequests(list);

      // Select initial request if none selected or if route changed
      if (list.length > 0) {
        if (routeRequestId) {
          const match = list.find((r) => (r.id || r._id) === routeRequestId);
          if (match) {
            setSelectedRequestId(match.id || match._id);
            setShowMobileDetail(true);
          } else {
            setSelectedRequestId(list[0].id || list[0]._id);
          }
        } else if (!preserveSelected || !selectedRequestId) {
          // Default to first pending request or first item
          const firstPending = list.find((r) => r.status === 'pending');
          setSelectedRequestId((firstPending || list[0]).id || (firstPending || list[0])._id);
        }
      } else {
        setSelectedRequestId(null);
        setSelectedDetail(null);
      }
    } catch (err) {
      console.error('Failed to load mentorship inquiries:', err);
      setListError(
        err.response?.data?.message ||
          'Unable to connect to campus mentorship inbox. Please check your connection.'
      );
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadRequests(false);
  }, []);

  // Sync route param changes
  useEffect(() => {
    if (routeRequestId && routeRequestId !== selectedRequestId) {
      setSelectedRequestId(routeRequestId);
      setShowMobileDetail(true);
    }
  }, [routeRequestId]);

  // ─── 2. Fetch Selected Request Detail & Thread ─────────────────
  const loadSelectedDetail = async (reqId) => {
    if (!reqId) {
      setSelectedDetail(null);
      return;
    }

    setIsLoadingDetail(true);
    setDetailError(null);
    setReplyError(null);
    setReplySuccess(false);
    setEditingReplyId(null);

    try {
      const detailRes = await alumniService.getGuidanceRequestById(reqId);
      const requestData = detailRes?.request || detailRes;
      const repliesData = detailRes?.replies || [];

      setSelectedDetail({
        ...requestData,
        replies: repliesData,
      });
    } catch (err) {
      console.error(`Failed to load guidance request ${reqId}:`, err);
      setDetailError(
        err.response?.data?.message ||
          'Failed to load conversation thread for this mentorship inquiry.'
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedRequestId) {
      loadSelectedDetail(selectedRequestId);
    }
  }, [selectedRequestId]);

  // ─── 3. Filter & Categorization Logic ───────────────────────────
  const filteredRequests = useMemo(() => {
    const query = (searchQuery || '').trim().toLowerCase();

    return (Array.isArray(requests) ? requests : []).filter((item) => {
      if (!item) return false;

      const isPending = item.status === 'pending' || (item.replyCount || 0) === 0;
      const isReplied = item.status === 'replied' || (item.replyCount || 0) > 0;

      // Tab filter
      if (activeTab === 'pending' && !isPending) {
        return false;
      }
      if (activeTab === 'replied' && !isReplied) {
        return false;
      }
      if (activeTab === 'mine') {
        const latestMentorName = (item.latestReply?.mentorName || '').toLowerCase();
        const myName = (user?.name || '').toLowerCase();
        // Check if latest reply or item indicates current user
        const answeredByMe = latestMentorName && myName && latestMentorName.includes(myName);
        if (!answeredByMe) return false;
      }

      // Search query
      if (query) {
        const studentName = String(item.studentName || '').toLowerCase();
        const studentEmail = String(item.studentEmail || '').toLowerCase();
        const questionText = String(item.question || '').toLowerCase();
        return (
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          questionText.includes(query)
        );
      }

      return true;
    });
  }, [requests, activeTab, searchQuery, user?.name]);

  // Summary counts
  const pendingCount = useMemo(
    () => (Array.isArray(requests) ? requests : []).filter((r) => r.status === 'pending' || !r.replyCount).length,
    [requests]
  );
  const repliedCount = useMemo(
    () => (Array.isArray(requests) ? requests : []).filter((r) => r.status === 'replied' || (r.replyCount || 0) > 0).length,
    [requests]
  );
  const myRepliedCount = useMemo(() => {
    const myName = (user?.name || '').toLowerCase();
    if (!myName) return 0;
    return (Array.isArray(requests) ? requests : []).filter((r) => {
      const mentor = (r.latestReply?.mentorName || '').toLowerCase();
      return mentor && mentor.includes(myName);
    }).length;
  }, [requests, user?.name]);

  // ─── 4. Handlers: Selection, Preset & Reply Submission ──────────
  const handleSelectRequest = (id) => {
    setSelectedRequestId(id);
    setShowMobileDetail(true);
    setReplyError(null);
    setReplySuccess(false);
    setEditingReplyId(null);
    navigate(`/alumni/mentorship/${id}`, { replace: true });
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
      setReplyError('No mentorship inquiry is currently selected.');
      return;
    }

    const trimmed = replyText.trim();
    if (!trimmed) {
      setReplyError('Please write your guidance advice before submitting.');
      return;
    }

    if (trimmed.length < 5) {
      setReplyError('Mentorship advice should be at least 5 characters long.');
      return;
    }

    setIsSubmittingReply(true);

    try {
      await alumniService.replyGuidanceRequest(selectedRequestId, trimmed);

      // Optimistically append reply to local detail view
      const newReply = {
        id: `local-${Date.now()}`,
        mentorId: currentUserId,
        mentorName: user?.name || 'Verified Alumni Mentor',
        mentorEmail: user?.email || '',
        mentorRole: 'alumni',
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
        prev.map((r) => {
          const reqId = r.id || r._id;
          if (reqId === selectedRequestId) {
            return {
              ...r,
              replyCount: (r.replyCount || 0) + 1,
              status: 'replied',
              latestReply: {
                id: newReply.id,
                mentorName: newReply.mentorName,
                answerText: trimmed,
              },
            };
          }
          return r;
        })
      );

      setReplyText('');
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 5000);

      // Scroll to bottom of conversation
      setTimeout(() => {
        threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to post mentorship reply:', err);
      setReplyError(
        err.response?.data?.message || 'Failed to submit mentorship advice. Please try again.'
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // ─── 5. Inline Edit Previous Reply ──────────────────────────────
  const handleStartEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditReplyText(reply.answerText || '');
    setEditError(null);
  };

  const handleSaveEditReply = async (replyId) => {
    const trimmed = editReplyText.trim();
    if (!trimmed) {
      setEditError('Reply text cannot be blank.');
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);
    try {
      await alumniService.updateGuidanceReply(replyId, trimmed);

      // Update locally
      setSelectedDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          replies: (prev.replies || []).map((rep) =>
            rep.id === replyId ? { ...rep, answerText: trimmed } : rep
          ),
        };
      });

      setEditingReplyId(null);
      setEditReplyText('');
    } catch (err) {
      console.error('Failed to update reply:', err);
      setEditError(err.response?.data?.message || 'Failed to update reply. You may only edit your own replies.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* ========================================================================= */}
      {/* HEADER SECTION                                                            */}
      {/* ========================================================================= */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-[#0d223c] to-[#08182b] text-white p-6 md:p-8 card-shadow relative overflow-hidden">
        {/* Ambient Icon Watermark */}
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <MessageSquare className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs backdrop-blur-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Alumni Mentorship Network • Direct Candidate Guidance</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Mentorship Inbox
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Review questions from students preparing for placements, share practical industry insight,
              and mentor candidates through interview rounds.
            </p>
          </div>

          {/* Metrics summary */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/15 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Total Questions:</span>
              <strong className="text-white font-mono text-sm">{requests.length}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Awaiting Response:</span>
              <strong className="text-amber-300 font-mono text-sm">{pendingCount}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Answered:</span>
              <strong className="text-emerald-300 font-mono text-sm">{repliedCount}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MASTER-DETAIL WORKSPACE                                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: INQUIRY QUEUE LIST                                        */}
        {/* ======================================================================= */}
        <div
          className={`
            lg:col-span-5 space-y-4
            ${showMobileDetail ? 'hidden lg:block' : 'block'}
          `}
        >
          {/* Controls Bar: Search & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student or topic..."
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadRequests(true)}
              disabled={isLoadingList}
              className="shrink-0 h-9 px-3"
              title="Refresh Inquiries"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <span>Awaiting</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('replied')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'replied'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span>Answered</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {repliedCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'mine'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              My Replies ({myRepliedCount})
            </button>
          </div>

          {/* List Content */}
          {isLoadingList ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : listError ? (
            <ErrorState
              title="Unable to Load Inquiries"
              message={listError}
              onRetry={() => loadRequests(false)}
            />
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-8 h-8 text-slate-400 stroke-[1.5]" />}
              title={
                requests.length === 0
                  ? 'No Student Inquiries Logged'
                  : 'No Inquiries Match Filters'
              }
              description={
                requests.length === 0
                  ? 'When students submit career or technical guidance questions, they will appear in this inbox.'
                  : 'Try clearing your search query or switching tabs to view other questions.'
              }
              action={
                requests.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredRequests.map((reqItem) => {
                const reqId = reqItem.id || reqItem._id;
                const isSelected = selectedRequestId === reqId;
                const isPending = reqItem.status === 'pending' || (reqItem.replyCount || 0) === 0;
                const dateText = formatDate(reqItem.date);
                const studentInitial = String(reqItem.studentName || 'S').charAt(0).toUpperCase();

                return (
                  <div
                    key={reqId}
                    onClick={() => handleSelectRequest(reqId)}
                    className={`
                      p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2
                      ${
                        isSelected
                          ? 'bg-blue-50/60 border-blue-400 shadow-sm ring-1 ring-blue-400/50'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                      }
                    `}
                  >
                    {/* Top Row: Student & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {studentInitial}
                        </div>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {reqItem.studentName || 'Student Candidate'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isPending ? (
                          <Badge variant="warning" size="xs">
                            Awaiting
                          </Badge>
                        ) : (
                          <Badge variant="success" size="xs">
                            Answered ({reqItem.replyCount || 1})
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Question Snippet */}
                    <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                      "{reqItem.question}"
                    </p>

                    {/* Bottom Metadata */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{dateText}</span>
                      </span>

                      <span className="text-blue-600 font-semibold flex items-center gap-0.5 text-[11px]">
                        <span>View Discussion</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: ACTIVE CONVERSATION & REPLY COMPOSER                      */}
        {/* ======================================================================= */}
        <div
          className={`
            lg:col-span-7 space-y-5
            ${!showMobileDetail ? 'hidden lg:block' : 'block'}
          `}
        >
          {/* Mobile Back to List Button */}
          <div className="lg:hidden pb-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowMobileDetail(false);
                navigate('/alumni/mentorship', { replace: true });
              }}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Questions List
            </Button>
          </div>

          {!selectedRequestId ? (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center shadow-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Mentorship Inquiry Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Choose a student question from the left queue to review their inquiry and share placement guidance.
              </p>
            </div>
          ) : isLoadingDetail ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
              <Skeleton className="h-8 w-1/2 rounded-xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : detailError ? (
            <ErrorState
              title="Unable to Load Inquiry Details"
              message={detailError}
              onRetry={() => loadSelectedDetail(selectedRequestId)}
            />
          ) : selectedDetail ? (
            <div className="space-y-5">
              {/* Card 1: Selected Student & Inquiry Overview */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {String(selectedDetail.studentName || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">
                          {selectedDetail.studentName || 'Student Candidate'}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                          Student
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {selectedDetail.studentEmail || 'campus.student@university.edu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {(selectedDetail.replies || []).length === 0 ? (
                      <Badge variant="warning" size="sm">
                        Awaiting Response
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        {(selectedDetail.replies || []).length} Mentorship Replies
                      </Badge>
                    )}

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => loadSelectedDetail(selectedRequestId)}
                      title="Reload Thread"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Original Question Card */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Student Inquiry</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      {formatDate(selectedDetail.date)} • {formatTime(selectedDetail.date)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                    {selectedDetail.question}
                  </p>
                </div>
              </div>

              {/* Card 2: Chronological Mentorship Discussion Thread */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-600 text-white">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Mentorship Discussion &amp; Advice ({(selectedDetail.replies || []).length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Chronological answers</span>
                </div>

                {(selectedDetail.replies || []).length === 0 ? (
                  <div className="p-8 rounded-xl bg-amber-50/60 border border-amber-200/80 text-center space-y-2 my-2">
                    <Clock className="w-6 h-6 text-amber-600 mx-auto" />
                    <h4 className="text-xs font-bold text-amber-900">No Responses Posted Yet</h4>
                    <p className="text-[11px] text-amber-700 max-w-sm mx-auto leading-relaxed">
                      Be the first to share practical career advice and interview strategies with this candidate.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedDetail.replies || []).map((reply, idx) => {
                      const isAuthoredByMe =
                        reply.mentorId === currentUserId ||
                        (reply.mentorId?._id && reply.mentorId._id === currentUserId) ||
                        (reply.mentorEmail && user?.email && reply.mentorEmail === user.email);

                      const isEditingThis = editingReplyId === reply.id;
                      const initialChar = String(reply.mentorName || 'M').charAt(0).toUpperCase();

                      return (
                        <div
                          key={reply.id || idx}
                          className={`
                            p-4 rounded-xl border space-y-2.5 transition-all
                            ${
                              isAuthoredByMe
                                ? 'bg-blue-50/50 border-blue-200/90 ml-2 sm:ml-4'
                                : 'bg-slate-50/70 border-slate-200'
                            }
                          `}
                        >
                          {/* Mentor Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                                  isAuthoredByMe ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                                }`}
                              >
                                {initialChar}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">
                                    {isAuthoredByMe ? `${reply.mentorName} (You)` : reply.mentorName}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                      reply.mentorRole === 'alumni' || isAuthoredByMe
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }`}
                                  >
                                    {reply.mentorRole === 'faculty' ? 'Faculty Advisor' : 'Alumni Mentor'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {reply.mentorEmail}
                                </span>
                              </div>
                            </div>

                            {/* Author Action (Edit) */}
                            {isAuthoredByMe && !isEditingThis && (
                              <button
                                onClick={() => handleStartEditReply(reply)}
                                className="text-xs text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            )}
                          </div>

                          {/* Reply Body or Inline Edit Form */}
                          {isEditingThis ? (
                            <div className="space-y-3 pt-2">
                              {editError && (
                                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                                  {editError}
                                </div>
                              )}
                              <textarea
                                rows={4}
                                value={editReplyText}
                                onChange={(e) => setEditReplyText(e.target.value)}
                                className="w-full bg-white text-xs text-slate-900 rounded-lg border border-blue-400 p-3 focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans leading-relaxed"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="xs"
                                  disabled={isSavingEdit}
                                  onClick={() => setEditingReplyId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="xs"
                                  isLoading={isSavingEdit}
                                  loadingText="Saving..."
                                  onClick={() => handleSaveEditReply(reply.id)}
                                >
                                  Save Updates
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                              {reply.answerText}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    <div ref={threadBottomRef} />
                  </div>
                )}
              </div>

              {/* Card 3: Reply Composer & Starters */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-blue-600 text-white">
                      <Send className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Compose Mentorship Guidance
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ctrl + Enter to send
                  </span>
                </div>

                {/* Quick Mentoring Presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Alumni Guidance Starters
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ALUMNI_QUICK_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-[11px] font-semibold transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Banner */}
                {replyError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{replyError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {replySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      Your mentorship advice has been delivered and recorded on the candidate's guidance portal!
                    </span>
                  </div>
                )}

                {/* Textarea Form */}
                <form onSubmit={handleSubmitReply} className="space-y-3">
                  <textarea
                    ref={textareaRef}
                    rows={6}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Provide specific advice on coding rounds, system design, portfolio recommendations, or career mindset..."
                    className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-3.5 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-sans leading-relaxed"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-[11px] text-slate-400">
                      Replies are immediately accessible by the student in their Guidance &amp; Mentorship tab.
                    </p>

                    <div className="flex items-center gap-2 shrink-0">
                      {replyText.trim() && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setReplyText('')}
                          disabled={isSubmittingReply}
                        >
                          Clear
                        </Button>
                      )}

                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isSubmittingReply}
                        loadingText="Delivering..."
                        rightIcon={<Send className="w-3.5 h-3.5" />}
                        disabled={!replyText.trim()}
                        className="shadow-xs font-semibold"
                      >
                        Send Mentorship Advice
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const SafeMentorshipInboxPage = (props) => (
  <ErrorBoundary fallbackTitle="Mentorship Inbox Error">
    <MentorshipInboxPage {...props} />
  </ErrorBoundary>
);

export default SafeMentorshipInboxPage;

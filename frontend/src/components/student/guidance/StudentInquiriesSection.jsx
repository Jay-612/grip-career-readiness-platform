import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  ChevronRight,
  User,
  GraduationCap,
  Briefcase,
  Calendar,
  Send,
  Sparkles,
  ArrowRight,
  Tag,
  Filter,
} from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const StudentInquiriesSection = ({
  inquiries = [],
  onReply,
  onResolve,
  onAskGuidance,
  isReplying = false,
  isResolving = false,
}) => {
  // Filters: recipientFilter ('all' | 'faculty' | 'alumni'), statusFilter ('all' | 'pending' | 'replied' | 'resolved')
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Recipient filter
      const type = (inq.recipientType || inq.targetType || 'faculty').toLowerCase();
      if (recipientFilter !== 'all' && type !== recipientFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all') {
        const normStatus = (inq.status || '').toLowerCase();
        if (statusFilter === 'pending' && normStatus !== 'pending') return false;
        if (statusFilter === 'replied' && normStatus !== 'replied') return false;
        if (statusFilter === 'resolved' && normStatus !== 'resolved') return false;
      }
      return true;
    });
  }, [inquiries, recipientFilter, statusFilter]);

  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [followUpText, setFollowUpText] = useState('');
  const [showFollowUpBox, setShowFollowUpBox] = useState(false);

  // Sync active inquiry
  const activeInquiry = useMemo(() => {
    if (selectedInquiryId) {
      const found = filteredInquiries.find((i) => (i.id || i._id) === selectedInquiryId);
      if (found) return found;
    }
    return filteredInquiries[0] || null;
  }, [filteredInquiries, selectedInquiryId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const handleSendFollowUp = async (e) => {
    if (e) e.preventDefault();
    if (!followUpText.trim() || !activeInquiry) return;
    await onReply(activeInquiry.id || activeInquiry._id, followUpText.trim());
    setFollowUpText('');
    setShowFollowUpBox(false);
  };

  const handleMarkResolved = async () => {
    if (!activeInquiry) return;
    await onResolve(activeInquiry.id || activeInquiry._id);
  };

  if (!inquiries || inquiries.length === 0) {
    return (
      <div
        className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card text-center flex flex-col items-center gap-3"
        data-testid="no-guidance-inquiries-card"
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            No Guidance Requests Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Have a question on career paths, interview prep, or technical concepts? Reach out to a faculty advisor or alumni mentor.
          </p>
        </div>
        {onAskGuidance && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAskGuidance}
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            className="text-xs mt-1"
          >
            Ask for Guidance
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="student-guidance-inquiries-section">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        {/* Recipient Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setRecipientFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              recipientFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Questions ({inquiries.length})
          </button>
          <button
            type="button"
            onClick={() => setRecipientFilter('faculty')}
            className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              recipientFilter === 'faculty'
                ? 'bg-white text-blue-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Faculty</span>
          </button>
          <button
            type="button"
            onClick={() => setRecipientFilter('alumni')}
            className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              recipientFilter === 'alumni'
                ? 'bg-white text-indigo-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Alumni</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white text-slate-700 rounded-xl border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Reply</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
          </select>

          {onAskGuidance && (
            <Button
              variant="outline"
              size="xs"
              onClick={onAskGuidance}
              className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold"
            >
              + Ask Question
            </Button>
          )}
        </div>
      </div>

      {/* Split view: List & Conversation */}
      {filteredInquiries.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center text-xs text-slate-500">
          No guidance requests match your active filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left: Inquiries List */}
          <div className="lg:col-span-5 space-y-2.5">
            {filteredInquiries.map((inq) => {
              const inqId = inq.id || inq._id;
              const isSelected = activeInquiry && (activeInquiry.id || activeInquiry._id) === inqId;
              const isResolved = inq.status === 'resolved';
              const isReplied = inq.status === 'replied' || (inq.replyCount || 0) > 0;
              const displayTopic = inq.topic || 'General Guidance';
              const isFaculty = (inq.recipientType || inq.targetType || 'faculty').toLowerCase() === 'faculty';
              const recipientName = inq.recipientName || (isFaculty ? inq.targetFacultyName : inq.targetAlumniName) || (isFaculty ? 'Faculty Advisor' : 'Alumni Mentor');

              return (
                <div
                  key={inqId}
                  onClick={() => setSelectedInquiryId(inqId)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-card shadow-2xs'
                  }`}
                  data-testid={`inquiry-item-${inqId}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isFaculty
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {displayTopic}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-600">
                        {isFaculty ? 'Faculty' : 'Alumni'}
                      </span>
                    </div>

                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Resolved
                      </span>
                    ) : isReplied ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <MessageSquare className="w-3 h-3 text-blue-600" />
                        Replied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                    {inq.question}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      {isFaculty ? (
                        <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      ) : (
                        <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      )}
                      <span className="truncate">{recipientName}</span>
                    </span>
                    <span className="shrink-0">{formatDate(inq.date || inq.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Conversation Thread */}
          {activeInquiry && (
            <div
              className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-4"
              data-testid="active-inquiry-thread"
            >
              {/* Thread Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                      {activeInquiry.topic || 'General Guidance'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(activeInquiry.date || activeInquiry.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                    {(activeInquiry.recipientType || activeInquiry.targetType) === 'alumni' ? (
                      <>
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Mentor: <strong>{activeInquiry.recipientName || activeInquiry.targetAlumniName || 'Alumni Mentor'}</strong></span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Advisor: <strong>{activeInquiry.recipientName || activeInquiry.targetFacultyName || 'Faculty Advisor'}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status & Resolve Button */}
                <div className="flex items-center gap-2">
                  {activeInquiry.status === 'resolved' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Resolved
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={handleMarkResolved}
                      isLoading={isResolving}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      title="Mark question as resolved"
                      data-testid="resolve-inquiry-btn"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>

              {/* Student's Original Question */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-600" />
                  <span>Your Question:</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-wrap font-medium">
                  {activeInquiry.question}
                </p>
              </div>

              {/* Replies List */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Guidance Thread ({activeInquiry.replies?.length || (activeInquiry.latestReply ? 1 : 0)})
                  </span>
                </h4>

                {(!activeInquiry.replies || activeInquiry.replies.length === 0) && !activeInquiry.latestReply ? (
                  <div className="p-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center flex flex-col items-center gap-1.5">
                    <Clock className="w-6 h-6 text-amber-500" />
                    <p className="text-xs font-semibold text-slate-700">Awaiting Response</p>
                    <p className="text-[11px] text-slate-500 max-w-sm">
                      {activeInquiry.recipientName || 'Your mentor'} has received this question and will post guidance here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(activeInquiry.replies && activeInquiry.replies.length > 0
                      ? activeInquiry.replies
                      : [activeInquiry.latestReply]
                    ).map((rep, idx) => {
                      const repRole = (rep.mentorRole || '').toLowerCase();
                      const isStudent = repRole === 'student' || rep.mentorName === 'You';
                      const isAlumni = repRole === 'alumni';

                      return (
                        <div
                          key={rep.id || rep._id || idx}
                          className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
                            isStudent
                              ? 'bg-slate-50 border-slate-200 text-slate-900 ml-4'
                              : isAlumni
                              ? 'bg-indigo-50/40 border-indigo-200/90 text-slate-900'
                              : 'bg-blue-50/40 border-blue-200/90 text-slate-900'
                          }`}
                          data-testid={`reply-item-${idx}`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold flex items-center gap-1.5 text-slate-900">
                              {isStudent ? (
                                <User className="w-3.5 h-3.5 text-slate-500" />
                              ) : isAlumni ? (
                                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                              ) : (
                                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                              )}
                              <span>{rep.mentorName || 'Mentor'}</span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                  isStudent
                                    ? 'text-slate-600 bg-slate-200/70'
                                    : isAlumni
                                    ? 'text-indigo-700 bg-indigo-100/70'
                                    : 'text-blue-700 bg-blue-100/70'
                                }`}
                              >
                                {isStudent ? 'Follow-Up' : isAlumni ? 'Alumni Advice' : 'Faculty Advice'}
                              </span>
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {formatDate(rep.date || rep.createdAt)}
                            </span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed pl-1 text-slate-800">
                            {rep.answerText}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Follow-up / Reply */}
              {activeInquiry.status !== 'resolved' && (
                <div className="pt-2 border-t border-slate-100">
                  {!showFollowUpBox ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFollowUpBox(true)}
                      className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                      data-testid="open-follow-up-btn"
                    >
                      + Write Follow-up Question
                    </Button>
                  ) : (
                    <form onSubmit={handleSendFollowUp} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Your Follow-up Message:
                      </label>
                      <textarea
                        rows={3}
                        value={followUpText}
                        onChange={(e) => setFollowUpText(e.target.value)}
                        placeholder="Ask a clarifying question or provide additional context..."
                        className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 transition resize-none"
                        autoFocus
                        required
                        data-testid="follow-up-textarea"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setShowFollowUpBox(false);
                            setFollowUpText('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="xs"
                          disabled={isReplying || !followUpText.trim()}
                          isLoading={isReplying}
                          leftIcon={<Send className="w-3 h-3" />}
                          data-testid="submit-follow-up-btn"
                        >
                          Send Follow-up
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentInquiriesSection;

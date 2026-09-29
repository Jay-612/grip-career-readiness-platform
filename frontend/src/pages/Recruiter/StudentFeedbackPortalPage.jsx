import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileCheck,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Send,
  Sparkles,
  ArrowLeft,
  Target,
  Clock,
  Calendar,
  Building2,
  Check,
  X,
  RotateCcw,
  BookOpen,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorBoundary from '../../components/common/ErrorBoundary';

/**
 * Student Feedback Portal Page
 * 
 * Enables corporate recruiters to review authorized student candidates, inspect their
 * verified skills and company match analysis, and submit structured evaluation feedback
 * (POST /api/feedback) that directly influences institutional placement readiness scores.
 */
export const StudentFeedbackPortalPage = () => {
  const { studentId: routeStudentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [candidates, setCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [candidateError, setCandidateError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Student Context
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentContext, setStudentContext] = useState(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [contextError, setContextError] = useState(null);

  // Manual Candidate Lookup
  const [manualIdInput, setManualIdInput] = useState('');
  const [isManualSearch, setIsManualSearch] = useState(false);

  // Feedback Form State
  const [feedbackComments, setFeedbackComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Local Session Feedback History (Backend does not have a GET /feedback route)
  const [submittedHistory, setSubmittedHistory] = useState([]);

  // Load authorized candidates from recruiter appointments
  const loadCandidates = async () => {
    setIsLoadingCandidates(true);
    setCandidateError(null);
    try {
      const studentList = await recruiterService.getAvailableStudents();
      setCandidates(studentList);

      // If route has studentId, find and select
      if (routeStudentId) {
        const found = studentList.find((c) => String(c.id) === String(routeStudentId));
        if (found) {
          setSelectedStudent(found);
        } else {
          // Manual lookup by ID if not in immediate appointments
          handleSelectStudentById(routeStudentId);
        }
      } else if (studentList.length > 0 && !selectedStudent) {
        setSelectedStudent(studentList[0]);
      }
    } catch (err) {
      console.error('Failed to load candidate roster:', err);
      setCandidateError(
        err?.response?.data?.message || 'Unable to retrieve authorized candidates.'
      );
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [routeStudentId]);

  // Load selected candidate's career skills & company match context
  useEffect(() => {
    const targetId = selectedStudent?.id;
    if (!targetId) {
      setStudentContext(null);
      return;
    }

    let isMounted = true;
    const fetchContext = async () => {
      setIsLoadingContext(true);
      setContextError(null);
      try {
        const contextData = await recruiterService.getStudentFeedbackContext(targetId);
        if (isMounted) {
          setStudentContext(contextData);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Candidate placement context not available yet:', err);
          // Context is optional if student has not selected career roadmap
          setStudentContext({
            studentId: targetId,
            studentName: selectedStudent.name,
            selectedCareer: null,
            studentSkills: [],
            matches: [],
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingContext(false);
        }
      }
    };

    fetchContext();

    return () => {
      isMounted = false;
    };
  }, [selectedStudent]);

  // Manual select by ObjectId
  const handleSelectStudentById = async (sid) => {
    if (!sid.trim()) return;
    try {
      const userData = await recruiterService.getUserById(sid.trim());
      const u = userData?.user || {};
      const newCand = {
        id: u.id || sid.trim(),
        name: u.name || 'Student Candidate',
        email: u.email || 'campus.candidate@university.edu',
        latestStatus: 'Candidate Selected',
      };
      setSelectedStudent(newCand);
      setManualIdInput('');
      setIsManualSearch(false);
    } catch (err) {
      console.error('Failed to find student by ID:', err);
      setSelectedStudent({
        id: sid.trim(),
        name: `Candidate (${sid.trim().slice(-6)})`,
        email: 'ID Verified',
        latestStatus: 'Direct Entry',
      });
      setIsManualSearch(false);
    }
  };

  // Filter candidates by search term
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const q = searchQuery.toLowerCase().trim();
    return candidates.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [candidates, searchQuery]);

  // Submit Feedback via POST /api/feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedStudent?.id) {
      setFormError('Please select a student candidate to evaluate.');
      return;
    }
    if (!feedbackComments.trim()) {
      setFormError('Evaluation feedback comments cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await recruiterService.submitFeedback(selectedStudent.id, feedbackComments.trim());

      // Record in local session history
      const newHistoryItem = {
        id: Date.now().toString(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        comments: feedbackComments.trim(),
        date: new Date().toISOString(),
      };
      setSubmittedHistory((prev) => [newHistoryItem, ...prev]);

      setToastMessage(`Feedback successfully recorded for ${selectedStudent.name}.`);
      setFeedbackComments('');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setFormError(
        err?.response?.data?.message ||
          'Failed to record feedback. Please check student ID or credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-7 max-w-[1400px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-900 text-white shadow-xl border border-emerald-700 animate-in fade-in slide-in-from-top-4 duration-300">
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
      {/* 1. PORTAL HERO BANNER                                                     */}
      {/* ========================================================================= */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-[#0d223c] to-[#08182b] text-white p-6 md:p-8 card-shadow relative overflow-hidden">
        {/* Ambient Icon Watermark */}
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <FileCheck className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs backdrop-blur-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Campus Recruiter • Candidate Evaluation &amp; Feedback</span>
            </div>

            <Link to="/recruiter/dashboard">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="border-white/20 text-white hover:bg-white/10 text-xs"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Student Review &amp; Feedback Portal</span>
              <Badge variant="primary" size="sm">
                Placement Network
              </Badge>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Evaluate student candidate readiness, review verified technical skills, and submit structured feedback. Recruiter feedback directly influences institutional placement readiness metrics.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (Left 4 Cols: Candidates / Right 8 Cols: Workspace)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 Cols): Candidate Roster / Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-600 text-white">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Authorized Candidates</h2>
                  <p className="text-[11px] text-slate-500">Scheduled interview roster</p>
                </div>
              </div>
              <span className="text-xs font-mono text-blue-600 font-bold">
                {candidates.length}
              </span>
            </div>

            {/* Candidate Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name or email..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Candidate List */}
            {isLoadingCandidates ? (
              <div className="space-y-2 py-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : candidateError ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {candidateError}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <EmptyState
                compact
                icon={<Users className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
                title="No Candidates Found"
                description={
                  candidates.length === 0
                    ? 'No candidates are currently scheduled for mock reviews.'
                    : 'No candidates matched your search criteria.'
                }
              />
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredCandidates.map((c) => {
                  const isSelected = selectedStudent?.id === c.id;
                  const initial = String(c.name || 'S').charAt(0).toUpperCase();

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedStudent(c)}
                      className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate block">
                            {c.name || 'Candidate'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono truncate block">
                            {c.email}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={c.latestStatus === 'completed' ? 'success' : 'primary'}
                        size="xs"
                        className="shrink-0"
                      >
                        {c.latestStatus || 'Scheduled'}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Direct Candidate ID Lookup */}
            <div className="pt-2 border-t border-slate-100">
              {!isManualSearch ? (
                <button
                  type="button"
                  onClick={() => setIsManualSearch(true)}
                  className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1.5"
                >
                  <span>Evaluate candidate by ID</span>
                </button>
              ) : (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={manualIdInput}
                      onChange={(e) => setManualIdInput(e.target.value)}
                      placeholder="Paste Candidate ObjectId..."
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => handleSelectStudentById(manualIdInput)}
                    >
                      Select
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsManualSearch(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (8 Cols): Candidate Summary + Feedback Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Selected Candidate Summary & Skills */}
          {selectedStudent ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
                    {String(selectedStudent.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {selectedStudent.name}
                      </h3>
                      <Badge variant="primary" size="xs">
                        Authorized Candidate
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedStudent.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Target Track:
                  </span>
                  <Badge variant="secondary" size="xs">
                    {studentContext?.selectedCareer || 'Career Track Active'}
                  </Badge>
                </div>
              </div>

              {/* Candidate Skills Context (from GET /placement/company-match/:studentId) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Verified Technical Competencies
                </span>

                {isLoadingContext ? (
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                ) : (studentContext?.studentSkills || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {studentContext.studentSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Candidate skills will populate from their verified career roadmap.
                  </p>
                )}
              </div>

              {/* Placement Engine Match Note */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Placement Readiness Weightage</span>
                  <span className="text-[11px] leading-relaxed text-blue-800">
                    Recruiter feedback contributes 30% to the student's institutional placement readiness score (<code>Formula: goalScore × 0.30 + interviewScore × 0.40 + feedbackScore × 0.30</code>).
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-card text-center space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Candidate Selected</h3>
              <p className="text-xs text-slate-500">
                Select a candidate from the roster on the left to write an evaluation.
              </p>
            </div>
          )}

          {/* Feedback Form Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-600 text-white">
                  <Send className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Candidate Evaluation Feedback
                  </h3>
                  <p className="text-xs text-slate-500">
                    Structured technical feedback recorded to the campus placement database
                  </p>
                </div>
              </div>
              <Badge variant="primary" size="xs">
                Official Review
              </Badge>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Technical Feedback &amp; Recommendations <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {feedbackComments.length} characters
                  </span>
                </div>

                <textarea
                  required
                  rows={6}
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  placeholder={`Structure your feedback to help the candidate and faculty evaluate hiring readiness:\n\n• Core Technical Strengths: (e.g., solid problem solving, clean API architecture)\n• Areas for Improvement: (e.g., concurrency models, system design trade-offs)\n• Candidate Readiness Assessment: (e.g., recommend for Tier-1 engineering roles)`}
                  className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-3.5 focus:outline-none focus:border-blue-600 leading-relaxed placeholder:text-slate-400 transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackComments('')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Clear Form
                </button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!selectedStudent || isSubmitting}
                  isLoading={isSubmitting}
                  loadingText="Recording Feedback..."
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                  className="text-xs shadow-md"
                >
                  Submit Recruiter Feedback
                </Button>
              </div>
            </form>
          </div>

          {/* Session Feedback History */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-600 text-white">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Recently Submitted Reviews
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluations recorded during this active session
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                {submittedHistory.length} recorded
              </span>
            </div>

            {submittedHistory.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50/70 border border-slate-100 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700">
                  No feedback submitted in this session yet.
                </p>
                <p className="text-[11px] text-slate-400">
                  Completed evaluations will appear here immediately after submission.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submittedHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {item.studentName}
                        </span>
                        <Badge variant="success" size="xs">
                          Recorded ✓
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                      {item.comments}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SafeStudentFeedbackPortalPage = (props) => (
  <ErrorBoundary fallbackTitle="Feedback Portal Encountered an Issue">
    <StudentFeedbackPortalPage {...props} />
  </ErrorBoundary>
);

export default SafeStudentFeedbackPortalPage;

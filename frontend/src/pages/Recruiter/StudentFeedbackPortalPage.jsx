import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileCheck,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Send,
  ArrowLeft,
  X,
  History,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import FeedbackList from '../../components/recruiter/FeedbackList';
import FeedbackModal from '../../components/recruiter/FeedbackModal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';

export const StudentFeedbackPortalPage = () => {
  const { studentId: routeStudentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [candidates, setCandidates] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Feedback Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Candidate Search within Feedback page
  const [searchQuery, setSearchQuery] = useState('');

  // Load candidates and past feedback
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [candidatesRes, feedbackRes] = await Promise.allSettled([
        recruiterService.getCandidatesLeaderboard(1, 50),
        recruiterService.getFeedbackHistory(),
      ]);

      let cList = [];
      if (candidatesRes.status === 'fulfilled' && candidatesRes.value) {
        cList = Array.isArray(candidatesRes.value) ? candidatesRes.value : [];
        setCandidates(cList);
      }

      if (feedbackRes.status === 'fulfilled' && feedbackRes.value) {
        setFeedbackHistory(Array.isArray(feedbackRes.value) ? feedbackRes.value : []);
      }

      // If route has studentId, open modal automatically for that student
      if (routeStudentId) {
        const found = cList.find(
          (c) => String(c.studentId || c.id || c._id) === String(routeStudentId)
        );
        if (found) {
          setTargetCandidate(found);
          setIsModalOpen(true);
        } else {
          // Fetch student user details
          recruiterService.getUserById(routeStudentId).then((res) => {
            const u = res?.user || {};
            setTargetCandidate({
              studentId: routeStudentId,
              studentName: u.name || 'Candidate',
              email: u.email || '',
            });
            setIsModalOpen(true);
          }).catch((e) => console.warn('Could not find candidate by route id:', e));
        }
      }
    } catch (err) {
      console.error('Failed to load feedback portal data:', err);
      setError(err?.response?.data?.message || 'Unable to connect to feedback services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [routeStudentId, user]);

  const handleSubmitFeedback = async (studentId, comments, rating) => {
    setIsSubmitting(true);
    try {
      const res = await recruiterService.submitFeedback(studentId, comments, rating);
      const studentObj = candidates.find(
        (c) => String(c.studentId || c.id || c._id) === String(studentId)
      ) || targetCandidate;

      // Add to feedback history locally
      const newEntry = {
        _id: res?.feedback?._id || Date.now().toString(),
        studentId: {
          _id: studentId,
          name: studentObj?.studentName || studentObj?.name || 'Candidate',
          email: studentObj?.email || '',
        },
        comments,
        rating,
        date: new Date().toISOString(),
      };
      setFeedbackHistory((prev) => [newEntry, ...prev]);

      setToastMessage('Evaluation feedback submitted and recorded to readiness index!');
      setIsModalOpen(false);
      setTargetCandidate(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      throw new Error(err?.response?.data?.message || 'Failed to record candidate feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSubmitModal = (cand = null) => {
    setTargetCandidate(cand);
    setIsModalOpen(true);
  };

  // Filter candidates list for evaluation
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return candidates.filter(
      (c) =>
        (c.studentName && c.studentName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.selectedCareer && c.selectedCareer.toLowerCase().includes(q))
    );
  }, [candidates, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-xl mx-auto">
        <ErrorState
          title="Feedback Portal Error"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/recruiter/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Workspace</span>
        </button>
      </div>

      {/* 1. Header & Context */}
      <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 md:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-medium">
              <FileCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Campus Recruitment Feedback</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Candidate Evaluation &amp; Feedback
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Submit structured technical interview feedback. Your evaluations directly contribute 30% weight to student campus readiness scores.
            </p>
          </div>

          <button
            onClick={() => openSubmitModal(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </header>

      {/* 2. Quick Candidate Evaluator Selector */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Evaluate a Candidate</h2>
            <p className="text-xs text-slate-500">
              Select an interviewed student to record structured performance remarks
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {filteredCandidates.map((c) => {
            const sid = c.studentId || c.id || c._id;
            const readiness = Number(c.readinessScore) || 0;

            return (
              <div
                key={sid}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate">
                      {c.studentName || 'Student'}
                    </span>
                    <Badge variant="success" size="xs">
                      {readiness}%
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {c.selectedCareer || 'Cloud & Distributed Systems'}
                  </span>
                </div>

                <button
                  onClick={() => openSubmitModal(c)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 text-[11px] shrink-0"
                >
                  Review
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Past Feedback History */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Submitted Feedback History ({feedbackHistory.length})
            </h2>
          </div>
        </div>

        <FeedbackList
          feedbacks={feedbackHistory}
          onSelectCandidate={(stud) => openSubmitModal(stud)}
        />
      </section>

      {/* 4. Feedback Submission Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTargetCandidate(null);
        }}
        candidate={targetCandidate}
        candidatesList={candidates}
        onSubmit={handleSubmitFeedback}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default StudentFeedbackPortalPage;

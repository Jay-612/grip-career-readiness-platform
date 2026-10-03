import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck,
  Target,
  CheckCircle2,
  Clock,
  Video,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

// Clean Modular Faculty Interview Components
import {
  InterviewEvaluationHeader,
  LiveEvaluationTab,
  RemedialPlanTab,
  StudentDetailsDrawer,
} from '../../components/faculty/interview';

export const InterviewEvaluationPage = () => {
  const { id: routeInterviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Navigation Tabs: 'evaluation' (default) | 'remedial'
  const [activeTab, setActiveTab] = useState('evaluation');

  // Loading and Error states
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Appointments data
  const [allAppointments, setAllAppointments] = useState([]);
  const [currentInterview, setCurrentInterview] = useState(null);

  // Student extra context
  const [studentReadiness, setStudentReadiness] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [pastInterviews, setPastInterviews] = useState([]);

  // Student Details Drawer State
  const [isStudentDrawerOpen, setIsStudentDrawerOpen] = useState(false);

  // Evaluation Form State (0-10 scale)
  const [technicalScore, setTechnicalScore] = useState(8);
  const [communicationScore, setCommunicationScore] = useState(8);
  const [confidenceScore, setConfidenceScore] = useState(8);

  // Observations
  const [overallSynthesis, setOverallSynthesis] = useState('');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [communicationNotes, setCommunicationNotes] = useState('');
  const [confidenceNotes, setConfidenceNotes] = useState('');

  // Attestation checkbox
  const [certified, setCertified] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [dispatchedActionPlan, setDispatchedActionPlan] = useState(null);
  const [dispatchedGoals, setDispatchedGoals] = useState([]);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState(null);

  // Remedial Plan Meta
  const [planTitle, setPlanTitle] = useState('Remedial Action Plan: Mock Interview Follow-up');
  const [planSummary, setPlanSummary] = useState('');
  const [actionPlanTasks, setActionPlanTasks] = useState([]);
  const [hasManuallyEditedTasks, setHasManuallyEditedTasks] = useState(false);

  // Acceptance state
  const [isAcceptingRequest, setIsAcceptingRequest] = useState(false);

  // Session Stopwatch (starts at 0, controllable by faculty)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Stopwatch interval effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // ─────────────────────────────────────────────────────────────
  // 1. DATA FETCHING (Assigned Mock Interviews)
  // ─────────────────────────────────────────────────────────────
  const fetchAppointmentsAndContext = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setSubmitSuccess(false);

    try {
      const appointments = await facultyService.getAppointments();
      setAllAppointments(appointments || []);

      if (!appointments || appointments.length === 0) {
        setIsLoading(false);
        return;
      }

      // Find target interview: by route param if provided, otherwise first scheduled, pending, or first item
      let target = null;
      if (routeInterviewId) {
        target = appointments.find((a) => String(a.id || a._id) === String(routeInterviewId));
      }
      if (!target) {
        target =
          appointments.find((a) => a.status === 'scheduled') ||
          appointments.find((a) => a.status === 'pending') ||
          appointments[0];
      }

      setCurrentInterview(target);

      // Reset timer for session
      setIsTimerRunning(false);
      setTimerSeconds(0);

      // If the target interview is already completed, set read-only
      if (target?.status === 'completed') {
        setIsReadOnly(true);
      } else {
        setIsReadOnly(false);
      }

      // Load student context if student ID exists
      const studentId = target?.student?.id || target?.student?._id;
      if (studentId) {
        const [readinessRes, progressRes, interviewAnalysisRes] =
          await Promise.allSettled([
            facultyService.getStudentReadiness(studentId),
            facultyService.getStudentProgress(studentId),
            facultyService.getStudentInterviewAnalysis(studentId),
          ]);

        if (readinessRes.status === 'fulfilled') {
          setStudentReadiness(readinessRes.value);
        }
        if (progressRes.status === 'fulfilled') {
          setStudentProgress(progressRes.value);
        }
        if (interviewAnalysisRes.status === 'fulfilled') {
          const analysis = interviewAnalysisRes.value;
          const interviews = analysis?.interviews || [];
          setPastInterviews(interviews);

          // If current interview was completed, load recorded scores
          if (target?.status === 'completed') {
            const thisInterview = interviews.find(
              (i) => String(i.interviewId) === String(target.id || target._id)
            );
            if (thisInterview?.scores) {
              if (typeof thisInterview.scores.technical === 'number') {
                setTechnicalScore(thisInterview.scores.technical);
              }
              if (typeof thisInterview.scores.communication === 'number') {
                setCommunicationScore(thisInterview.scores.communication);
              }
              if (typeof thisInterview.scores.confidence === 'number') {
                setConfidenceScore(thisInterview.scores.confidence);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load interview evaluation data:', err);
      setLoadError(
        err.response?.data?.message ||
          'Failed to load interview evaluation panel. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [routeInterviewId]);

  useEffect(() => {
    fetchAppointmentsAndContext();
  }, [fetchAppointmentsAndContext]);

  // Handle switching to another interview
  const handleSelectInterview = (appointmentId) => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    navigate(`/faculty/interviews/${appointmentId}`);
  };

  // ─────────────────────────────────────────────────────────────
  // 2. SMART REMEDIAL DEFICIT SUGGESTIONS (< 7/10 THRESHOLD)
  // ─────────────────────────────────────────────────────────────
  const suggestedTasks = useMemo(() => {
    const tasks = [];
    if (technicalScore < 7) {
      tasks.push({
        id: `suggested-technical-${Date.now()}-1`,
        title: 'Master Core Data Structures & Dynamic Programming',
        category: 'technical',
        estimatedHours: 8,
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        description: 'Complete 10 Medium problem sets on dynamic programming, trees, and graphs. Focus on space-time complexities.',
        resourceLink: 'https://leetcode.com',
        isCustom: false,
      });
    }
    if (communicationScore < 7) {
      tasks.push({
        id: `suggested-communication-${Date.now()}-2`,
        title: 'Practice STAR Framework Articulation & Project Delivery',
        category: 'communication',
        estimatedHours: 5,
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        description: 'Structure 3 key project experiences into the STAR format (Situation, Task, Action, Result). Practice out-loud delivery.',
        resourceLink: '',
        isCustom: false,
      });
    }
    if (confidenceScore < 7) {
      tasks.push({
        id: `suggested-confidence-${Date.now()}-3`,
        title: 'Timed Mock Pressure Simulations & Composure Practice',
        category: 'confidence',
        estimatedHours: 4,
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        description: 'Practice think-aloud problem solving under timed dry-runs. Deliberately pause before responding to edge-case critiques.',
        resourceLink: '',
        isCustom: false,
      });
    }
    return tasks;
  }, [technicalScore, communicationScore, confidenceScore]);

  // Sync actionPlanTasks with smart suggestions unless customized
  useEffect(() => {
    if (!hasManuallyEditedTasks) {
      setActionPlanTasks(suggestedTasks);
    }
  }, [suggestedTasks, hasManuallyEditedTasks]);

  // Reset to smart suggestions
  const handleResetToSuggestions = () => {
    setActionPlanTasks(suggestedTasks);
    setHasManuallyEditedTasks(false);
  };

  // Add/Edit Task in Remedial List
  const handleSaveRemedialTask = (savedTask) => {
    setHasManuallyEditedTasks(true);
    setActionPlanTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === savedTask.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedTask;
        return next;
      }
      return [...prev, savedTask];
    });
  };

  // Remove Task from Remedial List
  const handleRemoveRemedialTask = (taskId) => {
    setHasManuallyEditedTasks(true);
    setActionPlanTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // ─────────────────────────────────────────────────────────────
  // 3. ACTIONS: ACCEPT APPOINTMENT
  // ─────────────────────────────────────────────────────────────
  const handleAcceptAppointment = async () => {
    const interviewId = currentInterview?.id || currentInterview?._id;
    if (!interviewId) return;
    setIsAcceptingRequest(true);
    try {
      const res = await facultyService.acceptAppointment(interviewId);
      if (res?.appointment) {
        const updated = res.appointment;
        setCurrentInterview((prev) => ({
          ...prev,
          ...updated,
          id: updated.id || prev?.id,
          status: 'scheduled',
          meetLink: updated.meetLink,
        }));
        setAllAppointments((prev) =>
          prev.map((a) =>
            String(a.id || a._id) === String(interviewId)
              ? { ...a, status: 'scheduled', meetLink: updated.meetLink }
              : a
          )
        );
        setToastMessage('Interview request accepted! Google Meet room generated.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to accept appointment:', err);
      alert(err.response?.data?.message || 'Failed to accept interview request.');
    } finally {
      setIsAcceptingRequest(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. ACTIONS: SUBMIT EVALUATION
  // ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    if (technicalScore < 0 || technicalScore > 10 || isNaN(technicalScore)) {
      setSubmitError('Technical score must be between 0 and 10.');
      return false;
    }
    if (communicationScore < 0 || communicationScore > 10 || isNaN(communicationScore)) {
      setSubmitError('Communication score must be between 0 and 10.');
      return false;
    }
    if (confidenceScore < 0 || confidenceScore > 10 || isNaN(confidenceScore)) {
      setSubmitError('Problem Solving score must be between 0 and 10.');
      return false;
    }
    if (!certified) {
      setSubmitError('Please confirm the digital faculty attestation before submitting.');
      return false;
    }
    return true;
  };

  const handleSubmitEvaluation = async () => {
    setSubmitError(null);
    if (isReadOnly) return;
    if (!currentInterview?.id && !currentInterview?._id) {
      setSubmitError('No active interview session is selected.');
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formattedTasks = actionPlanTasks
        .filter((t) => t.title && t.title.trim())
        .map((t) => ({
          title: t.title.trim(),
          category: t.category || 'technical',
          estimatedHours: Number(t.estimatedHours) || 5,
          targetDate: t.targetDate ? new Date(t.targetDate) : new Date(Date.now() + 7 * 86400000),
          task: t.description || t.title,
        }));

      const interviewId = currentInterview.id || currentInterview._id;

      const response = await facultyService.submitEvaluation({
        interviewId,
        technical: technicalScore,
        communication: communicationScore,
        confidence: confidenceScore,
        technicalNotes,
        communicationNotes,
        confidenceNotes,
        overallSynthesis,
        facultyFeedback: overallSynthesis,
        actionPlanTasks: formattedTasks,
      });

      if (response?.actionPlan) {
        setDispatchedActionPlan(response.actionPlan);
      }
      if (response?.assignedGoals) {
        setDispatchedGoals(response.assignedGoals);
      }

      setSubmitSuccess(true);
      setIsReadOnly(true);
      setIsTimerRunning(false);

      // Update appointment status in state
      setAllAppointments((prev) =>
        prev.map((a) =>
          String(a.id || a._id) === String(interviewId) ? { ...a, status: 'completed' } : a
        )
      );
      setCurrentInterview((prev) => (prev ? { ...prev, status: 'completed' } : prev));

      setToastMessage('Evaluation successfully submitted and recorded in university records!');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
      setSubmitError(
        err.response?.data?.message || 'Failed to submit evaluation score. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 5. ACTIONS: ASSIGN REMEDIAL PLAN (FROM TAB 2)
  // ─────────────────────────────────────────────────────────────
  const handleAssignRemedialPlan = async () => {
    setIsAssigningPlan(true);
    try {
      // Re-trigger submitEvaluation or update action plan
      await handleSubmitEvaluation();
      setActiveTab('remedial');
    } finally {
      setIsAssigningPlan(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 6. HISTORICAL PREVIOUS INTERVIEW AVERAGE
  // ─────────────────────────────────────────────────────────────
  const previousInterviewAverage = useMemo(() => {
    const completedPast = pastInterviews.filter(
      (i) => i.scores?.average !== null && i.scores?.average !== undefined
    );
    if (completedPast.length === 0) return null;
    const sum = completedPast.reduce((acc, i) => acc + Number(i.scores.average), 0);
    return +(sum / completedPast.length).toFixed(1);
  }, [pastInterviews]);

  // ─────────────────────────────────────────────────────────────
  // 7. LOADING & ERROR STATES
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 antialiased max-w-5xl mx-auto px-4 sm:px-6">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
        <div className="h-32 bg-slate-200 rounded-2xl w-full animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-2xl w-full animate-pulse" />
        <div className="h-48 bg-slate-200 rounded-2xl w-full animate-pulse" />
      </div>
    );
  }

  if (loadError && (!allAppointments || allAppointments.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState
          title="Unable to Load Evaluation Panel"
          message={loadError}
          onRetry={fetchAppointmentsAndContext}
          retryText="Retry Connection"
        />
      </div>
    );
  }

  if (!currentInterview) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/faculty/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Interview Evaluation Panel</h1>
        </div>

        <EmptyState
          title="No Scheduled Mock Interviews"
          description="There are currently no mock interview appointments assigned to your evaluation queue."
          action={
            <Link to="/faculty/dashboard">
              <Button variant="primary" size="md">
                Return to Faculty Dashboard
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14 antialiased max-w-5xl mx-auto px-4 sm:px-6">
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

      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link
            to="/faculty/dashboard"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Interview Evaluation</span>
          <span className="text-slate-300">/</span>
          <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            #INT-{(currentInterview.id || currentInterview._id || '').slice(-6).toUpperCase()}
          </span>
        </div>

        {isReadOnly && (
          <Badge variant="success" size="sm" dot>
            Evaluation Completed
          </Badge>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. LIVE INTERVIEW HEADER
          Student Name, Target Role, Interview Type, Scheduled Time, Status, Meet CTA, View Details
      ───────────────────────────────────────────────────────────── */}
      <InterviewEvaluationHeader
        currentInterview={currentInterview}
        allAppointments={allAppointments}
        onSelectInterview={handleSelectInterview}
        onOpenStudentDetails={() => setIsStudentDrawerOpen(true)}
        onAcceptAppointment={handleAcceptAppointment}
        isAccepting={isAcceptingRequest}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. TWO PRIMARY TABS: LIVE EVALUATION & REMEDIAL PLAN
      ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('evaluation')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'evaluation'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Live Evaluation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('remedial')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'remedial'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Remedial Plan</span>
          {actionPlanTasks.length > 0 && (
            <span
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                activeTab === 'remedial'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {actionPlanTasks.length}
            </span>
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB CONTENT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'evaluation' ? (
        <LiveEvaluationTab
          timerSeconds={timerSeconds}
          isTimerRunning={isTimerRunning}
          onStartTimer={() => setIsTimerRunning(true)}
          onPauseTimer={() => setIsTimerRunning(false)}
          onResetTimer={() => {
            setIsTimerRunning(false);
            setTimerSeconds(0);
          }}
          technicalScore={technicalScore}
          communicationScore={communicationScore}
          confidenceScore={confidenceScore}
          onChangeTechnical={setTechnicalScore}
          onChangeCommunication={setCommunicationScore}
          onChangeConfidence={setConfidenceScore}
          previousInterviewAverage={previousInterviewAverage}
          onViewHistory={() => setIsStudentDrawerOpen(true)}
          observations={overallSynthesis}
          onChangeObservations={setOverallSynthesis}
          strengths={technicalNotes}
          onChangeStrengths={setTechnicalNotes}
          improvements={communicationNotes}
          onChangeImprovements={setCommunicationNotes}
          certified={certified}
          onChangeCertified={setCertified}
          onSubmit={handleSubmitEvaluation}
          isSubmitting={isSubmitting}
          submitError={submitError}
          isReadOnly={isReadOnly}
          submitSuccess={submitSuccess}
        />
      ) : (
        <RemedialPlanTab
          planTitle={planTitle}
          onChangePlanTitle={setPlanTitle}
          planSummary={planSummary}
          onChangePlanSummary={setPlanSummary}
          tasks={actionPlanTasks}
          onSaveTask={handleSaveRemedialTask}
          onRemoveTask={handleRemoveRemedialTask}
          onResetToSuggestions={handleResetToSuggestions}
          hasSuggestions={suggestedTasks.length > 0}
          onAssignPlan={handleAssignRemedialPlan}
          isAssigning={isAssigningPlan}
          isReadOnly={isReadOnly}
          dispatchedPlan={dispatchedActionPlan}
          dispatchedGoals={dispatchedGoals}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          STUDENT DETAILS DRAWER
          Opened via "View Student Details" or "Candidate History →"
      ───────────────────────────────────────────────────────────── */}
      <StudentDetailsDrawer
        isOpen={isStudentDrawerOpen}
        onClose={() => setIsStudentDrawerOpen(false)}
        student={currentInterview.student}
        progress={studentProgress}
        readiness={studentReadiness}
        pastInterviews={pastInterviews}
      />
    </div>
  );
};

export default InterviewEvaluationPage;

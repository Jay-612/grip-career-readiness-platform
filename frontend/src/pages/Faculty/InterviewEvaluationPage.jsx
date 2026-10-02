import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileCheck,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Video,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Send,
  Lock,
  ChevronDown,
  ExternalLink,
  Award,
  Sparkles,
  Copy,
  RefreshCw,
  Edit3,
  Link2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const InterviewEvaluationPage = () => {
  const { id: routeInterviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Evaluation Form State (backed strictly by backend model fields: 0-10)
  const [technicalScore, setTechnicalScore] = useState(8);
  const [communicationScore, setCommunicationScore] = useState(8);
  const [confidenceScore, setConfidenceScore] = useState(8);

  // Evaluator observations
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [communicationNotes, setCommunicationNotes] = useState('');
  const [confidenceNotes, setConfidenceNotes] = useState('');
  const [overallSynthesis, setOverallSynthesis] = useState('');

  // Attestation checkbox
  const [certified, setCertified] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Google Meet generation state
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);
  const [meetToast, setMeetToast] = useState(null);
  const [isEditingMeet, setIsEditingMeet] = useState(false);
  const [customMeetInput, setCustomMeetInput] = useState('');

  // Session stopwatch / timer
  const [timerSeconds, setTimerSeconds] = useState(2295); // ~38 mins initial
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Switcher dropdown
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Handle on-demand Google Meet generation
  const handleGenerateMeet = async () => {
    const interviewId = currentInterview?.id || currentInterview?._id;
    if (!interviewId) return;
    setIsGeneratingMeet(true);
    try {
      const res = await facultyService.generateGoogleMeet(interviewId);
      if (res?.meetLink) {
        setCurrentInterview((prev) => ({
          ...prev,
          meetLink: res.meetLink,
          googleEventId: res.googleEventId,
          calendarHtmlLink: res.calendarHtmlLink,
        }));
        setMeetToast('Meeting room updated!');
        setTimeout(() => setMeetToast(null), 4000);
      }
    } catch (err) {
      console.error('Failed to generate meet link:', err);
      alert(err.response?.data?.message || 'Failed to generate meeting link.');
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  // Handle saving custom/real Google Meet link (e.g. from meet.google.com/new)
  const handleSaveCustomMeet = async () => {
    const interviewId = currentInterview?.id || currentInterview?._id;
    if (!interviewId || !customMeetInput.trim()) return;
    setIsGeneratingMeet(true);
    try {
      const res = await facultyService.generateGoogleMeet(interviewId, customMeetInput.trim());
      if (res?.meetLink) {
        setCurrentInterview((prev) => ({
          ...prev,
          meetLink: res.meetLink,
          googleEventId: res.googleEventId,
          calendarHtmlLink: res.calendarHtmlLink,
        }));
        setMeetToast('Meeting link saved successfully!');
        setTimeout(() => setMeetToast(null), 4000);
        setIsEditingMeet(false);
        setCustomMeetInput('');
      }
    } catch (err) {
      console.error('Failed to save meet link:', err);
      alert(err.response?.data?.message || 'Failed to save meeting link.');
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  // Stopwatch effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(
      mins
    ).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Fetch appointments and select active interview
  const fetchAppointmentsAndContext = async () => {
    setIsLoading(true);
    setLoadError(null);
    setSubmitSuccess(false);

    try {
      const appointments = await facultyService.getAppointments();
      setAllAppointments(appointments);

      if (!appointments || appointments.length === 0) {
        setIsLoading(false);
        return;
      }

      // Find target interview: by route param if provided, otherwise first scheduled, or first item
      let target = null;
      if (routeInterviewId) {
        target = appointments.find((a) => a.id === routeInterviewId);
      }
      if (!target) {
        target =
          appointments.find((a) => a.status === 'scheduled') || appointments[0];
      }

      setCurrentInterview(target);

      // If the target interview is already completed, set read-only
      if (target?.status === 'completed') {
        setIsReadOnly(true);
      } else {
        setIsReadOnly(false);
      }

      // Load student context if student ID exists
      const studentId = target?.student?.id;
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

          // If current interview is completed, check if existing scores can be loaded
          if (target?.status === 'completed') {
            const thisInterview = interviews.find(
              (i) => String(i.interviewId) === String(target.id)
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
  };

  useEffect(() => {
    fetchAppointmentsAndContext();
  }, [routeInterviewId]);

  // Handle switching to another interview
  const handleSelectInterview = (appointmentId) => {
    setIsSwitcherOpen(false);
    navigate(`/faculty/interviews/${appointmentId}`);
  };

  // Calculations
  const averageScore = useMemo(() => {
    const avg = (technicalScore + communicationScore + confidenceScore) / 3;
    return Math.round(avg * 10) / 10;
  }, [technicalScore, communicationScore, confidenceScore]);

  const scoreGrade = useMemo(() => {
    if (averageScore >= 9.0) return { label: 'Grade A+ • Exceptional', variant: 'success' };
    if (averageScore >= 8.0) return { label: 'Grade A • Strong', variant: 'success' };
    if (averageScore >= 7.0) return { label: 'Grade B+ • Proficient', variant: 'info' };
    if (averageScore >= 6.0) return { label: 'Grade B • Developing', variant: 'warning' };
    return { label: 'Grade C • Remedial Required', variant: 'danger' };
  }, [averageScore]);

  // Current readiness & projected impact
  const currentReadiness = studentReadiness?.readinessScore || 85;
  const projectedReadiness = useMemo(() => {
    // Mock interviews account for 40% in readiness formula
    // Each 1 pt in interview score contributes to readiness
    const boost = Math.round((averageScore - 5) * 0.8 * 10) / 10;
    return Math.min(100, Math.max(0, Math.round((currentReadiness + boost) * 10) / 10));
  }, [currentReadiness, averageScore]);

  // Validation
  const validateForm = () => {
    if (
      technicalScore < 0 ||
      technicalScore > 10 ||
      isNaN(technicalScore)
    ) {
      setSubmitError('Technical score must be between 0 and 10.');
      return false;
    }
    if (
      communicationScore < 0 ||
      communicationScore > 10 ||
      isNaN(communicationScore)
    ) {
      setSubmitError('Communication score must be between 0 and 10.');
      return false;
    }
    if (
      confidenceScore < 0 ||
      confidenceScore > 10 ||
      isNaN(confidenceScore)
    ) {
      setSubmitError('Confidence score must be between 0 and 10.');
      return false;
    }
    if (!certified) {
      setSubmitError('Please certify the digital faculty attestation before submitting.');
      return false;
    }
    return true;
  };

  // Form submission
  const handleSubmitEvaluation = async (e) => {
    if (e) e.preventDefault();
    setSubmitError(null);

    if (isReadOnly) {
      return;
    }

    if (!currentInterview?.id) {
      setSubmitError('No active interview session is selected.');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await facultyService.submitEvaluation({
        interviewId: currentInterview.id,
        technical: technicalScore,
        communication: communicationScore,
        confidence: confidenceScore,
      });

      setSubmitSuccess(true);
      setIsReadOnly(true);
      setIsTimerRunning(false);

      // Update current appointment status in local list
      setAllAppointments((prev) =>
        prev.map((a) =>
          a.id === currentInterview.id ? { ...a, status: 'completed' } : a
        )
      );
      setCurrentInterview((prev) =>
        prev ? { ...prev, status: 'completed' } : prev
      );
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
      setSubmitError(
        err.response?.data?.message ||
          'Failed to submit evaluation score. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBA';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="h-40 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-72 bg-slate-200 rounded-2xl" />
            <div className="h-60 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (loadError && (!allAppointments || allAppointments.length === 0)) {
    return (
      <ErrorState
        title="Unable to Load Evaluation Panel"
        message={loadError}
        onRetry={fetchAppointmentsAndContext}
        retryText="Retry Connection"
      />
    );
  }

  // Empty state if no interview appointments found
  if (!currentInterview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/faculty/dashboard">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            Interview Evaluation Panel
          </h1>
        </div>

        <EmptyState
          title="No Scheduled Mock Interviews"
          description="There are currently no mock interview appointments assigned to your evaluation queue. When students schedule mock interviews, they will appear here."
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

  const studentName = currentInterview.student?.name || 'Student Candidate';
  const studentEmail = currentInterview.student?.email || 'student@campus.edu';
  const targetCareer =
    studentProgress?.profile?.selectedCareer ||
    'Distributed Systems & Cloud Backend Track';
  const semester = studentProgress?.profile?.semester || 5;

  return (
    <div className="space-y-6 antialiased">
      {/* ================= 1. INTERVIEW HEADER & BREADCRUMBS ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/faculty/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Portal</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800">
              Interview Evaluation Panel
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              #INT-{currentInterview.id?.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Header Actions & Appointment Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <span>Switch Interview ({allAppointments.length})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isSwitcherOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSwitcherOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Assigned Interview
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {allAppointments.map((apt) => (
                      <button
                        key={apt.id}
                        type="button"
                        onClick={() => handleSelectInterview(apt.id)}
                        className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-2 transition ${
                          apt.id === currentInterview.id
                            ? 'bg-blue-50/70 font-semibold text-blue-700'
                            : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <p className="font-medium truncate">
                            {apt.student?.name || 'Student Candidate'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {apt.date} {apt.time || ''}
                          </p>
                        </div>
                        <Badge
                          variant={
                            apt.status === 'completed'
                              ? 'success'
                              : apt.status === 'scheduled'
                              ? 'info'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {apt.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {!isReadOnly && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitEvaluation}
              isLoading={isSubmitting}
              loadingText="Submitting..."
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              className="text-xs shadow-xs"
            >
              Submit & Finalize
            </Button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-emerald-900">
              Evaluation Submitted & Certified Successfully!
            </h4>
            <p className="text-emerald-700 mt-0.5">
              The rubric scores have been saved to the institutional placement records. The interview status is now marked as Completed and the student's placement readiness score has been updated.
            </p>
          </div>
        </div>
      )}

      {/* Submission Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-900">Submission Error</h4>
            <p className="text-rose-700 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Read-Only Status Banner */}
      {isReadOnly && !submitSuccess && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Read-Only Mode:</strong> This mock interview was previously evaluated and completed. Scores are certified in the university records.
            </span>
          </div>
          <Badge variant="success" size="sm">
            Completed
          </Badge>
        </div>
      )}

      {/* ================= 2. CANDIDATE & LIVE SESSION HEADER ================= */}
      <section
        className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-card"
        data-purpose="candidate-interview-context"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Candidate Identity */}
          <div className="lg:col-span-5 flex items-start gap-4">
            <Avatar
              name={studentName}
              size="lg"
              variant="primary"
              className="w-14 h-14 text-base font-bold shrink-0 shadow-sm"
            />
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 font-heading truncate">
                  {studentName}
                </h2>
                <Badge variant="tier1" size="sm">
                  Tier-1 Fit
                </Badge>
                <Badge variant="info" size="sm">
                  {currentReadiness}% Ready
                </Badge>
              </div>

              <p className="text-xs text-slate-500 truncate">
                {studentEmail} • Sem {semester} (B.Tech CSE)
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5 flex-wrap">
                <span className="font-medium text-slate-800 truncate">
                  {targetCareer}
                </span>
              </div>
            </div>
          </div>

          {/* Middle: Session Details */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Mock Technical Screen: System Design & DSA</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-slate-600 flex-wrap">
                {currentInterview.meetLink ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-[11px]">
                      Google Meet Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">No Video Room</span>
                  </div>
                )}
                <span>•</span>
                <span>{currentInterview.duration || 45}m Standard Rubric</span>
              </div>

              {currentInterview.meetLink ? (
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <a
                    href={currentInterview.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="success"
                      size="xs"
                      leftIcon={<Video className="w-3.5 h-3.5" />}
                      rightIcon={<ExternalLink className="w-3 h-3" />}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                    >
                      {currentInterview.meetLink.includes('meet.google.com') ? 'Join Google Meet' : 'Join Video Room'}
                    </Button>
                  </a>

                  {currentInterview.calendarHtmlLink && (
                    <a
                      href={currentInterview.calendarHtmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Add to Google Calendar"
                    >
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<Calendar className="w-3 h-3 text-slate-500" />}
                        className="text-xs"
                      >
                        Calendar
                      </Button>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(currentInterview.meetLink);
                      setMeetToast('Meet URL copied!');
                      setTimeout(() => setMeetToast(null), 3000);
                    }}
                    title="Copy meeting link"
                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingMeet(!isEditingMeet);
                      setCustomMeetInput(currentInterview.meetLink || '');
                    }}
                    title="Enter custom Google Meet link"
                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingMeet}
                    onClick={handleGenerateMeet}
                    title="Regenerate video room link"
                    className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMeet ? 'animate-spin text-blue-600' : ''}`} />
                  </button>

                  {meetToast && (
                    <span className="text-[11px] font-medium text-emerald-600 animate-fadeIn">
                      {meetToast}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-0.5">
                  <Button
                    variant="primary"
                    size="xs"
                    disabled={isGeneratingMeet}
                    onClick={handleGenerateMeet}
                    leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMeet ? 'animate-spin' : ''}`} />}
                    className="text-xs"
                  >
                    {isGeneratingMeet ? 'Generating Room...' : 'Generate Video Room'}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setIsEditingMeet(!isEditingMeet);
                      setCustomMeetInput('');
                    }}
                    leftIcon={<Edit3 className="w-3 h-3" />}
                    className="text-xs"
                  >
                    Paste Meet Link
                  </Button>
                </div>
              )}

              {/* Inline Custom Google Meet URL Editor */}
              {isEditingMeet && (
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2.5 mt-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Set Real Google Meet URL
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingMeet(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="https://meet.google.com/xxx-yyyy-zzz"
                      value={customMeetInput}
                      onChange={(e) => setCustomMeetInput(e.target.value)}
                      className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <Button
                      variant="primary"
                      size="xs"
                      disabled={isGeneratingMeet || !customMeetInput.trim()}
                      onClick={handleSaveCustomMeet}
                      className="text-xs shrink-0"
                    >
                      {isGeneratingMeet ? 'Saving...' : 'Save Link'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 flex-wrap gap-1">
                    <span>Need a new meeting room?</span>
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Create on meet.google.com/new</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {formatDate(currentInterview.dateTime || currentInterview.date)}{' '}
                {currentInterview.time ? `• ${currentInterview.time}` : ''}
              </span>
            </div>

            <div className="pt-1 flex items-center gap-1.5 flex-wrap">
              <span className="inline-block bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded">
                Candidate: {currentInterview.student?.name || 'Student'} ({currentInterview.student?.email || 'N/A'})
              </span>
              <span className="inline-block bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded border border-blue-100">
                Evaluator: {user?.name || 'Faculty Member'}
              </span>
            </div>
          </div>

          {/* Right: Live Session Timer */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 flex flex-col items-start lg:items-end justify-between space-y-3">
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl w-full justify-center lg:justify-end">
              <span
                className={`w-2.5 h-2.5 rounded-full bg-emerald-500 ${
                  isTimerRunning ? 'animate-ping' : ''
                }`}
              />
              <span className="font-mono text-xl font-bold text-emerald-900 tracking-tight">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                {isTimerRunning ? 'Active' : 'Paused'}
              </span>
            </div>

            {!isReadOnly && (
              <div className="flex items-center gap-2 w-full justify-end">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Resume</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setTimerSeconds(0)}
                  className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-xs flex items-center gap-1 transition"
                  title="Reset session timer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= 3. TWO-COLUMN EVALUATION WORKSPACE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: EVALUATION FORM (8 COLS) ================= */}
        <section className="lg:col-span-8 space-y-6">
          {/* Standardized Rubric Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Standardized Institutional Evaluation Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Certified scoring rubric contributing directly to placement readiness
                </p>
              </div>
            </div>
            <Badge variant="info" size="sm">
              Model Rubric (0–10 Scale)
            </Badge>
          </div>

          {/* CRITERION 1: TECHNICAL SCORE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-card space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    Domain 01
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Backend Model: <code className="text-slate-700 font-mono">technicalScore</code>
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 font-heading mt-1">
                  Technical Knowledge & Problem Solving
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluation of core algorithms, architecture modularity, data structures, and code design rationale.
                </p>
              </div>

              {/* Score Display */}
              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-1 justify-end font-mono">
                  <span className="text-2xl font-black text-blue-700">
                    {technicalScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 10</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {technicalScore >= 8 ? 'Strong' : technicalScore >= 6 ? 'Competent' : 'Needs Polish'}
                </span>
              </div>
            </div>

            {/* Interactive 1 to 10 Scoring Buttons */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>0-3 Developing</span>
                <span>4-6 Competent</span>
                <span>7-8 Proficient</span>
                <span className="text-blue-700 font-bold">9-10 Benchmark</span>
              </div>

              <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const isSelected = technicalScore === score;
                  return (
                    <button
                      key={`tech-${score}`}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => setTechnicalScore(score)}
                      className={`
                        py-2 rounded-lg text-xs font-bold transition text-center
                        ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                            : isReadOnly
                            ? 'bg-white border border-slate-200 text-slate-400 opacity-60'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50/80 hover:border-blue-300'
                        }
                      `}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evaluator Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Technical Observations & Notes:
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={technicalNotes}
                onChange={(e) => setTechnicalNotes(e.target.value)}
                placeholder="E.g., Clear explanation of caching layers and microservice boundaries. Demonstrated clean API contracts."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* CRITERION 2: COMMUNICATION SCORE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-card space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                    Domain 02
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Backend Model: <code className="text-slate-700 font-mono">communicationScore</code>
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 font-heading mt-1">
                  Communication & STAR Articulation
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ability to explain complex trade-offs, structure answers using the STAR method, and articulate thought processes clearly.
                </p>
              </div>

              {/* Score Display */}
              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-1 justify-end font-mono">
                  <span className="text-2xl font-black text-purple-700">
                    {communicationScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 10</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {communicationScore >= 8 ? 'Top Tier' : communicationScore >= 6 ? 'On Track' : 'Needs Practice'}
                </span>
              </div>
            </div>

            {/* Interactive 1 to 10 Scoring Buttons */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>0-3 Unstructured</span>
                <span>4-6 Basic</span>
                <span>7-8 Clear</span>
                <span className="text-purple-700 font-bold">9-10 Articulate</span>
              </div>

              <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const isSelected = communicationScore === score;
                  return (
                    <button
                      key={`comm-${score}`}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => setCommunicationScore(score)}
                      className={`
                        py-2 rounded-lg text-xs font-bold transition text-center
                        ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30'
                            : isReadOnly
                            ? 'bg-white border border-slate-200 text-slate-400 opacity-60'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-purple-50/80 hover:border-purple-300'
                        }
                      `}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evaluator Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Communication Observations:
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={communicationNotes}
                onChange={(e) => setCommunicationNotes(e.target.value)}
                placeholder="E.g., Well-structured responses; answered questions directly and asked insightful clarifying requirements."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
              />
            </div>
          </div>

          {/* CRITERION 3: CONFIDENCE SCORE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-card space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                    Domain 03
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Backend Model: <code className="text-slate-700 font-mono">confidenceScore</code>
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 font-heading mt-1">
                  Confidence & Professional Presence
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Poise under pressure, handling edge-case critique, listening attentively, and professional demeanor.
                </p>
              </div>

              {/* Score Display */}
              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-1 justify-end font-mono">
                  <span className="text-2xl font-black text-amber-700">
                    {confidenceScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 10</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {confidenceScore >= 8 ? 'Poised' : confidenceScore >= 6 ? 'Steady' : 'Nervous'}
                </span>
              </div>
            </div>

            {/* Interactive 1 to 10 Scoring Buttons */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>0-3 Hesitant</span>
                <span>4-6 Steady</span>
                <span>7-8 Confident</span>
                <span className="text-amber-800 font-bold">9-10 Resilient</span>
              </div>

              <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const isSelected = confidenceScore === score;
                  return (
                    <button
                      key={`conf-${score}`}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => setConfidenceScore(score)}
                      className={`
                        py-2 rounded-lg text-xs font-bold transition text-center
                        ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30'
                            : isReadOnly
                            ? 'bg-white border border-slate-200 text-slate-400 opacity-60'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50/80 hover:border-amber-300'
                        }
                      `}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evaluator Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Confidence Observations:
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={confidenceNotes}
                onChange={(e) => setConfidenceNotes(e.target.value)}
                placeholder="E.g., Demonstrated high composure when confronted with network failure edge cases. Receptively accepted feedback."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
              />
            </div>
          </div>

          {/* FACULTY SYNTHESIS & WRITTEN FEEDBACK */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Comprehensive Faculty Synthesis & Recommendation
              </h4>
              <p className="text-xs text-slate-500">
                Overall qualitative assessment for student feedback and department placement records
              </p>
            </div>

            <textarea
              rows={3}
              disabled={isReadOnly}
              value={overallSynthesis}
              onChange={(e) => setOverallSynthesis(e.target.value)}
              placeholder="Candidate shows top-tier aptitude in backend distributed systems. Recommended to complete one practice sprint on Raft consensus partition recovery before Day-1 drives."
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition leading-relaxed"
            />
          </div>
        </section>

        {/* ================= RIGHT RAIL: SCORE TELEMETRY & SUBMISSION (4 COLS) ================= */}
        <section className="lg:col-span-4 space-y-6">
          {/* A. CUMULATIVE SCORE SUMMARY CARD */}
          <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 shadow-card space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Cumulative Rubric Score
              </span>
              <Badge variant={scoreGrade.variant} size="sm">
                {scoreGrade.label}
              </Badge>
            </div>

            {/* Big Score Display */}
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-4xl sm:text-5xl font-black text-blue-700 tracking-tight">
                {averageScore}
              </span>
              <span className="text-base font-bold text-slate-400">/ 10.0</span>
            </div>

            <p className="text-xs text-slate-500">
              Average across 3 backend evaluation parameters
            </p>

            {/* Criteria Breakdown Mini Bars */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Technical Knowledge</span>
                  <span className="font-mono font-bold text-blue-700">{technicalScore}/10</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(technicalScore / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Communication</span>
                  <span className="font-mono font-bold text-purple-700">{communicationScore}/10</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(communicationScore / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Confidence & Demeanor</span>
                  <span className="font-mono font-bold text-amber-700">{confidenceScore}/10</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(confidenceScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Projected Placement Readiness Impact */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Placement Readiness Impact</span>
                <span className="font-bold text-emerald-700">
                  {projectedReadiness >= currentReadiness ? `+${(projectedReadiness - currentReadiness).toFixed(1)}%` : `${(projectedReadiness - currentReadiness).toFixed(1)}%`}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs font-mono font-bold">
                <span className="text-slate-500">Current: {currentReadiness}%</span>
                <span className="text-blue-700 text-sm">Projected: {projectedReadiness}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${projectedReadiness}%` }}
                />
              </div>
            </div>
          </div>

          {/* B. DIGITAL FACULTY ATTESTATION & DISPATCH */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Digital Faculty Attestation</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Evaluator:</span>
                <span className="font-bold text-slate-800">{user?.name || 'Prof. Neha Sharma'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-medium text-slate-800">{studentName}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-400">
                <span>Certification Code:</span>
                <span className="font-mono">#EVAL-{currentInterview.id?.slice(-6).toUpperCase()}</span>
              </div>
            </div>

            {/* Certification Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isReadOnly}
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-4 h-4"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I certify that this mock evaluation was conducted under standardized university placement rubrics and accredited criteria.
              </span>
            </label>

            {/* Submit Action Button */}
            {!isReadOnly ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSubmitEvaluation}
                isLoading={isSubmitting}
                loadingText="Dispatching..."
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="py-3 text-xs font-semibold shadow-md shadow-blue-500/15"
              >
                Finalize & Submit Evaluation
              </Button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Evaluation Officially Submitted
                </span>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Scores recorded in the database.
                </p>
              </div>
            )}

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Submissions automatically mark this interview as Completed and recalculate placement readiness.
            </p>
          </div>

          {/* C. STUDENT PREVIOUS EVALUATIONS TRANSCRIPT */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 font-heading">
                  Student Evaluation History
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {pastInterviews.length} Past Recorded
              </span>
            </div>

            {pastInterviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                No prior interview records found for this student.
              </p>
            ) : (
              <div className="space-y-2.5">
                {pastInterviews.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.interviewId || idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {item.interviewerName || 'Faculty Evaluator'}
                      </span>
                      {item.scores?.average !== null && item.scores?.average !== undefined ? (
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {item.scores.average} / 10
                        </span>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          {item.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{formatDate(item.dateTime)}</span>
                      {item.scores?.technical !== null && (
                        <span>Tech: {item.scores.technical}/10</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default InterviewEvaluationPage;

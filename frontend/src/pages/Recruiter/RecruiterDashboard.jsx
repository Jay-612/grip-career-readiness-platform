import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Edit3,
  Send,
  RefreshCw,
  FileText,
  FileCheck,
  Search,
  X,
  Check,
  ShieldCheck,
  Target,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import ErrorBoundary from '../../components/common/ErrorBoundary';

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

export const RecruiterDashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // State management
  const [profileData, setProfileData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit Company Profile Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    companyName: '',
    designation: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Student Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackStudent, setFeedbackStudent] = useState(null);
  const [customStudentId, setCustomStudentId] = useState('');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  // Match Inspection State
  const [inspectedMatch, setInspectedMatch] = useState(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  // Load recruiter profile, scheduled appointments, and campus events
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, appointmentsRes, eventsRes] = await Promise.allSettled([
        recruiterService.getProfile(),
        recruiterService.getAppointments(),
        recruiterService.getEvents(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfileData(profileRes.value);
        const p = profileRes.value.profile || {};
        const u = profileRes.value.user || {};
        setProfileForm({
          name: u.name || user?.name || '',
          companyName: p.companyName || '',
          designation: p.designation || '',
        });
      }

      if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value) {
        const apts = Array.isArray(appointmentsRes.value)
          ? appointmentsRes.value
          : appointmentsRes.value.appointments || [];
        setAppointments(apts);
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value) {
        const evts = Array.isArray(eventsRes.value)
          ? eventsRes.value
          : eventsRes.value.events || [];
        setEvents(evts);
      }
    } catch (err) {
      console.error('Failed to load recruiter dashboard:', err);
      setError(
        err?.response?.data?.message || 'Unable to connect to recruiter portal services.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Derived profile status
  const recruiterProfile = profileData?.profile || {};
  const companyName = recruiterProfile.companyName || '';
  const designation = recruiterProfile.designation || '';
  const isProfileComplete = Boolean(companyName && designation);

  // Candidate appointments
  const candidateAppointments = useMemo(() => {
    return (Array.isArray(appointments) ? appointments : []).filter((apt) => apt && apt.student);
  }, [appointments]);

  // Save Recruiter & Company Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.companyName.trim()) {
      setProfileError('Company name is required.');
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const payload = {
        name: profileForm.name.trim(),
        companyName: profileForm.companyName.trim(),
        designation: profileForm.designation.trim(),
      };

      await recruiterService.updateProfile(payload);

      if (updateUser && payload.name) {
        updateUser({ name: payload.name });
      }

      setProfileData((prev) => ({
        ...prev,
        user: { ...prev?.user, name: payload.name },
        profile: { ...prev?.profile, ...payload },
      }));

      setToastMessage('Company & Recruiter profile updated successfully.');
      setProfileModalOpen(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save recruiter profile:', err);
      setProfileError(
        err?.response?.data?.message || 'Failed to update profile. Please verify your inputs.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open feedback modal for a candidate
  const openFeedbackModal = (studentObj = null) => {
    setFeedbackStudent(studentObj);
    setCustomStudentId(studentObj?.id || studentObj?._id || '');
    setFeedbackComments('');
    setFeedbackError(null);
    setFeedbackModalOpen(true);
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    const targetStudentId = feedbackStudent?.id || feedbackStudent?._id || customStudentId.trim();
    if (!targetStudentId) {
      setFeedbackError('Please specify a valid student candidate ID.');
      return;
    }
    if (!feedbackComments.trim()) {
      setFeedbackError('Feedback comments are required.');
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      await recruiterService.submitFeedback(targetStudentId, feedbackComments.trim());
      setToastMessage('Candidate evaluation feedback submitted successfully.');
      setFeedbackModalOpen(false);
      setFeedbackStudent(null);
      setFeedbackComments('');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setFeedbackError(
        err?.response?.data?.message || 'Failed to submit candidate feedback. Please check student ID.'
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Inspect Company Match for a Student
  const handleInspectMatch = async (studentId) => {
    if (!studentId) return;
    setIsLoadingMatch(true);
    setInspectedMatch(null);
    setMatchModalOpen(true);
    try {
      const res = await recruiterService.getCompanyMatch(studentId);
      setInspectedMatch(res);
    } catch (err) {
      console.error('Failed to inspect company match:', err);
      setInspectedMatch({ error: err?.response?.data?.message || 'Match details unavailable.' });
    } finally {
      setIsLoadingMatch(false);
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
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-2xl mx-auto">
        <ErrorState
          title="Recruiter Dashboard Error"
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
      {/* 1. RECRUITER HEADER                                                       */}
      {/* ========================================================================= */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-[#0d223c] to-[#08182b] text-white p-6 md:p-8 card-shadow relative overflow-hidden">
        {/* Ambient Icon Watermark */}
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Building2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs backdrop-blur-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Campus Recruiter Hiring Hub • Talent Discovery &amp; Evaluation</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 flex-wrap">
                <span>{companyName || 'Corporate Partner'}</span>
                {isProfileComplete ? (
                  <Badge variant="success" size="sm">
                    Verified Partner
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Setup Pending
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Welcome back, {user?.name || 'Recruiter'}{' '}
                {designation && <span className="text-blue-300">• {designation}</span>}.
                Manage your campus hiring presence, review student candidate readiness, and submit interview feedback.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/recruiter/company')}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="border-white/20 text-white hover:bg-white/10 shrink-0 self-start md:self-auto text-xs"
            >
              {isProfileComplete ? 'Edit Company Profile' : 'Complete Setup'}
            </Button>
          </div>

          {/* Quick status bar */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/15 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Company:</span>
              <strong className="text-white font-semibold">
                {companyName || 'Not configured'}
              </strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Candidates in Queue:</span>
              <strong className="text-white font-mono text-sm">
                {candidateAppointments.length}
              </strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Campus Events:</span>
              <strong className="text-white font-mono text-sm">{events.length}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. COMPACT SUMMARY METRICS                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: Company Profile Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Company Profile
            </span>
            <span className="text-lg font-extrabold text-slate-900 block truncate max-w-[180px]">
              {companyName || 'Incomplete'}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {isProfileComplete ? 'Configured & Active' : 'Action Required'}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isProfileComplete
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}
          >
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Candidates in Review */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Candidates in Review
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono block">
              {candidateAppointments.length}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Scheduled mock screens
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Placement Network Drives */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Campus Drives
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono block">
              {events.length}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Institutional hiring events
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD GRID (8 Cols / 4 Cols)                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols): Needs Attention + Candidates Overview */}
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
                    High-priority actions required for your campus recruitment pipeline.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Item 1: Incomplete Company Profile */}
              {!isProfileComplete && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-900">
                        Company Profile Incomplete
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-bold">
                        Required
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Configure your company name and designation to enable student skill matching and official campus verification.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/recruiter/company')}
                    className="shrink-0 self-start sm:self-center text-xs"
                  >
                    Complete Profile
                  </Button>
                </div>
              )}

              {/* Item 2: Submit Candidate Feedback */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-900">
                      Submit Candidate Review Feedback
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Hiring Feedback
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Provide structured technical feedback for student candidates to influence institutional placement readiness scores.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/recruiter/feedback')}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  className="shrink-0 self-start sm:self-center text-xs bg-white"
                >
                  Write Feedback
                </Button>
              </div>

              {/* Item 3: Verified Status if complete */}
              {isProfileComplete && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Hiring Partner Profile Active
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {companyName} is registered and verified on the campus network.
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="xs">
                    Active
                  </Badge>
                </div>
              )}
            </div>
          </section>

          {/* ===================================================================== */}
          {/* SECTION: CANDIDATE & STUDENT OVERVIEW                                  */}
          {/* ===================================================================== */}
          <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-600 text-white">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Candidate &amp; Interview Roster
                  </h2>
                  <p className="text-xs text-slate-500">
                    Students scheduled for mock interviews and technical hiring evaluations.
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {candidateAppointments.length} candidate sessions
              </span>
            </div>

            {candidateAppointments.length === 0 ? (
              <EmptyState
                icon={<Users className="w-7 h-7 text-slate-400 stroke-[1.5]" />}
                title="No Candidate Interviews Scheduled"
                description="When students book campus mock screens or technical interview rounds with your company, they will appear here."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/recruiter/feedback')}
                    leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                  >
                    Submit Direct Candidate Review
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {candidateAppointments.map((apt) => {
                  const student = apt.student || {};
                  const studentInitial = String(student.name || 'S').charAt(0).toUpperCase();

                  return (
                    <div
                      key={apt.id || apt._id}
                      className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {studentInitial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {student.name || 'Student Candidate'}
                            </span>
                            <Badge
                              variant={apt.status === 'completed' ? 'success' : 'primary'}
                              size="xs"
                            >
                              {apt.status || 'Scheduled'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            {student.email || 'campus.student@university.edu'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleInspectMatch(student.id || student._id)}
                          leftIcon={<Target className="w-3 h-3 text-blue-600" />}
                        >
                          Check Match
                        </Button>
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => navigate(`/recruiter/feedback/${student.id || student._id}`)}
                          leftIcon={<Send className="w-3 h-3 text-slate-500" />}
                        >
                          Feedback
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (4 Cols): Company Profile Card + Campus Drives */}
        <div className="lg:col-span-4 space-y-6">
          {/* ===================================================================== */}
          {/* SECTION: COMPANY PROFILE SUMMARY                                      */}
          {/* ===================================================================== */}
          <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-600 text-white">
                  <Building2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Company Identity</h3>
                  <p className="text-[11px] text-slate-500">Corporate hiring profile</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/recruiter/company')}
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Manage</span>
                <Edit3 className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Organization:</span>
                  <span className="font-bold text-slate-900">
                    {companyName || 'Not Set'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Designation:</span>
                  <span className="font-bold text-slate-900">
                    {designation || 'Not Set'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Recruiter Contact:</span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    {user?.email || 'recruiter@company.com'}
                  </span>
                </div>
              </div>

              {!isProfileComplete ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate('/recruiter/company')}
                >
                  Complete Company Setup
                </Button>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] flex items-center gap-2 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">
                    Verified corporate partner on the campus placement board.
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* ===================================================================== */}
          {/* SECTION: CAMPUS EVENTS & DRIVES                                        */}
          {/* ===================================================================== */}
          <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-purple-600 text-white">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Campus Drives &amp; Events</h3>
                  <p className="text-[11px] text-slate-500">Scheduled institutional sessions</p>
                </div>
              </div>
              <span className="text-xs font-mono text-purple-700 font-bold">
                {events.length}
              </span>
            </div>

            {events.length === 0 ? (
              <EmptyState
                compact
                icon={<Calendar className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
                title="No Events Scheduled"
                description="Upcoming campus drives and workshops will appear here."
              />
            ) : (
              <div className="space-y-2.5">
                {events.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id || evt._id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {evt.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(evt.date)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {evt.description || 'Campus recruitment and readiness session.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ===================================================================== */}
          {/* SECTION: QUICK ACTIONS                                                */}
          {/* ===================================================================== */}
          <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recruiter Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<FileCheck className="w-4 h-4 text-blue-600" />}
                onClick={() => navigate('/recruiter/feedback')}
              >
                Submit Candidate Feedback
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<Building2 className="w-4 h-4 text-slate-600" />}
                onClick={() => navigate('/recruiter/company')}
              >
                Manage Company Profile
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<RefreshCw className="w-4 h-4 text-slate-500" />}
                onClick={loadDashboardData}
              >
                Refresh Dashboard
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT RECRUITER & COMPANY PROFILE                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => !isSavingProfile && setProfileModalOpen(false)}
        title="Manage Company & Recruiter Profile"
        description="Update your corporate details to represent your company on the campus placement board."
        size="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          {profileError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Recruiter Full Name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Company / Organization Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profileForm.companyName}
              onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
              placeholder="e.g. Google, TechCorp, Microsoft"
              className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Designation / Role Title</label>
            <input
              type="text"
              value={profileForm.designation}
              onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
              placeholder="e.g. Lead University Recruiter, Campus Talent Lead"
              className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: SUBMIT CANDIDATE FEEDBACK                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => !isSubmittingFeedback && setFeedbackModalOpen(false)}
        title="Submit Candidate Feedback"
        description="Provide structured evaluation feedback for a student candidate."
        size="md"
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-2">
          {feedbackError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{feedbackError}</span>
            </div>
          )}

          {feedbackStudent ? (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block">
                  {feedbackStudent.name}
                </span>
                <span className="text-[11px] text-blue-700 font-mono">
                  {feedbackStudent.email}
                </span>
              </div>
              <Badge variant="primary" size="xs">
                Candidate Selected
              </Badge>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Student Candidate ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customStudentId}
                onChange={(e) => setCustomStudentId(e.target.value)}
                placeholder="Paste student MongoDB ObjectId (e.g. 66a8...)"
                className="w-full bg-white text-slate-900 text-xs font-mono rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Evaluation Comments &amp; Recommendations <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={feedbackComments}
              onChange={(e) => setFeedbackComments(e.target.value)}
              placeholder="Outline technical strengths, coding round performance, system design gaps, and hiring recommendation..."
              className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:border-blue-600 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmittingFeedback}
              onClick={() => setFeedbackModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingFeedback}
              loadingText="Submitting..."
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: CANDIDATE COMPANY MATCH DETAILS                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        title="Candidate Company Skill Alignment"
        description="Calculated skill matches between the student candidate and institutional requirements."
        size="lg"
      >
        <div className="space-y-4 pt-2">
          {isLoadingMatch ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : inspectedMatch?.error ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              {inspectedMatch.error}
            </div>
          ) : inspectedMatch ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Candidate: {inspectedMatch.studentName}
                  </span>
                  <Badge variant="primary" size="xs">
                    {inspectedMatch.selectedCareer || 'Career Track'}
                  </Badge>
                </div>
                {inspectedMatch.studentSkills && (
                  <div className="pt-2 flex flex-wrap gap-1">
                    <span className="text-[11px] text-slate-400 mr-1">Skills:</span>
                    {inspectedMatch.studentSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Company Matching Results
                </span>
                {(inspectedMatch.matches || []).length === 0 ? (
                  <p className="text-xs text-slate-500">No company matches computed.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {inspectedMatch.matches.map((m) => (
                      <div
                        key={m.companyId}
                        className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {m.companyName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Min Score: {m.minimumMatchScore}% • Matched: {m.matchedSkills?.length || 0} skills
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 block">
                            {m.matchPercentage}%
                          </span>
                          <Badge variant={m.isEligible ? 'success' : 'warning'} size="xs">
                            {m.isEligible ? 'Eligible' : 'Under Review'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setMatchModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const SafeRecruiterDashboard = (props) => (
  <ErrorBoundary fallbackTitle="Recruiter Dashboard Encountered an Issue">
    <RecruiterDashboard {...props} />
  </ErrorBoundary>
);

export default SafeRecruiterDashboard;

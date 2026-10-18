import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Send,
  X,
  BookmarkCheck,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import RecruiterDashboardHeader from '../../components/recruiter/RecruiterDashboardHeader';
import ActiveDriveSummary from '../../components/recruiter/ActiveDriveSummary';
import CandidateFilters from '../../components/recruiter/CandidateFilters';
import CandidateList from '../../components/recruiter/CandidateList';
import CandidateDetailsDrawer from '../../components/recruiter/CandidateDetailsDrawer';
import ShortlistPanel from '../../components/recruiter/ShortlistPanel';
import FeedbackModal from '../../components/recruiter/FeedbackModal';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const SHORTLIST_STORAGE_KEY = 'grip_recruiter_shortlist';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Primary Data States
  const [profileData, setProfileData] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Shortlist State (persisted in localStorage)
  const [shortlistedIds, setShortlistedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);

  // Candidate Details Drawer
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Feedback Modal
  const [feedbackCandidate, setFeedbackCandidate] = useState(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Candidate Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedReadiness, setSelectedReadiness] = useState('all');
  const [selectedCareer, setSelectedCareer] = useState('all');

  // Load Dashboard Data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, appointmentsRes, eventsRes, leaderboardRes] = await Promise.allSettled([
        recruiterService.getProfile(),
        recruiterService.getAppointments(),
        recruiterService.getEvents(),
        recruiterService.getCandidatesLeaderboard(1, 50),
      ]);

      let compName = 'TechCorp';
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfileData(profileRes.value);
        compName = profileRes.value.profile?.companyName || 'TechCorp';
      }

      // Fetch company criteria by name
      try {
        const comp = await recruiterService.getCompanyByName(compName);
        if (comp) setCompanyDetails(comp);
      } catch (err) {
        console.warn('Could not fetch company benchmark criteria:', err);
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

      // Set candidate pool
      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value) {
        const list = Array.isArray(leaderboardRes.value) ? leaderboardRes.value : [];
        setCandidates(list);
      }
    } catch (err) {
      console.error('Failed to load recruiter dashboard:', err);
      setError(err?.response?.data?.message || 'Unable to connect to recruiter portal services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Persist shortlist changes
  const saveShortlist = (nextSet) => {
    setShortlistedIds(nextSet);
    try {
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(Array.from(nextSet)));
    } catch (e) {
      console.error('Failed to save shortlist:', e);
    }
  };

  const handleToggleShortlist = (cand) => {
    const sid = String(cand.studentId || cand.id || cand._id);
    const nextSet = new Set(shortlistedIds);
    if (nextSet.has(sid)) {
      nextSet.delete(sid);
      setToastMessage(`Removed ${cand.studentName || 'candidate'} from shortlist.`);
    } else {
      nextSet.add(sid);
      setToastMessage(`Added ${cand.studentName || 'candidate'} to shortlist pool.`);
    }
    saveShortlist(nextSet);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveShortlist = (sid) => {
    const nextSet = new Set(shortlistedIds);
    nextSet.delete(String(sid));
    saveShortlist(nextSet);
  };

  // Open Drawer
  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
  };

  // Open Feedback Modal (guarded to shortlisted candidates)
  const handleOpenFeedback = (cand) => {
    if (!cand) return;
    const sid = String(cand.studentId || cand.id || cand._id || '');
    if (!shortlistedIds.has(sid)) {
      setToastMessage('Candidate evaluation is only permitted for shortlisted candidates. Please add to shortlist first.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    setFeedbackCandidate(cand);
    setIsFeedbackOpen(true);
  };

  // Submit Feedback Handler
  const handleSubmitFeedback = async (studentId, comments, rating) => {
    setIsSubmittingFeedback(true);
    try {
      await recruiterService.submitFeedback(studentId, comments, rating);
      setToastMessage('Candidate evaluation feedback recorded successfully!');
      setIsFeedbackOpen(false);
      setFeedbackCandidate(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to submit candidate feedback:', err);
      throw new Error(err?.response?.data?.message || 'Could not record candidate feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Filter Options & Derived Candidates
  const recruiterProfile = profileData?.profile || {};
  const companyName = recruiterProfile.companyName || companyDetails?.companyName || 'TechCorp';
  const designation = recruiterProfile.designation || 'Lead University Talent Partner';
  const recruiterName = profileData?.user?.name || user?.name || 'Recruiter';
  const minScore = companyDetails?.minimumMatchScore || 70;
  const reqSkills = companyDetails?.requiredSkills || ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'System Design'];
  const activeRole = companyDetails?.targetRole || 'Distributed Systems & Cloud Platform Engineer';
  const eligibleDepts = companyDetails?.eligibleDepartments && companyDetails.eligibleDepartments.length > 0
    ? companyDetails.eligibleDepartments
    : ['Computer Science & Engineering', 'Information Technology'];
  const cgpaCriteria = companyDetails?.cgpaCutoff ? `${companyDetails.cgpaCutoff}+ CGPA` : '7.5+ CGPA';

  const careerOptions = useMemo(() => {
    const set = new Set();
    candidates.forEach((c) => {
      if (c.selectedCareer) set.add(c.selectedCareer);
    });
    return Array.from(set);
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = c.studentName && c.studentName.toLowerCase().includes(q);
        const emailMatch = c.email && c.email.toLowerCase().includes(q);
        const careerMatch = c.selectedCareer && c.selectedCareer.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !careerMatch) return false;
      }

      // Department filter
      if (selectedDepartment !== 'all') {
        const dept = c.department || 'Computer Science & Engineering';
        if (dept !== selectedDepartment) return false;
      }

      // Semester filter
      if (selectedSemester !== 'all') {
        if (String(c.semester) !== selectedSemester) return false;
      }

      // Readiness filter
      if (selectedReadiness !== 'all') {
        const r = Number(c.readinessScore) || 0;
        if (selectedReadiness === '75' && r < 75) return false;
        if (selectedReadiness === '50' && (r < 50 || r >= 75)) return false;
        if (selectedReadiness === 'below50' && r >= 50) return false;
      }

      // Career track filter
      if (selectedCareer !== 'all') {
        if (c.selectedCareer !== selectedCareer) return false;
      }

      return true;
    });
  }, [candidates, searchQuery, selectedDepartment, selectedSemester, selectedReadiness, selectedCareer]);

  const shortlistedList = useMemo(() => {
    return candidates.filter((c) =>
      shortlistedIds.has(String(c.studentId || c.id || c._id))
    );
  }, [candidates, shortlistedIds]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('all');
    setSelectedSemester('all');
    setSelectedReadiness('all');
    setSelectedCareer('all');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-4">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-xl mx-auto">
        <ErrorState
          title="Recruiter Dashboard Unavailable"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
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

      {/* 1. Header */}
      <RecruiterDashboardHeader
        companyName={companyName}
        designation={designation}
        recruiterName={recruiterName}
        activeRole={activeRole}
        isVerified={Boolean(companyName)}
        shortlistCount={shortlistedIds.size}
        onOpenShortlist={() => setIsShortlistOpen(true)}
      />

      {/* 2. Active Drive / Hiring Summary */}
      <ActiveDriveSummary
        role={activeRole}
        departments={eligibleDepts}
        cgpaCriteria={cgpaCriteria}
        minimumMatchScore={minScore}
        requiredSkills={reqSkills}
        applicationCount={candidates.length}
      />

      {/* 3. Candidate Search & Filters */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Candidate Search &amp; Discovery</h2>
            <p className="text-xs text-slate-500">
              Filter eligible students by verified department, semester, and readiness scores.
            </p>
          </div>
        </div>

        <CandidateFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
          selectedReadiness={selectedReadiness}
          onReadinessChange={setSelectedReadiness}
          selectedCareer={selectedCareer}
          onCareerChange={setSelectedCareer}
          careerOptions={careerOptions}
          totalCount={candidates.length}
          filteredCount={filteredCandidates.length}
          onResetFilters={resetFilters}
        />

        {/* 4. Candidate Results */}
        <CandidateList
          candidates={filteredCandidates}
          shortlistedIds={shortlistedIds}
          onToggleShortlist={handleToggleShortlist}
          onViewProfile={handleViewProfile}
        />
      </section>

      {/* 5. Compact Hiring Metrics & Quick Links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Shortlisted Pool
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 block">
              {shortlistedIds.size}
            </span>
            <span className="text-[11px] text-slate-500 block">Candidates flagged for interview</span>
          </div>
          <button
            onClick={() => setIsShortlistOpen(true)}
            className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            <BookmarkCheck className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Candidate Sessions
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 block">
              {appointments.length}
            </span>
            <span className="text-[11px] text-slate-500 block">Mock screens scheduled</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Campus Drives
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 block">
              {events.length}
            </span>
            <span className="text-[11px] text-slate-500 block">Active recruitment events</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 6. Quick Links */}
      <section className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-600 font-medium">
          Need to configure company criteria or submit post-drive evaluations?
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/company"
            className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            <span>Company Profile &amp; Benchmarks →</span>
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/recruiter/feedback"
            className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            <span>Submit Candidate Feedback →</span>
          </Link>
        </div>
      </section>

      {/* Modals & Drawers */}
      <CandidateDetailsDrawer
        candidate={selectedCandidate}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCandidate(null);
        }}
        isShortlisted={selectedCandidate ? shortlistedIds.has(String(selectedCandidate.studentId || selectedCandidate.id || selectedCandidate._id)) : false}
        onToggleShortlist={handleToggleShortlist}
        onOpenFeedback={handleOpenFeedback}
      />

      <ShortlistPanel
        isOpen={isShortlistOpen}
        onClose={() => setIsShortlistOpen(false)}
        shortlistedCandidates={shortlistedList}
        onRemove={handleRemoveShortlist}
        onViewProfile={handleViewProfile}
        onOpenFeedback={handleOpenFeedback}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => {
          setIsFeedbackOpen(false);
          setFeedbackCandidate(null);
        }}
        candidate={feedbackCandidate}
        candidatesList={shortlistedList}
        onSubmit={handleSubmitFeedback}
        isSubmitting={isSubmittingFeedback}
      />
    </div>
  );
};

export default RecruiterDashboard;

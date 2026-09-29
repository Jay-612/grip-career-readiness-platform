import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Award,
  BookOpen,
  Code,
  Globe,
  CheckCircle2,
  Clock,
  Plus,
  Edit3,
  FileText,
  ExternalLink,
  ShieldCheck,
  Check,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  Cloud,
  Database,
  Cpu,
  X,
  AlertCircle,
  Target,
  RefreshCw,
  FolderX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';

// Available Department Roadmaps for quick selection
const CAREER_TRACK_OPTIONS = [
  'Distributed Systems & Cloud Backend Engineer',
  'Full-Stack Product Engineering',
  'DevOps & Site Reliability Engineer',
];

export const ProfileSkillsPage = () => {
  const { user, updateUser } = useAuth();

  // Primary Data States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);

  const [profileData, setProfileData] = useState({
    user: null,
    profile: null,
    readiness: null,
    skills: [],
    roadmap: null,
    dashboard: null,
  });

  // Category filter state for Skills Matrix
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal & Form States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    semester: 1,
    selectedCareer: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // ─────────────────────────────────────────────────────────────
  // 1. DATA FETCHING (Authenticated Student)
  // ─────────────────────────────────────────────────────────────
  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch authenticated user profile
      const profileRes = await studentService.getProfile();
      const currentUser = profileRes?.user || user;
      const currentProfile = profileRes?.profile || null;
      const resolvedStudentId = currentUser?.id || user?.id;

      if (!resolvedStudentId) {
        throw new Error('Authenticated student identifier could not be verified.');
      }

      const selectedCareer = currentProfile?.selectedCareer || '';

      // 2. Fetch parallel data from live endpoints
      const [readinessRes, companyMatchRes, roadmapRes, dashboardRes] = await Promise.allSettled([
        studentService.getPlacementReadiness(resolvedStudentId),
        selectedCareer ? studentService.getCompanyMatch(resolvedStudentId) : Promise.resolve(null),
        selectedCareer ? studentService.getCareerRoadmap(selectedCareer) : Promise.resolve(null),
        studentService.getProgressDashboard(resolvedStudentId),
      ]);

      const readiness = readinessRes.status === 'fulfilled' ? readinessRes.value : null;
      const companyMatch = companyMatchRes.status === 'fulfilled' ? companyMatchRes.value : null;
      const roadmap = roadmapRes.status === 'fulfilled' ? roadmapRes.value : null;
      const dashboard = dashboardRes.status === 'fulfilled' ? dashboardRes.value : null;

      // Extract skills list mapped from student's career roadmap
      const skills = companyMatch?.studentSkills || [];

      setProfileData({
        user: currentUser,
        profile: currentProfile,
        readiness,
        skills,
        roadmap,
        dashboard,
      });

      // Synchronize edit form with real data
      setEditFormData({
        name: currentUser?.name || '',
        semester: currentProfile?.semester || 1,
        selectedCareer: selectedCareer,
      });
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load student profile. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  // Derived student attributes
  const displayName = profileData.user?.name || user?.name || 'Student';
  const displayEmail = profileData.user?.email || user?.email || '';
  const displayCareer = profileData.profile?.selectedCareer || '';
  const displaySemester = profileData.profile?.semester || 1;
  const readinessScore = profileData.readiness?.readinessScore ?? profileData.profile?.readinessScore ?? 0;
  const targetTier = profileData.readiness?.targetTier || (readinessScore >= 80 ? 'Tier 1' : readinessScore >= 60 ? 'Tier 2' : 'General');

  // Diagnostic Weak Skills set (from real ActionPlan model)
  const weakSkillsMap = useMemo(() => {
    const map = new Map();
    if (profileData.dashboard?.actionPlans?.items) {
      profileData.dashboard.actionPlans.items.forEach((ap) => {
        if (ap.weakSkill) {
          map.set(ap.weakSkill.toLowerCase().trim(), ap.recommendedTask);
        }
      });
    }
    return map;
  }, [profileData.dashboard]);

  // Dynamic Skill Categorizer
  const categorizeSkill = (skillName) => {
    const s = skillName.toLowerCase();
    if (s.includes('react') || s.includes('vue') || s.includes('front') || s.includes('ui') || s.includes('graphql') || s.includes('rest')) {
      return 'Frameworks & Web';
    }
    if (s.includes('docker') || s.includes('kubernetes') || s.includes('aws') || s.includes('cloud') || s.includes('terraform') || s.includes('ci/cd') || s.includes('linux')) {
      return 'DevOps & Cloud';
    }
    if (s.includes('sql') || s.includes('postgres') || s.includes('mongo') || s.includes('redis') || s.includes('database')) {
      return 'Database & Storage';
    }
    if (s.includes('kafka') || s.includes('microservices') || s.includes('system design') || s.includes('grpc') || s.includes('distributed')) {
      return 'Core CS & Systems';
    }
    return 'Languages & Runtimes';
  };

  // Filter skills by selected tab
  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') return profileData.skills;
    return profileData.skills.filter((sk) => categorizeSkill(sk) === selectedCategory);
  }, [profileData.skills, selectedCategory]);

  // Avatar Initials
  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Real Profile Completeness Formula
  const completenessPercentage = useMemo(() => {
    let score = 0;
    if (profileData.user?.name) score += 25;
    if (profileData.user?.email) score += 25;
    if (profileData.profile?.semester) score += 25;
    if (profileData.profile?.selectedCareer) score += 25;
    return score;
  }, [profileData.user, profileData.profile]);

  // ─────────────────────────────────────────────────────────────
  // 2. PROFILE UPDATE SUBMISSION (PUT /api/users/profile)
  // ─────────────────────────────────────────────────────────────
  const validateEditForm = () => {
    const errs = {};
    if (!editFormData.name.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!editFormData.selectedCareer.trim()) {
      errs.selectedCareer = 'Career track is required.';
    }
    if (!editFormData.semester || editFormData.semester < 1 || editFormData.semester > 8) {
      errs.semester = 'Semester must be between 1 and 8.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setIsSubmitting(true);
    setSaveSuccessMessage(null);

    try {
      const payload = {
        name: editFormData.name.trim(),
        semester: Number(editFormData.semester),
        selectedCareer: editFormData.selectedCareer.trim(),
      };

      const res = await studentService.updateProfile(payload);
      if (res.success) {
        if (res.user && updateUser) {
          updateUser(res.user);
        }
        setSaveSuccessMessage('Profile and academic trajectory updated successfully!');
        setIsEditModalOpen(false);
        // Refresh all profile data and newly mapped career skills
        await fetchProfileData();
        setTimeout(() => setSaveSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Failed to update profile details.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. LOADING & ERROR STATES
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 antialiased">
        <Skeleton variant="card" className="h-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error && !profileData.user) {
    return (
      <ErrorState
        title="Unable to Load Profile & Skills"
        message={error}
        onRetry={fetchProfileData}
        retryText="Retry Loading Profile"
      />
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. MAIN INTERFACE
  // ─────────────────────────────────────────────────────────────
  const interviewScores = profileData.dashboard?.interviews?.averageScores;
  const totalInterviews = profileData.dashboard?.interviews?.totalInterviews || 0;

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Toast Notification */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          HERO: AUTHENTICATED STUDENT IDENTITY & READINESS
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
          {/* Student Identity Block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md select-none font-mono">
                {getInitials(displayName)}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {displayName}
                </h1>
                <Badge variant={readinessScore >= 80 ? 'tier1' : readinessScore >= 60 ? 'tier2' : 'neutral'} size="sm">
                  {targetTier} Candidate
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Semester {displaySemester} of 8 •{' '}
                {displayCareer ? (
                  <span className="text-blue-700 font-semibold">{displayCareer}</span>
                ) : (
                  <span className="text-amber-600 font-medium italic">No Career Track Selected</span>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-[11px] text-slate-700">{displayEmail}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Platform Readiness:</span>
                  <strong className="text-slate-900 font-mono font-bold">{readinessScore}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Profile Completeness Meter & CTAs */}
          <div className="flex flex-col gap-3 min-w-[280px] lg:w-80">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-800">
                  Profile Completeness
                </span>
                <span className="text-xs font-extrabold text-blue-700 font-mono">
                  {completenessPercentage}%
                </span>
              </div>

              <ProgressBar
                value={completenessPercentage}
                max={100}
                variant={completenessPercentage === 100 ? 'success' : 'primary'}
                size="sm"
              />

              <div className="mt-2.5 text-[11px] text-slate-500">
                {completenessPercentage === 100 ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All profile criteria synchronized with placement cell.
                  </span>
                ) : (
                  <span className="text-amber-700">
                    Complete your semester and career track to optimize placement matching.
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                className="flex-1 shadow-2xs"
              >
                Edit Profile
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchProfileData}
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
                title="Refresh live profile data"
              >
                Sync
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          ACADEMIC TRAJECTORY & PLACEMENT READINESS BENCHMARK
      ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Placement Readiness Breakdown (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Placement Readiness Formula
                </h2>
              </div>
              <Badge variant="neutral" size="sm">
                Semester {displaySemester}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Readiness is objectively derived using the platform's multi-factor placement weighting algorithm:
            </p>

            <div className="space-y-3">
              {/* Factor 1: Goal Execution (30%) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">Weekly Goal Execution</span>
                  <span className="font-mono text-slate-600 text-[11px]">Weight: 30%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {profileData.dashboard?.goals?.completedGoals || 0} of{' '}
                    {profileData.dashboard?.goals?.totalGoals || 0} completed
                  </span>
                  <span className="font-bold text-blue-700 font-mono">
                    {profileData.dashboard?.goals?.completionRate || 0}%
                  </span>
                </div>
              </div>

              {/* Factor 2: Mock Interview Scores (40%) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">Faculty Mock Evaluations</span>
                  <span className="font-mono text-slate-600 text-[11px]">Weight: 40%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {totalInterviews} session{totalInterviews === 1 ? '' : 's'} recorded
                  </span>
                  <span className="font-bold text-blue-700 font-mono">
                    {interviewScores?.overallAverage ? `${(interviewScores.overallAverage * 10).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>

              {/* Factor 3: Recruiter & Placement Feedback (30%) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">Placement Cell Feedback</span>
                  <span className="font-mono text-slate-600 text-[11px]">Weight: 30%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Direct Recruiter Endorsements</span>
                  <span className="font-bold text-blue-700 font-mono">
                    {profileData.readiness?.rubricBreakdown?.feedbackScore !== undefined
                      ? `${profileData.readiness.rubricBreakdown.feedbackScore}%`
                      : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Combined Readiness Score</span>
            <span className="text-2xl font-black text-blue-700 font-mono">{readinessScore}%</span>
          </div>
        </div>

        {/* Curriculum & Semester Roadmap (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Curriculum &amp; Semester Roadmap
                </h2>
              </div>
              <Link
                to="/student/career-compass"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Career Compass</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {profileData.roadmap?.steps && profileData.roadmap.steps.length > 0 ? (
              <div className="space-y-2.5">
                <div className="text-xs text-slate-600 mb-2 font-medium">
                  {profileData.roadmap.career}: Semester-by-Semester Milestones
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {profileData.roadmap.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-start gap-2.5 text-xs"
                    >
                      <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px] font-mono mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-semibold text-slate-800 leading-snug">
                          {step}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Accredited Curriculum Requirement
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<FolderX className="w-6 h-6 text-slate-400" />}
                title="No Curriculum Roadmap Loaded"
                description={
                  displayCareer
                    ? `No formal semester plan found for track: ${displayCareer}.`
                    : 'Select a career track in your profile to view your semester milestone curriculum.'
                }
                action={
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Configure Career Track
                  </Button>
                }
                compact
              />
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Aligned with Institutional Board of Studies</span>
            <span className="text-blue-600 font-medium">Semester {displaySemester} Active</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TECHNICAL SKILLS & COMPETENCY MATRIX
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card flex flex-col gap-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Technical Skills &amp; Competency Matrix
              </h2>
              <Badge variant="primary" size="sm">
                {profileData.skills.length} Required Skills
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live technical competencies mapped from your chosen target career track ({displayCareer || 'Unassigned'}).
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Change Career Track
          </Button>
        </div>

        {/* Filter Tabs */}
        {profileData.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'All', label: `All Skills (${profileData.skills.length})` },
              { id: 'Languages & Runtimes', label: 'Languages' },
              { id: 'Frameworks & Web', label: 'Frameworks' },
              { id: 'DevOps & Cloud', label: 'DevOps & Cloud' },
              { id: 'Database & Storage', label: 'Databases' },
              { id: 'Core CS & Systems', label: 'Systems & Architecture' },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Skills Grid */}
        {profileData.skills.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
            title="No Skills Mapped Yet"
            description="Select your target career track to automatically map curriculum skill benchmarks and recruiter evaluation rubrics."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Select Target Career Track
              </Button>
            }
          />
        ) : filteredSkills.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-6 h-6 text-slate-400" />}
            title={`No skills under "${selectedCategory}"`}
            description="Try selecting another category or view All Skills."
            action={
              <Button
                variant="outline"
                size="xs"
                onClick={() => setSelectedCategory('All')}
              >
                View All Skills
              </Button>
            }
            compact
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skillName, index) => {
              const category = categorizeSkill(skillName);
              const weakTask = weakSkillsMap.get(skillName.toLowerCase().trim());
              const isDiagnosticGap = !!weakTask;

              return (
                <div
                  key={index}
                  className={`
                    p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-3 shadow-card hover:shadow-card-hover bg-white
                    ${isDiagnosticGap ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/90'}
                  `}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                          {category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate mt-0.5">
                          {skillName}
                        </h3>
                      </div>

                      {isDiagnosticGap ? (
                        <Badge variant="warning" size="xs">
                          Gap Identified
                        </Badge>
                      ) : (
                        <Badge variant="success" size="xs">
                          Required
                        </Badge>
                      )}
                    </div>

                    {isDiagnosticGap ? (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
                        <strong className="block text-amber-950 font-semibold mb-0.5">Action Plan Task:</strong>
                        {weakTask}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Evaluated against campus placement eligibility standards for {displayCareer}.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Curriculum Syllabus Benchmark</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PROFESSIONAL COMPETENCIES & MOCK INTERVIEW EVALUATIONS
      ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Soft Skills & Behavioral Rubrics (6 Columns) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Faculty Evaluation Scores
                </h2>
              </div>
              <Badge variant="neutral" size="sm">
                {totalInterviews} Mock Interview{totalInterviews === 1 ? '' : 's'}
              </Badge>
            </div>

            {totalInterviews === 0 || !interviewScores ? (
              <EmptyState
                icon={<Briefcase className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
                title="No Mock Interview Evaluations Yet"
                description="Book a mock technical or behavioral interview with department faculty to record objective rubrics for your placement profile."
                action={
                  <Button
                    as={Link}
                    to="/student/interviews"
                    variant="primary"
                    size="xs"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Schedule Mock Interview
                  </Button>
                }
                compact
              />
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Average scores aggregated across all completed institutional mock interview boards:
                </p>

                {/* Technical Score */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800">
                      Technical Knowledge &amp; Problem Solving
                    </span>
                    <span className="font-bold text-blue-700 font-mono">
                      {interviewScores.technical ? `${interviewScores.technical.toFixed(1)} / 10` : '—'}
                    </span>
                  </div>
                  <ProgressBar
                    value={interviewScores.technical ? interviewScores.technical * 10 : 0}
                    max={100}
                    variant="primary"
                    size="xs"
                  />
                </div>

                {/* Communication Score */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800">
                      Communication &amp; Articulation
                    </span>
                    <span className="font-bold text-blue-700 font-mono">
                      {interviewScores.communication ? `${interviewScores.communication.toFixed(1)} / 10` : '—'}
                    </span>
                  </div>
                  <ProgressBar
                    value={interviewScores.communication ? interviewScores.communication * 10 : 0}
                    max={100}
                    variant="primary"
                    size="xs"
                  />
                </div>

                {/* Confidence Score */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800">
                      Confidence &amp; Professional Poise
                    </span>
                    <span className="font-bold text-blue-700 font-mono">
                      {interviewScores.confidence ? `${interviewScores.confidence.toFixed(1)} / 10` : '—'}
                    </span>
                  </div>
                  <ProgressBar
                    value={interviewScores.confidence ? interviewScores.confidence * 10 : 0}
                    max={100}
                    variant="primary"
                    size="xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Validated by Institutional Faculty</span>
            </span>
            <Link
              to="/student/interviews"
              className="text-blue-600 font-semibold hover:underline"
            >
              Interview Hub →
            </Link>
          </div>
        </div>

        {/* Institutional Credentials & Verification (6 Columns) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Institutional Verification Ledger
                </h2>
              </div>
              <Badge variant="neutral" size="sm">
                Academic Audit
              </Badge>
            </div>

            <EmptyState
              icon={<Award className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
              title="Official Verification Active"
              description="Your placement portfolio is linked to your institutional student identity. External certifications and Academic Bank of Credits records are verified by the Campus Placement Cell."
              action={
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => alert('Certificate verification pipeline: please submit your course completion credentials to your assigned Faculty Advisor or Placement Coordinator for verification.')}
                >
                  Verification Instructions
                </Button>
              }
              compact
            />
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Synchronized with Campus Placement Cell</span>
            <span className="font-mono text-[11px] text-slate-500">ID: {profileData.user?.id?.slice(-8) || '—'}</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT PROFILE & CAREER TRACK
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title="Update Academic Profile & Career Track"
        description="Update your basic student details and selected career trajectory. Your choice updates your skills matrix, curriculum roadmap, and recruiter matching in real time."
        size="md"
      >
        <form onSubmit={handleEditProfileSubmit} className="space-y-4 pt-2">
          {formErrors.submit && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formErrors.submit}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Full Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            {formErrors.name && (
              <p className="text-xs text-rose-600 font-medium">{formErrors.name}</p>
            )}
          </div>

          {/* Current Semester */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Current Semester</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={editFormData.semester}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  semester: Number(e.target.value),
                }))
              }
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
            {formErrors.semester && (
              <p className="text-xs text-rose-600 font-medium">{formErrors.semester}</p>
            )}
          </div>

          {/* Target Career Track */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Target Career Track</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={editFormData.selectedCareer}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  selectedCareer: e.target.value,
                }))
              }
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Select a Career Track --</option>
              {CAREER_TRACK_OPTIONS.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Selecting an accredited career track maps department syllabus roadmaps and campus hiring criteria.
            </p>
            {formErrors.selectedCareer && (
              <p className="text-xs text-rose-600 font-medium">{formErrors.selectedCareer}</p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              loadingText="Saving Changes..."
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileSkillsPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import {
  Compass,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Users,
  Target,
  ShieldAlert,
  Award,
  Search,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Check,
  Layers,
  Building2,
  Briefcase,
  Calendar,
  GraduationCap,
  Filter,
  Route,
  Activity,
  AlertCircle,
  HelpCircle,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const CareerCompassPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [profileData, setProfileData] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [companyMatches, setCompanyMatches] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [activeTrack, setActiveTrack] = useState('Distributed Systems & Cloud Backend Engineer');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingTrack, setIsUpdatingTrack] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Modals state
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizInterests, setQuizInterests] = useState(['cloud', 'distributed', 'microservices']);
  const [quizStrengths, setQuizStrengths] = useState(['backend', 'system design', 'docker']);
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Career Tracks Definition
  const CAREER_TRACKS = [
    {
      id: 'distributed-systems',
      title: 'Distributed Systems & Cloud Backend Engineer',
      shortTitle: 'Distributed Systems',
      roleType: 'Primary Target',
      matchScore: 94,
      matchGrade: 'Tier-1 Candidate',
      description: 'High-concurrency platforms, microservices & scalable cloud infrastructure.',
      ctcRange: '₹18 – 28 LPA',
      ctcSubtitle: 'High Day-1 Premium',
      campusDemand: 'Very High (18 Partners)',
      hiringTier: 'Tier-1 Enterprise & High-Growth Tech',
      corePillars: ['High-Concurrency APIs', 'Distributed Caching', 'Microservices', 'Cloud Orchestration'],
      topPartners: ['TechCorp', 'CloudSys', 'ScaleScale'],
      readinessBreakdown: [
        { label: 'Backend & DB Internals', score: 92, color: 'bg-primary' },
        { label: 'DSA & Algorithm Design', score: 88, color: 'bg-primary' },
        { label: 'System Design Architecture', score: 82, color: 'bg-primary' },
        { label: 'Cloud & DevOps (Action Needed)', score: 70, color: 'bg-amber-500' },
      ],
      techFocus: 'Microservices, High Concurrency, DB Internals, Distributed Consensus (Raft/Paxos).',
      interviewWeighting: '40% DSA • 40% System Design • 20% CS Fundamentals',
      openingsCount: '18 Tier-1 Companies (Day 1 Confirmed)',
    },
    {
      id: 'fullstack-product',
      title: 'Full-Stack Product Engineering',
      shortTitle: 'Full-Stack Product',
      roleType: 'Alternative Trajectory',
      matchScore: 88,
      matchGrade: 'Proficient',
      description: 'End-to-end product delivery, responsive frontend frameworks & API services.',
      ctcRange: '₹14 – 22 LPA',
      ctcSubtitle: 'High Volume Recruitment',
      campusDemand: 'High (24 Partners)',
      hiringTier: 'Enterprise & High-Growth Scale-ups',
      corePillars: ['React Architecture', 'Node.js Microservices', 'GraphQL', 'System Optimization'],
      topPartners: ['FinTech Apex', 'NextWave Labs', 'InnoCorp'],
      readinessBreakdown: [
        { label: 'Frontend Systems & UX', score: 94, color: 'bg-emerald-600' },
        { label: 'Backend & REST APIs', score: 88, color: 'bg-primary' },
        { label: 'DSA & Problem Solving', score: 80, color: 'bg-primary' },
        { label: 'System Design Depth', score: 65, color: 'bg-amber-500' },
      ],
      techFocus: 'UI Performance, State Mgmt (Redux), REST & GraphQL APIs, Full-Stack Architecture.',
      interviewWeighting: '50% Coding & Project • 30% System Design • 20% UI/UX',
      openingsCount: '24 Enterprise & High-Growth Tech',
    },
    {
      id: 'devops-sre',
      title: 'DevOps & Site Reliability Engineer',
      shortTitle: 'DevOps & SRE Track',
      roleType: 'Emerging Track',
      matchScore: 76,
      matchGrade: 'In Progress',
      description: 'Infrastructure automation, production resilience, CI/CD and telemetry pipelines.',
      ctcRange: '₹16 – 26 LPA',
      ctcSubtitle: 'Specialized Niche Demand',
      campusDemand: 'Moderate-High (12 Partners)',
      hiringTier: 'Cloud Infrastructure Partners',
      corePillars: ['Infrastructure as Code', 'CI/CD Automation', 'Containers & K8s', 'Observability'],
      topPartners: ['CloudSys', 'InfraScale', 'DataMesh'],
      skillGapCallout: 'Requires Kubernetes, Terraform, Prometheus/Grafana (+3 Sprints needed).',
      readinessBreakdown: [
        { label: 'Linux OS & Networking', score: 85, color: 'bg-primary' },
        { label: 'CI/CD Pipeline Design', score: 72, color: 'bg-primary' },
        { label: 'Container Orchestration (K8s)', score: 54, color: 'bg-amber-500' },
      ],
      techFocus: 'CI/CD Automation, Kubernetes, Terraform IaC, Observability & Incident Response.',
      interviewWeighting: '30% OS/Networking • 40% DevOps Stack • 30% Coding',
      openingsCount: '12 Cloud & Infrastructure Partners',
    },
  ];

  // Fetch all career compass data concurrently
  const loadCompassData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get student profile
      const prof = await studentService.getProfile();
      setProfileData(prof);

      const targetCareer = prof?.profile?.selectedCareer || 'Distributed Systems & Cloud Backend Engineer';
      setActiveTrack(targetCareer);

      const studentId = prof?.user?.id || user?.id;

      // 2. Fetch parallel endpoints
      const [readinessRes, roadmapRes, companyMatchRes, mentorsRes] = await Promise.allSettled([
        studentId ? studentService.getPlacementReadiness(studentId) : Promise.resolve(null),
        studentService.getCareerRoadmap(targetCareer),
        studentId ? studentService.getCompanyMatch(studentId) : Promise.resolve(null),
        studentService.getMentorRecommendations(),
      ]);

      if (readinessRes.status === 'fulfilled' && readinessRes.value) {
        setReadinessData(readinessRes.value);
      }
      if (roadmapRes.status === 'fulfilled' && roadmapRes.value) {
        setRoadmap(roadmapRes.value);
      }
      if (companyMatchRes.status === 'fulfilled' && companyMatchRes.value) {
        setCompanyMatches(companyMatchRes.value?.matches || []);
      }
      if (mentorsRes.status === 'fulfilled' && mentorsRes.value) {
        setMentors(mentorsRes.value);
      }
    } catch (err) {
      console.error('Failed to load career compass data:', err);
      setError(err?.response?.data?.message || 'Unable to connect to career intelligence services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompassData();
  }, [user]);

  // Switch Active Career Target
  const handleSelectTrack = async (trackTitle) => {
    if (trackTitle === activeTrack) return;
    setIsUpdatingTrack(true);
    try {
      await studentService.updateProfile({ selectedCareer: trackTitle });
      setActiveTrack(trackTitle);
      setSuccessToast(`Target career updated to "${trackTitle}". Roadmap re-aligned!`);
      setTimeout(() => setSuccessToast(null), 4000);

      // Refresh roadmap for newly selected track
      try {
        const newRoadmap = await studentService.getCareerRoadmap(trackTitle);
        setRoadmap(newRoadmap);
      } catch (rmErr) {
        console.warn('Roadmap fetch for new track:', rmErr);
      }

      // Refresh company matches
      if (profileData?.user?.id) {
        try {
          const newMatches = await studentService.getCompanyMatch(profileData.user.id);
          setCompanyMatches(newMatches?.matches || []);
        } catch (cmErr) {
          console.warn('Company match fetch:', cmErr);
        }
      }
    } catch (err) {
      console.error('Failed to switch track:', err);
      alert(err?.response?.data?.message || 'Failed to update target career track.');
    } finally {
      setIsUpdatingTrack(false);
    }
  };

  // Submit Career Quiz
  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    setIsSubmittingQuiz(true);
    try {
      const res = await studentService.submitCareerQuiz({
        interests: quizInterests,
        strengths: quizStrengths,
      });
      setQuizResult(res?.suggestedCareer || 'Distributed Systems & Cloud Backend Engineer');
    } catch (err) {
      console.error('Quiz submission error:', err);
      alert('Failed to evaluate career quiz. Please try again.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Export Roadmap as PDF (reported missing backend capability gracefully handled)
  const handleExportRoadmap = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto py-2">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-2xl mx-auto">
        <ErrorState
          title="Career Compass Synchronization Error"
          message={error}
          onRetry={loadCompassData}
        />
      </div>
    );
  }

  // Active track object
  const currentTrackObj =
    CAREER_TRACKS.find((t) => t.title.toLowerCase() === activeTrack.toLowerCase()) || CAREER_TRACKS[0];

  return (
    <div className="space-y-7 max-w-[1400px] mx-auto pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-900 text-white shadow-lg border border-emerald-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-300 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: Career Intent & Target Persona Overview Banner (Hero)          */}
      {/* ========================================================================= */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-[#0d223c] to-[#08182b] text-white p-6 md:p-8 card-shadow relative overflow-hidden">
        {/* Subtle Watermark Compass Icon */}
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Compass className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-5">
          {/* Main Title & Subtitle */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs backdrop-blur-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Placement Predictive Intelligence Engine • Active Academic Session 2025–26</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Career Compass &amp; Strategic Pathways
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              AI-assisted, industry-benchmarked career trajectories tailored for Tier-1 placements.
              Analyzed against real placement matrices from 140+ enterprise hiring partners.
            </p>
          </div>

          {/* Active Target Role Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Primary Target Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-blue-600/80 border border-blue-400/30 backdrop-blur-xs shadow-xs">
              <Award className="w-4 h-4 text-amber-300" />
              <span className="text-xs text-white">
                Primary Target:{' '}
                <strong className="font-bold text-white ml-1">{currentTrackObj.title}</strong>
              </span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                {currentTrackObj.matchScore}% Compatibility Match
              </span>
            </div>

            {/* Secondary Track Badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <Target className="w-4 h-4 text-slate-300" />
              <span className="text-xs text-slate-200">
                Secondary Track: <strong>Full-Stack Product Engineering</strong>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/15 text-slate-200 text-[10px] font-semibold">
                88% Match
              </span>
            </div>

            {/* Quiz Trigger */}
            <button
              onClick={() => {
                setQuizResult(null);
                setQuizModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
              <span>Career Diagnostic Quiz</span>
            </button>
          </div>

          {/* Target Hiring Tier & KPI Stat Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-y-3 gap-x-6 border-t border-white/15 text-slate-200 text-xs">
            <div className="flex items-center gap-2 font-medium">
              <Building2 className="w-4 h-4 text-yellow-400" />
              <span>
                Target: <strong className="text-white font-semibold">{currentTrackObj.hiringTier}</strong> (Day 1 Recruitment)
              </span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold">
              <span className="text-slate-400">Target CTC:</span>
              <span className="text-white">{currentTrackObj.ctcRange}</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold">
              <span className="text-slate-400">Hiring Window:</span>
              <span className="text-white">Aug–Oct 2025</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold">
              <span className="text-slate-400">Active Sprints:</span>
              <span className="text-emerald-300 font-bold">3/5 Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: Recommended Career Paths (Interactive Comparative Cards)       */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recommended Career Paths</h2>
            <p className="text-xs text-slate-500">
              Validated against semester credits, assessment scores, and hiring partner rubrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">3 Active Pathways Evaluated</span>
            <button
              onClick={handleExportRoadmap}
              className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CAREER_TRACKS.map((track) => {
            const isSelected = activeTrack.toLowerCase() === track.title.toLowerCase();

            return (
              <div
                key={track.id}
                className={`rounded-2xl bg-white border p-6 flex flex-col justify-between relative overflow-hidden transition-all shadow-card hover:shadow-md ${
                  isSelected ? 'border-2 border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Top Accent Bar */}
                {isSelected && <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />}

                <div>
                  {/* Header Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
                      {isSelected ? 'Enrolled Active Roadmap' : track.roleType}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        track.matchScore >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : track.matchScore >= 80
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {track.matchScore}% Match
                    </span>
                  </div>

                  {/* Role Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {track.description}
                  </p>

                  {/* CTC & Demand Metrics */}
                  <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Placement CTC
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {track.ctcRange}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Campus Demand
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        {track.campusDemand}
                      </span>
                    </div>
                  </div>

                  {/* Core Pillars */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                      Core Pillars
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {track.corePillars.map((pillar, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {pillar}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top Hiring Partners */}
                  <div className="mb-4">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Top Hiring Partners
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      {track.topPartners.map((partner, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-md border border-slate-200 bg-white shadow-2xs text-[11px]"
                        >
                          {partner}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skill Gap Callout if any */}
                  {track.skillGapCallout && (
                    <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-900 text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-snug text-[11px]">
                        {track.skillGapCallout}
                      </p>
                    </div>
                  )}

                  {/* Readiness Breakdown */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                      Readiness Breakdown
                    </span>
                    <div className="space-y-2 text-xs">
                      {track.readinessBreakdown.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-700 font-medium">{item.label}</span>
                            <span className="font-bold text-slate-900">{item.score}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-3 border-t border-slate-100">
                  {isSelected ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-default"
                    >
                      <Route className="w-4 h-4" />
                      <span>Manage Roadmap (Active)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectTrack(track.title)}
                      disabled={isUpdatingTrack}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
                    >
                      <Target className="w-4 h-4 text-slate-400" />
                      <span>{track.roleType === 'Alternative Trajectory' ? 'Set as Secondary Target' : 'Explore Track Requirements'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: Deep-Dive Milestone Roadmap & Semester Progression             */}
      {/* ========================================================================= */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 shadow-card space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-600 text-white">
                <Route className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                End-to-End Placement Roadmap: {currentTrackObj.shortTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Semester-by-semester engineering milestones validated against Tier-1 campus hiring bars.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> 2 Completed
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" /> 1 In-Progress
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">3 Upcoming</span>
          </div>
        </div>

        {/* Horizontal Timeline Across 5 Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative">
          {/* Semester 3: Completed */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Semester 3
                </span>
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  <Check className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Core CS &amp; Problem Solving
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                500+ LeetCode DSA Mastered, Bit Manipulation, Recursion, Graph Theory.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-700">Grade: S (Verified)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* Semester 4: Completed */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Semester 4
                </span>
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  <Check className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Web Architecture &amp; DBs
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Relational schema design, B-Tree indexes, NoSQL replication, ACID vs BASE.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-700">Grade: 9.4 GPA</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* Semester 5: CURRENT ACTIVE SEMESTER (Highlighted Card, Spans 2 Cols) */}
          <div className="p-5 rounded-xl bg-blue-50/40 border-2 border-blue-600 flex flex-col justify-between lg:col-span-2 shadow-xs ring-2 ring-blue-600/10">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Current Active
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 uppercase">Semester 5</span>
                </div>
                <span className="text-xs font-bold text-blue-700">Progress: 60%</span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Distributed Caching &amp; Event Architectures
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Active Focus: Redis Caching Clusters, Apache Kafka Pub/Sub, gRPC Microservices, Rate Limiting &amp; Circuit Breakers.
                </p>

                {/* Progress bar */}
                <div className="w-full bg-blue-200/60 h-2 rounded-full overflow-hidden mt-1">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '60%' }} />
                </div>

                {/* Current Sprint Callout Box */}
                <div className="p-2.5 rounded-lg bg-white border border-blue-200 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Sprint 5.4 - Kafka Event Stream Consistency
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Due in 4 days • 87/100 Benchmark Target
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/student/goals"
                    className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    Resume
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>3 of 5 Sprints Completed</span>
              <span className="text-blue-700 font-semibold">Tier-1 Threshold on Track</span>
            </div>
          </div>

          {/* Semester 6: Upcoming */}
          <div className="p-4 rounded-xl bg-slate-50/50 border border-dashed border-slate-300 flex flex-col justify-between text-slate-500">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Semester 6
                </span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">
                Capstone &amp; Fault Tolerance
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Chaos Engineering, Load Testing (k6), Raft Distributed Consensus engine build.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Starts Jan 2026</span>
              <span>4 Modules</span>
            </div>
          </div>

          {/* Semester 7 & 8: Placement Drives */}
          <div className="p-4 rounded-xl bg-slate-50/50 border border-dashed border-slate-300 flex flex-col justify-between text-slate-500">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Sem 7–8
                </span>
                <Briefcase className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">
                Campus Drives &amp; Internships
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                High-frequency Day 1 mock screens, recruiter slots, corporate onboarding.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Aug 2026 Drives</span>
              <span className="text-blue-600 font-bold">Target ₹24 LPA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: Actionable Skill Gap Analysis & Mentor Guidance (7 / 5 Grid)   */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Bridge the Gap */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Bridge the 6% Gap to 100% TechCorp Alignment
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                High-priority gap competencies flagged by Day-1 enterprise rubrics.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              3 Actions Required
            </span>
          </div>

          <div className="space-y-3">
            {/* Competency 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-300 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Apache Kafka &amp; Event Streaming
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                    Priority High
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Gap: Requires hands-on proof with consumer group lag &amp; partition rebalancing.
                </p>
              </div>
              <Link
                to="/student/goals"
                className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center shadow-xs"
              >
                <span>Enroll in Sprint 5.4</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Competency 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-300 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h4 className="text-xs font-bold text-slate-900">
                    gRPC &amp; Protocol Buffers Serialization
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Priority Med
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Gap: Intermediate proficiency. Need practical binary serialization throughput benchmark.
                </p>
              </div>
              <Link
                to="/student/interviews"
                className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center"
              >
                <span>Complete Assessment Lab</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>

            {/* Competency 3 */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-300 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Kubernetes &amp; Container Orchestration
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Gap: Recommended for Tier-1 distinction. Ingress controllers &amp; Helm chart deployments.
                </p>
              </div>
              <Link
                to="/student/profile"
                className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center"
              >
                <span>Add Verified Proof</span>
                <Award className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Faculty & Alumni Guidance */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Faculty &amp; Alumni Guidance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matched based on your {currentTrackObj.shortTitle} path.
                </p>
              </div>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="space-y-3.5 mt-3.5">
              {/* Guidance Card 1: Faculty */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    NS
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      Prof. Neha Sharma
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Faculty Placement Lead • Dept. Seminar Lab 3
                    </p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      2 Slots Open Tomorrow
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Specialized in Tier-1 technical readiness reviews and research-backed capstone project approvals.
                </p>
                <Link
                  to="/student/mentorship"
                  className="w-full h-8 px-3 rounded-lg bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-200 shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule 1:1 Roadmap Review</span>
                </Link>
              </div>

              {/* Guidance Card 2: Alumni */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    AV
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      Amit Verma
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Staff SWE, TechCorp • CSE Alumni '21
                    </p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Distributed Systems Mentor
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Conducted 45+ mock interviews for Day-1 cloud infrastructure and backend engineering slots.
                </p>
                <Link
                  to="/student/mentorship"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Request Track Advice</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              to="/student/mentorship"
              className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>View All 18 Department Mentors &amp; Alumni Network</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: Side-by-Side Role Comparison Matrix (Interactive Table)        */}
      {/* ========================================================================= */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-card overflow-hidden">
        {/* Table Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Multi-Track Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular parameter comparison between target roles to align course electives and preparation sprints.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
              3 Roles Evaluated
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6 font-bold w-1/4">Parameter / Dimension</th>
                <th className="py-3.5 px-6 font-bold w-1/4 bg-blue-50/50 text-blue-800 border-x border-blue-200/60">
                  <div className="flex items-center justify-between">
                    <span>Distributed Systems (Primary)</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-bold">
                      94%
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-6 font-bold w-1/4">
                  <div className="flex items-center justify-between">
                    <span>Full-Stack Product (Secondary)</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 text-[9px] font-bold">
                      88%
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-6 font-bold w-1/4">
                  <div className="flex items-center justify-between">
                    <span>DevOps &amp; SRE Track</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[9px] font-bold">
                      76%
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {/* Row 1: CTC */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-600 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Placement CTC Range</span>
                </td>
                <td className="py-4 px-6 font-bold text-slate-900 bg-blue-50/30 border-x border-blue-100">
                  ₹18 – 28 LPA
                  <span className="block text-[11px] text-emerald-700 font-medium">High Day-1 Premium</span>
                </td>
                <td className="py-4 px-6 font-medium text-slate-900">
                  ₹14 – 22 LPA
                  <span className="block text-[11px] text-slate-500">High Volume Recruitment</span>
                </td>
                <td className="py-4 px-6 font-medium text-slate-900">
                  ₹16 – 26 LPA
                  <span className="block text-[11px] text-slate-500">Specialized Niche Demand</span>
                </td>
              </tr>

              {/* Row 2: Technical Focus */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-600 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Primary Technical Focus</span>
                </td>
                <td className="py-4 px-6 bg-blue-50/30 border-x border-blue-100 leading-relaxed text-[11px]">
                  Microservices, High Concurrency, DB Internals, Distributed Consensus (Raft/Paxos).
                </td>
                <td className="py-4 px-6 leading-relaxed text-[11px]">
                  UI Performance, State Mgmt (Redux), REST &amp; GraphQL APIs, Full-Stack Architecture.
                </td>
                <td className="py-4 px-6 leading-relaxed text-[11px]">
                  CI/CD Automation, Kubernetes, Terraform IaC, Observability &amp; Incident Response.
                </td>
              </tr>

              {/* Row 3: Interview Weighting */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-600 flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-400" />
                  <span>Interview Weighting</span>
                </td>
                <td className="py-4 px-6 bg-blue-50/30 border-x border-blue-100 text-[11px]">
                  <span className="font-bold text-slate-900">40% DSA</span> •{' '}
                  <span className="font-bold text-slate-900">40% System Design</span> •{' '}
                  <span>20% CS Fundamentals</span>
                </td>
                <td className="py-4 px-6 text-[11px]">
                  <span className="font-bold text-slate-900">50% Coding &amp; Project</span> •{' '}
                  <span className="font-bold text-slate-900">30% System Design</span> •{' '}
                  <span>20% UI/UX</span>
                </td>
                <td className="py-4 px-6 text-[11px]">
                  <span className="font-bold text-slate-900">30% OS/Networking</span> •{' '}
                  <span className="font-bold text-slate-900">40% DevOps Stack</span> •{' '}
                  <span>30% Coding</span>
                </td>
              </tr>

              {/* Row 4: Readiness Score */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-600 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Student's Readiness Score</span>
                </td>
                <td className="py-4 px-6 bg-blue-50/30 border-x border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-700">94%</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Tier-1 Candidate
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">88%</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      Proficient
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">76%</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                      In Progress
                    </span>
                  </div>
                </td>
              </tr>

              {/* Row 5: Openings */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Active Recruiter Openings</span>
                </td>
                <td className="py-4 px-6 font-semibold bg-blue-50/30 border-x border-blue-100 text-slate-900 text-[11px]">
                  18 Tier-1 Companies (Day 1 Confirmed)
                </td>
                <td className="py-4 px-6 text-slate-800 text-[11px] font-semibold">
                  24 Enterprise &amp; High-Growth Tech
                </td>
                <td className="py-4 px-6 text-slate-800 text-[11px] font-semibold">
                  12 Cloud &amp; Infrastructure Partners
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Last synchronized with Placement Cell Database: Today, 09:30 AM</span>
          <button
            onClick={() => {
              const csvContent =
                'Parameter,Distributed Systems (Primary),Full-Stack Product (Secondary),DevOps & SRE\n' +
                'Placement CTC,₹18-28 LPA,₹14-22 LPA,₹16-26 LPA\n' +
                'Interview Weighting,40% DSA 40% SysDesign 20% CS,50% Code 30% SysDesign 20% UI,30% OS 40% DevOps 30% Code\n' +
                'Readiness Score,94%,88%,76%\n';
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', 'GRIP_Career_Tracks_Comparison.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1 font-semibold text-blue-600 hover:underline"
          >
            <span>Export Comparison as CSV</span>
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL: Career Diagnostic Quiz                                             */}
      {/* ========================================================================= */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Career Diagnostic Assessment Quiz
                </h3>
              </div>
              <button
                onClick={() => setQuizModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuiz} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your engineering interests and current technical strengths. The GRIP Placement Predictive Engine evaluates your profile against hiring rubrics to suggest your optimal trajectory.
              </p>

              {/* Interests Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Key Technical Interests (Comma-separated)
                </label>
                <input
                  type="text"
                  value={quizInterests.join(', ')}
                  onChange={(e) =>
                    setQuizInterests(
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="cloud, distributed, microservices, databases"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Strengths Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Current Core Strengths (Comma-separated)
                </label>
                <input
                  type="text"
                  value={quizStrengths.join(', ')}
                  onChange={(e) =>
                    setQuizStrengths(
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="backend, system design, docker, java, go"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Suggested Result */}
              {quizResult && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-800 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Engine Recommendation:</span>
                  </div>
                  <p className="text-sm font-extrabold text-blue-900">
                    {quizResult}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectTrack(quizResult);
                      setQuizModalOpen(false);
                    }}
                    className="mt-2 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Set as Active Career Target
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuizModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingQuiz}
                >
                  {isSubmittingQuiz ? 'Evaluating...' : 'Run Diagnostics'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerCompassPage;

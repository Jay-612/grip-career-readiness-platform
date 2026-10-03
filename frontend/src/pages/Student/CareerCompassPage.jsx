import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { CheckCircle2, X } from 'lucide-react';
import {
  CareerHeader,
  TargetRoleSummary,
  CareerSummaryMetrics,
  CareerOverviewTab,
  SkillGapTable,
  RoadmapTimeline,
  CompanyMatchList,
  RoleSelectorModal,
  CareerCompassQuizModal,
} from '../../components/student/career-compass';

export const CareerCompassPage = () => {
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();

  // Primary Data State
  const [profileData, setProfileData] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [companyMatches, setCompanyMatches] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [progressDashboard, setProgressDashboard] = useState(null);
  const [activeTrack, setActiveTrack] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'roadmap' | 'companies'

  // Loading & Action State
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingTrack, setIsUpdatingTrack] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Modals
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Curricular Career Tracks Definition
  const CAREER_TRACKS = useMemo(
    () => [
      {
        id: 'distributed-systems',
        title: 'Distributed Systems & Cloud Backend Engineer',
        shortTitle: 'Distributed Systems',
        roleType: 'Primary Target',
        description: 'High-concurrency platforms, microservices & scalable cloud infrastructure.',
        ctcRange: '₹18 – 28 LPA',
        campusDemand: 'High Placement Demand',
        hiringTier: 'Tier-1 Enterprise & High-Growth Tech',
        corePillars: ['High-Concurrency APIs', 'Distributed Caching', 'Microservices', 'Cloud Orchestration'],
      },
      {
        id: 'fullstack-product',
        title: 'Full-Stack Product Engineering',
        shortTitle: 'Full-Stack Product',
        roleType: 'Alternative Trajectory',
        description: 'End-to-end product delivery, responsive frontend frameworks & API services.',
        ctcRange: '₹14 – 22 LPA',
        campusDemand: 'Broad Market Demand',
        hiringTier: 'Enterprise & High-Growth Scale-ups',
        corePillars: ['React Architecture', 'Node.js Microservices', 'GraphQL', 'System Optimization'],
      },
      {
        id: 'devops-sre',
        title: 'DevOps & Cloud Infrastructure Specialist',
        shortTitle: 'DevOps & Cloud Infrastructure',
        roleType: 'Alternative Trajectory',
        description: 'Infrastructure automation, production resilience, CI/CD and telemetry pipelines.',
        ctcRange: '₹16 – 26 LPA',
        campusDemand: 'Targeted Infrastructure Demand',
        hiringTier: 'Cloud Infrastructure Partners',
        corePillars: ['Infrastructure as Code', 'CI/CD Automation', 'Containers & K8s', 'Observability'],
      },
      {
        id: 'ai-data-systems',
        title: 'AI & Data Systems Engineer',
        shortTitle: 'AI & Data Systems',
        roleType: 'High Growth Trajectory',
        description: 'Machine learning data pipelines, model serving architectures, and high-throughput data systems.',
        ctcRange: '₹18 – 30 LPA',
        campusDemand: 'Exponential Placement Demand',
        hiringTier: 'AI Labs & Enterprise Data Divisions',
        corePillars: ['ML Data Pipelines', 'Deep Learning Services', 'Vector Databases & RAG', 'Distributed Analytics'],
      },
    ],
    []
  );

  // Automatically open quiz if triggered via URL query parameter (e.g. ?takeQuiz=true)
  useEffect(() => {
    if (searchParams.get('takeQuiz') === 'true') {
      setQuizModalOpen(true);
    }
  }, [searchParams]);

  // Load All Compass Data Concurrently
  const loadCompassData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch Profile
      const prof = await studentService.getProfile();
      setProfileData(prof);

      const targetCareer = prof?.profile?.selectedCareer || user?.selectedCareer || '';
      const effectiveCareer = targetCareer || CAREER_TRACKS[0].title;
      setActiveTrack(targetCareer || CAREER_TRACKS[0].title);

      const studentId = prof?.user?.id || user?.id;

      // 2. Concurrently fetch essential metrics
      const [readinessRes, roadmapRes, companyMatchRes, dashboardRes] = await Promise.allSettled([
        studentId ? studentService.getPlacementReadiness(studentId) : Promise.resolve(null),
        studentService.getCareerRoadmap(effectiveCareer),
        studentId ? studentService.getCompanyMatch(studentId) : Promise.resolve(null),
        studentId ? studentService.getProgressDashboard(studentId) : Promise.resolve(null),
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
      if (dashboardRes.status === 'fulfilled' && dashboardRes.value) {
        setProgressDashboard(dashboardRes.value);
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
  }, [user?.id]);

  // Track switching handler
  const handleSelectTrack = async (trackTitle) => {
    if (trackTitle === activeTrack) return;
    setIsUpdatingTrack(true);

    try {
      await studentService.updateProfile({ selectedCareer: trackTitle });
      if (updateUser) {
        updateUser({ selectedCareer: trackTitle });
      }
      setActiveTrack(trackTitle);
      setSuccessToast(`Target career aligned to "${trackTitle}". Roadmap updated!`);
      setTimeout(() => setSuccessToast(null), 3500);

      // Refresh roadmap and company matches
      const studentId = profileData?.user?.id || user?.id;
      const [newRoadmap, newMatches] = await Promise.allSettled([
        studentService.getCareerRoadmap(trackTitle),
        studentId ? studentService.getCompanyMatch(studentId) : Promise.resolve(null),
      ]);

      if (newRoadmap.status === 'fulfilled' && newRoadmap.value) {
        setRoadmap(newRoadmap.value);
      }
      if (newMatches.status === 'fulfilled' && newMatches.value) {
        setCompanyMatches(newMatches.value?.matches || []);
      }
    } catch (err) {
      console.error('Failed to switch track:', err);
      alert(err?.response?.data?.message || 'Failed to update target career track.');
    } finally {
      setIsUpdatingTrack(false);
    }
  };

  // Submit Career Diagnostic Quiz
  const handleSubmitQuiz = async ({ interests, strengths }) => {
    setIsSubmittingQuiz(true);
    try {
      const res = await studentService.submitCareerQuiz({ interests, strengths });
      setQuizResult({
        suggestedCareer: res?.suggestedCareer || CAREER_TRACKS[0].title,
        description: res?.description || '',
        requiredSkills: res?.requiredSkills || [],
      });
    } catch (err) {
      console.error('Quiz submission error:', err);
      alert('Failed to evaluate career quiz. Please try again.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleApplyQuizResult = async (suggestedCareer) => {
    setQuizModalOpen(false);
    setQuizResult(null);
    await handleSelectTrack(suggestedCareer);
  };

  // ─────────────────────────────────────────────────────────────
  // DERIVED VALUES
  // ─────────────────────────────────────────────────────────────
  const currentTrackObj = useMemo(() => {
    return (
      CAREER_TRACKS.find((t) => t.title.toLowerCase() === activeTrack.toLowerCase()) ||
      CAREER_TRACKS[0]
    );
  }, [CAREER_TRACKS, activeTrack]);

  const readinessScore = readinessData?.readinessScore ?? 0;
  const currentSemester = profileData?.profile?.semester || 1;
  const roadmapProgress = Math.min(100, Math.round((currentSemester / 8) * 100));

  // Extract verified strengths & missing skills
  const { topStrengths, topMissingSkills, totalSkillsCount } = useMemo(() => {
    const strengths = new Set();
    const missing = new Set();

    // From company matches
    (companyMatches || []).forEach((m) => {
      (m.matchedSkills || []).forEach((s) => strengths.add(s));
      (m.requiredSkills || []).forEach((req) => {
        if (!strengths.has(req)) missing.add(req);
      });
    });

    // From progress dashboard action plans
    (progressDashboard?.actionPlans?.items || []).forEach((item) => {
      if (item.weakSkill) missing.add(item.weakSkill);
    });

    const strList = Array.from(strengths);
    const misList = Array.from(missing);

    // Fallbacks if empty
    if (strList.length === 0 && misList.length === 0) {
      return {
        topStrengths: ['Data Structures & Algorithms', 'C++ / Java Core', 'Relational SQL'],
        topMissingSkills: ['System Design & Scalability', 'Distributed Caching (Redis)', 'Docker & K8s'],
        totalSkillsCount: 12,
      };
    }

    return {
      topStrengths: strList,
      topMissingSkills: misList,
      totalSkillsCount: strList.length + misList.length,
    };
  }, [companyMatches, progressDashboard]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 antialiased pb-10">
        <Skeleton variant="card" className="h-16 rounded-xl" />
        <Skeleton variant="card" className="h-44 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton variant="card" className="h-96 rounded-2xl" />
      </div>
    );
  }

  // Error state
  if (error && !profileData) {
    return (
      <div className="my-8 max-w-2xl mx-auto">
        <ErrorState
          title="Career Compass Unavailable"
          message={error}
          onRetry={loadCompassData}
        />
      </div>
    );
  }

  return (
    <main
      className="space-y-5 pb-12 antialiased"
      aria-label="Career Compass & Trajectory Planner"
    >
      {/* Toast Notification */}
      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. CAREER HEADER */}
      <CareerHeader onOpenQuiz={() => setQuizModalOpen(true)} />

      {/* 2. TARGET ROLE SUMMARY */}
      <TargetRoleSummary
        selectedTrack={activeTrack}
        trackDetails={currentTrackObj}
        readinessScore={readinessScore}
        topMissingSkills={topMissingSkills}
        onChangeRole={() => setRoleModalOpen(true)}
        isUpdating={isUpdatingTrack}
      />

      {/* 3. QUICK SUMMARY (Max 4 Values) */}
      <CareerSummaryMetrics
        careerMatch={readinessScore}
        verifiedSkillsCount={topStrengths.length}
        totalRequiredSkills={totalSkillsCount}
        missingSkillsCount={topMissingSkills.length}
        roadmapProgress={roadmapProgress}
        semester={currentSemester}
      />

      {/* 4. TABBED CONTENT AREA */}
      <section className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/90 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'skills', label: `Skill Gaps (${topMissingSkills.length})` },
            { id: 'roadmap', label: 'Curriculum Roadmap' },
            { id: 'companies', label: `Hiring Partners (${companyMatches.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <CareerOverviewTab
            targetTrack={activeTrack}
            trackDetails={currentTrackObj}
            readinessScore={readinessScore}
            topStrengths={topStrengths}
            topMissingSkills={topMissingSkills}
            onSwitchToSkills={() => setActiveTab('skills')}
            onSwitchToRoadmap={() => setActiveTab('roadmap')}
          />
        )}

        {/* Tab 2: Skill Gaps */}
        {activeTab === 'skills' && (
          <SkillGapTable
            skillsData={topStrengths.concat(topMissingSkills).map((s) => ({
              name: s,
              verified: topStrengths.includes(s),
            }))}
            companyMatches={companyMatches}
            targetTrack={activeTrack}
            actionPlans={progressDashboard?.actionPlans?.items || []}
          />
        )}

        {/* Tab 3: Roadmap */}
        {activeTab === 'roadmap' && (
          <RoadmapTimeline
            roadmap={roadmap}
            currentSemester={currentSemester}
            targetTrack={activeTrack}
          />
        )}

        {/* Tab 4: Companies */}
        {activeTab === 'companies' && (
          <CompanyMatchList
            companies={companyMatches}
            targetTrack={activeTrack}
          />
        )}
      </section>

      {/* Role Selection Modal */}
      <RoleSelectorModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        tracks={CAREER_TRACKS}
        activeTrack={activeTrack}
        onSelectTrack={handleSelectTrack}
        isUpdating={isUpdatingTrack}
      />

      {/* Career Diagnostic Quiz Modal */}
      <CareerCompassQuizModal
        isOpen={quizModalOpen}
        onClose={() => { setQuizModalOpen(false); setQuizResult(null); }}
        onSubmit={handleSubmitQuiz}
        isSubmitting={isSubmittingQuiz}
        quizResult={quizResult}
        onApplyResult={handleApplyQuizResult}
      />
    </main>
  );
};

export default CareerCompassPage;

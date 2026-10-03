import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldAlert,
  ChevronLeft,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import analyticsApi from '../../services/analyticsApi';
import facultyService from '../../services/facultyService';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import {
  AnalyticsFilterBar,
  AnalyticsTabs,
  OverviewTab,
  SkillGapsTab,
  StudentRosterTab,
  StudentAnalyticsDrawer,
  ScheduleEventModal,
} from '../../components/faculty/analytics';
import { exportStudentsToCSV } from '../../utils/csvExport';

export const HodAnalyticsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── Profile & Authorization State ────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [isHOD, setIsHOD] = useState(false);

  // ─── Analytics Datasets ────────────────────────────────────────────
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [skillGapsData, setSkillGapsData] = useState([]);
  const [totalStudentsWithActionPlans, setTotalStudentsWithActionPlans] = useState(0);
  const [placementStats, setPlacementStats] = useState(null);
  const [careerDistribution, setCareerDistribution] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [departmentEvents, setDepartmentEvents] = useState([]);

  // ─── Loading & Error States ───────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // ─── Navigation Tabs & Filters ────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skillGaps' | 'roster'
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedCareer, setSelectedCareer] = useState('ALL');
  const [studentSearch, setStudentSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  // ─── Drawer & Modal States ────────────────────────────────────────
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [studentProgressData, setStudentProgressData] = useState(null);
  const [studentReadinessData, setStudentReadinessData] = useState(null);

  // Schedule Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTargetSkill, setEventTargetSkill] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [eventSuccessMessage, setEventSuccessMessage] = useState(null);
  const [eventErrorMessage, setEventErrorMessage] = useState(null);

  // ─── 1. Access Check & Data Fetching ──────────────────────────────
  const verifyAccessAndLoadData = useCallback(async (isSilentRefresh = false) => {
    if (isSilentRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      setGlobalError(null);
    }

    try {
      // Step A: Load faculty profile to verify HOD permission
      const profRes = await facultyService.getProfile();
      setFacultyProfile(profRes);

      const hasHODPrivilege =
        user?.role === 'admin' ||
        Boolean(profRes?.profile?.isHOD);

      setIsHOD(hasHODPrivilege);
      setProfileLoading(false);

      if (!hasHODPrivilege) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Step B: Load all Department Analytics endpoints in parallel
      const [
        analyticsSettled,
        skillGapsSettled,
        placementSettled,
        careerSettled,
        leaderboardSettled,
        eventsSettled,
      ] = await Promise.allSettled([
        analyticsApi.getDepartmentAnalytics(),
        analyticsApi.getSkillGaps(),
        analyticsApi.getPlacementStats(),
        analyticsApi.getCareerDistribution(),
        analyticsApi.getLeaderboard(1, 100),
        analyticsApi.getEvents(),
      ]);

      if (analyticsSettled.status === 'fulfilled' && analyticsSettled.value?.success) {
        setAnalyticsOverview(analyticsSettled.value.analytics);
      }
      if (skillGapsSettled.status === 'fulfilled' && skillGapsSettled.value?.success) {
        setSkillGapsData(skillGapsSettled.value.skillGaps || []);
        setTotalStudentsWithActionPlans(skillGapsSettled.value.totalStudentsWithActionPlans || 0);
      }
      if (placementSettled.status === 'fulfilled' && placementSettled.value?.success) {
        setPlacementStats(placementSettled.value.stats);
      }
      if (careerSettled.status === 'fulfilled' && careerSettled.value?.success) {
        setCareerDistribution(careerSettled.value.distribution || []);
      }
      if (leaderboardSettled.status === 'fulfilled' && leaderboardSettled.value?.success) {
        setLeaderboard(leaderboardSettled.value.leaderboard || []);
      }
      if (eventsSettled.status === 'fulfilled' && eventsSettled.value?.success) {
        setDepartmentEvents(eventsSettled.value.events || []);
      }
    } catch (err) {
      console.error('Failed to load Department Analytics:', err);
      setGlobalError(err?.response?.data?.message || err?.message || 'Unable to connect to Department Analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.role]);

  useEffect(() => {
    verifyAccessAndLoadData();
  }, [verifyAccessAndLoadData]);

  // ─── 2. Filtered Cohort Computations ──────────────────────────────
  const filteredStudents = useMemo(() => {
    return leaderboard.filter((student) => {
      // Semester filter
      if (selectedSemester !== 'ALL' && String(student.semester) !== String(selectedSemester)) {
        return false;
      }
      // Career track filter
      if (selectedCareer !== 'ALL' && student.selectedCareer !== selectedCareer) {
        return false;
      }
      return true;
    });
  }, [leaderboard, selectedSemester, selectedCareer]);

  // At-risk students (<60% score) within current semester filter
  const atRiskStudents = useMemo(() => {
    return filteredStudents.filter(
      (s) => typeof s.readinessScore === 'number' && s.readinessScore < 60
    );
  }, [filteredStudents]);

  // Distinct career tracks for filter dropdown
  const careerOptions = useMemo(() => {
    const fromDistribution = careerDistribution.map((c) => c.career).filter(Boolean);
    const fromLeaderboard = leaderboard.map((s) => s.selectedCareer).filter(Boolean);
    return Array.from(new Set([...fromDistribution, ...fromLeaderboard]));
  }, [careerDistribution, leaderboard]);

  // ─── 3. Student Inspection Handler (Drawer) ───────────────────────
  const handleOpenStudentDetail = async (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
    setStudentDetailLoading(true);
    setStudentProgressData(null);
    setStudentReadinessData(null);

    try {
      const studentId = student.studentId || student._id;
      const [progRes, readRes] = await Promise.allSettled([
        analyticsApi.getStudentProgress(studentId),
        analyticsApi.getStudentReadiness(studentId),
      ]);

      if (progRes.status === 'fulfilled' && progRes.value?.success) {
        setStudentProgressData(progRes.value.dashboard);
      }
      if (readRes.status === 'fulfilled' && readRes.value?.success) {
        setStudentReadinessData(readRes.value.data);
      }
    } catch (err) {
      console.warn('Error loading student details:', err);
    } finally {
      setStudentDetailLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedStudent(null);
  };

  // ─── 4. Shortcut from Overview to At-Risk Students ────────────────
  const handleNavigateToAtRisk = () => {
    setActiveTab('roster');
    setTierFilter('ATTENTION');
  };

  // ─── 5. Schedule Event Modal Handlers ─────────────────────────────
  const handleOpenScheduleModal = (targetSkill = '') => {
    setEventTargetSkill(targetSkill);
    setEventTitle(targetSkill ? `Department Workshop: Mastering ${targetSkill}` : 'Department Skill Remediation Workshop');
    setEventDate('');
    setEventDescription(targetSkill ? `Targeted academic session addressing cohort skill gaps in ${targetSkill}.` : '');
    setEventErrorMessage(null);
    setEventSuccessMessage(null);
    setIsEventModalOpen(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!facultyProfile?.user?.id && !user?.id) {
      setEventErrorMessage('Unable to determine HOD faculty identity.');
      return;
    }

    setIsSubmittingEvent(true);
    setEventErrorMessage(null);
    setEventSuccessMessage(null);

    try {
      const hodUserId = facultyProfile?.user?.id || user?.id;
      const res = await analyticsApi.createEvent({
        hodId: hodUserId,
        title: eventTitle,
        targetSkill: eventTargetSkill,
        date: eventDate,
        description: eventDescription,
      });

      if (res?.success) {
        setEventSuccessMessage('Department improvement event successfully scheduled.');
        const refreshedEvents = await analyticsApi.getEvents();
        if (refreshedEvents?.success) {
          setDepartmentEvents(refreshedEvents.events || []);
        }
        setTimeout(() => {
          setIsEventModalOpen(false);
        }, 1200);
      } else {
        setEventErrorMessage(res?.message || 'Failed to schedule event');
      }
    } catch (err) {
      setEventErrorMessage(err?.response?.data?.message || err?.message || 'Server error while scheduling event');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // ─── 6. CSV Export Handler ────────────────────────────────────────
  const handleExportCSV = () => {
    const filename = `department_roster_sem_${selectedSemester}_${Date.now()}.csv`;
    exportStudentsToCSV(filteredStudents, filename);
  };

  const departmentName = facultyProfile?.profile?.department || 'Computer Science & Engineering';

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: NON-HOD RESTRICTED STATE
  // ═══════════════════════════════════════════════════════════════════
  if (!profileLoading && !isHOD && user?.role !== 'admin') {
    return (
      <div className="space-y-6 antialiased max-w-5xl mx-auto py-8">
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-card p-8 sm:p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Head of Department Authorization Required
          </h2>

          <p className="mt-2 text-sm text-slate-600 max-w-lg leading-relaxed">
            The Department Analytics Center provides aggregated institutional telemetry and requires verified HOD privileges.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-left max-w-md w-full space-y-1">
            <div className="font-semibold text-slate-700">Authenticated Faculty:</div>
            <div className="text-slate-500">{user?.email} • {departmentName}</div>
            <div className="pt-2 text-slate-400 text-[11px]">
              If you have HOD responsibilities, please ask your platform administrator to enable <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800">isHOD: true</code> in your Faculty Profile.
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <Button
              variant="primary"
              onClick={() => navigate('/faculty/dashboard')}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Return to Faculty Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => verifyAccessAndLoadData()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Recheck Authorization
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: GLOBAL ERROR STATE
  // ═══════════════════════════════════════════════════════════════════
  if (globalError) {
    return (
      <div className="space-y-6 antialiased max-w-7xl mx-auto py-6">
        <ErrorState
          title="Failed to Load Department Analytics"
          message={globalError}
          onRetry={() => verifyAccessAndLoadData()}
          retryText="Reconnect to Analytics API"
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN HOD ANALYTICS DASHBOARD
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 antialiased pb-12" data-purpose="hod-analytics-page">
      {/* ─── 1. COMPACT HERO HEADER ───────────────────────────────────── */}
      <section
        className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 shadow-md overflow-hidden border border-slate-800"
        data-purpose="hod-analytics-header"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 backdrop-blur-md text-blue-200 border border-white/20">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                Department Telemetry
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-blue-200 font-semibold">{departmentName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                HOD Console
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
              Department Analytics
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Cohort readiness metrics, missing competency diagnostics, and academic intervention tracking.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => verifyAccessAndLoadData(true)}
              disabled={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs backdrop-blur-xs cursor-pointer"
            >
              {isRefreshing ? 'Syncing...' : 'Sync Telemetry'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenScheduleModal()}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs cursor-pointer"
            >
              + Schedule Event
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 2. GLOBAL FILTER BAR ─────────────────────────────────────── */}
      <AnalyticsFilterBar
        selectedSemester={selectedSemester}
        onSemesterChange={setSelectedSemester}
        selectedCareer={selectedCareer}
        onCareerChange={setSelectedCareer}
        careerOptions={careerOptions}
        filteredCount={filteredStudents.length}
        totalCount={leaderboard.length}
        onSyncTelemetry={() => verifyAccessAndLoadData(true)}
        isRefreshing={isRefreshing}
        onExportCSV={handleExportCSV}
      />

      {/* ─── 3. TAB CONTROLS (OVERVIEW / SKILL GAPS / STUDENT ROSTER) ──── */}
      <AnalyticsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        atRiskCount={atRiskStudents.length}
        skillGapCount={skillGapsData.length}
        totalStudents={filteredStudents.length}
      />

      {/* ─── 4. TAB CONTENTS (ONLY ACTIVE TAB RENDERS) ────────────────── */}
      <div className="mt-4">
        {activeTab === 'overview' && (
          <OverviewTab
            analyticsOverview={analyticsOverview}
            placementStats={placementStats}
            careerDistribution={careerDistribution}
            atRiskCount={atRiskStudents.length}
            isLoading={isLoading}
            onViewAtRisk={handleNavigateToAtRisk}
            selectedSemester={selectedSemester}
          />
        )}

        {activeTab === 'skillGaps' && (
          <SkillGapsTab
            skillGapsData={skillGapsData}
            totalStudentsWithActionPlans={totalStudentsWithActionPlans}
            departmentEvents={departmentEvents}
            onOpenScheduleModal={handleOpenScheduleModal}
          />
        )}

        {activeTab === 'roster' && (
          <StudentRosterTab
            students={filteredStudents}
            tierFilter={tierFilter}
            onTierFilterChange={setTierFilter}
            searchQuery={studentSearch}
            onSearchChange={setStudentSearch}
            onSelectStudent={handleOpenStudentDetail}
            onExportCSV={handleExportCSV}
          />
        )}
      </div>

      {/* ─── 5. SLIDE-OVER STUDENT INSPECTION DRAWER ──────────────────── */}
      <StudentAnalyticsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        student={selectedStudent}
        studentProgressData={studentProgressData}
        studentReadinessData={studentReadinessData}
        isLoading={studentDetailLoading}
      />

      {/* ─── 6. SCHEDULE REMEDIATION WORKSHOP MODAL ───────────────────── */}
      <ScheduleEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        targetSkill={eventTargetSkill}
        eventTitle={eventTitle}
        setEventTitle={setEventTitle}
        eventDate={eventDate}
        setEventDate={setEventDate}
        eventDescription={eventDescription}
        setEventDescription={setEventDescription}
        onSubmit={handleCreateEvent}
        isSubmitting={isSubmittingEvent}
        successMessage={eventSuccessMessage}
        errorMessage={eventErrorMessage}
      />
    </div>
  );
};

export default HodAnalyticsPage;

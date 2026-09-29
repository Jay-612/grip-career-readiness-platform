import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  Check,
  Flame,
  ListTodo,
  FolderX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import goalService from '../../services/goalService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';

export const GoalTrackerPage = () => {
  const { user } = useAuth();

  // Primary Data States
  const [goals, setGoals] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [actionPlans, setActionPlans] = useState([]);

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingGoalId, setUpdatingGoalId] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filtering & Search
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'due-this-week' | 'in-progress' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDateAsc'); // 'dueDateAsc' | 'dueDateDesc' | 'titleAsc'

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    dueDate: '',
    status: 'in-progress',
  });
  const [createFormErrors, setCreateFormErrors] = useState({});

  // Helper: Format Dates safely
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline set';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Invalid date';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Helper: Get Deadline Status
  const getDeadlineInfo = (dueDate, status) => {
    if (!dueDate) return { isOverdue: false, text: 'Flexible deadline', variant: 'neutral' };
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));

    if (status === 'completed') {
      return { isOverdue: false, text: 'Completed', variant: 'success' };
    }

    if (diffDays < 0) {
      return {
        isOverdue: true,
        text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
        variant: 'danger',
      };
    }
    if (diffDays === 0) {
      return { isOverdue: false, text: 'Due today', variant: 'warning' };
    }
    if (diffDays === 1) {
      return { isOverdue: false, text: 'Due tomorrow', variant: 'warning' };
    }
    if (diffDays <= 7) {
      return { isOverdue: false, text: `${diffDays} days left`, variant: 'info' };
    }
    return { isOverdue: false, text: `${diffDays} days left`, variant: 'neutral' };
  };

  // ─────────────────────────────────────────────────────────────
  // 1. DATA FETCHING (Authenticated Student)
  // ─────────────────────────────────────────────────────────────
  const fetchGoalData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch user & student profile to obtain exact studentId and career
      const profileRes = await goalService.getProfile();
      const profile = profileRes?.profile || null;
      const resolvedStudentId = profileRes?.user?.id || user?.id;
      setStudentProfile(profileRes);

      if (!resolvedStudentId) {
        throw new Error('Student identifier could not be verified from authentication context.');
      }

      const selectedCareer = profile?.selectedCareer || '';

      // 2. Fetch parallel endpoints: goals analysis, progress dashboard, readiness, and roadmap
      const [goalsRes, progressRes, readinessRes, roadmapRes] = await Promise.allSettled([
        goalService.getGoals(resolvedStudentId),
        goalService.getProgressDashboard(resolvedStudentId),
        goalService.getPlacementReadiness(resolvedStudentId),
        selectedCareer ? goalService.getCareerRoadmap(selectedCareer) : Promise.resolve(null),
      ]);

      // Set goals from real backend response
      if (goalsRes.status === 'fulfilled' && goalsRes.value) {
        setGoals(goalsRes.value.goals || []);
      }

      // Set progress dashboard data (action plans)
      if (progressRes.status === 'fulfilled' && progressRes.value) {
        const pd = progressRes.value;
        if (pd.actionPlans?.items) {
          setActionPlans(pd.actionPlans.items);
        }
      }

      // Set placement readiness score
      if (readinessRes.status === 'fulfilled' && readinessRes.value) {
        setReadinessData(readinessRes.value);
      }

      // Set career roadmap
      if (roadmapRes.status === 'fulfilled' && roadmapRes.value) {
        setRoadmap(roadmapRes.value);
      } else {
        setRoadmap(null);
      }
    } catch (err) {
      console.error('Failed to load goal tracker data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load goal tracker data. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalData();
  }, [user?.id]);

  // ─────────────────────────────────────────────────────────────
  // 2. DETERMINISTIC DERIVED METRICS (Calculated from Real Records)
  // ─────────────────────────────────────────────────────────────

  // Active Goals: in-progress + pending
  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.status === 'in-progress' || g.status === 'pending');
  }, [goals]);

  const inProgressGoals = useMemo(() => {
    return goals.filter((g) => g.status === 'in-progress');
  }, [goals]);

  const pendingGoals = useMemo(() => {
    return goals.filter((g) => g.status === 'pending');
  }, [goals]);

  // Completed Goals
  const completedGoals = useMemo(() => {
    return goals.filter((g) => g.status === 'completed');
  }, [goals]);

  // Completion Percentage
  const completionRate = useMemo(() => {
    if (goals.length === 0) return 0;
    return Math.round((completedGoals.length / goals.length) * 100);
  }, [goals.length, completedGoals.length]);

  // Due This Week: Goals with real due dates occurring within the current week sprint
  const dueThisWeekGoals = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return goals.filter((g) => {
      if (g.status === 'completed' || !g.dueDate) return false;
      const due = new Date(g.dueDate);
      return due >= startOfWeek && due <= endOfWeek;
    });
  }, [goals]);

  // Overdue Goals: target completion date passed and not completed
  const overdueGoals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return goals.filter((g) => {
      if (g.status === 'completed' || !g.dueDate) return false;
      const due = new Date(g.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
  }, [goals]);

  // Immediate Priorities: Top active goals sorted by nearest due date
  const currentPriorities = useMemo(() => {
    return [...goals]
      .filter((g) => g.status !== 'completed')
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [goals]);

  // Filtered and Sorted Goals List for Workspace
  const filteredGoals = useMemo(() => {
    let result = [...goals];

    // Status Filter
    if (statusFilter === 'active') {
      result = result.filter((g) => g.status === 'in-progress' || g.status === 'pending');
    } else if (statusFilter === 'due-this-week') {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      result = result.filter((g) => {
        if (!g.dueDate) return false;
        const due = new Date(g.dueDate);
        return due >= startOfWeek && due <= endOfWeek;
      });
    } else if (statusFilter !== 'all') {
      result = result.filter((g) => g.status === statusFilter);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((g) => g.title.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'dueDateAsc') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      }
      if (sortBy === 'dueDateDesc') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
        return db - da;
      }
      if (sortBy === 'titleAsc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [goals, statusFilter, searchQuery, sortBy]);

  // ─────────────────────────────────────────────────────────────
  // 3. STATUS UPDATE HANDLER (PUT /api/goals/:goalId)
  // ─────────────────────────────────────────────────────────────
  const handleStatusChange = async (goalId, newStatus) => {
    if (updatingGoalId) return;
    setUpdatingGoalId(goalId);

    // Optimistic state backup
    const previousGoals = [...goals];

    // Apply optimistic update locally
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, status: newStatus } : g))
    );

    try {
      await goalService.updateGoalStatus(goalId, newStatus);
      setSuccessToast(`Goal marked as "${newStatus}".`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error('Failed to update goal status:', err);
      // Rollback on failure
      setGoals(previousGoals);
      alert(err.response?.data?.message || 'Failed to update goal status. Please try again.');
    } finally {
      setUpdatingGoalId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. CREATE GOAL SUBMISSION (POST /api/goals)
  // ─────────────────────────────────────────────────────────────
  const validateCreateForm = () => {
    const errors = {};
    if (!createFormData.title.trim()) {
      errors.title = 'Goal title is required.';
    } else if (createFormData.title.trim().length < 3) {
      errors.title = 'Goal title must be at least 3 characters.';
    }

    if (createFormData.dueDate) {
      const selected = new Date(createFormData.dueDate);
      if (isNaN(selected.getTime())) {
        errors.dueDate = 'Please select a valid date.';
      }
    }

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        goals: [createFormData.title.trim()],
      };
      if (createFormData.dueDate) {
        payload.dueDate = createFormData.dueDate;
      }

      await goalService.createWeeklyGoals(payload);

      setSuccessToast('New weekly goal added successfully!');
      setTimeout(() => setSuccessToast(null), 3500);

      // Reset form and close modal
      setCreateFormData({
        title: '',
        dueDate: '',
        status: 'in-progress',
      });
      setCreateFormErrors({});
      setIsCreateModalOpen(false);

      // Refresh goal data from server
      await fetchGoalData();
    } catch (err) {
      console.error('Failed to create goal:', err);
      setCreateFormErrors({
        submit: err.response?.data?.message || 'Failed to create goal. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateModal = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];

    setCreateFormData({
      title: '',
      dueDate: dateStr,
      status: 'in-progress',
    });
    setCreateFormErrors({});
    setIsCreateModalOpen(true);
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" size="sm" dot>
            Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="info" size="sm" pulseDot>
            In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" size="sm" dot>
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            {status}
          </Badge>
        );
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 5. LOADING & ERROR VIEWS
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 antialiased pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton variant="text" width="220px" height="28px" />
            <Skeleton variant="text" width="380px" height="16px" />
          </div>
          <Skeleton variant="rectangular" width="130px" height="40px" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="space-y-3">
          <Skeleton variant="text" width="180px" height="20px" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton variant="text" width="150px" height="20px" />
          <div className="space-y-2.5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error && goals.length === 0) {
    return (
      <ErrorState
        title="Unable to Load Goal Tracker"
        message={error}
        onRetry={fetchGoalData}
        retryText="Retry Loading Goals"
      />
    );
  }

  const selectedCareer = studentProfile?.profile?.selectedCareer;

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Goal Tracker
            </h1>
            <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
              Weekly Commitments
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Manage your weekly commitments, curriculum milestones, and deliberate skill-building
            tasks that directly power your campus placement readiness score.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGoalData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            title="Refresh goals from server"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm"
          >
            Create Goal
          </Button>
        </div>
      </div>

      {/* Placement Readiness Weighted Correlation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-900">
              Placement Readiness Correlation: Goal Completion Accounts for 30% of Overall Readiness
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Consistent execution of weekly goals signals sustained engineering discipline to campus
              placement algorithms and hiring recruiters.
            </p>
          </div>
        </div>
        {readinessData && (
          <div className="flex items-center gap-2 self-end md:self-center bg-white px-3 py-1.5 rounded-xl border border-blue-200/80 shadow-xs shrink-0">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] text-slate-500 font-medium">Platform Readiness:</span>
            <span className="text-xs font-bold text-blue-700 font-mono">
              {readinessData.readinessScore || 0}%
            </span>
            {readinessData.targetTier && (
              <Badge variant={readinessData.readinessScore >= 80 ? 'tier1' : 'neutral'} size="xs">
                {readinessData.targetTier}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DETERMINISTIC GOAL SUMMARY (Calculated from Real Records)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Goals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                Active Goals
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {activeGoals.length}
                </span>
                <Badge variant="neutral" size="sm">
                  {inProgressGoals.length} in-progress
                </Badge>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            {pendingGoals.length} pending kickoff
          </span>
        </div>

        {/* Card 2: Due This Week */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                Due This Week
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {dueThisWeekGoals.length}
                </span>
                <Badge variant={dueThisWeekGoals.length > 0 ? 'warning' : 'neutral'} size="sm">
                  Current Sprint
                </Badge>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Expiring by end of current week
          </span>
        </div>

        {/* Card 3: Completed Goals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col w-full">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                Completed Goals
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {completedGoals.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  of {goals.length} total ({completionRate}%)
                </span>
              </div>
              <div className="mt-2.5">
                <ProgressBar
                  value={completionRate}
                  max={100}
                  variant={completionRate >= 75 ? 'success' : 'primary'}
                  size="xs"
                />
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 4: Overdue Goals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                Overdue Deadlines
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
                    overdueGoals.length > 0 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {overdueGoals.length}
                </span>
                {overdueGoals.length > 0 ? (
                  <Badge variant="danger" size="sm">
                    Action Required
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    All Up to Date
                  </Badge>
                )}
              </div>
            </div>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                overdueGoals.length > 0
                  ? 'bg-rose-50 border border-rose-100 text-rose-600'
                  : 'bg-slate-50 border border-slate-100 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Target completion dates passed
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CURRENT PRIORITIES (Active Goals Ranked by Nearest Due Date)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Immediate Priorities
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              (Ranked by nearest deadline)
            </span>
          </div>
          {currentPriorities.length > 0 && (
            <span className="text-xs font-medium text-slate-500">
              {currentPriorities.length} critical focus item{currentPriorities.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {currentPriorities.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-500 stroke-[1.5]" />}
            title="No Pending High-Priority Deadlines"
            description="You have completed all active commitments or have no goals scheduled. Create a new weekly goal to keep progressing."
            action={
              <Button
                variant="outline"
                size="xs"
                onClick={handleOpenCreateModal}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Weekly Goal
              </Button>
            }
            compact
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentPriorities.map((goal) => {
              const deadline = getDeadlineInfo(goal.dueDate, goal.status);
              const isUpdating = updatingGoalId === goal.id;

              return (
                <div
                  key={goal.id}
                  className={`
                    p-4 rounded-2xl bg-white border transition-all duration-150 flex flex-col justify-between gap-3 shadow-card hover:shadow-card-hover
                    ${deadline.isOverdue ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/90'}
                  `}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      {renderStatusBadge(goal.status)}
                      <Badge variant={deadline.variant} size="xs">
                        {deadline.text}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 tracking-tight leading-snug line-clamp-2">
                      {goal.title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(goal.dueDate)}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="xs"
                      disabled={isUpdating}
                      isLoading={isUpdating}
                      onClick={() => handleStatusChange(goal.id, 'completed')}
                      leftIcon={<Check className="w-3 h-3 text-emerald-600" />}
                      className="text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. SEMESTER GOALS & ROADMAP MILESTONES (Real Backend Data)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Curriculum &amp; Semester Milestones
            </h2>
          </div>
          {selectedCareer ? (
            <Badge variant="neutral" size="sm" className="max-w-xs truncate">
              Track: {selectedCareer}
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              No Track Selected
            </Badge>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800">
                {roadmap?.career || (selectedCareer ? `${selectedCareer} Roadmap` : 'Curriculum Roadmap')}
              </span>
              <p className="text-[11px] text-slate-500">
                Semester phases mapped from Department Curriculum &amp; Placement Syllabi
              </p>
            </div>
            <Link
              to="/student/career-compass"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 self-start sm:self-center"
            >
              <span>View Career Compass</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Roadmap Steps from SemesterPlan model */}
          {roadmap?.steps && roadmap.steps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roadmap.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3 text-xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-blue-600 font-bold flex items-center justify-center shrink-0 shadow-2xs text-[11px] font-mono">
                    {idx + 1}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-semibold text-slate-800 leading-snug">
                      {step}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Curriculum Requirement • Semester Benchmark
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderX className="w-6 h-6 text-slate-400" />}
              title="No Semester Milestones Configured"
              description={
                selectedCareer
                  ? `No formal semester plans configured for track: ${selectedCareer}.`
                  : 'Select an accredited career track in your profile to load curriculum and semester benchmarks.'
              }
              action={
                <Button
                  as={Link}
                  to="/student/profile"
                  variant="outline"
                  size="xs"
                >
                  Configure Career Track
                </Button>
              }
              compact
            />
          )}

          {/* Targeted Action Plans (from Diagnostic Weak Skills Model) */}
          {actionPlans.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Diagnostic Action Tasks (Targeted Remediation)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {actionPlans.map((ap, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-indigo-950">
                        Skill Gap: {ap.weakSkill}
                      </span>
                      <span className="text-[11px] text-indigo-800">
                        Task: {ap.recommendedTask}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setCreateFormData({
                          title: `Address ${ap.weakSkill}: ${ap.recommendedTask}`,
                          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                          status: 'in-progress',
                        });
                        setIsCreateModalOpen(true);
                      }}
                      className="shrink-0 text-[10px] bg-white"
                    >
                      + Adopt
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. WEEKLY GOALS WORKING AREA (CRUD & Filter Strip)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Weekly Goal Workspace
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              ({filteredGoals.length} displayed)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="dueDateAsc">Due: Soonest First</option>
              <option value="dueDateDesc">Due: Latest First</option>
              <option value="titleAsc">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Strip with Real Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Goals', count: goals.length },
            { id: 'active', label: 'Active', count: activeGoals.length },
            { id: 'due-this-week', label: 'Due This Week', count: dueThisWeekGoals.length },
            { id: 'in-progress', label: 'In Progress', count: inProgressGoals.length },
            { id: 'pending', label: 'Pending', count: pendingGoals.length },
            { id: 'completed', label: 'Completed', count: completedGoals.length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span
                  className={`
                    px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold
                    ${isActive ? 'bg-blue-700/60 text-white' : 'bg-slate-100 text-slate-600'}
                  `}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Goal Items List */}
        {filteredGoals.length === 0 ? (
          <EmptyState
            icon={<Target className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
            title={
              searchQuery
                ? `No goals matching "${searchQuery}"`
                : statusFilter !== 'all'
                ? `No goals under "${statusFilter}"`
                : 'No Weekly Goals Recorded'
            }
            description={
              searchQuery
                ? 'Try refining your search term or clear the filter.'
                : 'Set weekly goals to maintain progress towards your semester benchmarks and placement readiness.'
            }
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Your First Goal
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {filteredGoals.map((goal) => {
              const deadline = getDeadlineInfo(goal.dueDate, goal.status);
              const isUpdating = updatingGoalId === goal.id;
              const isDone = goal.status === 'completed';

              return (
                <div
                  key={goal.id}
                  className={`
                    p-4 rounded-2xl bg-white border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card hover:shadow-card-hover
                    ${isDone ? 'bg-slate-50/60 border-slate-200/70' : 'border-slate-200/90'}
                  `}
                >
                  {/* Left: Checkbox & Goal Title & Date */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleStatusChange(
                          goal.id,
                          isDone ? 'in-progress' : 'completed'
                        )
                      }
                      title={isDone ? 'Reopen goal' : 'Mark goal complete'}
                      className={`
                        w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 mt-0.5 sm:mt-0
                        ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 hover:border-blue-600 bg-white'
                        }
                        ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                      `}
                    >
                      {isDone && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </button>

                    <div className="flex flex-col gap-1 min-w-0">
                      <span
                        className={`text-sm font-semibold tracking-tight leading-snug line-clamp-2 ${
                          isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {goal.title}
                      </span>

                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(goal.dueDate)}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <Badge variant={deadline.variant} size="xs">
                          {deadline.text}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status selector & action controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {renderStatusBadge(goal.status)}

                    {/* Quick Status Dropdown using confirmed PUT /api/goals/:goalId */}
                    <select
                      value={goal.status}
                      disabled={isUpdating}
                      onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                      className={`
                        text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors focus:outline-none focus:border-blue-600
                        ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-slate-300'}
                      `}
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CREATE GOAL MODAL (Dispatches POST /api/goals)
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="Create New Weekly Goal"
        description="Add a measurable goal for this sprint. Weekly goal completions directly update your placement readiness score."
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          {createFormErrors.submit && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{createFormErrors.submit}</span>
            </div>
          )}

          {/* Goal Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Goal Title</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Redis caching and rate-limiting for user auth API"
              value={createFormData.title}
              onChange={(e) =>
                setCreateFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={`
                w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border px-3.5 py-2.5 transition-colors focus:outline-none
                ${
                  createFormErrors.title
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                }
              `}
            />
            {createFormErrors.title && (
              <p className="text-xs text-rose-600 font-medium">{createFormErrors.title}</p>
            )}
          </div>

          {/* Target Due Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Target Completion Date</span>
              <span className="text-slate-400 font-normal">(Default: 7 days)</span>
            </label>
            <input
              type="date"
              value={createFormData.dueDate}
              onChange={(e) =>
                setCreateFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 hover:border-slate-300"
            />
            {createFormErrors.dueDate && (
              <p className="text-xs text-rose-600 font-medium">{createFormErrors.dueDate}</p>
            )}
          </div>

          {/* Initial Status */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Initial Status
            </label>
            <select
              value={createFormData.status}
              onChange={(e) =>
                setCreateFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
            >
              <option value="in-progress">In Progress (Active now)</option>
              <option value="pending">Pending (Scheduled for later this week)</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              loadingText="Creating..."
            >
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GoalTrackerPage;

import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import goalService from '../../services/goalService';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import {
  enrichGoal,
  saveGoalEnrichment,
  deleteGoalEnrichment
} from '../../utils/goalStorage';
import {
  GoalsHeader,
  GoalSummary,
  GoalFilters,
  GoalList,
  GoalFormModal,
  ProgressUpdateModal,
  GoalDetailsModal,
} from '../../components/student/goals';

export const GoalTrackerPage = () => {
  const { user } = useAuth();

  // Primary Data States
  const [rawGoals, setRawGoals] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [actionPlans, setActionPlans] = useState([]);

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updatingGoalId, setUpdatingGoalId] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filtering & Search
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'all' | 'overdue'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'dueDateAsc' | 'priority' | 'progress' | 'title'

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedProgressGoal, setSelectedProgressGoal] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsGoal, setSelectedDetailsGoal] = useState(null);

  // Show toast notification
  const showToast = (message) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. DATA FETCHING (Authenticated Student)
  // ─────────────────────────────────────────────────────────────
  const fetchGoalData = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    else setIsRefreshing(true);
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
        setRawGoals(goalsRes.value.goals || []);
      }

      // Set progress dashboard data
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGoalData();
  }, [user?.id]);

  // ─────────────────────────────────────────────────────────────
  // 2. ENRICHED GOALS & DETERMINISTIC DERIVED METRICS
  // ─────────────────────────────────────────────────────────────
  const enrichedGoals = useMemo(() => {
    return rawGoals.map((g) => enrichGoal(g));
  }, [rawGoals]);

  // Active Goals: in-progress + pending
  const activeGoals = useMemo(() => {
    return enrichedGoals.filter((g) => g.status === 'in-progress' || g.status === 'pending');
  }, [enrichedGoals]);

  // Completed Goals
  const completedGoals = useMemo(() => {
    return enrichedGoals.filter((g) => g.status === 'completed');
  }, [enrichedGoals]);

  // Due This Week: Goals with due dates occurring within the current week sprint
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

    return enrichedGoals.filter((g) => {
      if (g.status === 'completed' || !g.dueDate) return false;
      const due = new Date(g.dueDate);
      return due >= startOfWeek && due <= endOfWeek;
    });
  }, [enrichedGoals]);

  // Overdue Goals
  const overdueGoals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return enrichedGoals.filter((g) => {
      if (g.status === 'completed' || !g.dueDate) return false;
      const due = new Date(g.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
  }, [enrichedGoals]);

  // Completion Percentage
  const completionRate = useMemo(() => {
    if (enrichedGoals.length === 0) return 0;
    return Math.round((completedGoals.length / enrichedGoals.length) * 100);
  }, [enrichedGoals.length, completedGoals.length]);

  // Counts for filter tabs
  const tabCounts = useMemo(() => {
    return {
      active: activeGoals.length,
      completed: completedGoals.length,
      all: enrichedGoals.length,
      overdue: overdueGoals.length,
    };
  }, [activeGoals.length, completedGoals.length, enrichedGoals.length, overdueGoals.length]);

  // Filtered & Sorted Goals for Main Display
  const displayedGoals = useMemo(() => {
    let result = [...enrichedGoals];

    // Status Tab Filter
    if (activeTab === 'active') {
      result = result.filter((g) => g.status !== 'completed');
    } else if (activeTab === 'completed') {
      result = result.filter((g) => g.status === 'completed');
    } else if (activeTab === 'overdue') {
      result = result.filter((g) => g.deadlineInfo?.isOverdue && g.status !== 'completed');
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.cleanTitle.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          (g.description && g.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'default') {
        // Priority 1: Overdue
        const aOverdue = a.deadlineInfo?.isOverdue && a.status !== 'completed' ? 1 : 0;
        const bOverdue = b.deadlineInfo?.isOverdue && b.status !== 'completed' ? 1 : 0;
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;

        // Priority 2: Due Soon (diffDays <= 2)
        const aDueSoon = a.deadlineInfo?.isDueSoon && a.status !== 'completed' ? 1 : 0;
        const bDueSoon = b.deadlineInfo?.isDueSoon && b.status !== 'completed' ? 1 : 0;
        if (aDueSoon !== bDueSoon) return bDueSoon - aDueSoon;

        // Priority 3: High Priority
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        const aPri = priorityWeight[a.priority] || 2;
        const bPri = priorityWeight[b.priority] || 2;
        if (aPri !== bPri) return bPri - aPri;

        // Fallback: nearest due date
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      }

      if (sortBy === 'dueDateAsc') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      }

      if (sortBy === 'priority') {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
      }

      if (sortBy === 'progress') {
        return (b.progress || 0) - (a.progress || 0);
      }

      if (sortBy === 'title') {
        return a.cleanTitle.localeCompare(b.cleanTitle);
      }

      return 0;
    });

    return result;
  }, [enrichedGoals, activeTab, searchQuery, sortBy]);

  // ─────────────────────────────────────────────────────────────
  // 3. HANDLERS (CRUD & Progressive Updates)
  // ─────────────────────────────────────────────────────────────

  // Toggle goal status (completed <-> in-progress)
  const handleToggleStatus = async (goalId, newStatus) => {
    if (updatingGoalId) return;
    setUpdatingGoalId(goalId);

    // Optimistic state backup
    const previousGoals = [...rawGoals];

    // Optimistically update
    setRawGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, status: newStatus } : g))
    );

    // Synchronize local enrichment
    saveGoalEnrichment(goalId, {
      progress: newStatus === 'completed' ? 100 : 50,
    });

    try {
      await goalService.updateGoalStatus(goalId, newStatus);
      showToast(newStatus === 'completed' ? 'Goal marked as complete! 🎉' : 'Goal reopened to in-progress.');
      fetchGoalData(true);
    } catch (err) {
      console.error('Failed to update goal status:', err);
      setRawGoals(previousGoals);
      alert(err.response?.data?.message || 'Failed to update goal status.');
    } finally {
      setUpdatingGoalId(null);
    }
  };

  // Open Create Goal Modal
  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Goal Modal
  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setIsFormModalOpen(true);
  };

  // Submit Goal Form (Create or Edit)
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingGoal) {
        // Edit existing goal
        await goalService.editGoal(editingGoal.id, {
          title: formData.title.trim(),
          dueDate: formData.dueDate,
          status: formData.status,
        });

        saveGoalEnrichment(editingGoal.id, {
          category: formData.category,
          priority: formData.priority,
          description: formData.description,
        });

        showToast('Goal updated successfully!');
      } else {
        // Create new goal
        const payload = {
          userId: user?.id,
          goals: [formData.title.trim()],
          dueDate: formData.dueDate,
        };

        const res = await goalService.createWeeklyGoals(payload);
        const createdId = res?.goals?.[0]?._id || res?.goals?.[0]?.id;

        if (createdId) {
          saveGoalEnrichment(createdId, {
            category: formData.category,
            priority: formData.priority,
            initialMilestone: formData.initialMilestone,
            description: formData.description,
            progress: 0,
          });
        }

        showToast('New weekly goal added!');
      }

      setIsFormModalOpen(false);
      setEditingGoal(null);
      await fetchGoalData(true);
    } catch (err) {
      console.error('Failed to save goal:', err);
      alert(err.response?.data?.message || 'Failed to save goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Progress Update Modal
  const handleOpenProgressModal = (goal) => {
    setSelectedProgressGoal(goal);
    setIsProgressModalOpen(true);
  };

  // Save Progress Update
  const handleSaveProgress = async (goalId, progressVal, statusVal, milestonesVal) => {
    setIsSubmitting(true);
    try {
      saveGoalEnrichment(goalId, {
        progress: progressVal,
        milestones: milestonesVal,
      });

      // If status changed or completed
      const currentGoal = rawGoals.find((g) => g.id === goalId);
      if (currentGoal && currentGoal.status !== statusVal) {
        await goalService.updateGoalStatus(goalId, statusVal);
      }

      showToast(`Progress updated to ${progressVal}%.`);
      setIsProgressModalOpen(false);
      setSelectedProgressGoal(null);
      await fetchGoalData(true);
    } catch (err) {
      console.error('Failed to save progress:', err);
      alert(err.response?.data?.message || 'Failed to update progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Details Modal
  const handleOpenDetailsModal = (goal) => {
    setSelectedDetailsGoal(goal);
    setIsDetailsModalOpen(true);
  };

  // Delete Goal
  const handleDeleteGoal = async (goal) => {
    if (!window.confirm(`Are you sure you want to delete the goal "${goal.cleanTitle}"?`)) {
      return;
    }

    try {
      await goalService.deleteGoal(goal.id);
      deleteGoalEnrichment(goal.id);
      showToast('Goal deleted.');
      if (selectedDetailsGoal?.id === goal.id) {
        setIsDetailsModalOpen(false);
        setSelectedDetailsGoal(null);
      }
      await fetchGoalData(true);
    } catch (err) {
      console.error('Failed to delete goal:', err);
      alert(err.response?.data?.message || 'Failed to delete goal.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. LOADING & ERROR VIEWS
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="space-y-3">
          <Skeleton variant="rectangular" width="100%" height="44px" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && rawGoals.length === 0) {
    return (
      <ErrorState
        title="Unable to Load Goals"
        message={error}
        onRetry={() => fetchGoalData()}
        retryText="Retry Loading Goals"
      />
    );
  }

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
      <GoalsHeader
        onOpenCreate={handleOpenCreateModal}
        onRefresh={() => fetchGoalData(true)}
        isRefreshing={isRefreshing}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. GOAL SUMMARY (Max 4 compact values)
      ───────────────────────────────────────────────────────────── */}
      <GoalSummary
        activeCount={activeGoals.length}
        dueThisWeekCount={dueThisWeekGoals.length}
        completedCount={completedGoals.length}
        completionRate={completionRate}
        totalCount={enrichedGoals.length}
      />

      {/* ─────────────────────────────────────────────────────────────
          3. FILTER / STATUS TABS & SEARCH
      ───────────────────────────────────────────────────────────── */}
      <GoalFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={tabCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. ACTIVE GOAL LIST & COMPLETED ARCHIVE
      ───────────────────────────────────────────────────────────── */}
      <GoalList
        goals={displayedGoals}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onToggleStatus={handleToggleStatus}
        onUpdateProgress={handleOpenProgressModal}
        onViewDetails={handleOpenDetailsModal}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteGoal}
        onOpenCreate={handleOpenCreateModal}
        updatingGoalId={updatingGoalId}
      />

      {/* ─────────────────────────────────────────────────────────────
          MODALS & DRAWERS
      ───────────────────────────────────────────────────────────── */}

      {/* Create / Edit Goal Modal */}
      <GoalFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialGoal={editingGoal}
        isSubmitting={isSubmitting}
      />

      {/* Fast Progress Update Modal */}
      <ProgressUpdateModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        goal={selectedProgressGoal}
        onSaveProgress={handleSaveProgress}
        isSubmitting={isSubmitting}
      />

      {/* Deep Details & History Modal */}
      <GoalDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        goal={selectedDetailsGoal}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteGoal}
        onUpdateProgress={handleOpenProgressModal}
        onToggleStatus={handleToggleStatus}
        isUpdating={updatingGoalId === selectedDetailsGoal?.id}
      />
    </div>
  );
};

export default GoalTrackerPage;

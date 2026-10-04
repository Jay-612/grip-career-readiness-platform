import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import actionPlanService from '../../services/actionPlanService';
import goalService from '../../services/goalService';
import guidanceService from '../../services/guidanceService';
import mentorService from '../../services/mentorService';
import {
  GuidanceHeader,
  ActivePlanSummary,
  RemedialTaskList,
  TaskDetailsDrawer,
  SubmissionModal,
  CompletedPlansAccordion,
  AskGuidanceModal,
  StudentInquiriesSection,
} from '../../components/student/guidance';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import { CheckCircle2, ShieldAlert, Award, MessageSquare } from 'lucide-react';

export const GuidancePage = () => {
  const { user } = useAuth();
  const studentId = user?.id || user?._id;

  // Master Data States
  const [actionPlans, setActionPlans] = useState([]);
  const [remedialGoals, setRemedialGoals] = useState([]);
  const [guidanceRequests, setGuidanceRequests] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [alumniList, setAlumniList] = useState([]);

  // Top Page Tab: 'questions' (My Questions) | 'remedial' (Remedial Plans)
  const [activeMainTab, setActiveMainTab] = useState('questions');

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Ask Guidance Modal & Thread States
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isSubmittingGuidance, setIsSubmittingGuidance] = useState(false);
  const [isReplyingInquiry, setIsReplyingInquiry] = useState(false);
  const [isResolvingInquiry, setIsResolvingInquiry] = useState(false);

  // Active Filter: 'active' | 'completed' | 'all'
  const [activeFilter, setActiveFilter] = useState('active');

  // Progressive Disclosure: Drawer & Modal
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState(null);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // 1. DATA LOADING: Action Plans, Remedial Goals, Mentors
  // ─────────────────────────────────────────────────────────────
  const loadGuidanceData = useCallback(async (isRefresh = false) => {
    if (!studentId) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Concurrently query action-plans for student, guidance submissions, faculty mentors, and alumni mentors
      const [plansRes, goalsRes, guidanceRes, facultyRes, alumniRes] = await Promise.allSettled([
        actionPlanService.getMyActionPlans(),
        goalService.getGoals(studentId, 'all'),
        guidanceService.getRequests(1, 50),
        guidanceService.getFacultyMentors(),
        guidanceService.getAlumniMentors(),
      ]);

      // 1. Action plans
      if (plansRes.status === 'fulfilled' && plansRes.value) {
        const plans = plansRes.value.actionPlans || [];
        setActionPlans(plans);

        if (Array.isArray(plansRes.value.remedialGoals)) {
          setRemedialGoals(plansRes.value.remedialGoals);
        }
      }

      // 2. Fallback goals query if remedial goals not populated
      if (goalsRes.status === 'fulfilled' && goalsRes.value) {
        const rawGoals = Array.isArray(goalsRes.value)
          ? goalsRes.value
          : goalsRes.value.goals || [];
        const remedials = rawGoals.filter((g) => g.isRemedial || g.source === 'action_plan');
        if (remedials.length > 0) {
          setRemedialGoals(remedials);
        }
      }

      // 3. Guidance submissions & replies
      if (guidanceRes.status === 'fulfilled' && guidanceRes.value) {
        const requests = Array.isArray(guidanceRes.value)
          ? guidanceRes.value
          : guidanceRes.value.requests || [];
        setGuidanceRequests(requests);
      }

      // 4. Dynamic Faculty List
      if (facultyRes.status === 'fulfilled' && Array.isArray(facultyRes.value)) {
        setFacultyList(facultyRes.value);
      }

      // 5. Dynamic Alumni List
      if (alumniRes.status === 'fulfilled' && Array.isArray(alumniRes.value)) {
        setAlumniList(alumniRes.value);
      }
    } catch (err) {
      console.error('Failed to load remedial guidance data:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load remedial guidance plans. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadGuidanceData();
  }, [loadGuidanceData]);

  // ─────────────────────────────────────────────────────────────
  // 2. DERIVED DATA & UNIFIED REMEDIAL TASK MODEL
  // ─────────────────────────────────────────────────────────────
  const {
    activePlan,
    archivedPlans,
    unifiedActiveTasks,
    unifiedCompletedTasks,
    allTasksCount,
    completedTasksCount,
    nextDeadline,
  } = useMemo(() => {
    // Separate active action plan from completed / archived plans
    const active = actionPlans.find((p) => p.status === 'assigned' || p.status === 'in-progress');
    const archived = actionPlans.filter(
      (p) => p.status === 'completed' || (active && p._id !== active._id)
    );

    // Build map of guidance requests and replies for task matching
    // Matches by goalId or task title keywords
    const submissionMap = new Map();
    guidanceRequests.forEach((req) => {
      const q = req.question || '';
      const replies = req.replies || (req.latestReply ? [req.latestReply] : []);
      
      // Determine submission state
      let submissionStatus = 'submitted';
      let feedback = null;

      replies.forEach((rep) => {
        const text = rep.answerText || '';
        if (text.includes('Rework Requested') || text.includes('⚠️')) {
          submissionStatus = 'rework';
          feedback = text.replace(/^⚠️\s*Rework Requested:\s*/i, '').trim();
        } else if (text.includes('Approved') || text.includes('✓')) {
          submissionStatus = 'approved';
          feedback = text.replace(/^✓\s*Task Completion Approved:\s*/i, '').trim();
        } else if (!feedback) {
          feedback = text;
        }
      });

      // Extract repository / link
      const linkMatch = q.match(/(https?:\/\/[^\s]+)/);
      const link = linkMatch ? linkMatch[1] : '';

      submissionMap.set(req.id || req._id, {
        requestId: req.id || req._id,
        status: submissionStatus,
        feedback,
        link,
        submissionText: q,
        submittedAt: req.date || req.createdAt,
      });
    });

    // Helper: Find matching submission for a task title or goal
    const findSubmission = (title, goalId) => {
      if (!title) return null;
      const cleanTitle = title.replace(/^\[Action Plan: Mock Remedial\]\s*/i, '').toLowerCase().trim();

      for (const req of guidanceRequests) {
        const q = (req.question || '').toLowerCase();
        // Check for remedial submission tag or specific task keyword matching
        if (
          q.includes(`[remedial submission: ${cleanTitle}]`) ||
          q.includes(`remedial submission: ${cleanTitle}`) ||
          (cleanTitle.includes('rest api') && q.includes('rest api remedial task submission')) ||
          (cleanTitle.includes('concurrency') && q.includes('schema concurrency'))
        ) {
          return submissionMap.get(req.id || req._id);
        }
      }
      return null;
    };

    // Synthesize tasks from active plan's tasks array or remedial goals
    const rawPlanTasks = active?.tasks && active.tasks.length > 0
      ? active.tasks
      : active?.recommendedTasks && active.recommendedTasks.length > 0
      ? active.recommendedTasks
      : [];

    let taskItems = [];

    if (rawPlanTasks.length > 0) {
      taskItems = rawPlanTasks.map((t, idx) => {
        const title = t.title || t.task || `Remedial Task #${idx + 1}`;
        const cleanTitle = title.replace(/^\[Action Plan: Mock Remedial\]\s*/i, '').trim();
        const goal = remedialGoals.find(
          (g) =>
            (t.assignedGoalId && g._id === t.assignedGoalId.toString()) ||
            g.title.toLowerCase().includes(cleanTitle.toLowerCase())
        );

        const sub = findSubmission(cleanTitle, goal?._id);
        const isGoalDone = goal?.status === 'completed';
        const isApproved = sub?.status === 'approved';

        const finalStatus = isGoalDone || isApproved ? 'completed' : goal?.status || 'in-progress';
        const dueDate = t.targetDate || t.dueDate || goal?.dueDate;

        // Resource link extraction or default guide
        const resources = [];
        if (cleanTitle.toLowerCase().includes('api')) {
          resources.push({
            title: 'REST API Design & Error Guidelines (RFC 7807)',
            url: 'https://www.rfc-editor.org/rfc/rfc7807',
          });
        }
        if (cleanTitle.toLowerCase().includes('concurrency') || cleanTitle.toLowerCase().includes('database')) {
          resources.push({
            title: 'Optimistic Concurrency Control in Distributed Databases',
            url: 'https://en.wikipedia.org/wiki/Optimistic_concurrency_control',
          });
        }
        if (cleanTitle.toLowerCase().includes('saga') || cleanTitle.toLowerCase().includes('transaction')) {
          resources.push({
            title: 'Saga Pattern for Distributed Transactions',
            url: 'https://microservices.io/patterns/data/saga.html',
          });
        }
        if (cleanTitle.toLowerCase().includes('sharding')) {
          resources.push({
            title: 'Database Sharding Architecture & Re-balancing',
            url: 'https://aws.amazon.com/what-is/database-sharding/',
          });
        }

        // Priority calculation for ordering
        // 1. Overdue, 2. Rework, 3. Due Soon, 4. In Progress, 5. Completed
        const now = Date.now();
        const dueTime = dueDate ? new Date(dueDate).getTime() : now + 7 * 86400000;
        const isOverdue = dueTime < now && finalStatus !== 'completed';
        const isDueSoon = !isOverdue && dueTime - now < 3 * 86400000 && finalStatus !== 'completed';
        const isRework = sub?.status === 'rework';

        let priorityRank = 4;
        let priorityCategory = 'in-progress';

        if (finalStatus === 'completed') {
          priorityRank = 5;
          priorityCategory = 'completed';
        } else if (isOverdue) {
          priorityRank = 1;
          priorityCategory = 'overdue';
        } else if (isRework) {
          priorityRank = 2;
          priorityCategory = 'rework';
        } else if (isDueSoon) {
          priorityRank = 3;
          priorityCategory = 'due-soon';
        }

        return {
          id: t._id || `task-${idx}`,
          goalId: goal?._id,
          title: cleanTitle,
          description: t.task || t.description || active?.facultyFeedback || 'Complete required remedial exercise.',
          dueDate,
          category: t.category || 'technical',
          status: finalStatus,
          priorityRank,
          priorityCategory,
          submission: sub,
          resources,
          facultyFeedback: active?.facultyFeedback,
        };
      });
    } else if (remedialGoals.length > 0) {
      // Fallback: If action plan has no task array, synthesize directly from remedial weekly goals
      taskItems = remedialGoals.map((g, idx) => {
        const cleanTitle = g.title.replace(/^\[Action Plan: Mock Remedial\]\s*/i, '').trim();
        const sub = findSubmission(cleanTitle, g._id);
        const isCompleted = g.status === 'completed' || sub?.status === 'approved';
        const dueDate = g.dueDate;

        const now = Date.now();
        const dueTime = dueDate ? new Date(dueDate).getTime() : now + 7 * 86400000;
        const isOverdue = dueTime < now && !isCompleted;
        const isDueSoon = !isOverdue && dueTime - now < 3 * 86400000 && !isCompleted;
        const isRework = sub?.status === 'rework';

        let priorityRank = 4;
        let priorityCategory = 'in-progress';

        if (isCompleted) {
          priorityRank = 5;
          priorityCategory = 'completed';
        } else if (isOverdue) {
          priorityRank = 1;
          priorityCategory = 'overdue';
        } else if (isRework) {
          priorityRank = 2;
          priorityCategory = 'rework';
        } else if (isDueSoon) {
          priorityRank = 3;
          priorityCategory = 'due-soon';
        }

        return {
          id: g._id || `goal-${idx}`,
          goalId: g._id,
          title: cleanTitle,
          description: `Action assigned following interview evaluation. Target deadline: ${new Date(dueDate).toLocaleDateString()}.`,
          dueDate,
          category: g.category || 'remedial',
          status: isCompleted ? 'completed' : g.status,
          priorityRank,
          priorityCategory,
          submission: sub,
          resources: [
            {
              title: 'Curriculum Remedial Guidelines',
              url: 'https://github.com',
            },
          ],
          facultyFeedback: active?.facultyFeedback,
        };
      });
    }

    // Sort strictly by Priority:
    // Overdue (1) -> Rework (2) -> Due Soon (3) -> In Progress (4) -> Completed (5)
    // Within same priority, sort by nearest due date
    const sortedTasks = [...taskItems].sort((a, b) => {
      if (a.priorityRank !== b.priorityRank) {
        return a.priorityRank - b.priorityRank;
      }
      const timeA = new Date(a.dueDate || 0).getTime();
      const timeB = new Date(b.dueDate || 0).getTime();
      return timeA - timeB;
    });

    const activeList = sortedTasks.filter((t) => t.status !== 'completed');
    const completedList = sortedTasks.filter((t) => t.status === 'completed');

    // Nearest active deadline
    const pendingDeadlines = activeList
      .map((t) => (t.dueDate ? new Date(t.dueDate).getTime() : null))
      .filter(Boolean);
    const nearest = pendingDeadlines.length > 0 ? Math.min(...pendingDeadlines) : null;

    return {
      activePlan: active,
      archivedPlans: archived,
      unifiedActiveTasks: activeList,
      unifiedCompletedTasks: completedList,
      allTasksCount: sortedTasks.length,
      completedTasksCount: completedList.length,
      nextDeadline: nearest ? new Date(nearest) : null,
    };
  }, [actionPlans, remedialGoals, guidanceRequests]);

  // ─────────────────────────────────────────────────────────────
  // 3. SUBMISSION HANDLERS (URL, GitHub repo, Comment / Note)
  // ─────────────────────────────────────────────────────────────
  const handleOpenSubmitModal = (task) => {
    setSelectedTaskForSubmission(task);
  };

  const handleCloseSubmitModal = () => {
    setSelectedTaskForSubmission(null);
  };

  const handleOpenTaskDetails = (task) => {
    setSelectedTaskForDetails(task);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTaskForDetails(null);
  };

  const handleSaveSubmission = async ({
    taskId,
    goalId,
    taskTitle,
    submissionLink,
    comments,
  }) => {
    setIsSubmittingWork(true);
    try {
      // 1. Submit guidance question via existing API with targetType: 'faculty'
      const formattedSubmission = `[Remedial Submission: ${taskTitle}]\n${comments ? comments + '\n\n' : ''}${
        submissionLink ? `Evidence Repository:\n${submissionLink}` : ''
      }`.trim();

      const evaluatorFacultyId = activePlan?.evaluatorId?._id || activePlan?.evaluatorId;

      await guidanceService.createRequest(
        formattedSubmission,
        'faculty',
        evaluatorFacultyId || null
      );

      // 2. Mark goal as in-progress or completed if goalId exists
      if (goalId) {
        try {
          await goalService.updateGoalStatus(goalId, 'in-progress');
        } catch (err) {
          console.warn('Goal status update notice:', err.message);
        }
      }

      setSuccessToast(`Work for "${taskTitle}" has been submitted for faculty review!`);
      setTimeout(() => setSuccessToast(null), 4000);

      // Close modal and refresh list
      handleCloseSubmitModal();
      await loadGuidanceData(true);
    } catch (err) {
      console.error('Failed to submit remedial work:', err);
      alert(
        err.response?.data?.message ||
          'Failed to submit work for review. Please check your network connection.'
      );
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3b. STUDENT FACULTY GUIDANCE INQUIRIES & REPLIES
  // ─────────────────────────────────────────────────────────────
  const handleOpenAskModal = () => {
    setIsAskModalOpen(true);
  };

  const handleCloseAskModal = () => {
    setIsAskModalOpen(false);
  };

  const handleCreateGuidanceInquiry = async ({
    recipientType = 'faculty',
    targetFacultyId = null,
    targetAlumniId = null,
    facultyName = '',
    alumniName = '',
    topic,
    question,
  }) => {
    setIsSubmittingGuidance(true);
    try {
      await guidanceService.createRequest({
        question,
        targetType: recipientType,
        recipientType,
        targetFacultyId: recipientType === 'faculty' ? targetFacultyId : null,
        targetAlumniId: recipientType === 'alumni' ? targetAlumniId : null,
        topic,
      });

      const recipientDisplayName = recipientType === 'faculty' ? facultyName || 'Faculty Member' : alumniName || 'Alumni Mentor';
      setSuccessToast(`Your guidance question was sent to ${recipientDisplayName}!`);
      setTimeout(() => setSuccessToast(null), 4000);
      setIsAskModalOpen(false);
      setActiveMainTab('questions');
      await loadGuidanceData(true);
    } catch (err) {
      console.error('Failed to submit guidance question:', err);
      alert(
        err.response?.data?.message ||
          'Failed to send guidance question. Please check your network connection.'
      );
    } finally {
      setIsSubmittingGuidance(false);
    }
  };

  const handleFollowUpReply = async (requestId, answerText) => {
    setIsReplyingInquiry(true);
    try {
      await guidanceService.replyRequest(requestId, answerText);
      setSuccessToast('Your follow-up question was posted!');
      setTimeout(() => setSuccessToast(null), 3000);
      await loadGuidanceData(true);
    } catch (err) {
      console.error('Failed to post follow-up reply:', err);
      alert(err.response?.data?.message || 'Failed to submit follow-up reply.');
    } finally {
      setIsReplyingInquiry(false);
    }
  };

  const handleResolveInquiry = async (requestId) => {
    setIsResolvingInquiry(true);
    try {
      await guidanceService.resolveRequest(requestId);
      setSuccessToast('Guidance inquiry marked as resolved! 🎉');
      setTimeout(() => setSuccessToast(null), 3000);
      await loadGuidanceData(true);
    } catch (err) {
      console.error('Failed to resolve guidance request:', err);
      alert(err.response?.data?.message || 'Failed to resolve inquiry.');
    } finally {
      setIsResolvingInquiry(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. RENDERING: LOADING & ERROR STATES
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
        <div className="space-y-2">
          <Skeleton variant="text" width="220px" height="28px" />
          <Skeleton variant="text" width="400px" height="16px" />
        </div>
        <SkeletonCard />
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && actionPlans.length === 0) {
    return (
      <div className="max-w-5xl mx-auto pt-6">
        <ErrorState
          title="Unable to Load Remedial Guidance"
          message={error}
          onRetry={() => loadGuidanceData(false)}
          retryText="Retry Loading"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 antialiased max-w-5xl mx-auto" data-testid="student-guidance-page">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <GuidanceHeader
        onRefresh={() => loadGuidanceData(true)}
        isRefreshing={isRefreshing}
        onAskGuidance={handleOpenAskModal}
      />

      {/* TOP-LEVEL TABS: [My Questions] [Remedial Plans] */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveMainTab('questions')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeMainTab === 'questions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Questions</span>
          {guidanceRequests.length > 0 && (
            <span
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                activeMainTab === 'questions'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {guidanceRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('remedial')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeMainTab === 'remedial'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Remedial Plans</span>
          {allTasksCount > 0 && (
            <span
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                activeMainTab === 'remedial'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {allTasksCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MY QUESTIONS (Faculty & Alumni Threads) */}
      {activeMainTab === 'questions' && (
        <div className="space-y-4 animate-fadeIn">
          <StudentInquiriesSection
            inquiries={guidanceRequests}
            onReply={handleFollowUpReply}
            onResolve={handleResolveInquiry}
            onAskGuidance={handleOpenAskModal}
            isReplying={isReplyingInquiry}
            isResolving={isResolvingInquiry}
          />
        </div>
      )}

      {/* TAB 2: REMEDIAL PLANS */}
      {activeMainTab === 'remedial' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Action Plan or Empty State */}
          {activePlan ? (
            <ActivePlanSummary
              plan={activePlan}
              completedCount={completedTasksCount}
              totalCount={allTasksCount}
              nextDeadline={nextDeadline}
            />
          ) : (
            <div
              className="p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-card text-center flex flex-col items-center gap-3"
              data-testid="no-active-plan-state"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  No active remedial plan.
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Any follow-up tasks assigned after your faculty evaluations will appear here.
                </p>
              </div>
            </div>
          )}

          {/* Task List & Submission Flow */}
          {allTasksCount > 0 && (
            <div className="space-y-3">
              <RemedialTaskList
                activeTasks={unifiedActiveTasks}
                completedTasks={unifiedCompletedTasks}
                onViewDetails={handleOpenTaskDetails}
                onSubmitWork={handleOpenSubmitModal}
                onUpdateSubmission={handleOpenSubmitModal}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>
          )}

          {/* Completed Plans Accordion */}
          {archivedPlans.length > 0 && (
            <div className="pt-2">
              <CompletedPlansAccordion plans={archivedPlans} />
            </div>
          )}
        </div>
      )}

      {/* TASK DETAILS DRAWER */}
      <TaskDetailsDrawer
        isOpen={Boolean(selectedTaskForDetails)}
        onClose={handleCloseTaskDetails}
        task={selectedTaskForDetails}
        onSubmitWork={handleOpenSubmitModal}
        onUpdateSubmission={handleOpenSubmitModal}
      />

      {/* SUBMISSION MODAL */}
      <SubmissionModal
        isOpen={Boolean(selectedTaskForSubmission)}
        onClose={handleCloseSubmitModal}
        task={selectedTaskForSubmission}
        onSubmit={handleSaveSubmission}
        isSubmitting={isSubmittingWork}
      />

      {/* ASK FOR GUIDANCE MODAL (Separate Faculty vs Alumni) */}
      <AskGuidanceModal
        isOpen={isAskModalOpen}
        onClose={handleCloseAskModal}
        onSubmit={handleCreateGuidanceInquiry}
        isSubmitting={isSubmittingGuidance}
        facultyList={facultyList}
        alumniList={alumniList}
      />
    </div>
  );
};

export default GuidancePage;

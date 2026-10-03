import React, { useState } from 'react';
import { Target, Plus, RotateCcw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../../common/Button';
import RemedialTaskList from './RemedialTaskList';
import RemedialTaskModal from './RemedialTaskModal';

export const RemedialPlanTab = ({
  planTitle = 'Remedial Action Plan: Mock Interview Follow-up',
  onChangePlanTitle = () => {},
  planSummary = '',
  onChangePlanSummary = () => {},
  tasks = [],
  onSaveTask = () => {},
  onRemoveTask = () => {},
  onResetToSuggestions = () => {},
  hasSuggestions = false,
  onAssignPlan = () => {},
  isAssigning = false,
  isReadOnly = false,
  dispatchedPlan = null,
  dispatchedGoals = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAssignClick = () => {
    if (!planTitle.trim()) {
      setValidationError('Plan title is required.');
      return;
    }
    if (tasks.length === 0) {
      setValidationError('Please add at least one remedial task to assign.');
      return;
    }
    setValidationError('');
    onAssignPlan();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Dispatched Confirmation Banner */}
      {dispatchedPlan && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                Remedial Action Plan Successfully Dispatched
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Status: {dispatchedPlan.status || 'assigned'}
            </span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            {dispatchedGoals.length > 0
              ? `Assigned ${dispatchedGoals.length} remedial weekly goal(s) to the student's Goal Tracker.`
              : `Evaluation confirmed with no remedial deficit required.`}
          </p>
        </div>
      )}

      {/* Plan Header & Meta Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Remedial Plan Details
          </h2>
          <p className="text-xs text-slate-500">
            Define actionable learning goals and practice tasks for the student candidate.
          </p>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Plan Title *
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={planTitle}
              onChange={(e) => {
                onChangePlanTitle(e.target.value);
                setValidationError('');
              }}
              placeholder="e.g. Remedial Sprint: Technical Core & STAR Articulation"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Summary / Reason
            </label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={planSummary}
              onChange={(e) => onChangePlanSummary(e.target.value)}
              placeholder="Provide context on why this remedial plan was created and the expected outcome before placement drives..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Remedial Tasks Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Remedial Tasks ({tasks.length})
            </h3>
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-2">
              {hasSuggestions && (
                <button
                  type="button"
                  onClick={onResetToSuggestions}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 transition"
                  title="Reset to algorithmic deficit suggestions based on scores"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset Suggestions</span>
                </button>
              )}

              <Button
                type="button"
                variant="primary"
                size="xs"
                onClick={handleOpenAddModal}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Task
              </Button>
            </div>
          )}
        </div>

        {/* Task Cards List */}
        <RemedialTaskList
          tasks={tasks}
          onEditTask={handleOpenEditModal}
          onRemoveTask={onRemoveTask}
          isReadOnly={isReadOnly}
        />

        {/* Assign Remedial Plan CTA */}
        {!isReadOnly && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <p className="text-[11px] text-slate-500">
              Assigned tasks will appear directly in the student's Goal Tracker with the '🎯 Faculty Action Plan' badge.
            </p>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleAssignClick}
              isLoading={isAssigning}
              loadingText="Assigning Plan..."
              leftIcon={<Target className="w-4 h-4" />}
              className="text-xs font-semibold shrink-0"
            >
              Assign Remedial Plan
            </Button>
          </div>
        )}
      </div>

      {/* Task Creation / Edit Modal */}
      <RemedialTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={editingTask}
        onSaveTask={onSaveTask}
      />
    </div>
  );
};

export default RemedialPlanTab;

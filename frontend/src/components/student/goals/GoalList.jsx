import React, { useState } from 'react';
import { Target, CheckCircle2, ChevronDown, ChevronUp, Plus, AlertCircle } from 'lucide-react';
import GoalItem from './GoalItem';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';

export const GoalList = ({
  goals = [],
  activeTab = 'active',
  searchQuery = '',
  onToggleStatus = () => {},
  onUpdateProgress = () => {},
  onViewDetails = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onOpenCreate = () => {},
  updatingGoalId = null,
}) => {
  const [isCompletedAccordionOpen, setIsCompletedAccordionOpen] = useState(false);

  // If in 'all' tab, partition into active and completed goals
  const activeGoals = goals.filter((g) => g.status !== 'completed');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  if (goals.length === 0) {
    let emptyTitle = 'No Active Goals';
    let emptyDescription = 'You do not have any active commitments right now. Set a goal to maintain your momentum.';

    if (searchQuery) {
      emptyTitle = `No goals matching "${searchQuery}"`;
      emptyDescription = 'Try adjusting your search query or clear the filter.';
    } else if (activeTab === 'completed') {
      emptyTitle = 'No Completed Goals Yet';
      emptyDescription = 'Mark your active goals as complete as you finish milestones to build your track record.';
    } else if (activeTab === 'overdue') {
      emptyTitle = 'No Overdue Goals';
      emptyDescription = 'Great job! You have no goals past their target completion deadline.';
    }

    return (
      <div className="py-8">
        <EmptyState
          icon={
            activeTab === 'completed' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : activeTab === 'overdue' ? (
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            ) : (
              <Target className="w-8 h-8 text-slate-400" />
            )
          }
          title={emptyTitle}
          description={emptyDescription}
          action={
            activeTab !== 'completed' && activeTab !== 'overdue' && !searchQuery ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenCreate}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + New Goal
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  // When viewing 'all' tab: render active goals first, then a collapsible Completed Goals section
  if (activeTab === 'all' && completedGoals.length > 0 && activeGoals.length > 0) {
    return (
      <div className="space-y-6">
        {/* Active Goals Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Active Goals ({activeGoals.length})
            </h2>
          </div>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onToggleStatus={onToggleStatus}
                onUpdateProgress={onUpdateProgress}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onDelete={onDelete}
                isUpdating={updatingGoalId === goal.id}
              />
            ))}
          </div>
        </div>

        {/* Collapsible Completed Goals Accordion */}
        <div className="border border-slate-200/90 rounded-2xl bg-slate-50/50 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsCompletedAccordionOpen(!isCompletedAccordionOpen)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Completed Goals ({completedGoals.length})
              </span>
              <span className="text-[11px] text-slate-400">
                (Click to {isCompletedAccordionOpen ? 'collapse' : 'view archive'})
              </span>
            </div>
            {isCompletedAccordionOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {isCompletedAccordionOpen && (
            <div className="p-4 pt-0 space-y-3 border-t border-slate-200/60">
              {completedGoals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  onToggleStatus={onToggleStatus}
                  onUpdateProgress={onUpdateProgress}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isUpdating={updatingGoalId === goal.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard vertical list for Active, Completed, or Overdue tab
  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <GoalItem
          key={goal.id}
          goal={goal}
          onToggleStatus={onToggleStatus}
          onUpdateProgress={onUpdateProgress}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
          isUpdating={updatingGoalId === goal.id}
        />
      ))}
    </div>
  );
};

export default GoalList;

import React, { useState } from 'react';
import { RemedialTaskItem } from './RemedialTaskItem';
import { CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Layers } from 'lucide-react';
import Button from '../../common/Button';

export const RemedialTaskList = ({
  activeTasks = [],
  completedTasks = [],
  onViewDetails,
  onSubmitWork,
  onUpdateSubmission,
  activeFilter = 'active', // 'active' | 'completed' | 'all'
  onFilterChange,
}) => {
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  return (
    <div className="space-y-4" data-testid="remedial-task-list">
      {/* Tab Filter bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600 mr-1" />
          {[
            { id: 'active', label: 'Active Tasks', count: activeTasks.length },
            { id: 'completed', label: 'Completed', count: completedTasks.length },
            { id: 'all', label: 'All Tasks', count: activeTasks.length + completedTasks.length },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer
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
      </div>

      {/* When Active filter or All is selected: Show Active Tasks */}
      {(activeFilter === 'active' || activeFilter === 'all') && (
        <div className="space-y-3">
          {activeTasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">
                All Active Remedial Tasks Cleared!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                You have no outstanding remedial actions due for review. Outstanding work has been verified by faculty.
              </p>
            </div>
          ) : (
            activeTasks.map((task) => (
              <RemedialTaskItem
                key={task.id}
                task={task}
                onViewDetails={onViewDetails}
                onSubmitWork={onSubmitWork}
                onUpdateSubmission={onUpdateSubmission}
              />
            ))
          )}
        </div>
      )}

      {/* Completed Tasks Section (Secondary visually) */}
      {completedTasks.length > 0 && activeFilter === 'active' && (
        <div className="pt-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setIsCompletedExpanded((prev) => !prev)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">
                  Completed Tasks
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                  {completedTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                <span>{isCompletedExpanded ? 'Hide' : 'Show'}</span>
                {isCompletedExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {isCompletedExpanded && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-3 bg-slate-50/40">
                {completedTasks.map((task) => (
                  <RemedialTaskItem
                    key={task.id}
                    task={task}
                    onViewDetails={onViewDetails}
                    onSubmitWork={onSubmitWork}
                    onUpdateSubmission={onUpdateSubmission}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Completed Filter view */}
      {activeFilter === 'completed' && (
        <div className="space-y-3">
          {completedTasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <h3 className="text-sm font-semibold text-slate-800">
                No Completed Tasks Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Complete and submit assigned remedial work to see verified achievements here.
              </p>
            </div>
          ) : (
            completedTasks.map((task) => (
              <RemedialTaskItem
                key={task.id}
                task={task}
                onViewDetails={onViewDetails}
                onSubmitWork={onSubmitWork}
                onUpdateSubmission={onUpdateSubmission}
              />
            ))
          )}
        </div>
      )}

      {/* Direct All Filter view: Show Completed below active */}
      {activeFilter === 'all' && completedTasks.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Tasks ({completedTasks.length})
            </span>
          </div>
          {completedTasks.map((task) => (
            <RemedialTaskItem
              key={task.id}
              task={task}
              onViewDetails={onViewDetails}
              onSubmitWork={onSubmitWork}
              onUpdateSubmission={onUpdateSubmission}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RemedialTaskList;

import React from 'react';
import { Award, BarChart3, Plus } from 'lucide-react';
import InterviewHistoryItem from './InterviewHistoryItem';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';

export const InterviewHistory = ({
  interviews = [],
  filter = 'all',
  onFilterChange = () => {},
  counts = { all: 0, completed: 0, scheduled: 0, pending: 0 },
  getJoinWindow = () => ({ canJoin: false }),
  onOpenEvaluation = () => {},
  onJoin = () => {},
  onCancel = () => {},
  onOpenBooking = () => {},
  formatDate = (d) => d,
  formatTime = (d) => d,
  isJoiningId = null,
}) => {
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'scheduled', label: 'Scheduled', count: counts.scheduled },
    { id: 'pending', label: 'Pending Requests', count: counts.pending },
  ];

  return (
    <div className="space-y-3.5 pt-2">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Interview History &amp; Evaluations
          </h2>
          <span className="text-xs text-slate-400 font-normal">
            ({interviews.length} displayed)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
          {tabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
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

      {/* List / Empty State */}
      {interviews.length === 0 ? (
        <EmptyState
          icon={<Award className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
          title="No Interviews Found"
          description={
            filter !== 'all'
              ? `No interview sessions found under the "${filter}" filter.`
              : 'You have no interview records yet. Book a session to get feedback on your technical and communication skills.'
          }
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenBooking()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Book Mock Interview
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {interviews.map((item) => (
            <InterviewHistoryItem
              key={item.interviewId || item.id}
              item={item}
              joinWindow={getJoinWindow(item.dateTime, item.duration)}
              onOpenEvaluation={onOpenEvaluation}
              onJoin={onJoin}
              onCancel={onCancel}
              formatDate={formatDate}
              formatTime={formatTime}
              isJoining={isJoiningId === (item.interviewId || item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;

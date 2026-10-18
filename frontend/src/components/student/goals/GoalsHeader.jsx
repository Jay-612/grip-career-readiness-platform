import React from 'react';
import { Target, Plus, RefreshCw } from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const GoalsHeader = ({
  onOpenCreate = () => {},
  onRefresh = () => {},
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Target className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Goals &amp; Milestones
          </h1>
          <Badge variant="primary" size="xs" className="hidden sm:inline-flex">
            Action Center
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Track your career readiness goals and complete the next important milestone.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          title="Refresh goals"
        >
          Refresh
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          + New Goal
        </Button>
      </div>
    </div>
  );
};

export default GoalsHeader;

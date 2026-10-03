import React from 'react';
import { Video, Plus, RefreshCw } from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const InterviewHeader = ({
  onOpenBooking = () => {},
  onRefresh = () => {},
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Video className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Interview Center
          </h1>
          <Badge variant="primary" size="xs" className="hidden sm:inline-flex">
            Diagnostic Mock Sessions
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Book mock interviews, join upcoming sessions, and review your previous evaluations.
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
          title="Refresh interviews"
        >
          Refresh
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenBooking()}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          + Book Mock Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewHeader;

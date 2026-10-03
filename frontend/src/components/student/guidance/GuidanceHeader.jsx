import React from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import Button from '../../common/Button';

export const GuidanceHeader = ({ onRefresh, isRefreshing = false }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Remedial Guidance
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Faculty Supervised
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
          Complete the actions assigned after your faculty evaluation.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default GuidanceHeader;

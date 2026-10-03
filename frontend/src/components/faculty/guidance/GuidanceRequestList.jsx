import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import GuidanceRequestItem from './GuidanceRequestItem';
import Button from '../../common/Button';

export const GuidanceRequestList = ({
  requests = [],
  selectedRequestId = null,
  onSelectRequest,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" data-testid="guidance-list-loading">
        {[1, 2, 3].map((n) => (
          <div key={n} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/5" />
            </div>
            <div className="h-3 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center space-y-3">
        <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-rose-900">Failed to load guidance requests</h4>
          <p className="text-xs text-rose-700">{error}</p>
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="bg-white">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-3 shadow-2xs">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <Inbox className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800">
            No guidance requests need review.
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            All student submissions in this view have been addressed or no inquiries match your filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-0.5 custom-scrollbar" data-testid="guidance-list">
      {requests.map((item) => (
        <GuidanceRequestItem
          key={item.id}
          item={item}
          isSelected={item.id === selectedRequestId}
          onSelect={onSelectRequest}
        />
      ))}
    </div>
  );
};

export default GuidanceRequestList;

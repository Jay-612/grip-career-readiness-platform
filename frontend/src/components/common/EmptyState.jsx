import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon,
  title = "No data found",
  description = "There are currently no items to display.",
  action,
  compact = false,
  className = '',
}) => {
  return (
    <div
      className={`
        w-full flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50
        ${compact ? 'py-8 px-4' : 'py-14 px-6'}
        ${className}
      `}
    >
      <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-400 mb-3.5">
        {icon || <Inbox className="w-6 h-6 stroke-[1.5]" />}
      </div>

      <h4 className="text-sm font-semibold text-slate-800 tracking-tight">
        {title}
      </h4>

      {description && (
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

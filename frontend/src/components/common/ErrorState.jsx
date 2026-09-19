import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while communicating with the campus platform. Please try again.',
  onRetry,
  retryText = 'Retry Request',
  className = '',
}) => {
  return (
    <div
      className={`
        p-6 sm:p-8 rounded-2xl bg-white border border-rose-200 shadow-card flex flex-col items-center text-center gap-3.5 my-4
        ${className}
      `}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="flex flex-col gap-1 max-w-md">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-1 text-xs"
        >
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

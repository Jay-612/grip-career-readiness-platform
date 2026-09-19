import React from 'react';

const PageHeader = ({
  badge,
  title,
  subtitle,
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-3.5 mb-6 ${className}`}>
      {badge && (
        <div className="flex items-center">
          {badge}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          {title && (
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div className="mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

import React from 'react';
import Badge from './Badge';

const StatCard = ({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'success',
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50 border-blue-100',
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-150 flex flex-col justify-between
        ${onClick ? 'cursor-pointer hover:border-slate-300' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-slate-500 tracking-tight truncate">
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {value}
            </span>
            {badgeText && (
              <Badge variant={badgeVariant} size="sm" className="font-mono">
                {badgeText}
              </Badge>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5
              ${iconBg} ${iconColor}
            `}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center text-[11px] text-slate-500 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;

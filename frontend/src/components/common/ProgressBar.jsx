import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  sublabel,
  showPercentage = false,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const variants = {
    primary: "bg-blue-600",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    tier1: "bg-purple-600",
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
    dark: "bg-slate-800",
  };

  const sizes = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {label && <span className="font-semibold text-slate-700">{label}</span>}
            {sublabel && <span className="text-slate-400">{sublabel}</span>}
          </div>
          {showPercentage && (
            <span className="font-mono font-medium text-slate-700">{percentage}%</span>
          )}
        </div>
      )}

      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizes[size] || sizes.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variants[variant] || variants.primary}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

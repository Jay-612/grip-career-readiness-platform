import React from 'react';

const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  pulseDot = false,
  icon,
  className = '',
}) => {
  const variants = {
    neutral: {
      wrapper: "bg-slate-100 text-slate-700 border-slate-200/80",
      dot: "bg-slate-500",
    },
    success: {
      wrapper: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    warning: {
      wrapper: "bg-amber-50 text-amber-800 border-amber-200/80",
      dot: "bg-amber-500",
    },
    danger: {
      wrapper: "bg-rose-50 text-rose-800 border-rose-200/80",
      dot: "bg-rose-500",
    },
    info: {
      wrapper: "bg-blue-50 text-blue-800 border-blue-200/80",
      dot: "bg-blue-500",
    },
    tier1: {
      wrapper: "bg-purple-50 text-purple-800 border-purple-200/80",
      dot: "bg-purple-600",
    },
    dark: {
      wrapper: "bg-slate-900 text-white border-slate-800",
      dot: "bg-emerald-400",
    }
  };

  const sizes = {
    sm: "text-[11px] font-medium px-2 py-0.5 gap-1.5",
    md: "text-xs font-medium px-2.5 py-1 gap-1.5",
  };

  const config = variants[variant] || variants.neutral;

  return (
    <span
      className={`
        inline-flex items-center rounded-full border tracking-wide transition-colors
        ${config.wrapper}
        ${sizes[size] || sizes.sm}
        ${className}
      `}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulseDot && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`} />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

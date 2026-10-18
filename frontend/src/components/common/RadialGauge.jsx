import React from 'react';

const RadialGauge = ({
  value = 0,
  max = 100,
  size = 110,
  strokeWidth = 9,
  variant = 'primary',
  label,
  subtitle,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const strokeColors = {
    primary: '#2563eb', // Blue
    success: '#10b981', // Emerald
    warning: '#f59e0b', // Amber
    danger: '#ef4444',  // Rose
    tier1: '#7c3aed',   // Purple
    navy: '#0f172a',    // Dark Navy
  };

  const selectedColor = strokeColors[variant] || strokeColors.primary;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Dynamic Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={selectedColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Inner Centered Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-xl font-bold text-slate-900 tracking-tight leading-none font-mono">
          {percentage}%
        </span>
        {label && (
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
            {label}
          </span>
        )}
        {subtitle && (
          <span className="text-[9px] text-slate-400 font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default RadialGauge;

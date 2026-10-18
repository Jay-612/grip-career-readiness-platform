import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  ...props
}) => {
  const variants = {
    rectangular: "rounded-lg",
    circular: "rounded-full shrink-0",
    text: "rounded h-3 w-full my-1",
    card: "rounded-2xl h-32 w-full",
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`
        bg-slate-200/80 animate-pulse
        ${variants[variant] || variants.rectangular}
        ${className}
      `}
      style={style}
      {...props}
    />
  );
};

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="text" className="w-1/3 h-4" />
      <Skeleton variant="circular" className="w-6 h-6" />
    </div>
    <Skeleton variant="text" className="w-2/3 h-3 mb-2" />
    <Skeleton variant="text" className="w-1/2 h-3 mb-4" />
    <Skeleton variant="rectangular" className="w-full h-8" />
  </div>
);

export const LoadingSpinner = ({
  size = 'md',
  className = '',
  text,
}) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 ${className}`}>
      <div
        className={`
          ${sizes[size] || sizes.md}
          border-slate-200 border-t-blue-600 rounded-full animate-spin
        `}
      />
      {text && (
        <span className="text-xs text-slate-500 font-medium">
          {text}
        </span>
      )}
    </div>
  );
};

export default Skeleton;

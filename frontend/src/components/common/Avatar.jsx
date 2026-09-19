import React from 'react';

const Avatar = ({
  name = '',
  initials,
  src,
  size = 'md',
  variant = 'default',
  status,
  className = '',
}) => {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const computedInitials = initials || getInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base font-bold',
  };

  const variantClasses = {
    default: 'bg-slate-900 text-white',
    primary: 'bg-blue-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    amber: 'bg-amber-600 text-white',
    soft: 'bg-blue-100 text-blue-800',
  };

  const statusClasses = {
    online: 'bg-emerald-500 ring-white',
    busy: 'bg-rose-500 ring-white',
    away: 'bg-amber-500 ring-white',
    offline: 'bg-slate-400 ring-white',
  };

  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`
            ${sizeClasses[size] || sizeClasses.md}
            rounded-full object-cover shadow-xs ring-2 ring-white
            ${className}
          `}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size] || sizeClasses.md}
            ${variantClasses[variant] || variantClasses.default}
            rounded-full font-semibold flex items-center justify-center shrink-0 shadow-xs ring-2 ring-white select-none
            ${className}
          `}
        >
          {computedInitials}
        </div>
      )}

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2
            ${statusClasses[status] || statusClasses.online}
          `}
        />
      )}
    </div>
  );
};

export default Avatar;

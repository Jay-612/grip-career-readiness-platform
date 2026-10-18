import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  rightIcon,
  rightBadge,
  disabled = false,
  className = '',
  wrapperClassName = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={generatedId}
            className="text-xs font-semibold text-slate-700 flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {rightBadge && (
            <span className="shrink-0">{rightBadge}</span>
          )}
        </div>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={generatedId}
          type={type}
          disabled={disabled}
          className={`
            w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border transition-all duration-150
            ${leftIcon ? 'pl-10' : 'pl-3.5'}
            ${rightIcon ? 'pr-10' : 'pr-3.5'}
            py-2.5
            ${error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200/90 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
            }
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : ''}
            focus:outline-none
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3.5 flex items-center justify-center text-slate-400">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium mt-0.5 animate-fadeIn">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

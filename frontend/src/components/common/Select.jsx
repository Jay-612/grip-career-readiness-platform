import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({
  label,
  error,
  helperText,
  required = false,
  options = [],
  children,
  disabled = false,
  className = '',
  wrapperClassName = '',
  id,
  ...props
}, ref) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={generatedId}
          className="text-xs font-semibold text-slate-700 flex items-center gap-1"
        >
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={generatedId}
          disabled={disabled}
          className={`
            w-full bg-white text-slate-900 text-sm rounded-lg border transition-all duration-150 pl-3.5 pr-10 py-2.5 appearance-none
            ${error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200/90 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
            }
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : 'cursor-pointer'}
            focus:outline-none
            ${className}
          `}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <span className="absolute right-3.5 flex items-center justify-center text-slate-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </span>
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

Select.displayName = 'Select';

export default Select;

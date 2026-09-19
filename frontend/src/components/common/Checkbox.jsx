import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef(({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const generatedId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={generatedId}
        className={`inline-flex items-start gap-2.5 select-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            ref={ref}
            id={generatedId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={`
              w-4.5 h-4.5 rounded border transition-all duration-150 flex items-center justify-center
              ${checked
                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                : 'bg-white border-slate-300 hover:border-slate-400'
              }
              ${error ? 'border-rose-400' : ''}
              ${disabled ? 'bg-slate-100 border-slate-200' : ''}
            `}
          >
            {checked && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-xs font-medium text-slate-700 leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                {description}
              </span>
            )}
          </div>
        )}
      </label>

      {error && (
        <p className="text-xs text-rose-600 font-medium pl-7">
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;

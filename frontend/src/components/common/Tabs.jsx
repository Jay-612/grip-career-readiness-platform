import React from 'react';

const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills',
  size = 'md',
  className = '',
}) => {
  const containerVariants = {
    pills: "inline-flex p-1 bg-slate-100 rounded-xl gap-1 overflow-x-auto custom-scrollbar max-w-full",
    underline: "flex border-b border-slate-200 gap-6 overflow-x-auto custom-scrollbar max-w-full",
    capsules: "flex items-center gap-2 overflow-x-auto custom-scrollbar max-w-full py-1",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1",
    md: "text-xs font-medium px-3 py-1.5",
    lg: "text-sm font-medium px-4 py-2",
  };

  return (
    <nav
      className={`${containerVariants[variant] || containerVariants.pills} ${className}`}
      aria-label="Tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange && onChange(tab.id)}
              className={`
                flex items-center gap-2 pb-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors
                ${isActive
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
                ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count !== 'undefined' && (
                <span
                  className={`
                    text-[11px] px-1.5 py-0.2 rounded-full font-mono font-normal
                    ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        if (variant === 'capsules') {
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange && onChange(tab.id)}
              className={`
                inline-flex items-center gap-1.5 rounded-full border transition-all whitespace-nowrap
                ${sizes[size] || sizes.md}
                ${isActive
                  ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }
                ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count !== 'undefined' && (
                <span
                  className={`
                    text-[10px] px-1.5 py-0.2 rounded-full font-mono
                    ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        // Default: 'pills'
        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange && onChange(tab.id)}
            className={`
              inline-flex items-center gap-1.5 rounded-lg transition-all duration-150 whitespace-nowrap
              ${sizes[size] || sizes.md}
              ${isActive
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }
              ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count !== 'undefined' && (
              <span
                className={`
                  text-[10px] px-1.5 py-0.2 rounded-full font-mono
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/80 text-slate-600'}
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default Tabs;

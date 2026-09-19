import React from 'react';

const Card = ({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  ...props
}) => {
  const variants = {
    default: "bg-white border border-slate-200/90 shadow-card text-slate-900",
    subtle: "bg-slate-50/70 border border-slate-200/70 text-slate-800",
    glass: "glass-card border border-slate-200/80 shadow-sm text-slate-900",
    hero: "hero-gradient border border-blue-900/50 text-white shadow-md",
    dark: "bg-slate-900 border border-slate-800 text-white shadow-md",
  };

  const hoverStyle = hoverable ? "transition-all duration-200 hover:shadow-card-hover hover:border-slate-300" : "";

  return (
    <div
      className={`
        rounded-2xl
        ${variants[variant] || variants.default}
        ${hoverStyle}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-5 pb-3 border-b border-slate-100 last:border-b-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, as: Component = 'h3', className = '', ...props }) => (
  <Component className={`text-base font-semibold tracking-tight text-inherit ${className}`} {...props}>
    {children}
  </Component>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-slate-500 font-normal mt-1 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`p-5 pt-3 border-t border-slate-100 bg-slate-50/40 rounded-b-2xl ${className}`} {...props}>
    {children}
  </div>
);

export default Card;

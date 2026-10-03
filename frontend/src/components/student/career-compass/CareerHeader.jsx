import React from 'react';
import { Compass, HelpCircle } from 'lucide-react';

export const CareerHeader = ({ onOpenQuiz = () => {} }) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Career Compass
          </h1>
          <p className="text-xs text-slate-500">
            Understand your target role, identify skill gaps, and follow progressive milestones toward readiness.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenQuiz}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Diagnostic Quiz</span>
        </button>
      </div>
    </header>
  );
};

export default CareerHeader;

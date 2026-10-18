import React from 'react';
import { Sparkles } from 'lucide-react';

export const AlumniInsightsHeader = () => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
          Alumni Insights
        </h1>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          <Sparkles className="w-3 h-3 text-blue-600" />
          Verified Network
        </span>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed">
        Learn from alumni interview experiences, career journeys, and company insights.
      </p>
    </div>
  );
};

export default AlumniInsightsHeader;

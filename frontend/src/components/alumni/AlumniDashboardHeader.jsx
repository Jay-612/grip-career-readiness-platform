import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const AlumniDashboardHeader = ({
  alumniName = 'Alumni Mentor',
  currentCompany = '',
  jobRole = '',
  graduationYear = '',
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
          Welcome, {alumniName}
        </h1>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Verified Alumni
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        {(jobRole || currentCompany) && (
          <span className="font-medium text-slate-700">
            {jobRole} {currentCompany ? `at ${currentCompany}` : ''}
            {graduationYear ? ` • Class of ${graduationYear}` : ''}
          </span>
        )}
        <span className="text-slate-400">•</span>
        <span className="text-slate-500">
          Support students and share your career experience.
        </span>
      </div>
    </div>
  );
};

export default AlumniDashboardHeader;

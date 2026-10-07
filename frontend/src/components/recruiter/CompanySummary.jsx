import React from 'react';
import { Building2, Mail, User, ShieldCheck, Edit3 } from 'lucide-react';
import Badge from '../common/Badge';

export const CompanySummary = ({
  companyName = '',
  designation = '',
  recruiterName = '',
  recruiterEmail = '',
  isVerified = true,
  onEdit = () => {},
}) => {
  const monogram = companyName
    ? companyName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CP';

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
            {monogram}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">
                {companyName || 'Corporate Partner'}
              </h1>
              {isVerified ? (
                <Badge variant="success" size="xs">
                  Campus Verified
                </Badge>
              ) : (
                <Badge variant="warning" size="xs">
                  Pending Setup
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">Corporate Hiring Profile &amp; Campus Verification</p>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs cursor-pointer self-start sm:self-center"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Company &amp; Drive</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Lead Recruiter
          </span>
          <span className="font-semibold text-slate-900 block truncate">
            {recruiterName || 'Campus Representative'}
          </span>
          <span className="text-[11px] text-slate-500 block truncate">
            {designation || 'University Talent Partner'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Contact Email
          </span>
          <span className="font-mono text-slate-800 block truncate">
            {recruiterEmail || 'recruiter@company.com'}
          </span>
          <span className="text-[11px] text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Authorized Corporate Mail</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Hiring Network Status
          </span>
          <span className="font-semibold text-indigo-700 block">
            Tier-1 Campus Partner
          </span>
          <span className="text-[11px] text-slate-500 block">
            Annual Campus Drives Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanySummary;

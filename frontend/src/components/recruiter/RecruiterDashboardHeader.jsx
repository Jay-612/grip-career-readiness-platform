import React from 'react';
import { Building2, Briefcase, Plus, Send, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';

export const RecruiterDashboardHeader = ({
  companyName = '',
  designation = '',
  recruiterName = '',
  activeRole = 'Campus Hiring Drive',
  isVerified = true,
  shortlistCount = 0,
  onOpenShortlist = () => {},
}) => {
  return (
    <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 md:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-medium">
            <Building2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>Campus Recruitment Workspace</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {companyName || 'Corporate Partner'}
            </h1>
            {isVerified ? (
              <Badge variant="success" size="sm">
                Active Partner
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                Setup Pending
              </Badge>
            )}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Review candidates and manage your campus hiring activity.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active Target:</span>
              <strong className="text-white font-medium">{activeRole}</strong>
            </span>
            {designation && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  {recruiterName} ({designation})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenShortlist}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-colors"
          >
            <span>Shortlisted Pool</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[11px] font-bold">
              {shortlistCount}
            </span>
          </button>

          <Link
            to="/recruiter/company"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <span>Manage Drive</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default RecruiterDashboardHeader;

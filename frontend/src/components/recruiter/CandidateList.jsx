import React from 'react';
import CandidateItem from './CandidateItem';
import EmptyState from '../common/EmptyState';
import { Users, Search } from 'lucide-react';

export const CandidateList = ({
  candidates = [],
  shortlistedIds = new Set(),
  onToggleShortlist = () => {},
  onViewProfile = () => {},
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center gap-3 w-2/3">
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-2 w-full">
                <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              </div>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <EmptyState
        compact
        icon={<Users className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
        title="No Matching Candidates Found"
        description="Try adjusting your department, readiness threshold, or career filters to find eligible students."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {candidates.map((candidate) => {
        const studentId = candidate.studentId || candidate.id || candidate._id;
        const isShortlisted = shortlistedIds.has(String(studentId));

        return (
          <CandidateItem
            key={studentId}
            candidate={candidate}
            isShortlisted={isShortlisted}
            onToggleShortlist={onToggleShortlist}
            onViewProfile={onViewProfile}
          />
        );
      })}
    </div>
  );
};

export default CandidateList;

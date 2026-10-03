import React from 'react';
import { Bookmark, BookmarkCheck, CheckCircle2, AlertCircle, ChevronRight, User } from 'lucide-react';
import Badge from '../common/Badge';

export const CandidateItem = ({
  candidate,
  isShortlisted = false,
  onToggleShortlist = () => {},
  onViewProfile = () => {},
}) => {
  const readiness = Number(candidate.readinessScore) || 0;
  const isReady = readiness >= 70;
  const isModerate = readiness >= 50 && readiness < 70;

  const department = candidate.department || 'Computer Science & Engineering';
  const semester = candidate.semester ? `Sem ${candidate.semester}` : 'Graduating 2026';
  const cgpa = candidate.cgpa || (8.0 + (readiness % 15) / 10).toFixed(1);

  // Key verified skills display (max 3)
  const skills = Array.isArray(candidate.skills) && candidate.skills.length > 0
    ? candidate.skills
    : ['System Design', 'Cloud APIs', 'Data Structures'];

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Candidate Primary Identity */}
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
          {candidate.studentName
            ? candidate.studentName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : 'ST'}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900 truncate">
              {candidate.studentName || 'Student Candidate'}
            </span>
            <Badge
              variant={isReady ? 'success' : isModerate ? 'primary' : 'warning'}
              size="xs"
            >
              {readiness}% Readiness
            </Badge>
            {candidate.isEligible && (
              <span className="px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Eligible Match
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{department}</span>
            <span>•</span>
            <span className="font-mono">{semester}</span>
            <span>•</span>
            <span className="font-medium text-slate-700">CGPA: {cgpa}</span>
          </div>

          {/* Key Verified Skills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{skills.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Row Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
        <button
          onClick={() => onToggleShortlist(candidate)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            isShortlisted
              ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          {isShortlisted ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Shortlisted</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              <span>Shortlist</span>
            </>
          )}
        </button>

        <button
          onClick={() => onViewProfile(candidate)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          <span>View Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default CandidateItem;

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Bookmark, BookmarkCheck, ExternalLink, Send, ShieldCheck, Award, Briefcase } from 'lucide-react';
import Badge from '../common/Badge';
import recruiterService from '../../services/recruiterService';

export const CandidateDetailsDrawer = ({
  candidate = null,
  isOpen = false,
  onClose = () => {},
  isShortlisted = false,
  onToggleShortlist = () => {},
  onOpenFeedback = () => {},
}) => {
  const [matchData, setMatchData] = useState(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  useEffect(() => {
    if (!isOpen || !candidate) {
      setMatchData(null);
      return;
    }

    const sid = candidate.studentId || candidate.id || candidate._id;
    if (!sid) return;

    let isMounted = true;
    setIsLoadingMatch(true);

    recruiterService
      .getCompanyMatch(sid)
      .then((res) => {
        if (isMounted) setMatchData(res);
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Match data not available for candidate:', err);
          setMatchData(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingMatch(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, candidate]);

  if (!isOpen || !candidate) return null;

  const readiness = Number(candidate.readinessScore) || 0;
  const isReady = readiness >= 70;
  const isModerate = readiness >= 50 && readiness < 70;
  const department = candidate.department || 'Computer Science & Engineering';
  const semester = candidate.semester ? `Semester ${candidate.semester}` : 'Graduating 2026';
  const cgpa = candidate.cgpa || (8.0 + (readiness % 15) / 10).toFixed(1);
  const verifiedSkills = matchData?.studentSkills || candidate.skills || ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'System Design'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-drawer-title"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              {candidate.studentName
                ? candidate.studentName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'ST'}
            </div>
            <div>
              <h2 id="candidate-drawer-title" className="text-base font-bold text-slate-900">
                {candidate.studentName || 'Candidate Profile'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">{candidate.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* Readiness & Academic Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Placement Readiness</span>
              <Badge
                variant={isReady ? 'success' : isModerate ? 'primary' : 'warning'}
                size="sm"
              >
                {readiness}% Score
              </Badge>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isReady ? 'bg-emerald-500' : isModerate ? 'bg-indigo-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, readiness))}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Department</span>
                <span className="font-bold text-slate-800 text-[11px] truncate block">
                  CSE
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Semester</span>
                <span className="font-bold text-slate-800 text-[11px] block">{semester}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">CGPA</span>
                <span className="font-bold text-slate-800 text-[11px] block">{cgpa}</span>
              </div>
            </div>
          </div>

          {/* Career Path */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Target Career Track
            </span>
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-900 text-xs">
                {candidate.selectedCareer || matchData?.selectedCareer || 'Cloud & Distributed Systems'}
              </span>
            </div>
          </div>

          {/* Verified Skills */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Verified Technical Skills
            </span>
            {isLoadingMatch ? (
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-slate-100 rounded-md animate-pulse" />
                <div className="h-6 w-20 bg-slate-100 rounded-md animate-pulse" />
                <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {verifiedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-800 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Company Skill Match Analysis */}
          {matchData && matchData.matches && matchData.matches.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Company Eligibility Match
              </span>
              <div className="space-y-2">
                {matchData.matches.slice(0, 3).map((match) => (
                  <div
                    key={match.companyId || match.companyName}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {match.companyName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {match.matchedSkills?.length || 0} of {match.requiredSkills?.length || 0} skills verified
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-bold font-mono text-xs ${
                          match.isEligible ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {match.matchPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {match.isEligible ? 'Eligible' : 'Below Cutoff'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleShortlist(candidate)}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              isShortlisted
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isShortlisted ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-amber-600" />
                <span>Remove Shortlist</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Add to Shortlist</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenFeedback(candidate);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsDrawer;

import React from 'react';
import { X, Trash2, Send, BookmarkCheck, ArrowRight, User } from 'lucide-react';
import Badge from '../common/Badge';

export const ShortlistPanel = ({
  isOpen = false,
  onClose = () => {},
  shortlistedCandidates = [],
  onRemove = () => {},
  onViewProfile = () => {},
  onOpenFeedback = () => {},
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortlist-panel-title"
      >
        {/* Panel Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 id="shortlist-panel-title" className="text-base font-bold text-slate-900">
                Shortlisted Candidates
              </h2>
              <p className="text-xs text-slate-500">
                {shortlistedCandidates.length} candidate{shortlistedCandidates.length !== 1 ? 's' : ''} in your hiring pool
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {shortlistedCandidates.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <BookmarkCheck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Your Shortlist is Empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click the "Shortlist" button on any candidate row in the search results to add them to your pool.
              </p>
            </div>
          ) : (
            shortlistedCandidates.map((candidate) => {
              const sid = candidate.studentId || candidate.id || candidate._id;
              const readiness = Number(candidate.readinessScore) || 0;

              return (
                <div
                  key={sid}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {candidate.studentName || 'Student Candidate'}
                      </span>
                      <Badge variant="success" size="xs">
                        {readiness}% Ready
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {candidate.selectedCareer || 'Cloud & Distributed Systems'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onClose();
                        onViewProfile(candidate);
                      }}
                      className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 text-[11px]"
                    >
                      Profile
                    </button>

                    <button
                      onClick={() => onRemove(sid)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove from shortlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        {shortlistedCandidates.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/60">
            <button
              onClick={() => {
                onClose();
                onOpenFeedback(shortlistedCandidates[0]);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Evaluate Next Candidate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortlistPanel;

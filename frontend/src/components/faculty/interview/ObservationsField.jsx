import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Sparkles } from 'lucide-react';

export const ObservationsField = ({
  observations = '',
  onChangeObservations = () => {},
  strengths = '',
  onChangeStrengths = () => {},
  improvements = '',
  onChangeImprovements = () => {},
  isReadOnly = false,
}) => {
  const [showDetailedNotes, setShowDetailedNotes] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-4">
      <div>
        <label className="block text-base font-bold text-slate-900 tracking-tight mb-1">
          Interview Observations
        </label>
        <p className="text-xs text-slate-500">
          Record your evaluation synthesis, candidate performance remarks, and overall hiring recommendation.
        </p>
      </div>

      <textarea
        rows={4}
        disabled={isReadOnly}
        value={observations}
        onChange={(e) => onChangeObservations(e.target.value)}
        placeholder="Enter comprehensive interview observations, performance strengths, and actionable feedback for the student..."
        className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 transition leading-relaxed"
      />

      {/* Optional Granular Notes (Strengths & Areas for Improvement) */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowDetailedNotes(!showDetailedNotes)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <span>{showDetailedNotes ? 'Hide specific notes' : '+ Add specific strengths & improvement notes'}</span>
          {showDetailedNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDetailedNotes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Candidate Strengths
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={strengths}
                onChange={(e) => onChangeStrengths(e.target.value)}
                placeholder="e.g. Strong understanding of distributed hashing, clear STAR storytelling..."
                className="w-full text-xs p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1">
                Areas for Improvement
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={improvements}
                onChange={(e) => onChangeImprovements(e.target.value)}
                placeholder="e.g. Practice edge cases in graph traversals, refine time complexity estimations..."
                className="w-full text-xs p-3 rounded-xl border border-amber-200 bg-amber-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-slate-900 transition"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObservationsField;

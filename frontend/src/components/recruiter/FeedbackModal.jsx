import React, { useState } from 'react';
import { X, Send, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

export const FeedbackModal = ({
  isOpen = false,
  onClose = () => {},
  candidate = null,
  candidatesList = [],
  onSubmit = () => {},
  isSubmitting = false,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [rating, setRating] = useState(8);
  const [comments, setComments] = useState('');
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      const initialId = candidate?.studentId || candidate?.id || candidate?._id || '';
      setSelectedStudentId(initialId);
      setRating(8);
      setComments('');
      setError(null);
    }
  }, [isOpen, candidate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError('Please select a student candidate to evaluate.');
      return;
    }
    if (!comments.trim() || comments.trim().length < 5) {
      setError('Please provide meaningful evaluation comments (minimum 5 characters).');
      return;
    }

    try {
      await onSubmit(selectedStudentId, comments.trim(), rating);
    } catch (err) {
      setError(err?.message || 'Failed to submit feedback.');
    }
  };

  const activeStudentName =
    candidate?.studentName ||
    candidate?.name ||
    candidatesList.find((c) => (c.studentId || c.id || c._id) === selectedStudentId)?.studentName ||
    'Student Candidate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 id="feedback-modal-title" className="text-base font-bold text-slate-900">
              Submit Candidate Feedback
            </h2>
            <p className="text-xs text-slate-500">
              Structured hiring feedback for {activeStudentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Selector if not locked */}
          {!candidate && candidatesList.length > 0 && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Candidate *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-indigo-500"
                required
              >
                <option value="">Select Candidate...</option>
                {candidatesList.map((c) => {
                  const id = c.studentId || c.id || c._id;
                  return (
                    <option key={id} value={id}>
                      {c.studentName || c.name} ({c.email})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Rating (1-10) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 block">
                Technical &amp; Interview Performance (1–10)
              </label>
              <span className="font-bold text-indigo-700 text-sm font-mono flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating} / 10</span>
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 - Needs Improvement</span>
              <span>5 - Meets Bar</span>
              <span>10 - Outstanding</span>
            </div>
          </div>

          {/* Structured Feedback Comments */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              Evaluation Remarks &amp; Recommendations *
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Highlight technical strengths, whiteboard problem-solving, areas for improvement, or hiring recommendation..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
              required
            />
            <span className="text-[11px] text-slate-400 block">
              Feedback directly influences the candidate's campus placement readiness index (30% weight).
            </span>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50/60 -mx-5 -mb-5 mt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Record Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;

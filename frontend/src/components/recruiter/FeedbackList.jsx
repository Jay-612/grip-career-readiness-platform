import React from 'react';
import { Calendar, Star, FileText, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

export const FeedbackList = ({
  feedbacks = [],
  onSelectCandidate = () => {},
  selectedFeedbackId = null,
}) => {
  if (feedbacks.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-white border border-slate-200 text-center space-y-2 text-xs text-slate-500">
        <FileText className="w-8 h-8 text-slate-300 mx-auto" />
        <h4 className="font-bold text-slate-800 text-sm">No Past Feedback Submitted</h4>
        <p>Your submitted candidate evaluations and recommendations will appear here.</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-2.5">
      {feedbacks.map((item) => {
        const student = item.studentId || {};
        const studentName = student.name || 'Candidate';
        const rating = item.rating || 8;
        const isSelected = selectedFeedbackId === (item._id || item.id);

        return (
          <div
            key={item._id || item.id}
            className={`p-4 rounded-xl bg-white border transition-all text-xs space-y-2 ${
              isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{studentName}</span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[11px]">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{rating}/10</span>
                </span>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {formatDate(item.date || item.createdAt)}
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              "{item.comments}"
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Recorded to Student Readiness Record</span>
              </span>

              {student._id && (
                <button
                  onClick={() => onSelectCandidate(student)}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Evaluate Again
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeedbackList;

import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, UserCheck, Star } from 'lucide-react';
import Badge from '../../common/Badge';

export const LatestFeedbackCard = ({ feedback = null }) => {
  // Helper to format date
  const formatDate = (dateVal) => {
    if (!dateVal) return 'Recent';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <article
      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between"
      aria-label="Recent Faculty Feedback"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Recent Mentor Feedback
              </h2>
              <span className="text-[11px] text-slate-400">
                Latest Evaluation Note
              </span>
            </div>
          </div>

          {feedback?.score ? (
            <Badge variant="success" size="xs" className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              <span>{feedback.score}/10</span>
            </Badge>
          ) : (
            <Badge variant="neutral" size="xs">
              Verified
            </Badge>
          )}
        </div>

        {!feedback ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <UserCheck className="w-4 h-4 stroke-[1.5]" />
            </div>
            <h3 className="text-xs font-bold text-slate-800">
              No Evaluation Remarks Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Complete a mock interview or ask a mentor to receive personalized evaluation feedback.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 truncate">
                {feedback.author || 'Faculty Evaluator'}
              </span>
              <span className="text-[11px] text-slate-400 shrink-0">
                {formatDate(feedback.date)}
              </span>
            </div>
            {feedback.title && (
              <p className="text-xs text-slate-700 font-medium truncate">
                {feedback.title}
              </p>
            )}
            <blockquote className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 italic leading-relaxed line-clamp-3">
              "{feedback.content || feedback.excerpt || 'Evaluation feedback recorded.'}"
            </blockquote>
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <Link
          to="/student/guidance"
          className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          <span>View full evaluation →</span>
        </Link>
        <Link
          to="/student/guidance"
          className="text-slate-400 hover:text-slate-600 text-xs"
        >
          Ask Mentor
        </Link>
      </div>
    </article>
  );
};

export default LatestFeedbackCard;

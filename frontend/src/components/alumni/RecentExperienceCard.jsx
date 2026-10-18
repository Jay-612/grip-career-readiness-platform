import React from 'react';
import { BookOpen, Calendar, Edit3, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const RecentExperienceCard = ({
  post,
  onView,
  onEdit,
}) => {
  if (!post) {
    return (
      <section
        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        data-testid="recent-experience-section"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Recent Published Experience
              </h2>
              <p className="text-[11px] text-slate-500">
                Your latest contribution shared with campus students.
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-6 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-2"
          data-testid="no-recent-experience"
        >
          <p>You haven't published any placement stories or advice yet.</p>
          <Link to="/alumni/experience?action=new">
            <Button variant="outline" size="sm" className="text-xs">
              + Publish First Experience
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  const tags = Array.isArray(post.tags) ? post.tags : [];
  const formattedDate = formatDate(post.date);

  return (
    <section
      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
      data-testid="recent-experience-section"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-heading">
              Recent Published Experience
            </h2>
            <p className="text-[11px] text-slate-500">
              Your latest contribution shared with campus students.
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
          Published
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 line-clamp-1 font-heading">
              {post.title}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 flex-wrap">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-300" />
                {formattedDate}
              </span>
            )}
            {tags.length > 0 && (
              <span>• #{tags[0]}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(post)}
                leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                className="text-xs text-slate-600 hover:text-slate-900"
                data-testid="edit-experience-btn"
              >
                Edit
              </Button>
            )}

            {onView && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onView(post)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="text-xs font-semibold"
                data-testid="view-experience-btn"
              >
                View
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentExperienceCard;

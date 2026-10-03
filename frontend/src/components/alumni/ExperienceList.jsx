import React from 'react';
import { Calendar, Edit3, Trash2, Eye, Tag, BookOpen } from 'lucide-react';
import Button from '../common/Button';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently Published';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently Published';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const ExperienceList = ({
  posts = [],
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  onNewExperience,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3 max-w-md mx-auto"
        data-testid="no-experiences"
      >
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-800 font-heading">
            No Published Experiences
          </h3>
          <p className="text-slate-500">
            Share your interview experiences and preparation strategies to guide students.
          </p>
        </div>
        {onNewExperience && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onNewExperience}
            className="text-xs shadow-xs"
            data-testid="empty-publish-btn"
          >
            + Publish First Experience
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="experience-list">
      {posts.map((post) => {
        const pId = post._id || post.id;
        const tags = Array.isArray(post.tags) ? post.tags : [];
        const formattedDate = formatDate(post.date);

        return (
          <article
            key={pId}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all space-y-3 group"
            data-testid="experience-item"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Published
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    {formattedDate}
                  </span>
                </div>

                <h3
                  onClick={() => onView && onView(post)}
                  className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer leading-snug line-clamp-1 font-heading"
                >
                  {post.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 ml-auto">
                {onView && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(post)}
                    leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                    className="text-xs text-slate-600 hover:text-slate-900"
                    data-testid="view-exp-btn"
                  >
                    View
                  </Button>
                )}

                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(post)}
                    leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                    className="text-xs"
                    data-testid="edit-exp-btn"
                  >
                    Edit
                  </Button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(post)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete experience"
                    data-testid="delete-exp-btn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ExperienceList;

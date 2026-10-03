import React from 'react';
import { Building2, Calendar, ArrowRight, User } from 'lucide-react';
import Button from '../../common/Button';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const AlumniPostCard = ({
  post,
  onReadMore,
  onViewAuthor,
}) => {
  const authorName = post.author?.name || post.alumniId?.name || 'Verified Alumni';
  const gradYear = post.author?.graduationYear || post.alumniProfile?.graduationYear;
  const company =
    post.author?.currentCompany ||
    post.alumniProfile?.currentCompany ||
    post.company ||
    '';
  const role =
    post.author?.jobRole ||
    post.alumniProfile?.jobRole ||
    post.role ||
    '';
  const formattedDate = formatDate(post.date);

  // Check if tags or content indicates a referral post
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const isReferral =
    post.isReferral ||
    tags.some((t) => t.toLowerCase().includes('referral')) ||
    post.title?.toLowerCase().includes('referral');

  return (
    <article
      className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:shadow-card-hover hover:border-blue-200 transition-all group"
      data-testid="alumni-post-card"
    >
      <div className="space-y-3">
        {/* Top Meta: Author, Credibility & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onViewAuthor(post)}
                className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors text-left truncate flex items-center gap-1"
                data-testid="author-profile-link"
              >
                <span>{authorName}</span>
              </button>

              {gradYear && (
                <span className="text-xs text-slate-500 font-medium">
                  • Class of {gradYear}
                </span>
              )}
            </div>

            {(company || role) && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                {company && (
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    {company}
                  </span>
                )}
                {role && <span>• {role}</span>}
              </div>
            )}
          </div>

          {/* Referral Badge or Date */}
          <div className="flex items-center gap-2 shrink-0">
            {isReferral && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Referral
              </span>
            )}
          </div>
        </div>

        {/* Post Title */}
        <div>
          <h2
            onClick={() => onReadMore(post)}
            className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer leading-snug line-clamp-2 font-heading"
          >
            {post.title}
          </h2>

          {/* Short Preview Excerpt (line-clamp-2) */}
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Tags & Date */}
        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[11px] text-slate-400 font-medium self-center">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {formattedDate && (
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 ml-auto">
              <Calendar className="w-3 h-3 text-slate-300" />
              {formattedDate}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Clean Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewAuthor(post)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
        >
          <User className="w-3 h-3 text-slate-400" />
          <span>View Profile</span>
        </button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onReadMore(post)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/60 p-0 h-auto"
          data-testid="read-more-btn"
        >
          Read More
        </Button>
      </div>
    </article>
  );
};

export default AlumniPostCard;

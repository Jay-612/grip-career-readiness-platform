import React from 'react';
import { X, Calendar, Building2, User, ExternalLink, Bookmark } from 'lucide-react';
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

export const AlumniPostDetails = ({
  isOpen = false,
  onClose,
  post,
  onViewAuthor,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  if (!isOpen || !post) return null;

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
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const isReferral =
    post.isReferral ||
    tags.some((t) => t.toLowerCase().includes('referral')) ||
    post.title?.toLowerCase().includes('referral');

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end"
      data-testid="alumni-post-details-drawer"
    >
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Alumni Insight
            </span>
            {isReferral && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Referral
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
            aria-label="Close details"
            data-testid="close-post-details-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1">
          {/* Author Callout Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {authorName}
                  </span>
                  {gradYear && (
                    <span className="text-xs text-slate-500 font-medium">
                      • Class of {gradYear}
                    </span>
                  )}
                </div>
                {(company || role) && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5 truncate">
                    {company && (
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        {company}
                      </span>
                    )}
                    {role && <span>• {role}</span>}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onViewAuthor(post)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
              data-testid="drawer-view-author-btn"
            >
              Author Info →
            </button>
          </div>

          {/* Title & Metadata */}
          <div className="space-y-2">
            {formattedDate && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Published on {formattedDate}</span>
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight font-heading">
              {post.title}
            </h1>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Complete Content Body */}
          <div className="border-t border-b border-slate-100 py-4 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap font-sans">
            {post.content}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 flex items-center justify-between gap-3">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={() => onToggleBookmark(post.id || post._id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  isBookmarked ? 'fill-amber-500 text-amber-600' : 'text-slate-400'
                }`}
              />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs ml-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlumniPostDetails;

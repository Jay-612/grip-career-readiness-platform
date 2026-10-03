import React from 'react';
import AlumniPostCard from './AlumniPostCard';
import { SkeletonCard } from '../../common/Skeleton';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';
import Button from '../../common/Button';

export const AlumniPostFeed = ({
  posts = [],
  isLoading = false,
  error = null,
  onRetry,
  onReadMore,
  onViewAuthor,
  hasActiveFilters = false,
  onClearFilters,
  visibleCount = 6,
  onLoadMore,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="feed-loading-state">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load alumni insights"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <div
        className="rounded-2xl bg-white border border-slate-200/90 p-8 text-center space-y-4 max-w-lg mx-auto shadow-xs"
        data-testid="feed-empty-state"
      >
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">
            {hasActiveFilters
              ? 'No alumni insights match these filters.'
              : 'No alumni insights available yet.'}
          </h3>
          <p className="text-xs text-slate-500">
            {hasActiveFilters
              ? 'Try adjusting your search terms, changing the topic chip, or clearing filters.'
              : 'Alumni stories and interview preparation advice will appear here once published.'}
          </p>
        </div>

        {hasActiveFilters && onClearFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs font-semibold"
            data-testid="empty-clear-filters-btn"
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  const displayedPosts = posts.slice(0, visibleCount);
  const hasMore = posts.length > visibleCount;

  return (
    <div className="space-y-6" data-testid="alumni-post-feed">
      {/* 2-3 column responsive grid for compact readable cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedPosts.map((post) => (
          <AlumniPostCard
            key={post.id || post._id}
            post={post}
            onReadMore={onReadMore}
            onViewAuthor={onViewAuthor}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onLoadMore}
            className="text-xs font-semibold px-6 py-2 rounded-xl shadow-xs"
            data-testid="load-more-btn"
          >
            Load More Stories ({posts.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlumniPostFeed;

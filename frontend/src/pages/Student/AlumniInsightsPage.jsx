import React, { useState, useEffect, useMemo } from 'react';
import studentService from '../../services/studentService';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import AlumniInsightsHeader from '../../components/student/alumni/AlumniInsightsHeader';
import AlumniSearchFilters from '../../components/student/alumni/AlumniSearchFilters';
import AlumniPostFeed from '../../components/student/alumni/AlumniPostFeed';
import AlumniPostDetails from '../../components/student/alumni/AlumniPostDetails';
import AlumniProfileDrawer from '../../components/student/alumni/AlumniProfileDrawer';

// Standard topic taxonomy aligned with requirements and actual data
const STANDARD_TOPICS = [
  'Interview Experience',
  'Career Advice',
  'Referral',
  'Company Insights',
];

export const AlumniInsightsPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  // Pagination / Load More: 6-10 visible per load
  const [visibleCount, setVisibleCount] = useState(6);

  // Progressive Disclosure: Post Details & Author Profile Drawers
  const [activePostForDetails, setActivePostForDetails] = useState(null);
  const [activeAuthorForProfile, setActiveAuthorForProfile] = useState(null);

  // Saved / Bookmarked posts (persisted locally)
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('grip_bookmarked_posts');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await studentService.getAlumniPosts({ limit: 50 });
      const fetched = res?.posts || (Array.isArray(res) ? res : []);
      setPosts(fetched);
    } catch (err) {
      console.error('Failed to fetch alumni posts:', err);
      setError(
        err.response?.data?.message ||
          'Unable to load alumni posts at this time. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const toggleBookmark = (postId) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      try {
        localStorage.setItem(
          'grip_bookmarked_posts',
          JSON.stringify(Array.from(next))
        );
      } catch {
        // Ignore storage write issues
      }
      return next;
    });
  };

  // Derive unique companies from loaded posts
  const availableCompanies = useMemo(() => {
    const compSet = new Set();
    posts.forEach((p) => {
      const comp =
        p.author?.currentCompany ||
        p.alumniProfile?.currentCompany ||
        p.company;
      if (comp) compSet.add(comp.trim());
    });
    return Array.from(compSet).sort();
  }, [posts]);

  // Combine standard topics with tags present in loaded posts
  const availableCategories = useMemo(() => {
    const topicSet = new Set(STANDARD_TOPICS);
    posts.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => {
          const t = tag.trim();
          // Add meaningful categories from tags if present
          if (
            ['System Design', 'DevOps', 'Distributed Systems', 'Kubernetes'].includes(t)
          ) {
            topicSet.add(t);
          }
        });
      }
    });
    return Array.from(topicSet);
  }, [posts]);

  // Filter posts based on search query, category, and company
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const cat = selectedCategory.trim().toLowerCase();
    const comp = selectedCompany.trim().toLowerCase();

    return posts.filter((post) => {
      if (!post) return false;

      const title = String(post.title || '').toLowerCase();
      const content = String(post.content || '').toLowerCase();
      const authorName = String(
        post.author?.name || post.alumniId?.name || ''
      ).toLowerCase();
      const role = String(
        post.author?.jobRole || post.alumniProfile?.jobRole || ''
      ).toLowerCase();
      const postCompany = String(
        post.author?.currentCompany ||
          post.alumniProfile?.currentCompany ||
          post.company ||
          ''
      ).toLowerCase();
      const tags = Array.isArray(post.tags) ? post.tags : [];
      const tagsLower = tags.map((t) => String(t).toLowerCase());

      // Search matches: company, role, topic/tags, alumni name, title, content
      const matchesSearch =
        !query ||
        title.includes(query) ||
        content.includes(query) ||
        authorName.includes(query) ||
        postCompany.includes(query) ||
        role.includes(query) ||
        tagsLower.some((t) => t.includes(query));

      // Company filter matches
      const matchesCompany = !comp || postCompany === comp;

      // Category filter matches
      let matchesCategory = true;
      if (cat) {
        if (cat === 'interview experience') {
          matchesCategory =
            tagsLower.some(
              (t) =>
                t.includes('interview') ||
                t.includes('coding') ||
                t.includes('round')
            ) || title.includes('interview');
        } else if (cat === 'career advice') {
          matchesCategory =
            tagsLower.some(
              (t) =>
                t.includes('career') ||
                t.includes('guidance') ||
                t.includes('tips') ||
                t.includes('mentorship')
            ) || title.includes('advice') || title.includes('career');
        } else if (cat === 'referral') {
          matchesCategory =
            Boolean(post.isReferral) ||
            tagsLower.some((t) => t.includes('referral')) ||
            title.includes('referral');
        } else if (cat === 'company insights') {
          matchesCategory =
            tagsLower.some(
              (t) =>
                t.includes('placement') ||
                t.includes('techcorp') ||
                t.includes('cloudsys') ||
                t.includes('journey')
            ) || title.includes('journey') || title.includes('playbook');
        } else {
          // Direct tag match
          matchesCategory =
            tagsLower.includes(cat) ||
            tagsLower.some((t) => t.includes(cat));
        }
      }

      return matchesSearch && matchesCompany && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory, selectedCompany]);

  // Reset pagination when filter criteria change
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedCategory, selectedCompany]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCompany('');
    setVisibleCount(6);
  };

  const handleReadMore = (post) => {
    setActivePostForDetails(post);
  };

  const handleViewAuthor = (postOrAuthor) => {
    const author =
      postOrAuthor.author ||
      (postOrAuthor.alumniId
        ? {
            name: postOrAuthor.alumniId.name,
            email: postOrAuthor.alumniId.email,
            graduationYear:
              postOrAuthor.alumniProfile?.graduationYear ||
              postOrAuthor.author?.graduationYear,
            currentCompany:
              postOrAuthor.alumniProfile?.currentCompany ||
              postOrAuthor.author?.currentCompany,
            jobRole:
              postOrAuthor.alumniProfile?.jobRole ||
              postOrAuthor.author?.jobRole,
          }
        : postOrAuthor);

    setActiveAuthorForProfile(author);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || selectedCompany
  );

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* 1. Page Header */}
        <AlumniInsightsHeader />

        {/* 2. Search & Compact Filters */}
        <AlumniSearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          selectedCompany={selectedCompany}
          onCompanySelect={setSelectedCompany}
          availableCompanies={availableCompanies}
          availableCategories={availableCategories}
          onClearFilters={handleClearFilters}
          totalResults={filteredPosts.length}
        />

        {/* 3. Alumni Post Feed */}
        <AlumniPostFeed
          posts={filteredPosts}
          isLoading={isLoading}
          error={error}
          onRetry={loadPosts}
          onReadMore={handleReadMore}
          onViewAuthor={handleViewAuthor}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          visibleCount={visibleCount}
          onLoadMore={() => setVisibleCount((prev) => prev + 6)}
        />

        {/* 4. Post Details Drawer / Expanded View */}
        {activePostForDetails && (
          <AlumniPostDetails
            isOpen={Boolean(activePostForDetails)}
            onClose={() => setActivePostForDetails(null)}
            post={activePostForDetails}
            onViewAuthor={(p) => {
              setActivePostForDetails(null);
              handleViewAuthor(p);
            }}
            isBookmarked={bookmarkedIds.has(
              activePostForDetails.id || activePostForDetails._id
            )}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {/* 5. Author Profile Drawer */}
        {activeAuthorForProfile && (
          <AlumniProfileDrawer
            isOpen={Boolean(activeAuthorForProfile)}
            onClose={() => setActiveAuthorForProfile(null)}
            author={activeAuthorForProfile}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AlumniInsightsPage;

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import guidanceService from '../../services/guidanceService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import {
  BookOpen,
  Search,
  Tag,
  Building2,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Share2,
  Bookmark,
  CheckCircle2,
  Filter,
  ExternalLink,
  Send,
  HelpCircle,
} from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently Published';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently Published';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculateReadTime = (text = '') => {
  const wordsPerMinute = 180;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes || 1} min read`;
};

export const AlumniInsightsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, filter, and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Full article modal state
  const [activePostModal, setActivePostModal] = useState(null);

  // Ask Mentor quick-compose modal state
  const [askMentorModalOpen, setAskMentorModalOpen] = useState(false);
  const [targetMentor, setTargetMentor] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionSuccessToast, setQuestionSuccessToast] = useState(null);
  const [questionError, setQuestionError] = useState(null);

  // Saved / Bookmarked posts (client state)
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
        // Ignore localStorage quota errors
      }
      return next;
    });
  };

  // Derive unique tags from loaded posts
  const availableTags = useMemo(() => {
    const tagSet = new Set();
    posts.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => tagSet.add(t.trim()));
      }
    });
    return Array.from(tagSet);
  }, [posts]);

  // Unique companies represented
  const uniqueCompanies = useMemo(() => {
    const compSet = new Set();
    posts.forEach((p) => {
      const company =
        p.author?.currentCompany ||
        p.alumniProfile?.currentCompany ||
        p.company;
      if (company) compSet.add(company);
    });
    return Array.from(compSet);
  }, [posts]);

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts
      .filter((post) => {
        if (!post) return false;

        const title = String(post.title || '').toLowerCase();
        const content = String(post.content || '').toLowerCase();
        const authorName = String(
          post.author?.name || post.alumniId?.name || ''
        ).toLowerCase();
        const company = String(
          post.author?.currentCompany ||
            post.alumniProfile?.currentCompany ||
            ''
        ).toLowerCase();
        const tags = Array.isArray(post.tags) ? post.tags : [];

        const matchesQuery =
          !query ||
          title.includes(query) ||
          content.includes(query) ||
          authorName.includes(query) ||
          company.includes(query) ||
          tags.some((t) => t.toLowerCase().includes(query));

        const matchesTag =
          !selectedTag ||
          tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

        return matchesQuery && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return new Date(a.date || 0) - new Date(b.date || 0);
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        // Default: newest first
        return new Date(b.date || 0) - new Date(a.date || 0);
      });
  }, [posts, searchQuery, selectedTag, sortBy]);

  // Handle Quick Mentorship Question
  const handleOpenAskMentor = (post) => {
    const authorName = post.author?.name || post.alumniId?.name || 'Alumni Mentor';
    const postTitle = post.title || 'your recent placement post';
    setTargetMentor({
      authorName,
      postTitle,
      authorEmail: post.author?.email || post.alumniId?.email,
      company: post.author?.currentCompany || post.alumniProfile?.currentCompany,
    });
    setQuestionText(
      `Hi ${authorName}, I read your post "${postTitle}" and found your insights very helpful. Could you provide some additional guidance on...`
    );
    setQuestionError(null);
    setAskMentorModalOpen(true);
  };

  const handleSendQuestion = async (e) => {
    if (e) e.preventDefault();
    if (!questionText.trim()) {
      setQuestionError('Please enter your question before submitting.');
      return;
    }
    setIsSubmittingQuestion(true);
    setQuestionError(null);

    try {
      await guidanceService.createRequest(questionText.trim());
      setAskMentorModalOpen(false);
      setQuestionText('');
      setQuestionSuccessToast(
        'Your question was submitted to the Mentorship portal! Mentors will be notified.'
      );
      setTimeout(() => setQuestionSuccessToast(null), 5000);
    } catch (err) {
      console.error('Failed to submit guidance request:', err);
      setQuestionError(
        err.response?.data?.message ||
          'Failed to submit guidance request. Please try again from the Mentorship page.'
      );
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Tier 1: Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-card">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>VERIFIED ALUMNI KNOWLEDGE NETWORK</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Alumni Placement Stories & Playbooks
              </h1>
              <p className="text-sm text-blue-100/90 leading-relaxed">
                Direct interview transcripts, technical tradeoff reflections, and
                campus placement strategies shared by alumni working across top
                tier engineering teams.
              </p>
            </div>

            {/* Quick Metrics Callout Card */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 self-start md:self-auto shrink-0">
              <div className="flex flex-col text-center px-3 border-r border-white/20">
                <span className="text-2xl font-black text-white">
                  {posts.length}
                </span>
                <span className="text-[11px] font-medium text-blue-100">
                  Published Stories
                </span>
              </div>
              <div className="flex flex-col text-center px-3 border-r border-white/20">
                <span className="text-2xl font-black text-white">
                  {uniqueCompanies.length || '3+'}
                </span>
                <span className="text-[11px] font-medium text-blue-100">
                  Companies
                </span>
              </div>
              <div className="flex flex-col text-center px-3">
                <span className="text-2xl font-black text-white">
                  100%
                </span>
                <span className="text-[11px] font-medium text-blue-100">
                  Verified Alumni
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {questionSuccessToast && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <span>{questionSuccessToast}</span>{' '}
              <Link
                to="/student/guidance"
                className="underline font-bold text-emerald-900 ml-1 hover:text-emerald-950"
              >
                View in Mentorship & Q&A →
              </Link>
            </div>
          </div>
        )}

        {/* Tier 2: Search, Filters & Category Pills */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stories by company (TechCorp, CloudSys), role, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort alumni stories"
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="newest">Most Recent</option>
                <option value="oldest">Earliest Published</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Tag Filter Pills */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3" /> Topics:
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  !selectedTag
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                All Topics ({posts.length})
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setSelectedTag(selectedTag === tag ? '' : tag)
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tier 3: Stories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load alumni stories"
            message={error}
            onRetry={loadPosts}
          />
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            title="No alumni stories match your criteria"
            description={
              searchQuery || selectedTag
                ? 'Try adjusting your search query or removing the selected topic filter.'
                : 'Verified alumni are preparing placement stories. Check back soon!'
            }
            actionLabel={
              searchQuery || selectedTag ? 'Clear Filters' : undefined
            }
            onAction={
              searchQuery || selectedTag
                ? () => {
                    setSearchQuery('');
                    setSelectedTag('');
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const postId = post.id || post._id;
              const authorName =
                post.author?.name || post.alumniId?.name || 'Alumni Mentor';
              const authorEmail =
                post.author?.email || post.alumniId?.email || '';
              const company =
                post.author?.currentCompany ||
                post.alumniProfile?.currentCompany ||
                'Top Tier Tech';
              const role =
                post.author?.jobRole ||
                post.alumniProfile?.jobRole ||
                'Software Engineer';
              const gradYear =
                post.author?.graduationYear ||
                post.alumniProfile?.graduationYear;
              const isBookmarked = bookmarkedIds.has(postId);
              const readTime = calculateReadTime(post.content);

              return (
                <article
                  key={postId}
                  className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-5 shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all group"
                >
                  {/* Card Top: Author Metadata */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 truncate">
                              {authorName}
                            </span>
                            <Badge variant="primary" size="sm">
                              Alumni
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700">
                              {company}
                            </span>
                            {role && <span>• {role}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(postId)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={
                          isBookmarked ? 'Remove bookmark' : 'Bookmark story'
                        }
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isBookmarked ? 'fill-amber-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Article Details */}
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {readTime}
                        </span>
                        {gradYear && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">
                              Batch of {gradYear}
                            </span>
                          </>
                        )}
                      </div>

                      <h2
                        onClick={() => setActivePostModal(post)}
                        className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
                      >
                        {post.title}
                      </h2>

                      <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Tag Pills */}
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            onClick={() => setSelectedTag(tag.trim())}
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-[11px] text-slate-400 font-medium self-center">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: CTAs */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAskMentor(post)}
                      leftIcon={<MessageSquare className="w-3.5 h-3.5 text-blue-600" />}
                      className="text-xs font-semibold"
                    >
                      Ask Alumni
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePostModal(post)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Read Story
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Tier 4: Quick Mentorship Link Card */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-base text-white">
                Need Specific Guidance from Alumni Mentors?
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Our verified alumni are available for 1:1 resume teardowns, mock
              interview evaluations, and career roadmap inquiries in the
              Mentorship portal.
            </p>
          </div>
          <Link to="/student/guidance">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="whitespace-nowrap shadow-xs"
            >
              Go to Mentorship Q&A
            </Button>
          </Link>
        </div>

        {/* ── Modal 1: Full Article Reader ────────────────────────────── */}
        {activePostModal && (
          <Modal
            isOpen={Boolean(activePostModal)}
            onClose={() => setActivePostModal(null)}
            title="Alumni Placement Story"
            size="lg"
          >
            <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
              {/* Header Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {(
                      activePostModal.author?.name ||
                      activePostModal.alumniId?.name ||
                      'A'
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {activePostModal.author?.name ||
                          activePostModal.alumniId?.name ||
                          'Verified Alumni'}
                      </span>
                      <Badge variant="primary" size="sm">
                        Alumni Mentor
                      </Badge>
                      {activePostModal.author?.graduationYear && (
                        <span className="text-xs text-slate-500 font-medium">
                          • Class of {activePostModal.author.graduationYear}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-800">
                        {activePostModal.author?.currentCompany ||
                          activePostModal.alumniProfile?.currentCompany ||
                          'Leading Tech Company'}
                      </span>
                      {(activePostModal.author?.jobRole ||
                        activePostModal.alumniProfile?.jobRole) && (
                        <span>
                          •{' '}
                          {activePostModal.author?.jobRole ||
                            activePostModal.alumniProfile?.jobRole}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-slate-600">
                    {formatDate(activePostModal.date)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {calculateReadTime(activePostModal.content)}
                  </div>
                </div>
              </div>

              {/* Title & Tags */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {activePostModal.title}
                </h2>
                {Array.isArray(activePostModal.tags) && (
                  <div className="flex flex-wrap gap-1.5">
                    {activePostModal.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Full Content Body */}
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-4 whitespace-pre-wrap font-sans text-sm border-t border-b border-slate-100 py-4">
                {activePostModal.content}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(activePostModal.id || activePostModal._id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      bookmarkedIds.has(activePostModal.id || activePostModal._id)
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        bookmarkedIds.has(activePostModal.id || activePostModal._id)
                          ? 'fill-amber-500 text-amber-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>
                      {bookmarkedIds.has(activePostModal.id || activePostModal._id)
                        ? 'Bookmarked'
                        : 'Save Story'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActivePostModal(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const cur = activePostModal;
                      setActivePostModal(null);
                      handleOpenAskMentor(cur);
                    }}
                    leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  >
                    Ask Author a Question
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* ── Modal 2: Quick Mentorship Question Composer ─────────────── */}
        {askMentorModalOpen && targetMentor && (
          <Modal
            isOpen={askMentorModalOpen}
            onClose={() => setAskMentorModalOpen(false)}
            title="Ask Alumni Mentor"
            size="md"
          >
            <form onSubmit={handleSendQuestion} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {targetMentor.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs">
                  <span className="font-bold text-blue-950">
                    {targetMentor.authorName}
                  </span>{' '}
                  {targetMentor.company && (
                    <span className="text-blue-700">
                      ({targetMentor.company})
                    </span>
                  )}
                  <p className="text-blue-800/80 mt-0.5 text-[11px]">
                    Inquiring regarding: <em>"{targetMentor.postTitle}"</em>
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="question-text"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Your Guidance Question
                </label>
                <textarea
                  id="question-text"
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Describe your doubt, resume question, or request interview advice..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
                  disabled={isSubmittingQuestion}
                />
              </div>

              {questionError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {questionError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAskMentorModalOpen(false)}
                  disabled={isSubmittingQuestion}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingQuestion}
                  disabled={isSubmittingQuestion || !questionText.trim()}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Send Inquiry
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AlumniInsightsPage;

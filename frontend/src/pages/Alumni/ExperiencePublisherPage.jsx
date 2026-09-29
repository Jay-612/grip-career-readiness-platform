import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import alumniService from '../../services/alumniService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Tag,
  Search,
  Filter,
  Layers,
  FileText,
  AlertCircle,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Building2,
  Briefcase,
  HelpCircle,
  Send
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

const SUGGESTED_TAGS = [
  'Interview Prep',
  'Backend Engineering',
  'System Design',
  'DSA & Algorithms',
  'Cloud & DevOps',
  'Campus Drives',
  'Internship Experience',
  'Resume & Portfolio',
  'Negotiation & Offers',
];

const STARTER_TEMPLATE = `### 1. Role & Organization Context
Share details about your day-to-day engineering stack, team structure, and core responsibilities.

### 2. Campus Interview Process
Outline the assessment stages (e.g., Coding Round, Technical Screen, System Design Whiteboard, HR/Behavioral).

### 3. Preparation Strategy & Crucial Focus Areas
What specific topics, projects, or problem-solving approaches made the biggest difference during your preparation?

### 4. Key Lessons & Advice for Students
Practical tips on mindset, college coursework, and navigating high-pressure campus placement season.`;

export const ExperiencePublisherPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [posts, setPosts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Tabs: 'my-posts' | 'community' | 'composer'
  const [activeTab, setActiveTab] = useState('my-posts');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Form / Composer State
  const [editingPostId, setEditingPostId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expanded post IDs for preview toggle in list
  const [expandedPostIds, setExpandedPostIds] = useState(new Set());

  const currentUserId = (user?.id || user?._id || '').toString();

  // Load all posts and profile from backend
  const loadPostsAndProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [postsRes, profileRes] = await Promise.allSettled([
        alumniService.getPosts({ page: 1, limit: 50 }),
        alumniService.getProfile(),
      ]);

      if (postsRes.status === 'fulfilled' && postsRes.value) {
        const postList = postsRes.value.posts || (Array.isArray(postsRes.value) ? postsRes.value : []);
        setPosts(postList);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfileData(profileRes.value);
      }
    } catch (err) {
      console.error('Failed to load experience posts:', err);
      setError(err?.response?.data?.message || 'Unable to connect to experience repository.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPostsAndProfile();
  }, [user]);

  // Derived filtered posts authored by current logged-in Alumni
  const myPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    return list.filter((p) => {
      if (!p) return false;
      const authorId = (p.alumniId?._id || p.alumniId?.id || p.alumniId || '').toString();
      return Boolean(authorId && authorId === currentUserId);
    });
  }, [posts, currentUserId]);

  // Filtered views based on search query and tag selection
  const filteredMyPosts = useMemo(() => {
    const query = (searchQuery || '').trim().toLowerCase();
    const tagLower = (selectedTag || '').trim().toLowerCase();
    return myPosts.filter((post) => {
      if (!post) return false;
      const titleStr = String(post.title || '').toLowerCase();
      const contentStr = String(post.content || '').toLowerCase();
      const matchesSearch =
        !query ||
        titleStr.includes(query) ||
        contentStr.includes(query);
      const postTags = Array.isArray(post.tags) ? post.tags : [];
      const matchesTag =
        !tagLower ||
        postTags.some((t) => String(t || '').toLowerCase() === tagLower);
      return matchesSearch && matchesTag;
    });
  }, [myPosts, searchQuery, selectedTag]);

  const filteredCommunityPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    const query = (searchQuery || '').trim().toLowerCase();
    const tagLower = (selectedTag || '').trim().toLowerCase();
    return list.filter((post) => {
      if (!post) return false;
      const titleStr = String(post.title || '').toLowerCase();
      const contentStr = String(post.content || '').toLowerCase();
      const authorName = String(post.alumniId?.name || '').toLowerCase();
      const matchesSearch =
        !query ||
        titleStr.includes(query) ||
        contentStr.includes(query) ||
        authorName.includes(query);
      const postTags = Array.isArray(post.tags) ? post.tags : [];
      const matchesTag =
        !tagLower ||
        postTags.some((t) => String(t || '').toLowerCase() === tagLower);
      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  // Switch to Composer for New Post
  const handleOpenNewComposer = () => {
    setEditingPostId(null);
    setTitle('');
    setContent('');
    setTags(['Interview Prep']);
    setFormError(null);
    setPreviewMode(false);
    setActiveTab('composer');
  };

  // Switch to Composer for Editing Existing Post
  const handleOpenEditComposer = (post) => {
    setEditingPostId(post._id || post.id);
    setTitle(post.title || '');
    setContent(post.content || '');
    setTags(Array.isArray(post.tags) ? [...post.tags] : []);
    setFormError(null);
    setPreviewMode(false);
    setActiveTab('composer');
  };

  // Insert Starter Template into Content
  const handleInsertTemplate = () => {
    if (content.trim().length > 0) {
      if (!window.confirm('Insert starter template? This will append guideline sections to your current text.')) {
        return;
      }
      setContent((prev) => `${prev}\n\n${STARTER_TEMPLATE}`);
    } else {
      setContent(STARTER_TEMPLATE);
    }
  };

  // Tag management
  const toggleSuggestedTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const clean = customTagInput.trim().replace(/^#/, '');
    if (clean && !tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setTags([...tags, clean]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Submit Experience Post (Create or Update)
  const handleSubmitExperience = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Please provide both a title and article content.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      title: title.trim(),
      content: content.trim(),
      tags: tags.map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (editingPostId) {
        // Update existing post
        const res = await alumniService.updatePost(editingPostId, payload);
        const updatedPost = res.post || { ...payload, _id: editingPostId, date: new Date().toISOString() };

        setPosts((prev) =>
          prev.map((p) => ((p._id || p.id) === editingPostId ? { ...p, ...updatedPost } : p))
        );
        setToastMessage(`Experience "${title.trim()}" updated successfully.`);
      } else {
        // Create new post (immediately published by backend)
        const res = await alumniService.createPost(payload);
        const createdPost = res.post || {
          ...payload,
          _id: res._id || Date.now().toString(),
          date: new Date().toISOString(),
          alumniId: {
            _id: currentUserId,
            name: user?.name || 'Verified Alumni',
            email: user?.email || '',
          },
        };

        setPosts((prev) => [createdPost, ...prev]);
        setToastMessage(`Experience "${title.trim()}" published to the campus network!`);
      }

      // Reset form & return to My Experiences tab
      setEditingPostId(null);
      setTitle('');
      setContent('');
      setTags([]);
      setActiveTab('my-posts');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save experience post:', err);
      setFormError(err?.response?.data?.message || 'Failed to save experience. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Delete Confirmation
  const confirmDeletePost = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  // Execute Deletion
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    const postId = postToDelete._id || postToDelete.id;

    setIsDeleting(true);
    try {
      await alumniService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      setToastMessage('Experience post deleted permanently.');
      setDeleteModalOpen(false);
      setPostToDelete(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err?.response?.data?.message || 'Failed to delete experience post.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Expand / Collapse Content Snippet
  const toggleExpandPost = (postId) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto py-2">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-2xl mx-auto">
        <ErrorState
          title="Experience Publisher Error"
          message={error}
          onRetry={loadPostsAndProfile}
        />
      </div>
    );
  }

  // Alumni profile metadata
  const currentAlumniProfile = profileData?.profile || {};
  const currentAlumniRole = currentAlumniProfile.jobRole || 'Industry Mentor';
  const currentAlumniCompany = currentAlumniProfile.currentCompany || 'Campus Partner';

  return (
    <div className="space-y-7 max-w-[1400px] mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-900 text-white shadow-lg border border-emerald-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER SECTION                                                            */}
      {/* ========================================================================= */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-[#0d223c] to-[#08182b] text-white p-6 md:p-8 card-shadow relative overflow-hidden">
        {/* Watermark Icon */}
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <BookOpen className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs backdrop-blur-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Alumni Knowledge Sharing &amp; Career Debriefs • Real-Time Publishing</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Experience Publisher
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Share real-world interview experiences, engineering transition journeys, and tactical guidance
              to prepare students for competitive campus placement drives.
            </p>
          </div>

          {/* Quick Metrics & Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/15">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>My Published Guides:</span>
                <strong className="text-white font-mono text-sm">{myPosts.length}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Community Articles:</span>
                <strong className="text-white font-mono text-sm">{posts.length}</strong>
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenNewComposer}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-xs text-xs font-semibold"
            >
              + Write New Experience
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* NAVIGATION TABS & FILTER BAR                                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my-posts')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'my-posts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Experiences ({myPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'community'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Campus Feed ({posts.length})</span>
          </button>

          <button
            onClick={handleOpenNewComposer}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'composer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{editingPostId ? 'Edit Experience' : 'Compose Guide'}</span>
          </button>
        </div>

        {/* Search Bar (visible on list tabs) */}
        {activeTab !== 'composer' && (
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiences..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {selectedTag && (
              <button
                onClick={() => setSelectedTag('')}
                className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold flex items-center gap-1 border border-blue-200"
              >
                <span>#{selectedTag}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY EXPERIENCES                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'my-posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Authored Experiences</h2>
              <p className="text-xs text-slate-500">
                Articles and debriefs published under your verified alumni profile.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredMyPosts.length} of {myPosts.length} posts
            </span>
          </div>

          {filteredMyPosts.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-7 h-7 text-slate-400 stroke-[1.5]" />}
              title={myPosts.length === 0 ? "You haven't shared an experience yet" : "No matching experiences found"}
              description={
                myPosts.length === 0
                  ? "Share your career journey, interview experiences, and technical insights to help students prepare for campus placements."
                  : "Try clearing your search query or tag filter to view your published articles."
              }
              action={
                myPosts.length === 0 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenNewComposer}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Publish Your First Experience
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedTag(''); }}>
                    Clear Filters
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredMyPosts.map((post) => {
                const postId = post._id || post.id;
                const postDate = formatDate(post.date);
                const isExpanded = expandedPostIds.has(postId);
                const postContent = String(post.content || '');
                const contentSnippet = postContent.slice(0, 260);
                const hasMore = postContent.length > 260;

                return (
                  <div
                    key={postId}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:border-slate-300 transition-all space-y-3.5"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="success" size="xs">
                            Published
                          </Badge>
                          <span className="text-slate-400 text-xs font-mono">• {postDate}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                          {post.title || 'Untitled Experience'}
                        </h3>
                      </div>

                      {/* Author Action Controls (Only for own posts) */}
                      <div className="flex items-center gap-2 shrink-0 self-start">
                        <button
                          onClick={() => handleOpenEditComposer(post)}
                          className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => confirmDeletePost(post)}
                          className="h-8 px-3 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                      {isExpanded ? postContent : `${contentSnippet}${hasMore ? '...' : ''}`}
                    </div>

                    {hasMore && (
                      <button
                        onClick={() => toggleExpandPost(postId)}
                        className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Show Less' : 'Read Full Article'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* Tags List */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                        <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {post.tags.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTag(t)}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[11px] font-medium transition-colors"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMMUNITY FEED                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus Alumni Knowledge Feed</h2>
              <p className="text-xs text-slate-500">
                Explore guides and career journeys published by alumni mentors across departments.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredCommunityPosts.length} experiences
            </span>
          </div>

          {filteredCommunityPosts.length === 0 ? (
            <EmptyState
              icon={<Users className="w-7 h-7 text-slate-400 stroke-[1.5]" />}
              title="No Community Posts Found"
              description="No published experiences match your filter criteria."
              action={
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedTag(''); }}>
                  Reset Filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredCommunityPosts.map((post) => {
                const postId = post._id || post.id;
                const postDate = formatDate(post.date);
                const authorId = (post.alumniId?._id || post.alumniId?.id || post.alumniId || '').toString();
                const isMine = Boolean(authorId && authorId === currentUserId);
                const isExpanded = expandedPostIds.has(postId);
                const authorName = post.alumniId?.name || (isMine ? (user?.name || 'You') : 'Verified Alumni');
                const authorInitial = String(authorName || 'A').charAt(0).toUpperCase();
                const postContent = String(post.content || '');
                const contentSnippet = postContent.slice(0, 260);
                const hasMore = postContent.length > 260;

                return (
                  <div
                    key={postId}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Author Meta Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {authorInitial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {authorName}
                            </span>
                            {isMine && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                                Your Post
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Verified Alumni Mentor • {postDate}
                          </p>
                        </div>
                      </div>

                      {/* If authored by current user, provide Edit access directly */}
                      {isMine && (
                        <button
                          onClick={() => handleOpenEditComposer(post)}
                          className="h-7 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-slate-400" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                      {post.title || 'Untitled Experience'}
                    </h3>

                    {/* Content Preview */}
                    <div className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                      {isExpanded ? postContent : `${contentSnippet}${hasMore ? '...' : ''}`}
                    </div>

                    {hasMore && (
                      <button
                        onClick={() => toggleExpandPost(postId)}
                        className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Show Less' : 'Read Full Experience'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* Tags List */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                        {post.tags.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTag(t)}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[11px] font-medium transition-colors"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CREATE / EDIT EXPERIENCE COMPOSER                                  */}
      {/* ========================================================================= */}
      {activeTab === 'composer' && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-card p-6 md:p-8 space-y-6">
          {/* Composer Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-600 text-white">
                  <Edit3 className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {editingPostId ? 'Edit Published Experience' : 'Compose New Career Experience'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingPostId
                  ? 'Update your published article. Changes reflect immediately across student feeds.'
                  : 'Write a practical debrief on hiring rounds, day-1 tech expectations, and interview advice.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`h-8 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  previewMode
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{previewMode ? 'Back to Editor' : 'Live Student Preview'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('my-posts')}
                className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* PREVIEW MODE */}
          {previewMode ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                <span>Previewing how this experience appears to student candidates</span>
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className="font-bold underline text-blue-700"
                >
                  Return to Edit Form
                </button>
              </div>

              {/* Mock Student Perspective Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {(user?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {user?.name || 'Alumni Mentor'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Verified Alumni
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {currentAlumniRole} • {currentAlumniCompany}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Today</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {title || 'Untitled Experience Post'}
                </h3>

                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  {content || 'No content written yet. Click "Return to Edit Form" to draft your insights.'}
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                    {tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* EDITOR FORM */
            <form onSubmit={handleSubmitExperience} className="space-y-5">
              {/* Field 1: Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Experience Title <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {title.length}/120 characters
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SDE-1 Placement at TechCorp: Technical Whiteboard, DSA Questions & Advice"
                  className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>

              {/* Field 2: Tags & Categories Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Topic Tags &amp; Competencies
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {SUGGESTED_TAGS.map((stag) => {
                    const isSelected = tags.includes(stag);
                    return (
                      <button
                        type="button"
                        key={stag}
                        onClick={() => toggleSuggestedTag(stag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>#{stag}</span>
                        {isSelected && <X className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input */}
                <div className="flex items-center gap-2 pt-1 max-w-sm">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="Add custom tag (e.g. Kafka, SRE)..."
                    className="flex-1 bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:border-blue-600"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomTag(e);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleAddCustomTag}
                    disabled={!customTagInput.trim()}
                  >
                    Add Tag
                  </Button>
                </div>

                {/* Selected Tag Pills */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">Selected tags:</span>
                    {tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-blue-500 hover:text-blue-800 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 3: Markdown Content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Experience Content <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleInsertTemplate}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Insert Structured Template</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share details on your placement rounds, technical preparation, coding questions, and advice for students..."
                  className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-4 transition-colors focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Tip: Use markdown headings (###) to separate interview rounds and advice sections for high readability.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(true)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  Preview as Student
                </Button>

                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isSaving}
                    onClick={() => setActiveTab('my-posts')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                    loadingText={editingPostId ? 'Saving Changes...' : 'Publishing Guide...'}
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                    className="shadow-xs font-semibold"
                  >
                    {editingPostId ? 'Save Updates' : 'Publish Experience'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Experience Guide"
        description="Are you sure you want to permanently remove this experience post?"
        size="sm"
      >
        {postToDelete && (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 space-y-1">
              <h4 className="text-xs font-bold text-rose-900 leading-snug">
                "{postToDelete.title}"
              </h4>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                This action is irreversible. The experience will be removed from the campus knowledge repository immediately.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                loadingText="Deleting..."
                onClick={handleDeletePost}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const SafeExperiencePublisherPage = (props) => (
  <ErrorBoundary fallbackTitle="Experience Publisher Encountered an Issue">
    <ExperiencePublisherPage {...props} />
  </ErrorBoundary>
);

export default SafeExperiencePublisherPage;


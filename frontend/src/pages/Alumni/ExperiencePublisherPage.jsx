import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import alumniService from '../../services/alumniService';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import ExperienceList from '../../components/alumni/ExperienceList';
import ExperienceEditorModal from '../../components/alumni/ExperienceEditorModal';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Plus, Search, CheckCircle2, X, Sparkles, BookOpen } from 'lucide-react';

export const ExperiencePublisherPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // View Reader Modal State
  const [activePostToView, setActivePostToView] = useState(null);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUserId = (user?.id || user?._id || '').toString();

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await alumniService.getPosts({ page: 1, limit: 50 });
      const postList = res?.posts || (Array.isArray(res) ? res : []);
      setPosts(postList);
    } catch (err) {
      console.error('Failed to load experiences:', err);
      setError(
        err?.response?.data?.message || 'Unable to connect to experience repository.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [user]);

  // Handle URL query action params (e.g. ?action=new)
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setPostToEdit(null);
      setIsEditorOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Filter posts authored by current alumni
  const myPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    return list.filter((p) => {
      if (!p) return false;
      const authorId = (p.alumniId?._id || p.alumniId?.id || p.alumniId || '').toString();
      return Boolean(authorId && authorId === currentUserId);
    });
  }, [posts, currentUserId]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return myPosts;
    return myPosts.filter((p) => {
      const title = String(p.title || '').toLowerCase();
      const content = String(p.content || '').toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';
      return title.includes(q) || content.includes(q) || tags.includes(q);
    });
  }, [myPosts, searchQuery]);

  // ─── Actions: Save / Edit / Delete ────────────────────────────────
  const handleOpenNew = () => {
    setPostToEdit(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (post) => {
    setPostToEdit(post);
    setIsEditorOpen(true);
  };

  const handleSaveExperience = async (payload) => {
    setIsSaving(true);
    try {
      if (payload.id) {
        // Update existing
        const res = await alumniService.updatePost(payload.id, {
          title: payload.title,
          content: payload.content,
          tags: payload.tags,
        });

        const updated = res.post || {
          ...payload,
          _id: payload.id,
          date: new Date().toISOString(),
        };

        setPosts((prev) =>
          prev.map((p) => ((p._id || p.id) === payload.id ? { ...p, ...updated } : p))
        );
        setToastMessage(`Experience "${payload.title}" updated successfully.`);
      } else {
        // Create new
        const res = await alumniService.createPost({
          title: payload.title,
          content: payload.content,
          tags: payload.tags,
        });

        const created = res.post || {
          ...payload,
          _id: res._id || Date.now().toString(),
          date: new Date().toISOString(),
          alumniId: {
            _id: currentUserId,
            name: user?.name || 'Verified Alumni',
            email: user?.email || '',
          },
        };

        setPosts((prev) => [created, ...prev]);
        setToastMessage(`Experience "${payload.title}" published!`);
      }

      setIsEditorOpen(false);
      setPostToEdit(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save experience post:', err);
      alert(err?.response?.data?.message || 'Failed to save experience post.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (post) => {
    setPostToDelete(post);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    const postId = postToDelete._id || postToDelete.id;

    setIsDeleting(true);
    try {
      await alumniService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      setToastMessage('Experience post deleted.');
      setIsDeleteOpen(false);
      setPostToDelete(null);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err?.response?.data?.message || 'Failed to delete experience post.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. Page Header & Top CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
              My Published Experiences
            </h1>
            <p className="text-xs text-slate-500">
              Publish and manage your interview experiences and career playbooks.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOpenNew}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-xs self-start sm:self-auto text-xs"
            data-testid="publish-experience-btn"
          >
            Publish Experience
          </Button>
        </div>

        {/* 2. Search & Compact Filters */}
        {myPosts.length > 0 && (
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your published experiences by title, topic, or content..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                data-testid="search-experience-input"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-blue-600 hover:underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* 3. Published List */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load experiences"
            message={error}
            onRetry={loadPosts}
          />
        ) : (
          <ExperienceList
            posts={filteredPosts}
            onView={(p) => setActivePostToView(p)}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onNewExperience={handleOpenNew}
          />
        )}

        {/* ── Modal 1: Editor (Create / Edit) ──────────────────────── */}
        <ExperienceEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setPostToEdit(null);
          }}
          initialData={postToEdit}
          onSave={handleSaveExperience}
          isSaving={isSaving}
        />

        {/* ── Modal 2: View Reader ─────────────────────────────────── */}
        {activePostToView && (
          <Modal
            isOpen={Boolean(activePostToView)}
            onClose={() => setActivePostToView(null)}
            title="Published Experience"
            size="lg"
          >
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Published Article
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-heading leading-tight pt-1">
                  {activePostToView.title}
                </h2>
              </div>

              {Array.isArray(activePostToView.tags) && (
                <div className="flex flex-wrap gap-1.5">
                  {activePostToView.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-b border-slate-100 py-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                {activePostToView.content}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePostToView(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const post = activePostToView;
                    setActivePostToView(null);
                    handleOpenEdit(post);
                  }}
                  className="text-xs shadow-xs"
                >
                  Edit Article
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* ── Modal 3: Delete Confirmation ─────────────────────────── */}
        {isDeleteOpen && postToDelete && (
          <Modal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            title="Delete Experience"
            size="sm"
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Are you sure you want to permanently delete{' '}
                <strong>"{postToDelete.title}"</strong>? This will remove the article
                from student feeds.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={isDeleting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmDelete}
                  isLoading={isDeleting}
                  className="text-xs"
                  data-testid="confirm-delete-btn"
                >
                  Delete Post
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ExperiencePublisherPage;

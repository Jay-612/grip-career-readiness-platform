import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const SUGGESTED_TAGS = [
  'Interview Prep',
  'Career Advice',
  'System Design',
  'DSA & Algorithms',
  'Cloud & DevOps',
  'Referral',
  'Company Insights',
];

export const ExperienceEditorModal = ({
  isOpen = false,
  onClose,
  initialData = null,
  onSave,
  isSaving = false,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setTags(Array.isArray(initialData.tags) ? [...initialData.tags] : []);
    } else {
      setTitle('');
      setContent('');
      setTags(['Interview Prep']);
    }
    setFormError(null);
    setCustomTag('');
  }, [initialData, isOpen]);

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const clean = customTag.trim().replace(/^#/, '');
    if (clean && !tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setTags([...tags, clean]);
      setCustomTag('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Please enter both a title and the experience description.');
      return;
    }

    onSave({
      id: initialData?._id || initialData?.id,
      title: title.trim(),
      content: content.trim(),
      tags: tags.map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Published Experience' : 'Publish Career Experience'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Basic Information */}
        <div className="space-y-1">
          <label htmlFor="exp-title" className="block text-xs font-semibold text-slate-700">
            Article Title
          </label>
          <input
            id="exp-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How I prepared for my TechCorp Distributed Systems Interview"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
            data-testid="experience-title-input"
          />
        </div>

        {/* 2. Experience & Content */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="exp-content" className="block text-xs font-semibold text-slate-700">
              Experience &amp; Advice
            </label>
            <span className="text-[11px] text-slate-400">
              Format using clear paragraphs or bullet points
            </span>
          </div>
          <textarea
            id="exp-content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe the recruitment rounds, key competencies tested, technical preparation strategy, and actionable tips for students..."
            className="w-full p-3.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 leading-relaxed font-sans"
            data-testid="experience-content-input"
          />
        </div>

        {/* 3. Tags / Topics */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">
            Relevant Topics / Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.map((tag) => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

          {/* Custom tag input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Add custom tag (e.g. AWS, LeetCode)"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 flex-1 max-w-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomTag}
              disabled={!customTag.trim()}
              className="text-xs"
            >
              Add Tag
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            disabled={isSaving || !title.trim() || !content.trim()}
            className="text-xs shadow-xs"
            data-testid="submit-experience-btn"
          >
            {initialData ? 'Save Changes' : 'Publish Experience'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExperienceEditorModal;

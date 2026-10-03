import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const GoalFormModal = ({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  initialGoal = null, // If present, modal is in Edit mode
  isSubmitting = false,
}) => {
  const isEdit = Boolean(initialGoal);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technical',
    dueDate: '',
    priority: 'Medium',
    initialMilestone: '',
    description: '',
    status: 'in-progress',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialGoal) {
        const dueDateFormatted = initialGoal.dueDate
          ? new Date(initialGoal.dueDate).toISOString().split('T')[0]
          : '';

        setFormData({
          title: initialGoal.cleanTitle || initialGoal.title || '',
          category: initialGoal.category || 'Technical',
          dueDate: dueDateFormatted,
          priority: initialGoal.priority || 'Medium',
          initialMilestone: initialGoal.milestones?.[0]?.title || '',
          description: initialGoal.description || '',
          status: initialGoal.status || 'in-progress',
        });
      } else {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        setFormData({
          title: '',
          category: 'Technical',
          dueDate: defaultDate.toISOString().split('T')[0],
          priority: 'Medium',
          initialMilestone: '',
          description: '',
          status: 'in-progress',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialGoal]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Goal title must be at least 3 characters.';
    }

    if (formData.dueDate) {
      const parsed = new Date(formData.dueDate);
      if (isNaN(parsed.getTime())) {
        newErrors.dueDate = 'Please select a valid date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={isEdit ? 'Edit Goal' : 'Create New Goal'}
      description={
        isEdit
          ? 'Update your goal parameters and target milestones.'
          : 'Define a specific, measurable goal for your current sprint.'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {errors.submit && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Goal Title */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <span>Goal Title</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Master React Query caching and optimistic UI updates"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className={`
              w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border px-3.5 py-2.5 transition-colors focus:outline-none
              ${
                errors.title
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
              }
            `}
          />
          {errors.title && <p className="text-xs text-rose-600 font-medium">{errors.title}</p>}
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-200 px-3 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
            >
              <option value="Technical">Technical</option>
              <option value="Skill Development">Skill Development</option>
              <option value="Project">Project</option>
              <option value="Academic">Academic</option>
              <option value="Career Prep">Career Prep</option>
              <option value="Remedial">Remedial</option>
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
              className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-200 px-3 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
            >
              <option value="High">High (Immediate Focus)</option>
              <option value="Medium">Medium (Standard Sprint)</option>
              <option value="Low">Low (Backlog / Flexible)</option>
            </select>
          </div>
        </div>

        {/* Target Deadline */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Target Completion Date</span>
            <span className="text-slate-400 font-normal text-[11px]">(Default: 7 days)</span>
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
            className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
          />
          {errors.dueDate && <p className="text-xs text-rose-600 font-medium">{errors.dueDate}</p>}
        </div>

        {/* Initial Milestone */}
        {!isEdit && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Initial Milestone (Next Action)</span>
              <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Complete setup and chapter 1 tutorial"
              value={formData.initialMilestone}
              onChange={(e) => setFormData((prev) => ({ ...prev, initialMilestone: e.target.value }))}
              className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
            />
          </div>
        )}

        {/* Status (If editing) */}
        {isEdit && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Goal Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-200 px-3 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
            >
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        {/* Description / Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Description / Notes</span>
            <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Additional context, links, or success criteria..."
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border border-slate-200 px-3.5 py-2 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            loadingText={isEdit ? 'Saving...' : 'Creating...'}
          >
            {isEdit ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalFormModal;

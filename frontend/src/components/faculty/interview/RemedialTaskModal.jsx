import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Target } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const RemedialTaskModal = ({
  isOpen = false,
  onClose = () => {},
  taskToEdit = null,
  onSaveTask = () => {},
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('technical');
  const [estimatedHours, setEstimatedHours] = useState(5);
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title || '');
        setCategory(taskToEdit.category || 'technical');
        setEstimatedHours(taskToEdit.estimatedHours || 5);
        setTargetDate(
          taskToEdit.targetDate
            ? new Date(taskToEdit.targetDate).toISOString().split('T')[0]
            : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
        );
        setDescription(taskToEdit.description || '');
        setResourceLink(taskToEdit.resourceLink || '');
      } else {
        setTitle('');
        setCategory('technical');
        setEstimatedHours(5);
        setTargetDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
        setDescription('');
        setResourceLink('');
      }
      setError('');
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    onSaveTask({
      id: taskToEdit?.id || `task-${Date.now()}`,
      title: title.trim(),
      category,
      estimatedHours: Number(estimatedHours) || 5,
      targetDate: targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      description: description.trim(),
      resourceLink: resourceLink.trim(),
      isCustom: true,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Remedial Task' : 'Add Remedial Task'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Task Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="e.g. Master Dynamic Programming & Graph Algorithms"
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="technical">Technical</option>
              <option value="communication">Communication</option>
              <option value="confidence">Problem Solving / Poise</option>
              <option value="remedial">Remedial Sprint</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Target Due Date
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Task Description & Actionable Guidance
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specific problem sets, concepts, or practice topics to master..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Resource Link / Reference <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="url"
            value={resourceLink}
            onChange={(e) => setResourceLink(e.target.value)}
            placeholder="https://leetcode.com/... or System Design Notes"
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {taskToEdit ? 'Save Changes' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RemedialTaskModal;

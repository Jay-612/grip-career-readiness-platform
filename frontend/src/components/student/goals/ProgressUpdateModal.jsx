import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2, Check, Target } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import ProgressBar from '../../common/ProgressBar';

export const ProgressUpdateModal = ({
  isOpen = false,
  onClose = () => {},
  goal = null,
  onSaveProgress = () => {},
  isSubmitting = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState([]);
  const [status, setStatus] = useState('in-progress');

  useEffect(() => {
    if (goal && isOpen) {
      setProgress(goal.progress || 0);
      setMilestones(
        goal.milestones?.map((m) => ({ ...m })) || [
          { id: 1, title: 'Initial setup & requirements', completed: (goal.progress || 0) >= 30 },
          { id: 2, title: 'Core implementation & tests', completed: (goal.progress || 0) >= 75 },
          { id: 3, title: 'Final verification', completed: (goal.progress || 0) === 100 },
        ]
      );
      setStatus(goal.status || 'in-progress');
    }
  }, [goal, isOpen]);

  if (!goal) return null;

  const handleToggleMilestone = (index) => {
    const updated = [...milestones];
    updated[index].completed = !updated[index].completed;
    setMilestones(updated);

    // Auto-calculate progress based on completed milestones
    const completedCount = updated.filter((m) => m.completed).length;
    const calculatedProgress = Math.round((completedCount / updated.length) * 100);
    setProgress(calculatedProgress);

    if (calculatedProgress === 100) {
      setStatus('completed');
    } else if (status === 'completed' && calculatedProgress < 100) {
      setStatus('in-progress');
    }
  };

  const handleSliderChange = (newVal) => {
    const val = Number(newVal);
    setProgress(val);

    if (val === 100) {
      setStatus('completed');
      setMilestones((prev) => prev.map((m) => ({ ...m, completed: true })));
    } else if (status === 'completed' && val < 100) {
      setStatus('in-progress');
    }
  };

  const handlePresetClick = (presetVal) => {
    handleSliderChange(presetVal);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProgress(goal.id, progress, status, milestones);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Update Goal Progress"
      description={`Update progress for "${goal.cleanTitle}"`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Progress Display */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Current Progress
            </span>
            <span className="text-lg font-extrabold font-mono text-blue-600">
              {progress}%
            </span>
          </div>

          <ProgressBar
            value={progress}
            max={100}
            variant={progress === 100 ? 'success' : 'primary'}
            size="sm"
          />

          {/* Slider */}
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => handleSliderChange(e.target.value)}
            className="w-full accent-blue-600 cursor-pointer"
            aria-label="Progress percentage"
          />

          {/* Quick Presets */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {[0, 25, 50, 75, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`
                  px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors
                  ${
                    progress === preset
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }
                `}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        {/* Milestones Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Milestone Checklist
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {milestones.filter((m) => m.completed).length} / {milestones.length} done
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {milestones.map((milestone, idx) => (
              <label
                key={milestone.id || idx}
                className={`
                  flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors
                  ${
                    milestone.completed
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={milestone.completed}
                  onChange={() => handleToggleMilestone(idx)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <span className={`flex-1 ${milestone.completed ? 'line-through text-slate-500' : 'font-medium'}`}>
                  {milestone.title}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Sync */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => {
              const newStatus = e.target.value;
              setStatus(newStatus);
              if (newStatus === 'completed') setProgress(100);
            }}
            className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600"
          >
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed (Mark Finished)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
            loadingText="Saving..."
          >
            Save Progress
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProgressUpdateModal;

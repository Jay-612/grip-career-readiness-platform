import React, { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const ReworkModal = ({
  isOpen = false,
  onClose,
  onSubmit,
  isSubmitting = false,
  studentName = 'Student',
  taskTitle = 'Remedial Task',
}) => {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setValidationError('Please provide a specific reason for requesting rework.');
      return;
    }
    if (trimmed.length < 10) {
      setValidationError('Please provide at least 10 characters explaining what needs revision.');
      return;
    }
    setValidationError('');
    onSubmit(trimmed);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setReason('');
    setValidationError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Task Rework"
      description={`Specify what ${studentName} needs to correct or provide before this submission can be approved.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Required Revisions & Feedback <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="e.g., Please attach the GitHub repository link and update the README with test instructions."
            className="w-full p-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 transition leading-relaxed resize-y"
            autoFocus
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Be clear and actionable so the student can promptly fix it.</span>
            <span className="font-mono">{reason.length} chars</span>
          </div>
          {validationError && (
            <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {validationError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            isLoading={isSubmitting}
            disabled={isSubmitting || !reason.trim()}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Send Rework Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReworkModal;

import React, { useState, useEffect } from 'react';
import { Send, Link as LinkIcon, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const SubmissionModal = ({
  isOpen = false,
  onClose,
  task,
  onSubmit,
  isSubmitting = false,
}) => {
  const [submissionLink, setSubmissionLink] = useState('');
  const [comments, setComments] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && task) {
      // Prepopulate if resubmitting / rework
      setSubmissionLink(task.submission?.link || '');
      setComments('');
      setErrors({});
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const validate = () => {
    const errs = {};
    const linkTrimmed = submissionLink.trim();
    const commentTrimmed = comments.trim();

    if (!linkTrimmed && !commentTrimmed) {
      errs.submissionLink = 'Please provide a submission URL or explanatory comment / note.';
    }

    if (linkTrimmed && !/^https?:\/\//i.test(linkTrimmed)) {
      errs.submissionLink = 'Please provide a valid URL starting with http:// or https:// (e.g. GitHub repo, live deployment, or Google Drive doc).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    onSubmit({
      taskId: task.id,
      goalId: task.goalId,
      taskTitle: task.title,
      submissionLink: submissionLink.trim(),
      comments: comments.trim(),
    });
  };

  const isRework = task.submission?.status === 'rework';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={isRework ? 'Update Remedial Submission' : 'Submit Remedial Work'}
      description={`Submit proof of completion for "${task.title}".`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1" data-testid="submission-form">
        {/* Prominent Rework Feedback if applicable */}
        {isRework && task.submission?.feedback && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
            <span className="font-bold text-amber-900 block">Faculty Revision Request:</span>
            <p className="whitespace-pre-wrap leading-relaxed">{task.submission.feedback}</p>
          </div>
        )}

        {/* Required Submission Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Submission Link (GitHub repo / Live URL / Doc)</span>
            </span>
          </label>
          <input
            type="url"
            value={submissionLink}
            onChange={(e) => {
              setSubmissionLink(e.target.value);
              if (errors.submissionLink) setErrors((prev) => ({ ...prev, submissionLink: null }));
            }}
            placeholder="https://github.com/your-username/project-repo"
            className={`w-full px-3.5 py-2.5 text-xs text-slate-900 bg-white border rounded-xl focus:outline-none transition ${
              errors.submissionLink
                ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20'
            }`}
            autoFocus
          />
          {errors.submissionLink && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.submissionLink}
            </p>
          )}
          <p className="text-[11px] text-slate-400">
            Paste a link to your repository, pull request, hosted deployment, or design doc.
          </p>
        </div>

        {/* Comment / Note field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Comment / Implementation Note</span>
          </label>
          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Briefly describe the key decisions or changes made to fulfill this remedial assignment..."
            className="w-full p-3 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition resize-y leading-relaxed"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="text-xs shadow-xs"
          >
            {isRework ? 'Update Submission' : 'Submit for Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmissionModal;

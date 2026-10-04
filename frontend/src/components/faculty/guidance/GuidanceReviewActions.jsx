import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, MessageSquare, Send } from 'lucide-react';
import Button from '../../common/Button';

export const GuidanceReviewActions = ({
  status = 'pending',
  onApprove,
  onRequestRework,
  onAddComment,
  onResolve,
  isApproving = false,
  isCommenting = false,
  isResolving = false,
}) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const isCompleted = status === 'replied' || status === 'resolved';
  const isResolved = status === 'resolved';

  const handleSendComment = (e) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
    setShowCommentInput(false);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-200/90" data-testid="guidance-review-actions">
      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Reply / Note Button */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowCommentInput((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
            {showCommentInput ? 'Close Reply Box' : 'Reply / Advice'}
          </Button>

          {/* Approve Completion */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onApprove}
            isLoading={isApproving}
            disabled={isApproving}
            className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            {isCompleted ? 'Verify Again' : 'Approve Completion'}
          </Button>

          {/* Request Rework */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRequestRework}
            className="text-amber-800 border-amber-300 hover:bg-amber-50"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            Request Rework
          </Button>

          {/* Resolve Inquiry */}
          {onResolve && !isResolved && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResolve}
              isLoading={isResolving}
              disabled={isResolving}
              className="text-slate-700 border-slate-300 hover:bg-slate-100"
              title="Mark thread as resolved"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Mark Resolved
            </Button>
          )}
        </div>
      </div>

      {/* Controlled Comment Textarea */}
      {showCommentInput && (
        <form onSubmit={handleSendComment} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
          <label className="block text-[11px] font-semibold text-slate-700">
            Faculty Mentorship Note
          </label>
          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type feedback or recommendations for this student..."
            className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 transition"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setShowCommentInput(false);
                setCommentText('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="xs"
              disabled={isCommenting || !commentText.trim()}
              isLoading={isCommenting}
            >
              <Send className="w-3 h-3 mr-1" />
              Post Note
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GuidanceReviewActions;

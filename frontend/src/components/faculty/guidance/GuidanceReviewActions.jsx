import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, MessageSquare, Send } from 'lucide-react';
import Button from '../../common/Button';

export const GuidanceReviewActions = ({
  status = 'pending',
  onApprove,
  onRequestRework,
  onAddComment,
  isApproving = false,
  isCommenting = false,
}) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const isCompleted = status === 'replied';

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
          {/* Approve Completion */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onApprove}
            isLoading={isApproving}
            disabled={isApproving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
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
        </div>

        {/* Add Comment toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowCommentInput((prev) => !prev)}
          className="text-slate-600 text-xs"
        >
          <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          {showCommentInput ? 'Close Comment' : 'Add Comment'}
        </Button>
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

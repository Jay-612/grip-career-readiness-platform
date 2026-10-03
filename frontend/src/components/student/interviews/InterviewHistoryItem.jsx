import React from 'react';
import { Award, Clock, Video, ExternalLink, Calendar, Trash2 } from 'lucide-react';
import Button from '../../common/Button';
import InterviewStatusBadge from './InterviewStatusBadge';

export const InterviewHistoryItem = ({
  item,
  joinWindow,
  onOpenEvaluation = () => {},
  onJoin = () => {},
  onCancel = () => {},
  formatDate = (d) => d,
  formatTime = (d) => d,
  isJoining = false,
}) => {
  const hasEvaluation =
    item.scores &&
    item.scores.technical !== null &&
    item.scores.technical !== undefined &&
    item.status === 'completed';

  const isCompleted = item.status === 'completed';
  const isPending = item.status === 'pending';
  const isScheduled = item.status === 'scheduled';
  const interviewId = item.interviewId || item.id;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      {/* Left: Interview Info */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 sm:mt-0">
          <Award className="w-5 h-5" />
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Mock Screen w/ {item.interviewerName || 'Faculty Evaluator'}
            </span>
            <InterviewStatusBadge status={item.status} size="xs" />
            {item.actionPlan?.weakSkills?.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                Action Plan
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1 text-[11px] font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(item.dateTime)}</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-[11px]">{formatTime(item.dateTime) || 'Time scheduled'}</span>
            {item.focusArea && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-indigo-600 font-medium truncate max-w-xs">
                  {item.focusArea}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Score & Actions */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        {hasEvaluation ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Overall Score
              </span>
              <span className="text-sm font-black text-emerald-600 font-mono">
                {item.scores.average} / 10
              </span>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => onOpenEvaluation(item)}
              className="text-[11px] font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              View Scorecard
            </Button>
          </div>
        ) : isCompleted ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Scorecard Pending</span>
          </div>
        ) : isPending ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCancel(interviewId)}
              title="Cancel request"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : isScheduled ? (
          joinWindow && joinWindow.canJoin ? (
            <div className="flex items-center gap-2">
              <Button
                variant="success"
                size="xs"
                onClick={() => onJoin(interviewId, item.meetLink)}
                isLoading={isJoining}
                leftIcon={<Video className="w-3.5 h-3.5" />}
                rightIcon={<ExternalLink className="w-3 h-3" />}
                className="text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Join Meet
              </Button>
              <button
                type="button"
                onClick={() => onCancel(interviewId)}
                title="Cancel appointment"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Unlocks at {joinWindow?.opensAtStr || 'session start'}
              </span>
              <button
                type="button"
                onClick={() => onCancel(interviewId)}
                title="Cancel appointment"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default InterviewHistoryItem;

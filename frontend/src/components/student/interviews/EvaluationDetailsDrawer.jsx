import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Target,
  ExternalLink,
  X,
  TrendingUp,
} from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import ProgressBar from '../../common/ProgressBar';
import InterviewStatusBadge from './InterviewStatusBadge';

export const EvaluationDetailsDrawer = ({
  isOpen,
  onClose,
  evaluation,
  formatDate = (d) => d,
}) => {
  if (!evaluation) return null;

  const scores = evaluation.scores || {};
  const technical = scores.technical ?? 0;
  const communication = scores.communication ?? 0;
  const confidence = scores.confidence ?? 0;
  const overall = scores.average ?? scores.overall ?? 0;

  const actionPlan = evaluation.actionPlan || null;
  const weakSkills = actionPlan?.weakSkills || [];
  const recommendedTasks = actionPlan?.recommendedTasks || [];
  const hasRemedial =
    weakSkills.length > 0 ||
    technical < 7 ||
    communication < 7 ||
    confidence < 7;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mock Interview Evaluation"
      description="Official faculty rubric scorecard, performance assessment, and next steps."
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Evaluator & Date Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 font-bold flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm">
                {evaluation.interviewerName || 'Faculty Evaluator'}
              </span>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(evaluation.dateTime)}</span>
                {evaluation.focusArea && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-600 font-medium">{evaluation.focusArea}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Overall Grade
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 font-mono">
                {overall}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 10</span>
            </div>
          </div>
        </div>

        {/* Rubric Score Breakdown */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Rubric Evaluation Scores
          </h4>

          {/* Technical Score */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Technical Knowledge & Problem-Solving
              </span>
              <span className={`font-bold font-mono ${technical >= 7 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {technical} / 10
              </span>
            </div>
            <ProgressBar
              value={technical * 10}
              max={100}
              variant={technical >= 7 ? 'success' : 'warning'}
              size="sm"
            />
          </div>

          {/* Communication Score */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Communication & Structured Delivery (STAR)
              </span>
              <span className={`font-bold font-mono ${communication >= 7 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {communication} / 10
              </span>
            </div>
            <ProgressBar
              value={communication * 10}
              max={100}
              variant={communication >= 7 ? 'success' : 'warning'}
              size="sm"
            />
          </div>

          {/* Confidence Score */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Professional Demeanor & Confidence
              </span>
              <span className={`font-bold font-mono ${confidence >= 7 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {confidence} / 10
              </span>
            </div>
            <ProgressBar
              value={confidence * 10}
              max={100}
              variant={confidence >= 7 ? 'primary' : 'warning'}
              size="sm"
            />
          </div>
        </div>

        {/* Faculty Feedback Notes if available */}
        {evaluation.feedback && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
            <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block">
              Faculty Comments
            </span>
            <p className="text-slate-700 leading-relaxed italic text-[11px]">
              "{evaluation.feedback}"
            </p>
          </div>
        )}

        {/* Remedial Action Plan & Improvement Tasks */}
        {hasRemedial ? (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Target className="w-4 h-4 text-amber-700" />
                <span>Identified Improvement Areas</span>
              </div>
              <Link
                to="/student/goals"
                onClick={onClose}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Manage in Goal Tracker</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {weakSkills.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-amber-900 block">
                  Skills needing reinforcement (&lt; 7/10):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {weakSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-medium text-[10px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recommendedTasks.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-800 block">
                  Recommended Action Items:
                </span>
                {recommendedTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white border border-amber-200 flex items-start justify-between gap-2"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-slate-900 text-[11px]">
                        {task.title || task.goalTitle || task.task}
                      </span>
                      {task.description && (
                        <span className="text-[10px] text-slate-500 line-clamp-2">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px]">
              All domains scored 7/10 or above. Qualified placement performance; no remedial goals required.
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Official Academic Record
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close Evaluation
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EvaluationDetailsDrawer;

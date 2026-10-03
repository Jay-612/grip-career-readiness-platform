import React from 'react';
import {
  X,
  Award,
  Target,
  FileCheck,
  TrendingDown,
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import Skeleton from '../../common/Skeleton';
import RadialGauge from '../../common/RadialGauge';

const getReadinessTier = (score) => {
  if (typeof score !== 'number' || isNaN(score)) return { label: 'Unranked', variant: 'neutral', color: 'slate' };
  if (score >= 80) return { label: 'Placement Ready', variant: 'success', color: 'emerald' };
  if (score >= 60) return { label: 'Nearly Ready', variant: 'primary', color: 'blue' };
  if (score >= 40) return { label: 'Developing', variant: 'warning', color: 'amber' };
  return { label: 'Needs Attention', variant: 'danger', color: 'rose' };
};

export const StudentAnalyticsDrawer = ({
  isOpen,
  onClose,
  student,
  studentProgressData,
  studentReadinessData,
  isLoading = false,
}) => {
  if (!isOpen || !student) return null;

  const score = student.readinessScore || 0;
  const tier = getReadinessTier(score);
  const studentId = student.studentId || student._id || '';
  const usn = studentId ? `1MS${studentId.slice(-6).toUpperCase()}` : 'N/A';

  // Extract interview data if present in progress dashboard
  const interviews = studentProgressData?.interviews || [];
  const latestInterview = interviews.length > 0 ? interviews[0] : null;

  // Extract goal progress
  const goals = studentProgressData?.goals || [];
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length;
  const totalGoals = goals.length;

  // Skill gaps from readiness data or action plans
  const skillGaps = studentReadinessData?.skillGaps || studentProgressData?.skillGaps || [];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      data-purpose="student-analytics-drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col overflow-y-auto">
          {/* ─── DRAWER HEADER ───────────────────────────────────────────── */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <Avatar name={student.studentName} size="md" className="ring-2 ring-white/20" />
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {student.studentName}
                </h2>
                <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
                  <span>{usn}</span>
                  <span>•</span>
                  <span>{student.email}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close student drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ─── DRAWER BODY ─────────────────────────────────────────────── */}
          <div className="p-6 space-y-6 flex-1">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                {/* 1. Readiness Diagnostic Card */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Readiness Index
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-slate-900">
                        {score}%
                      </span>
                      <Badge variant={tier.variant} size="sm">
                        {tier.label}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      Target Career: <strong className="text-slate-900">{student.selectedCareer || 'Unassigned'}</strong>
                    </div>
                  </div>

                  <div className="w-20 h-20 shrink-0">
                    <RadialGauge
                      value={score}
                      size={80}
                      strokeWidth={8}
                      color={score >= 80 ? '#10b981' : score >= 60 ? '#2563eb' : '#f43f5e'}
                    />
                  </div>
                </div>

                {/* 2. Key Academic & Placement Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                    <div className="text-slate-400 font-medium">Semester Cohort</div>
                    <div className="font-bold text-slate-900 mt-1">
                      {student.semester ? `Semester ${student.semester}` : 'Unassigned'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                    <div className="text-slate-400 font-medium">Goal Completion</div>
                    <div className="font-bold text-slate-900 mt-1">
                      {completedGoals} / {totalGoals} Milestones
                    </div>
                  </div>
                </div>

                {/* 3. Latest Interview Evaluation */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    Latest Mock Interview Score
                  </h3>

                  {latestInterview ? (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {latestInterview.title || 'Technical & Readiness Evaluation'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {latestInterview.date ? new Date(latestInterview.date).toLocaleDateString() : 'Recent Session'}
                          </div>
                        </div>
                        <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                          {latestInterview.overallScore || latestInterview.score || 0} / 10
                        </span>
                      </div>

                      {latestInterview.rubric && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-500">Technical:</span>{' '}
                            <strong className="text-slate-800">{latestInterview.rubric.technical || 0}/10</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Communication:</span>{' '}
                            <strong className="text-slate-800">{latestInterview.rubric.communication || 0}/10</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Problem Solving:</span>{' '}
                            <strong className="text-slate-800">{latestInterview.rubric.problemSolving || 0}/10</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">System Design:</span>{' '}
                            <strong className="text-slate-800">{latestInterview.rubric.systemDesign || 0}/10</strong>
                          </div>
                        </div>
                      )}

                      {latestInterview.feedback && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {latestInterview.feedback}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 text-center">
                      No mock interview records logged yet for this candidate.
                    </div>
                  )}
                </div>

                {/* 4. Verified Skill Deficits / Action Plan */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                    Target Remediation Deficits
                  </h3>

                  {skillGaps.length > 0 ? (
                    <div className="space-y-2">
                      {skillGaps.map((gap, i) => {
                        const skillName = typeof gap === 'string' ? gap : gap.skill || gap.name;
                        return (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-slate-800">{skillName}</span>
                            <Badge variant="warning" size="sm">
                              Remediation Needed
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 text-center">
                      No active skill deficits flagged for this candidate.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ─── DRAWER FOOTER ───────────────────────────────────────────── */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close Inspection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsDrawer;

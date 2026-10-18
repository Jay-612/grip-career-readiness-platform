import React from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import Button from '../../common/Button';
import InterviewTimer from './InterviewTimer';
import RubricScoring from './RubricScoring';
import ObservationsField from './ObservationsField';

export const LiveEvaluationTab = ({
  timerSeconds = 0,
  isTimerRunning = false,
  onStartTimer = () => {},
  onPauseTimer = () => {},
  onResetTimer = () => {},
  technicalScore = 7,
  communicationScore = 8,
  confidenceScore = 7,
  onChangeTechnical = () => {},
  onChangeCommunication = () => {},
  onChangeConfidence = () => {},
  previousInterviewAverage = null,
  onViewHistory = () => {},
  observations = '',
  onChangeObservations = () => {},
  strengths = '',
  onChangeStrengths = () => {},
  improvements = '',
  onChangeImprovements = () => {},
  certified = true,
  onChangeCertified = () => {},
  onSubmit = () => {},
  isSubmitting = false,
  submitError = null,
  isReadOnly = false,
  submitSuccess = false,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Interview Stopwatch */}
      <InterviewTimer
        seconds={timerSeconds}
        isRunning={isTimerRunning}
        onStart={onStartTimer}
        onPause={onPauseTimer}
        onReset={onResetTimer}
        isReadOnly={isReadOnly}
      />

      {/* 2. Focused Rubric Scoring */}
      <RubricScoring
        technicalScore={technicalScore}
        communicationScore={communicationScore}
        confidenceScore={confidenceScore}
        onChangeTechnical={onChangeTechnical}
        onChangeCommunication={onChangeCommunication}
        onChangeConfidence={onChangeConfidence}
        isReadOnly={isReadOnly}
        previousInterviewAverage={previousInterviewAverage}
        onViewHistory={onViewHistory}
      />

      {/* 3. Observations Area */}
      <ObservationsField
        observations={observations}
        onChangeObservations={onChangeObservations}
        strengths={strengths}
        onChangeStrengths={onChangeStrengths}
        improvements={improvements}
        onChangeImprovements={onChangeImprovements}
        isReadOnly={isReadOnly}
      />

      {/* 4. Attestation & Submission Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-4">
        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {isReadOnly ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Evaluation Certified & Recorded</span>
            </div>
            <p className="text-xs text-emerald-600">
              This mock interview evaluation is completed. The student's placement readiness score has been updated.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legal / Confirmation Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={certified}
                onChange={(e) => onChangeCertified(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-4 h-4"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I confirm this evaluation reflects my assessment under institutional placement rubrics and accredited criteria.
              </span>
            </label>

            {/* Dominant Submit Action */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={onSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting Evaluation..."
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="py-3 text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/15"
            >
              Submit Evaluation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveEvaluationTab;

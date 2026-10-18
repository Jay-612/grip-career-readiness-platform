import React, { useState } from 'react';
import { ChevronDown, ChevronUp, History, Info, Sparkles } from 'lucide-react';
import Badge from '../../common/Badge';

const CRITERIA_DEFINITIONS = {
  technical: {
    title: 'Technical Knowledge & Architecture',
    description: 'Data structures, algorithms, system design trade-offs, database indexing, and code modularity.',
    bands: [
      { range: '0 - 3', label: 'Developing', desc: 'Struggles with fundamental concepts or runtime analysis.' },
      { range: '4 - 6', label: 'Competent', desc: 'Solves baseline problems; needs guidance on distributed scale or edge cases.' },
      { range: '7 - 8', label: 'Proficient', desc: 'Strong grasp of core data structures, clean API design, and trade-off evaluation.' },
      { range: '9 - 10', label: 'Exemplary', desc: 'Industry benchmark; proposes optimal algorithms and distributed design effortlessly.' }
    ]
  },
  communication: {
    title: 'STAR Articulation & Communication',
    description: 'Structured storytelling (STAR format), technical clarity, concise responses, and receptive dialogue.',
    bands: [
      { range: '0 - 3', label: 'Unstructured', desc: 'Rambling or vague responses without concrete technical deliverables.' },
      { range: '4 - 6', label: 'Basic', desc: 'Answers questions directly but lacks deliberate STAR structure.' },
      { range: '7 - 8', label: 'Clear', desc: 'Well-structured answers with clear Situation, Task, Action, and Result.' },
      { range: '9 - 10', label: 'Articulate', desc: 'Executive presence, active listening, and compelling technical narration.' }
    ]
  },
  problemSolving: {
    title: 'Problem Solving & Composure',
    description: 'Handling edge cases, logical deduction under pressure, code debugging composure, and receptive critique handling.',
    bands: [
      { range: '0 - 3', label: 'Hesitant', desc: 'Freezes under unexpected edge cases or exhibits excessive nervousness.' },
      { range: '4 - 6', label: 'Steady', desc: 'Recovers with moderate prompting; handles baseline stress calmly.' },
      { range: '7 - 8', label: 'Confident', desc: 'Demonstrates methodical think-aloud debugging and positive receptive demeanor.' },
      { range: '9 - 10', label: 'Resilient', desc: 'Flourishes under ambiguity, challenges assumptions productively, and pivots smoothly.' }
    ]
  }
};

export const RubricScoring = ({
  technicalScore = 7,
  communicationScore = 8,
  confidenceScore = 7,
  onChangeTechnical = () => {},
  onChangeCommunication = () => {},
  onChangeConfidence = () => {},
  isReadOnly = false,
  previousInterviewAverage = null,
  onViewHistory = () => {},
}) => {
  const [showCriteria, setShowCriteria] = useState(false);

  const average = ((technicalScore + communicationScore + confidenceScore) / 3).toFixed(1);

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 6) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const renderSlider = (label, score, onChange, keyName) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-1.5 font-mono">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${getScoreColor(score)}`}>
            {score} / 10
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold text-slate-400 font-mono w-4 text-center">0</span>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          disabled={isReadOnly}
          value={score}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer disabled:cursor-not-allowed"
          aria-label={label}
        />
        <span className="text-[10px] font-semibold text-slate-400 font-mono w-4 text-center">10</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-5">
      {/* Rubric Header with Cumulative Score and Previous Avg */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Scoring Rubrics
          </h2>
          <p className="text-xs text-slate-500">
            Standardized university evaluation scale (0 to 10)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Historical Previous Average Contextual Indicator */}
          {previousInterviewAverage !== null && previousInterviewAverage !== undefined ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 font-medium">Previous Avg:</span>
              <span className="font-bold text-slate-800 font-mono">
                {Number(previousInterviewAverage).toFixed(1)} / 10
              </span>
              <button
                type="button"
                onClick={onViewHistory}
                className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold underline ml-1"
              >
                View History →
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onViewHistory}
              className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium"
            >
              <History className="w-3.5 h-3.5" />
              <span>Candidate History →</span>
            </button>
          )}

          {/* Current Cumulative Average */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="text-[11px] font-bold text-blue-900 uppercase">Average:</span>
            <span className="text-sm font-black text-blue-700 font-mono">{average} / 10</span>
          </div>
        </div>
      </div>

      {/* Rubric Sliders: Technical, Communication, Problem Solving */}
      <div className="space-y-4">
        {renderSlider('Technical Knowledge', technicalScore, onChangeTechnical, 'technical')}
        {renderSlider('Communication & STAR', communicationScore, onChangeCommunication, 'communication')}
        {renderSlider('Problem Solving & Composure', confidenceScore, onChangeConfidence, 'problemSolving')}
      </div>

      {/* Progressive Disclosure: "View scoring criteria" toggle */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowCriteria(!showCriteria)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showCriteria ? 'Hide scoring criteria' : 'View scoring criteria'}</span>
          {showCriteria ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showCriteria && (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5 text-xs animate-fadeIn">
            {Object.entries(CRITERIA_DEFINITIONS).map(([key, item]) => (
              <div key={key} className="space-y-1.5">
                <div className="font-bold text-slate-800">{item.title}</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">{item.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {item.bands.map((band) => (
                    <div key={band.range} className="p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                      <div className="font-bold text-slate-700">{band.range}: {band.label}</div>
                      <div className="text-slate-500 text-[10px] leading-tight mt-0.5">{band.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RubricScoring;

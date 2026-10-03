import React from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export const InterviewTimer = ({
  seconds = 0,
  isRunning = false,
  onStart = () => {},
  onPause = () => {},
  onReset = () => {},
  isReadOnly = false,
}) => {
  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(
      mins
    ).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
            isRunning
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : seconds > 0
              ? 'bg-amber-50 border-amber-200 text-amber-600'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <Clock className="w-4 h-4" />
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Interview Session Timer
          </span>
          <div className="flex items-baseline gap-2 font-mono">
            <span
              className={`text-2xl font-bold tracking-tight ${
                isRunning
                  ? 'text-emerald-700'
                  : seconds > 0
                  ? 'text-amber-700'
                  : 'text-slate-800'
              }`}
            >
              {formatTimer(seconds)}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isRunning
                  ? 'bg-emerald-100 text-emerald-800'
                  : seconds > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isRunning ? 'Active' : seconds > 0 ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isRunning ? (
            <button
              type="button"
              onClick={onPause}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="Pause interview timer"
            >
              <Pause className="w-3.5 h-3.5 text-amber-700" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title={seconds === 0 ? 'Start session timer' : 'Resume timer'}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{seconds === 0 ? 'Start Timer' : 'Resume'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-lg text-xs transition"
            title="Reset timer to 00:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewTimer;

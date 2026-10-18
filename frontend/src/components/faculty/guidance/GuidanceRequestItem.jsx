import React from 'react';
import { Calendar, ChevronRight, CheckCircle2, Clock, Link as LinkIcon, Code2, AlertCircle } from 'lucide-react';
import Avatar from '../../common/Avatar';
import Button from '../../common/Button';

// Utility to parse task title and evidence indicator from raw question text
export const parseRequestMetadata = (item) => {
  const q = item.question || '';
  
  // 1. Task / Plan Title extraction
  let taskTitle = 'Remedial Task Guidance';
  if (q.startsWith('REST API Remedial Task')) {
    taskTitle = 'REST API Remedial Task';
  } else if (q.includes('schema design')) {
    taskTitle = 'Schema Design & Concurrency Review';
  } else if (q.includes('distributed transaction')) {
    taskTitle = 'Distributed Architecture Review';
  } else if (q.startsWith('[')) {
    const endBracket = q.indexOf(']');
    if (endBracket > 1) {
      taskTitle = q.slice(1, endBracket).trim();
    }
  } else {
    // First line or sentence
    const firstLine = q.split('\n')[0].trim();
    if (firstLine.length > 0 && firstLine.length < 50) {
      taskTitle = firstLine;
    } else {
      taskTitle = q.slice(0, 42) + '...';
    }
  }

  // 2. Submission / Proof indicator
  let proofType = null;
  if (q.includes('github.com')) {
    proofType = 'GitHub Repo';
  } else if (q.includes('```')) {
    proofType = 'Code Snippet';
  } else if (q.includes('http://') || q.includes('https://')) {
    proofType = 'External Link';
  } else {
    proofType = 'Written Response';
  }

  return { taskTitle, proofType };
};

export const GuidanceRequestItem = ({
  item,
  isSelected = false,
  onSelect,
}) => {
  const { taskTitle, proofType } = parseRequestMetadata(item);
  const isPending = item.status === 'pending' || !item.replyCount;
  const isCompleted = item.status === 'replied' || (item.replyCount || 0) > 0;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`p-4 rounded-xl border cursor-pointer transition-all relative group ${
        isSelected
          ? 'bg-blue-50/70 border-2 border-blue-600 shadow-sm'
          : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs hover:border-slate-300'
      }`}
      data-testid={`guidance-item-${item.id}`}
    >
      {/* Active selection bar indicator */}
      {isSelected && (
        <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-blue-600 rounded-r" />
      )}

      {/* Header: Student name + Date */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            name={item.studentName || 'Student'}
            size="sm"
            className={isSelected ? 'ring-2 ring-blue-500' : ''}
          />
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 truncate">
              {item.studentName || 'Student Candidate'}
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              {item.studentEmail || 'student@campus.edu'}
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{formatDate(item.date)}</span>
        </span>
      </div>

      {/* Task / Plan Title */}
      <div className="mt-2.5">
        <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
          {taskTitle}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
          {item.question}
        </p>
      </div>

      {/* Bottom Metadata & Status */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Status Badge */}
          {isPending ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending Review
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/80 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Completed ({item.replyCount || 1})
            </span>
          )}

          {/* Proof Indicator */}
          {proofType && (
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium flex items-center gap-1">
              {proofType === 'GitHub Repo' && <LinkIcon className="w-2.5 h-2.5 text-slate-500" />}
              {proofType === 'Code Snippet' && <Code2 className="w-2.5 h-2.5 text-blue-500" />}
              <span>{proofType}</span>
            </span>
          )}
        </div>

        {/* Action Button */}
        <Button
          size="xs"
          variant={isSelected ? 'primary' : 'outline'}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.id);
          }}
          className="text-[11px] px-2.5 py-1"
        >
          <span>Review</span>
          <ChevronRight className="w-3 h-3 ml-0.5" />
        </Button>
      </div>
    </div>
  );
};

export default GuidanceRequestItem;

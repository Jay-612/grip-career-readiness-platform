import React from 'react';
import { ExternalLink, Code2, Link as LinkIcon, FileText, CheckCircle2 } from 'lucide-react';

export const SubmissionEvidence = ({ text = '', className = '' }) => {
  if (!text) return null;

  // Extract URLs from text
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];

  // Parse markdown code blocks if any
  const hasCodeBlock = text.includes('```');

  if (hasCodeBlock) {
    const parts = text.split('```');
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Render Extracted Evidence Links if any */}
        {urls.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {urls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition break-all max-w-full"
              >
                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* Narrative and Code chunks */}
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            // Code block
            const lines = part.split('\n');
            const lang = lines[0].trim() || 'javascript';
            const code = lines.slice(1).join('\n') || part;
            return (
              <div
                key={index}
                className="rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] text-slate-100 font-mono text-xs shadow-inner"
              >
                <div className="flex items-center justify-between px-3.5 py-2 bg-[#1E293B] border-b border-slate-700 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold text-white uppercase text-[11px]">{lang}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Submission Code Artifact</span>
                </div>
                <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed custom-scrollbar max-h-72">
                  <code>{code}</code>
                </pre>
              </div>
            );
          }
          return (
            <p key={index} className="whitespace-pre-line text-slate-800 leading-relaxed text-xs">
              {part.trim()}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Extracted Evidence Links */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-1">
          {urls.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition break-all max-w-full"
            >
              <LinkIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          ))}
        </div>
      )}

      <p className="whitespace-pre-line text-slate-800 leading-relaxed text-xs">
        {text}
      </p>
    </div>
  );
};

export default SubmissionEvidence;

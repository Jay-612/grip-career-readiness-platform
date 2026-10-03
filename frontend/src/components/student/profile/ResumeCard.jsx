import React from 'react';
import {
  FileText,
  CheckCircle2,
  Upload,
  ExternalLink,
  Eye,
  Sparkles,
  Clock
} from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const ResumeCard = ({
  resume = {},
  onViewResume = () => {},
  onUploadResume = () => {},
}) => {
  const fileName = resume.fileName || 'Student_Verified_Resume.pdf';
  const uploadedAt = resume.uploadedAt || 'Recently updated';
  const fileSize = resume.fileSize || '240 KB';
  const atsScore = resume.atsScore || 88;
  const status = resume.status || 'Verified by Placement Cell';

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card" aria-label="Resume & ATS Readiness">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: File icon & metadata */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-6 h-6 stroke-[1.75]" />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate max-w-xs sm:max-w-md">
                {fileName}
              </span>
              <Badge variant="success" size="xs" dot>
                {status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-mono text-[11px] text-slate-600">{fileSize}</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Uploaded {uploadedAt}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>ATS Match: {atsScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewResume}
            leftIcon={<Eye className="w-3.5 h-3.5 text-blue-600" />}
            className="text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            View Resume
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onUploadResume}
            leftIcon={<Upload className="w-3.5 h-3.5 text-slate-600" />}
            className="text-xs font-semibold shadow-xs"
          >
            Upload / Replace
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ResumeCard;

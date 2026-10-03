import React from 'react';
import {
  FileText,
  CheckCircle2,
  Download,
  ExternalLink,
  Sparkles,
  Building2,
  GraduationCap
} from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const ResumePreviewModal = ({
  isOpen = false,
  onClose = () => {},
  resume = {},
  user = {},
  profile = {},
}) => {
  const fileName = resume.fileName || 'Verified_Student_Resume.pdf';
  const atsScore = resume.atsScore || 88;
  const status = resume.status || 'Verified by Placement Cell';
  const displayName = user?.name || 'Aarav Sharma';
  const displayEmail = user?.email || 'aarav.sharma@campus.edu';
  const selectedCareer = profile?.selectedCareer || 'Full Stack & Software Engineering';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resume Document Preview"
      description="Official verified student placement resume."
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Document Header Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">{fileName}</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {resume.fileSize || '248 KB'} • Uploaded {resume.uploadedAt || 'Recently'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" size="xs">
              {status}
            </Badge>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              ATS: {atsScore}%
            </span>
          </div>
        </div>

        {/* Formatted Resume Summary Sheet */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 text-xs font-sans shadow-xs">
          {/* Header */}
          <div className="border-b border-slate-100 pb-3 space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{displayName}</h3>
            <p className="text-[11px] text-blue-700 font-medium">{selectedCareer}</p>
            <p className="text-[11px] text-slate-500 font-mono">{displayEmail} • Campus Placement Candidate</p>
          </div>

          {/* Education */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Education
            </span>
            <div className="flex justify-between items-start text-xs">
              <div>
                <span className="font-bold text-slate-800">B.Tech in Computer Science &amp; Engineering</span>
                <span className="text-[11px] text-slate-500 block">Semester {profile.semester || 6} of 8 • Cumulative GPA: 8.85 / 10</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">2023 – 2027</span>
            </div>
          </div>

          {/* Core Competencies */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Verified Technical Competencies
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              React.js, Node.js, Express, PostgreSQL, MongoDB, Redis, Docker, Microservices Architecture, Data Structures &amp; Algorithms, REST API Design.
            </p>
          </div>

          {/* Projects */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Featured Capstone Projects
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div>
                <strong className="text-slate-800">Distributed In-Memory Cache Engine</strong>
                <p className="text-slate-500">Implemented LRU eviction, consistent hashing, and TCP socket replication with sub-5ms latency.</p>
              </div>
              <div>
                <strong className="text-slate-800">Campus Placement Diagnostic Portal</strong>
                <p className="text-slate-500">Built scalable assessment pipeline with real-time rubric tracking and Google Meet integration.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Cryptographically signed academic resume
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ResumePreviewModal;

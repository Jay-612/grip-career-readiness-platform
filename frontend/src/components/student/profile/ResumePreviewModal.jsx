import React from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Upload,
  User,
  GraduationCap,
  Briefcase,
  Mail,
  Printer,
  Sparkles,
} from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const ResumePreviewModal = ({
  isOpen = false,
  onClose = () => {},
  resume = {},
  user = {},
  profile = {},
  skills = [],
  onUploadClick = () => {},
}) => {
  const displayName = user?.name || 'Student';
  const displayEmail = user?.email || 'student@campus.edu';
  const defaultFileName = `${displayName.trim().replace(/\s+/g, '_')}_Resume.pdf`;
  const fileName = resume.fileName || defaultFileName;
  const selectedCareer = profile?.selectedCareer || 'Software Engineering';
  const semester = profile?.semester || 1;
  const hasFileUrl = Boolean(resume.fileUrl);

  const handleOpenExternal = () => {
    if (resume.fileUrl) {
      window.open(resume.fileUrl, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resume Document Preview"
      description={`Placement resume document for ${displayName}`}
      size="lg"
    >
      <div className="space-y-4 pt-1">
        {/* Document Header Card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-sm block truncate">{fileName}</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {resume.fileSize || '240 KB'} • Uploaded {resume.uploadedAt || 'Recently'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasFileUrl && (
              <>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleOpenExternal}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5 text-blue-600" />}
                  className="text-xs font-semibold text-blue-600 border-blue-200"
                >
                  Open in New Tab
                </Button>
                <a
                  href={resume.fileUrl}
                  download={fileName}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download</span>
                </a>
              </>
            )}
            {!hasFileUrl && (
              <Button
                variant="outline"
                size="xs"
                onClick={handlePrint}
                leftIcon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
                className="text-xs font-semibold text-slate-700"
              >
                Print / Save PDF
              </Button>
            )}
          </div>
        </div>

        {/* Actual Document Viewer (When uploaded fileUrl exists) */}
        {hasFileUrl ? (
          <div className="space-y-2">
            <div className="w-full h-[60vh] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col shadow-inner">
              <iframe
                src={resume.fileUrl}
                title={fileName}
                className="w-full h-full border-0"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Viewing uploaded document: {fileName}</span>
              <button
                type="button"
                onClick={onUploadClick}
                className="text-blue-600 hover:underline font-medium"
              >
                Replace with another document
              </button>
            </div>
          </div>
        ) : (
          /* Formatted Resume Summary Sheet for the logged-in student */
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Viewing digital profile resume. You can also upload your custom PDF document using <strong>Upload / Replace</strong>.
                </span>
              </div>
              <Button
                variant="primary"
                size="xs"
                onClick={onUploadClick}
                leftIcon={<Upload className="w-3 h-3" />}
                className="shrink-0 ml-2 text-[11px]"
              >
                Upload File
              </Button>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 text-xs font-sans shadow-xs">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{displayName}</h3>
                <p className="text-xs text-blue-700 font-semibold">{selectedCareer}</p>
                <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap pt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {displayEmail}
                  </span>
                  <span>•</span>
                  <span>Campus Placement Candidate</span>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Education
                </span>
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <span className="font-bold text-slate-800">
                      B.Tech in Computer Science &amp; Engineering
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Semester {semester} of 8 • Cumulative Academic Record
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Present</span>
                </div>
              </div>

              {/* Verified Technical Competencies */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Technical Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(skills.length > 0
                    ? skills
                    : ['Data Structures & Algorithms', 'React.js', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'System Design']
                  ).map((s, idx) => {
                    const skillName = typeof s === 'string' ? s : s?.name || '';
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium"
                      >
                        {skillName}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Academic Capstone & Project Work */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Academic &amp; Project Experience
                </span>
                <div className="space-y-2 text-[11px]">
                  <div>
                    <strong className="text-slate-800">Full-Stack Campus Placement &amp; Career Diagnostic Platform</strong>
                    <p className="text-slate-500 leading-relaxed mt-0.5">
                      Engineered role-based platform modules for career diagnostic evaluation, student assessment, and interview scheduling.
                    </p>
                  </div>
                  <div>
                    <strong className="text-slate-800">Distributed Web Applications &amp; Cloud Systems</strong>
                    <p className="text-slate-500 leading-relaxed mt-0.5">
                      Developed RESTful APIs, optimized database queries, and implemented authenticated user authorization workflows.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Student Placement Portal • Verified Academic Records
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

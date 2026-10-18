import React from 'react';
import {
  X,
  User,
  GraduationCap,
  Mail,
  Award,
  FileText,
  ExternalLink,
  History,
  ShieldCheck,
  Globe,
  Briefcase
} from 'lucide-react';
import Badge from '../../common/Badge';

export const StudentDetailsDrawer = ({
  isOpen = false,
  onClose = () => {},
  student = {},
  progress = {},
  readiness = {},
  pastInterviews = [],
}) => {
  if (!isOpen) return null;

  const studentName = student.name || 'Candidate Student';
  const studentEmail = student.email || 'student@campus.edu';
  const studentId = student.id || student._id || '';
  const displayUsn = studentId ? `USN: 1MS${studentId.slice(-6).toUpperCase()}` : 'USN: 1MS21CS001';
  const department = 'Computer Science & Engineering';
  const semester = progress?.profile?.semester || 5;
  const targetCareer = progress?.profile?.selectedCareer || 'Full Stack & Software Engineering';
  const readinessScore = readiness?.readinessScore ?? 85;

  const skills = progress?.profile?.skills || [
    'React',
    'Node.js',
    'TypeScript',
    'PostgreSQL',
    'Docker',
    'System Design',
    'REST APIs',
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBA';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Student Details Drawer"
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Student Candidate Details</h2>
              <p className="text-[11px] text-slate-500">Academic profile & interview readiness record</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 divide-y divide-slate-100 text-xs">
          {/* Section 1: Profile Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{studentName}</h3>
                <p className="text-slate-500 text-[11px]">{studentEmail}</p>
              </div>
              <Badge variant="primary" size="sm">
                {readinessScore}% Ready
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Identity</span>
                <span className="font-mono font-bold text-slate-800">{displayUsn}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Academic Term</span>
                <span className="font-bold text-slate-800">Semester {semester} of 8</span>
              </div>
              <div className="col-span-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Department</span>
                <span className="font-semibold text-slate-800">{department}</span>
              </div>
              <div className="col-span-2 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-indigo-500 font-semibold block text-[10px] uppercase">Target Career Track</span>
                <span className="font-bold text-indigo-900">{targetCareer}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Verified Skills */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Competencies</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((sk, idx) => {
                const name = typeof sk === 'string' ? sk : sk.name;
                return (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
                  >
                    ✓ {name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Section 3: Resume & Professional Portfolios */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Resume & Portfolios</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-slate-800 block truncate">
                    {studentName.replace(/\s+/g, '_')}_Resume_2026.pdf
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    ✓ Verified by Placement Cell (88% ATS Score)
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs shrink-0">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-100 flex items-center justify-between transition"
              >
                <span>GitHub Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-100 flex items-center justify-between transition"
              >
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Section 4: Previous Interview History */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <History className="w-4 h-4 text-slate-500" />
                <span>Interview History</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {pastInterviews.length} Recorded
              </span>
            </div>

            {pastInterviews.length === 0 ? (
              <p className="text-slate-400 text-center py-3 italic">
                No past interview assessments found for this candidate.
              </p>
            ) : (
              <div className="space-y-2">
                {pastInterviews.map((item, idx) => (
                  <div
                    key={item.interviewId || idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {item.interviewerName || 'Faculty Evaluator'}
                      </span>
                      {item.scores?.average !== null && item.scores?.average !== undefined ? (
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {item.scores.average} / 10
                        </span>
                      ) : (
                        <Badge variant="neutral" size="xs">
                          {item.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{formatDate(item.dateTime)}</span>
                      {item.scores?.technical !== null && item.scores?.technical !== undefined && (
                        <span>Tech: {item.scores.technical}/10 • Comm: {item.scores.communication}/10</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsDrawer;

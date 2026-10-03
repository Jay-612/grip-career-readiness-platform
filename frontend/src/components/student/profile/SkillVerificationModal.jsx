import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Award,
  BookOpen,
  Target,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import ProgressBar from '../../common/ProgressBar';

export const SkillVerificationModal = ({
  isOpen = false,
  onClose = () => {},
  skill = null,
}) => {
  if (!skill) return null;

  const score = skill.score || 8.5;
  const verifiedBy = skill.verifiedBy || 'Faculty Evaluation Panel';
  const verifierName = skill.verifierName || 'Dr. Sarah Jenkins (CSE Department)';
  const verifiedDate = skill.verifiedDate || 'Fall 2026 Academic Term';
  const coursework = skill.coursework || 'Core Department Curriculum & Hands-on Project Capstone';
  const category = skill.category || 'Technical Competency';
  const proficiency = skill.proficiency || 'Advanced';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Skill Verification Audit"
      description="Official institutional competency record and evaluation ledger."
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Skill Hero Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{skill.name}</h3>
                <Badge variant="success" size="xs">
                  Verified
                </Badge>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {category} • Proficiency: {proficiency}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Rubric Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-600 font-mono">
                {score}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 10</span>
            </div>
          </div>
        </div>

        {/* Verification Ledger Details */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Institutional Verification Audit
          </h4>

          <div className="space-y-2.5 text-xs">
            {/* Verifying Authority */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-3">
              <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-800">Verifying Authority</span>
                <span className="text-slate-600 text-[11px]">{verifierName}</span>
                <span className="text-slate-400 text-[10px]">{verifiedBy}</span>
              </div>
            </div>

            {/* Verification Timestamp */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-800">Verification Timestamp</span>
                <span className="text-slate-600 text-[11px]">{verifiedDate}</span>
                <span className="text-slate-400 text-[10px]">
                  Synchronized with Campus Placement Cell Academic Ledger
                </span>
              </div>
            </div>

            {/* Evidence & Coursework */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-800">Coursework &amp; Project Evidence</span>
                <span className="text-slate-600 text-[11px]">{coursework}</span>
                <span className="text-slate-400 text-[10px]">
                  Validated through code reviews and standardized lab assessments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Placement Qualification */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            This competency has been officially validated and is included in your verified student dossier forwarded to recruiting partners during campus placement drives.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Audit ID: {skill.id || `SK-${Math.abs(skill.name.split('').reduce((a,b)=>((a<<5)-a)+b.charCodeAt(0),0))}`}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Audit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SkillVerificationModal;

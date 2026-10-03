import React from 'react';
import { Building2, CheckCircle2, AlertTriangle, ExternalLink, Calendar, Award } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const CompanyDetailModal = ({
  company = null,
  isOpen = false,
  onClose = () => {},
}) => {
  if (!company) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company.companyName || 'Company Profile'}
      description={`Campus Recruitment Partner Criteria • ${company.role || 'Software Engineering'}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 py-2 text-xs">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block">
                {company.companyName}
              </span>
              <span className="text-slate-500">
                {company.role || 'Software Development Engineer'}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xl font-bold font-mono text-blue-700 block">
              {company.matchPercentage}% Match
            </span>
            <Badge variant={company.isEligible ? 'success' : 'neutral'} size="xs">
              {company.isEligible ? 'Eligible to Apply' : 'Prerequisites Pending'}
            </Badge>
          </div>
        </div>

        {/* Eligibility Details */}
        <div className="grid grid-cols-2 gap-3 text-slate-700">
          <div className="p-3 rounded-lg border border-slate-100 bg-white">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
              Hiring Tier
            </span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              {company.tier || 'Tier-1 High Growth Tech'}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 bg-white">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
              Expected Package
            </span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              {company.ctc || '₹16 – 24 LPA'}
            </span>
          </div>
        </div>

        {/* Required Skills & Verification Status */}
        <div className="space-y-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
            Required Technical Competencies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(company.requiredSkills || []).map((skill, idx) => {
              const isMatched = (company.matchedSkills || []).some(
                (ms) => ms.toLowerCase() === skill.toLowerCase()
              );
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                    isMatched
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {isMatched ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                  )}
                  <span>{skill}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Hiring Process Steps */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
            Typical Selection Stages
          </span>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            1. Online Coding & DSA Assessment (90 mins) <br />
            2. Technical & System Design Defense with Faculty/Industry Evaluators <br />
            3. Behavioral & Culture Fit Round
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default CompanyDetailModal;

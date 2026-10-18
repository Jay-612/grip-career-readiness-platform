import React from 'react';
import { Briefcase, GraduationCap, CheckCircle2, Award, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';

export const ActiveDriveSummary = ({
  role = 'Cloud Platform Engineer',
  departments = ['Computer Science & Engineering', 'Information Technology'],
  cgpaCriteria = '7.5+ CGPA',
  minimumMatchScore = 70,
  requiredSkills = ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'System Design'],
  applicationCount = 10,
  driveDate = 'Upcoming Placement Session',
  onManageDrive = null,
}) => {
  return (
    <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{role}</h2>
              <Badge variant="primary" size="xs">
                Active Hiring Drive
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Department eligibility, CGPA cutoff, and minimum benchmark criteria
            </p>
          </div>
        </div>

        <Link
          to="/recruiter/company"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 self-start sm:self-center"
        >
          <span>Manage Drive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-400 block">Eligible Depts</span>
          <span className="font-semibold text-slate-800 block truncate" title={Array.isArray(departments) ? departments.join(', ') : departments}>
            {Array.isArray(departments) && departments.length > 0 ? departments.join(', ') : 'All Departments'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-400 block">Academic Cutoff</span>
          <span className="font-semibold text-slate-800 block">{cgpaCriteria}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-400 block">Min. Match Score</span>
          <span className="font-semibold text-indigo-700 block font-mono">
            {minimumMatchScore}% threshold
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-400 block">Candidate Pool</span>
          <span className="font-semibold text-slate-800 block font-mono">
            {applicationCount} students
          </span>
        </div>
      </div>

      {requiredSkills && requiredSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 font-medium mr-1">Required Skills:</span>
          {requiredSkills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium"
            >
              {skill}
            </span>
          ))}
          {requiredSkills.length > 6 && (
            <span className="text-[11px] text-slate-400 font-medium">
              +{requiredSkills.length - 6} more
            </span>
          )}
        </div>
      )}
    </section>
  );
};

export default ActiveDriveSummary;

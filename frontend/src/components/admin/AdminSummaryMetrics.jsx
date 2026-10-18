import React from 'react';
import { Users, GraduationCap, Award, Briefcase, Building2, Calendar, Compass, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminSummaryMetrics = ({
  totalUsers = 0,
  students = 0,
  faculty = 0,
  alumni = 0,
  recruiters = 0,
  companies = 0,
  roadmaps = 0,
  events = 0,
}) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Users & RBAC */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Accounts
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalUsers}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {students} Students • {faculty} Faculty
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{alumni} Alumni • {recruiters} Recruiters</span>
          <Link to="/admin/users" className="text-indigo-600 hover:underline font-semibold">
            Users →
          </Link>
        </div>
      </div>

      {/* Metric 2: Companies */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Hiring Partners
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-slate-900">{companies}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Visiting campus recruitment partners</p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Target Hiring Criteria</span>
          <Link to="/admin/companies" className="text-indigo-600 hover:underline font-semibold">
            Companies →
          </Link>
        </div>
      </div>

      {/* Metric 3: Curriculum Roadmaps */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Curriculum Tracks
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-slate-900">{roadmaps}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Accredited engineering specializations</p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Semester Learning Plans</span>
          <Link to="/admin/curriculum" className="text-indigo-600 hover:underline font-semibold">
            Curriculum →
          </Link>
        </div>
      </div>

      {/* Metric 4: Campus Events */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Scheduled Events
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-slate-900">{events}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Workshops and placement mock days</p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Department Interventions</span>
          <Link to="/admin/events" className="text-indigo-600 hover:underline font-semibold">
            Events →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AdminSummaryMetrics;

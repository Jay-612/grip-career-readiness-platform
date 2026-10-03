import React from 'react';
import { Users, Compass, Building2, Calendar, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminQuickLinks = () => {
  const links = [
    {
      title: 'Users & RBAC',
      desc: 'Account roles & credentials',
      icon: Users,
      to: '/admin/users',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Curriculum Tracks',
      desc: 'Master roadmaps & subjects',
      icon: Compass,
      to: '/admin/curriculum',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Hiring Partners',
      desc: 'Corporate hiring criteria',
      icon: Building2,
      to: '/admin/companies',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Campus Events',
      desc: 'Placement workshops & drives',
      icon: Calendar,
      to: '/admin/events',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'System Analytics',
      desc: 'Skill gaps & cohort reports',
      icon: BarChart3,
      to: '/admin/analytics',
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-slate-900">Governance Navigation</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-2xs transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block transition-colors">
                  {link.title}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {link.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default AdminQuickLinks;

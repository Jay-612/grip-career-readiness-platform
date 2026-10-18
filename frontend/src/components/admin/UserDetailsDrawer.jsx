import React from 'react';
import { X, User, Mail, ShieldCheck, Briefcase, GraduationCap, Calendar, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

export const UserDetailsDrawer = ({
  user = null,
  isOpen = false,
  onClose = () => {},
  onEdit = () => {},
}) => {
  if (!isOpen || !user) return null;

  const profile = user.profile || {};

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-drawer-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 id="user-drawer-title" className="text-base font-bold text-slate-900">
                {user.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Assigned Role:</span>
              <Badge variant="primary" size="sm">
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Account Status:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Registered:</span>
              <span className="font-mono text-slate-700">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Role-Specific Details */}
          {user.role === 'student' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Academic Profile
              </span>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Semester:</span>
                  <span className="font-bold text-slate-900">Semester {profile.semester || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Career Track:</span>
                  <span className="font-bold text-indigo-700 truncate max-w-[200px]">
                    {profile.selectedCareer || 'Exploring Roadmaps'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Placement Readiness:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {profile.readinessScore || 0}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {user.role === 'faculty' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Faculty Position
              </span>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-900">{profile.department || 'CSE'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Employee ID:</span>
                  <span className="font-mono text-slate-800">{profile.employeeId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">HOD Status:</span>
                  <span className="font-bold text-slate-900">{profile.isHOD ? 'Yes (Head of Department)' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {user.role === 'alumni' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Alumni Employment
              </span>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Company:</span>
                  <span className="font-bold text-slate-900">{profile.currentCompany || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Job Title:</span>
                  <span className="font-bold text-slate-900">{profile.jobRole || 'Engineer'}</span>
                </div>
              </div>
            </div>
          )}

          {user.role === 'recruiter' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Corporate Representation
              </span>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Company Name:</span>
                  <span className="font-bold text-slate-900">{profile.companyName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Designation:</span>
                  <span className="font-bold text-slate-900">{profile.designation || 'Recruiter'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-end gap-2.5">
          <button
            onClick={() => {
              onClose();
              onEdit(user);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Edit User Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsDrawer;

import React from 'react';
import { X, Building2, Briefcase, GraduationCap, Mail, ExternalLink, ShieldCheck } from 'lucide-react';
import Button from '../../common/Button';

export const AlumniProfileDrawer = ({
  isOpen = false,
  onClose,
  author,
}) => {
  if (!isOpen || !author) return null;

  const authorName = author.name || 'Verified Alumni';
  const company = author.currentCompany || author.company || 'Industry Partner';
  const role = author.jobRole || author.role || 'Alumni Contributor';
  const gradYear = author.graduationYear;
  const email = author.email;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end"
      data-testid="alumni-profile-drawer"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 font-heading">
              Alumni Contributor Profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
            aria-label="Close profile drawer"
            data-testid="close-author-profile-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6 flex-1">
          {/* Avatar and Basic Header */}
          <div className="text-center space-y-3 pb-4 border-b border-slate-100">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {authorName}
              </h3>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">
                Verified Campus Alumni
              </p>
            </div>
          </div>

          {/* Credibility Fields */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Career & Credibility
            </h4>

            <div className="space-y-2.5">
              {/* Current Role */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Briefcase className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 block text-[11px] font-medium">Role</span>
                  <span className="font-bold text-slate-800">{role}</span>
                </div>
              </div>

              {/* Company */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Building2 className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 block text-[11px] font-medium">Current Organization</span>
                  <span className="font-bold text-slate-800">{company}</span>
                </div>
              </div>

              {/* Graduation Year / Education */}
              {gradYear && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <GraduationCap className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <span className="text-slate-500 block text-[11px] font-medium">Alumni Graduation</span>
                    <span className="font-bold text-slate-800">Class of {gradYear}</span>
                  </div>
                </div>
              )}

              {/* Professional Contact / Email */}
              {email && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div className="text-xs min-w-0">
                    <span className="text-slate-500 block text-[11px] font-medium">Contact Email</span>
                    <span className="font-semibold text-slate-700 truncate block">{email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileDrawer;

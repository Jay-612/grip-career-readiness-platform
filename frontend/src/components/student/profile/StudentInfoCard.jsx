import React from 'react';
import {
  GraduationCap,
  Mail,
  CheckCircle2,
  Edit3,
  Building2,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

export const StudentInfoCard = ({
  user = {},
  profile = {},
  bio = '',
  onEdit = () => {},
}) => {
  const displayName = user?.name || 'Student';
  const displayEmail = user?.email || 'student@campus.edu';
  const semester = profile?.semester || 1;
  const selectedCareer = profile?.selectedCareer || '';
  const studentId = user?.id || user?._id || '';
  const displayUsn = studentId ? `USN: 1MS${studentId.slice(-6).toUpperCase()}` : 'USN: 1MS21CS001';
  const department = 'Computer Science & Engineering';

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card relative overflow-hidden" aria-label="Student Academic Profile">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Avatar & Identity Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-md select-none font-mono">
              {getInitials(displayName)}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {displayName}
              </h2>
              {selectedCareer && (
                <Badge variant="primary" size="xs">
                  {selectedCareer}
                </Badge>
              )}
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                {displayUsn}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{department}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">Semester {semester} of 8</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-600">{displayEmail}</span>
              </span>
            </div>

            {bio && (
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed line-clamp-2">
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick Edit CTA */}
        <div className="shrink-0 self-end md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            leftIcon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />}
            className="text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Edit Profile Info
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StudentInfoCard;

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Compass,
  Target,
  Users,
  Award,
  BookOpen,
  Send,
  BarChart3,
  Building2,
  FileCheck,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';

const Sidebar = ({
  role: propRole,
  user: propUser,
  isOpen = false,
  onClose,
  isMobileDrawer = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user: authUser, role: authRole, logout } = useAuth();

  const activeRole = propRole || authRole || 'student';
  const currentUser = propUser || authUser || {};

  const [studentReadiness, setStudentReadiness] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const studentId = currentUser?.id || authUser?.id;
    if (activeRole === 'student' && studentId) {
      studentService
        .getPlacementReadiness(studentId)
        .then((res) => {
          if (isMounted && res?.readinessScore !== undefined) {
            setStudentReadiness(res);
          }
        })
        .catch(() => {
          // Keep null if unavailable
        });
    }
    return () => {
      isMounted = false;
    };
  }, [activeRole, currentUser?.id, authUser?.id]);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Nav configurations based on Stitch screens & user requirements
  const navConfigs = {
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Profile & Skills', path: '/student/profile', icon: UserCheck },
      { name: 'Career Compass', path: '/student/career-compass', icon: Compass },
      { name: 'Goal Tracker', path: '/student/goals', icon: Target, badge: 'Sprint' },
      { name: 'Mentorship & Q&A', path: '/student/guidance', icon: Users },
      { name: 'Interview & Readiness', path: '/student/interviews', icon: Award },
      { name: 'Alumni Stories', path: '/student/alumni-posts', icon: BookOpen, badge: 'Insights' },
    ],
    faculty: [
      { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { name: 'Interview Evaluation', path: '/faculty/interviews', icon: FileCheck },
      { name: 'Guidance Inbox', path: '/faculty/guidance', icon: Send },
      { name: 'HOD Analytics', path: '/faculty/analytics', icon: BarChart3, badge: 'HOD' },
    ],
    alumni: [
      { name: 'Dashboard', path: '/alumni/dashboard', icon: LayoutDashboard },
      { name: 'Experience Publisher', path: '/alumni/experience', icon: BookOpen },
      { name: 'Mentorship Inbox', path: '/alumni/mentorship', icon: Send },
    ],
    recruiter: [
      { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
      { name: 'Company Profile', path: '/recruiter/company', icon: Building2 },
      { name: 'Student Feedback', path: '/recruiter/feedback', icon: FileCheck },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'User Management', path: '/admin/users', icon: Users, badge: 'RBAC' },
      { name: 'Curriculum & Tracks', path: '/admin/curriculum', icon: Compass },
      { name: 'Company Partners', path: '/admin/companies', icon: Building2 },
      { name: 'Department Events', path: '/admin/events', icon: Calendar },
      { name: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
    ],
  };

  const navItems = navConfigs[activeRole] || navConfigs.student;

  const defaultUserMeta = {
    student: { name: 'Student', roleSubtitle: 'Student • Campus Portal', initials: 'ST' },
    faculty: { name: 'Faculty Member', roleSubtitle: 'Faculty • Campus Portal', initials: 'FA' },
    alumni: { name: 'Alumni Mentor', roleSubtitle: 'Alumni • Campus Portal', initials: 'AL' },
    recruiter: { name: 'Recruiter Partner', roleSubtitle: 'Recruiter • Campus Portal', initials: 'RC' },
    admin: { name: 'Institutional Admin', roleSubtitle: 'Admin • Campus Console', initials: 'AD' },
  };

  const currentRoleMeta = defaultUserMeta[activeRole] || defaultUserMeta.student;
  const displayName = currentUser.name || currentRoleMeta.name;
  const displaySubtitle = currentUser.roleSubtitle || (currentUser.role ? `${currentUser.role.toUpperCase()} • Campus Portal` : currentRoleMeta.roleSubtitle);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayInitials = currentUser.initials || getInitials(displayName);

  return (
    <>
      {/* Mobile Backdrop (when rendered as standalone drawer) */}
      {!isMobileDrawer && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Persistent / Drawer Sidebar */}
      <aside
        className={`
          ${isMobileDrawer ? 'relative w-full h-full' : 'fixed top-0 bottom-0 left-0 z-40 w-64'}
          bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out
          ${!isMobileDrawer ? (isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0') : ''}
          ${className}
        `}
      >
        {/* Top Branding & User Profile */}
        <div className="flex flex-col">
          {/* Logo & Campus Tag */}
          <div className="px-6 py-5 border-b border-grip-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-grip-blue text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-grip-dark">GRIP</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-grip-blue px-1.5 py-0.5 rounded">
                  CAMPUS
                </span>
              </div>
              <p className="text-[11px] font-medium text-grip-muted tracking-wide">Learn • Prepare • Grow</p>
            </div>
          </div>

          {/* Student Profile Quick Card */}
          <div className="px-5 py-4 mx-3 my-3 bg-slate-50 border border-grip-border rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-grip-blue text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
              {displayInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-grip-dark truncate">{displayName}</p>
              <p className="text-[11px] font-medium text-grip-muted flex items-center gap-1 truncate">
                <span className="uppercase">{activeRole}</span>
                <span>•</span>
                <span className="truncate">Campus Portal</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar max-h-[calc(100vh-340px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors group
                    ${
                      isActive
                        ? 'bg-grip-blue-light text-grip-blue font-semibold'
                        : 'text-grip-slate hover:text-grip-dark hover:bg-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-5 h-5 shrink-0 transition-colors" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-grip-blue rounded-full font-sans shrink-0">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: Status Card & Utilities */}
        <div className="p-4 border-t border-grip-border">
          {/* Mini Readiness Status Box */}
          {activeRole === 'student' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-grip-border mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-grip-dark">Placement Ready</span>
                {studentReadiness?.readinessScore !== undefined ? (
                  <span className="font-mono text-blue-600 font-bold text-[11px]">
                    {studentReadiness.targetTier || (studentReadiness.readinessScore >= 80 ? 'Tier 1' : studentReadiness.readinessScore >= 60 ? 'Tier 2' : 'General')}
                  </span>
                ) : (
                  <span className="font-mono text-slate-400 font-medium text-[10px]">Evaluating</span>
                )}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, studentReadiness?.readinessScore !== undefined ? studentReadiness.readinessScore : 0))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-grip-muted">
                <span className="font-mono font-semibold text-grip-dark">
                  {studentReadiness?.readinessScore !== undefined ? `${studentReadiness.readinessScore}%` : 'In Progress'}
                </span>
                <span>
                  {studentReadiness?.details
                    ? `${studentReadiness.details.completedGoals || 0} Goals • ${studentReadiness.details.completedInterviews || 0} Mocks`
                    : 'Rubrics In Progress'}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span className="truncate">Institutional Rubrics Aligned</span>
              </div>
            </div>
          )}

          {activeRole === 'faculty' && (
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Cohort Readiness</span>
                <span className="text-emerald-600 font-semibold font-mono">+6.2%</span>
              </div>
              <div className="text-base font-bold text-slate-900 font-mono">78.4%</div>
              <span className="text-[10px] text-slate-400">142 Registered Candidates</span>
            </div>
          )}

          {activeRole === 'alumni' && (
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified Alumni Mentor</span>
              </div>
              <span className="text-[10px] text-slate-500 leading-tight">
                Institutional Network Member • Guidance &amp; Career Contributor
              </span>
            </div>
          )}

          {activeRole === 'recruiter' && (
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
              <div className="text-[11px] font-semibold text-slate-700">Super Dream Partner</div>
              <span className="text-[10px] text-slate-500 leading-tight">
                15 SDE-1 Target Offers • 94% Past Retention
              </span>
            </div>
          )}

          {/* Settings & Sign Out */}
          <div className="flex items-center justify-between px-1 pt-1 text-slate-500 text-xs">
            <button
              type="button"
              onClick={() => {
                const target = activeRole === 'student' ? '/student/profile' : activeRole === 'recruiter' ? '/recruiter/company' : '/';
                navigate(target);
              }}
              className="inline-flex items-center gap-1.5 hover:text-slate-800 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 hover:text-rose-600 transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

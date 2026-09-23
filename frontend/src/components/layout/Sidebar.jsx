import React from 'react';
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
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    ],
    faculty: [
      { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { name: 'Interview Evaluation', path: '/faculty/evaluations', icon: FileCheck, badge: '3 pending' },
      { name: 'Guidance Inbox', path: '/faculty/guidance-inbox', icon: Send, badge: '5 unread' },
      { name: 'HOD Analytics', path: '/faculty/hod-analytics', icon: BarChart3, badge: 'HOD' },
    ],
    alumni: [
      { name: 'Dashboard', path: '/alumni/dashboard', icon: LayoutDashboard },
      { name: 'Experience Publisher', path: '/alumni/experience-publisher', icon: BookOpen },
      { name: 'Mentorship Inbox', path: '/alumni/mentorship-inbox', icon: Send, badge: '4 unread' },
    ],
    recruiter: [
      { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
      { name: 'Company Profile', path: '/recruiter/company-profile', icon: Building2 },
      { name: 'Student Feedback', path: '/recruiter/feedback', icon: FileCheck, badge: '14 Pending' },
    ],
  };

  const navItems = navConfigs[activeRole] || navConfigs.student;

  const defaultUserMeta = {
    student: { name: 'Rohan Mehta', roleSubtitle: '3rd Year • CSE Track', initials: 'RM' },
    faculty: { name: 'Prof. Neha Sharma', roleSubtitle: 'Associate Prof • CSE', initials: 'NS' },
    alumni: { name: 'Vikram Singhania', roleSubtitle: 'Senior SWE @ TechCorp', initials: 'VS' },
    recruiter: { name: 'Marcus Vance', roleSubtitle: 'Campus TA Lead • TechCorp', initials: 'MV' },
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
                <span>STUDENT</span>
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
                <span className="font-mono text-emerald-600 font-bold text-[11px]">+12% vs prior</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-grip-muted">
                <span className="font-mono font-semibold text-grip-dark">85%</span>
                <span>7 of 8 Rubrics Done</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span className="truncate">TechCorp Partner Verified</span>
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
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Top 5% Contributor</span>
              </div>
              <span className="text-[10px] text-slate-500 leading-tight">
                18 Students Placed via your verified mentorship & referrals.
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

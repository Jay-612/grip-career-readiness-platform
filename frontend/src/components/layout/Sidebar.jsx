import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Target,
  Video,
  MessageSquare,
  BookOpen,
  User,
  BarChart2,
  Users,
  Building,
  Calendar,
  LogOut,
  GraduationCap,
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

  // Concise, role-specific navigation configurations
  const navConfigs = {
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Career Compass', path: '/student/career-compass', icon: Compass },
      { name: 'Goals', path: '/student/goals', icon: Target },
      { name: 'Interviews', path: '/student/interviews', icon: Video },
      { name: 'Guidance', path: '/student/guidance', icon: MessageSquare },
      { name: 'Alumni Insights', path: '/student/alumni-posts', icon: BookOpen },
      { name: 'Profile', path: '/student/profile', icon: User },
    ],
    faculty: [
      { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { name: 'Interviews', path: '/faculty/interviews', icon: Video },
      { name: 'Guidance', path: '/faculty/guidance', icon: MessageSquare },
      { name: 'Analytics', path: '/faculty/analytics', icon: BarChart2 },
      { name: 'Profile', path: '/faculty/profile', icon: User },
    ],
    alumni: [
      { name: 'Dashboard', path: '/alumni/dashboard', icon: LayoutDashboard },
      { name: 'Mentorship', path: '/alumni/mentorship', icon: Users },
      { name: 'Experience', path: '/alumni/experience', icon: BookOpen },
      { name: 'Profile', path: '/alumni/profile', icon: User },
    ],
    recruiter: [
      { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
      { name: 'Company', path: '/recruiter/company', icon: Building },
      { name: 'Feedback', path: '/recruiter/feedback', icon: MessageSquare },
      { name: 'Profile', path: '/recruiter/profile', icon: User },
    ],
    admin: [
      {
        section: 'Overview',
        items: [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        section: 'Management',
        items: [
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Curriculum', path: '/admin/curriculum', icon: BookOpen },
          { name: 'Companies', path: '/admin/companies', icon: Building },
          { name: 'Events', path: '/admin/events', icon: Calendar },
        ],
      },
      {
        section: 'Insights',
        items: [
          { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
        ],
      },
    ],
  };

  const navItems = navConfigs[activeRole] || navConfigs.student;

  const displayName = currentUser.name || 'User';

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayInitials = currentUser.initials || getInitials(displayName);

  const renderNavLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={({ isActive }) => `
          flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative
          ${
            isActive
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }
        `}
      >
        {({ isActive }) => (
          <>
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span className="truncate">{item.name}</span>
            {isActive && (
              <span className="absolute right-2 w-1.5 h-4 rounded-full bg-blue-600" />
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Backdrop (when rendered as standalone drawer) */}
      {!isMobileDrawer && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Persistent Desktop / Drawer Sidebar */}
      <aside
        className={`
          ${isMobileDrawer ? 'relative w-full h-full' : 'fixed top-0 bottom-0 left-0 z-40 w-64'}
          bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out
          ${!isMobileDrawer ? (isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0') : ''}
          ${className}
        `}
      >
        {/* Top: Clean Platform Branding */}
        <div className="flex flex-col min-h-0 flex-1">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">GRIP</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                  CAMPUS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Career Readiness</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {activeRole === 'admin' ? (
              // Grouped navigation for Admin
              navItems.map((group, gIdx) => (
                <div key={gIdx} className={gIdx > 0 ? 'pt-4 mt-2 border-t border-slate-100' : ''}>
                  {group.section && (
                    <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {group.section}
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => renderNavLink(item))}
                  </div>
                </div>
              ))
            ) : (
              // Flat concise navigation for Student, Faculty, Alumni, Recruiter
              navItems.map((item) => renderNavLink(item))
            )}
          </nav>
        </div>

        {/* Bottom User Quick Info & Sign Out */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                {displayInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate leading-snug">{displayName}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">{activeRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

// Route-to-section label mapping for breadcrumb/title display
const SECTION_TITLES = {
  // Student
  '/student/dashboard': 'Dashboard',
  '/student/career-compass': 'Career Compass',
  '/student/goals': 'Goals',
  '/student/interviews': 'Interviews',
  '/student/guidance': 'Guidance',
  '/student/alumni-posts': 'Alumni Insights',
  '/student/profile': 'Profile',
  // Faculty
  '/faculty/dashboard': 'Dashboard',
  '/faculty/profile': 'Profile',
  '/faculty/interviews': 'Interviews',
  '/faculty/guidance': 'Guidance',
  '/faculty/analytics': 'Analytics',
  // Alumni
  '/alumni/dashboard': 'Dashboard',
  '/alumni/profile': 'Profile',
  '/alumni/mentorship': 'Mentorship',
  '/alumni/experience': 'Experience',
  // Recruiter
  '/recruiter/dashboard': 'Dashboard',
  '/recruiter/profile': 'Profile',
  '/recruiter/company': 'Company',
  '/recruiter/feedback': 'Feedback',
  // Admin
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/curriculum': 'Curriculum',
  '/admin/companies': 'Companies',
  '/admin/events': 'Events',
  '/admin/analytics': 'Analytics',
};

const TopBar = ({
  breadcrumbs = [],
  userInitials,
  onMenuToggle,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayRole = (user?.role || 'student').toLowerCase();

  const displayName =
    user?.name ||
    (displayRole === 'faculty'
      ? 'Faculty Member'
      : displayRole === 'alumni'
      ? 'Alumni Mentor'
      : displayRole === 'recruiter'
      ? 'Campus Recruiter'
      : displayRole === 'admin'
      ? 'System Administrator'
      : 'Verified Student');
  const displayEmail = user?.email || `${displayRole}@campus.edu`;

  // Derive section title from current pathname if breadcrumbs are not provided
  const currentSection = useMemo(() => {
    if (breadcrumbs.length > 0) {
      return breadcrumbs[breadcrumbs.length - 1];
    }
    return SECTION_TITLES[location.pathname] || 'Dashboard';
  }, [breadcrumbs, location.pathname]);

  // Close profile menu when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 flex items-center justify-between gap-4
        ${className}
      `}
    >
      {/* Left: Mobile Menu Toggle & Clean Section Title / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Concise Section Title / Breadcrumb Trail */}
        <div className="flex items-center gap-2 min-w-0">
          {breadcrumbs.length > 1 ? (
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-slate-300">/</span>}
                    <span
                      className={`truncate ${
                        isLast
                          ? 'font-semibold text-slate-900'
                          : 'hover:text-slate-700 transition-colors cursor-default'
                      }`}
                    >
                      {crumb}
                    </span>
                  </React.Fragment>
                );
              })}
            </nav>
          ) : (
            <span className="font-semibold text-sm sm:text-base text-slate-900 tracking-tight truncate">
              {currentSection}
            </span>
          )}
        </div>
      </div>

      {/* Right: Profile Menu Only */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Profile Avatar & Subdued Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
            }}
            className="flex items-center gap-1.5 p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="User account menu"
            aria-expanded={isProfileOpen}
          >
            <Avatar
              name={displayName}
              initials={userInitials}
              size="sm"
              variant="primary"
            />
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs animate-fadeIn">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-900 truncate">{displayName}</div>
                  <div className="text-[11px] text-slate-400 truncate">{displayEmail}</div>
                  <div className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">
                    {displayRole}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      const targetPath =
                        displayRole === 'student'
                          ? '/student/profile'
                          : displayRole === 'faculty'
                          ? '/faculty/profile'
                          : displayRole === 'alumni'
                          ? '/alumni/profile'
                          : displayRole === 'recruiter'
                          ? '/recruiter/profile'
                          : '/admin/dashboard';
                      navigate(targetPath);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

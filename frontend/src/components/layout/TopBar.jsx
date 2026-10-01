import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  BookOpen,
  Target,
  Video,
  Users,
  Compass,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const SEARCH_SUGGESTIONS = [
  {
    category: 'Navigation',
    items: [
      { label: 'Student Dashboard', path: '/student/dashboard', icon: Sparkles },
      { label: 'Weekly Goals Workspace', path: '/student/goals', icon: Target },
      { label: 'Career Compass & Roadmaps', path: '/student/career-compass', icon: Compass },
      { label: 'Mock Interview Center', path: '/student/interviews', icon: Video },
      { label: 'Faculty & Mentorship Guidance', path: '/student/guidance', icon: Users },
      { label: 'Profile & Skills Competencies', path: '/student/profile', icon: UserIcon },
    ],
  },
  {
    category: 'Engineering Tracks',
    items: [
      { label: 'Cloud Backend Engineering', path: '/student/career-compass', icon: BookOpen },
      { label: 'Full-Stack Product Engineering', path: '/student/career-compass', icon: BookOpen },
      { label: 'DevOps & Cloud Infrastructure', path: '/student/career-compass', icon: BookOpen },
      { label: 'AI & Data Systems Engineering', path: '/student/career-compass', icon: BookOpen },
    ],
  },
];

const TopBar = ({
  breadcrumbs = [],
  statusBadge,
  searchPlaceholder = 'Search roadmaps, competencies, faculty...',
  onSearch,
  quickAction,
  primaryAction,
  userInitials,
  onMenuToggle,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchContainerRef = useRef(null);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayRole = user?.role || 'student';
  const displayName =
    user?.name ||
    (displayRole === 'faculty'
      ? 'Faculty Member'
      : displayRole === 'alumni'
      ? 'Alumni Mentor'
      : displayRole === 'recruiter'
      ? 'Campus Recruiter'
      : 'Verified Student');
  const displayEmail = user?.email || `${displayRole}@campus.edu`;

  // Filter spotlight suggestions
  const filteredSuggestions = searchQuery.trim()
    ? SEARCH_SUGGESTIONS.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((group) => group.items.length > 0)
    : SEARCH_SUGGESTIONS;

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 flex items-center justify-between gap-4
        ${className}
      `}
    >
      {/* Left: Mobile Toggle & Breadcrumbs & Status */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Trail */}
        {breadcrumbs.length > 0 && (
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
        )}

        {/* Status Badge */}
        {statusBadge || (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-semibold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Session: Spring 2026 Cycle</span>
          </div>
        )}
      </div>

      {/* Middle: Interactive Spotlight Global Search */}
      <div ref={searchContainerRef} className="flex-1 max-w-md hidden md:flex items-center relative">
        <div className="relative w-full">
          <label htmlFor="global-search-input" className="sr-only">
            Search roadmaps, competencies, and portal modules
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            aria-label="Search roadmaps, competencies, and portal modules"
            aria-expanded={isSearchFocused}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
          />
        </div>

        {/* Spotlight Suggestions Dropdown */}
        {isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 text-xs animate-fadeIn max-h-80 overflow-y-auto">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((group, gIdx) => (
                <div key={gIdx} className="mb-2 last:mb-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                    {group.category}
                  </span>
                  <div className="space-y-0.5">
                    {group.items.map((item, iIdx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={iIdx}
                          type="button"
                          onClick={() => {
                            setIsSearchFocused(false);
                            setSearchQuery('');
                            navigate(item.path);
                          }}
                          className="w-full px-3 py-2 text-left rounded-lg hover:bg-blue-50/70 text-slate-700 hover:text-blue-700 flex items-center justify-between transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                            <span className="font-medium truncate">{item.label}</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-500 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
                No matching portal roadmaps or competencies found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, Notifications & Avatar Dropdown */}
      <div className="flex items-center gap-2.5 shrink-0">
        {quickAction && <div className="hidden sm:block">{quickAction}</div>}
        {primaryAction && <div>{primaryAction}</div>}

        {/* Interactive Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Platform Notifications (3 Unread)"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Notifications Drawer */}
          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl py-3 z-50 text-xs animate-fadeIn">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Notifications & Alerts</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                    3 Active
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        Mock Technical Interview
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Upcoming session with Faculty Evaluator scheduled for tomorrow at 10:00 AM.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        Weekly Sprint Due
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        2 weekly goals have target deadlines approaching in the next 48 hours.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        Placement Readiness Updated
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Your latest interview evaluation pushed your score to Tier 1 eligibility.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate('/student/goals');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-[11px]"
                  >
                    View All Sprint Commitments →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Avatar & Popover Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
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
                  <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wider">
                    <Shield className="w-2.5 h-2.5" />
                    <span className="capitalize">{displayRole}</span>
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
                          : displayRole === 'recruiter'
                          ? '/recruiter/company'
                          : '/';
                      navigate(targetPath);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
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

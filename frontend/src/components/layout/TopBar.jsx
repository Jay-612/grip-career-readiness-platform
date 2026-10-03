import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  MessageSquare,
  Building,
  Briefcase,
  BarChart2,
  FileText,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

// Role-specific notification definitions
const ROLE_NOTIFICATIONS = {
  student: {
    items: [
      {
        id: 'student-1',
        title: 'Mock Technical Interview',
        description: 'Upcoming session with Faculty Evaluator scheduled on your calendar.',
        time: 'Upcoming',
        icon: Calendar,
        iconColor: 'text-blue-600',
        path: '/student/interviews',
      },
      {
        id: 'student-2',
        title: 'Weekly Sprint Due',
        description: '2 weekly goals have target deadlines approaching in the next 48 hours.',
        time: 'Due soon',
        icon: Clock,
        iconColor: 'text-amber-500',
        path: '/student/goals',
      },
      {
        id: 'student-3',
        title: 'Placement Readiness Updated',
        description: 'Your latest interview evaluation pushed your score to Tier 1 eligibility.',
        time: 'Updated',
        icon: CheckCircle2,
        iconColor: 'text-emerald-500',
        path: '/student/career-compass',
      },
    ],
    footerText: 'View All Sprint Commitments →',
    footerPath: '/student/goals',
  },
  faculty: {
    items: [
      {
        id: 'faculty-1',
        title: 'Mock Interview Requests',
        description: 'Student interview requests awaiting your acceptance & Google Meet generation.',
        time: 'Action required',
        icon: Video,
        iconColor: 'text-blue-600',
        path: '/faculty/interviews',
      },
      {
        id: 'faculty-2',
        title: 'Student Guidance Inquiries',
        description: 'Unanswered student career guidance questions awaiting your review in the inbox.',
        time: 'Requires review',
        icon: MessageSquare,
        iconColor: 'text-amber-500',
        path: '/faculty/guidance',
      },
      {
        id: 'faculty-3',
        title: 'Department Placement Telemetry',
        description: 'Cohort benchmark updated: 85% placement readiness achieved in CS & IT.',
        time: 'Today',
        icon: BarChart2,
        iconColor: 'text-emerald-500',
        path: '/faculty/analytics',
      },
    ],
    footerText: 'Open Faculty Evaluation Center →',
    footerPath: '/faculty/interviews',
  },
  alumni: {
    items: [
      {
        id: 'alumni-1',
        title: 'New Mentorship Inquiries',
        description: 'Students requested 1-on-1 guidance on company interview preparation.',
        time: 'New inquiry',
        icon: Users,
        iconColor: 'text-blue-600',
        path: '/alumni/mentorship',
      },
      {
        id: 'alumni-2',
        title: 'Placement Experience Shared',
        description: 'Your shared placement insights article is receiving positive student feedback.',
        time: 'Trending',
        icon: Sparkles,
        iconColor: 'text-amber-500',
        path: '/alumni/stories',
      },
      {
        id: 'alumni-3',
        title: 'Annual Referral Drive 2026',
        description: 'Spring campus referral drive is now accepting alumni company openings.',
        time: 'Active cycle',
        icon: Briefcase,
        iconColor: 'text-emerald-500',
        path: '/alumni/dashboard',
      },
    ],
    footerText: 'Open Mentorship Inbox →',
    footerPath: '/alumni/mentorship',
  },
  recruiter: {
    items: [
      {
        id: 'recruiter-1',
        title: 'Tier-1 Candidate Matches',
        description: '14 verified candidates meet your Cloud Backend & Full-Stack criteria.',
        time: 'Updated today',
        icon: Users,
        iconColor: 'text-blue-600',
        path: '/recruiter/dashboard',
      },
      {
        id: 'recruiter-2',
        title: 'Applicant Evaluation Scores',
        description: 'Recent interview feedback scores compiled for campus applicants.',
        time: 'Pending review',
        icon: CheckCircle2,
        iconColor: 'text-amber-500',
        path: '/recruiter/feedback',
      },
      {
        id: 'recruiter-3',
        title: 'Institutional Drive Verified',
        description: 'Company credentials verified for Spring 2026 campus placement hiring.',
        time: 'Verified',
        icon: Shield,
        iconColor: 'text-emerald-500',
        path: '/recruiter/company',
      },
    ],
    footerText: 'Go to Candidate Shortlists →',
    footerPath: '/recruiter/dashboard',
  },
  admin: {
    items: [
      {
        id: 'admin-1',
        title: 'User Role Access Requests',
        description: 'Faculty, recruiter, and alumni accounts pending administrative verification.',
        time: 'Pending approval',
        icon: Shield,
        iconColor: 'text-amber-500',
        path: '/admin/users',
      },
      {
        id: 'admin-2',
        title: 'Curriculum Framework Revisions',
        description: '2 department skill tracks awaiting syllabus roadmap sign-off.',
        time: 'Audit required',
        icon: BookOpen,
        iconColor: 'text-blue-600',
        path: '/admin/curriculum',
      },
      {
        id: 'admin-3',
        title: 'System Telemetry & Placement Reports',
        description: 'Campus-wide readiness scores and placement drive analytics compiled.',
        time: 'Report ready',
        icon: BarChart2,
        iconColor: 'text-emerald-500',
        path: '/admin/analytics',
      },
    ],
    footerText: 'Open Administration Console →',
    footerPath: '/admin/dashboard',
  },
};

// Role-specific spotlight search suggestions
const ROLE_SEARCH_SUGGESTIONS = {
  student: [
    {
      category: 'Student Portal Modules',
      items: [
        { label: 'Student Dashboard', path: '/student/dashboard', icon: Sparkles },
        { label: 'Weekly Goals Workspace', path: '/student/goals', icon: Target },
        { label: 'Career Compass & Roadmaps', path: '/student/career-compass', icon: Compass },
        { label: 'Mock Interview Center', path: '/student/interviews', icon: Video },
        { label: 'Faculty & Mentorship Guidance', path: '/student/guidance', icon: Users },
        { label: 'Profile & Skills Competencies', path: '/student/profile', icon: UserIcon },
        { label: 'Alumni Placement Stories', path: '/student/alumni-posts', icon: BookOpen },
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
  ],
  faculty: [
    {
      category: 'Faculty Management Console',
      items: [
        { label: 'Faculty Dashboard & Cohort Overview', path: '/faculty/dashboard', icon: Sparkles },
        { label: 'Interview Evaluation & Rubrics', path: '/faculty/interviews', icon: Video },
        { label: 'Student Guidance & Inquiries Inbox', path: '/faculty/guidance', icon: MessageSquare },
        { label: 'HOD Department Readiness Analytics', path: '/faculty/analytics', icon: BarChart2 },
      ],
    },
  ],
  alumni: [
    {
      category: 'Alumni Mentorship Console',
      items: [
        { label: 'Alumni Dashboard & Community Hub', path: '/alumni/dashboard', icon: Sparkles },
        { label: 'Student Mentorship Inquiries', path: '/alumni/mentorship', icon: Users },
        { label: 'Publish Placement Stories', path: '/alumni/stories', icon: BookOpen },
      ],
    },
  ],
  recruiter: [
    {
      category: 'Campus Recruitment Console',
      items: [
        { label: 'Recruiter Dashboard & Candidate Search', path: '/recruiter/dashboard', icon: Sparkles },
        { label: 'Corporate Company Profile', path: '/recruiter/company', icon: Building },
        { label: 'Student Interview Feedback & Ratings', path: '/recruiter/feedback', icon: CheckCircle2 },
      ],
    },
  ],
  admin: [
    {
      category: 'System Administration Modules',
      items: [
        { label: 'Admin Dashboard & System Overview', path: '/admin/dashboard', icon: Sparkles },
        { label: 'User & Role Access Management', path: '/admin/users', icon: Shield },
        { label: 'Curriculum & Semester Frameworks', path: '/admin/curriculum', icon: BookOpen },
        { label: 'Corporate Company Directory', path: '/admin/companies', icon: Building },
        { label: 'Campus Placement Drives & Events', path: '/admin/events', icon: Calendar },
        { label: 'Placement Telemetry & System Analytics', path: '/admin/analytics', icon: BarChart2 },
      ],
    },
  ],
};

const TopBar = ({
  breadcrumbs = [],
  statusBadge,
  searchPlaceholder = 'Search roadmaps, competencies, modules...',
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
  const [readNotifications, setReadNotifications] = useState([]);

  const searchContainerRef = useRef(null);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayRole = (user?.role || 'student').toLowerCase();
  const roleConfig = ROLE_NOTIFICATIONS[displayRole] || ROLE_NOTIFICATIONS.student;
  const searchSuggestions = ROLE_SEARCH_SUGGESTIONS[displayRole] || ROLE_SEARCH_SUGGESTIONS.student;

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

  // Calculate unread count
  const unreadCount = roleConfig.items.filter(
    (item) => !readNotifications.includes(item.id)
  ).length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setReadNotifications(roleConfig.items.map((i) => i.id));
  };

  const handleNotificationClick = (item) => {
    setReadNotifications((prev) => [...new Set([...prev, item.id])]);
    setIsNotificationsOpen(false);
    navigate(item.path);
  };

  // Filter spotlight suggestions based on role-specific list
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return searchSuggestions;
    return searchSuggestions
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery, searchSuggestions]);

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
            aria-label={`Platform Notifications (${unreadCount} Unread)`}
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Drawer */}
          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl border border-slate-200 shadow-2xl py-3 z-50 text-xs animate-fadeIn">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Notifications & Alerts</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                      {displayRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {unreadCount} New
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
                        title="Mark all notifications as read"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {roleConfig.items.map((item) => {
                    const Icon = item.icon;
                    const isRead = readNotifications.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3 transition-colors flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 ${
                          !isRead ? 'bg-blue-50/25' : ''
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${item.iconColor} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-slate-800 truncate block">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate(roleConfig.footerPath);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] inline-flex items-center gap-1"
                  >
                    <span>{roleConfig.footerText}</span>
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
                          : displayRole === 'faculty'
                          ? '/faculty/dashboard'
                          : displayRole === 'alumni'
                          ? '/alumni/dashboard'
                          : displayRole === 'recruiter'
                          ? '/recruiter/company'
                          : '/admin/dashboard';
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

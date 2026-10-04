import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User as UserIcon,
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
  CheckCheck,
  Settings,
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
        id: 'student-guidance-reply',
        title: 'Faculty Guidance Reply',
        description: 'A faculty advisor reviewed your question and replied with guidance.',
        time: 'New reply',
        icon: MessageSquare,
        iconColor: 'text-blue-600',
        path: '/student/guidance',
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
    footerText: 'View Guidance & Advice →',
    footerPath: '/student/guidance',
  },
  faculty: {
    items: [
      {
        id: 'faculty-1',
        title: 'Mock Interview Requests',
        description: 'Student interview requests awaiting evaluation in your schedule.',
        time: 'Action required',
        icon: Video,
        iconColor: 'text-blue-600',
        path: '/faculty/interviews',
      },
      {
        id: 'faculty-2',
        title: 'Student Guidance Inquiries',
        description: 'Unanswered student career guidance questions awaiting your review.',
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
    footerText: 'Open Interview Center →',
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
        description: 'Your shared placement insights article is receiving student feedback.',
        time: 'Trending',
        icon: Sparkles,
        iconColor: 'text-amber-500',
        path: '/alumni/experience',
      },
      {
        id: 'alumni-3',
        title: 'Campus Referral Drive',
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
        title: 'Candidate Matches',
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
        title: 'Drive Verified',
        description: 'Company credentials verified for Spring 2026 campus placement hiring.',
        time: 'Verified',
        icon: Building,
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
        icon: Users,
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
        { label: 'Dashboard', path: '/student/dashboard', icon: Sparkles },
        { label: 'Career Compass', path: '/student/career-compass', icon: Compass },
        { label: 'Goals', path: '/student/goals', icon: Target },
        { label: 'Interviews', path: '/student/interviews', icon: Video },
        { label: 'Guidance', path: '/student/guidance', icon: MessageSquare },
        { label: 'Alumni Insights', path: '/student/alumni-posts', icon: BookOpen },
        { label: 'Profile', path: '/student/profile', icon: UserIcon },
      ],
    },
  ],
  faculty: [
    {
      category: 'Faculty Management Console',
      items: [
        { label: 'Dashboard', path: '/faculty/dashboard', icon: Sparkles },
        { label: 'Interviews', path: '/faculty/interviews', icon: Video },
        { label: 'Guidance', path: '/faculty/guidance', icon: MessageSquare },
        { label: 'Analytics', path: '/faculty/analytics', icon: BarChart2 },
      ],
    },
  ],
  alumni: [
    {
      category: 'Alumni Mentorship Console',
      items: [
        { label: 'Dashboard', path: '/alumni/dashboard', icon: Sparkles },
        { label: 'Mentorship', path: '/alumni/mentorship', icon: Users },
        { label: 'Experience', path: '/alumni/experience', icon: BookOpen },
      ],
    },
  ],
  recruiter: [
    {
      category: 'Campus Recruitment Console',
      items: [
        { label: 'Dashboard', path: '/recruiter/dashboard', icon: Sparkles },
        { label: 'Company', path: '/recruiter/company', icon: Building },
        { label: 'Feedback', path: '/recruiter/feedback', icon: CheckCircle2 },
      ],
    },
  ],
  admin: [
    {
      category: 'System Administration Modules',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: Sparkles },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Curriculum', path: '/admin/curriculum', icon: BookOpen },
        { label: 'Companies', path: '/admin/companies', icon: Building },
        { label: 'Events', path: '/admin/events', icon: Calendar },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
      ],
    },
  ],
};

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
  '/faculty/interviews': 'Interviews',
  '/faculty/guidance': 'Guidance',
  '/faculty/analytics': 'Analytics',
  // Alumni
  '/alumni/dashboard': 'Dashboard',
  '/alumni/mentorship': 'Mentorship',
  '/alumni/experience': 'Experience',
  // Recruiter
  '/recruiter/dashboard': 'Dashboard',
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
  statusBadge = null,
  searchPlaceholder = 'Search portal...',
  onSearch,
  quickAction,
  primaryAction,
  userInitials,
  onMenuToggle,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const [liveNotifications, setLiveNotifications] = useState([]);

  const searchContainerRef = useRef(null);

  // Load real-time in-app notifications (New Event, Event Reminders, etc.)
  useEffect(() => {
    let isMounted = true;
    const fetchLiveNotes = async () => {
      if (!user) return;
      try {
        const { notificationService } = await import('../../services/notificationService');
        const res = await notificationService.getNotifications(15);
        if (isMounted && res?.notifications) {
          setLiveNotifications(res.notifications);
        }
      } catch (_) {
        // Fallback silently to static role items
      }
    };
    fetchLiveNotes();
    const interval = setInterval(fetchLiveNotes, 30000); // Polling every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayRole = (user?.role || 'student').toLowerCase();
  const baseRoleConfig = ROLE_NOTIFICATIONS[displayRole] || ROLE_NOTIFICATIONS.student;

  // Merge dynamic notifications from backend with default role notifications
  const mergedNotificationItems = useMemo(() => {
    const formattedLive = liveNotifications.map((n) => {
      const isReminder = n.type === 'event_reminder';
      const isNewEvent = n.type === 'new_event';
      const timeStr = n.createdAt
        ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      return {
        id: n._id || n.id,
        isDbNotification: true,
        isRead: n.read,
        title: n.title,
        description: n.message,
        time: isReminder ? 'Reminder' : isNewEvent ? 'New Event' : timeStr,
        icon: isReminder ? Clock : isNewEvent ? Calendar : MessageSquare,
        iconColor: isReminder ? 'text-amber-500' : isNewEvent ? 'text-blue-600' : 'text-emerald-500',
        path: n.actionPath || (isReminder || isNewEvent ? `/student/events/${n.eventId?._id || n.eventId || ''}` : '/student/dashboard'),
      };
    });

    return [...formattedLive, ...baseRoleConfig.items];
  }, [liveNotifications, baseRoleConfig]);

  const roleConfig = useMemo(() => ({
    ...baseRoleConfig,
    items: mergedNotificationItems,
  }), [baseRoleConfig, mergedNotificationItems]);

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

  // Calculate unread count (live DB notifications check n.isRead, static check readNotifications)
  const unreadCount = roleConfig.items.filter((item) => {
    if (item.isDbNotification) {
      return !item.isRead && !readNotifications.includes(item.id);
    }
    return !readNotifications.includes(item.id);
  }).length;

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    setReadNotifications(roleConfig.items.map((i) => i.id));
    try {
      const { notificationService } = await import('../../services/notificationService');
      await notificationService.markAllAsRead();
    } catch (_) {}
  };

  const handleNotificationClick = async (item) => {
    setReadNotifications((prev) => [...new Set([...prev, item.id])]);
    setIsNotificationsOpen(false);
    if (item.isDbNotification) {
      try {
        const { notificationService } = await import('../../services/notificationService');
        await notificationService.markAsRead(item.id);
      } catch (_) {}
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  // Derive section title from current pathname if breadcrumbs are not provided
  const currentSection = useMemo(() => {
    if (breadcrumbs.length > 0) {
      return breadcrumbs[breadcrumbs.length - 1];
    }
    return SECTION_TITLES[location.pathname] || 'Dashboard';
  }, [breadcrumbs, location.pathname]);

  // Filter spotlight suggestions
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

  // Close search suggestions, notifications, and profile menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

      {/* Middle: Optional Global Navigation Search */}
      <div ref={searchContainerRef} className="flex-1 max-w-sm hidden md:flex items-center relative">
        <div className="relative w-full">
          <label htmlFor="global-search-input" className="sr-only">
            Search portal sections
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            aria-label="Search portal sections"
            aria-expanded={isSearchFocused}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
          />
        </div>

        {/* Search Suggestions Dropdown */}
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
                No matching portal sections found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & Profile Menu Only */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label={`Platform notifications (${unreadCount} unread)`}
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
                    <span className="font-bold text-slate-900">Notifications</span>
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

        {/* Profile Avatar & Subdued Menu */}
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
                    <span>Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      const targetPath =
                        displayRole === 'student'
                          ? '/student/profile'
                          : displayRole === 'recruiter'
                          ? '/recruiter/company'
                          : `/${displayRole}/dashboard`;
                      navigate(targetPath);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings</span>
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

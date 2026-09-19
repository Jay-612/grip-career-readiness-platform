import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

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

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.name || 'Verified Student';
  const displayEmail = user?.email || 'student@campus.edu';
  const displayRole = user?.role || 'student';

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
                  {idx > 0 && <span className="text-slate-300">›</span>}
                  <span className={isLast ? 'font-semibold text-slate-900 truncate' : 'hover:text-slate-700 truncate'}>
                    {crumb}
                  </span>
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Status / Session Badge */}
        {statusBadge ? (
          <div className="hidden md:flex items-center">{statusBadge}</div>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-semibold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Session: Spring 2026 Cycle</span>
          </div>
        )}
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-md hidden md:flex items-center">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications & Avatar Dropdown */}
      <div className="flex items-center gap-2.5 shrink-0">
        {quickAction && <div className="hidden sm:block">{quickAction}</div>}
        {primaryAction && <div>{primaryAction}</div>}

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Profile Avatar & Popover Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                      navigate(`/${displayRole}/profile`);
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

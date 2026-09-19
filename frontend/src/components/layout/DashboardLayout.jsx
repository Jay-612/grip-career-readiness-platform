import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import TopBar from './TopBar';

const DashboardLayout = ({
  role: propRole,
  breadcrumbs = [],
  statusBadge,
  searchPlaceholder,
  onSearch,
  quickAction,
  primaryAction,
  children,
  maxWidth = 'max-w-7xl',
  className = '',
}) => {
  const { user, role: authRole } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const activeRole = propRole || authRole || 'student';

  const defaultQuickAction = (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-grip-border bg-white text-xs font-semibold text-grip-dark hover:bg-slate-50 transition-colors shadow-sm"
    >
      <span className="text-grip-blue font-bold">+</span>
      <span>Log Progress</span>
    </button>
  );

  const defaultPrimaryAction = (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-grip-blue text-white text-xs font-semibold hover:bg-grip-blue-hover transition-colors shadow-sm"
    >
      Request Mentorship
    </button>
  );

  return (
    <div className="min-h-screen bg-grip-canvas canvas-dot-grid flex text-grip-dark font-sans antialiased selection:bg-grip-blue selection:text-white">
      {/* Persistent Desktop Sidebar */}
      <Sidebar
        role={activeRole}
        user={user}
        isOpen={false}
        className="hidden lg:flex"
      />

      {/* Responsive Mobile Drawer Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        role={activeRole}
        user={user}
      />

      {/* Main Content Area (Offset by 256px Sidebar on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Portal TopBar */}
        <TopBar
          breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : ['Portal', 'Student Dashboard']}
          statusBadge={statusBadge}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          quickAction={quickAction !== undefined ? quickAction : defaultQuickAction}
          primaryAction={primaryAction !== undefined ? primaryAction : defaultPrimaryAction}
          onMenuToggle={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Page Container with Outlet / Children */}
        <main className={`flex-1 p-6 ${maxWidth} w-full mx-auto space-y-6 ${className}`}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

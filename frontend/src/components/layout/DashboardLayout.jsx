import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import TopBar from './TopBar';
import ErrorBoundary from '../common/ErrorBoundary';

const DashboardLayout = ({
  role: propRole,
  breadcrumbs = [],
  statusBadge = null,
  searchPlaceholder,
  onSearch,
  quickAction = null,
  primaryAction = null,
  children,
  maxWidth = 'max-w-7xl',
  className = '',
}) => {
  const { user, role: authRole } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const activeRole = propRole || authRole || 'student';

  return (
    <div className="min-h-screen bg-slate-50 canvas-dot-grid flex text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
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
          breadcrumbs={breadcrumbs}
          statusBadge={statusBadge}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          quickAction={quickAction}
          primaryAction={primaryAction}
          onMenuToggle={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Page Container with Outlet / Children */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${maxWidth} w-full mx-auto space-y-6 ${className}`}>
          <ErrorBoundary fallbackTitle="Portal Workspace Display Error">
            {children || <Outlet />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

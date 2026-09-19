import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppLayout = ({
  role = 'student',
  user,
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-dot-grid flex text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Role-Specific Sidebar */}
      <Sidebar
        role={role}
        user={user}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by Sidebar on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Portal TopBar */}
        <TopBar
          breadcrumbs={breadcrumbs}
          statusBadge={statusBadge}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          quickAction={quickAction}
          primaryAction={primaryAction}
          userInitials={user?.initials || (role === 'student' ? 'RM' : role === 'faculty' ? 'NS' : role === 'alumni' ? 'VS' : 'MV')}
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Dynamic Page Container */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${maxWidth} w-full mx-auto ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

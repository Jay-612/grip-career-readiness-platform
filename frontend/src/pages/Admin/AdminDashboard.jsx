import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import adminService from '../../services/adminService';
import AdminDashboardHeader from '../../components/admin/AdminDashboardHeader';
import AdminSummaryMetrics from '../../components/admin/AdminSummaryMetrics';
import AdminAlerts from '../../components/admin/AdminAlerts';
import AdminQuickLinks from '../../components/admin/AdminQuickLinks';
import Badge from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';

export const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState([]);
  const [lastSynced, setLastSynced] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [overviewData, eventsData] = await Promise.allSettled([
        adminService.getOverview(),
        adminService.getEvents(),
      ]);

      if (overviewData.status === 'fulfilled') {
        setOverview(overviewData.value);
      }
      if (eventsData.status === 'fulfilled') {
        const evts = eventsData.value?.events || [];
        setEvents(Array.isArray(evts) ? evts : []);
      }
      setLastSynced(new Date());
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load executive overview telemetry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-4">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-xl mx-auto">
        <ErrorState
          title="Admin Telemetry Unavailable"
          message={error}
          onRetry={fetchDashboardData}
          retryText="Retry Loading Console"
        />
      </div>
    );
  }

  const kpis = overview?.kpis || {};
  const recentUsers = overview?.activityFeed?.recentUsers || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header */}
      <AdminDashboardHeader
        lastSynced={lastSynced}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. System Summary (Max 4 KPI blocks) */}
      <AdminSummaryMetrics
        totalUsers={kpis.totalUsers || 0}
        students={kpis.students || 0}
        faculty={kpis.faculty || 0}
        alumni={kpis.alumni || 0}
        recruiters={kpis.recruiters || 0}
        companies={kpis.companies || 0}
        roadmaps={kpis.careerRoadmaps || 0}
        events={kpis.departmentEvents || 0}
      />

      {/* 3. User Summary & Upcoming Events (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* User Summary */}
        <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">User Account Summary</h2>
                <p className="text-[11px] text-slate-500">Recently registered platform accounts</p>
              </div>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentUsers.slice(0, 4).map((u) => (
              <div key={u._id || u.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">{u.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono truncate block">
                    {u.email}
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <Badge variant="primary" size="xs">
                    {u.role}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events (3-5 items) */}
        <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Upcoming Campus Events</h2>
                <p className="text-[11px] text-slate-500">Scheduled institutional workshops &amp; drives</p>
              </div>
            </div>
            <Link
              to="/admin/events"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>View Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {events.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No upcoming events scheduled.
              </div>
            ) : (
              events.slice(0, 4).map((ev) => (
                <div key={ev.id || ev._id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">{ev.title}</span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      Focus: {ev.targetSkill || 'Campus Placement Readiness'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 shrink-0">
                    {ev.date ? new Date(ev.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Upcoming'}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 4. Admin Alerts */}
      <AdminAlerts
        pendingUsersCount={0}
        eventsCount={events.length}
        companiesCount={kpis.companies || 0}
      />

      {/* 5. Quick Navigation */}
      <AdminQuickLinks />
    </div>
  );
};

export default AdminDashboard;

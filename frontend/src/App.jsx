import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/Public/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import StudentDashboard from './pages/Student/Dashboard';
import ProfileSkillsPage from './pages/Student/ProfileSkillsPage';
import CareerCompassPage from './pages/Student/CareerCompassPage';
import GoalTrackerPage from './pages/Student/GoalTrackerPage';
import GuidancePage from './pages/Student/GuidancePage';
import InterviewCenterPage from './pages/Student/InterviewCenterPage';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import { GraduationCap, LogOut, CheckCircle, ArrowLeft } from 'lucide-react';

// Clean placeholder for upcoming student screens (Goals, Compass, Mentorship, etc.)
const PlaceholderScreen = ({ title }) => {
  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-card flex flex-col items-center text-center gap-4 my-6">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
        <GraduationCap className="w-6 h-6" />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
        <Badge variant="primary" size="sm" className="self-center">
          CAMPUS READINESS MODULE
        </Badge>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
          {title}
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          This section is scaffolded and ready for role-specific implementation.
        </p>
      </div>
      <Link to="/student/dashboard" className="mt-2">
        <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

// Placeholder for other roles during upcoming implementation phases
const RoleDashboardPlaceholder = ({ title, roleRequired }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-dot-grid flex flex-col justify-between">
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto border-b border-slate-200/80 bg-white/80 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">GRIP</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 tracking-wider">
                Portal
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Campus Career Readiness</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-semibold text-slate-800">{user?.name || 'Verified User'}</span>
            <span className="text-slate-400">{user?.email}</span>
          </div>
          <Badge variant="primary" size="sm" className="capitalize">
            {user?.role || roleRequired}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center flex flex-col items-center gap-5 w-full">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Badge variant="success" className="self-center">
              AUTHENTICATED
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {title}
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Welcome back, <strong className="text-slate-700">{user?.name}</strong>! You have authenticated as <strong className="capitalize text-blue-600">{user?.role}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Link to="/">
              <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Public Landing
              </Button>
            </Link>
            <Button variant="danger" size="md" onClick={logout} leftIcon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </main>

      <footer className="w-full px-6 py-4 border-t border-slate-200/80 bg-white/70 text-xs text-slate-400 text-center">
        © 2026 GRIP — Higher Education Career Readiness Platform
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Authenticated Layout & Nested Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout
                  role="student"
                  breadcrumbs={['Portal', 'Student Dashboard']}
                  statusBadge={
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-semibold text-blue-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Session: Spring 2026 Cycle</span>
                    </div>
                  }
                  quickAction={
                    <Button variant="outline" size="sm" className="text-xs">
                      + Log Progress
                    </Button>
                  }
                  primaryAction={
                    <Button variant="primary" size="sm" className="text-xs shadow-xs">
                      Request Mentorship
                    </Button>
                  }
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<ProfileSkillsPage />} />
            <Route path="career-compass" element={<CareerCompassPage />} />
            <Route path="career" element={<Navigate to="/student/career-compass" replace />} />
            <Route path="goals" element={<GoalTrackerPage />} />
            <Route path="guidance" element={<GuidancePage />} />
            <Route path="mentorship" element={<Navigate to="/student/guidance" replace />} />
            <Route path="interviews" element={<InterviewCenterPage />} />
            <Route path="interview-readiness" element={<Navigate to="/student/interviews" replace />} />
            <Route path="readiness" element={<Navigate to="/student/interviews" replace />} />
          </Route>

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <RoleDashboardPlaceholder title="Faculty Mentorship & Analytics Portal" roleRequired="faculty" />
              </ProtectedRoute>
            }
          />

          {/* Alumni Protected Routes */}
          <Route
            path="/alumni/*"
            element={
              <ProtectedRoute allowedRoles={['alumni']}>
                <RoleDashboardPlaceholder title="Alumni Advisor & Network Portal" roleRequired="alumni" />
              </ProtectedRoute>
            }
          />

          {/* Recruiter Protected Routes */}
          <Route
            path="/recruiter/*"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RoleDashboardPlaceholder title="Campus Recruiter Hiring Hub" roleRequired="recruiter" />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

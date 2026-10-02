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
import AlumniInsightsPage from './pages/Student/AlumniInsightsPage';
import FacultyDashboard from './pages/Faculty/Dashboard';
import InterviewEvaluationPage from './pages/Faculty/InterviewEvaluationPage';
import GuidanceInboxPage from './pages/Faculty/GuidanceInboxPage';
import HodAnalyticsPage from './pages/Faculty/HodAnalyticsPage';
import AlumniDashboard from './pages/Alumni/AlumniDashboard';
import ExperiencePublisherPage from './pages/Alumni/ExperiencePublisherPage';
import MentorshipInboxPage from './pages/Alumni/MentorshipInboxPage';
import RecruiterDashboard from './pages/Recruiter/RecruiterDashboard';
import CompanyProfilePage from './pages/Recruiter/CompanyProfilePage';
import StudentFeedbackPortalPage from './pages/Recruiter/StudentFeedbackPortalPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagementPage from './pages/Admin/UserManagementPage';
import CurriculumRoadmapPage from './pages/Admin/CurriculumRoadmapPage';
import CompanyDirectoryPage from './pages/Admin/CompanyDirectoryPage';
import EventManagementPage from './pages/Admin/EventManagementPage';
import SystemAnalyticsPage from './pages/Admin/SystemAnalyticsPage';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import { GraduationCap, LogOut, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

// Clean placeholder for upcoming screens (Goals, Compass, Mentorship, Faculty Interviews, etc.)
const PlaceholderScreen = ({ title, backPath }) => {
  const { user } = useAuth();
  const targetBackPath =
    backPath ||
    (user?.role === 'alumni'
      ? '/alumni/dashboard'
      : user?.role === 'recruiter'
      ? '/recruiter/dashboard'
      : user?.role === 'faculty'
      ? '/faculty/dashboard'
      : '/student/dashboard');

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
      <Link to={targetBackPath} className="mt-2">
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
                    <Link to="/student/goals">
                      <Button variant="outline" size="sm" className="text-xs">
                        + Log Progress
                      </Button>
                    </Link>
                  }
                  primaryAction={
                    <Link to="/student/guidance">
                      <Button variant="primary" size="sm" className="text-xs shadow-xs">
                        Request Mentorship
                      </Button>
                    </Link>
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
            <Route path="mock-interview" element={<Navigate to="/student/interviews" replace />} />
            <Route path="mock-interviews" element={<Navigate to="/student/interviews" replace />} />
            <Route path="alumni-posts" element={<AlumniInsightsPage />} />
            <Route path="alumni-stories" element={<Navigate to="/student/alumni-posts" replace />} />
            <Route path="experiences" element={<Navigate to="/student/alumni-posts" replace />} />
          </Route>

          {/* Faculty Authenticated Layout & Nested Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <DashboardLayout
                  role="faculty"
                  breadcrumbs={['Portal', 'Faculty Dashboard']}
                  statusBadge={
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-semibold text-blue-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Available for Mocks</span>
                    </div>
                  }
                  quickAction={
                    <Link to="/faculty/guidance">
                      <Button variant="outline" size="sm" className="text-xs">
                        Guidance Inbox
                      </Button>
                    </Link>
                  }
                  primaryAction={
                    <Link to="/faculty/interviews">
                      <Button variant="primary" size="sm" className="text-xs shadow-xs">
                        + Evaluate Student
                      </Button>
                    </Link>
                  }
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="interviews" element={<InterviewEvaluationPage />} />
            <Route path="interviews/:id" element={<InterviewEvaluationPage />} />
            <Route path="evaluations" element={<Navigate to="/faculty/interviews" replace />} />
            <Route path="evaluations/:id" element={<InterviewEvaluationPage />} />
            <Route path="guidance" element={<GuidanceInboxPage />} />
            <Route path="guidance/:requestId" element={<GuidanceInboxPage />} />
            <Route path="guidance-inbox" element={<Navigate to="/faculty/guidance" replace />} />
            <Route path="guidance-inbox/:requestId" element={<GuidanceInboxPage />} />
            <Route path="analytics" element={<HodAnalyticsPage />} />
            <Route path="hod-analytics" element={<Navigate to="/faculty/analytics" replace />} />
          </Route>

          {/* Alumni Authenticated Layout & Nested Routes */}
          <Route
            path="/alumni"
            element={
              <ProtectedRoute allowedRoles={['alumni']}>
                <DashboardLayout
                  role="alumni"
                  breadcrumbs={['Portal', 'Alumni Advisor Hub']}
                  statusBadge={
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Alumni Mentor Network</span>
                    </div>
                  }
                  quickAction={
                    <Link to="/alumni/experience">
                      <Button variant="outline" size="sm" className="text-xs">
                        + Share Experience
                      </Button>
                    </Link>
                  }
                  primaryAction={
                    <Link to="/alumni/mentorship">
                      <Button variant="primary" size="sm" className="text-xs shadow-xs">
                        Mentorship Inbox
                      </Button>
                    </Link>
                  }
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/alumni/dashboard" replace />} />
            <Route path="dashboard" element={<AlumniDashboard />} />
            <Route path="experience" element={<ExperiencePublisherPage />} />
            <Route path="experience-publisher" element={<Navigate to="/alumni/experience" replace />} />
            <Route path="mentorship" element={<MentorshipInboxPage />} />
            <Route path="mentorship/:requestId" element={<MentorshipInboxPage />} />
            <Route path="mentorship-inbox" element={<Navigate to="/alumni/mentorship" replace />} />
          </Route>

          {/* Recruiter Protected Layout & Nested Routes */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <DashboardLayout
                  role="recruiter"
                  breadcrumbs={['Portal', 'Recruiter Hub']}
                  statusBadge={
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-semibold text-blue-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>Hiring Partner Active</span>
                    </div>
                  }
                  quickAction={
                    <Link to="/recruiter/company">
                      <Button variant="outline" size="sm" className="text-xs">
                        Company Profile
                      </Button>
                    </Link>
                  }
                  primaryAction={
                    <Link to="/recruiter/feedback">
                      <Button variant="primary" size="sm" className="text-xs shadow-xs">
                        + Review Candidate
                      </Button>
                    </Link>
                  }
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="company" element={<CompanyProfilePage />} />
            <Route path="company-profile" element={<Navigate to="/recruiter/company" replace />} />
            <Route path="feedback" element={<StudentFeedbackPortalPage />} />
            <Route path="feedback/:studentId" element={<StudentFeedbackPortalPage />} />
            <Route path="student-feedback" element={<Navigate to="/recruiter/feedback" replace />} />
            <Route path="student-feedback/:studentId" element={<Navigate to="/recruiter/feedback" replace />} />
          </Route>

          {/* Admin Protected Layout & Nested Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout
                  role="admin"
                  breadcrumbs={['Portal', 'Institutional Administration']}
                  statusBadge={
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Admin Console: System Active</span>
                    </div>
                  }
                  quickAction={
                    <Link to="/admin/events">
                      <Button variant="outline" size="sm" className="text-xs">
                        + Schedule Event
                      </Button>
                    </Link>
                  }
                  primaryAction={
                    <Link to="/admin/users">
                      <Button variant="primary" size="sm" className="text-xs shadow-xs">
                        + Add User
                      </Button>
                    </Link>
                  }
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="curriculum" element={<CurriculumRoadmapPage />} />
            <Route path="roadmaps" element={<Navigate to="/admin/curriculum" replace />} />
            <Route path="companies" element={<CompanyDirectoryPage />} />
            <Route path="events" element={<EventManagementPage />} />
            <Route path="analytics" element={<SystemAnalyticsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

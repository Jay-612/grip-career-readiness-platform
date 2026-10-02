import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Shield,
  ArrowRight,
  User,
  Building,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, getRoleDashboardPath } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const initialRoleParam = searchParams.get('role');
  const validRoles = ['student', 'faculty', 'alumni', 'recruiter', 'admin'];

  const [role, setRole] = useState(() => {
    return initialRoleParam && validRoles.includes(initialRoleParam.toLowerCase())
      ? initialRoleParam.toLowerCase()
      : 'student';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [roleMismatchData, setRoleMismatchData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync role if query parameter changes in URL
  React.useEffect(() => {
    const r = new URLSearchParams(location.search).get('role');
    if (r && validRoles.includes(r.toLowerCase())) {
      setRole(r.toLowerCase());
      setRoleMismatchData(null);
    }
  }, [location.search]);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboardPath(user.role, user), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRoleDashboardPath]);

  const ROLE_CONFIGS = {
    student: {
      label: 'Student',
      placeholder: 'aarav.sharma@campus.edu',
      demoEmail: 'aarav.sharma@campus.edu',
      demoPassword: 'Password123!',
      badgeText: 'Candidate Access',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-100',
      description: 'Authenticate with your university-assigned student identity handle.',
    },
    faculty: {
      label: 'Faculty',
      placeholder: 'dr.rajesh.kumar@campus.edu or FAC-CSE-001',
      demoEmail: 'dr.rajesh.kumar@campus.edu',
      demoPassword: 'Password123!',
      badgeText: 'Faculty & HOD Access',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-100',
      description: 'Authenticate with your departmental email or Teacher / Employee ID.',
    },
    alumni: {
      label: 'Alumni',
      placeholder: 'vikram.aditya@alumni.edu',
      demoEmail: 'vikram.aditya@alumni.edu',
      demoPassword: 'Password123!',
      badgeText: 'Alumni Network Handle',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      description: 'Authenticate with your verified alumni mentorship handle.',
    },
    recruiter: {
      label: 'Recruiter',
      placeholder: 'alex.rivera@techcorp.com',
      demoEmail: 'alex.rivera@techcorp.com',
      demoPassword: 'Password123!',
      badgeText: 'Corporate Partner Domain',
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-100',
      description: 'Authenticate with your verified campus hiring identity.',
    },
    admin: {
      label: 'Admin',
      placeholder: 'admin@campus.edu',
      demoEmail: 'admin@campus.edu',
      demoPassword: 'Password123!',
      badgeText: 'Institutional Console',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-100',
      description: 'Authenticate with institutional administrator console credentials.',
    },
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setServerError('');
    setRoleMismatchData(null);
    setFieldErrors({});
  };

  const handleFillDemo = (targetRole = role) => {
    const cfg = ROLE_CONFIGS[targetRole] || ROLE_CONFIGS.student;
    setEmail(cfg.demoEmail);
    setPassword(cfg.demoPassword);
    setFieldErrors({});
    setServerError('');
    setRoleMismatchData(null);
  };

  const validateForm = () => {
    const errors = {};
    const trimmedInput = email.trim();
    if (!trimmedInput) {
      errors.email = role === 'faculty' ? 'Email address or Teacher ID is required.' : 'Email address is required.';
    } else if (trimmedInput.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput)) {
        errors.email = 'Please enter a valid email address.';
      }
    } else {
      // Must be at least 3 characters if ID is entered (e.g. FAC-CSE-001)
      if (trimmedInput.length < 3) {
        errors.email = 'Please enter a valid email or ID (at least 3 characters).';
      }
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setRoleMismatchData(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password, role);
      if (result?.success) {
        const fromState = location.state?.from?.pathname;
        const isFromValid = fromState && fromState.startsWith(`/${result.user.role}`);
        const destination = isFromValid ? fromState : result.redirectPath;
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
      if (err.roleMismatch && err.actualRole) {
        setRoleMismatchData(err.actualRole);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = () => {
    setServerError('University SSO (SAML 2.0 / Shibboleth) provider simulation active. Please sign in with registered email or create a new account.');
  };

  const roles = [
    { id: 'student', label: 'Student', icon: User },
    { id: 'faculty', label: 'Faculty', icon: GraduationCap },
    { id: 'alumni', label: 'Alumni', icon: Briefcase },
    { id: 'recruiter', label: 'Recruiter', icon: Building },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-dot-grid flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">GRIP</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 tracking-wider">
                Campus
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Learn • Prepare • Grow</span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <Link
            to="/"
            className="text-slate-500 hover:text-slate-900 font-medium transition-colors hidden sm:inline-flex items-center gap-1"
          >
            ← Back to Home
          </Link>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-500 hidden sm:inline">New to GRIP?</span>
          <Link
            to="/register"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs transition-colors"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Container - Centered Balanced Layout */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* Header Title Section */}
          <div className="text-center flex flex-col items-center gap-2.5">
            <Badge variant="info" dot={true} pulseDot={true} className="py-1 px-3">
              SECURE CAMPUS ACCESS
            </Badge>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Log In to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
                GRIP Campus
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 max-w-md">
              Enter your institutional credentials or university SSO to access your career command center.
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-7 sm:p-10 relative overflow-hidden">
            {/* Top gradient stripe */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 absolute top-0 left-0 right-0" />

            <div className="flex flex-col gap-6">
              {/* Server Error Alert */}
              {serverError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex flex-col gap-2.5 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span className="flex-1 leading-relaxed">{serverError}</span>
                  </div>
                  {roleMismatchData && (
                    <div className="pl-6.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleRoleSelect(roleMismatchData)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
                      >
                        <span>Switch to {ROLE_CONFIGS[roleMismatchData]?.label || roleMismatchData} Portal Tab</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Select Your Campus Role */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      SELECT YOUR CAMPUS ROLE
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFillDemo(role)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      Fill Demo Credentials
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60">
                    {roles.map((r) => {
                      const Icon = r.icon;
                      const isSelected = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleRoleSelect(r.id)}
                          className={`
                            flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all
                            ${isSelected
                              ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Institutional Email Field */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <label
                      htmlFor="email"
                      className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <span>
                        {role === 'admin'
                          ? 'Administrator Email'
                          : role === 'faculty'
                          ? 'Faculty Email or Teacher ID'
                          : 'Institutional / College Email'}
                      </span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${ROLE_CONFIGS[role]?.badgeColor || 'text-blue-700 bg-blue-50 border-blue-100'}`}>
                      {ROLE_CONFIGS[role]?.badgeText || 'Requires .edu / campus domain'}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      id="email"
                      type="text"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={ROLE_CONFIGS[role]?.placeholder || 'rohan.mehta@univ-engineering.edu'}
                      className={`
                        w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base rounded-xl border transition-all duration-150 pl-11 pr-4 py-3
                        ${fieldErrors.email
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200/90 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                        }
                        focus:outline-none
                      `}
                    />
                  </div>
                  {fieldErrors.email ? (
                    <p className="text-xs text-rose-600 font-medium mt-0.5">{fieldErrors.email}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ROLE_CONFIGS[role]?.description || 'Authenticate with your university-assigned identity handle.'}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <span>Password</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setServerError('Password reset link request initiated. Please check with your campus administrator.')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      className={`
                        w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base rounded-xl border transition-all duration-150 pl-11 pr-11 py-3
                        ${fieldErrors.password
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200/90 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                        }
                        focus:outline-none
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-rose-600 font-medium mt-0.5">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Remember Me Checkbox & Security Badge */}
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">
                      Remember for 30 days
                    </span>
                  </label>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-bit Encrypted</span>
                  </div>
                </div>

                {/* Primary Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  isLoading={isLoading}
                  loadingText="Signing In..."
                  rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
                  className="mt-2 text-sm sm:text-base font-semibold shadow-md shadow-blue-500/10 py-3.5 rounded-xl"
                >
                  Sign In to GRIP
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute px-3.5 bg-white text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  OR CONTINUE WITH INSTITUTIONAL ACCESS
                </span>
              </div>

              {/* University SSO Button */}
              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth={true}
                onClick={handleSSOLogin}
                leftIcon={<Shield className="w-4.5 h-4.5 text-blue-600" />}
                className="text-xs sm:text-sm font-semibold py-3 rounded-xl"
              >
                Log In with University Single Sign-On (SAML / Shibboleth)
              </Button>

              {/* Footer Switch */}
              <div className="text-center text-xs sm:text-sm text-slate-500 pt-1">
                Don't have an account yet?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[9px] font-bold ring-2 ring-white">
                RK
              </span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold ring-2 ring-white">
                DI
              </span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold ring-2 ring-white">
                AY
              </span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold ring-2 ring-white">
                SP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Empowering <strong className="text-slate-700">2,500+ Students</strong>,{' '}
              <strong className="text-slate-700">150+ Mentors</strong>, and{' '}
              <strong className="text-slate-700">100+ Recruiters</strong>.
            </p>
          </div>
        </div>
      </main>

      {/* Institutional Compliance Footer */}
      <footer className="w-full px-6 py-4 border-t border-slate-200/80 bg-white/70 backdrop-blur-xs text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-center sm:text-left">
            © 2026 GRIP — Career Readiness & Placement Platform, Higher Education Edition.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="hover:text-slate-900 cursor-pointer">Institutional Governance</span>
            <span>•</span>
            <span className="hover:text-slate-900 cursor-pointer">FERPA & Data Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-900 cursor-pointer">Technical Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;

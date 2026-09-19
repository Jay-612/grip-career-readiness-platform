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

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRoleDashboardPath]);

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Institutional email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
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

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result?.success) {
        const from = location.state?.from?.pathname || result.redirectPath;
        navigate(from, { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
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
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Header Title Section */}
          <div className="text-center flex flex-col items-center gap-2.5">
            <Badge variant="info" dot={true} pulseDot={true} className="py-1 px-3">
              SECURE CAMPUS ACCESS
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Log In to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
                GRIP Campus
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
              Enter your institutional credentials or university SSO to access your career command center.
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 relative overflow-hidden">
            {/* Top gradient stripe */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 absolute top-0 left-0 right-0" />

            <div className="flex flex-col gap-5">
              {/* Server Error Alert */}
              {serverError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="flex-1 leading-relaxed">{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Select Your Campus Role */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    SELECT YOUR CAMPUS ROLE
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
                    {roles.map((r) => {
                      const Icon = r.icon;
                      const isSelected = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`
                            flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-medium transition-all
                            ${isSelected
                              ? 'bg-white text-blue-700 font-semibold shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                            }
                          `}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Institutional Email Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <span>Institutional / College Email</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                      Requires .edu / campus domain
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rohan.mehta@univ-engineering.edu"
                      className={`
                        w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border transition-all duration-150 pl-10 pr-3.5 py-2.5
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
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Authenticate with your university-assigned identity handle.
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <span>Password</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setServerError('Password reset link request initiated. Please check with your campus administrator.')}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      className={`
                        w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border transition-all duration-150 pl-10 pr-10 py-2.5
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
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-rose-600 font-medium mt-0.5">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Remember Me Checkbox & Security Badge */}
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      Remember for 30 days
                    </span>
                  </label>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
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
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="mt-2 text-sm font-semibold shadow-md shadow-blue-500/10 py-3"
                >
                  Sign In to GRIP
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute px-3 bg-white text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  OR CONTINUE WITH INSTITUTIONAL ACCESS
                </span>
              </div>

              {/* University SSO Button */}
              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth={true}
                onClick={handleSSOLogin}
                leftIcon={<Shield className="w-4 h-4 text-blue-600" />}
                className="text-xs font-semibold py-2.5"
              >
                Log In with University Single Sign-On (SAML / Shibboleth)
              </Button>

              {/* Footer Switch */}
              <div className="text-center text-xs text-slate-500 pt-1">
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

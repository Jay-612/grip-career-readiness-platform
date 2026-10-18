import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, getRoleDashboardPath } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to user dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboardPath(user.role, user), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRoleDashboardPath]);

  const validateForm = () => {
    const errors = {};
    const trimmedInput = email.trim();
    if (!trimmedInput) {
      errors.email = 'Email address or ID is required.';
    } else if (trimmedInput.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput)) {
        errors.email = 'Please enter a valid email address.';
      }
    } else if (trimmedInput.length < 3) {
      errors.email = 'Please enter a valid email or ID.';
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
      // Direct unified authentication: backend determines role automatically without manual role tab selection
      const result = await login(email.trim(), password);
      if (result?.success) {
        const fromState = location.state?.from?.pathname;
        const isFromValid = fromState && fromState.startsWith(`/${result.user.role}`);
        const destination = isFromValid ? fromState : result.redirectPath;
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-slate-900 leading-none">GRIP</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Campus to Career</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 hidden sm:inline">Don't have an account?</span>
          <Link
            to="/register"
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs transition-colors"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your registered institutional credentials to access your dashboard.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
            {/* Server Error Alert */}
            {serverError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="flex-1 leading-relaxed">{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / ID Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-700 flex items-center justify-between"
                >
                  <span>Email or ID</span>
                  <span className="text-[11px] text-slate-400 font-normal">Campus email</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="email"
                    type="text"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    placeholder="name@campus.edu"
                    className={`
                      w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl border transition-all pl-10 pr-3.5 py-2.5
                      ${fieldErrors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:bg-white'
                        : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                      }
                      focus:outline-none
                    `}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setServerError('Password reset link request initiated. Please check with your campus administrator.')}
                    className="text-[11px] font-medium text-blue-600 hover:underline"
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    placeholder="••••••••"
                    className={`
                      w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl border transition-all pl-10 pr-10 py-2.5
                      ${fieldErrors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:bg-white'
                        : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
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
                  <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth={true}
                isLoading={isLoading}
                loadingText="Signing In..."
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="mt-2 text-xs font-semibold py-2.5 rounded-xl shadow-xs"
              >
                Sign In
              </Button>
            </form>

            {/* Footer Navigation */}
            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              New user?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 border-t border-slate-200/80 text-xs text-slate-400 text-center">
        <p>© {new Date().getFullYear()} GRIP Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;

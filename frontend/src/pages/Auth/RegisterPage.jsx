import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Building,
  Briefcase,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user, getRoleDashboardPath } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    role: 'student',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to user's dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRoleDashboardPath]);

  // Compute live password strength metrics
  const passwordCriteria = {
    hasMinLen: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const strengthCount = [
    passwordCriteria.hasMinLen,
    passwordCriteria.hasUpper,
    passwordCriteria.hasNumber,
  ].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!formData.password) return { label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };
    if (strengthCount === 1) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (strengthCount === 2) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getStrengthLabel();

  const isPasswordMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const roles = [
    {
      id: 'student',
      title: 'Student',
      subtitle: 'Candidate',
      icon: User,
    },
    {
      id: 'faculty',
      title: 'Faculty',
      subtitle: 'Mentor & Evaluator',
      icon: GraduationCap,
    },
    {
      id: 'alumni',
      title: 'Alumni',
      subtitle: 'Industry Advisor',
      icon: Briefcase,
    },
    {
      id: 'recruiter',
      title: 'Recruiter',
      subtitle: 'Campus Hiring',
      icon: Building,
    },
  ];

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Data Science & Artificial Intelligence',
    'Mechanical Engineering',
    'Electrical & Electronics Engineering',
    'School of Business & Management',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear individual field error on typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Institutional email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.department) {
      errors.department = 'Please select your department.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must include at least one uppercase letter.';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must include at least one number.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms to continue.';
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
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      if (result?.success) {
        navigate(result.redirectPath || '/student/dashboard', { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSORegister = () => {
    setServerError('Institutional SSO (SAML 2.0 / Shibboleth) registration simulated. Please complete registration with campus email.');
  };

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
          <span className="text-slate-500 hidden sm:inline">Already registered?</span>
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Container - Centered Balanced Layout */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* Header Title Section */}
          <div className="text-center flex flex-col items-center gap-2.5">
            <Badge variant="info" dot={true} pulseDot={true} className="py-1 px-3">
              FROM CAMPUS TO CAREER
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Start Your Journey to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                Placement Readiness
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Select your institutional role and enter your official credentials to create your verified account.
            </p>
          </div>

          {/* Registration Card */}
          <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 relative overflow-hidden">
            {/* Top gradient accent */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 absolute top-0 left-0 right-0" />

            <div className="flex flex-col gap-5">
              {/* Server Error Alert Banner */}
              {serverError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="flex-1 leading-relaxed">{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Select Campus Role (4 Cards) */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    SELECT YOUR CAMPUS ROLE
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {roles.map((r) => {
                      const Icon = r.icon;
                      const isSelected = formData.role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleRoleSelect(r.id)}
                          className={`
                            flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-150 relative
                            ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                            }
                          `}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-xs font-bold leading-tight ${
                              isSelected ? 'text-blue-900' : 'text-slate-800'
                            }`}
                          >
                            {r.title}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 font-medium leading-tight">
                            {r.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full Name & Department in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <span>Full Name</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rohan Mehta"
                        className={`
                          w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border transition-all duration-150 pl-10 pr-3.5 py-2.5
                          ${
                            fieldErrors.name
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                              : 'border-slate-200/90 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                          }
                          focus:outline-none
                        `}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="text-xs text-rose-600 font-medium mt-0.5">{fieldErrors.name}</p>
                    )}
                  </div>

                  {/* Department / Branch Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="department"
                      className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <span>Department / Academic Branch</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`
                        w-full bg-white text-slate-900 text-sm rounded-lg border transition-all duration-150 px-3.5 py-2.5
                        ${
                          fieldErrors.department
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200/90 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                        }
                        focus:outline-none
                      `}
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.department && (
                      <p className="text-xs text-rose-600 font-medium mt-0.5">
                        {fieldErrors.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* Institutional Email Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
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
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rohan.mehta@univ-engineering.edu"
                      className={`
                        w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border transition-all duration-150 pl-10 pr-3.5 py-2.5
                        ${
                          fieldErrors.email
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
                      Your university-issued email handle ensures immediate campus authorization.
                    </p>
                  )}
                </div>

                {/* Password & Confirm Password in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Create Password Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <span>Create Password</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 8 characters"
                        className={`
                          w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border transition-all duration-150 pl-10 pr-10 py-2.5
                          ${
                            fieldErrors.password
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
                      <p className="text-xs text-rose-600 font-medium mt-0.5">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="confirmPassword"
                        className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                      >
                        <span>Confirm Password</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      {isPasswordMatch && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Matched
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className={`
                          w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border transition-all duration-150 pl-10 pr-10 py-2.5
                          ${
                            fieldErrors.confirmPassword
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                              : 'border-slate-200/90 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                          }
                          focus:outline-none
                        `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-rose-600 font-medium mt-0.5">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Live Password Strength Meter */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Password Security:
                    </span>
                    <span className={`text-[11px] font-bold ${strength.text}`}>
                      {strength.label}
                    </span>
                  </div>

                  {/* 3-Segment Indicator Bar */}
                  <div className="grid grid-cols-3 gap-1.5 h-1.5">
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strengthCount >= 1 ? strength.color : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strengthCount >= 2 ? strength.color : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strengthCount >= 3 ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 pt-0.5">
                    <span
                      className={`flex items-center gap-1 ${
                        passwordCriteria.hasMinLen ? 'text-emerald-700 font-semibold' : ''
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3 h-3 ${
                          passwordCriteria.hasMinLen ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      Min 8 chars
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        passwordCriteria.hasUpper ? 'text-emerald-700 font-semibold' : ''
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3 h-3 ${
                          passwordCriteria.hasUpper ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      1 Uppercase
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        passwordCriteria.hasNumber ? 'text-emerald-700 font-semibold' : ''
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3 h-3 ${
                          passwordCriteria.hasNumber ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      1 Number
                    </span>
                  </div>
                </div>

                {/* Terms & Conditions Checkbox */}
                <div className="flex flex-col gap-1 pt-1">
                  <label className="inline-flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
                    />
                    <span className="text-xs text-slate-600 leading-normal">
                      I agree to the{' '}
                      <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                        Campus Placement Honor Code
                      </span>{' '}
                      and{' '}
                      <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                        Terms of Service & Privacy Policy
                      </span>
                      .
                    </span>
                  </label>
                  {fieldErrors.agreedToTerms && (
                    <p className="text-xs text-rose-600 font-medium">
                      {fieldErrors.agreedToTerms}
                    </p>
                  )}
                </div>

                {/* Primary Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  isLoading={isLoading}
                  loadingText="Creating Account..."
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="mt-2 text-sm font-semibold shadow-md shadow-blue-500/10 py-3"
                >
                  Create Account
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute px-3 bg-white text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  OR REGISTER VIA CAMPUS CREDENTIALS
                </span>
              </div>

              {/* Institutional SSO Button */}
              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth={true}
                onClick={handleSSORegister}
                leftIcon={<Shield className="w-4 h-4 text-blue-600" />}
                className="text-xs font-semibold py-2.5"
              >
                Sign Up with Institutional SSO (SAML 2.0 / Shibboleth)
              </Button>

              {/* Switch to Login */}
              <div className="text-center text-xs text-slate-500 pt-1">
                Already registered on GRIP?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign In to Portal
                </Link>
              </div>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[9px] font-bold ring-2 ring-white">
                AM
              </span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold ring-2 ring-white">
                PK
              </span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold ring-2 ring-white">
                SN
              </span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold ring-2 ring-white">
                VT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Join <strong className="text-slate-700">2,500+ students</strong> and{' '}
              <strong className="text-slate-700">150+ faculty mentors</strong> across premier institutions.
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

export default RegisterPage;

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
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user, getRoleDashboardPath } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: '1',
    companyName: '',
    designation: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRoleDashboardPath]);

  const roles = [
    { id: 'student', title: 'Student', icon: User },
    { id: 'faculty', title: 'Faculty', icon: GraduationCap },
    { id: 'alumni', title: 'Alumni', icon: Briefcase },
    { id: 'recruiter', title: 'Recruiter', icon: Building },
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
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (formData.role === 'student' && !formData.department) {
      errors.department = 'Please select your department.';
    }

    if (formData.role === 'recruiter' && !formData.companyName.trim()) {
      errors.companyName = 'Company name is required.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Include at least one uppercase letter.';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Include at least one number.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms.';
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
          <span className="text-slate-500 hidden sm:inline">Already registered?</span>
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Registration Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Select your role and get started with your placement readiness journey.
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
              {/* Select Role */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 block">Select Role</span>
                <div className="grid grid-cols-4 gap-2">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = formData.role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleSelect(r.id)}
                        className={`
                          flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all
                          ${isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span>{r.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Full Name
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
                      w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl border transition-all pl-10 pr-3.5 py-2.5
                      ${fieldErrors.name
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:bg-white'
                        : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                      }
                      focus:outline-none
                    `}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
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

              {/* Conditional Field: Student (Department & Semester) */}
              {formData.role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label htmlFor="department" className="text-xs font-semibold text-slate-700">
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="semester" className="text-xs font-semibold text-slate-700">
                      Semester
                    </label>
                    <select
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={String(s)}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional Field: Recruiter (Company Details) */}
              {formData.role === 'recruiter' && (
                <div className="space-y-1">
                  <label htmlFor="companyName" className="text-xs font-semibold text-slate-700">
                    Company / Organization
                  </label>
                  <div className="relative flex items-center">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Cisco Systems"
                      className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                  {fieldErrors.companyName && (
                    <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.companyName}</p>
                  )}
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 chars"
                      className={`
                        w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl border transition-all pl-10 pr-8 py-2.5
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
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className={`
                        w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl border transition-all pl-10 pr-8 py-2.5
                        ${fieldErrors.confirmPassword
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:bg-white'
                          : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                        }
                        focus:outline-none
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="inline-flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
                  />
                  <span className="text-xs text-slate-600 leading-normal">
                    I agree to the Terms of Service &amp; Placement Honor Code.
                  </span>
                </label>
                {fieldErrors.agreedToTerms && (
                  <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.agreedToTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth={true}
                isLoading={isLoading}
                loadingText="Creating Account..."
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="mt-2 text-xs font-semibold py-2.5 rounded-xl shadow-xs"
              >
                Create Account
              </Button>
            </form>

            {/* Footer Navigation */}
            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                Sign In
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

export default RegisterPage;

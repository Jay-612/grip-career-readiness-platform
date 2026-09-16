import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Target,
  Users,
  User,
  Briefcase,
  BarChart3,
  ArrowRight,
  Play,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  Send,
  Star,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
  Compass,
  Award,
  Check,
  BookOpen,
  MapPin,
  ExternalLink,
  Video,
  Flag,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  Search,
  Bell,
  Sliders
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const LandingPage = () => {
  const navigate = useNavigate();

  // State Management conforming to frontend-ui-generic-spec
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Interactive UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Initial Data Lifecycle (conforming to generic spec)
  useEffect(() => {
    let isMounted = true;
    const fetchLandingData = async () => {
      try {
        setIsLoading(true);
        // Fallback-safe API call if stats/summary endpoint exists
        // const response = await apiClient.get('/public/summary');
        // if (isMounted) setData(response.data);
      } catch (err) {
        if (isMounted) {
          // Public page operates gracefully on mock stats
          console.warn('Public summary API notice: Using static landing data');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLandingData();
    return () => {
      isMounted = false;
    };
  }, []);

  // RBAC Navigation Handler
  const handleRoleSelect = (role) => {
    navigate(`/login?role=${role}`);
  };

  const testimonials = [
    {
      id: 1,
      quote:
        '“GRIP helped me stay consistent with my goals and I finally feel placement ready!”',
      author: 'Rohan Mehta',
      role: 'Final Year, IT',
      rating: 5,
      avatar:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      quote:
        '“The mentorship sessions were incredibly helpful. I improved my communication and confidence.”',
      author: 'Aarushi Patel',
      role: '3rd Year, Computer Engineering',
      rating: 5,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      quote:
        '“As a faculty member, GRIP gives me a great way to guide and track student progress.”',
      author: 'Prof. Neha Sharma',
      role: 'Faculty Mentor',
      rating: 5,
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased selection:bg-blue-600 selection:text-white flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* 1. HEADER & NAVBAR                                                        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                  GRIP
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider mt-1 uppercase">
                  Learn • Prepare • Grow
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              <a
                href="#home"
                className="text-blue-600 font-semibold text-sm relative py-1 border-b-2 border-blue-600 transition-all"
              >
                Home
              </a>
              <a
                href="#about"
                className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
              >
                About
              </a>
              <a
                href="#features"
                className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
              >
                Success Stories
              </a>
              <a
                href="#contact"
                className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* RBAC Role Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => handleRoleSelect('student')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm border border-blue-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Student</span>
              </button>

              <button
                onClick={() => handleRoleSelect('faculty')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 hover:shadow-sm border border-purple-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                <span>Faculty</span>
              </button>

              <button
                onClick={() => handleRoleSelect('alumni')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-sm border border-emerald-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alumni</span>
              </button>

              <button
                onClick={() => handleRoleSelect('recruiter')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 hover:shadow-sm border border-amber-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                <span>Recruiter</span>
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-100 py-4 px-2 space-y-4 bg-white/95 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col space-y-2 px-2">
                <a
                  href="#home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-blue-600 font-semibold text-sm rounded-md bg-blue-50/70"
                >
                  Home
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:text-blue-600 font-medium text-sm rounded-md"
                >
                  About
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:text-blue-600 font-medium text-sm rounded-md"
                >
                  Features
                </a>
                <a
                  href="#testimonials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:text-blue-600 font-medium text-sm rounded-md"
                >
                  Success Stories
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:text-blue-600 font-medium text-sm rounded-md"
                >
                  Contact
                </a>
              </nav>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider mb-2">
                  Role Quick Access
                </p>
                <div className="grid grid-cols-2 gap-2 px-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleRoleSelect('student');
                    }}
                    className="p-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    Student
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleRoleSelect('faculty');
                    }}
                    className="p-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 flex items-center justify-center gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Faculty
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleRoleSelect('alumni');
                    }}
                    className="p-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Alumni
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleRoleSelect('recruiter');
                    }}
                    className="p-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 flex items-center justify-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Recruiter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 2. HERO SECTION                                                           */}
        {/* ========================================================================= */}
        <section
          id="home"
          className="relative pt-8 pb-16 lg:pt-14 lg:pb-20 bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-white overflow-hidden"
        >
          {/* Subtle background ambient circles */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-200/20 via-indigo-100/30 to-transparent blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headlines and CTAs */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-blue-200/80 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    FROM CAMPUS TO CAREER
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-[3.65rem] font-black tracking-tight text-slate-900 leading-[1.12]">
                  Bridge the Gap <br />
                  Between Campus <br />
                  and <span className="text-blue-600">Career</span>
                </h1>

                {/* Subtitle */}
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                  A career readiness and mentorship platform to help students
                  learn, prepare, connect and get placement ready — with the
                  support of faculty, alumni and recruiters.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 hover:gap-3 cursor-pointer group"
                  >
                    <span>Start Your Roadmap</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setVideoModalOpen(true)}
                    className="border border-blue-200 bg-white/90 hover:bg-blue-50/60 text-blue-600 font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-xs cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Play className="w-3.5 h-3.5 fill-blue-600 ml-0.5" />
                    </div>
                    <span>Watch Video</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Dashboard Showcase & Student Mockup */}
              <div className="lg:col-span-6 relative flex justify-center">
                {/* Floating Handwritten Style Badge: Top Right */}
                <div className="absolute -top-6 right-2 sm:right-6 z-20 hidden sm:flex flex-col items-center rotate-3">
                  <div className="flex items-center gap-1 text-blue-600 font-bold text-sm tracking-tight italic font-serif">
                    <span>Your Future Starts Here</span>
                    <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                  </div>
                  {/* Decorative spark rays */}
                  <svg
                    className="w-12 h-6 text-blue-500"
                    viewBox="0 0 60 25"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M10,20 Q30,5 50,15"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="45"
                      y1="5"
                      x2="52"
                      y2="2"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="52"
                      y1="12"
                      x2="59"
                      y2="10"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Perspective Floating Dashboard Screen Mockup */}
                <div className="w-full max-w-[540px] bg-white rounded-3xl p-5 sm:p-6 shadow-2xl shadow-blue-900/10 border border-slate-200/80 relative transition-transform hover:-translate-y-1 duration-300">
                  {/* Tablet Frame Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 leading-none">
                          GRIP
                        </div>
                        <div className="text-[9px] text-slate-400">Portal</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/50">
                        <span>Good Morning, Student!</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-300 overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
                          alt="Student"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tablet Layout Grid */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Mini Sidebar */}
                    <div className="hidden sm:block col-span-3 space-y-1.5 pr-2 border-r border-slate-100 text-[11px]">
                      <div className="px-2 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold flex items-center gap-2">
                        <Compass className="w-3.5 h-3.5 text-blue-600" />
                        Dashboard
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" />
                        Roadmap
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5" />
                        Placements
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        Profile
                      </div>
                    </div>

                    {/* Main Tablet Content Area */}
                    <div className="col-span-12 sm:col-span-9 space-y-3.5">
                      {/* Placement Readiness Highlight Card */}
                      <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-bold text-slate-900">
                            Placement Readiness
                          </div>
                          <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50 flex items-center gap-1">
                            <TrendingUp className="w-2.5 h-2.5" />
                            +12% last month
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Radial Gauge */}
                          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                              <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="3.5"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3.5"
                                strokeDasharray="88 100"
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-sm font-black text-slate-900">
                              85%
                            </span>
                          </div>

                          {/* Skill Highlights */}
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                              <span>Match:</span>
                              <span className="text-blue-600 font-bold">
                                TechCorp
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Your Strong Skills:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[9px] bg-emerald-100/80 text-emerald-800 font-semibold px-2 py-0.5 rounded-md">
                                React
                              </span>
                              <span className="text-[9px] bg-blue-100/80 text-blue-800 font-semibold px-2 py-0.5 rounded-md">
                                Node.js
                              </span>
                              <span className="text-[9px] bg-indigo-100/80 text-indigo-800 font-semibold px-2 py-0.5 rounded-md">
                                MongoDB
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Twin Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Upcoming Mentor Session */}
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Upcoming Session
                          </div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 rounded-full bg-purple-100 overflow-hidden shrink-0">
                              <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                                alt="Mentor"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="truncate">
                              <div className="text-[11px] font-bold text-slate-900 truncate">
                                Technical Mock
                              </div>
                              <div className="text-[9px] text-slate-500 truncate">
                                Tue, 16 Sep • 4:00 PM
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Continue Roadmap */}
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Continue Roadmap
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                              60%
                            </div>
                            <div className="truncate">
                              <div className="text-[11px] font-bold text-slate-900 truncate">
                                Semester 5
                              </div>
                              <div className="text-[9px] text-blue-600 font-medium truncate">
                                Web Development
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Handwritten Style Badge: Bottom Right */}
                <div className="absolute -bottom-6 right-4 sm:right-10 z-20 hidden sm:block">
                  <span className="font-serif italic text-blue-600 font-bold text-sm tracking-wide bg-white/90 px-3 py-1 rounded-full shadow-xs border border-blue-100">
                    Same Campus. Bigger Possibilities.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Hero Stats Strip */}
            <div className="mt-14 lg:mt-20 pt-8 border-t border-slate-200/80">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                {/* Stat 1 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      2.5K+
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                      Students
                    </div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      150+
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                      Faculty Mentors
                    </div>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      500+
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                      Alumni Network
                    </div>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-xs shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      100+
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                      Recruiter Partners
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. "WHY GRIP?" 4-COLUMN FEATURE GRID                                     */}
        {/* ========================================================================= */}
        <section id="about" className="py-20 lg:py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto relative mb-16">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  WHY GRIP?
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                More Than a Platform, <br />A Launchpad for{' '}
                <span className="text-blue-600">Your Future</span>
              </h2>

              <p className="mt-4 text-base sm:text-lg text-slate-600">
                Everything you need to go from learning to landing — in one place.
              </p>

              {/* Handwritten Note: Learn Prepare Grow */}
              <div className="hidden md:block absolute -top-2 -right-8 lg:-right-16 rotate-6 pointer-events-none">
                <div className="font-serif italic text-blue-600 font-bold text-sm tracking-wide">
                  Learn <br /> Prepare <br /> Grow
                </div>
                <svg
                  className="w-14 h-8 text-blue-500 -ml-3"
                  viewBox="0 0 60 35"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M10,5 Q40,15 50,30"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="42,28 50,30 48,22"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* 4 Feature Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Column 1: Personalized Roadmaps */}
              <div className="p-7 rounded-2xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                  Personalized Roadmaps
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Plan your semesters, set goals, and track your progress.
                </p>
              </div>

              {/* Column 2: Learn from Mentors */}
              <div className="p-7 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                  Learn from Mentors
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Get guidance from faculty and industry professionals.
                </p>
              </div>

              {/* Column 3: Be Placement Ready */}
              <div className="p-7 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                  Be Placement Ready
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Know your skill gaps and practice with real opportunities.
                </p>
              </div>

              {/* Column 4: For Everyone */}
              <div className="p-7 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                  For Everyone
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Students, faculty, alumni and recruiters on a single platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. "TOOLS THAT TAKE YOU AHEAD" (FEATURES & 4 WIDGET CARDS)                */}
        {/* ========================================================================= */}
        <section id="features" className="py-20 lg:py-24 bg-slate-50/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                    FEATURES
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Tools That Take You Ahead
                </h2>
              </div>

              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-sm mt-4 md:mt-0 group"
              >
                <span>Explore All Features</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 4 Complex UI Widget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Placement Readiness */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between">
                <div>
                  {/* Card Title & Icon */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Placement Readiness
                    </h3>
                  </div>

                  {/* Widget Preview: Donut Gauge + Badge */}
                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex items-center justify-around mb-5">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeDasharray="85 100"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-base font-black text-slate-900">
                        85%
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-200/60">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+12%</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Get company-wise readiness reports and identify skill gaps.
                  </p>
                </div>

                <Link
                  to="/register?role=student"
                  className="mt-5 text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 group"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Card 2: Career Roadmap */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between">
                <div>
                  {/* Card Title & Icon */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Career Roadmap
                    </h3>
                  </div>

                  {/* Widget Preview: Stepper Timeline with Goal Flag */}
                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 mb-5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                      <span className="text-blue-600 font-bold">Sem 4</span>
                      <span>Sem 5</span>
                      <span>Sem 6</span>
                      <span className="text-rose-600 font-bold">Placement</span>
                    </div>

                    {/* Stepper Graphic */}
                    <div className="relative flex items-center justify-between px-1.5 py-2">
                      <div className="absolute left-3 right-3 h-0.5 border-t-2 border-dashed border-blue-300 -z-0"></div>

                      <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs z-10"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white z-10"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white z-10"></div>
                      <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs z-10">
                        <Flag className="w-2.5 h-2.5 fill-white" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Plan your journey with semester plans and weekly goals.
                  </p>
                </div>

                <Link
                  to="/register?role=student"
                  className="mt-5 text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 group"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Card 3: Mock Interviews */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between">
                <div>
                  {/* Card Title & Icon */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Video className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Mock Interviews
                    </h3>
                  </div>

                  {/* Widget Preview: Scheduled Interview Box */}
                  <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 mb-5">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                          alt="Mentor"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          Technical Interview
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          with Prof. Neha Sharma
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Tue, 16 Sep • 4:00 PM
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Scheduled
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Practice with faculty mentors and receive detailed feedback.
                  </p>
                </div>

                <Link
                  to="/register?role=student"
                  className="mt-5 text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 group"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Card 4: Department Analytics */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between">
                <div>
                  {/* Card Title & Icon */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Department Analytics
                    </h3>
                  </div>

                  {/* Widget Preview: Skill Gaps & Mini Bar Chart */}
                  <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-800">
                        Skill Gaps
                      </span>
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                        Top Gap: System Design
                      </span>
                    </div>

                    {/* Stylized CSS Bar Chart */}
                    <div className="flex items-end justify-between h-14 pt-2 px-1">
                      <div className="w-3 bg-purple-300 rounded-t-sm h-[40%]"></div>
                      <div className="w-3 bg-indigo-400 rounded-t-sm h-[65%]"></div>
                      <div className="w-3 bg-blue-500 rounded-t-sm h-[90%]"></div>
                      <div className="w-3 bg-amber-400 rounded-t-sm h-[50%]"></div>
                      <div className="w-3 bg-rose-500 rounded-t-sm h-[75%]"></div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Gain valuable insights into placement trends and skill gaps.
                  </p>
                </div>

                <Link
                  to="/register?role=faculty"
                  className="mt-5 text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 group"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. "HOW IT WORKS" HORIZONTAL STEPPER TIMELINE                             */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#132258] rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl">
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

              {/* Header */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between mb-16">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">
                      SIMPLE STEPS
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                    How It Works
                  </h2>
                  <p className="mt-2 text-blue-200/80 text-sm sm:text-base max-w-md">
                    Your journey from campus to career, simplified.
                  </p>
                </div>

                {/* Left/Corner Handwriting Note */}
                <div className="mt-4 md:mt-0 font-serif italic text-blue-300 text-sm font-semibold tracking-wide">
                  <span>Small Steps,</span> <br />
                  <span>Big Opportunities ~</span>
                </div>
              </div>

              {/* Stepper Grid with Connected Dashed Trajectory */}
              <div className="relative z-10">
                {/* Paper Airplane Flying to Target (SVG Graphic) */}
                <div className="hidden lg:block absolute -top-8 right-2 rotate-12 animate-bounce">
                  <Send className="w-8 h-8 text-white fill-white/20" />
                </div>

                {/* Timeline Steps */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4 relative">
                  {/* Dashed Connecting Line (Desktop) */}
                  <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 border-t-2 border-dashed border-blue-400/40 -z-0"></div>

                  {/* Step 1: Create Your Profile */}
                  <div className="flex flex-col items-center text-center relative z-10 group">
                    <div className="w-14 h-14 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform mb-4">
                      <User className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white max-w-[120px]">
                      Create Your Profile
                    </h4>
                  </div>

                  {/* Step 2: Set Your Goals */}
                  <div className="flex flex-col items-center text-center relative z-10 group">
                    <div className="w-14 h-14 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform mb-4">
                      <Target className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white max-w-[120px]">
                      Set Your Goals
                    </h4>
                  </div>

                  {/* Step 3: Learn & Get Mentored */}
                  <div className="flex flex-col items-center text-center relative z-10 group">
                    <div className="w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform mb-4">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white max-w-[120px]">
                      Learn & Get Mentored
                    </h4>
                  </div>

                  {/* Step 4: Track Your Progress */}
                  <div className="flex flex-col items-center text-center relative z-10 group">
                    <div className="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform mb-4">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white max-w-[120px]">
                      Track Your Progress
                    </h4>
                  </div>

                  {/* Step 5: Get Placement Ready */}
                  <div className="flex flex-col items-center text-center relative z-10 group col-span-2 sm:col-span-1">
                    <div className="w-14 h-14 rounded-full bg-white text-amber-500 flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform mb-4">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white max-w-[120px]">
                      Get Placement Ready
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. "TESTIMONIALS" 3-CARD LAYOUT WITH CONTROLS                            */}
        {/* ========================================================================= */}
        <section id="testimonials" className="py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header with Navigation Controls */}
            <div className="flex items-end justify-between mb-14">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                    TESTIMONIALS
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  Real Stories, Real Progress
                </h2>
              </div>

              {/* Slider Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3-Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((item, index) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-7 border transition-all duration-300 flex flex-col justify-between ${
                    index === currentTestimonialIndex
                      ? 'border-blue-300 shadow-xl shadow-blue-500/5 ring-1 ring-blue-100'
                      : 'border-slate-100 hover:border-slate-200 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Avatar & Quote */}
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 mb-5 shadow-xs">
                      <img
                        src={item.avatar}
                        alt={item.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium mb-6 italic">
                      {item.quote}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.author}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {item.role}
                    </p>

                    {/* 5 Stars */}
                    <div className="flex items-center gap-1 mt-3">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-10">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonialIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentTestimonialIndex
                      ? 'w-6 bg-blue-600'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. FINAL FOOTER CTA ("Ready to Build Your Future?")                       */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 bg-gradient-to-t from-blue-50/50 via-white to-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            {/* Campus Sunset Graphic Backdrop Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-amber-50/20 rounded-3xl -z-10 pointer-events-none" />

            {/* Left Decorative Handwritten Note */}
            <div className="hidden lg:block absolute top-6 left-4 -rotate-6 pointer-events-none">
              <div className="font-serif italic text-blue-600 font-bold text-sm tracking-wide text-left">
                Together <br /> Towards <br /> a Brighter Tomorrow
              </div>
            </div>

            {/* Right Sticky Note Card */}
            <div className="hidden lg:block absolute top-6 right-4 rotate-3 pointer-events-none">
              <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 shadow-md text-amber-900 font-serif italic text-xs font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>Same Dreams, Bigger Together — GRIP</span>
              </div>
            </div>

            {/* Central CTA Content */}
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Ready to Build Your Future?
              </h2>

              <p className="text-slate-600 text-base sm:text-lg">
                Join GRIP today and take the first step towards your dream career.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-9 py-4 rounded-xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 inline-flex items-center gap-2 hover:gap-3 cursor-pointer group"
                >
                  <span>Start Your Roadmap</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 8. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  GRIP
                </span>
              </Link>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Empowering students, faculty, alumni, and recruiters with
                intelligent roadmaps, verified skill gap analytics, and
                placement readiness tools.
              </p>
            </div>

            {/* Column 2: Roles */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Access Portals
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => handleRoleSelect('student')}
                    className="hover:text-white transition-colors"
                  >
                    Student Portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleRoleSelect('faculty')}
                    className="hover:text-white transition-colors"
                  >
                    Faculty Portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleRoleSelect('alumni')}
                    className="hover:text-white transition-colors"
                  >
                    Alumni Network
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleRoleSelect('recruiter')}
                    className="hover:text-white transition-colors"
                  >
                    Recruiter Console
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform Features */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Placement Readiness
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Career Roadmap
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Mock Interviews
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Department Analytics
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Support & Legal */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Security & Trust
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} GRIP Platform. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Same Campus. Bigger Possibilities.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 9. VIDEO MODAL (Watch Video Action)                                       */}
      {/* ========================================================================= */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  GRIP Platform Walkthrough
                </h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white relative">
              <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg mb-4 hover:scale-105 transition-transform cursor-pointer">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
              <h4 className="font-bold text-lg mb-1">
                Discover Your Path from Campus to Career
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Watch how GRIP brings students, faculty, alumni, and recruiters together to accelerate career readiness.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Duration: 2 mins • Full HD
              </span>
              <button
                onClick={() => {
                  setVideoModalOpen(false);
                  navigate('/register');
                }}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

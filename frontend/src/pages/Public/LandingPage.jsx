import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Target,
  Users,
  User,
  Briefcase,
  BarChart3,
  ArrowRight,
  Compass,
  Video,
  Award,
  BookOpen,
  Menu,
  X,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased flex flex-col font-sans">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                  GRIP
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider mt-1 uppercase">
                  Campus to Career
                </span>
              </div>
            </Link>

            {/* Nav Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#who" className="hover:text-blue-600 transition-colors">Who It's For</a>
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#outcomes" className="hover:text-blue-600 transition-colors">Outcomes</a>
            </nav>

            {/* CTAs */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex sm:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-slate-100 py-4 px-2 space-y-3 bg-white">
              <nav className="flex flex-col space-y-2 px-2 text-sm font-medium text-slate-600">
                <a href="#who" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50">Who It's For</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50">How It Works</a>
                <a href="#outcomes" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50">Outcomes</a>
              </nav>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 px-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center rounded-xl text-xs font-semibold border border-slate-200 text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ─── 2. SECTION 1: HERO ─────────────────────────────────── */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200/80 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Campus to Career Readiness Platform
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                Bridge the Gap Between <br className="hidden sm:inline" />
                <span className="text-blue-600">Campus Learning</span> and Your Career
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Build verified skills, track placement readiness, receive faculty mentorship, and connect directly with campus hiring partners.
              </p>

              {/* Only 2 Clean CTAs: Launch / Get Started and Sign In */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-xs"
                >
                  Sign In to Portal
                </Link>
              </div>
            </div>

            {/* Right Product Preview Illustration */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Career Readiness Dashboard</div>
                      <div className="text-[10px] text-slate-400">Institutional Edition</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Live Score
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Readiness Score</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">82%</span>
                    <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">Eligible for 12 campus drives</span>
                  </div>
                  <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
                    82%
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Diagnostic Quiz &amp; Goals</span>
                    <span className="font-bold text-emerald-600">Completed (30%)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Faculty Mock Interviews</span>
                    <span className="font-bold text-emerald-600">Rated 4/5 Stars (32%)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Faculty Evaluation &amp; Reviews</span>
                    <span className="font-bold text-blue-600">In Progress (20%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SECTION 2: WHO IT'S FOR ─────────────────────────── */}
      <section id="who" className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Unified Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Designed for the Entire Campus Community
            </h2>
            <p className="text-sm text-slate-500">
              One connected platform providing dedicated workspaces for every stakeholder.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Student */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Students</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discover your career path, track semester learning roadmaps, practice interviews, and verify hiring eligibility.
              </p>
            </div>

            {/* Faculty */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Faculty &amp; Mentors</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conduct structured mock evaluations, assign targeted remedial tasks, and monitor cohort skill gap analytics.
              </p>
            </div>

            {/* Alumni */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Alumni Advisors</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Give back by sharing interview preparation experiences, mentoring students, and offering industry referrals.
              </p>
            </div>

            {/* Recruiter */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Hiring Partners</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter pre-assessed candidates by verified skill readiness, review student portfolios, and submit hiring feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. SECTION 3: CORE FEATURES ───────────────────────── */}
      <section id="features" className="py-16 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tools That Power Placement Readiness
            </h2>
            <p className="text-sm text-slate-500">
              Clear, actionable features to help candidates prepare and institutions measure outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Career Compass</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diagnostic career quiz mapped to real software engineering and specialized technical tracks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Target className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Goal &amp; Milestone Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Semester-by-semester learning milestones with verified GitHub projects and technical evidence.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Video className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Mock Interviews &amp; Rubrics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Faculty-led technical and behavioral interview sessions evaluated against standardized rubrics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Remedial Action Plans</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Personalized improvement plans assigned to at-risk students with strict due dates and progress tracking.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Alumni Insights &amp; Mentorship</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct guidance from working graduates, real interview tips, and verified industry preparation experiences.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Institutional Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Department cohort readiness benchmarks and skill gap diagnostics meeting NAAC/NBA criteria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. SECTION 4: HOW IT WORKS ─────────────────────────── */}
      <section id="how-it-works" className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Simple Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              From Enrolled Student to Placement Ready
            </h2>
            <p className="text-sm text-slate-500">
              A transparent, step-by-step pathway throughout your engineering semesters.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto">1</span>
              <h4 className="text-xs font-bold text-slate-900">Build Profile</h4>
              <p className="text-[11px] text-slate-500">Register with your campus email</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto">2</span>
              <h4 className="text-xs font-bold text-slate-900">Assess Readiness</h4>
              <p className="text-[11px] text-slate-500">Take the Career Compass quiz</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto">3</span>
              <h4 className="text-xs font-bold text-slate-900">Track Milestones</h4>
              <p className="text-[11px] text-slate-500">Log semester goals and code</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto">4</span>
              <h4 className="text-xs font-bold text-slate-900">Practice Mocks</h4>
              <p className="text-[11px] text-slate-500">Get rated by faculty mentors</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto">5</span>
              <h4 className="text-xs font-bold text-slate-900">Fix Skill Gaps</h4>
              <p className="text-[11px] text-slate-500">Complete remedial guidance</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto">6</span>
              <h4 className="text-xs font-bold text-slate-900">Get Hired</h4>
              <p className="text-[11px] text-slate-500">Match with visiting recruiters</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. SECTION 5: OUTCOMES / TRUST ─────────────────────── */}
      <section id="outcomes" className="py-16 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Institutional Impact
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Trusted by Campus Leaders &amp; Recruiters
            </h2>
            <p className="text-sm text-slate-500">
              Proven student outcomes backed by faculty evaluation and corporate hiring partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "GRIP helped me stay consistent with my goals and I finally feel placement ready with real project feedback."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">RM</div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Rohan Mehta</div>
                  <div className="text-[10px] text-slate-400">Final Year, Information Technology</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "The mock interview rubrics gave me tangible areas to improve. I entered corporate technical rounds with complete confidence."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">AP</div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Aarushi Patel</div>
                  <div className="text-[10px] text-slate-400">3rd Year, Computer Engineering</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "As faculty mentors, GRIP gives us actionable visibility into cohort deficits so we can conduct timely interventions before drives begin."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">NS</div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Prof. Neha Sharma</div>
                  <div className="text-[10px] text-slate-400">Faculty Advisor, Department of CSE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. SECTION 6: FINAL CTA ────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-gradient-to-t from-blue-50/60 via-white to-white border-t border-slate-100 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ready to Build Your Placement Readiness?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Join students, mentors, and corporate recruiters preparing for upcoming campus placement drives.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-xs"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 8. FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">GRIP Campus Platform</span>
          </div>
          <p className="text-slate-500">
            © {new Date().getFullYear()} GRIP. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

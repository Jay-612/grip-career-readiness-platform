import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Target,
  Plus,
  X,
  ExternalLink,
  Info,
  Check,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import ProgressBar from '../../components/common/ProgressBar';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorBoundary from '../../components/common/ErrorBoundary';

/**
 * Company Profile Manager Page
 * 
 * Provides authenticated recruiters with complete management of their corporate identity,
 * representative designation, contact information, and institutional hiring skill benchmarks.
 * 
 * Data Sources & Persistence:
 * - GET /api/users/profile -> Retrieves authenticated recruiter & company profile
 * - PUT /api/users/profile -> Updates companyName, designation, recruiter name, and email
 * - POST /api/companies    -> Registers/updates target hiring requirements and minimum match scores
 */
export const CompanyProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Original saved data from backend
  const [initialData, setInitialData] = useState({
    name: '',
    email: '',
    companyName: '',
    designation: '',
    description: '',
  });

  // Active form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    designation: '',
    description: '',
  });

  // Target Hiring Requirements State (POST /api/companies)
  const [requiredSkills, setRequiredSkills] = useState([
    'JavaScript',
    'React',
    'Node.js',
    'System Design',
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [minimumMatchScore, setMinimumMatchScore] = useState(70);
  const [isSyncingHiringRules, setIsSyncingHiringRules] = useState(false);
  const [hiringRulesMessage, setHiringRulesMessage] = useState(null);

  // Fetch real profile data from backend
  const fetchProfile = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const data = await recruiterService.getProfile();
      const u = data?.user || {};
      const p = data?.profile || {};

      const loaded = {
        name: u.name || user?.name || '',
        email: u.email || user?.email || '',
        companyName: p.companyName || '',
        designation: p.designation || '',
        description: '', // Schema limitation: documented in UI
      };

      setInitialData(loaded);
      setFormData(loaded);
    } catch (err) {
      console.error('Failed to load company profile:', err);
      setPageError(
        err?.response?.data?.message || 'Unable to retrieve company profile from campus backend.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Derive corporate monogram from company name
  const companyMonogram = useMemo(() => {
    const raw = formData.companyName.trim() || 'CP';
    const parts = raw.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [formData.companyName]);

  // Derived real completeness metrics based strictly on existing schema fields:
  // 1. companyName (RecruiterProfile, required)
  // 2. designation (RecruiterProfile, recommended)
  // 3. name (User, required)
  // 4. email (User, required)
  const completenessDetails = useMemo(() => {
    const fields = [
      {
        id: 'companyName',
        label: 'Company Name',
        isComplete: Boolean(formData.companyName.trim()),
        required: true,
      },
      {
        id: 'designation',
        label: 'Representative Designation',
        isComplete: Boolean(formData.designation.trim()),
        required: true,
      },
      {
        id: 'name',
        label: 'Recruiter Contact Name',
        isComplete: Boolean(formData.name.trim()),
        required: true,
      },
      {
        id: 'email',
        label: 'Official Contact Email',
        isComplete: Boolean(formData.email.trim() && formData.email.includes('@')),
        required: true,
      },
    ];

    const filledCount = fields.filter((f) => f.isComplete).length;
    const percentage = Math.round((filledCount / fields.length) * 100);

    return {
      fields,
      filledCount,
      totalCount: fields.length,
      percentage,
      isFullyComplete: percentage === 100,
    };
  }, [formData]);

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    return (
      formData.name !== initialData.name ||
      formData.email !== initialData.email ||
      formData.companyName !== initialData.companyName ||
      formData.designation !== initialData.designation
    );
  }, [formData, initialData]);

  // Discard edits and restore backend snapshot
  const handleDiscard = () => {
    setFormData(initialData);
    setFormError(null);
  };

  // Save profile updates to backend via PUT /api/users/profile
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    // Field-level validation
    if (!formData.companyName.trim()) {
      setFormError('Company or Organization name is required.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Recruiter contact name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('A valid official contact email address is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        companyName: formData.companyName.trim(),
        designation: formData.designation.trim(),
      };

      const res = await recruiterService.updateProfile(payload);

      // Update AuthContext so TopBar and Sidebar immediately reflect changes
      if (updateUser) {
        updateUser({
          name: payload.name,
          email: payload.email,
        });
      }

      setInitialData({
        ...formData,
        name: payload.name,
        email: payload.email,
        companyName: payload.companyName,
        designation: payload.designation,
      });

      setToastMessage('Company & recruiter profile saved successfully.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update company profile:', err);
      setFormError(
        err?.response?.data?.message ||
          'Failed to update company profile. Please verify your inputs.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Add a required technical skill to hiring profile
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (requiredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillInput('');
      return;
    }
    setRequiredSkills([...requiredSkills, trimmed]);
    setNewSkillInput('');
  };

  // Remove a required skill
  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  // Register or sync hiring criteria to Company collection via POST /api/companies
  const handleSyncHiringRules = async () => {
    if (!formData.companyName.trim()) {
      setFormError('Please save a valid company name before registering hiring criteria.');
      return;
    }

    setIsSyncingHiringRules(true);
    setHiringRulesMessage(null);
    try {
      const payload = {
        companyName: formData.companyName.trim(),
        requiredSkills,
        minimumMatchScore: Number(minimumMatchScore) || 60,
      };

      await recruiterService.addCompany(payload);
      setHiringRulesMessage({
        type: 'success',
        text: `Hiring criteria for "${formData.companyName}" registered in campus placement engine!`,
      });
      setTimeout(() => setHiringRulesMessage(null), 5000);
    } catch (err) {
      console.error('Failed to sync hiring rules:', err);
      const msg = err?.response?.data?.message;
      if (msg && msg.toLowerCase().includes('already exists')) {
        setHiringRulesMessage({
          type: 'info',
          text: `"${formData.companyName}" is already registered on the institutional placement board.`,
        });
      } else {
        setHiringRulesMessage({
          type: 'error',
          text: msg || 'Unable to register hiring requirements.',
        });
      }
      setTimeout(() => setHiringRulesMessage(null), 5000);
    } finally {
      setIsSyncingHiringRules(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="my-8 max-w-2xl mx-auto">
        <ErrorState
          title="Company Profile Error"
          message={pageError}
          onRetry={fetchProfile}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-900 text-white shadow-xl border border-emerald-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COMPANY HEADER & HERO                                                  */}
      {/* ========================================================================= */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-[#0d223c] to-[#08182b] text-white p-6 md:p-8 card-shadow relative overflow-hidden">
        {/* Ambient Icon Watermark */}
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Building2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs backdrop-blur-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Campus Recruiter • Corporate Profile Management</span>
            </div>

            <Link to="/recruiter/dashboard">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="border-white/20 text-white hover:bg-white/10 text-xs"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Dynamic Corporate Monogram Emblem */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center font-extrabold text-2xl tracking-tight shadow-lg border border-white/20 shrink-0">
                {companyMonogram}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {formData.companyName || 'Corporate Partner'}
                  </h1>
                  {completenessDetails.isFullyComplete ? (
                    <Badge variant="success" size="sm">
                      Profile Complete
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Profile Incomplete
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  {formData.designation || 'Campus Recruiter'} • {formData.name || 'Verified User'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {formData.email || user?.email}
                </p>
              </div>
            </div>

            {/* Header Action Bar */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
              {isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDiscard}
                  disabled={isSaving}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="border-white/20 text-white hover:bg-white/10 text-xs"
                >
                  Discard
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                loadingText="Saving..."
                leftIcon={<Save className="w-3.5 h-3.5" />}
                className="text-xs shadow-md"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROFILE COMPLETENESS BREAKDOWN (Real Calculation)                      */}
      {/* ========================================================================= */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Profile Completeness</span>
              <span className="font-mono text-blue-600 font-extrabold text-sm">
                {completenessDetails.percentage}%
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Derived from {completenessDetails.totalCount} core institutional identity fields in the database schema.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600">
            {completenessDetails.filledCount} of {completenessDetails.totalCount} fields completed
          </div>
        </div>

        <ProgressBar
          value={completenessDetails.percentage}
          variant={completenessDetails.isFullyComplete ? 'success' : 'primary'}
          size="md"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {completenessDetails.fields.map((field) => (
            <div
              key={field.id}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                field.isComplete
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {field.isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span className="truncate font-medium">{field.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FORM ERROR BANNER                                                         */}
      {/* ========================================================================= */}
      {formError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{formError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BASIC COMPANY INFORMATION & CONTACT INFORMATION                         */}
      {/* ========================================================================= */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Basic Company Information */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-1 rounded-lg bg-blue-600 text-white">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Basic Company Information</h3>
                <p className="text-[11px] text-slate-500">Corporate entity and representative designation</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <Input
                label="Company / Organization Name"
                required
                placeholder="e.g. Google, TechCorp, Microsoft"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                helperText="Registered hiring partner name displayed to students and placement coordinators."
              />

              <Input
                label="Recruiter Designation / Role Title"
                placeholder="e.g. Lead Campus Talent Partner, University Recruiter"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                helperText="Your official corporate role title when conducting campus evaluations."
              />

              {/* Informational Schema Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-slate-800 block">
                    Institutional Record Linkage
                  </span>
                  <span>
                    Company details are linked to your authenticated recruiter account (<code>recruiterId: {user?.id}</code>).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Primary Recruiter Contact & Links */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-1 rounded-lg bg-emerald-600 text-white">
                <User className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recruiter Contact &amp; Account</h3>
                <p className="text-[11px] text-slate-500">Primary coordinator account credentials</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <Input
                label="Recruiter Full Name"
                required
                placeholder="e.g. Priya Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                helperText="Primary representative name shown on feedback submissions and interview schedules."
              />

              <Input
                label="Official Contact Email"
                required
                type="email"
                placeholder="recruiter@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                helperText="Must be unique across the GRIP platform. Used for campus notifications."
              />

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                  System Authorization Role
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 capitalize">
                    {user?.role || 'recruiter'}
                  </span>
                  <Badge variant="primary" size="xs">
                    Campus Recruiter
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. COMPANY OVERVIEW & CAMPUS MISSION                                    */}
        {/* ======================================================================= */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-600 text-white">
                <Briefcase className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Company Overview &amp; Campus Mission</h3>
                <p className="text-[11px] text-slate-500">
                  Culture, engineering values, and guidance for prospective student candidates
                </p>
              </div>
            </div>
            <Badge variant="secondary" size="xs">
              Campus Profile
            </Badge>
          </div>

          <Textarea
            label="About the Organization"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Share your company's mission, engineering culture, tech stack focus, and expectations for campus hires..."
            helperText="Provides context to students and mentors during campus placement drives."
          />
        </div>

        {/* ======================================================================= */}
        {/* 5. HIRING INFORMATION & SKILL MATCHING BENCHMARK (Real POST /companies) */}
        {/* ======================================================================= */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-purple-600 text-white">
                <Target className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Campus Hiring Profile &amp; Placement Match Engine
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configures algorithmic skill matching for student candidates against your company
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSyncHiringRules}
              isLoading={isSyncingHiringRules}
              loadingText="Registering..."
              className="text-xs shrink-0 self-start sm:self-center"
            >
              Register in Placement Engine
            </Button>
          </div>

          {hiringRulesMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                hiringRulesMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : hiringRulesMessage.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {hiringRulesMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{hiringRulesMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Required Technical Skills */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Required Technical Skills for Eligibility
              </label>

              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 min-h-[90px] items-center content-start">
                {requiredSkills.length === 0 ? (
                  <span className="text-xs text-slate-400">No skills added yet.</span>
                ) : (
                  requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Skill Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  placeholder="Add skill (e.g. Docker, Python, Go)..."
                  className="flex-1 bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSkill}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Minimum Match Benchmark */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Minimum Candidate Match Benchmark
                </label>
                <span className="font-mono font-bold text-sm text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  {minimumMatchScore}%
                </span>
              </div>

              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={minimumMatchScore}
                onChange={(e) => setMinimumMatchScore(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>30% (Broad Pipeline)</span>
                <span>70% (Standard)</span>
                <span>95% (High Bar)</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Used by the backend placement engine (<code>GET /api/placement/company-match/:studentId</code>) to compute candidate eligibility status.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 6. BRANDING & EMBLEM DISCLOSURE                                         */}
        {/* ======================================================================= */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="p-1 rounded-lg bg-blue-600 text-white">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Brand Identity &amp; Monogram</h3>
              <p className="text-[11px] text-slate-500">Corporate brand presentation across campus views</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center font-extrabold text-2xl tracking-tight shadow-md shrink-0 border border-white/20">
              {companyMonogram}
            </div>

            <div className="space-y-1 text-xs text-slate-600 text-center sm:text-left">
              <span className="font-bold text-slate-900 block">
                Enterprise Monogram Emblem
              </span>
              <p className="leading-relaxed text-[11px]">
                Corporate monograms are automatically rendered from your registered company name (<code>{formData.companyName || 'Not Set'}</code>). Official custom vector emblem assets are provisioned through institutional campus partner onboarding.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 7. BOTTOM ACTION BAR                                                    */}
        {/* ======================================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {isDirty ? (
              <span className="text-amber-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved modifications detected.
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Profile is up to date with campus database.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {isDirty && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDiscard}
                disabled={isSaving}
                className="text-xs"
              >
                Discard
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              loadingText="Saving..."
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="text-xs shadow-md"
            >
              Save Company Profile
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

const SafeCompanyProfilePage = (props) => (
  <ErrorBoundary fallbackTitle="Company Profile Encountered an Issue">
    <CompanyProfilePage {...props} />
  </ErrorBoundary>
);

export default SafeCompanyProfilePage;

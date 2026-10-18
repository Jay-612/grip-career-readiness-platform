import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Calendar,
  Edit3,
  Award,
  CheckCircle2,
  ExternalLink,
  Users,
  MessageSquare,
  Video,
  ShieldCheck,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import RecruiterEditModal from '../../components/recruiter/RecruiterEditModal';

export const RecruiterProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    appointmentsCount: 0,
    feedbackCount: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profRes, aptsRes, feedbackRes] = await Promise.allSettled([
        recruiterService.getProfile(),
        recruiterService.getAppointments(),
        recruiterService.getFeedbackHistory(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfileData(profRes.value);
      } else {
        throw new Error(
          profRes.reason?.response?.data?.message ||
            profRes.reason?.message ||
            'Failed to load recruiter profile.'
        );
      }

      let appointmentsCount = 0;
      if (aptsRes.status === 'fulfilled') {
        const apts = Array.isArray(aptsRes.value)
          ? aptsRes.value
          : aptsRes.value?.appointments || [];
        appointmentsCount = apts.length;
      }

      let feedbackCount = 0;
      if (feedbackRes.status === 'fulfilled') {
        const fb = Array.isArray(feedbackRes.value) ? feedbackRes.value : [];
        feedbackCount = fb.length;
      }

      setStats({
        appointmentsCount,
        feedbackCount,
      });
    } catch (err) {
      console.error('Error fetching recruiter profile:', err);
      setError(err.message || 'Unable to load profile data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (updatedFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        name: updatedFormData.name.trim(),
        email: updatedFormData.email.trim(),
        companyName: updatedFormData.companyName.trim(),
        designation: updatedFormData.designation.trim(),
        phone: updatedFormData.phone.trim(),
        location: updatedFormData.location.trim(),
        experienceYears: Number(updatedFormData.experienceYears) || 0,
        websiteUrl: updatedFormData.websiteUrl.trim(),
        linkedinUrl: updatedFormData.linkedinUrl.trim(),
        hiringDomains: updatedFormData.hiringDomains,
        hiringRoles: updatedFormData.hiringRoles,
        bio: updatedFormData.bio.trim(),
      };

      const res = await recruiterService.updateProfile(payload);

      if (updateUser && payload.name) {
        updateUser({ name: payload.name });
      }

      setProfileData((prev) => ({
        ...prev,
        user: {
          ...prev?.user,
          name: payload.name,
          email: payload.email,
        },
        profile: {
          ...prev?.profile,
          ...payload,
        },
      }));

      setIsEditModalOpen(false);
      setToastMessage('Recruiter profile updated successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update recruiter profile:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 antialiased py-4 max-w-6xl mx-auto">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="py-8 max-w-6xl mx-auto">
        <ErrorState
          title="Recruiter Profile Unavailable"
          message={error}
          onRetry={loadProfile}
          retryText="Retry Loading Profile"
        />
      </div>
    );
  }

  const u = profileData?.user || user || {};
  const p = profileData?.profile || {};

  const recruiterName = u.name || 'Corporate Recruiter';
  const recruiterEmail = u.email || 'recruiter@company.com';
  const companyName = p.companyName || 'Campus Partner Company';
  const designation = p.designation || 'Corporate Recruiter & Talent Partner';
  const phone = p.phone || '';
  const location = p.location || 'Bengaluru / Hybrid';
  const experienceYears = p.experienceYears || 0;
  const websiteUrl = p.websiteUrl || '';
  const linkedinUrl = p.linkedinUrl || '';
  const hiringDomains = Array.isArray(p.hiringDomains) && p.hiringDomains.length > 0
    ? p.hiringDomains
    : ['Software Engineering', 'Full Stack Development', 'Cloud & DevOps', 'Data & AI'];
  const hiringRoles = Array.isArray(p.hiringRoles) && p.hiringRoles.length > 0
    ? p.hiringRoles
    : ['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Data Analyst'];
  const bio = p.bio || 'Corporate talent recruiter active on the GRIP career readiness platform, assessing student mock interviews and evaluating candidates for campus hiring placement.';

  return (
    <div className="space-y-6 antialiased pb-12 max-w-6xl mx-auto" data-purpose="recruiter-profile-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── 1. HERO PROFILE CARD ────────────────────────────────────── */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-xs rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar
              name={recruiterName}
              size="xl"
              className="w-20 h-20 text-xl font-bold bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md ring-4 ring-blue-50 shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                  {recruiterName}
                </h1>
                <Badge variant="primary" size="sm" className="gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Corporate Recruiter
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {companyName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {designation}
                </span>
                {location && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 self-stretch sm:self-center">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
              className="w-full sm:w-auto shadow-xs border-slate-300 hover:border-blue-400 hover:text-blue-600 cursor-pointer"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* ─── 2. KEY STATS CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 font-mono">
                {stats.appointmentsCount}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Interviews Booked
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 font-mono">
                {stats.feedbackCount}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Evaluations Submitted
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 font-mono">
                {experienceYears > 0 ? `${experienceYears} yrs` : 'Active'}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Hiring Experience
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 font-mono">
                {hiringDomains.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Hiring Domains
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── 3. DETAILS TWO-COLUMN SECTION ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio / About Recruiter */}
          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <CardHeader className="p-0 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                About & Recruitment Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4 text-sm text-slate-700 leading-relaxed">
              <p className="whitespace-pre-line">{bio}</p>
            </CardContent>
          </Card>

          {/* Hiring Domains & Tech Stack Focus */}
          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <CardHeader className="p-0 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Primary Hiring Domains & Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <div className="flex flex-wrap gap-2">
                {hiringDomains.map((domain, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target Hiring Roles */}
          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <CardHeader className="p-0 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Target Campus Hiring Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <div className="flex flex-wrap gap-2">
                {hiringRoles.map((role, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/70"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contact & Quick Links */}
        <div className="space-y-6">
          {/* Contact & Professional Coordinates */}
          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <CardHeader className="p-0 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                Contact & Company Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">Work Email</div>
                  <div className="truncate text-slate-600 font-mono mt-0.5">
                    {recruiterEmail}
                  </div>
                </div>
              </div>

              {phone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">Phone Number</div>
                    <div className="text-slate-600 mt-0.5 font-mono">{phone}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">Hiring Organization</div>
                  <div className="text-slate-600 mt-0.5 font-medium">{companyName}</div>
                </div>
              </div>

              {location && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">Location</div>
                    <div className="text-slate-600 mt-0.5">{location}</div>
                  </div>
                </div>
              )}

              {websiteUrl && (
                <div className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">Careers Website</div>
                    <a
                      href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>
              )}

              {linkedinUrl && (
                <div className="flex items-start gap-2.5">
                  <Linkedin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">LinkedIn Profile</div>
                    <a
                      href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 rounded-2xl shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Recruiter Quick Portals
            </h3>
            <div className="space-y-2">
              <Link
                to="/recruiter/company"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Company Benchmark Criteria
                </span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                to="/recruiter/feedback"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  Student Feedback Portal
                </span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                to="/recruiter/dashboard"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Candidate Leaderboard
                </span>
                <span className="text-slate-400">→</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── EDIT MODAL ──────────────────────────────────────────────── */}
      <RecruiterEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={profileData}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </div>
  );
};

export default RecruiterProfilePage;

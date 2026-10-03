import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Mail,
  User,
  ShieldCheck,
  Edit3,
  Award,
  GraduationCap,
  CheckCircle2,
  X,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import CompanySummary from '../../components/recruiter/CompanySummary';
import CompanyEditModal from '../../components/recruiter/CompanyEditModal';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';

export const CompanyProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Profile data
  const [profileData, setProfileData] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfileAndCompany = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pData = await recruiterService.getProfile();
      setProfileData(pData);

      const compName = pData?.profile?.companyName || 'TechCorp';
      try {
        const cData = await recruiterService.getCompanyByName(compName);
        if (cData) setCompanyData(cData);
      } catch (err) {
        console.warn('Could not fetch company benchmark criteria:', err);
      }
    } catch (err) {
      console.error('Failed to load company profile:', err);
      setError(err?.response?.data?.message || 'Unable to retrieve company profile from campus backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndCompany();
  }, [user]);

  const handleSaveCompany = async (formUpdates) => {
    setIsSaving(true);
    try {
      // 1. Update user & recruiter profile
      const userPayload = {
        name: formUpdates.name.trim(),
        companyName: formUpdates.companyName.trim(),
        designation: formUpdates.designation.trim(),
      };
      await recruiterService.updateProfile(userPayload);

      if (updateUser && userPayload.name) {
        updateUser({ name: userPayload.name });
      }

      // 2. Register/update company criteria
      const companyPayload = {
        companyName: formUpdates.companyName.trim(),
        requiredSkills: formUpdates.requiredSkills,
        minimumMatchScore: Number(formUpdates.minimumMatchScore) || 70,
      };
      await recruiterService.addCompany(companyPayload);

      // Refresh local state
      setProfileData((prev) => ({
        ...prev,
        user: { ...prev?.user, name: userPayload.name },
        profile: { ...prev?.profile, ...userPayload },
      }));
      setCompanyData(companyPayload);

      setToastMessage('Company profile and hiring criteria updated successfully!');
      setIsEditModalOpen(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update company:', err);
      throw new Error(err?.response?.data?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const recruiterProfile = profileData?.profile || {};
  const companyName = recruiterProfile.companyName || companyData?.companyName || 'TechCorp';
  const designation = recruiterProfile.designation || 'Lead University Talent Partner';
  const recruiterName = profileData?.user?.name || user?.name || 'Alex Rivera';
  const recruiterEmail = profileData?.user?.email || user?.email || 'alex.rivera@techcorp.com';
  const minScore = companyData?.minimumMatchScore || 70;
  const reqSkills = companyData?.requiredSkills || ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'Microservices', 'System Design'];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 max-w-xl mx-auto">
        <ErrorState
          title="Company Profile Error"
          message={error}
          onRetry={fetchProfileAndCompany}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/recruiter/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Workspace</span>
        </button>
      </div>

      {/* 1. Company Summary */}
      <CompanySummary
        companyName={companyName}
        designation={designation}
        recruiterName={recruiterName}
        recruiterEmail={recruiterEmail}
        isVerified={Boolean(companyName)}
        onEdit={() => setIsEditModalOpen(true)}
      />

      {/* 2. Active Hiring Role / Drive Overview */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Active Hiring Role &amp; Open Positions
              </h2>
              <p className="text-xs text-slate-500">Target technical role for campus recruitment drives</p>
            </div>
          </div>
          <Badge variant="primary" size="xs">
            Open Drive
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Primary Role Title
            </span>
            <span className="font-bold text-slate-900 block text-sm">
              Distributed Systems &amp; Cloud Platform Engineer
            </span>
            <span className="text-[11px] text-slate-500 block">
              Full-time Graduate / Tier-1 Campus Placement
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Target Openings
            </span>
            <span className="font-bold text-slate-900 block text-sm font-mono">
              15 Positions
            </span>
            <span className="text-[11px] text-slate-500 block">
              Allocated for 2026 Graduating Class
            </span>
          </div>
        </div>
      </section>

      {/* 3. Eligibility Criteria */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Eligibility Criteria</h2>
            <p className="text-xs text-slate-500">Institutional academic and graduation requirements</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Minimum CGPA
            </span>
            <span className="font-bold text-slate-900 block">7.5 / 10.0</span>
            <span className="text-[10px] text-slate-400 block">No active backlogs</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Departments
            </span>
            <span className="font-bold text-slate-900 block truncate">CSE &amp; IT</span>
            <span className="text-[10px] text-slate-400 block">B.Tech / B.E.</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Eligible Batches
            </span>
            <span className="font-bold text-slate-900 block">2026 Batch</span>
            <span className="text-[10px] text-slate-400 block">Semester 6 &amp; 7</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Match Cutoff
            </span>
            <span className="font-bold text-indigo-700 block font-mono">{minScore}% Match</span>
            <span className="text-[10px] text-slate-400 block">Placement filter</span>
          </div>
        </div>
      </section>

      {/* 4. Skill Requirements */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Technical Skill Requirements</h2>
              <p className="text-xs text-slate-500">Skills matched automatically against student portfolios</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Skills</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Mandatory Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {reqSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Preferred Electives
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Go', 'AWS Lambda', 'GraphQL', 'Linux Kernel'].map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Edit Action Modal */}
      <CompanyEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          companyName,
          designation,
          name: recruiterName,
          minimumMatchScore: minScore,
          requiredSkills: reqSkills,
        }}
        onSave={handleSaveCompany}
        isSaving={isSaving}
      />
    </div>
  );
};

export default CompanyProfilePage;

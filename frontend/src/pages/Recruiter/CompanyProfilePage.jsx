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
  MapPin,
  Globe,
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

      const compName = pData?.profile?.companyName || user?.companyName || 'TechCorp';
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
        updateUser({ name: userPayload.name, companyName: userPayload.companyName });
      }

      // 2. Register/update company criteria
      const companyPayload = {
        companyName: formUpdates.companyName.trim(),
        oldCompanyName: formUpdates.oldCompanyName || profileData?.profile?.companyName || '',
        description: formUpdates.description || '',
        industry: formUpdates.industry || '',
        location: formUpdates.location || '',
        website: formUpdates.website || '',
        targetRole: formUpdates.targetRole.trim(),
        openPositions: Number(formUpdates.openPositions) || 1,
        cgpaCutoff: formUpdates.cgpaCutoff || '7.5+ CGPA',
        eligibleDepartments: formUpdates.eligibleDepartments || [],
        eligibleBatch: formUpdates.eligibleBatch || '2026 Batch',
        requiredSkills: formUpdates.requiredSkills || [],
        preferredSkills: formUpdates.preferredSkills || [],
        minimumMatchScore: Number(formUpdates.minimumMatchScore) || 70,
        isVerified: true,
      };

      const res = await recruiterService.addCompany(companyPayload);
      const updatedComp = res?.company || companyPayload;

      // Refresh local state
      setProfileData((prev) => ({
        ...prev,
        user: { ...prev?.user, name: userPayload.name },
        profile: { ...prev?.profile, ...userPayload },
      }));
      setCompanyData(updatedComp);

      setToastMessage('Company profile and campus hiring drive updated successfully!');
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
  const companyName = companyData?.companyName || recruiterProfile.companyName || 'TechCorp';
  const designation = recruiterProfile.designation || 'Lead University Talent Partner';
  const recruiterName = profileData?.user?.name || user?.name || 'Campus Recruiter';
  const recruiterEmail = profileData?.user?.email || user?.email || 'recruiter@company.com';
  const targetRole = companyData?.targetRole || 'Distributed Systems & Cloud Platform Engineer';
  const openPositions = companyData?.openPositions !== undefined ? companyData.openPositions : 15;
  const driveDescription = companyData?.description || 'Full-time Graduate / Tier-1 Campus Placement';
  const cgpaCutoff = companyData?.cgpaCutoff || '7.5 / 10.0';
  const eligibleDepartments = Array.isArray(companyData?.eligibleDepartments) && companyData.eligibleDepartments.length > 0
    ? companyData.eligibleDepartments
    : ['Computer Science & Engineering', 'Information Technology'];
  const eligibleBatch = companyData?.eligibleBatch || '2026 Batch';
  const minScore = companyData?.minimumMatchScore !== undefined ? companyData.minimumMatchScore : 70;
  const reqSkills = Array.isArray(companyData?.requiredSkills) && companyData.requiredSkills.length > 0
    ? companyData.requiredSkills
    : ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'Microservices', 'System Design'];
  const prefSkills = Array.isArray(companyData?.preferredSkills) && companyData.preferredSkills.length > 0
    ? companyData.preferredSkills
    : ['Go', 'AWS Lambda', 'GraphQL', 'Linux Kernel'];
  const industry = companyData?.industry || 'Technology & Cloud Infrastructure';
  const location = companyData?.location || 'Bengaluru, India';
  const website = companyData?.website || '';

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
    <div className="space-y-6 max-w-4xl mx-auto pb-12 antialiased" data-purpose="recruiter-company-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-800 animate-fadeIn">
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

      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/recruiter/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
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

      {/* 2. Active Hiring Role / Drive Overview (DYNAMIC) */}
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
              {targetRole}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {driveDescription}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Target Openings
            </span>
            <span className="font-bold text-slate-900 block text-sm font-mono text-indigo-600">
              {openPositions} Positions
            </span>
            <span className="text-[11px] text-slate-500 block">
              Allocated for {eligibleBatch}
            </span>
          </div>
        </div>

        {/* Corporate Metadata: Location, Industry, Website */}
        {(industry || location || website) && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            {industry && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Sector: <strong>{industry}</strong></span>
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Location: <strong>{location}</strong></span>
              </span>
            )}
            {website && (
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-600 hover:underline font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{website}</span>
              </a>
            )}
          </div>
        )}
      </section>

      {/* 3. Eligibility Criteria (DYNAMIC) */}
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
            <span className="font-bold text-slate-900 block">{cgpaCutoff}</span>
            <span className="text-[10px] text-slate-400 block">Academic eligibility</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Departments
            </span>
            <span className="font-bold text-slate-900 block truncate" title={eligibleDepartments.join(', ')}>
              {eligibleDepartments.join(' & ')}
            </span>
            <span className="text-[10px] text-slate-400 block">Eligible streams</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Eligible Batches
            </span>
            <span className="font-bold text-slate-900 block">{eligibleBatch}</span>
            <span className="text-[10px] text-slate-400 block">Target graduating class</span>
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

      {/* 4. Skill Requirements (DYNAMIC) */}
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
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Skills</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Mandatory Skills ({reqSkills.length})
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

          {prefSkills.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Preferred Electives ({prefSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {prefSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
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
          industry,
          location,
          website,
          targetRole,
          openPositions,
          description: driveDescription,
          cgpaCutoff,
          eligibleDepartments,
          eligibleBatch,
          minimumMatchScore: minScore,
          requiredSkills: reqSkills,
          preferredSkills: prefSkills,
        }}
        onSave={handleSaveCompany}
        isSaving={isSaving}
      />
    </div>
  );
};

export default CompanyProfilePage;

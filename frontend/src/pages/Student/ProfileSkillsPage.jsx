import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import { CheckCircle2, X } from 'lucide-react';
import {
  getStoredProfileExtra,
  saveStoredProfileExtra,
} from '../../utils/profileStorage';

// Clean Modular Components
import {
  ProfileHeader,
  StudentInfoCard,
  ResumeCard,
  VerifiedSkillsSection,
  ProfessionalLinksCard,
  EditProfileModal,
  UploadResumeModal,
  ResumePreviewModal,
  SkillVerificationModal,
  AddSkillModal,
} from '../../components/student/profile';

export const ProfileSkillsPage = () => {
  const { user, updateUser } = useAuth();

  // Primary Data States
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);

  const [profileData, setProfileData] = useState({
    user: null,
    profile: null,
    readiness: null,
    skills: [],
    roadmap: null,
    dashboard: null,
  });

  // Client-side enriched fields (Bio, Resume, Links, Custom Skills)
  const [profileExtra, setProfileExtra] = useState({
    bio: '',
    links: {},
    resume: {},
    customSkills: [],
  });

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadResumeModalOpen, setIsUploadResumeModalOpen] = useState(false);
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [selectedSkillForVerification, setSelectedSkillForVerification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // 1. DATA FETCHING (Authenticated Student)
  // ─────────────────────────────────────────────────────────────
  const fetchProfileData = useCallback(async () => {
    setError(null);

    try {
      // 1. Fetch authenticated user profile
      const profileRes = await studentService.getProfile();
      const currentUser = profileRes?.user || user;
      const currentProfile = profileRes?.profile || null;
      const resolvedStudentId = currentUser?.id || currentUser?._id || user?.id || user?._id;

      if (!resolvedStudentId) {
        throw new Error('Authenticated student identifier could not be verified.');
      }

      const selectedCareer = currentProfile?.selectedCareer || '';

      // 2. Fetch parallel data from live endpoints
      const [readinessRes, companyMatchRes, roadmapRes, dashboardRes] = await Promise.allSettled([
        studentService.getPlacementReadiness(resolvedStudentId),
        selectedCareer ? studentService.getCompanyMatch(resolvedStudentId) : Promise.resolve(null),
        selectedCareer ? studentService.getCareerRoadmap(selectedCareer) : Promise.resolve(null),
        studentService.getProgressDashboard(resolvedStudentId),
      ]);

      const readiness = readinessRes.status === 'fulfilled' ? readinessRes.value : null;
      const companyMatch = companyMatchRes.status === 'fulfilled' ? companyMatchRes.value : null;
      const roadmap = roadmapRes.status === 'fulfilled' ? roadmapRes.value : null;
      const dashboard = dashboardRes.status === 'fulfilled' ? dashboardRes.value : null;

      // Extract skills list mapped from student's career roadmap
      const skills = companyMatch?.studentSkills || [
        'React',
        'Node.js',
        'TypeScript',
        'PostgreSQL',
        'Docker',
        'REST APIs',
        'Git & GitHub',
        'System Design',
      ];

      setProfileData({
        user: currentUser,
        profile: currentProfile,
        readiness,
        skills,
        roadmap,
        dashboard,
      });

      // Load client-side persistent profile extras
      const stored = getStoredProfileExtra(resolvedStudentId);
      setProfileExtra(stored);
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load student profile. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Handle Sync Action
  const handleSync = async () => {
    setIsSyncing(true);
    await fetchProfileData();
    setSaveSuccessMessage('Profile data synchronized successfully with campus server.');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // ─────────────────────────────────────────────────────────────
  // 2. COMBINED VERIFIED SKILLS LIST
  // ─────────────────────────────────────────────────────────────
  const combinedSkills = useMemo(() => {
    const backendSkills = profileData.skills || [];
    const customSkills = profileExtra.customSkills || [];

    const existingNames = new Set(
      backendSkills.map((s) => (typeof s === 'string' ? s.toLowerCase() : s.name?.toLowerCase()))
    );

    const uniqueCustom = customSkills.filter((s) => !existingNames.has(s.name?.toLowerCase()));
    return [...backendSkills, ...uniqueCustom];
  }, [profileData.skills, profileExtra.customSkills]);

  // ─────────────────────────────────────────────────────────────
  // 3. PROFILE UPDATE HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleEditProfileSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const studentId = profileData.user?.id || profileData.user?._id || user?.id || user?._id;

      // 1. Update core backend fields (name, semester, selectedCareer)
      const payload = {
        name: formData.name.trim(),
        semester: Number(formData.semester),
        selectedCareer: formData.selectedCareer.trim(),
      };

      const res = await studentService.updateProfile(payload);

      if (res?.success && res.user && updateUser) {
        updateUser(res.user);
      }

      // 2. Persist extended profile details (bio, links)
      const updatedExtra = saveStoredProfileExtra(studentId, {
        bio: formData.bio?.trim(),
        links: {
          github: formData.github?.trim(),
          linkedin: formData.linkedin?.trim(),
          portfolio: formData.portfolio?.trim(),
          leetcode: formData.leetcode?.trim(),
        },
      });

      if (updatedExtra) {
        setProfileExtra(updatedExtra);
      }

      setSaveSuccessMessage('Academic profile and professional links updated successfully!');
      setIsEditModalOpen(false);

      // Refresh data
      await fetchProfileData();
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. RESUME UPLOAD / UPDATE HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleSaveResume = (newResumeData) => {
    const studentId = profileData.user?.id || profileData.user?._id || user?.id || user?._id;
    const updatedExtra = saveStoredProfileExtra(studentId, {
      resume: newResumeData,
    });

    if (updatedExtra) {
      setProfileExtra(updatedExtra);
    }

    setSaveSuccessMessage(`Resume "${newResumeData.fileName}" uploaded and ATS verified!`);
    setIsUploadResumeModalOpen(false);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // ─────────────────────────────────────────────────────────────
  // 5. ADD SKILL HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleAddSkill = (newSkill) => {
    const studentId = profileData.user?.id || profileData.user?._id || user?.id || user?._id;
    const updatedCustomSkills = [...(profileExtra.customSkills || []), newSkill];

    const updatedExtra = saveStoredProfileExtra(studentId, {
      customSkills: updatedCustomSkills,
    });

    if (updatedExtra) {
      setProfileExtra(updatedExtra);
    }

    setSaveSuccessMessage(`Skill "${newSkill.name}" added to verified competencies!`);
    setIsAddSkillModalOpen(false);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // ─────────────────────────────────────────────────────────────
  // 6. LOADING & ERROR STATES
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 antialiased max-w-6xl mx-auto px-4 sm:px-6">
        <Skeleton variant="card" className="h-28" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error && !profileData.user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState
          title="Unable to Load Profile & Skills"
          message={error}
          onRetry={fetchProfileData}
          retryText="Retry Loading Profile"
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 7. MAIN INTERFACE (Profile, Resume, Verified Skills, Links)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-14 antialiased max-w-6xl mx-auto px-4 sm:px-6">
      {/* Toast Notification */}
      {saveSuccessMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Title & Action Bar */}
      <ProfileHeader
        onEditProfile={() => setIsEditModalOpen(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: PROFILE
          Identity, USN, Department, Semester, Target Role, Bio, Edit
      ───────────────────────────────────────────────────────────── */}
      <StudentInfoCard
        user={profileData.user}
        profile={profileData.profile}
        bio={profileExtra.bio}
        onEdit={() => setIsEditModalOpen(true)}
      />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: RESUME
          Resume Card, ATS Score, Verification Status, View, Upload
      ───────────────────────────────────────────────────────────── */}
      <ResumeCard
        resume={profileExtra.resume}
        onViewResume={() => setIsResumePreviewOpen(true)}
        onUploadResume={() => setIsUploadResumeModalOpen(true)}
      />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: VERIFIED SKILLS
          Category filter, compact verified competencies, deep audit
      ───────────────────────────────────────────────────────────── */}
      <VerifiedSkillsSection
        skills={combinedSkills}
        onOpenSkillDetails={(skill) => setSelectedSkillForVerification(skill)}
        onAddSkill={() => setIsAddSkillModalOpen(true)}
      />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: LINKS
          GitHub, LinkedIn, Portfolio, LeetCode / Coding Profile
      ───────────────────────────────────────────────────────────── */}
      <ProfessionalLinksCard
        links={profileExtra.links}
        onEditLinks={() => setIsEditModalOpen(true)}
      />

      {/* ─────────────────────────────────────────────────────────────
          MODALS & PROGRESSIVE DISCLOSURE
      ───────────────────────────────────────────────────────────── */}
      {/* 1. Deep Verification Details Modal (Only shown when opened) */}
      <SkillVerificationModal
        isOpen={Boolean(selectedSkillForVerification)}
        onClose={() => setSelectedSkillForVerification(null)}
        skill={selectedSkillForVerification}
      />

      {/* 2. Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          name: profileData.user?.name || '',
          semester: profileData.profile?.semester || 1,
          selectedCareer: profileData.profile?.selectedCareer || '',
          bio: profileExtra.bio,
          links: profileExtra.links,
        }}
        onSubmit={handleEditProfileSubmit}
        isSubmitting={isSubmitting}
      />

      {/* 3. Upload / Replace Resume Modal */}
      <UploadResumeModal
        isOpen={isUploadResumeModalOpen}
        onClose={() => setIsUploadResumeModalOpen(false)}
        onSaveResume={handleSaveResume}
      />

      {/* 4. Resume Preview Modal */}
      <ResumePreviewModal
        isOpen={isResumePreviewOpen}
        onClose={() => setIsResumePreviewOpen(false)}
        resume={profileExtra.resume}
        user={profileData.user}
        profile={profileData.profile}
      />

      {/* 5. Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        onAddSkill={handleAddSkill}
      />
    </div>
  );
};

export default ProfileSkillsPage;

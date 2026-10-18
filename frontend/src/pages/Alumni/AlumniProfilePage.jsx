import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Linkedin,
  Github,
  CheckCircle2,
  Edit3,
  ExternalLink,
  BookOpen,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Compass,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import alumniService from '../../services/alumniService';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import AlumniEditModal from '../../components/alumni/AlumniEditModal';

export const AlumniProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    postsCount: 0,
    requestsCount: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profRes, postsRes, requestsRes] = await Promise.allSettled([
        alumniService.getProfile(),
        alumniService.getPosts(),
        alumniService.getGuidanceRequests(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfileData(profRes.value);
      } else {
        throw new Error(
          profRes.reason?.response?.data?.message ||
            profRes.reason?.message ||
            'Failed to load alumni profile.'
        );
      }

      let postsCount = 0;
      if (postsRes.status === 'fulfilled') {
        const postsList = Array.isArray(postsRes.value)
          ? postsRes.value
          : postsRes.value?.posts || [];
        postsCount = postsList.length;
      }

      let requestsCount = 0;
      if (requestsRes.status === 'fulfilled') {
        const reqs = Array.isArray(requestsRes.value)
          ? requestsRes.value
          : requestsRes.value?.requests || requestsRes.value?.items || [];
        requestsCount = reqs.length;
      }

      setStats({
        postsCount,
        requestsCount,
      });
    } catch (err) {
      console.error('Error fetching alumni profile:', err);
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
        currentCompany: updatedFormData.currentCompany.trim(),
        jobRole: updatedFormData.jobRole.trim(),
        graduationYear: Number(updatedFormData.graduationYear) || new Date().getFullYear(),
        department: updatedFormData.department.trim(),
        location: updatedFormData.location.trim(),
        phone: updatedFormData.phone.trim(),
        linkedinUrl: updatedFormData.linkedinUrl.trim(),
        githubUrl: updatedFormData.githubUrl.trim(),
        isAvailableForMentorship: Boolean(updatedFormData.isAvailableForMentorship),
        skills: updatedFormData.skills,
        mentorshipTopics: updatedFormData.mentorshipTopics,
        bio: updatedFormData.bio.trim(),
      };

      const res = await alumniService.updateProfile(payload);

      if (updateUser && payload.name) {
        updateUser({ name: payload.name });
      }

      setProfileData((prev) => ({
        ...prev,
        user: {
          ...prev?.user,
          name: payload.name,
        },
        profile: {
          ...prev?.profile,
          ...payload,
        },
      }));

      setIsEditModalOpen(false);
      setToastMessage('Alumni profile updated successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update alumni profile:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const alumniUser = profileData?.user || user || {};
  const alumniProfile = profileData?.profile || {};

  const displayName = alumniUser.name || 'Alumni Member';
  const displayEmail = alumniUser.email || '';
  const currentCompany = alumniProfile.currentCompany || 'Technology Enterprise';
  const jobRole = alumniProfile.jobRole || 'Senior Software Engineer';
  const graduationYear = alumniProfile.graduationYear || 2022;
  const department = alumniProfile.department || 'Computer Science & Engineering';
  const location = alumniProfile.location || 'Bengaluru, India';
  const phone = alumniProfile.phone || '+91 (0) 987-654-3210';
  const linkedinUrl = alumniProfile.linkedinUrl || '';
  const githubUrl = alumniProfile.githubUrl || '';
  const isAvailableForMentorship = alumniProfile.isAvailableForMentorship !== false;
  const bio = alumniProfile.bio || 'Campus alumnus working in high-scale distributed systems and cloud services. Enthusiastic about mentoring undergraduates in DSA, system design interview preparation, and navigating campus placements.';
  const skills = Array.isArray(alumniProfile.skills) && alumniProfile.skills.length > 0
    ? alumniProfile.skills
    : ['System Design', 'React & Node.js', 'Distributed Systems', 'Cloud (AWS/GCP)', 'Microservices Architecture'];
  const mentorshipTopics = Array.isArray(alumniProfile.mentorshipTopics) && alumniProfile.mentorshipTopics.length > 0
    ? alumniProfile.mentorshipTopics
    : ['Mock Interviews & Rubrics', 'Resume & Portfolio Feedback', 'Transition to Tech Roles', 'Salary Negotiation & Offer Selection'];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl md:col-span-1" />
          <Skeleton className="h-64 rounded-2xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <ErrorState
          title="Could not load profile"
          message={error}
          onRetry={loadProfile}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero / Identity Header Card */}
      <Card className="overflow-hidden border-slate-200/90 shadow-sm">
        <div className="h-28 bg-linear-to-r from-emerald-600 via-teal-700 to-slate-900 relative">
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Badge variant="success" size="sm" icon={<GraduationCap className="w-3.5 h-3.5" />}>
              Class of {graduationYear}
            </Badge>
            <Badge variant="primary" size="sm">
              Alumni Mentor
            </Badge>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar
                  name={displayName}
                  size="xl"
                  variant="primary"
                  className="ring-4 ring-white shadow-md text-xl font-bold bg-emerald-600"
                />
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {displayName}
                  </h1>
                </div>
                <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  {jobRole}
                  <span className="text-slate-400">@</span>
                  <strong className="text-slate-800 font-semibold">{currentCompany}</strong>
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit3 className="w-4 h-4 text-slate-600" />}
              className="shrink-0"
            >
              Edit Profile
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {displayEmail}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              {department}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {location}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {phone}
            </span>
            <span className="flex items-center gap-1.5 ml-auto">
              {isAvailableForMentorship ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Available for Mentorship
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                  Mentorship Inactive
                </span>
              )}
            </span>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Shared Experiences</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.postsCount}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Mentorship Requests</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.requestsCount}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Graduation Batch</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              Class of {graduationYear}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Professional & Links */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Career & Affiliation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Company</p>
                <p className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {currentCompany}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Designation / Role</p>
                <p className="text-slate-800 font-semibold mt-0.5">{jobRole}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Graduation Batch</p>
                <p className="text-slate-800 font-semibold mt-0.5">Class of {graduationYear}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Campus Department</p>
                <p className="text-slate-800 font-semibold mt-0.5">{department}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Location</p>
                <p className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {location}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Links */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                Professional Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              {linkedinUrl ? (
                <a
                  href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 text-blue-700 transition-colors group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    LinkedIn Profile
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                </a>
              ) : (
                <p className="text-slate-400 italic">No LinkedIn profile provided</p>
              )}

              {githubUrl ? (
                <a
                  href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-400 hover:bg-slate-50 text-slate-800 transition-colors group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Github className="w-4 h-4 text-slate-700" />
                    GitHub Profile
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                </a>
              ) : (
                <p className="text-slate-400 italic">No GitHub profile provided</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bio, Skills, Mentorship Topics */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bio & Journey */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                About & Industry Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            </CardContent>
          </Card>

          {/* Technical Skills & Expertise */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Technical Skills & Tech Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-medium"
                  >
                    <Check className="w-3 h-3 text-blue-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mentorship Topics */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                Mentorship Topics & Specialties
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {mentorshipTopics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-medium"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    {topic}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AlumniEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={profileData}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </div>
  );
};

export default AlumniProfilePage;

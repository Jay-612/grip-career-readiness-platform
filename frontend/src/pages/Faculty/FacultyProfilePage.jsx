import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Building,
  MapPin,
  Phone,
  Award,
  BookOpen,
  Clock,
  ShieldCheck,
  Edit3,
  Calendar,
  MessageSquare,
  Video,
  CheckCircle2,
  Sparkles,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import FacultyEditModal from '../../components/faculty/FacultyEditModal';

export const FacultyProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    interviewsCount: 0,
    guidanceCount: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profRes, aptsRes, guidanceRes] = await Promise.allSettled([
        facultyService.getProfile(),
        facultyService.getAppointments(),
        facultyService.getGuidanceRequests(1, 100),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfileData(profRes.value);
      } else {
        throw new Error(
          profRes.reason?.response?.data?.message ||
            profRes.reason?.message ||
            'Failed to load faculty profile.'
        );
      }

      let interviewsCount = 0;
      if (aptsRes.status === 'fulfilled') {
        const apts = Array.isArray(aptsRes.value)
          ? aptsRes.value
          : aptsRes.value?.appointments || [];
        interviewsCount = apts.length;
      }

      let guidanceCount = 0;
      if (guidanceRes.status === 'fulfilled') {
        const requests = Array.isArray(guidanceRes.value)
          ? guidanceRes.value
          : guidanceRes.value?.requests || guidanceRes.value?.items || [];
        guidanceCount = requests.length;
      }

      setStats({
        interviewsCount,
        guidanceCount,
      });
    } catch (err) {
      console.error('Error fetching faculty profile:', err);
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
        designation: updatedFormData.designation.trim(),
        department: updatedFormData.department.trim(),
        employeeId: updatedFormData.employeeId.trim(),
        cabinNumber: updatedFormData.cabinNumber.trim(),
        officeHours: updatedFormData.officeHours.trim(),
        phone: updatedFormData.phone.trim(),
        education: updatedFormData.education.trim(),
        specialization: updatedFormData.specialization,
        researchInterests: updatedFormData.researchInterests,
        bio: updatedFormData.bio.trim(),
      };

      const res = await facultyService.updateProfile(payload);

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
      setToastMessage('Faculty profile updated successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update faculty profile:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const facultyUser = profileData?.user || user || {};
  const facultyProfile = profileData?.profile || {};

  const displayName = facultyUser.name || 'Faculty Member';
  const displayEmail = facultyUser.email || '';
  const isHOD = Boolean(facultyProfile.isHOD);
  const designation = facultyProfile.designation || (isHOD ? 'Professor & HOD' : 'Assistant Professor');
  const department = facultyProfile.department || 'Computer Science & Engineering';
  const employeeId = facultyProfile.employeeId || 'FAC-1001';
  const cabinNumber = facultyProfile.cabinNumber || 'Academic Block A, Cabin 204';
  const officeHours = facultyProfile.officeHours || 'Mon, Wed, Fri 2:00 PM – 4:00 PM';
  const phone = facultyProfile.phone || '+91 (0) 987-654-3210';
  const education = facultyProfile.education || 'Ph.D. in Computer Science & Engineering';
  const bio = facultyProfile.bio || 'Dedicated educator and researcher focused on equipping students with practical software engineering, cloud computing, and algorithmic readiness for competitive industry placements.';
  const specialization = Array.isArray(facultyProfile.specialization) && facultyProfile.specialization.length > 0
    ? facultyProfile.specialization
    : ['Cloud Architecture', 'Distributed Systems', 'Data Structures & Algorithms', 'Machine Learning'];
  const researchInterests = Array.isArray(facultyProfile.researchInterests) && facultyProfile.researchInterests.length > 0
    ? facultyProfile.researchInterests
    : ['Scalable Systems', 'Edge Computing', 'Automated Grading & Learning Analytics'];

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
        <div className="h-28 bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 relative">
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {isHOD && (
              <Badge variant="warning" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5 text-amber-600" />}>
                Head of Department
              </Badge>
            )}
            <Badge variant="primary" size="sm">
              Faculty
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
                  className="ring-4 ring-white shadow-md text-xl font-bold"
                />
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {displayName}
                  </h1>
                </div>
                <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  {designation}
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{department}</span>
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
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              ID: <strong className="text-slate-700 font-medium">{employeeId}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {cabinNumber}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {phone}
            </span>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Interviews Conducted</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.interviewsCount}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Guidance Inquiries</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.guidanceCount}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Department Role</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {isHOD ? 'Department Head (HOD)' : 'Faculty Mentor'}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic & Contact Information */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Department</p>
                <p className="text-slate-800 font-semibold mt-0.5">{department}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Designation</p>
                <p className="text-slate-800 font-semibold mt-0.5">{designation}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Employee ID</p>
                <p className="text-slate-800 font-semibold mt-0.5">{employeeId}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Qualification</p>
                <p className="text-slate-800 font-semibold mt-0.5">{education}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Office & Consultation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Cabin Location</p>
                <p className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {cabinNumber}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Office Hours</p>
                <p className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {officeHours}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Direct Phone</p>
                <p className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {phone}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Specializations, Research, Bio */}
        <div className="space-y-6 lg:col-span-2">
          {/* Biography */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Faculty Statement & Bio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            </CardContent>
          </Card>

          {/* Subject Specializations */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Teaching & Subject Specializations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {specialization.map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-medium"
                  >
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    {spec}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Research Interests */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Research Interests & Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {researchInterests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-medium"
                  >
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    {interest}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <FacultyEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={profileData}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </div>
  );
};

export default FacultyProfilePage;

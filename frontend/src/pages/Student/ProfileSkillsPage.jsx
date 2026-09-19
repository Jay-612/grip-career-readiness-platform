import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Award,
  BookOpen,
  Code,
  Globe,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Edit3,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Check,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  Cloud,
  Monitor,
  Database,
  Cpu,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import ErrorState from '../../components/common/ErrorState';

const ProfileSkillsPage = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);

  // Live profile data from backend
  const [profileData, setProfileData] = useState({
    user: null,
    profile: null,
    readiness: null,
  });

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Interactive Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCertModalOpen, setIsAddCertModalOpen] = useState(false);
  const [proofModalSkill, setProofModalSkill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [editFormData, setEditFormData] = useState({
    name: '',
    selectedCareer: '',
    semester: 5,
    github: 'github.com/rohan-m',
    linkedin: 'linkedin.com/in/rohan-mehta',
    website: 'rohanmehta.dev',
    rollNo: 'CS-2023-0482',
    degree: 'B.Tech Computer Science & Engineering',
    batch: 'Batch of 2026',
  });

  const [newSkillForm, setNewSkillForm] = useState({
    title: '',
    category: 'Languages & Runtimes',
    proficiency: 'Intermediate (1+ yrs / Production project)',
  });

  const [newCertForm, setNewCertForm] = useState({
    title: '',
    issuer: '',
    credentialId: '',
    issueDate: '',
    badgeType: 'Verified',
  });

  // Initial Skills Catalog (with ability to append newly registered skills)
  const [skillsList, setSkillsList] = useState([
    {
      id: 'skill-1',
      title: 'React.js & TypeScript',
      subtitle: 'Frontend Architecture • 12 Projects',
      category: 'Frameworks & Libraries',
      status: 'Verified',
      rubricScore: 4.8,
      rubricMax: 5.0,
      percent: 94,
      tier: 'Advanced Tier',
      verifiedBy: 'Prof. Neha Sharma',
      proofDetails: {
        evaluator: 'Prof. Neha Sharma (Assoc. Prof & Placement Lead)',
        date: '14 Aug 2025',
        criteria: 'Production micro-frontend architecture with state hydration and TypeScript strict typing.',
        score: '4.8 / 5.0',
      },
    },
    {
      id: 'skill-2',
      title: 'Node.js / Express',
      subtitle: 'Backend REST APIs • Microservices',
      category: 'Languages & Runtimes',
      status: 'Verified',
      rubricScore: 4.6,
      rubricMax: 5.0,
      percent: 88,
      tier: 'Proficient Tier',
      verifiedBy: 'Alumni Amit Verma',
      proofDetails: {
        evaluator: 'Amit Verma (Staff SWE @ TechCorp, CSE \'19)',
        date: '02 Sep 2025',
        criteria: 'Distributed REST APIs with JWT authentication, Redis rate-limiting, and gRPC contracts.',
        score: '4.6 / 5.0',
      },
    },
    {
      id: 'skill-3',
      title: 'System Design & Microservices',
      subtitle: 'Scalability • Load Balancers • Kafka',
      category: 'Core CS & System Design',
      status: 'In Review',
      rubricScore: 3.5,
      rubricMax: 5.0,
      percent: 70,
      tier: 'Intermediate Tier',
      reviewNote: 'Faculty Review: gRPC Milestone',
      underReview: true,
      proofDetails: {
        evaluator: 'Dept. Curriculum & Evaluation Committee',
        date: 'In Review (Submitted Friday)',
        criteria: 'Capstone gRPC event-driven pub-sub with multi-region failover and consensus quorum.',
        score: 'Pending Panel Grade',
      },
    },
    {
      id: 'skill-4',
      title: 'Python & DSA',
      subtitle: '500+ LeetCode Solved • Top 18%',
      category: 'Languages & Runtimes',
      status: '82% Benchmark',
      rubricScore: 4.9,
      rubricMax: 5.0,
      percent: 96,
      tier: 'Advanced Competitive',
      verifiedBy: 'Automated Code Platform Sync',
      isBenchmark: true,
      proofDetails: {
        evaluator: 'Campus Automated Assessment Engine (LeetCode / CodeChef Sync)',
        date: 'Automated Sync • 18 Sep 2025',
        criteria: 'Dynamic programming, graphs, segment trees, and knapsack problem sets benchmarked in 95th percentile.',
        score: '4.9 / 5.0',
      },
    },
    {
      id: 'skill-5',
      title: 'Docker & Kubernetes',
      subtitle: 'CI/CD Pipelines • Containerization',
      category: 'DevOps & Cloud',
      status: 'Self-Assessed',
      rubricScore: 3.1,
      rubricMax: 5.0,
      percent: 62,
      tier: 'Intermediate Tier',
      pendingNote: 'Cloud Lab Sem 5',
      actionPrompt: 'Request Endorsement',
      proofDetails: {
        evaluator: 'Self-assessed lab submission',
        date: 'Draft Lab Module',
        criteria: 'Kubernetes ingress, deployment replicas, and containerized multi-stage Dockerfiles.',
        score: 'Pending Faculty Lab Signoff',
      },
    },
    {
      id: 'skill-6',
      title: 'PostgreSQL & MongoDB',
      subtitle: 'Query Optimization • Indexing',
      category: 'Core CS & System Design',
      status: 'Verified',
      rubricScore: 4.7,
      rubricMax: 5.0,
      percent: 90,
      tier: 'Proficient Tier',
      verifiedBy: 'Verified in Sem 4 DB Lab',
      proofDetails: {
        evaluator: 'Prof. S. Ranganathan (Database Systems Lab Lead)',
        date: '28 May 2025',
        criteria: 'B-Tree indexing optimization, ACID transaction guarantees, and aggregation pipelines.',
        score: '4.7 / 5.0',
      },
    },
  ]);

  // Certifications list (with dynamic addition support)
  const [certificationsList, setCertificationsList] = useState([
    {
      id: 'cert-1',
      title: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      credentialId: 'AWS-8921-X',
      issueDate: 'Issued Jun 2025 • Expires Jun 2028',
      badge: 'Institutional Credential',
      badgeVariant: 'emerald',
      icon: Cloud,
    },
    {
      id: 'cert-2',
      title: 'Meta Certified Frontend Developer',
      issuer: 'Meta / Coursera',
      credentialId: 'META-0428',
      issueDate: 'Issued Jan 2025 • Lifetime Validity',
      badge: 'Verified',
      badgeVariant: 'emerald',
      icon: Monitor,
    },
    {
      id: 'cert-3',
      title: "University Dean's Honor List",
      issuer: 'Vice Chancellor & Dean of Engineering',
      credentialId: 'Semesters 2, 3, & 4 Continuous Academic Excellence Citation',
      issueDate: 'Awarded Jul 2025',
      badge: 'Honor Roll',
      badgeVariant: 'blue',
      icon: Award,
    },
  ]);

  // Fetch initial profile & readiness
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profileRes = await studentService.getProfile();
      const studentId = profileRes?.user?.id || user?.id;

      let readinessRes = null;
      if (studentId) {
        try {
          readinessRes = await studentService.getPlacementReadiness(studentId);
        } catch (rErr) {
          console.warn('Readiness score could not be loaded:', rErr);
        }
      }

      setProfileData({
        user: profileRes?.user || null,
        profile: profileRes?.profile || null,
        readiness: readinessRes,
      });

      // Populate edit form defaults from live data if present
      if (profileRes?.user?.name) {
        setEditFormData((prev) => ({
          ...prev,
          name: profileRes.user.name,
          selectedCareer:
            profileRes.profile?.selectedCareer ||
            'Distributed Systems & Cloud Backend Engineer',
          semester: profileRes.profile?.semester || 5,
        }));
      }
    } catch (err) {
      console.error('Error loading student profile:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load student profile. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // Derived user details
  const displayName = profileData.user?.name || editFormData.name || 'Rohan Mehta';
  const displayEmail = profileData.user?.email || user?.email || 'rohan.mehta@univ-engineering.edu';
  const displayCareer =
    profileData.profile?.selectedCareer ||
    editFormData.selectedCareer ||
    'Distributed Systems & Cloud Backend Engineer';
  const displaySemester = profileData.profile?.semester || editFormData.semester || 5;

  const getInitials = (name) => {
    if (!name) return 'RM';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Profile completeness formula based on concrete field presence
  const calculateCompleteness = () => {
    let score = 0;
    if (displayName) score += 15;
    if (displayEmail) score += 15;
    if (editFormData.degree) score += 15;
    if (displaySemester) score += 15;
    if (displayCareer) score += 15;
    if (editFormData.github || editFormData.linkedin) score += 10;
    if (skillsList.length >= 3) score += 15;
    return Math.min(score, 100);
  };

  const completenessPercentage = calculateCompleteness();

  // Filter skills by category
  const filteredSkills = skillsList.filter((item) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Languages')
      return item.category === 'Languages & Runtimes';
    if (selectedCategory === 'Frameworks & Libraries')
      return item.category === 'Frameworks & Libraries';
    if (selectedCategory === 'DevOps & Cloud')
      return item.category === 'DevOps & Cloud';
    if (selectedCategory === 'Core CS & System Design')
      return item.category === 'Core CS & System Design';
    return true;
  });

  // Handle Edit Profile Save
  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccessMessage(null);

    try {
      const payload = {
        name: editFormData.name,
        selectedCareer: editFormData.selectedCareer,
        semester: Number(editFormData.semester),
      };

      const res = await studentService.updateProfile(payload);
      if (res.success) {
        setProfileData((prev) => ({
          ...prev,
          user: { ...prev.user, name: editFormData.name },
          profile: {
            ...prev.profile,
            selectedCareer: editFormData.selectedCareer,
            semester: Number(editFormData.semester),
          },
        }));
        setIsEditModalOpen(false);
        setSaveSuccessMessage('Profile details successfully updated and synchronized!');
        setTimeout(() => setSaveSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Direct Skill Registration
  const handleRegisterSkillSubmit = async (e) => {
    e.preventDefault();
    if (!newSkillForm.title.trim()) return;

    setIsSubmitting(true);
    try {
      const newSkill = {
        id: `skill-${Date.now()}`,
        title: newSkillForm.title.trim(),
        subtitle: `${newSkillForm.category} • Self-Registered`,
        category: newSkillForm.category,
        status: 'In Review',
        rubricScore: 3.8,
        rubricMax: 5.0,
        percent: 76,
        tier: newSkillForm.proficiency.split(' ')[0] + ' Tier',
        reviewNote: 'Submitted for Institutional Verification',
        underReview: true,
        proofDetails: {
          evaluator: 'Dept. Verification Queue (Faculty Lead: Prof. Neha Sharma)',
          date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          criteria: `Declared proficiency: ${newSkillForm.proficiency}. Assessment test link queued.`,
          score: 'Verification in progress',
        },
      };

      // Add to local state
      setSkillsList((prev) => [newSkill, ...prev]);

      // Reset form
      setNewSkillForm({
        title: '',
        category: 'Languages & Runtimes',
        proficiency: 'Intermediate (1+ yrs / Production project)',
      });

      setSaveSuccessMessage(`Skill "${newSkill.title}" registered! Submitted for institutional assessment.`);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to register skill:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Certification Submit
  const handleAddCertSubmit = (e) => {
    e.preventDefault();
    if (!newCertForm.title.trim() || !newCertForm.issuer.trim()) return;

    const newCert = {
      id: `cert-${Date.now()}`,
      title: newCertForm.title.trim(),
      issuer: newCertForm.issuer.trim(),
      credentialId: newCertForm.credentialId.trim() || `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: newCertForm.issueDate || `Issued ${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}`,
      badge: newCertForm.badgeType || 'Verified',
      badgeVariant: 'emerald',
      icon: Award,
    };

    setCertificationsList((prev) => [newCert, ...prev]);
    setIsAddCertModalOpen(false);
    setNewCertForm({
      title: '',
      issuer: '',
      credentialId: '',
      issueDate: '',
      badgeType: 'Verified',
    });
    setSaveSuccessMessage(`Certification "${newCert.title}" added to verified portfolio.`);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-56 rounded-2xl bg-slate-200/80" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-72 rounded-2xl bg-slate-200/80" />
          <div className="lg:col-span-7 h-72 rounded-2xl bg-slate-200/80" />
        </div>
        <div className="h-96 rounded-2xl bg-slate-200/80" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Profile & Skills Console Unavailable"
        message={error}
        onRetry={fetchProfile}
        retryText="Reload Profile"
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Alert */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── 1. PROFILE HEADER & VERIFICATION COMPLETION BANNER ─────── */}
      <section
        className="bg-white rounded-2xl border border-grip-border p-6 shadow-sm relative overflow-hidden"
        data-purpose="profile-hero"
      >
        {/* Subtle accent top border strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-grip-blue to-emerald-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
          {/* Left: Student Identity Block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Avatar with Verified Seal */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-grip-blue text-white font-extrabold text-2xl flex items-center justify-center shadow-md select-none">
                {getInitials(displayName)}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-white p-1 rounded-full shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
              </div>
            </div>

            {/* Academic & Contact Details */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-grip-dark tracking-tight">
                  {displayName}
                </h1>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Tier-1 Placement Candidate
                </span>
              </div>

              <p className="text-sm text-grip-slate font-medium">
                {editFormData.degree} • {editFormData.batch} • Semester {displaySemester}
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-grip-muted pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="text-slate-400 font-medium">Roll No:</span>
                  <strong className="text-grip-dark font-semibold font-mono">
                    {editFormData.rollNo}
                  </strong>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{displayEmail}</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-grip-blue">
                  <Award className="w-3.5 h-3.5" />
                  <span>CGPA 8.8 / 10.0 (Top 4% Dept. Rank)</span>
                </span>
              </div>

              {/* External Profile Links */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <a
                  href={`https://${editFormData.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-grip-dark text-xs font-medium border border-grip-border transition-colors"
                >
                  <Code className="w-3.5 h-3.5 text-slate-500" />
                  <span>{editFormData.github}</span>
                </a>
                <a
                  href={`https://${editFormData.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-grip-dark text-xs font-medium border border-grip-border transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>{editFormData.linkedin}</span>
                </a>
                <a
                  href={`https://${editFormData.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-grip-dark text-xs font-medium border border-grip-border transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{editFormData.website}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Profile Completeness Meter & CTAs */}
          <div className="flex flex-col gap-3 min-w-[280px] lg:w-80">
            <div className="bg-slate-50 p-4 rounded-xl border border-grip-border">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-grip-dark">
                  Profile Completeness
                </span>
                <span className="text-xs font-extrabold text-grip-blue font-mono">
                  {completenessPercentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-grip-blue h-full transition-all duration-500"
                  style={{ width: `${Math.min(completenessPercentage, 84)}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{
                    width: `${
                      completenessPercentage > 84
                        ? completenessPercentage - 84
                        : 8
                    }%`,
                  }}
                />
              </div>

              <div className="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-grip-slate flex items-center justify-between gap-2">
                <span className="leading-tight">
                  <strong className="text-grip-blue font-semibold">
                    + Add Capstone Video (+8%)
                  </strong>{' '}
                  for 100% Institutional Certification
                </span>
                <button
                  type="button"
                  onClick={() =>
                    alert('Capstone Video Upload: Syncing with Department Storage Repository.')
                  }
                  className="px-2 py-1 bg-grip-blue text-white rounded text-[11px] font-semibold hover:bg-grip-blue-hover shrink-0 transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-lg border border-grip-border bg-white hover:bg-slate-50 text-grip-dark text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaveSuccessMessage('ATS Resume parsed and verified with University Placement Cell.');
                  setTimeout(() => setSaveSuccessMessage(null), 4000);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-50 border border-blue-200 text-grip-blue hover:bg-blue-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Sync ATS Resume</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. ACADEMIC RECORDS & VERIFIED COURSEWORK ─────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Academic Trajectory (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-grip-border p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-grip-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-grip-blue" />
                <h2 className="text-sm font-bold text-grip-dark">
                  Academic Trajectory
                </h2>
              </div>
              <span className="text-[11px] bg-blue-50 px-2.5 py-0.5 rounded-full text-grip-blue font-semibold border border-blue-100">
                Semester 5 Current
              </span>
            </div>

            <p className="text-xs text-grip-muted mb-4">
              University School of Engineering &amp; Technology • Affiliated to State Tech Board
            </p>

            {/* SGPA Trend Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-grip-muted block uppercase font-medium">
                  Sem 1
                </span>
                <span className="text-base font-bold text-grip-dark block mt-0.5 font-mono">
                  8.6
                </span>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-grip-blue h-1 rounded-full" style={{ width: '86%' }} />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-grip-muted block uppercase font-medium">
                  Sem 2
                </span>
                <span className="text-base font-bold text-grip-dark block mt-0.5 font-mono">
                  8.7
                </span>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-grip-blue h-1 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-grip-muted block uppercase font-medium">
                  Sem 3
                </span>
                <span className="text-base font-bold text-emerald-700 block mt-0.5 font-mono">
                  8.9
                </span>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '89%' }} />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-grip-muted block uppercase font-medium">
                  Sem 4
                </span>
                <span className="text-base font-bold text-grip-dark block mt-0.5 font-mono">
                  8.8
                </span>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-grip-blue h-1 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-grip-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-semibold text-grip-dark">Cumulative CGPA</span>
            </div>
            <span className="text-2xl font-black text-grip-blue font-mono">8.80</span>
          </div>
        </div>

        {/* Verified Core Coursework (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-grip-border p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-grip-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-grip-dark">
                  Verified Core Coursework
                </h2>
              </div>
              <span className="text-xs text-grip-muted">Validated via Academic Registrar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Course 1 */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-grip-dark truncate">
                    Data Structures &amp; Algorithms
                  </span>
                  <span className="text-[11px] text-grip-muted">
                    Course Code: CS-301 • Sem 3
                  </span>
                </div>
                <span className="bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2 py-0.5 rounded border border-emerald-200 shrink-0 font-mono">
                  Grade O
                </span>
              </div>

              {/* Course 2 */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-grip-dark truncate">
                    Operating Systems Architecture
                  </span>
                  <span className="text-[11px] text-grip-muted">
                    Course Code: CS-402 • Sem 4
                  </span>
                </div>
                <span className="bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2 py-0.5 rounded border border-emerald-200 shrink-0 font-mono">
                  Grade A+
                </span>
              </div>

              {/* Course 3 */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-grip-dark truncate">
                    Database Management Systems
                  </span>
                  <span className="text-[11px] text-grip-muted">
                    Course Code: CS-404 • Sem 4
                  </span>
                </div>
                <span className="bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2 py-0.5 rounded border border-emerald-200 shrink-0 font-mono">
                  Grade A+
                </span>
              </div>

              {/* Course 4 */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-grip-dark truncate">
                    Computer Networks &amp; Protocols
                  </span>
                  <span className="text-[11px] text-grip-muted">
                    Course Code: CS-406 • Sem 4
                  </span>
                </div>
                <span className="bg-blue-50 text-grip-blue font-extrabold text-xs px-2 py-0.5 rounded border border-blue-200 shrink-0 font-mono">
                  Grade A
                </span>
              </div>

              {/* Course 5 (Enrolled) */}
              <div className="sm:col-span-2 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-grip-dark">
                      Distributed Systems &amp; Cloud Computing
                    </span>
                    <span className="text-[11px] text-grip-muted">
                      Course Code: CS-501 • Faculty Lead: Dr. K. Ramanathan
                    </span>
                  </div>
                </div>
                <span className="bg-amber-50 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0">
                  Enrolled (Sem 5)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. TECHNICAL SKILLS INVENTORY & COMPETENCY MATRIX ──────── */}
      <section
        className="bg-white rounded-2xl border border-grip-border p-6 shadow-sm flex flex-col gap-5"
        data-purpose="skills-matrix"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-grip-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-grip-dark">
                Technical Skills &amp; Competency Matrix
              </h2>
              <span className="bg-blue-50 text-grip-blue text-xs px-2 py-0.5 rounded-full font-bold">
                {skillsList.length} Assessed
              </span>
            </div>
            <p className="text-xs text-grip-muted mt-0.5">
              Faculty-verified competencies benchmarked against Tier-1 campus hiring rubrics.
            </p>
          </div>

          <a
            href="#skill-registration-section"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-grip-blue hover:bg-grip-blue-hover text-white text-xs font-semibold transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Skill</span>
          </a>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'All', label: `All Skills (${skillsList.length})` },
            { id: 'Languages', label: 'Languages' },
            { id: 'Frameworks & Libraries', label: 'Frameworks & Libraries' },
            { id: 'DevOps & Cloud', label: 'DevOps & Cloud' },
            { id: 'Core CS & System Design', label: 'Core CS & System Design' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${
                  selectedCategory === tab.id
                    ? 'bg-grip-blue text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-grip-slate border border-grip-border'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Skills Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const isVerified = skill.status === 'Verified' || skill.isBenchmark;
            const isInReview = skill.status === 'In Review';
            const isSelfAssessed = skill.status === 'Self-Assessed';

            return (
              <div
                key={skill.id}
                className="p-4 rounded-xl border border-grip-border bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-grip-dark group-hover:text-grip-blue transition-colors truncate">
                        {skill.title}
                      </h3>
                      <span className="text-[11px] text-grip-muted block truncate mt-0.5">
                        {skill.subtitle}
                      </span>
                    </div>

                    {isVerified && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{skill.status}</span>
                      </span>
                    )}

                    {isInReview && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>In Review</span>
                      </span>
                    )}

                    {isSelfAssessed && (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0">
                        Self-Assessed
                      </span>
                    )}
                  </div>

                  {/* Rubric Level & Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-grip-dark font-bold">{skill.tier}</span>
                      <span className="text-grip-blue font-bold font-mono">
                        Rubric: {skill.rubricScore} / {skill.rubricMax}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          isInReview
                            ? 'bg-amber-500'
                            : isSelfAssessed
                            ? 'bg-slate-400'
                            : 'bg-grip-blue'
                        }`}
                        style={{ width: `${skill.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-grip-border flex items-center justify-between text-[11px] text-grip-muted">
                  <span className="truncate pr-2">
                    {skill.verifiedBy ? (
                      <>
                        By: <strong className="text-grip-dark">{skill.verifiedBy}</strong>
                      </>
                    ) : (
                      skill.reviewNote || skill.pendingNote
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setProofModalSkill(skill)}
                    className="text-grip-blue font-semibold hover:underline shrink-0"
                  >
                    View Proof
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Add Skill Inline Drawer / Form */}
        <div
          id="skill-registration-section"
          className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-grip-border mt-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-grip-blue" />
              <span className="text-xs font-bold text-grip-dark uppercase tracking-wider">
                Direct Skill Registration &amp; Assessment Request
              </span>
            </div>
            <span className="text-[11px] text-grip-muted">
              Instant ATS &amp; Recruiter Profile Sync
            </span>
          </div>

          <form onSubmit={handleRegisterSkillSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] text-grip-muted mb-1 uppercase font-bold tracking-wider">
                Skill Title
              </label>
              <input
                type="text"
                required
                value={newSkillForm.title}
                onChange={(e) =>
                  setNewSkillForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Apache Kafka, Go, GraphQL"
                className="w-full h-9 px-3 bg-white border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue focus:border-grip-blue outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] text-grip-muted mb-1 uppercase font-bold tracking-wider">
                Domain Category
              </label>
              <select
                value={newSkillForm.category}
                onChange={(e) =>
                  setNewSkillForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full h-9 px-3 bg-white border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue focus:border-grip-blue outline-none transition-all"
              >
                <option value="Languages & Runtimes">Languages &amp; Runtimes</option>
                <option value="Frameworks & Libraries">Frameworks &amp; Libraries</option>
                <option value="DevOps & Cloud">Cloud, Infra &amp; DevOps</option>
                <option value="Core CS & System Design">Database &amp; Storage</option>
                <option value="Core CS & System Design">System Architecture</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-grip-muted mb-1 uppercase font-bold tracking-wider">
                Proficiency Level
              </label>
              <select
                value={newSkillForm.proficiency}
                onChange={(e) =>
                  setNewSkillForm((prev) => ({
                    ...prev,
                    proficiency: e.target.value,
                  }))
                }
                className="w-full h-9 px-3 bg-white border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue focus:border-grip-blue outline-none transition-all"
              >
                <option value="Intermediate (1+ yrs / Production project)">
                  Intermediate (1+ yrs / Production project)
                </option>
                <option value="Beginner (Coursework only)">Beginner (Coursework only)</option>
                <option value="Proficient (Independent architecture)">
                  Proficient (Independent architecture)
                </option>
                <option value="Advanced (Industry verified)">
                  Advanced (Industry verified)
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 rounded-lg bg-grip-blue hover:bg-grip-blue-hover text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Registering...' : 'Submit for Verification'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ─── 4. SOFT SKILLS & VERIFIED CERTIFICATIONS ───────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Soft Skills & Behavioral Rubrics (6 Columns) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-grip-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-grip-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-grip-blue" />
                <h2 className="text-sm font-bold text-grip-dark">
                  Professional Competencies
                </h2>
              </div>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                Panel Evaluated
              </span>
            </div>

            <p className="text-xs text-grip-muted mb-5">
              Structured evaluations aggregated across 4 institutional mock behavioral &amp; technical interview boards.
            </p>

            {/* Competency List */}
            <div className="flex flex-col gap-4">
              {/* Item 1 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-grip-dark">
                      Technical Articulation &amp; Communication
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-700 font-bold">
                      Exceptional
                    </span>
                    <span className="text-xs font-extrabold text-grip-dark font-mono">
                      4.8 / 5.0
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '96%' }} />
                </div>
              </div>

              {/* Item 2 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-grip-dark">
                      Problem Solving &amp; Analytical Thinking
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-700 font-bold">
                      Top Tier
                    </span>
                    <span className="text-xs font-extrabold text-grip-dark font-mono">
                      4.9 / 5.0
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-grip-blue h-2 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>

              {/* Item 3 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-grip-dark">
                      Agile Teamwork &amp; Collaboration
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-grip-slate font-semibold">
                      Proficient
                    </span>
                    <span className="text-xs font-extrabold text-grip-dark font-mono">
                      4.5 / 5.0
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              {/* Item 4 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-grip-dark">
                      Hackathon &amp; Project Leadership
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-grip-slate font-semibold">
                      Strong
                    </span>
                    <span className="text-xs font-extrabold text-grip-dark font-mono">
                      4.2 / 5.0
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-grip-border flex items-center justify-between text-xs text-grip-muted">
            <span className="flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Endorsed by Institutional Faculty &amp; Alumni Council</span>
            </span>
            <button
              type="button"
              onClick={() =>
                alert('Rubric Report generated. Evaluation board signed with SHA-256 certificate.')
              }
              className="text-grip-blue font-semibold hover:underline"
            >
              Download Rubric Report
            </button>
          </div>
        </div>

        {/* Verified Certifications & Credentials (6 Columns) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-grip-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-grip-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-grip-blue" />
                <h2 className="text-sm font-bold text-grip-dark">
                  Verified Certifications
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCertModalOpen(true)}
                className="py-1 px-2.5 rounded-lg border border-grip-border hover:bg-slate-50 text-grip-dark text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </button>
            </div>

            {/* Certifications List */}
            <div className="flex flex-col gap-3">
              {certificationsList.map((cert) => {
                const IconComponent = cert.icon || Award;
                return (
                  <div
                    key={cert.id}
                    className="p-3.5 rounded-xl border border-grip-border bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-grip-blue flex items-center justify-center shrink-0 border border-blue-100">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-grip-dark">
                          {cert.title}
                        </h3>
                        <div className="text-[11px] text-grip-slate mt-0.5">
                          Credential ID:{' '}
                          <span className="font-mono font-medium text-grip-dark">
                            {cert.credentialId}
                          </span>{' '}
                          • {cert.issuer}
                        </div>
                        <div className="text-[10px] text-grip-muted mt-0.5">
                          {cert.issueDate}
                        </div>
                      </div>
                    </div>

                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{cert.badge}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-grip-border flex items-center justify-between text-xs text-grip-muted">
            <span className="text-[11px]">
              {certificationsList.length} of {certificationsList.length} records verified with digital signature
            </span>
            <button
              type="button"
              onClick={() => alert('External credentials ledger synced via Academic Bank of Credits.')}
              className="text-grip-blue font-semibold hover:underline"
            >
              Verify External Credentials →
            </button>
          </div>
        </div>
      </section>

      {/* ─── MODAL 1: EDIT PROFILE DETAILS ──────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal & Academic Details"
        description="Update your professional headline, career interest, and external portfolio links."
        size="lg"
      >
        <form onSubmit={handleEditProfileSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-grip-dark mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-grip-dark mb-1">
                Current Semester
              </label>
              <select
                value={editFormData.semester}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    semester: Number(e.target.value),
                  }))
                }
                className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-grip-dark mb-1">
              Selected Career Track
            </label>
            <input
              type="text"
              required
              value={editFormData.selectedCareer}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  selectedCareer: e.target.value,
                }))
              }
              placeholder="e.g. Distributed Systems & Cloud Backend Engineer"
              className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-grip-slate mb-1">
                GitHub Profile
              </label>
              <input
                type="text"
                value={editFormData.github}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, github: e.target.value }))
                }
                placeholder="github.com/username"
                className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-grip-slate mb-1">
                LinkedIn Profile
              </label>
              <input
                type="text"
                value={editFormData.linkedin}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, linkedin: e.target.value }))
                }
                placeholder="linkedin.com/in/username"
                className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-grip-slate mb-1">
                Personal Portfolio
              </label>
              <input
                type="text"
                value={editFormData.website}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                placeholder="username.dev"
                className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-grip-border">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-grip-border text-xs font-semibold text-grip-slate hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-grip-blue hover:bg-grip-blue-hover text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: ADD CERTIFICATION ─────────────────────────────── */}
      <Modal
        isOpen={isAddCertModalOpen}
        onClose={() => setIsAddCertModalOpen(false)}
        title="Add Verified Certification"
        description="Add your accredited cloud, software, or institutional credential to your profile."
        size="md"
      >
        <form onSubmit={handleAddCertSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-grip-dark mb-1">
              Certification Title
            </label>
            <input
              type="text"
              required
              value={newCertForm.title}
              onChange={(e) =>
                setNewCertForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. HashiCorp Certified: Terraform Associate"
              className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-grip-dark mb-1">
                Issuing Organization
              </label>
              <input
                type="text"
                required
                value={newCertForm.issuer}
                onChange={(e) =>
                  setNewCertForm((prev) => ({ ...prev, issuer: e.target.value }))
                }
                placeholder="e.g. AWS, Meta, Google Cloud"
                className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-grip-dark mb-1">
                Credential ID
              </label>
              <input
                type="text"
                value={newCertForm.credentialId}
                onChange={(e) =>
                  setNewCertForm((prev) => ({ ...prev, credentialId: e.target.value }))
                }
                placeholder="e.g. CERT-88219"
                className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-grip-dark mb-1">
              Issue Date &amp; Validity
            </label>
            <input
              type="text"
              value={newCertForm.issueDate}
              onChange={(e) =>
                setNewCertForm((prev) => ({ ...prev, issueDate: e.target.value }))
              }
              placeholder="e.g. Issued Aug 2025 • Lifetime Validity"
              className="w-full h-9 px-3 border border-grip-border rounded-lg text-xs text-grip-dark focus:ring-1 focus:ring-grip-blue outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-grip-border">
            <button
              type="button"
              onClick={() => setIsAddCertModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-grip-border text-xs font-semibold text-grip-slate hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-grip-blue hover:bg-grip-blue-hover text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Add to Portfolio
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: VIEW PROOF & VERIFICATION DETAILS ─────────────── */}
      {proofModalSkill && (
        <Modal
          isOpen={!!proofModalSkill}
          onClose={() => setProofModalSkill(null)}
          title={`Verification Proof: ${proofModalSkill.title}`}
          description="Official evaluation transcript validated by faculty and campus placement committee."
          size="md"
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-grip-muted font-medium">Evaluated By:</span>
                <span className="font-bold text-grip-dark">
                  {proofModalSkill.proofDetails?.evaluator}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-grip-muted font-medium">Evaluation Date:</span>
                <span className="font-mono text-grip-dark">
                  {proofModalSkill.proofDetails?.date}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-grip-muted font-medium">Rubric Score:</span>
                <span className="font-bold text-grip-blue font-mono">
                  {proofModalSkill.proofDetails?.score}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-grip-dark mb-1">
                Assessed Criteria &amp; Technical Notes
              </span>
              <p className="text-xs text-grip-slate leading-relaxed bg-white p-3 rounded-xl border border-grip-border">
                {proofModalSkill.proofDetails?.criteria}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Cryptographically signed by GRIP Academic Placement Board. Valid for Tier-1 recruitment drive 2026.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setProofModalSkill(null)}
                className="px-4 py-2 rounded-lg bg-grip-blue text-white text-xs font-semibold hover:bg-grip-blue-hover transition-colors"
              >
                Close Proof
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfileSkillsPage;
